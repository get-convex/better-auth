import { betterAuth } from "better-auth";
import { createCookieGetter } from "better-auth/cookies";
import { betterFetch } from "@better-fetch/fetch";
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

export const fetchSession = async (
  createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>
) => {
  type Session = ReturnType<typeof createAuth>["$Infer"]["Session"];

  const { getWebRequest } = await import("vinxi/http");
  const token = await getToken(createAuth);

  const request = getWebRequest();
  const baseURL = new URL(request.url).origin;
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        origin: baseURL,
      },
    }
  );
  return {
    session,
    token,
  };
};

export const reactStartHandler = (
  request: Request,
  opts?: { convexSiteUrl?: string }
) => {
  const convexSiteUrl = opts?.convexSiteUrl ?? process.env.CONVEX_SITE_URL;
  const requestUrl = new URL(request.url);
  const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  request.headers.set("accept-encoding", "application/json");
  return fetch(nextUrl, new Request(request, { redirect: "manual" }));
};
