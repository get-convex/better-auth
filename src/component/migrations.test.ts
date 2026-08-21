/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "./_generated/api.js";
import schema from "./schema.js";

const modules = import.meta.glob("./**/*.*s");
const backfillAccountIssuers = api.migrations.backfillAccountIssuers;
const validateAccountIssuerBackfill =
  api.migrations.validateAccountIssuerBackfill;
const listLegacyOAuthApplications = api.migrations.listLegacyOAuthApplications;
const clearLegacyOAuthProviderRecords =
  api.migrations.clearLegacyOAuthProviderRecords;

describe("backfillAccountIssuers", () => {
  it("backfills trusted issuers and normalizes credential account IDs", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("account", {
        accountId: "legacy-credential-id",
        providerId: "credential",
        userId: "user-1",
        createdAt: 1,
        updatedAt: 1,
      });
      await ctx.db.insert("account", {
        accountId: "github-subject",
        providerId: "github",
        userId: "user-2",
        createdAt: 1,
        updatedAt: 1,
      });
    });

    await t.mutation(backfillAccountIssuers, {
      providerIssuers: { github: "local:oauth:github" },
      paginationOpts: { cursor: null, numItems: 10 },
    });

    const accounts = await t.run((ctx) => ctx.db.query("account").collect());
    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          issuer: "local:credential",
          accountId: "user-1",
        }),
        expect.objectContaining({
          issuer: "local:oauth:github",
          accountId: "github-subject",
        }),
      ])
    );
  });

  it("rolls back a page when a provider mapping is missing", async () => {
    const t = convexTest(schema, modules);
    await t.run((ctx) =>
      ctx.db.insert("account", {
        accountId: "subject",
        providerId: "custom-provider",
        userId: "user-1",
        createdAt: 1,
        updatedAt: 1,
      })
    );

    await expect(
      t.mutation(backfillAccountIssuers, {
        providerIssuers: {},
        paginationOpts: { cursor: null, numItems: 10 },
      })
    ).rejects.toThrow("Missing trusted issuer mapping");
    const [account] = await t.run((ctx) => ctx.db.query("account").collect());
    expect(account?.issuer).toBeUndefined();
  });

  it("rejects issuer mappings with surrounding whitespace", async () => {
    const t = convexTest(schema, modules);
    await t.run((ctx) =>
      ctx.db.insert("account", {
        accountId: "subject",
        providerId: "custom-provider",
        userId: "user-1",
        createdAt: 1,
        updatedAt: 1,
      })
    );

    await expect(
      t.query(validateAccountIssuerBackfill, {
        providerIssuers: {
          "custom-provider": " https://issuer.example.com ",
        },
        paginationOpts: { cursor: null, numItems: 10 },
      })
    ).rejects.toThrow("contains leading or trailing whitespace");
  });

  it("validates supplied external issuer mappings before reading a page", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.query(validateAccountIssuerBackfill, {
        providerIssuers: {
          "unused-provider": " https://issuer.example.com ",
        },
        paginationOpts: { cursor: null, numItems: 10 },
      })
    ).rejects.toThrow(
      "Trusted issuer mapping for providerId unused-provider contains leading or trailing whitespace"
    );
  });

  it("ignores issuer mappings for fixed local authentication methods", async () => {
    const t = convexTest(schema, modules);
    await t.run((ctx) =>
      ctx.db.insert("account", {
        accountId: "legacy-credential-id",
        providerId: "credential",
        userId: "user-1",
        createdAt: 1,
        updatedAt: 1,
      })
    );

    await expect(
      t.query(validateAccountIssuerBackfill, {
        providerIssuers: { credential: "ignored" },
        paginationOpts: { cursor: null, numItems: 10 },
      })
    ).resolves.toMatchObject({ pending: 1, isDone: true });
  });

  it("distinguishes an invalid stored issuer from an invalid mapping", async () => {
    const t = convexTest(schema, modules);
    await t.run((ctx) =>
      ctx.db.insert("account", {
        accountId: "subject",
        issuer: " https://issuer.example.com ",
        providerId: "custom-provider",
        userId: "user-1",
        createdAt: 1,
        updatedAt: 1,
      })
    );

    await expect(
      t.query(validateAccountIssuerBackfill, {
        providerIssuers: {},
        paginationOpts: { cursor: null, numItems: 10 },
      })
    ).rejects.toThrow(
      "Existing issuer for providerId custom-provider contains leading or trailing whitespace"
    );
  });

  it("rejects non-positive page sizes on every migration entry point", async () => {
    const t = convexTest(schema, modules);
    const paginationOpts = { cursor: null, numItems: 0 };

    await expect(
      t.query(validateAccountIssuerBackfill, {
        providerIssuers: {},
        paginationOpts,
      })
    ).rejects.toThrow("paginationOpts.numItems must be a positive integer");
    await expect(
      t.mutation(backfillAccountIssuers, {
        providerIssuers: {},
        paginationOpts,
      })
    ).rejects.toThrow("paginationOpts.numItems must be a positive integer");
    await expect(
      t.query(listLegacyOAuthApplications, { paginationOpts })
    ).rejects.toThrow("paginationOpts.numItems must be a positive integer");
    await expect(
      t.mutation(clearLegacyOAuthProviderRecords, {
        table: "oauthApplication",
        paginationOpts,
      })
    ).rejects.toThrow("paginationOpts.numItems must be a positive integer");
  });

  it("rolls back a page when trusted issuer mappings reveal a collision", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("account", {
        accountId: "same-subject",
        providerId: "oidc-primary",
        userId: "user-1",
        createdAt: 1,
        updatedAt: 1,
      });
      await ctx.db.insert("account", {
        accountId: "same-subject",
        providerId: "oidc-secondary",
        userId: "user-2",
        createdAt: 1,
        updatedAt: 1,
      });
    });

    await expect(
      t.mutation(backfillAccountIssuers, {
        providerIssuers: {
          "oidc-primary": "https://issuer.example.com",
          "oidc-secondary": "https://issuer.example.com",
        },
        paginationOpts: { cursor: null, numItems: 10 },
      })
    ).rejects.toThrow("Account identity collision");
    const accounts = await t.run((ctx) => ctx.db.query("account").collect());
    expect(accounts.every((account) => account.issuer === undefined)).toBe(
      true
    );
  });

  it("detects collisions beyond the current page before writing", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("account", {
        accountId: "same-subject",
        providerId: "oidc-primary",
        userId: "user-1",
        createdAt: 1,
        updatedAt: 1,
      });
      await ctx.db.insert("account", {
        accountId: "same-subject",
        providerId: "oidc-secondary",
        userId: "user-2",
        createdAt: 1,
        updatedAt: 1,
      });
    });

    const args = {
      providerIssuers: {
        "oidc-primary": "https://issuer.example.com",
        "oidc-secondary": "https://issuer.example.com",
      },
      paginationOpts: { cursor: null, numItems: 1 },
    };
    await expect(t.query(validateAccountIssuerBackfill, args)).rejects.toThrow(
      "Account identity collision"
    );
    await expect(t.mutation(backfillAccountIssuers, args)).rejects.toThrow(
      "Account identity collision"
    );

    const accounts = await t.run((ctx) => ctx.db.query("account").collect());
    expect(accounts.every((account) => account.issuer === undefined)).toBe(
      true
    );
  });

  it("detects credential collisions after account ID normalization", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("account", {
        accountId: "legacy-credential-1",
        providerId: "credential",
        userId: "same-user",
        createdAt: 1,
        updatedAt: 1,
      });
      await ctx.db.insert("account", {
        accountId: "legacy-credential-2",
        providerId: "credential",
        userId: "same-user",
        createdAt: 1,
        updatedAt: 1,
      });
    });

    await expect(
      t.mutation(backfillAccountIssuers, {
        providerIssuers: {},
        paginationOpts: { cursor: null, numItems: 1 },
      })
    ).rejects.toThrow("Account identity collision");
    const accounts = await t.run((ctx) => ctx.db.query("account").collect());
    expect(accounts.every((account) => account.issuer === undefined)).toBe(
      true
    );
  });

  it("is idempotent for accounts already written by Better Auth 1.7", async () => {
    const t = convexTest(schema, modules);
    await t.run((ctx) =>
      ctx.db.insert("account", {
        issuer: "local:oauth:github",
        accountId: "github-subject",
        providerId: "github",
        userId: "user-1",
        createdAt: 1,
        updatedAt: 1,
      })
    );

    const result = await t.mutation(backfillAccountIssuers, {
      providerIssuers: {},
      paginationOpts: { cursor: null, numItems: 10 },
    });
    expect(result).toMatchObject({
      isDone: true,
      migrated: 0,
      alreadyMigrated: 1,
    });
  });

  it("validates and migrates every cursor page", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      for (let index = 0; index < 3; index += 1) {
        await ctx.db.insert("account", {
          accountId: `subject-${index}`,
          providerId: "github",
          userId: `user-${index}`,
          createdAt: 1,
          updatedAt: 1,
        });
      }
    });

    let cursor: string | null = null;
    let validated = 0;
    do {
      const result: {
        pending: number;
        isDone: boolean;
        continueCursor: string;
      } = await t.query(validateAccountIssuerBackfill, {
        providerIssuers: { github: "local:oauth:github" },
        paginationOpts: { cursor, numItems: 1 },
      });
      validated += result.pending;
      cursor = result.isDone ? null : result.continueCursor;
      if (result.isDone) break;
    } while (cursor);
    expect(validated).toBe(3);

    cursor = null;
    let migrated = 0;
    do {
      const result: {
        migrated: number;
        isDone: boolean;
        continueCursor: string;
      } = await t.mutation(backfillAccountIssuers, {
        providerIssuers: { github: "local:oauth:github" },
        paginationOpts: { cursor, numItems: 1 },
      });
      migrated += result.migrated;
      cursor = result.isDone ? null : result.continueCursor;
      if (result.isDone) break;
    } while (cursor);
    expect(migrated).toBe(3);
    const accounts = await t.run((ctx) => ctx.db.query("account").collect());
    expect(
      accounts.every((account) => account.issuer === "local:oauth:github")
    ).toBe(true);
  });

  it("treats completed cursors as terminal instead of restarting", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("account", {
        accountId: "github-subject",
        providerId: "github",
        userId: "user-1",
        createdAt: 1,
        updatedAt: 1,
      });
      await ctx.db.insert("oauthApplication", {
        clientId: "legacy-client",
        clientSecret: "legacy-secret",
      });
    });
    const providerIssuers = { github: "local:oauth:github" };
    const initialPage = { cursor: null, numItems: 10 };

    const validation = await t.query(validateAccountIssuerBackfill, {
      providerIssuers,
      paginationOpts: initialPage,
    });
    expect(validation.isDone).toBe(true);
    await expect(
      t.query(validateAccountIssuerBackfill, {
        providerIssuers,
        paginationOpts: {
          cursor: validation.continueCursor,
          numItems: 10,
        },
      })
    ).resolves.toMatchObject({
      isDone: true,
      pending: 0,
      alreadyMigrated: 0,
    });

    const backfill = await t.mutation(backfillAccountIssuers, {
      providerIssuers,
      paginationOpts: initialPage,
    });
    expect(backfill.isDone).toBe(true);
    await expect(
      t.mutation(backfillAccountIssuers, {
        providerIssuers,
        paginationOpts: { cursor: backfill.continueCursor, numItems: 10 },
      })
    ).resolves.toMatchObject({
      isDone: true,
      migrated: 0,
      alreadyMigrated: 0,
    });

    const exported = await t.query(listLegacyOAuthApplications, {
      paginationOpts: initialPage,
    });
    expect(exported.isDone).toBe(true);
    await expect(
      t.query(listLegacyOAuthApplications, {
        paginationOpts: { cursor: exported.continueCursor, numItems: 10 },
      })
    ).resolves.toMatchObject({ isDone: true, page: [] });

    const cleared = await t.mutation(clearLegacyOAuthProviderRecords, {
      table: "oauthApplication",
      paginationOpts: initialPage,
    });
    expect(cleared.isDone).toBe(true);
    await expect(
      t.mutation(clearLegacyOAuthProviderRecords, {
        table: "oauthApplication",
        paginationOpts: { cursor: cleared.continueCursor, numItems: 10 },
      })
    ).resolves.toMatchObject({ isDone: true, deleted: 0 });
  });

  it("accepts, exports, and clears legacy OAuth provider records", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("oauthApplication", {
        clientId: "legacy-client",
        clientSecret: "legacy-secret",
        redirectUrls: "https://example.com/callback",
      });
      await ctx.db.insert("oauthAccessToken", {
        accessToken: "legacy-access-token",
        refreshToken: "legacy-refresh-token",
        clientId: "legacy-client",
        scopes: "openid profile",
      });
      await ctx.db.insert("oauthAccessToken", {
        accessToken: "second-legacy-access-token",
        clientId: "legacy-client",
        scopes: "openid",
      });
      await ctx.db.insert("oauthConsent", {
        clientId: "legacy-client",
        userId: "user-1",
        scopes: "openid profile",
        consentGiven: true,
      });
      await ctx.db.insert("oauthConsent", {
        clientId: "legacy-client",
        userId: "user-2",
        scopes: "openid",
        consentGiven: true,
      });
    });

    const clients = await t.query(listLegacyOAuthApplications, {
      paginationOpts: { cursor: null, numItems: 10 },
    });
    expect(clients.page).toEqual([
      expect.objectContaining({
        clientId: "legacy-client",
        redirectUrls: "https://example.com/callback",
        hadClientSecret: true,
      }),
    ]);
    expect(clients.page[0]).not.toHaveProperty("clientSecret");

    for (const table of [
      "oauthApplication",
      "oauthAccessToken",
      "oauthConsent",
    ] as const) {
      let cursor: string | null = null;
      let deleted = 0;
      do {
        const result: {
          deleted: number;
          isDone: boolean;
          continueCursor: string;
        } = await t.mutation(clearLegacyOAuthProviderRecords, {
          table,
          paginationOpts: { cursor, numItems: 1 },
        });
        deleted += result.deleted;
        cursor = result.isDone ? null : result.continueCursor;
        if (result.isDone) break;
      } while (cursor);
      expect(deleted).toBe(table === "oauthApplication" ? 1 : 2);
    }
    const remaining = await t.run(async (ctx) => ({
      applications: await ctx.db.query("oauthApplication").collect(),
      tokens: await ctx.db.query("oauthAccessToken").collect(),
      consents: await ctx.db.query("oauthConsent").collect(),
    }));
    expect(remaining).toEqual({ applications: [], tokens: [], consents: [] });
  });
});
