import type { BetterAuthPlugin } from "better-auth";
import { setSessionCookie } from "better-auth/cookies";
import { generateRandomString } from "better-auth/crypto";
import {
  createAuthEndpoint,
  createAuthMiddleware,
  oneTimeToken as oneTimeTokenPlugin,
} from "better-auth/plugins";
import { z } from "zod";

export const crossDomain = ({ siteUrl }: { siteUrl: string }) => {
  const oneTimeToken = oneTimeTokenPlugin();

  const rewriteCallbackURL = (callbackURL?: string) => {
    if (callbackURL && !callbackURL.startsWith("/")) {
      return callbackURL;
    }
    const relativeCallbackURL = callbackURL || "/";
    return new URL(relativeCallbackURL, siteUrl).toString();
  };

  const isExpoNative = (ctx: { headers?: Headers }) => {
    return ctx.headers?.has("expo-origin");
  };

  return {
    id: "cross-domain",
    // TODO: remove this in the next minor release, it doesn't
    // actually affect ctx.trustedOrigins. cors allowedOrigins
    // is using it, via options.trustedOrigins, though, so it's
    // a breaking change.
    init() {
      return {
        options: {
          trustedOrigins: [siteUrl],
        },
        context: {
          oauthConfig: {
            storeStateStrategy: "database",
            // We could fake the cookie by sending a header, but it would need
            // to be set on a 302 redirect from the identity provider, and we
            // don't have a way to do that. This only means we can't stop an
            // oauth flow that started in one browser from continuing in
            // another. We still verify the state token from the query string
            // against the database.
            skipStateCookieCheck: true,
          },
        },
      };
    },
    hooks: {
      before: [
        {
          matcher(ctx) {
            return (
              Boolean(
                ctx.request?.headers.get("better-auth-cookie") ||
                  ctx.headers?.get("better-auth-cookie")
              ) && !isExpoNative(ctx)
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            const existingHeaders = (ctx.request?.headers ||
              ctx.headers) as Headers;
            const headers = new Headers({
              ...Object.fromEntries(existingHeaders?.entries()),
            });
            // Skip if the request has an authorization header
            if (headers.get("authorization")) {
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
        {
          matcher: (ctx) => {
            return (
              ctx.method === "GET" &&
              ctx.path.startsWith("/verify-email") &&
              !isExpoNative(ctx)
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            if (ctx.query?.callbackURL) {
              ctx.query.callbackURL = rewriteCallbackURL(ctx.query.callbackURL);
            }
            return { context: ctx };
          }),
        },
        {
          matcher: (ctx) => {
            return (
              ((ctx.method === "POST" && ctx.path.startsWith("/link-social")) ||
                ctx.path.startsWith("/send-verification-email") ||
                ctx.path.startsWith("/sign-in/email") ||
                ctx.path.startsWith("/sign-in/social") ||
                ctx.path.startsWith("/sign-in/magic-link") ||
                ctx.path.startsWith("/delete-user") ||
                ctx.path.startsWith("/change-email")) &&
              !isExpoNative(ctx)
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            const isSignIn = ctx.path.startsWith("/sign-in");
            ctx.body.callbackURL = rewriteCallbackURL(ctx.body.callbackURL);
            if (isSignIn && ctx.body.newUserCallbackURL) {
              ctx.body.newUserCallbackURL = rewriteCallbackURL(
                ctx.body.newUserCallbackURL
              );
            }
            if (isSignIn && ctx.body.errorCallbackURL) {
              ctx.body.errorCallbackURL = rewriteCallbackURL(
                ctx.body.errorCallbackURL
              );
            }
            return { context: ctx };
          }),
        },
      ],
      after: [
        {
          matcher(ctx) {
            return !isExpoNative(ctx);
          },
          handler: createAuthMiddleware(async (ctx) => {
            const setCookie = ctx.context.responseHeaders?.get("set-cookie");
            if (!setCookie) {
              return;
            }
            ctx.context.responseHeaders?.delete("set-cookie");
            ctx.setHeader("Set-Better-Auth-Cookie", setCookie);
          }),
        },
        {
          matcher: (ctx) => {
            return (
              (ctx.path?.startsWith("/callback") ||
                ctx.path?.startsWith("/oauth2/callback") ||
                ctx.path?.startsWith("/magic-link/verify")) &&
              !isExpoNative(ctx)
            );
          },
          handler: createAuthMiddleware(async (ctx) => {
            // Mostly copied from the one-time-token plugin
            const session = ctx.context.newSession;
            if (!session) {
              ctx.context.logger.error("No session found");
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
              ctx.context.logger.error("No redirect to found");
              return;
            }
            const url = new URL(redirectTo);
            url.searchParams.set("ott", token);
            throw ctx.redirect(url.toString());
          }),
        },
      ],
    },
    endpoints: {
      verifyOneTimeToken: createAuthEndpoint(
        "/cross-domain/one-time-token/verify",
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
            returnStatus: false,
          });
          await setSessionCookie(ctx, response);
          return response;
        }
      ),
    },
  } satisfies BetterAuthPlugin;
};
