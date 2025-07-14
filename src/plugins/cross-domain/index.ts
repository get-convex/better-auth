import { setSessionCookie } from "better-auth/cookies";
import { generateRandomString } from "better-auth/crypto";
import {
  BetterAuthPlugin,
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
      };
    },
    hooks: {
      before: [
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
            return ctx.method === "GET" && ctx.path.startsWith("/verify-email");
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
              (ctx.method === "POST" && ctx.path.startsWith("/link-social")) ||
              ctx.path.startsWith("/send-verification-email") ||
              ctx.path.startsWith("/sign-in/email") ||
              ctx.path.startsWith("/sign-in/social") ||
              ctx.path.startsWith("/sign-in/magic-link") ||
              ctx.path.startsWith("/delete-user") ||
              ctx.path.startsWith("/change-email")
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
          matcher() {
            return true;
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
              ctx.path?.startsWith("/callback") ||
              ctx.path?.startsWith("/oauth2/callback") ||
              ctx.path?.startsWith("/magic-link/verify")
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
          });
          await setSessionCookie(ctx, response);
          return response;
        }
      ),
    },
  } satisfies BetterAuthPlugin;
};
