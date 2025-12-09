import { type BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware, sessionMiddleware } from "better-auth/api";
import {
  createAuthEndpoint,
  jwt as jwtPlugin,
  bearer as bearerPlugin,
  oidcProvider as oidcProviderPlugin,
  type Jwk,
} from "better-auth/plugins";
import type { AuthConfig } from "convex/server";

export const JWT_COOKIE_NAME = "convex_jwt";

const getJwksAlg = (authConfig: AuthConfig) => {
  const authProvider = authConfig.providers.find(
    (provider) => provider.applicationID === "convex"
  );
  if (!authProvider) {
    throw new Error("No auth provider found with applicationID 'convex'");
  }
  const isCustomJwt =
    "type" in authProvider && authProvider.type === "customJwt";
  if (isCustomJwt && authProvider.algorithm !== "RS256") {
    throw new Error("Only RS256 is supported for custom JWT with Better Auth");
  }
  return isCustomJwt ? authProvider.algorithm : "EdDSA";
};

export const convex = (opts: {
  jwtExpirationSeconds?: number;
  jwks?: string;
  authConfig: AuthConfig;
  basePath?: string;
  /**
   * @deprecated Use `basePath` instead of `options.basePath`
   */
  options?: { basePath?: string };
}) => {
  const { jwtExpirationSeconds = 60 * 15 } = opts;
  const oidcProvider = oidcProviderPlugin({
    loginPage: "/not-used",
    metadata: {
      issuer: `${process.env.CONVEX_SITE_URL}`,
      jwks_uri: `${process.env.CONVEX_SITE_URL}${opts.options?.basePath ?? "/api/auth"}/convex/jwks`,
    },
  });
  const staticJwks = opts.jwks
    ? (JSON.parse(opts.jwks) as { keys: Jwk[] })
    : undefined;
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
    jwks: {
      keyPairConfig: {
        alg: getJwksAlg(opts.authConfig),
      },
    },
    ...(staticJwks
      ? { adapter: { getJwks: async () => staticJwks.keys } }
      : {}),
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

  const parseSetCookie = (setCookieHeader: string) => {
    return setCookieHeader
      .split(", ")
      .map((cookie) => {
        const semiIdx = cookie.indexOf(";");
        const endIdx = semiIdx === -1 ? cookie.length + 1 : semiIdx;
        return cookie.slice(0, endIdx);
      })
      .join("; ");
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
            return (
              !ctx.context.adapter.options?.isRunMutationCtx &&
              ctx.path === "/get-session"
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            ctx.query = { ...ctx.query, disableRefresh: true };
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
            return Boolean(
              ctx.path.startsWith("/sign-in") ||
                ctx.path.startsWith("/sign-up") ||
                ctx.path.startsWith("/callback") ||
                ctx.path.startsWith("/oauth2/callback") ||
                ctx.path.startsWith("/magic-link/verify") ||
                ctx.path.startsWith("/email-otp/verify-email") ||
                ctx.path.startsWith("/phone-number/verify") ||
                ctx.path.startsWith("/siwe/verify") ||
                (ctx.path.startsWith("/get-session") && ctx.context.session)
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            // Set jwt cookie at login for ssa using set-cookie header
            const setCookie =
              ctx.context.responseHeaders?.get("set-cookie") ?? "";
            if (!setCookie) {
              return;
            }
            try {
              const { token } = await jwt.endpoints.getToken({
                ...ctx,
                method: "GET",
                headers: {
                  cookie: parseSetCookie(setCookie),
                },
                returnHeaders: false,
              });
              const jwtCookie = ctx.context.createAuthCookie(JWT_COOKIE_NAME, {
                maxAge: jwtExpirationSeconds,
              });
              ctx.setCookie(jwtCookie.name, token, jwtCookie.attributes);
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
              ctx.path?.startsWith("/delete-user") ||
              (ctx.path?.startsWith("/get-session") && !ctx.context.session)
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
          const runEndpoint = async () => {
            const response = await jwt.endpoints.getToken({
              ...ctx,
              returnHeaders: false,
            });
            const jwtCookie = ctx.context.createAuthCookie(JWT_COOKIE_NAME, {
              maxAge: jwtExpirationSeconds,
            });
            ctx.setCookie(jwtCookie.name, response.token, jwtCookie.attributes);
            return response;
          };
          try {
            return await runEndpoint();
          } catch (error: any) {
            console.log("error", error);
            console.log("error.code", error?.code);
            // If alg config has changed and no longer matches one or more keys,
            // roll the keys
            if (error?.code === "ERR_JOSE_NOT_SUPPORTED") {
              await ctx.context.adapter.deleteMany({
                model: "jwks",
                where: [],
              });
            }
            return await runEndpoint();
          }
        }
      ),
    },
    schema,
  } satisfies BetterAuthPlugin;
};
