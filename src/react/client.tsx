import { BetterAuthClientPlugin, ClientOptions } from "better-auth/client";
import { jwtClient, oneTimeTokenClient } from "better-auth/client/plugins";
import { createAuthClient as createBetterAuthClient } from "better-auth/react";
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
import { convexClient } from "../client/plugin";

export const createAuthClient = <O extends ClientOptions>(
  options: O
): ReturnType<
  typeof createBetterAuthClient<
    O & {
      fetchOptions: O["fetchOptions"] & {
        auth: {
          type: "Bearer";
          token: () => string | null;
        };
      };
      plugins: O["plugins"] extends BetterAuthClientPlugin[]
        ? [
            ...O["plugins"],
            ReturnType<typeof jwtClient>,
            ReturnType<typeof oneTimeTokenClient>,
            ReturnType<typeof convexClient>,
          ]
        : [
            ReturnType<typeof jwtClient>,
            ReturnType<typeof oneTimeTokenClient>,
            ReturnType<typeof convexClient>,
          ];
    }
  >
> => {
  if (!options?.baseURL) {
    throw new Error(
      `baseURL should be set to your Convex deployment site URL, which ends in "convex.site".`
    );
  }
  return createBetterAuthClient({
    ...options,
    plugins: (options.plugins ?? []).concat(
      jwtClient(),
      oneTimeTokenClient(),
      convexClient()
    ),
  });
};

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

export type ConvexBetterAuthClient = ReturnType<
  typeof createAuthClient<{ baseURL: string }>
>;

export function AuthProvider({
  client,
  authClient,
  children,
}: {
  client: ConvexAuthClient;
  authClient: ConvexBetterAuthClient;
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
        const { data } = await authClient.token();
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
        const url = new URL(window.location.href);
        const token = url.searchParams.get("ott");
        if (token) {
          url.searchParams.delete("ott");
          const result = await authClient.oneTimeToken.verify({ token });
          const session = result.data?.session;
          if (!session) {
            return;
          }
          authClient.setSession(session.token);
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
