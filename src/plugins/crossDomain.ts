import { setSessionCookie } from "better-auth/cookies";
import { generateRandomString } from "better-auth/crypto";
import {
  BetterAuthPlugin,
  createAuthEndpoint,
  createAuthMiddleware,
  bearer as bearerPlugin,
  oneTimeToken as oneTimeTokenPlugin,
} from "better-auth/plugins";
import { z } from "zod";

export const crossDomain = () => {
  // We only need bearer to convert the session token to a cookie
  // for cross domain social login, after code verification.
  const bearer = bearerPlugin();
  const oneTimeToken = oneTimeTokenPlugin();
  const schema = {
    user: {
      fields: { userId: { type: "string", required: false, input: false } },
    } as const,
  };
  return {
    id: "cross-domain",
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
    schema,
  } satisfies BetterAuthPlugin;
};
