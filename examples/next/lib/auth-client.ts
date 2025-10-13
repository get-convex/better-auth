import {
  twoFactorClient,
  magicLinkClient,
  emailOTPClient,
  genericOAuthClient,
  anonymousClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/convex/betterAuth/auth";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { ClientOptions } from "better-auth";

export const clientOptions = {
  plugins: [
    inferAdditionalFields<typeof auth>(),
    anonymousClient(),
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
    genericOAuthClient(),
    convexClient(),
  ],
} satisfies ClientOptions;

export const authClient = createAuthClient(clientOptions);
