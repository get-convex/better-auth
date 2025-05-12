import { sessionMiddleware } from "better-auth/api";
import { setSessionCookie } from "better-auth/cookies";
import { generateRandomString } from "better-auth/crypto";
import {
  BetterAuthPlugin,
  createAuthEndpoint,
  createAuthMiddleware,
  customSession as customSessionPlugin,
  jwt as jwtPlugin,
  bearer as bearerPlugin,
  oidcProvider as oidcProviderPlugin,
  oneTimeToken as oneTimeTokenPlugin,
} from "better-auth/plugins";
import { omit } from "convex-helpers";
import { z } from "zod";

export const convex = () => {
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
      jwks_uri: `${process.env.CONVEX_SITE_URL}/api/auth/convex/jwks`,
    },
  });
  const jwt = jwtPlugin({
    jwt: {
      issuer: `${process.env.CONVEX_SITE_URL}`,
      audience: "convex",
      getSubject: (session) => {
        // Return the userId from the app user table
        return session.user.userId;
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      definePayload: ({ user: { id, userId, ...user }, session }) => ({
        ...user,
        sessionId: session.id,
      }),
    },
  });
  // We only need bearer to convert the session token to a cookie
  // for cross domain social login, after code verification.
  const bearer = bearerPlugin();
  const oneTimeToken = oneTimeTokenPlugin();
  const schema = {
    user: {
      fields: { userId: { type: "string", required: false, input: false } },
    } as const,
    ...jwt.schema,
  };
  return {
    id: "convex",
    hooks: {
      before: [
        ...bearer.hooks.before,
        {
          matcher(context) {
            return Boolean(
              context.request?.headers.get("better-auth-cookie") ||
                context.headers?.get("better-auth-cookie")
            );
          },
          handler: createAuthMiddleware(async (c) => {
            const existingHeaders = (c.request?.headers ||
              c.headers) as Headers;
            const headers = new Headers({
              ...Object.fromEntries(existingHeaders?.entries()),
            });
            // Skip if the request has an authorization header
            if (headers.get("authorization")) {
              console.log("skipping hook");
              return;
            }
            const cookie = headers.get("better-auth-cookie");
            if (!cookie) {
              return;
            }
            headers.append("cookie", cookie);
            return {
              context: {
                headers,
              },
            };
          }),
        },
      ],
      after: [
        {
          matcher() {
            return true;
          },
          handler: createAuthMiddleware(async (ctx) => {
            const setCookie = ctx.context.responseHeaders?.get("set-cookie");
            if (!setCookie) {
              return;
            }
            ctx.setHeader("Set-Better-Auth-Cookie", setCookie);
          }),
        },
        {
          matcher: (ctx) => {
            return (
              ctx.path?.startsWith("/callback") ||
              ctx.path?.startsWith("/oauth2/callback")
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            // Mostly copied from the one-time-token plugin
            const session = ctx.context.newSession;
            if (!session) {
              console.error("No session found");
              return;
            }
            const token = generateRandomString(32);
            const expiresAt = new Date(Date.now() + 3 * 60 * 1000);
            await ctx.context.internalAdapter.createVerificationValue({
              value: session.session.token,
              identifier: `one-time-token:${token}`,
              expiresAt,
            });
            const redirectTo = ctx.context.responseHeaders?.get("location");
            if (!redirectTo) {
              console.error("No redirect to found");
              return;
            }
            const url = new URL(redirectTo);
            url.searchParams.set("ott", token);
            throw ctx.redirect(url.toString());
          }),
        },
        ...oidcProvider.hooks.after,
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
            returnHeaders: true,
          });
          console.log("custom session headers", ...response.headers.entries());
          return response.response;
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
          return response;
        }
      ),
      verifyOneTimeToken: createAuthEndpoint(
        "/convex/one-time-token/verify",
        {
          method: "POST",
          body: z.object({
            token: z.string(),
          }),
        },
        async (ctx) => {
          const response = await oneTimeToken.endpoints.verifyOneTimeToken({
            ...ctx,
            returnHeaders: false,
          });
          await setSessionCookie(ctx, response);
          return response;
        }
      ),
    },
    schema,
  } satisfies BetterAuthPlugin;
};
