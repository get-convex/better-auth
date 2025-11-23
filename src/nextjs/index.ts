import { betterFetch } from "@better-fetch/fetch";
import { stripIndent } from "common-tags";

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

const getToken = async (opts: { convexSiteUrl: string }) => {
  const headers = await (await import("next/headers.js")).headers();
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
  const newRequest = new Request(nextUrl, request);
  newRequest.headers.set("accept-encoding", "application/json");
  newRequest.headers.set("host", opts.convexSiteUrl);
  return fetch(newRequest, { method: request.method, redirect: "manual" });
};

const nextJsHandler = (opts: { convexSiteUrl: string }) => ({
  GET: (request: Request) => handler(request, opts),
  POST: (request: Request) => handler(request, opts),
});

export const convexBetterAuthNextJs = (opts?: { convexSiteUrl?: string }) => {
  const convexSiteUrl = getConvexSiteUrl(opts?.convexSiteUrl);
  return {
    getToken: async () => getToken({ convexSiteUrl }),
    handler: nextJsHandler({ convexSiteUrl }),
  };
};
