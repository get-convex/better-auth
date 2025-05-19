import { ConvexReactClient } from "convex/react";
import isNetworkError from "is-network-error";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { createAuthClient } from "better-auth/react";
import { convexClient, crossDomainClient } from "../client/plugins";
import { BetterAuthClientPlugin, ClientOptions } from "better-auth";

const ConvexAuthInternalContext = createContext<{
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchAccessToken: ({
    forceRefreshToken,
  }: {
    forceRefreshToken: boolean;
  }) => Promise<string | null>;
}>(undefined as any);

export function useAuth() {
  return useContext(ConvexAuthInternalContext);
}

export type ConvexAuthClient = {
  verbose: boolean | undefined;
  logger?: ConvexReactClient["logger"];
};

type CrossDomainClient = ReturnType<typeof crossDomainClient>;
type ConvexClient = ReturnType<typeof convexClient>;
type PluginsWithCrossDomain = (
  | CrossDomainClient
  | ConvexClient
  | BetterAuthClientPlugin
)[];
type PluginsWithoutCrossDomain = (ConvexClient | BetterAuthClientPlugin)[];
type AuthClientWithPlugins<
  Plugins extends PluginsWithCrossDomain | PluginsWithoutCrossDomain,
> = ReturnType<
  typeof createAuthClient<
    ClientOptions & {
      plugins: Plugins;
    }
  >
>;
export type AuthClient =
  | AuthClientWithPlugins<PluginsWithCrossDomain>
  | AuthClientWithPlugins<PluginsWithoutCrossDomain>;

export function AuthProvider({
  client,
  authClient,
  children,
}: {
  client: ConvexAuthClient;
  authClient: AuthClient;
  children: ReactNode;
}) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const verbose: boolean = (client as any).options?.verbose ?? false;
  const logVerbose = useCallback(
    (message: string) => {
      if (verbose) {
        console.debug(`${new Date().toISOString()} ${message}`);
        client.logger?.logVerbose(message);
      }
    },
    [verbose]
  );

  const fetchToken = useCallback(async () => {
    const initialBackoff = 100;
    const maxBackoff = 1000;
    let retries = 0;

    const nextBackoff = () => {
      const baseBackoff = initialBackoff * Math.pow(2, retries);
      retries += 1;
      const actualBackoff = Math.min(baseBackoff, maxBackoff);
      const jitter = actualBackoff * (Math.random() - 0.5);
      return actualBackoff + jitter;
    };

    const fetchWithRetry = async () => {
      try {
        const { data } = await authClient.convex.token();
        return data?.token || null;
      } catch (e) {
        if (!isNetworkError(e)) {
          throw e;
        }
        if (retries > 10) {
          logVerbose(`fetchToken failed with network error, giving up`);
          throw e;
        }
        const backoff = nextBackoff();
        logVerbose(
          `fetchToken failed with network error, attempting retrying in ${backoff}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return fetchWithRetry();
      }
    };

    return fetchWithRetry();
  }, [client]);

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (forceRefreshToken) {
        const token = await fetchToken();
        logVerbose(`returning retrieved token`);
        return token;
      }
      return null;
    },
    [fetchToken]
  );

  useEffect(
    () => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      (async () => {
        // Return early if cross domain plugin is not configured.
        // Apparently there's no sane way to do this type check. Only the in
        // keyword narrows the type effectively but it doesn't work on functions.
        if (!(authClient as any)["crossDomain"]) {
          return;
        }
        const authClientWithCrossDomain =
          authClient as AuthClientWithPlugins<PluginsWithCrossDomain>;
        const url = new URL(window.location.href);
        const token = url.searchParams.get("ott");
        if (token) {
          url.searchParams.delete("ott");
          const result =
            await authClientWithCrossDomain.crossDomain.oneTimeToken.verify({
              token,
            });
          const session = result.data?.session;
          if (session) {
            await authClient.getSession({
              fetchOptions: {
                headers: {
                  Authorization: `Bearer ${session.token}`,
                },
              },
            });
            authClientWithCrossDomain.updateSession();
          }
          window.history.replaceState({}, "", url);
        }
      })();
    },
    // Explicitly chosen dependencies.
    // This effect should mostly only run once
    // on mount.
    [client, authClient]
  );

  const isAuthenticated = session !== null;
  const isLoading = isSessionPending;
  const authState = useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      fetchAccessToken,
    }),
    [fetchAccessToken, isLoading, isAuthenticated]
  );

  return (
    <ConvexAuthInternalContext.Provider value={authState}>
      {children}
    </ConvexAuthInternalContext.Provider>
  );
}
