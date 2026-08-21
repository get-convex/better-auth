import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { v } from "convex/values";
import { omit } from "convex-helpers";
import { paginator } from "convex-helpers/server/pagination";
import type { Doc } from "./_generated/dataModel.js";
import { mutation, query } from "./_generated/server.js";
import type { QueryCtx } from "./_generated/server.js";
import schema from "./schema.js";

type ProviderIssuers = Record<string, string>;

const invalidAccountKeyValues = new Set(["undefined", "null"]);

const assertValidAccountKeyValue = (
  field: "accountId" | "issuer",
  value: string,
  providerId: string
) => {
  if (!value.trim() || invalidAccountKeyValues.has(value)) {
    throw new Error(
      `Account ${field} for providerId ${providerId} is not a valid Better Auth account identity`
    );
  }
};

const migrationCompleteCursorPrefix = "convex-better-auth:migration-complete:";

const migrationCompleteCursorFor = (operation: string) =>
  `${migrationCompleteCursorPrefix}${operation}`;

const isMigrationCompleteCursor = (
  cursor: string | null,
  operation: string
) => {
  const expected = migrationCompleteCursorFor(operation);
  if (cursor === expected) {
    return true;
  }
  if (cursor?.startsWith(migrationCompleteCursorPrefix)) {
    throw new Error(`Migration cursor is not valid for ${operation}`);
  }
  return false;
};

const assertValidPaginationOpts = (paginationOpts: {
  cursor: string | null;
  numItems: number;
}) => {
  if (
    !Number.isInteger(paginationOpts.numItems) ||
    paginationOpts.numItems <= 0
  ) {
    throw new Error("paginationOpts.numItems must be a positive integer");
  }
};

const assertValidProviderIssuers = (providerIssuers: ProviderIssuers) => {
  for (const [providerId, issuer] of Object.entries(providerIssuers)) {
    if (providerId === "credential" || providerId === "siwe") {
      continue;
    }
    if (!issuer.trim()) {
      throw new Error(
        `Trusted issuer mapping for providerId ${providerId} must not be empty`
      );
    }
    if (invalidAccountKeyValues.has(issuer)) {
      throw new Error(
        `Trusted issuer mapping for providerId ${providerId} is not a valid Better Auth account identity`
      );
    }
    if (issuer !== issuer.trim()) {
      throw new Error(
        `Trusted issuer mapping for providerId ${providerId} contains leading or trailing whitespace`
      );
    }
    if (issuer === "local:credential" || issuer === "local:siwe") {
      throw new Error(
        `Issuer ${issuer} is reserved for a local authentication method`
      );
    }
  }
};

const targetAccountIdentity = (
  account: Doc<"account">,
  providerIssuers: ProviderIssuers
) => {
  const accountId =
    account.providerId === "credential" ? account.userId : account.accountId;
  const fixedIssuer =
    account.providerId === "credential"
      ? "local:credential"
      : account.providerId === "siwe"
        ? "local:siwe"
        : undefined;
  const mappedIssuer = Object.prototype.hasOwnProperty.call(
    providerIssuers,
    account.providerId
  )
    ? providerIssuers[account.providerId]
    : undefined;
  const existingIssuer = account.issuer ?? undefined;

  if (existingIssuer !== undefined && !existingIssuer.trim()) {
    throw new Error(
      `Existing issuer for providerId ${account.providerId} must not be empty`
    );
  }
  if (
    existingIssuer !== undefined &&
    existingIssuer !== existingIssuer.trim()
  ) {
    throw new Error(
      `Existing issuer for providerId ${account.providerId} contains leading or trailing whitespace`
    );
  }

  const issuer = fixedIssuer ?? mappedIssuer ?? existingIssuer;

  if (!issuer) {
    throw new Error(
      `Missing trusted issuer mapping for providerId ${account.providerId}`
    );
  }
  if (
    !fixedIssuer &&
    (issuer === "local:credential" || issuer === "local:siwe")
  ) {
    throw new Error(
      `Issuer ${issuer} is reserved for a local authentication method`
    );
  }
  if (existingIssuer && existingIssuer !== issuer) {
    throw new Error(
      `Existing issuer ${existingIssuer} does not match trusted issuer ${issuer} for providerId ${account.providerId}`
    );
  }

  assertValidAccountKeyValue("accountId", accountId, account.providerId);
  assertValidAccountKeyValue("issuer", issuer, account.providerId);

  return { accountId, issuer };
};

const assertNoAccountIdentityCollision = async (
  ctx: Pick<QueryCtx, "db">,
  account: Doc<"account">,
  providerIssuers: ProviderIssuers
) => {
  const target = targetAccountIdentity(account, providerIssuers);
  const candidates = await ctx.db
    .query("account")
    .withIndex("accountId", (index) => index.eq("accountId", target.accountId))
    .collect();

  if (account.providerId === "credential") {
    const credentialCandidates = await ctx.db
      .query("account")
      .withIndex("providerId_userId", (index) =>
        index.eq("providerId", "credential").eq("userId", account.userId)
      )
      .collect();
    const candidateIds = new Set(candidates.map((candidate) => candidate._id));
    candidates.push(
      ...credentialCandidates.filter(
        (candidate) => !candidateIds.has(candidate._id)
      )
    );
  }

  for (const candidate of candidates) {
    if (candidate._id === account._id) {
      continue;
    }
    const candidateTarget = targetAccountIdentity(candidate, providerIssuers);
    if (
      candidateTarget.issuer === target.issuer &&
      candidateTarget.accountId === target.accountId
    ) {
      throw new Error(
        `Account identity collision for issuer ${target.issuer} and accountId ${target.accountId}`
      );
    }
  }

  return target;
};

const migrationArgs = {
  providerIssuers: v.record(v.string(), v.string()),
  paginationOpts: paginationOptsValidator,
};

const legacyOAuthApplicationExportValidator = v.object({
  ...omit(schema.tables.oauthApplication.validator.fields, ["clientSecret"]),
  _id: v.id("oauthApplication"),
  _creationTime: v.number(),
  hadClientSecret: v.boolean(),
});

const clearedLegacyRecordsValidator = v.object({
  continueCursor: v.string(),
  isDone: v.boolean(),
  deleted: v.number(),
});

const accountValidationValidator = v.object({
  continueCursor: v.string(),
  isDone: v.boolean(),
  pending: v.number(),
  alreadyMigrated: v.number(),
});

const accountBackfillValidator = v.object({
  continueCursor: v.string(),
  isDone: v.boolean(),
  migrated: v.number(),
  alreadyMigrated: v.number(),
});

export const listLegacyOAuthApplications = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(legacyOAuthApplicationExportValidator),
  handler: async (ctx, args) => {
    const operation = "listLegacyOAuthApplications";
    const completeCursor = migrationCompleteCursorFor(operation);
    assertValidPaginationOpts(args.paginationOpts);
    if (isMigrationCompleteCursor(args.paginationOpts.cursor, operation)) {
      return {
        page: [],
        continueCursor: completeCursor,
        isDone: true,
      };
    }
    const result = await paginator(ctx.db, schema)
      .query("oauthApplication")
      .paginate(args.paginationOpts);
    return {
      ...result,
      continueCursor: result.isDone ? completeCursor : result.continueCursor,
      page: result.page.map(({ clientSecret, ...application }) => ({
        ...application,
        hadClientSecret: Boolean(clientSecret),
      })),
    };
  },
});

export const clearLegacyOAuthProviderRecords = mutation({
  args: {
    table: v.union(
      v.literal("oauthApplication"),
      v.literal("oauthAccessToken"),
      v.literal("oauthConsent")
    ),
    paginationOpts: paginationOptsValidator,
  },
  returns: clearedLegacyRecordsValidator,
  handler: async (ctx, args) => {
    const operation = `clearLegacyOAuthProviderRecords:${args.table}`;
    const completeCursor = migrationCompleteCursorFor(operation);
    assertValidPaginationOpts(args.paginationOpts);
    if (isMigrationCompleteCursor(args.paginationOpts.cursor, operation)) {
      return {
        continueCursor: completeCursor,
        isDone: true,
        deleted: 0,
      };
    }
    const result =
      args.table === "oauthApplication"
        ? await paginator(ctx.db, schema)
            .query("oauthApplication")
            .paginate(args.paginationOpts)
        : args.table === "oauthAccessToken"
          ? await paginator(ctx.db, schema)
              .query("oauthAccessToken")
              .paginate(args.paginationOpts)
          : await paginator(ctx.db, schema)
              .query("oauthConsent")
              .paginate(args.paginationOpts);
    for (const record of result.page) {
      await ctx.db.delete(args.table, record._id);
    }
    return {
      continueCursor: result.isDone ? completeCursor : result.continueCursor,
      isDone: result.isDone,
      deleted: result.page.length,
    };
  },
});

export const validateAccountIssuerBackfill = query({
  args: migrationArgs,
  returns: accountValidationValidator,
  handler: async (ctx, args) => {
    const operation = "validateAccountIssuerBackfill";
    const completeCursor = migrationCompleteCursorFor(operation);
    assertValidPaginationOpts(args.paginationOpts);
    assertValidProviderIssuers(args.providerIssuers);
    if (isMigrationCompleteCursor(args.paginationOpts.cursor, operation)) {
      return {
        continueCursor: completeCursor,
        isDone: true,
        pending: 0,
        alreadyMigrated: 0,
      };
    }
    const result = await paginator(ctx.db, schema)
      .query("account")
      .paginate(args.paginationOpts);
    let pending = 0;
    let alreadyMigrated = 0;

    for (const account of result.page) {
      const target = await assertNoAccountIdentityCollision(
        ctx,
        account,
        args.providerIssuers
      );
      if (
        account.issuer === target.issuer &&
        account.accountId === target.accountId
      ) {
        alreadyMigrated += 1;
      } else {
        pending += 1;
      }
    }

    return {
      continueCursor: result.isDone ? completeCursor : result.continueCursor,
      isDone: result.isDone,
      pending,
      alreadyMigrated,
    };
  },
});

export const backfillAccountIssuers = mutation({
  args: migrationArgs,
  returns: accountBackfillValidator,
  handler: async (ctx, args) => {
    const operation = "backfillAccountIssuers";
    const completeCursor = migrationCompleteCursorFor(operation);
    assertValidPaginationOpts(args.paginationOpts);
    assertValidProviderIssuers(args.providerIssuers);
    if (isMigrationCompleteCursor(args.paginationOpts.cursor, operation)) {
      return {
        continueCursor: completeCursor,
        isDone: true,
        migrated: 0,
        alreadyMigrated: 0,
      };
    }
    const result = await paginator(ctx.db, schema)
      .query("account")
      .paginate(args.paginationOpts);
    let migrated = 0;
    let alreadyMigrated = 0;

    for (const account of result.page) {
      const target = await assertNoAccountIdentityCollision(
        ctx,
        account,
        args.providerIssuers
      );
      if (
        account.issuer === target.issuer &&
        account.accountId === target.accountId
      ) {
        alreadyMigrated += 1;
        continue;
      }

      await ctx.db.patch("account", account._id, target);
      migrated += 1;
    }

    return {
      continueCursor: result.isDone ? completeCursor : result.continueCursor,
      isDone: result.isDone,
      migrated,
      alreadyMigrated,
    };
  },
});
