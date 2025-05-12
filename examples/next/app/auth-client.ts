import {
  twoFactorClient,
  magicLinkClient,
  emailOTPClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
    convexClient({
      storage: typeof window !== "undefined" ? localStorage : undefined,
    }),
  ],
});
