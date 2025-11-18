import { getSessionCookie } from "better-auth/cookies";
import { JWT_COOKIE_NAME } from "../plugins/convex/index.js";
import { betterFetch } from "@better-fetch/fetch";
import { stripIndent } from "common-tags";
import * as jose from "jose";

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
    enabled?: boolean;
    expirationToleranceSeconds?: number;
  };
};

export const getToken = async (
  opts: GetTokenOptions & { convexSiteUrl?: string } = {}
) => {
  const convexSiteUrl = getConvexSiteUrl(opts.convexSiteUrl);
  const headers = await (await import("next/headers.js")).headers();
  const fetchToken = async () => {
    const { data } = await betterFetch<{ token: string }>(
      "/api/auth/convex/token",
      {
        baseURL: convexSiteUrl,
        headers,
      }
    );
    return data?.token;
  };
  if (!opts.jwtCache?.enabled) {
    return await fetchToken();
  }
  const token = getSessionCookie(new Headers(headers), {
    cookieName: JWT_COOKIE_NAME,
    cookiePrefix: opts.cookiePrefix,
  });

  if (!token) {
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
      return token;
    }
  } catch (error) {
    console.error("Error decoding JWT", error);
  }
  return await fetchToken();
};

const handler = (request: Request, opts?: { convexSiteUrl?: string }) => {
  const requestUrl = new URL(request.url);
  const convexSiteUrl = getConvexSiteUrl(opts?.convexSiteUrl);
  const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const newRequest = new Request(nextUrl, request);
  newRequest.headers.set("accept-encoding", "application/json");
  newRequest.headers.set("host", convexSiteUrl);
  return fetch(newRequest, { method: request.method, redirect: "manual" });
};

export const nextJsHandler = (opts?: { convexSiteUrl?: string }) => ({
  GET: (request: Request) => handler(request, opts),
  POST: (request: Request) => handler(request, opts),
});

type ConvexBetterAuthNextJsOptions = GetTokenOptions & {
  convexSiteUrl?: string;
};
export const convexBetterAuthNextJs = (
  opts?: ConvexBetterAuthNextJsOptions
) => {
  const convexSiteUrl = getConvexSiteUrl(opts?.convexSiteUrl);
  return {
    getToken: async () => getToken({ ...opts, convexSiteUrl }),
    handler: nextJsHandler({ convexSiteUrl }),
  };
};
