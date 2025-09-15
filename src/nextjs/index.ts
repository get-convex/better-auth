import { createCookieGetter } from "better-auth/cookies";
import { JWT_COOKIE_NAME } from "../plugins/convex";
import { betterAuth } from "better-auth";

export const getToken = async (
  createAuth: (ctx: any) => ReturnType<typeof betterAuth>
) => {
  const options = createAuth({} as any).options;
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
  const newRequest = new Request(nextUrl, request);
  newRequest.headers.set("accept-encoding", "application/json");
  return fetch(newRequest, { method: request.method, redirect: "manual" });
};

export const nextJsHandler = (opts?: { convexSiteUrl?: string }) => ({
  GET: (request: Request) => handler(request, opts),
  POST: (request: Request) => handler(request, opts),
});
