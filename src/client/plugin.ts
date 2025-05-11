import { sessionMiddleware } from "better-auth/api";
import { generateRandomString } from "better-auth/crypto";
import {
  BetterAuthPlugin,
  createAuthEndpoint,
  createAuthMiddleware,
  customSession as customSessionPlugin,
  jwt as jwtPlugin,
  oidcProvider as oidcProviderPlugin,
  oneTimeToken as oneTimeTokenPlugin,
  bearer as bearerPlugin,
} from "better-auth/plugins";
import { omit } from "convex-helpers";
import { z } from "zod";

export const convex = () => {
  const customSession = customSessionPlugin(async ({ user, session }) => {
    const userData = omit(user, ["id"]) as typeof user & {
      userId: string;
    };
    return {
      user: userData,
      session: {
        ...session,
        userId: userData.userId as string,
      },
    };
  });
  const oidcProvider = oidcProviderPlugin({
    loginPage: "/not-used",
    metadata: {
      jwks_uri: "/convex/jwks",
    },
  });
  const bearer = bearerPlugin();
  const jwt = jwtPlugin({
    jwt: {
      issuer: `${process.env.CONVEX_SITE_URL}`,
      audience: "convex",
      getSubject: (session) => session.user.userId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      definePayload: ({ user: { id, userId, ...user } }) => user,
    },
  });
  const oneTimeToken = oneTimeTokenPlugin();
  const beforeHooks = [...bearer.hooks.before];
  const afterHooks = [
    ...bearer.hooks.after,
    ...oidcProvider.hooks.after,
    ...jwt.hooks.after,
  ];
  const schema = jwt.schema;
  return {
    id: "convex",
    hooks: {
      before: beforeHooks,
      after: [
        {
          matcher: (ctx) => {
            const ottPaths = ["/callback/"];
            return ottPaths.some((path) => ctx.path.startsWith(path));
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
        ...afterHooks,
      ],
    },
    endpoints: {
      getSession: createAuthEndpoint(
        "/get-session",
        {
          method: "GET",
          query: z.optional(
            z.object({
              /**
               * If cookie cache is enabled, it will disable the cache
               * and fetch the session from the database
               */
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
          const response = await customSession.endpoints.getSession(ctx);
          console.log("getSession response", response);
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
          const response = await oidcProvider.endpoints.getOpenIdConfig(ctx);
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
          const response = await jwt.endpoints.getJwks(ctx);
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
          const response = await jwt.endpoints.getToken(ctx);
          console.log("getToken response", response);
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
        async (c) => {
          const response = await oneTimeToken.endpoints.verifyOneTimeToken(c);
          console.log("verifyOneTimeToken response", response);
          return response;
        }
      ),
    },
    init: () => {
      return {
        options: {
          user: {
            additionalFields: {
              userId: {
                type: "string",
                required: true,
                input: false,
              },
            },
          },
          advanced: {
            database: {
              generateId: false,
            },
          },
        },
      };
    },
    schema,
  } satisfies BetterAuthPlugin;
};
