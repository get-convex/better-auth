"use client";

import { authClient } from "@/lib/auth-client";
import { useConvexAuth, useQuery } from "convex/react";
import { FunctionReference } from "convex/server";
import { redirect } from "next/navigation";
import { Component, PropsWithChildren, useEffect } from "react";

class ErrorBoundary extends Component<{
  children: React.ReactNode;
  isAuthError?: (error: Error) => boolean;
  unauthRedirectTo?: string;
}> {
  async componentDidCatch(error: Error) {
    const isAuthError =
      this.props.isAuthError ?? ((error) => error.message.match(/auth/i));
    if (isAuthError(error)) {
      await authClient.getSession();
      if (this.props.unauthRedirectTo) {
        redirect(this.props.unauthRedirectTo);
      }
    }
  }
  render() {
    return this.props.children;
  }
}

export const ClientAuthCheck = ({
  children,
  isAuthError,
  unauthRedirectTo = "/",
  userQuery,
}: PropsWithChildren<{
  isAuthError?: (error: Error) => boolean;
  unauthRedirectTo?: string;
  userQuery?: FunctionReference<"query">;
}>) => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(userQuery);
  useEffect(() => {
    (async () => {
      if (!isLoading && !isAuthenticated) {
        await authClient.getSession();
        if (unauthRedirectTo) {
          redirect(unauthRedirectTo);
        }
      }
    })();
  }, [isLoading, isAuthenticated]);
  return (
    <ErrorBoundary
      isAuthError={isAuthError}
      unauthRedirectTo={unauthRedirectTo}
    >
      {children}
    </ErrorBoundary>
  );
};
