import { stripIndent } from "common-tags";
import { betterFetch } from "@better-fetch/fetch";

const getConvexSiteUrl = (url?: string) => {
  const convexSiteUrl =
    url ?? process.env.VITE_CONVEX_SITE_URL ?? process.env.CONVEX_SITE_URL;
  if (!convexSiteUrl) {
    throw new Error(stripIndent`
      CONVEX_SITE_URL is not set.
      This is automatically set in the Convex backend, but must be set in the TanStack Start environment.
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

const getToken = async (headers: Headers, opts: { convexSiteUrl: string }) => {
  const { data } = await betterFetch<{ token: string }>(
    "/api/auth/convex/token",
    {
      baseURL: opts.convexSiteUrl,
      headers,
    }
  );
  return data?.token;
};

const handler = (request: Request, opts: { convexSiteUrl: string }) => {
  const requestUrl = new URL(request.url);
  const nextUrl = `${opts.convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const headers = new Headers(request.headers);
  headers.set("accept-encoding", "application/json");
  headers.set("host", opts.convexSiteUrl);
  return fetch(nextUrl, {
    method: request.method,
    headers,
    redirect: "manual",
    body: request.body,
    // @ts-expect-error - duplex is required for streaming request bodies in modern fetch
    duplex: "half",
  });
};

export const convexBetterAuthReactStart = (opts?: {
  convexSiteUrl?: string;
}) => {
  const convexSiteUrl = getConvexSiteUrl(opts?.convexSiteUrl);
  return {
    getToken: async (headers: Headers) =>
      getToken(headers, { ...opts, convexSiteUrl }),
    handler: (request: Request) => handler(request, { ...opts, convexSiteUrl }),
  };
};
