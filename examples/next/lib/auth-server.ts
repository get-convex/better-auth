import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const { handler, preloadQuery, isAuthenticated, getToken } =
  convexBetterAuthNextJs({
    jwtCache: {
      enabled: true,
    },
  });
