import { describe, expect, it } from "vitest";
import type { BetterAuthDBSchema } from "better-auth/db";
import { assertRequiredFields } from "./create-api.js";

describe("assertRequiredFields", () => {
  it("resolves renamed models and stored field names", () => {
    const schema = {
      account: {
        modelName: "customAccount",
        fields: {
          issuer: {
            type: "string",
            required: true,
            fieldName: "customIssuer",
          },
        },
      },
    } satisfies BetterAuthDBSchema;

    expect(() => assertRequiredFields(schema, "customAccount", {})).toThrow(
      "Missing required field customAccount.customIssuer"
    );
    expect(() =>
      assertRequiredFields(schema, "customAccount", {
        customIssuer: "https://issuer.example.com",
      })
    ).not.toThrow();
  });
});
