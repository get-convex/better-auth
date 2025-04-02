import { authClient } from "./auth-client";
import { useCallback, useMemo, useRef } from "react";

export const useBetterAuth = (): {
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchAccessToken: (args: {
    forceRefreshToken: boolean;
  }) => Promise<string | null>;
} => {
  const {
    data: session,
    isPending: isSessionPending,
    //error, //error object
    //refetch, //refetch the session
  } = authClient.useSession();
  const tokenRef = useRef<string | null>(null);
  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (forceRefreshToken) {
        // Here you can do whatever transformation to get the ID Token
        // or null
        // Make sure to fetch a new token when `forceRefreshToken` is true
        const { data } = await authClient.token();
        tokenRef.current = data?.token || null;
        return data?.token || null;
      }
      return tokenRef.current;
    },
    [],
  );
  return useMemo(
    () => ({
      // Whether the auth provider is in a loading state
      isLoading: isSessionPending,
      // Whether the auth provider has the user signed in
      isAuthenticated: Boolean(session),
      // The async function to fetch the ID token
      fetchAccessToken,
    }),
    [isSessionPending, session, fetchAccessToken],
  );
};
