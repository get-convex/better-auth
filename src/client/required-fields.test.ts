/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { createFunctionHandle } from "convex/server";
import type { BetterAuthOptions } from "better-auth";
import schema from "../component/schema.js";
import { api, internal } from "../component/_generated/api.js";
import type { DataModel } from "../component/_generated/dataModel.js";
import { createClient } from "./index.js";

const accountData = () => ({
  issuer: "local:credential",
  accountId: "user-1",
  providerId: "credential",
  userId: "user-1",
  password: "password-hash",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const createAccount = async (
  t: ReturnType<typeof convexTest>,
  onCreateHandle?: string
) =>
  await t.run(async (ctx) =>
    ctx.runMutation(api.adapter.create, {
      input: { model: "account", data: accountData() },
      onCreateHandle,
    })
  );

const insertLegacyAccount = async (
  t: ReturnType<typeof convexTest>,
  suffix: string
) =>
  await t.run((ctx) =>
    ctx.db.insert("account", {
      accountId: `legacy-account-${suffix}`,
      providerId: "credential",
      userId: `legacy-user-${suffix}`,
      password: "password-hash",
      createdAt: Date.now(),
      updatedAt: 100,
    })
  );

describe("required fields", () => {
  it.each(["updateOne", "incrementOne", "updateMany"] as const)(
    "rejects null issuer through %s",
    async (operation) => {
      const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
      await createAccount(t);

      const mutation = t.run(async (ctx) => {
        if (operation === "updateOne") {
          return await ctx.runMutation(api.adapter.updateOne, {
            input: {
              model: "account",
              update: { issuer: null },
              where: [{ field: "accountId", operator: "eq", value: "user-1" }],
            },
          });
        }
        if (operation === "incrementOne") {
          return await ctx.runMutation(api.adapter.incrementOne, {
            input: {
              model: "account",
              increment: { updatedAt: 1 },
              set: { issuer: null },
              where: [{ field: "accountId", operator: "eq", value: "user-1" }],
            },
          });
        }
        return await ctx.runMutation(api.adapter.updateMany, {
          input: {
            model: "account",
            update: { issuer: null },
            where: [{ field: "accountId", operator: "eq", value: "user-1" }],
          },
          paginationOpts: { cursor: null, numItems: 10 },
        });
      });

      await expect(mutation).rejects.toThrow(
        "Cannot clear required field account.issuer"
      );
      const accounts = await t.run((ctx) => ctx.db.query("account").collect());
      expect(accounts).toHaveLength(1);
      expect(accounts[0]?.issuer).toBe("local:credential");
    }
  );

  it.each(["updateOne", "incrementOne", "updateMany"] as const)(
    "allows an unrelated %s on a legacy account",
    async (operation) => {
      const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
      await insertLegacyAccount(t, operation);

      await t.run(async (ctx) => {
        const where = [
          {
            field: "accountId",
            operator: "eq" as const,
            value: `legacy-account-${operation}`,
          },
        ];
        if (operation === "updateOne") {
          await ctx.runMutation(api.adapter.updateOne, {
            input: {
              model: "account",
              update: { accessToken: "updated-token" },
              where,
            },
          });
          return;
        }
        if (operation === "incrementOne") {
          await ctx.runMutation(api.adapter.incrementOne, {
            input: {
              model: "account",
              increment: { updatedAt: 1 },
              where,
            },
          });
          return;
        }
        await ctx.runMutation(api.adapter.updateMany, {
          input: {
            model: "account",
            update: { scope: "updated-scope" },
            where,
          },
          paginationOpts: { cursor: null, numItems: 10 },
        });
      });

      const accounts = await t.run((ctx) => ctx.db.query("account").collect());
      expect(accounts).toHaveLength(1);
      expect(accounts[0]?.issuer).toBeUndefined();
      if (operation === "updateOne") {
        expect(accounts[0]?.accessToken).toBe("updated-token");
      } else if (operation === "incrementOne") {
        expect(accounts[0]?.updatedAt).toBe(101);
      } else {
        expect(accounts[0]?.scope).toBe("updated-scope");
      }
    }
  );

  it("updates multiple pages containing a legacy account", async () => {
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    await t.run(async (ctx) => {
      for (let i = 0; i < 401; i += 1) {
        await ctx.db.insert("account", {
          ...(i === 250 ? {} : { issuer: `local:legacy-${i}` }),
          accountId: `legacy-bulk-account-${i}`,
          providerId: "legacy-bulk-provider",
          userId: `legacy-bulk-user-${i.toString().padStart(3, "0")}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }
    });
    const adapter = createClient<DataModel>({ adapter: api.adapter } as any, {
      verbose: false,
    }).adapter({
      runMutation: t.mutation.bind(t),
      runQuery: t.query.bind(t),
    } as any)({} as BetterAuthOptions);

    await expect(
      adapter.updateMany({
        model: "account",
        where: [{ field: "providerId", value: "legacy-bulk-provider" }],
        update: { scope: "updated-scope" },
      })
    ).resolves.toBe(401);

    const accounts = await t.run((ctx) => ctx.db.query("account").collect());
    expect(accounts).toHaveLength(401);
    expect(accounts.every(({ scope }) => scope === "updated-scope")).toBe(true);
    expect(accounts.filter(({ issuer }) => issuer === undefined)).toHaveLength(
      1
    );
  });

  it("rolls back an onCreate trigger that clears a required field", async () => {
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));

    await expect(
      t.run(async (ctx) => {
        const handle = await createFunctionHandle(
          internal.testTriggerHandlers.accountOnCreateIssuerClearer
        );
        return await ctx.runMutation(api.adapter.create, {
          input: { model: "account", data: accountData() },
          onCreateHandle: handle,
        });
      })
    ).rejects.toThrow("Missing required field account.issuer");
    expect(await t.run((ctx) => ctx.db.query("account").collect())).toEqual([]);
  });

  it("rolls back an onUpdate trigger that clears a required field", async () => {
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    await createAccount(t);

    await expect(
      t.run(async (ctx) => {
        const handle = await createFunctionHandle(
          internal.testTriggerHandlers.accountOnUpdateIssuerClearer
        );
        return await ctx.runMutation(api.adapter.updateOne, {
          input: {
            model: "account",
            update: { updatedAt: Date.now() + 1 },
            where: [{ field: "accountId", operator: "eq", value: "user-1" }],
          },
          onUpdateHandle: handle,
        });
      })
    ).rejects.toThrow("Trigger cleared required field account.issuer");

    const accounts = await t.run((ctx) => ctx.db.query("account").collect());
    expect(accounts).toHaveLength(1);
    expect(accounts[0]?.issuer).toBe("local:credential");
  });

  it("allows a no-op trigger on a legacy account with a null issuer", async () => {
    const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
    await t.run((ctx) =>
      ctx.db.insert("account", {
        issuer: null,
        accountId: "legacy-null-account",
        providerId: "credential",
        userId: "legacy-null-user",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    );

    await t.run(async (ctx) => {
      const handle = await createFunctionHandle(
        internal.testTriggerHandlers.accountOnUpdateNoop
      );
      await ctx.runMutation(api.adapter.updateOne, {
        input: {
          model: "account",
          update: { scope: "updated-scope" },
          where: [
            {
              field: "accountId",
              operator: "eq",
              value: "legacy-null-account",
            },
          ],
        },
        onUpdateHandle: handle,
      });
    });

    const accounts = await t.run((ctx) => ctx.db.query("account").collect());
    expect(accounts).toHaveLength(1);
    expect(accounts[0]?.issuer).toBeNull();
    expect(accounts[0]?.scope).toBe("updated-scope");
  });
});
