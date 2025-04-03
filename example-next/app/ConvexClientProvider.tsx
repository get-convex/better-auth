"use client";

import { ReactNode } from "react";
import { ConvexReactClient, ConvexProviderWithAuth } from "convex/react";
import { useBetterAuth } from "@/app/auth";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  verbose: false,
});

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexProviderWithAuth client={convex} useAuth={useBetterAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}
