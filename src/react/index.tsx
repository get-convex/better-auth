import { useEffect } from "react";

import { ReactNode, useCallback, useMemo } from "react";
import { AuthTokenFetcher } from "convex/browser";
import { ConvexProviderWithAuth } from "convex/react";
import { BetterAuthClientPlugin, ClientOptions } from "better-auth";
import { createAuthClient } from "better-auth/react";
import { convexClient, crossDomainClient } from "../client/plugins";

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

// Until we can import from our own entry points (requires TypeScript 4.7),
// just describe the interface enough to help users pass the right type.
type IConvexReactClient = {
  setAuth(fetchToken: AuthTokenFetcher): void;
  clearAuth(): void;
};

/**
 * A wrapper React component which provides a {@link react.ConvexReactClient}
 * authenticated with Better Auth.
 *
 * @public
 */
export function ConvexBetterAuthProvider({
  children,
  client,
  authClient,
}: {
  children: ReactNode;
  client: IConvexReactClient;
  authClient: AuthClient;
}) {
  const useBetterAuth = useUseAuthFromBetterAuth(authClient);

  useEffect(() => {
    (async () => {
      const url = new URL(window.location?.href);
      const token = url.searchParams.get("ott");
      if (token) {
        const authClientWithCrossDomain =
          authClient as AuthClientWithPlugins<PluginsWithCrossDomain>;
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
  }, [authClient]);
  return (
    <ConvexProviderWithAuth client={client} useAuth={useBetterAuth}>
      {children}
    </ConvexProviderWithAuth>
  );
}

function useUseAuthFromBetterAuth(authClient: AuthClient) {
  return useMemo(
    () =>
      function useAuthFromBetterAuth() {
        const { data: session, isPending: isSessionPending } =
          authClient.useSession();
        const sessionId = session?.session.id;
        const fetchAccessToken = useCallback(
          async () => {
            try {
              const { data } = await authClient.convex.token();
              return data?.token || null;
            } catch {
              return null;
            }
          },
          // Build a new fetchAccessToken to trigger setAuth() whenever the
          // session changes.
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [sessionId]
        );
        return useMemo(
          () => ({
            isLoading: isSessionPending,
            isAuthenticated: session !== null,
            fetchAccessToken,
          }),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          [isSessionPending, sessionId, fetchAccessToken]
        );
      },
    [authClient]
  );
}
