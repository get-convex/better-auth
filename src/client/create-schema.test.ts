import { describe, expect, it } from "vitest";
import type { BetterAuthDBSchema } from "better-auth/db";
import { createSchema } from "./create-schema.js";

describe("createSchema", () => {
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
      '.index("accountId_issuer", ["accountId","issuer"])'
    );
    expect(indexFields).toEqual(["issuer", "accountId"]);
  });
});
