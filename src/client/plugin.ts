import { generateRandomString } from "better-auth/crypto";
import { BetterAuthPlugin, createAuthMiddleware } from "better-auth/plugins";

export const convex = () => {
  return {
    id: "convex",
    hooks: {
      after: [
        {
          matcher: (ctx) => {
            const ottPaths = ["/callback/"];
            return ottPaths.some((path) => ctx.path.startsWith(path));
          },
          handler: createAuthMiddleware(async (ctx) => {
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
  } satisfies BetterAuthPlugin;
};
