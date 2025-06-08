import { betterAuth } from "better-auth";
import { createCookieGetter } from "better-auth/cookies";
import { GenericActionCtx } from "convex/server";

export const getToken = async (
  createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>
) => {
  const { getCookie } = await import("@tanstack/react-start/server");
  const auth = createAuth({} as any);
  const createCookie = createCookieGetter(auth.options);
  const cookie = createCookie("convex_jwt");
  const token = getCookie(cookie.name);
  return token;
};

export const reactStartHandler = (request: Request) => {
  const requestUrl = new URL(request.url);
  const nextUrl = `${process.env.CONVEX_SITE_URL}${requestUrl.pathname}${requestUrl.search}`;
  request.headers.set("accept-encoding", "application/json");
  return fetch(nextUrl, new Request(request, { redirect: "manual" }));
};
