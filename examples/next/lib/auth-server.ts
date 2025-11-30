import { isAuthError } from "@/lib/utils";
import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const {
  handler,
  preloadQuery,
  isAuthenticated,
  getToken,
  fetchQuery,
  fetchMutation,
  fetchAction,
} = convexBetterAuthNextJs(process.env.NEXT_PUBLIC_CONVEX_SITE_URL!, {
  jwtCache: {
    enabled: true,
    isAuthError,
  },
});
