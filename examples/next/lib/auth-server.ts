import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const { handler, getToken } = convexBetterAuthNextJs({
  jwtCache: {
    enabled: true,
  },
});
