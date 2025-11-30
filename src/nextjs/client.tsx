import {
  Authenticated,
  type Preloaded,
  useConvexAuth,
  useQuery,
} from "convex/react";
import { type FunctionReference, makeFunctionReference } from "convex/server";
import { jsonToConvex } from "convex/values";
import {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { AuthClient } from "../react/index.js";

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

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onUnauth: () => void | Promise<void>;
  renderFallback?: () => React.ReactNode;
  isAuthError: (error: unknown) => boolean;
}
interface ErrorBoundaryState {
  error?: unknown;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {};
  }
  static defaultProps: Partial<ErrorBoundaryProps> = {
    renderFallback: () => null,
  };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  async componentDidCatch(error: Error) {
    if (this.props.isAuthError(error)) {
      await this.props.onUnauth();
    }
  }
  render() {
    if (this.state.error && this.props.isAuthError(this.state.error)) {
      return this.props.renderFallback?.();
    }
    return this.props.children;
  }
}

// Subscribe to the session validated user to keep this check reactive to
// actual user auth state at the provider level (rather than just jwt validity state).
const UserSubscription = ({
  getAuthUserFn,
}: {
  getAuthUserFn: FunctionReference<"query">;
}) => {
  useQuery(getAuthUserFn);
  return null;
};

export const AuthCheck = ({
  children,
  onUnauth,
  authClient,
  renderFallback,
  getAuthUserFn,
  isAuthError,
}: PropsWithChildren<{
  onUnauth: () => void | Promise<void>;
  authClient: AuthClient;
  renderFallback?: () => React.ReactNode;
  getAuthUserFn: FunctionReference<"query">;
  isAuthError: (error: unknown) => boolean;
}>) => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const handleUnauth = useCallback(async () => {
    await authClient.getSession();
    await onUnauth();
  }, [onUnauth]);

  useEffect(() => {
    void (async () => {
      if (!isLoading && !isAuthenticated) {
        await handleUnauth();
      }
    })();
  }, [isLoading, isAuthenticated]);

  return (
    <ErrorBoundary
      onUnauth={handleUnauth}
      isAuthError={isAuthError}
      renderFallback={renderFallback}
    >
      <Authenticated>
        <UserSubscription getAuthUserFn={getAuthUserFn} />
      </Authenticated>
      {children}
    </ErrorBoundary>
  );
};
