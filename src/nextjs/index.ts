import { createCookieGetter } from "better-auth/cookies";
import type { GenericDataModel } from "convex/server";
import { type CreateAuth, getStaticAuth } from "../client";
import { JWT_COOKIE_NAME } from "../plugins/convex";

export const getToken = async <DataModel extends GenericDataModel>(
  createAuth: CreateAuth<DataModel>
) => {
  const options = getStaticAuth(createAuth).options;
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const createCookie = createCookieGetter(options);
  const cookie = createCookie(JWT_COOKIE_NAME);
  const tokenCookie = cookieStore.get(cookie.name);

  // Warn if there's a secure cookie mismatch between Convex and Next.js
  if (!tokenCookie?.value) {
    const isSecure = cookie.name.startsWith("__Secure-");
    const insecureCookieName = cookie.name.replace("__Secure-", "");
    const insecureCookie = cookieStore.get(insecureCookieName);
    const secureCookieName = isSecure
      ? cookie.name
      : `__Secure-${insecureCookieName}`;
    const secureCookie = cookieStore.get(secureCookieName);
    if (isSecure && insecureCookie) {
      console.warn(
        `Looking for secure cookie ${cookie.name} but found insecure cookie ${insecureCookie.name}`
      );
    }
    if (!isSecure && secureCookie) {
      console.warn(
        `Looking for insecure cookie ${cookie.name} but found secure cookie ${secureCookie.name}`
      );
    }
  }
  return tokenCookie?.value;
};

const handler = (request: Request, opts?: { convexSiteUrl?: string }) => {
  const requestUrl = new URL(request.url);
  const convexSiteUrl =
    opts?.convexSiteUrl ?? process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  if (!convexSiteUrl) {
    throw new Error("NEXT_PUBLIC_CONVEX_SITE_URL is not set");
  }
  const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;

  const headers = new Headers(request.headers);
  headers.set("accept-encoding", "application/json");
  // Delete `host` header that points to Next.js application address
  // Bun TLS cert validation is more strict that Node.js and it
  // detects mismatch between `host` header and the target URL causing `ERR_TLS_CERT_ALTNAME_INVALID`
  headers.delete("host");

  const method = request.method;
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  const newRequest = new Request(nextUrl, {
    method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
  });
  return fetch(newRequest);
};

export const nextJsHandler = (opts?: { convexSiteUrl?: string }) => ({
  GET: (request: Request) => handler(request, opts),
  POST: (request: Request) => handler(request, opts),
});
