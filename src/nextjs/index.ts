import { betterAuth } from "better-auth";
import { createCookieGetter } from "better-auth/cookies";
import { GenericActionCtx } from "convex/server";
import { JWT_COOKIE_NAME } from "../plugins/convex";

export const getToken = async (
  createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>
) => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const auth = createAuth({} as any);
  const createCookie = createCookieGetter(auth.options);
  const cookie = createCookie(JWT_COOKIE_NAME);
  const token = cookieStore.get(cookie.name);
  return token?.value;
};

const handler = (request: Request, opts?: { convexSiteUrl?: string }) => {
  const requestUrl = new URL(request.url);
  const convexSiteUrl =
    opts?.convexSiteUrl ?? process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
  const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const newRequest = new Request(nextUrl, request);
  newRequest.headers.set("accept-encoding", "application/json");
  return fetch(newRequest, { method: request.method, redirect: "manual" });
};

export const nextJsHandler = (opts?: { convexSiteUrl?: string }) => ({
  GET: (request: Request) => handler(request, opts),
  POST: (request: Request) => handler(request, opts),
});
