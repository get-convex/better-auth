import { createAuthMiddleware, sessionMiddleware } from "better-auth/api";
import {
  BetterAuthPlugin,
  createAuthEndpoint,
  customSession as customSessionPlugin,
  jwt as jwtPlugin,
  bearer as bearerPlugin,
  oidcProvider as oidcProviderPlugin,
} from "better-auth/plugins";
import { omit } from "convex-helpers";
import { z } from "zod";

export const JWT_COOKIE_NAME = "convex_jwt";

export const convex = (
  opts: {
    jwtExpirationSeconds?: number;
    deleteExpiredSessionsOnLogin?: boolean;
  } = {}
) => {
  const {
    jwtExpirationSeconds = 60 * 15,
    deleteExpiredSessionsOnLogin = false,
  } = opts;
  const customSession = customSessionPlugin(async ({ user, session }) => {
    const { userId, ...userData } = omit(user, ["id"]) as typeof user & {
      userId: string;
    };
    return {
      user: { ...userData, id: userId },
      session: {
        ...session,
        userId,
      },
    };
  });
  const oidcProvider = oidcProviderPlugin({
    loginPage: "/not-used",
    metadata: {
      issuer: `${process.env.CONVEX_SITE_URL}`,
      jwks_uri: `${process.env.CONVEX_SITE_URL}/api/auth/convex/jwks`,
    },
  });
  const jwt = jwtPlugin({
    jwt: {
      issuer: `${process.env.CONVEX_SITE_URL}`,
      audience: "convex",
      expirationTime: `${jwtExpirationSeconds}s`,
      getSubject: (session) => {
        // Return the userId from the app user table
        return session.user.userId;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      definePayload: ({ user: { id, userId, image, ...user }, session }) => ({
        ...user,
        sessionId: session.id,
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
    hooks: {
      before: [...bearer.hooks.before],
      after: [
        ...oidcProvider.hooks.after,
        {
          matcher: (ctx) => {
            return (
              deleteExpiredSessionsOnLogin &&
              (ctx.path?.startsWith("/sign-in") ||
                ctx.path?.startsWith("/callback"))
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            // Delete expired sessions at login
            const userId = ctx.context.newSession?.user.id;
            if (!userId) {
              return;
            }
            await ctx.context.adapter.deleteMany({
              model: "session",
              where: [
                {
                  field: "userId",
                  operator: "eq",
                  value: userId,
                  connector: "AND",
                },
                {
                  operator: "lte",
                  field: "expiresAt",
                  value: new Date().getTime(),
                },
              ],
            });
          }),
        },
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
            } catch (err) {
              // no-op, some sign-in calls (eg., when redirecting to 2fa)
              // 401 here
            }
          }),
        },
        {
          matcher: (ctx) => {
            return ctx.path?.startsWith("/sign-out");
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
      getSession: createAuthEndpoint(
        "/get-session",
        {
          method: "GET",
          query: z.optional(
            z.object({
              // If cookie cache is enabled, it will disable the cache
              // and fetch the session from the database
              disableCookieCache: z
                .boolean({
                  description:
                    "Disable cookie cache and fetch session from database",
                })
                .or(z.string().transform((v) => v === "true"))
                .optional(),
              disableRefresh: z
                .boolean({
                  description:
                    "Disable session refresh. Useful for checking session status, without updating the session",
                })
                .optional(),
            })
          ),
          metadata: {
            CUSTOM_SESSION: true,
            openapi: {
              description: "Get custom session data",
              responses: {
                "200": {
                  description: "Success",
                  content: {
                    "application/json": {
                      schema: {
                        type: "array",
                        nullable: true,
                        items: {
                          $ref: "#/components/schemas/Session",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          requireHeaders: true,
        },
        async (ctx) => {
          const response = await customSession.endpoints.getSession({
            ...ctx,
            returnHeaders: false,
          });
          return response;
        }
      ),
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
