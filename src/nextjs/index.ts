import { betterFetch } from "@better-fetch/fetch";
import { getSessionCookie } from "better-auth/cookies";
import { stripIndent } from "common-tags";
import {
  fetchAction,
  fetchMutation,
  fetchQuery,
  type NextjsOptions,
} from "convex/nextjs";
import { type Preloaded } from "convex/react";
import {
  type ArgsAndOptions,
  getFunctionName,
  type FunctionReference,
} from "convex/server";
import { convexToJson } from "convex/values";
import { cache } from "react";
import * as jose from "jose";
import { JWT_COOKIE_NAME } from "../plugins/convex/index.js";
import { headers } from "next/headers.js";

const parseConvexSiteUrl = (url: string) => {
  if (!url) {
    throw new Error(stripIndent`
      CONVEX_SITE_URL is not set.
      This is automatically set in the Convex backend, but must be set in the Next.js environment.
      For local development, this can be set in the .env.local file.
    `);
  }
  if (url.endsWith(".convex.cloud")) {
    throw new Error(stripIndent`
      CONVEX_SITE_URL should be set to your Convex Site URL, which ends in .convex.site.
      Currently set to ${url}.
    `);
  }
  return url;
};

type GetTokenOptions = {
  forceRefresh?: boolean;
  cookiePrefix?: string;
  jwtCache?: {
    enabled: boolean;
    expirationToleranceSeconds?: number;
  };
};

const getToken = async (
  siteUrl: string,
  opts?: GetTokenOptions
): Promise<{ token?: string; isFresh: boolean }> => {
  const headers = await (await import("next/headers.js")).headers();
  const fetchToken = async () => {
    const { data } = await betterFetch<{ token: string }>(
      "/api/auth/convex/token",
      {
        baseURL: siteUrl,
        headers,
      }
    );
    return { isFresh: true, token: data?.token };
  };
  if (!opts?.jwtCache?.enabled || opts.forceRefresh) {
    return await fetchToken();
  }
  const token = getSessionCookie(new Headers(headers), {
    cookieName: JWT_COOKIE_NAME,
    cookiePrefix: opts?.cookiePrefix,
  });
  if (!token) {
    return await fetchToken();
  }
  try {
    const claims = jose.decodeJwt(token);
    const exp = claims?.exp;
    const now = Math.floor(new Date().getTime() / 1000);
    const isExpired = exp
      ? now > exp + (opts?.jwtCache?.expirationToleranceSeconds ?? 60)
      : true;
    if (!isExpired) {
      console.log("returning cached token");
      return { isFresh: false, token };
    }
  } catch (error) {
    console.error("Error decoding JWT", error);
  }
  console.log("jwt expired or invalid, fetching new token");
  return await fetchToken();
};

const handler = (request: Request, siteUrl: string) => {
  const requestUrl = new URL(request.url);
  const nextUrl = `${siteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const newRequest = new Request(nextUrl, request);
  newRequest.headers.set("accept-encoding", "application/json");
  newRequest.headers.set("host", siteUrl);
  return fetch(newRequest, { method: request.method, redirect: "manual" });
};

const nextJsHandler = (siteUrl: string) => ({
  GET: (request: Request) => handler(request, siteUrl),
  POST: (request: Request) => handler(request, siteUrl),
});

export async function preloadQuery<Query extends FunctionReference<"query">>(
  query: Query,
  ...args: ArgsAndOptions<Query, NextjsOptions & { requireToken?: boolean }>
): Promise<Preloaded<Query>> {
  const token = args[1]?.token;
  const requireToken = args[1]?.requireToken ?? true;
  const value =
    !requireToken || token ? await fetchQuery(query, ...args) : null;
  const preloaded = {
    _name: getFunctionName(query),
    _argsJSON: convexToJson(args[0] ?? {}),
    _valueJSON: convexToJson(value),
  };
  return preloaded as any;
}

export const convexBetterAuthNextJs = (
  convexSiteUrl: string,
  opts?: GetTokenOptions & NextjsOptions
) => {
  const siteUrl = parseConvexSiteUrl(convexSiteUrl);
  const cachedGetToken = cache(
    ({ forceRefresh }: { forceRefresh?: boolean } = {}) =>
      getToken(siteUrl, { ...opts, forceRefresh })
  );
  return {
    getToken: async () => {
      const result = await cachedGetToken();
      return result.token;
    },
    handler: nextJsHandler(siteUrl),
    isAuthenticated: async () => {
      const token = await cachedGetToken();
      return !!token.token;
    },
    preloadQuery: async <Query extends FunctionReference<"query">>(
      query: Query,
      ...args: ArgsAndOptions<Query, NextjsOptions & { requireToken?: boolean }>
    ): Promise<Preloaded<Query>> => {
      console.log("cookies", (await headers()).get("cookie"));
      const result = (await cachedGetToken()) ?? {};
      const requireToken = args[1]?.requireToken ?? true;
      args[1] = { token: result.token, requireToken, ...args[1] };
      try {
        return preloadQuery(query, ...args);
      } catch (error) {
        if (result.isFresh) {
          throw error;
        }
        const newResult = await cachedGetToken();
        args[1] = { token: newResult.token, requireToken, ...args[1] };
        return preloadQuery(query, ...args);
      }
    },
    fetchQuery: async (...args: Parameters<typeof fetchQuery>) => {
      const result = (await cachedGetToken()) ?? {};
      args[2] = { token: result.token, ...args[2] };
      try {
        return fetchQuery(args[0], args[1], { ...opts, ...args[2] });
      } catch (error) {
        if (result.isFresh) {
          throw error;
        }
        const newResult = await cachedGetToken();
        args[2] = { token: newResult.token, ...args[2] };
        return fetchQuery(args[0], args[1], { ...opts, ...args[2] });
      }
    },
    fetchMutation: async (...args: Parameters<typeof fetchMutation>) => {
      const result = (await cachedGetToken()) ?? {};
      args[2] = { token: result.token, ...args[2] };
      try {
        return fetchMutation(args[0], args[1], { ...opts, ...args[2] });
      } catch (error) {
        if (result.isFresh) {
          throw error;
        }
        const newResult = await cachedGetToken();
        args[2] = { token: newResult.token, ...args[2] };
        return fetchMutation(args[0], args[1], { ...opts, ...args[2] });
      }
    },
    fetchAction: async (...args: Parameters<typeof fetchAction>) => {
      const result = (await cachedGetToken()) ?? {};
      args[2] = { token: result.token, ...args[2] };
      try {
        return fetchAction(args[0], args[1], { ...opts, ...args[2] });
      } catch (error) {
        if (result.isFresh) {
          throw error;
        }
        const newResult = await cachedGetToken();
        args[2] = { token: newResult.token, ...args[2] };
        return fetchAction(args[0], args[1], { ...opts, ...args[2] });
      }
    },
  };
};
