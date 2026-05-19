import { describe, expect, it } from "vitest";
import { oAuthProtectedResourceMetadata, withMcpAuth } from "./index.js";

describe("MCP helpers", () => {
  it("returns a WWW-Authenticate challenge for missing bearer tokens", async () => {
    const handler = withMcpAuth(
      {
        verifyOptions: {
          issuer: "https://auth.example.com",
          audience: "https://api.example.com/mcp",
        },
        jwksUrl: "https://auth.example.com/jwks",
      },
      async () => new Response("ok")
    );

    const response = await handler(
      new Request("https://api.example.com/mcp", { method: "POST" })
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("WWW-Authenticate")).toContain(
      "oauth-protected-resource"
    );
    expect(response.headers.get("Access-Control-Expose-Headers")).toBe(
      "WWW-Authenticate"
    );
  });

  it("returns OAuth protected resource metadata", async () => {
    const handler = oAuthProtectedResourceMetadata({
      resource: "https://api.example.com/mcp",
      authorizationServers: ["https://auth.example.com"],
      scopesSupported: ["openid", "mcp:tools"],
    });

    const response = await handler();

    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toEqual({
      resource: "https://api.example.com/mcp",
      authorization_servers: ["https://auth.example.com"],
      scopes_supported: ["openid", "mcp:tools"],
      bearer_methods_supported: ["header"],
    });
  });
});
