import { createAuthMiddleware, sessionMiddleware } from "better-auth/api";
import {
  BetterAuthPlugin,
  createAuthEndpoint,
  jwt as jwtPlugin,
  bearer as bearerPlugin,
  oidcProvider as oidcProviderPlugin,
} from "better-auth/plugins";

export const JWT_COOKIE_NAME = "convex_jwt";

export const convex = (
  opts: {
    jwtExpirationSeconds?: number;
    deleteExpiredSessionsOnLogin?: boolean;
    options?: { basePath?: string };
  } = {}
) => {
  const { jwtExpirationSeconds = 60 * 15 } = opts;
  const oidcProvider = oidcProviderPlugin({
    loginPage: "/not-used",
    metadata: {
      issuer: `${process.env.CONVEX_SITE_URL}`,
      jwks_uri: `${process.env.CONVEX_SITE_URL}${opts.options?.basePath ?? "/api/auth"}/convex/jwks`,
    },
  });
  const jwt = jwtPlugin({
    jwt: {
      issuer: `${process.env.CONVEX_SITE_URL}`,
      audience: "convex",
      expirationTime: `${jwtExpirationSeconds}s`,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      definePayload: ({ user: { id, image, ...user }, session }) => ({
        ...user,
        sessionId: session.id,
        iat: Math.floor(new Date().getTime() / 1000),
      }),
    },
  });
  // Bearer plugin converts the session token to a cookie
  // for cross domain social login after code verification,
  // and is required for the headers() helper to work.
  const bearer = bearerPlugin();
  const schema = {
    user: {
      fields: { userId: { type: "string", required: false, input: false } },
    } as const,
    ...jwt.schema,
  };
  return {
    id: "convex",
    init: ({ logger, options }) => {
      if (
        options.plugins?.every((p) => p.id !== "cross-domain") &&
        !options.baseURL
      ) {
        logger.warn(
          "Better Auth baseURL is undefined. This is probably a mistake."
        );
      }
    },
    hooks: {
      before: [
        ...bearer.hooks.before,
        // Don't attempt to refresh the session with a query ctx
        {
          matcher: (ctx) => {
            const result =
              !ctx.context.adapter.options?.isRunMutationCtx &&
              ctx.path === "/get-session";
            console.log("matching result", result);
            return result;
          },
          handler: createAuthMiddleware(async (ctx) => {
            ctx.query = { ...ctx.query, disableRefresh: true };
            console.log("ctx.query", ctx.query);
            ctx.context.internalAdapter.deleteSession = async (
              ..._args: any[]
            ) => {
              //skip
            };
            return { context: ctx };
          }),
        },
      ],
      after: [
        ...oidcProvider.hooks.after,
        {
          matcher: (ctx) => {
            return (
              ctx.path.startsWith("/sign-in") ||
              ctx.path.startsWith("/sign-up") ||
              ctx.path.startsWith("/callback") ||
              ctx.path.startsWith("/oauth2/callback") ||
              ctx.path.startsWith("/magic-link/verify") ||
              ctx.path.startsWith("/email-otp/verify-email") ||
              ctx.path.startsWith("/phone-number/verify")
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            // Set jwt cookie at login for ssa
            const cookie = ctx.context.responseHeaders?.get("set-cookie") ?? "";
            if (!cookie) {
              return;
            }
            try {
              const { token } = await jwt.endpoints.getToken({
                ...ctx,
                method: "GET",
                headers: {
                  cookie,
                },
                returnHeaders: false,
              });
              const jwtCookie = ctx.context.createAuthCookie(JWT_COOKIE_NAME, {
                maxAge: jwtExpirationSeconds,
              });
              ctx.setCookie(jwtCookie.name, token, jwtCookie.attributes);
            } catch (_err) {
              // no-op, some sign-in calls (eg., when redirecting to 2fa)
              // 401 here
            }
          }),
        },
        {
          matcher: (ctx) => {
            return (
              ctx.path?.startsWith("/sign-out") ||
              ctx.path?.startsWith("/delete-user")
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            const jwtCookie = ctx.context.createAuthCookie(JWT_COOKIE_NAME, {
              maxAge: 0,
            });
            ctx.setCookie(jwtCookie.name, "", jwtCookie.attributes);
          }),
        },
      ],
    },
    endpoints: {
      getOpenIdConfig: createAuthEndpoint(
        "/convex/.well-known/openid-configuration",
        {
          method: "GET",
          metadata: {
            isAction: false,
          },
        },
        async (ctx) => {
          const response = await oidcProvider.endpoints.getOpenIdConfig({
            ...ctx,
            returnHeaders: false,
          });
          return response;
        }
      ),
      getJwks: createAuthEndpoint(
        "/convex/jwks",
        {
          method: "GET",
          metadata: {
            openapi: {
              description: "Get the JSON Web Key Set",
              responses: {
                "200": {
                  description: "JSON Web Key Set retrieved successfully",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          keys: {
                            type: "array",
                            description: "Array of public JSON Web Keys",
                            items: {
                              type: "object",
                              properties: {
                                kid: {
                                  type: "string",
                                  description:
                                    "Key ID uniquely identifying the key, corresponds to the 'id' from the stored Jwk",
                                },
                                kty: {
                                  type: "string",
                                  description:
                                    "Key type (e.g., 'RSA', 'EC', 'OKP')",
                                },
                                alg: {
                                  type: "string",
                                  description:
                                    "Algorithm intended for use with the key (e.g., 'EdDSA', 'RS256')",
                                },
                                use: {
                                  type: "string",
                                  description:
                                    "Intended use of the public key (e.g., 'sig' for signature)",
                                  enum: ["sig"],
                                  nullable: true,
                                },
                                n: {
                                  type: "string",
                                  description:
                                    "Modulus for RSA keys (base64url-encoded)",
                                  nullable: true,
                                },
                                e: {
                                  type: "string",
                                  description:
                                    "Exponent for RSA keys (base64url-encoded)",
                                  nullable: true,
                                },
                                crv: {
                                  type: "string",
                                  description:
                                    "Curve name for elliptic curve keys (e.g., 'Ed25519', 'P-256')",
                                  nullable: true,
                                },
                                x: {
                                  type: "string",
                                  description:
                                    "X coordinate for elliptic curve keys (base64url-encoded)",
                                  nullable: true,
                                },
                                y: {
                                  type: "string",
                                  description:
                                    "Y coordinate for elliptic curve keys (base64url-encoded)",
                                  nullable: true,
                                },
                              },
                              required: ["kid", "kty", "alg"],
                            },
                          },
                        },
                        required: ["keys"],
                      },
                    },
                  },
                },
              },
            },
          },
        },
        async (ctx) => {
          const response = await jwt.endpoints.getJwks({
            ...ctx,
            returnHeaders: false,
          });
          return response;
        }
      ),
      getToken: createAuthEndpoint(
        "/convex/token",
        {
          method: "GET",
          requireHeaders: true,
          use: [sessionMiddleware],
          metadata: {
            openapi: {
              description: "Get a JWT token",
              responses: {
                200: {
                  description: "Success",
                  content: {
                    "application/json": {
                      schema: {
                        type: "object",
                        properties: {
                          token: {
                            type: "string",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        async (ctx) => {
          const response = await jwt.endpoints.getToken({
            ...ctx,
            returnHeaders: false,
          });
          const jwtCookie = ctx.context.createAuthCookie(JWT_COOKIE_NAME, {
            maxAge: jwtExpirationSeconds,
          });
          ctx.setCookie(jwtCookie.name, response.token, jwtCookie.attributes);
          return response;
        }
      ),
    },
    schema,
  } satisfies BetterAuthPlugin;
};
