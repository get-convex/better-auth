import type { BetterAuthClientPlugin, ClientStore } from "better-auth";
import type { BetterFetchOption } from "@better-fetch/fetch";
import type { crossDomain } from "./index.js";

interface CookieAttributes {
  value: string;
  expires?: Date;
  "max-age"?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

export function parseSetCookieHeader(
  header: string
): Map<string, CookieAttributes> {
  const cookieMap = new Map<string, CookieAttributes>();
  const cookies = header.split(", ");
  cookies.forEach((cookie) => {
    const [nameValue, ...attributes] = cookie.split("; ");
    const [name, value] = nameValue.split("=");

    const cookieObj: CookieAttributes = { value };

    attributes.forEach((attr) => {
      const [attrName, attrValue] = attr.split("=");
      cookieObj[attrName.toLowerCase() as "value"] = attrValue;
    });

    cookieMap.set(name, cookieObj);
  });

  return cookieMap;
}

interface StoredCookie {
  value: string;
  expires: Date | null;
}

export function getSetCookie(header: string, prevCookie?: string) {
  const parsed = parseSetCookieHeader(header);
  let toSetCookie: Record<string, StoredCookie> = {};
  parsed.forEach((cookie, key) => {
    const expiresAt = cookie["expires"];
    const maxAge = cookie["max-age"];
    const expires = expiresAt
      ? new Date(String(expiresAt))
      : maxAge
        ? new Date(Date.now() + Number(maxAge) * 1000)
        : null;
    toSetCookie[key] = {
      value: cookie["value"],
      expires,
    };
  });
  if (prevCookie) {
    try {
      const prevCookieParsed = JSON.parse(prevCookie);
      toSetCookie = {
        ...prevCookieParsed,
        ...toSetCookie,
      };
    } catch {
      //
    }
  }
  return JSON.stringify(toSetCookie);
}

export function getCookie(cookie: string) {
  let parsed = {} as Record<string, StoredCookie>;
  try {
    parsed = JSON.parse(cookie) as Record<string, StoredCookie>;
  } catch {
    // noop
  }
  const toSend = Object.entries(parsed).reduce((acc, [key, value]) => {
    if (value.expires && value.expires < new Date()) {
      return acc;
    }
    return `${acc}; ${key}=${value.value}`;
  }, "");
  return toSend;
}

export const crossDomainClient = (
  opts: {
    storage?: {
      setItem: (key: string, value: string) => any;
      getItem: (key: string) => string | null;
    };
    storagePrefix?: string;
    disableCache?: boolean;
  } = {}
) => {
  let store: ClientStore | null = null;
  const cookieName = `${opts?.storagePrefix || "better-auth"}_cookie`;
  const localCacheName = `${opts?.storagePrefix || "better-auth"}_session_data`;
  const storage =
    opts?.storage || (typeof window !== "undefined" ? localStorage : undefined);

  return {
    id: "cross-domain",
    $InferServerPlugin: {} as ReturnType<typeof crossDomain>,
    getActions(_, $store) {
      store = $store;
      return {
        /**
         * Get the stored cookie.
         *
         * You can use this to get the cookie stored in the device and use it in your fetch
         * requests.
         *
         * @example
         * ```ts
         * const cookie = client.getCookie();
         * fetch("https://api.example.com", {
         * 	headers: {
         * 		cookie,
         * 	},
         * });
         */
        getCookie: () => {
          const cookie = storage?.getItem(cookieName);
          return getCookie(cookie || "{}");
        },
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
        updateSession: () => {
          $store.notify("$sessionSignal");
        },
        /**
         * Get the stored session data.
         *
         * @example
         * ```ts
         * const sessionData = client.getSessionData();
         * ```
         */
        getSessionData: () => {
          const sessionData = storage?.getItem(localCacheName);
          return sessionData ? JSON.parse(sessionData) : null;
        },
      };
    },
    fetchPlugins: [
      {
        id: "convex",
        name: "Convex",
        hooks: {
          async onSuccess(context) {
            if (!storage) {
              return;
            }
            const setCookie = context.response.headers.get(
              "set-better-auth-cookie"
            );
            if (setCookie) {
              const prevCookie = storage.getItem(cookieName);
              const toSetCookie = getSetCookie(
                setCookie || "",
                prevCookie ?? undefined
              );
              await storage.setItem(cookieName, toSetCookie);
              // Only notify on session cookie set
              if (setCookie.includes(".session_token=")) {
                store?.notify("$sessionSignal");
              }
            }

            if (
              context.request.url.toString().includes("/get-session") &&
              !opts?.disableCache
            ) {
              const data = context.data;
              storage.setItem(localCacheName, JSON.stringify(data));
            }
          },
        },
        async init(url, options) {
          if (!storage) {
            return {
              url,
              options: options as BetterFetchOption,
            };
          }
          options = options || {};
          const storedCookie = storage.getItem(cookieName);
          const cookie = getCookie(storedCookie || "{}");
          options.credentials = "omit";
          options.headers = {
            ...options.headers,
            "Better-Auth-Cookie": cookie,
          };
          if (url.includes("/sign-out")) {
            await storage.setItem(cookieName, "{}");
            store?.atoms.session?.set({
              data: null,
              error: null,
              isPending: false,
            });
            storage.setItem(localCacheName, "{}");
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
