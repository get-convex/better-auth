/// <reference types="vite/client" />

import { describe, expect, it } from "vitest";
import { convexTest } from "convex-test";
import { api } from "../component/_generated/api.js";
import schema from "../component/schema.js";
import { convexAdapter } from "./adapter.js";

const setup = () => {
  const t = convexTest(schema, import.meta.glob("../component/**/*.*s"));
  const adapter = convexAdapter(
    {
      runQuery: t.query.bind(t),
      runMutation: t.mutation.bind(t),
    } as any,
    { adapter: api.adapter } as any
  )({});
  return { t, adapter };
};

describe("Better Auth 1.7.7 compatibility", () => {
  // Use the real factory so modelKey is injected upstream. Convex validators
  // reject leaked metadata on both normal and OR/paginated component calls.
  it.each([false, true])(
    "keeps modelKey out of component calls (OR: %s)",
    async (or) => {
      const { adapter } = setup();
      await adapter.create({
        model: "user",
        data: { name: "Alice", email: "alice@example.com" },
      });
      const where = or
        ? [
            { field: "name", value: "Alice", connector: "OR" as const },
            {
              field: "email",
              value: "alice@example.com",
              connector: "OR" as const,
            },
          ]
        : [{ field: "name", value: "Alice" }];
      expect(await adapter.findOne({ model: "user", where })).toMatchObject({
        name: "Alice",
      });
      expect(await adapter.findMany({ model: "user", where })).toHaveLength(1);
      expect(await adapter.count({ model: "user", where })).toBe(1);
      expect(
        await adapter.updateMany({
          model: "user",
          where,
          update: { emailVerified: true },
        })
      ).toBe(1);
      expect(await adapter.findOne({ model: "user", where })).toMatchObject({
        emailVerified: true,
      });
      expect(await adapter.deleteMany({ model: "user", where })).toBe(1);
      expect(await adapter.count({ model: "user", where })).toBe(0);
    }
  );

  it("creates and updates core accounts without an issuer backfill", async () => {
    const { t, adapter } = setup();
    const account = await adapter.create({
      model: "account",
      data: {
        accountId: "subject",
        providerId: "provider-a",
        userId: "user-a",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    await adapter.create({
      model: "account",
      data: {
        accountId: "subject",
        providerId: "provider-b",
        userId: "user-b",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    await adapter.update({
      model: "account",
      where: [{ field: "id", value: account.id }],
      update: { scope: "openid" },
    });
    const accounts = await t.run((ctx) => ctx.db.query("account").collect());
    expect(accounts).toHaveLength(2);
    expect(accounts.every((row) => row.issuer === undefined)).toBe(true);
    expect(accounts.find((row) => row.providerId === "provider-a")?.scope).toBe(
      "openid"
    );
  });
});
