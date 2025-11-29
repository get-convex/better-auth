"use client";

import { authClient } from "@/lib/auth-client";
import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export const AuthCheck = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  useEffect(() => {
    (async () => {
      if (!isLoading && !isAuthenticated) {
        try {
          await authClient.convex.unsetToken();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // noop
        }
        redirect("/sign-in");
      }
    })();
  }, [isLoading, isAuthenticated]);
  return null;
};
