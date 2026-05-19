import { describe, expect, it } from "vitest";
import { createSchema } from "./create-schema.js";

describe("createSchema oauth-provider tables", () => {
  it("generates array fields and oauth-provider indexes", async () => {
    const { code } = await createSchema({
      tables: {
        oauthClient: {
          modelName: "oauthClient",
          fields: {
            id: { type: "string" },
            clientId: { type: "string", required: true, unique: true },
            redirectUris: { type: "string[]", required: true },
            scopes: { type: "string[]", required: false },
            userId: {
              type: "string",
              required: false,
              references: { model: "user", field: "id" },
            },
            referenceId: { type: "string", required: false },
          },
        },
        oauthConsent: {
          modelName: "oauthConsent",
          fields: {
            id: { type: "string" },
            clientId: {
              type: "string",
              required: true,
              references: { model: "oauthClient", field: "id" },
            },
            userId: {
              type: "string",
              required: false,
              references: { model: "user", field: "id" },
            },
            referenceId: { type: "string", required: false },
            scopes: { type: "string[]", required: true },
          },
        },
      } as any,
    });

    expect(code).toContain("redirectUris: v.array(v.string())");
    expect(code).toContain(
      "scopes: v.optional(v.union(v.null(), v.array(v.string())))"
    );
    expect(code).toContain('.index("clientId", ["clientId"])');
    expect(code).toContain('.index("referenceId", ["referenceId"])');
    expect(code).toContain(
      '.index("clientId_userId_referenceId", ["clientId","userId","referenceId"])'
    );
  });
});
