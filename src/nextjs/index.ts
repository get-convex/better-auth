import { betterFetch } from "@better-fetch/fetch";
import { getSessionCookie } from "better-auth/cookies";
import { stripIndent } from "common-tags";
import { fetchQuery, type NextjsOptions } from "convex/nextjs";
import { type Preloaded } from "convex/react";
import { type ArgsAndOptions, getFunctionName } from "convex/server";
import { type FunctionReference } from "convex/server";
import { convexToJson } from "convex/values";
import { cache } from "react";
import * as jose from "jose";
import { JWT_COOKIE_NAME } from "../plugins/convex/index.js";

const getConvexSiteUrl = (url?: string) => {
  const convexSiteUrl =
    url ??
    process.env.NEXT_PUBLIC_CONVEX_SITE_URL ??
    process.env.CONVEX_SITE_URL;
  if (!convexSiteUrl) {
    throw new Error(stripIndent`
      CONVEX_SITE_URL is not set.
      This is automatically set in the Convex backend, but must be set in the Next.js environment.
      For local development, this can be set in the .env.local file.
    `);
  }
  if (convexSiteUrl.endsWith(".convex.cloud")) {
    throw new Error(stripIndent`
      CONVEX_SITE_URL should be set to your Convex Site URL, which ends in .convex.site.
      Currently set to ${convexSiteUrl}.
    `);
  }
  return convexSiteUrl;
};

type GetTokenOptions = {
  cookiePrefix?: string;
  jwtCache?: {
    enabled: boolean;
    expirationToleranceSeconds?: number;
  };
};

const getToken = async (opts: GetTokenOptions & { convexSiteUrl: string }) => {
  const headers = await (await import("next/headers.js")).headers();
  const fetchToken = async () => {
    const { data } = await betterFetch<{ token: string }>(
      "/api/auth/convex/token",
      {
        baseURL: opts.convexSiteUrl,
        headers,
      }
    );
    return data?.token;
  };
  if (!opts.jwtCache?.enabled) {
    console.log(0);
    return await fetchToken();
  }
  const token = getSessionCookie(new Headers(headers), {
    cookieName: JWT_COOKIE_NAME,
    cookiePrefix: opts.cookiePrefix,
  });
  if (!token) {
    console.log(1);
    return await fetchToken();
  }
  try {
    const claims = jose.decodeJwt(token);
    const exp = claims?.exp;
    const now = Math.floor(new Date().getTime() / 1000);
    const isExpired = exp
      ? now > exp + (opts.jwtCache?.expirationToleranceSeconds ?? 60)
      : true;
    if (!isExpired) {
      console.log(2);
      return token;
    }
  } catch (error) {
    console.error("Error decoding JWT", error);
  }
  console.log(3);
  return await fetchToken();
};

const handler = (request: Request, opts: { convexSiteUrl: string }) => {
  const requestUrl = new URL(request.url);
  const nextUrl = `${opts.convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const newRequest = new Request(nextUrl, request);
  newRequest.headers.set("accept-encoding", "application/json");
  newRequest.headers.set("host", opts.convexSiteUrl);
  return fetch(newRequest, { method: request.method, redirect: "manual" });
};

const nextJsHandler = (opts: { convexSiteUrl: string }) => ({
  GET: (request: Request) => handler(request, opts),
  POST: (request: Request) => handler(request, opts),
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
  opts?: GetTokenOptions & { convexSiteUrl?: string }
) => {
  const convexSiteUrl = getConvexSiteUrl(opts?.convexSiteUrl);
  const cachedGetToken = cache(async () =>
    getToken({ ...opts, convexSiteUrl })
  );
  return {
    getToken: cachedGetToken,
    handler: nextJsHandler({ convexSiteUrl }),
    isAuthenticated: async () => {
      const token = await cachedGetToken();
      return !!token;
    },
    preloadQuery: async <Query extends FunctionReference<"query">>(
      query: Query,
      ...args: ArgsAndOptions<Query, NextjsOptions & { requireToken?: boolean }>
    ): Promise<Preloaded<Query>> => {
      const token = await cachedGetToken();
      const requireToken = args[1]?.requireToken ?? true;
      args[1] = { token, requireToken, ...args[1] };
      return preloadQuery(query, ...args);
    },
  };
};
