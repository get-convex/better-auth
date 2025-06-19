import { betterAuth } from "better-auth";
import { createCookieGetter } from "better-auth/cookies";
import { betterFetch } from "@better-fetch/fetch";
import { GenericActionCtx } from "convex/server";
import { JWT_COOKIE_NAME } from "../plugins/convex";

export const getCookieName = async (
  createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>
) => {
  const auth = createAuth({} as any);
  const createCookie = createCookieGetter(auth.options);
  const cookie = createCookie(JWT_COOKIE_NAME);
  return cookie.name;
};

export const fetchSession = async <
  T extends (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>,
>(
  createAuth: T,
  request?: Request
) => {
  type Session = ReturnType<T>["$Infer"]["Session"];

  if (!request) {
    throw new Error("No request found");
  }
  const baseURL = new URL(request.url).origin;
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    }
  );
  return {
    session,
  };
};

export const reactStartHandler = (
  request: Request,
  opts?: { convexSiteUrl?: string }
) => {
  const convexSiteUrl = opts?.convexSiteUrl ?? process.env.VITE_CONVEX_SITE_URL;
  const requestUrl = new URL(request.url);
  const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  request.headers.set("accept-encoding", "application/json");
  return fetch(nextUrl, new Request(request, { redirect: "manual" }));
};
