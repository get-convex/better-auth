import { type Preloaded, useConvexAuth, useQuery } from "convex/react";
import { type FunctionReference, makeFunctionReference } from "convex/server";
import { jsonToConvex } from "convex/values";
import { Component, useEffect, useMemo, useState } from "react";

export function useConvexPreloadedQuery<
  Query extends FunctionReference<"query">,
>(
  preloadedQuery: Preloaded<Query>,
  { requireAuth = true }: { requireAuth?: boolean } = {}
): Query["_returnType"] {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [preloadExpired, setPreloadExpired] = useState(false);
  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      setPreloadExpired(true);
    }
  }, [requireAuth, isLoading, isAuthenticated]);
  const args = useMemo(
    () => jsonToConvex(preloadedQuery._argsJSON),
    [preloadedQuery._argsJSON]
  ) as Query["_args"];
  const preloadedResult = useMemo(
    () => jsonToConvex(preloadedQuery._valueJSON),
    [preloadedQuery._valueJSON]
  );
  const result = useQuery(
    makeFunctionReference(preloadedQuery._name) as Query,
    requireAuth && !isAuthenticated ? ("skip" as const) : args
  );
  useEffect(() => {
    if (result !== undefined) {
      setPreloadExpired(true);
    }
  }, [result]);
  if (requireAuth) {
    return preloadExpired ? result : preloadedResult;
  }
  return result === undefined ? preloadedResult : result;
}

export const usePreloadedQuery = <Query extends FunctionReference<"query">>(
  preloadedQuery: Preloaded<Query>
): Query["_returnType"] | null => {
  const { isLoading } = useConvexAuth();
  const latestData = useConvexPreloadedQuery(preloadedQuery);
  const [data, setData] = useState(latestData);
  useEffect(() => {
    if (!isLoading) {
      setData(latestData);
    }
  }, [latestData, isLoading]);
  return data;
};

export class ErrorBoundary extends Component<{
  children: React.ReactNode;
  isAuthError?: (error: Error) => boolean;
  onUnauth?: () => void | Promise<void>
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
