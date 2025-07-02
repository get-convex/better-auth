import { betterAuth } from "better-auth";
import { createCookieGetter } from "better-auth/cookies";
import { betterFetch } from "@better-fetch/fetch";
import { GenericActionCtx } from "convex/server";
import { JWT_COOKIE_NAME } from "../plugins/convex";

const requireBaseURL = (
  createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>
) => {
  const baseUrl = createAuth({} as any).options.baseURL;
  if (!baseUrl) {
    throw new Error(
      "No baseURL found in Better Auth config. baseUrl should be set to your Convex Site URL."
    );
  }
  return baseUrl;
};

export const getCookieName = async (
  createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>
) => {
  // Require baseURL here because it's protocol determines cookie secure mode,
  // and must be set to ensure cookies work between TanStack and Convex.
  requireBaseURL(createAuth);
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
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: requireBaseURL(createAuth),
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
  opts: { convexSiteUrl: string }
) => {
  const requestUrl = new URL(request.url);
  const nextUrl = `${opts.convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  request.headers.set("accept-encoding", "application/json");
  return fetch(nextUrl, new Request(request, { redirect: "manual" }));
};
