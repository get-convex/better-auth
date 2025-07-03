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

const requireConvexSiteUrl = (opts?: {
  convexSiteUrl: string;
  verbose?: boolean;
}) => {
  const baseURL = opts?.convexSiteUrl ?? import.meta.env.VITE_CONVEX_SITE_URL;
  if (!baseURL) {
    throw new Error("VITE_CONVEX_SITE_URL is not set");
  }
  if (opts?.verbose) {
    console.log("convexSiteUrl", baseURL);
  }
  return baseURL;
};

export const fetchSession = async <
  T extends (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>,
>(
  request: Request,
  opts?: {
    convexSiteUrl: string;
    verbose?: boolean;
  }
) => {
  type Session = ReturnType<T>["$Infer"]["Session"];

  if (!request) {
    throw new Error("No request found");
  }
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: requireConvexSiteUrl(opts),
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
  opts?: { convexSiteUrl: string; verbose?: boolean }
) => {
  const requestUrl = new URL(request.url);
  const nextUrl = `${requireConvexSiteUrl(opts)}${requestUrl.pathname}${requestUrl.search}`;
  request.headers.set("accept-encoding", "application/json");
  return fetch(nextUrl, new Request(request, { redirect: "manual" }));
};
