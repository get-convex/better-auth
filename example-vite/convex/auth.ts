import { betterAuth, Adapter } from "better-auth";
import { oidcProvider, jwt, bearer } from "better-auth/plugins";
import {
  ActionCtx,
  internalAction,
  internalMutation,
  internalQuery,
  QueryCtx,
} from "./_generated/server";
import { asyncMap } from "convex-helpers";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Doc, Id, TableNames } from "./_generated/dataModel";
import schema, { isUniqueField } from "./schema";
import { paginationOptsValidator, PaginationResult } from "convex/server";

const transformInput = (data: any, model: string, action: string) => {
  return data;
};

const transformOutput = (
  { _id, _creationTime, ...data }: Doc<TableNames>,
  _model: string,
) => {
  return { ...data, id: _id };
};

const convertWhereClause = (where: any, table: any, model: string) => {
  return where;
};

const getField = (model: string, field: string) => {
  return field;
};

const db = {
  user: [],
};

const getBy = async (
  ctx: QueryCtx,
  args: {
    table: string;
    field: string;
    value: any;
  },
) => {
  if (args.field === "id") {
    return ctx.db.get(args.value);
  }
  const query = ctx.db
    .query(args.table as any)
    .withIndex(args.field as any, (q) => q.eq(args.field, args.value));
  return isUniqueField(args.table as any, args.field as any)
    ? await query.unique()
    : await query.first();
};

const getByArgsValidator = {
  table: v.string(),
  field: v.string(),
  value: v.union(
    v.string(),
    v.number(),
    v.boolean(),
    v.array(v.string()),
    v.array(v.number()),
    v.null(),
  ),
};

// Generic functions
export const getByQuery = internalQuery({
  args: getByArgsValidator,
  handler: async (ctx, args) => {
    console.log({ fn: "getBy", args });
    const doc = await getBy(ctx, args);
    if (!doc) {
      return;
    }
    return transformOutput(doc, args.table);
  },
});
export { getByQuery as getBy };

export const create = internalMutation({
  args: {
    input: v.union(
      v.object({
        table: v.literal("user"),
        ...schema.tables.user.validator.fields,
      }),
      v.object({
        table: v.literal("account"),
        ...schema.tables.account.validator.fields,
      }),
      v.object({
        table: v.literal("session"),
        ...schema.tables.session.validator.fields,
      }),
      v.object({
        table: v.literal("verification"),
        ...schema.tables.verification.validator.fields,
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { table, ...input } = args.input;
    const id = await ctx.db.insert(table, {
      ...input,
    });
    const doc = await ctx.db.get(id);
    if (!doc) {
      throw new Error(`Failed to create ${table}`);
    }
    return transformOutput(doc, table);
  },
});

const updateArgsInputValidator = <T extends TableNames>(table: T) => {
  return v.object({
    table: v.literal(table),
    where: v.object({ field: v.string(), value: getByArgsValidator.value }),
    value: v.record(v.string(), v.any()),
  });
};

export const update = internalMutation({
  args: {
    input: v.union(
      updateArgsInputValidator("user"),
      updateArgsInputValidator("account"),
      updateArgsInputValidator("session"),
      updateArgsInputValidator("verification"),
    ),
  },
  handler: async (ctx, args) => {
    const { table, where, value } = args.input;
    const doc =
      where.field === "id"
        ? await ctx.db.get(where.value as Id<any>)
        : await getBy(ctx, { table, ...where });
    if (!doc) {
      throw new Error(`Failed to update ${table}`);
    }
    await ctx.db.patch(doc._id, value as any);
  },
});
export const deleteBy = internalMutation({
  args: getByArgsValidator,
  handler: async (ctx, args) => {
    const doc = await getBy(ctx, args);
    if (!doc) {
      return;
    }
    await ctx.db.delete(doc._id);
  },
});

// Single purpose functions
export const getAccountsByUserId = internalQuery({
  args: { userId: v.id("user") },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("account")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
    return docs.map((doc) => transformOutput(doc, "account"));
  },
});

export const getJwks = internalQuery({
  args: {},
  handler: async (ctx, args) => {
    const docs = await ctx.db.query("jwks").collect();
    return docs.map((doc) => transformOutput(doc, "jwks"));
  },
});

export const listVerificationsByIdentifier = internalQuery({
  args: {
    identifier: v.string(),
    sortBy: v.optional(
      v.object({
        field: v.string(),
        direction: v.union(v.literal("asc"), v.literal("desc")),
      }),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.sortBy && args.sortBy.field !== "createdAt") {
      throw new Error(`Unsupported sortBy field: ${args.sortBy.field}`);
    }
    const query = ctx.db
      .query("verification")
      .withIndex("identifier", (q) => q.eq("identifier", args.identifier))
      .order(
        args.sortBy?.field === "createdAt" && args.sortBy?.direction
          ? args.sortBy.direction
          : "asc",
      );
    const docs = args.limit
      ? await query.take(args.limit)
      : await query.collect();
    return docs.map((doc) => transformOutput(doc, "verification"));
  },
});

export const deleteOldVerificationsPage = internalMutation({
  args: {
    currentTimestamp: v.number(),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  handler: async (ctx, args) => {
    const paginationOpts = args.paginationOpts ?? {
      numItems: 500,
      cursor: null,
    };
    const { page, ...result } = await ctx.db
      .query("verification")
      .withIndex("expiresAt", (q) => q.lt("expiresAt", args.currentTimestamp))
      .paginate(paginationOpts);
    await asyncMap(page, async (doc) => {
      await ctx.db.delete(doc._id);
    });
    return { ...result, count: page.length };
  },
});

export const deleteOldVerifications = internalAction({
  args: {
    currentTimestamp: v.number(),
  },
  handler: async (ctx, args) => {
    let count = 0;
    let cursor = null;
    while (cursor) {
      const result: Omit<PaginationResult<Doc<"verification">>, "page"> & {
        count: number;
      } = await ctx.runMutation(internal.auth.deleteOldVerificationsPage, {
        currentTimestamp: args.currentTimestamp,
        paginationOpts: {
          numItems: 500,
          cursor,
        },
      });
      count += result.count;
      cursor =
        result.pageStatus &&
        result.splitCursor &&
        ["SplitRecommended", "SplitRequired"].includes(result.pageStatus)
          ? result.splitCursor
          : result.continueCursor;
    }
    return count;
  },
});

export const deleteAllForUserPage = internalMutation({
  args: {
    table: v.string(),
    userId: v.id("user"),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  handler: async (ctx, args) => {
    const paginationOpts = args.paginationOpts ?? {
      numItems: 500,
      cursor: null,
    };
    const { page, ...result } = await ctx.db
      .query(args.table as any)
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .paginate(paginationOpts);
    await asyncMap(page, async (doc) => {
      await ctx.db.delete(doc._id);
    });
    return { ...result, count: page.length };
  },
});

export const deleteAllForUser = internalAction({
  args: {
    table: v.string(),
    userId: v.id("user"),
  },
  handler: async (ctx, args) => {
    let count = 0;
    let cursor = null;
    while (cursor) {
      const result: Omit<PaginationResult<Doc<"session">>, "page"> & {
        count: number;
      } = await ctx.runMutation(internal.auth.deleteAllForUserPage, {
        table: args.table,
        userId: args.userId,
        paginationOpts: {
          numItems: 500,
          cursor,
        },
      });
      count += result.count;
      cursor =
        result.pageStatus &&
        result.splitCursor &&
        ["SplitRecommended", "SplitRequired"].includes(result.pageStatus)
          ? result.splitCursor
          : result.continueCursor;
    }
    return count;
  },
});

export const getAccountByAccountIdAndProviderId = internalQuery({
  args: { accountId: v.string(), providerId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("account")
      .withIndex("providerId_accountId", (q) =>
        q.eq("providerId", args.providerId).eq("accountId", args.accountId),
      )
      .unique();
    if (!doc) {
      return;
    }
    return transformOutput(doc, "account");
  },
});

export const auth = (ctx: ActionCtx) => {
  return betterAuth({
    trustedOrigins: ["http://localhost:5173"],
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    /*
    advanced: {
      defaultCookieAttributes: {
        secure: true,
        httpOnly: true,
        sameSite: "none", // Allows CORS-based cookie sharing across subdomains
        partitioned: true, // New browser standards will mandate this for foreign cookies
      },
    },
    */
    plugins: [
      oidcProvider({
        loginPage: "/login-page",
      }),
      bearer(),
      jwt({
        jwt: {
          issuer: `${process.env.CONVEX_SITE_URL}`,
          audience: "convex",
          definePayload: (session) => ({
            sub: `${session.user.id}|${session.session.id}`,
          }),
        },
        jwks: {
          disablePrivateKeyEncryption: true,
          keyPairConfig: {
            alg: "RS256",
          },
        },
      }),
    ],
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    database: () =>
      ({
        id: "convex",
        create: async ({ model, data, select }): Promise<any> => {
          console.log({ fn: "create", model, data, select });
          if (select) {
            throw new Error("select is not supported");
          }
          if (model === "session") {
            if (!data.userId) {
              throw new Error("userId is required for session creation");
            }
            return ctx.runMutation(internal.auth.create, {
              input: {
                table: "session",
                token: data.token,
                userId: data.userId,
                expiresAt: data.expiresAt.getTime(),
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
                createdAt: data.createdAt.getTime(),
                updatedAt: data.updatedAt.getTime(),
              },
            });
          }
          if (model === "account") {
            return ctx.runMutation(internal.auth.create, {
              input: {
                table: "account",
                accountId: data.accountId,
                providerId: data.providerId,
                userId: data.userId,
                password: data.password,
                createdAt: data.createdAt.getTime(),
                updatedAt: data.updatedAt.getTime(),
              },
            });
          }
          if (model === "user") {
            return ctx.runMutation(internal.auth.create, {
              input: {
                table: "user",
                email: data.email,
                image: data.image,
                name: data.name,
                emailVerified: data.emailVerified,
                createdAt: data.createdAt.getTime(),
                updatedAt: data.updatedAt.getTime(),
              },
            });
          }
          if (model === "verification") {
            return ctx.runMutation(internal.auth.create, {
              input: {
                table: "verification",
                value: data.value,
                expiresAt: data.expiresAt.getTime(),
                identifier: data.identifier,
                createdAt: data.createdAt.getTime(),
                updatedAt: data.updatedAt.getTime(),
              },
            });
          }
          throw new Error("no matching function found");
        },
        findOne: async ({ model, where, select }): Promise<any> => {
          console.log({ fn: "findOne", model, where, select });
          if (where.some((w) => w.operator || w.connector)) {
            throw new Error(
              "where clause with operator or connector is not supported",
            );
          }
          if (where.length === 1) {
            const { value, field } = where[0];
            return ctx.runQuery(internal.auth.getBy, {
              table: model,
              field,
              value: value instanceof Date ? value.getTime() : value,
            });
          }
          if (
            model === "account" &&
            where.length === 2 &&
            where[0].field === "accountId" &&
            where[1].field === "providerId"
          ) {
            return ctx.runQuery(
              internal.auth.getAccountByAccountIdAndProviderId,
              {
                accountId: where[0].value as string,
                providerId: where[1].value as string,
              },
            );
          }
          throw new Error("no matching function found");
          /*
          const table = db[model];
          const res = convertWhereClause(where, table, model);
          const record = res[0] || null;
          return transformOutput(record, model, select);
          */
        },
        findMany: async ({
          model,
          where,
          sortBy,
          limit,
          offset,
        }): Promise<any[]> => {
          console.log({ fn: "findMany", model, where, sortBy, limit, offset });
          if (where?.some((w) => w.operator || w.connector)) {
            throw new Error(
              "where clause with operator or connector is not supported",
            );
          }
          if (
            model === "account" &&
            where?.length === 1 &&
            where[0].field === "userId"
          ) {
            return ctx.runQuery(internal.auth.getAccountsByUserId, {
              userId: where[0].value as Id<"user">,
            });
          }
          // Currently there exists exactly one jwks result which is inserted to
          // the db during setup.
          // TODO: support jwks creation when convex runtime supports subtle
          // crypto generateKeyPair or when http actions can run in node
          // (enabling BA to be run in node).
          if (model === "jwks") {
            return ctx.runQuery(internal.auth.getJwks);
          }
          if (
            model === "verification" &&
            where?.length === 1 &&
            where[0].field === "identifier" &&
            !offset
          ) {
            return ctx.runQuery(internal.auth.listVerificationsByIdentifier, {
              identifier: where[0].value as string,
              sortBy,
            });
          }
          throw new Error("no matching function found");
          /*
          let table = db[model];
          if (where) {
            table = convertWhereClause(where, table, model);
          }
          if (sortBy) {
            table = table.sort((a, b) => {
              const field = getField(model, sortBy.field);
              if (sortBy.direction === "asc") {
                return a[field] > b[field] ? 1 : -1;
              } else {
                return a[field] < b[field] ? 1 : -1;
              }
            });
          }
          if (offset !== undefined) {
            table = table.slice(offset);
          }
          if (limit !== undefined) {
            table = table.slice(0, limit);
          }
          return table.map((record) => transformOutput(record, model));
          */
        },
        count: async ({ model, where }) => {
          console.log({ fn: "count", model, where });
          if (where?.some((w) => w.operator || w.connector)) {
            throw new Error(
              "where clause with operator or connector is not supported",
            );
          }
          throw new Error("Not implemented");
          // return 0;
          /*
          return db[model].length;
          */
        },
        update: async ({ model, where, update }) => {
          console.log({ fn: "update", model, where, update });
          if (where?.some((w) => w.operator || w.connector)) {
            throw new Error(
              "where clause with operator or connector is not supported",
            );
          }
          if (where?.length === 1 && where[0].field === "id") {
            const { value, field } = where[0];
            return ctx.runMutation(internal.auth.update, {
              input: {
                table: model as any,
                where: {
                  field,
                  value: value instanceof Date ? value.getTime() : value,
                },
                value: update,
              },
            });
          }
          throw new Error("Not implemented");
          // return null
          /*
          const table = db[model];
          const res = convertWhereClause(where, table, model);
          res.forEach((record) => {
            Object.assign(record, transformInput(update, model, "update"));
          });
          return transformOutput(res[0], model);
          */
        },
        delete: async ({ model, where }) => {
          console.log({ fn: "delete", model, where });
          if (where?.some((w) => w.operator || w.connector)) {
            throw new Error(
              "where clause with operator or connector is not supported",
            );
          }
          if (where?.length === 1) {
            const { field, value } = where[0];
            await ctx.runMutation(internal.auth.deleteBy, {
              table: model,
              field,
              value: value instanceof Date ? value.getTime() : value,
            });
            return;
          }
          throw new Error("no matching function found");
          // return null
          /*
          const table = db[model];
          const res = convertWhereClause(where, table, model);
          db[model] = table.filter((record) => !res.includes(record));
          */
        },
        deleteMany: async ({ model, where }) => {
          console.log({ fn: "deleteMany", model, where });
          if (where?.some((w) => w.connector)) {
            throw new Error("where clause with connector is not supported");
          }
          if (
            model === "verification" &&
            where?.length === 1 &&
            where[0].operator === "lt" &&
            where[0].field === "expiresAt" &&
            !where[0].connector
          ) {
            return ctx.runAction(internal.auth.deleteOldVerifications, {
              currentTimestamp: Date.now(),
            });
          }
          if (where?.length === 1 && where[0].field === "userId") {
            return ctx.runAction(internal.auth.deleteAllForUser, {
              table: model,
              userId: where[0].value as Id<"user">,
            });
          }
          throw new Error("no matching function found");
          /*
          const table = db[model];
          const res = convertWhereClause(where, table, model);
          let count = 0;
          db[model] = table.filter((record) => {
            if (res.includes(record)) {
              count++;
              return false;
            }
            return !res.includes(record);
          });
          return count;
          */
        },
        updateMany: async ({ model, where, update }) => {
          console.log({ fn: "updateMany", model, where, update });
          if (where?.some((w) => w.operator || w.connector)) {
            throw new Error(
              "where clause with operator or connector is not supported",
            );
          }
          throw new Error("Not implemented");
          //return 0;
          /*
          const { model, where, update } = data;
          const table = db[model];
          const res = convertWhereClause(where, table, model);
          res.forEach((record) => {
            Object.assign(record, update);
          });
          return res[0] || null;
          */
        },
      }) satisfies Adapter,
  });
};
