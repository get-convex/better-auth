import { describe, expect, it } from "vitest";
import type { AuthConfig } from "convex/server";
import { convex } from "./index.js";

const authConfig = {
  providers: [{ applicationID: "convex", domain: "https://example.com" }],
} satisfies AuthConfig;

const getJwtSetCookieMatcher = () => {
  const plugin = convex({ authConfig });
  const afterHooks = plugin.hooks?.after ?? [];
  const matcher = afterHooks.find((hook) => {
    return (
      hook.matcher({
        path: "/sign-in/email",
        context: { session: { id: "s1" } },
      } as unknown as Parameters<typeof hook.matcher>[0]) &&
      !hook.matcher({
        path: "/sign-out",
        context: { session: null },
      } as unknown as Parameters<typeof hook.matcher>[0])
    );
  })?.matcher;
  if (!matcher) {
    throw new Error("Failed to find Convex JWT set-cookie after hook matcher");
  }
  return matcher;
};

const getJwtClearCookieMatcher = () => {
  const plugin = convex({ authConfig });
  const afterHooks = plugin.hooks?.after ?? [];
  const matcher = afterHooks.find((hook) => {
    return (
      hook.matcher({
        path: "/sign-out",
        context: { session: null },
      } as unknown as Parameters<typeof hook.matcher>[0]) &&
      !hook.matcher({
        path: "/sign-in/email",
        context: { session: { id: "s1" } },
      } as unknown as Parameters<typeof hook.matcher>[0])
    );
  })?.matcher;
  if (!matcher) {
    throw new Error("Failed to find Convex JWT clear-cookie after hook matcher");
  }
  return matcher;
};

describe("convex plugin JWT cookie refresh matcher", () => {
  it("matches update-session", () => {
    const matcher = getJwtSetCookieMatcher();
    type MatcherContext = Parameters<typeof matcher>[0];
    const ctx = {
      path: "/update-session",
      context: { session: { id: "s1" } },
    };
    expect(matcher(ctx as unknown as MatcherContext)).toBe(true);
  });

  it("matches get-session only when a session exists", () => {
    const matcher = getJwtSetCookieMatcher();
    type MatcherContext = Parameters<typeof matcher>[0];
    const withSessionCtx = {
      path: "/get-session",
      context: { session: { id: "s1" } },
    };
    const withoutSessionCtx = {
      path: "/get-session",
      context: { session: null },
    };
    expect(matcher(withSessionCtx as unknown as MatcherContext)).toBe(true);
    expect(matcher(withoutSessionCtx as unknown as MatcherContext)).toBe(false);
  });
});

describe("convex plugin JWT cookie clearing matcher", () => {
  it("matches oauth2 end-session", () => {
    const matcher = getJwtClearCookieMatcher();
    type MatcherContext = Parameters<typeof matcher>[0];
    const ctx = {
      path: "/oauth2/end-session",
      context: { session: null },
    };
    expect(matcher(ctx as unknown as MatcherContext)).toBe(true);
  });
});

describe("convex plugin OAuth provider options", () => {
  it("defaults to an inert login page unless OAuth is configured", () => {
    const plugin = convex({ authConfig });
    expect(plugin.options?.oauthProvider.loginPage).toBe("/not-used");
  });

  it("allows overriding the OAuth login page", () => {
    const plugin = convex({
      authConfig,
      oauthProvider: { loginPage: "https://app.example.com/sign-in" },
    });
    expect(plugin.options?.oauthProvider.loginPage).toBe(
      "https://app.example.com/sign-in"
    );
  });
});

describe("convex plugin OAuth metadata", () => {
  it("uses the Convex site URL for issuer and endpoints", async () => {
    const originalConvexSiteUrl = process.env.CONVEX_SITE_URL;
    process.env.CONVEX_SITE_URL = "https://deployment.convex.site";
    try {
      const plugin = convex({ authConfig });
      const getOAuthServerConfig = plugin.endpoints?.getOAuthServerConfig;
      expect(getOAuthServerConfig).toBeDefined();

      const response = await getOAuthServerConfig!({
        context: {
          baseURL: "https://app.example.com",
          getPlugin(pluginId: string) {
            if (pluginId !== "jwt") {
              return null;
            }
            return {
              options: {
                jwt: {
                  issuer: "https://deployment.convex.site",
                },
                jwks: {
                  jwksPath: "/convex/jwks",
                  keyPairConfig: { alg: "RS256" },
                },
              },
            };
          },
        },
        asResponse: false,
        returnHeaders: false,
        returnStatus: false,
      } as any);

      expect(response).toMatchObject({
        issuer: "https://deployment.convex.site",
        authorization_endpoint:
          "https://deployment.convex.site/api/auth/oauth2/authorize",
        token_endpoint: "https://deployment.convex.site/api/auth/oauth2/token",
        jwks_uri: "https://deployment.convex.site/api/auth/convex/jwks",
      });
    } finally {
      if (originalConvexSiteUrl === undefined) {
        delete process.env.CONVEX_SITE_URL;
      } else {
        process.env.CONVEX_SITE_URL = originalConvexSiteUrl;
      }
    }
  });

  it("uses the configured auth basePath for OAuth endpoints", async () => {
    const originalConvexSiteUrl = process.env.CONVEX_SITE_URL;
    process.env.CONVEX_SITE_URL = "https://deployment.convex.site";
    try {
      const plugin = convex({
        authConfig,
        options: {
          basePath: "/custom/auth",
        } as any,
      });
      const getOAuthServerConfig = plugin.endpoints?.getOAuthServerConfig;
      expect(getOAuthServerConfig).toBeDefined();

      const response = await getOAuthServerConfig!({
        context: {
          baseURL: "https://app.example.com",
          getPlugin(pluginId: string) {
            if (pluginId !== "jwt") {
              return null;
            }
            return {
              options: {
                jwt: {
                  issuer: "https://deployment.convex.site",
                },
                jwks: {
                  jwksPath: "/convex/jwks",
                  keyPairConfig: { alg: "RS256" },
                },
              },
            };
          },
        },
        asResponse: false,
        returnHeaders: false,
        returnStatus: false,
      } as any);

      expect(response).toMatchObject({
        issuer: "https://deployment.convex.site",
        authorization_endpoint:
          "https://deployment.convex.site/custom/auth/oauth2/authorize",
        token_endpoint:
          "https://deployment.convex.site/custom/auth/oauth2/token",
        jwks_uri: "https://deployment.convex.site/custom/auth/convex/jwks",
      });
    } finally {
      if (originalConvexSiteUrl === undefined) {
        delete process.env.CONVEX_SITE_URL;
      } else {
        process.env.CONVEX_SITE_URL = originalConvexSiteUrl;
      }
    }
  });
});
