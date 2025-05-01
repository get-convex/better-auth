import type { BetterAuthClientPlugin, Store } from "better-auth";
import { BetterFetchOption } from "better-auth/client";

const SESSION_STORAGE_KEY = "__better_auth_session";

// Based on portions of the Expo integration
export const convexClient = () => {
  let store: Store | null = null;
  // No localstorage in non-browser environments
  const storage = typeof window === "undefined" ? undefined : localStorage;
  return {
    id: "convex",
    getActions(_, $store) {
      store = $store;
      return {
        /**
         * Notify the session signal.
         *
         * This is used to trigger an update in useSession, generally when a new session
         * token is set.
         *
         * @example
         * ```ts
         * client.notifySessionSignal();
         * ```
         */
        setSession: (sessionToken: string) => {
          storage?.setItem(SESSION_STORAGE_KEY, sessionToken);
          $store.notify("$sessionSignal");
        },
      };
    },
    fetchPlugins: [
      {
        id: "convex",
        name: "Convex",
        hooks: {
          onRequest: async (context) => {
            context.headers.set(
              "Authorization",
              `Bearer ${storage?.getItem(SESSION_STORAGE_KEY)}`
            );
            return context;
          },
          onResponse: async (context) => {
            if (context.response.headers.get("set-auth-token")) {
              storage?.setItem(
                SESSION_STORAGE_KEY,
                context.response.headers.get("set-auth-token")!
              );
              store?.notify("$sessionSignal");
            }
            return context;
          },
        },
        async init(url, options) {
          if (url.includes("/sign-out")) {
            storage?.removeItem(SESSION_STORAGE_KEY);
            store?.atoms.session?.set({
              data: null,
              error: null,
              isPending: false,
            });
          }
          return {
            url,
            options: options as BetterFetchOption,
          };
        },
      },
    ],
  } satisfies BetterAuthClientPlugin;
};
