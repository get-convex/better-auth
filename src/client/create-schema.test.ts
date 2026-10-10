import { describe, expect, it } from "vitest";
import type { BetterAuthDBSchema } from "better-auth/db";
import { createSchema } from "./create-schema.js";

describe("createSchema", () => {
  it("generates the Better Auth credential account lookup index", async () => {
    const tables = {
      account: {
        modelName: "account",
        fields: {
          userId: {
            type: "string",
            required: true,
            references: { field: "id", model: "user" },
          },
          providerId: { type: "string", required: true },
          issuer: { type: "string", required: true },
          accountId: { type: "string", required: true },
        },
      },
    } satisfies BetterAuthDBSchema;

    const { code } = await createSchema({ tables });

    expect(code).toContain(
      '.index("userId_providerId_issuer_accountId", ["userId","providerId","issuer","accountId"])'
    );
    expect(code).toContain('.index("userId", ["userId"])');
  });

  it("generates table-level compound indexes without mutating their order", async () => {
    const indexFields = ["issuer", "accountId"] as [string, ...string[]];
    const tables = {
      account: {
        modelName: "account",
        fields: {
          issuer: { type: "string", required: true },
          accountId: { type: "string", required: true },
        },
        indexes: [{ fields: indexFields, unique: true }],
      },
    } satisfies BetterAuthDBSchema;

    const { code } = await createSchema({ tables });

    expect(code).toContain(
      '.index("issuer_accountId", ["issuer","accountId"])'
    );
    expect(indexFields).toEqual(["issuer", "accountId"]);
  });

  it("does not add a standalone index covered by a compound prefix", async () => {
    const tables = {
      user: {
        modelName: "user",
        fields: {
          email: { type: "string", required: true, unique: true },
          name: { type: "string", required: true },
        },
      },
    } satisfies BetterAuthDBSchema;

    const { code } = await createSchema({ tables });

    expect(code).toContain('.index("email_name", ["email","name"])');
    expect(code).not.toContain('.index("email", ["email"])');
  });

  it("keeps reversed compound indexes distinct", async () => {
    const tables = {
      account: {
        modelName: "account",
        fields: {
          issuer: { type: "string", required: true },
          accountId: { type: "string", required: true },
        },
        indexes: [
          { fields: ["issuer", "accountId"], unique: true },
          { fields: ["accountId", "issuer"], unique: false },
        ],
      },
    } satisfies BetterAuthDBSchema;

    const { code } = await createSchema({ tables });

    expect(code).toContain(
      '.index("issuer_accountId", ["issuer","accountId"])'
    );
    expect(code).toContain(
      '.index("accountId_issuer", ["accountId","issuer"])'
    );
  });
});
