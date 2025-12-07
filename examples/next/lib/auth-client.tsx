"use client";

import {
  twoFactorClient,
  magicLinkClient,
  emailOTPClient,
  genericOAuthClient,
  anonymousClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import type { auth } from "@/convex/betterAuth/auth";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { PropsWithChildren } from "react";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import { AuthBoundary } from "@convex-dev/better-auth/react";
import { isAuthError } from "@/lib/utils";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    anonymousClient(),
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
    genericOAuthClient(),
    convexClient(),
  ],
});

export const ClientAuthBoundary = ({ children }: PropsWithChildren) => {
  return (
    <AuthBoundary
      authClient={authClient}
      onUnauth={() => redirect("/sign-in")}
      getAuthUserFn={api.auth.getAuthUser}
      isAuthError={isAuthError}
    >
      {children}
    </AuthBoundary>
  );
};
