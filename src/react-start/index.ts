import { betterAuth } from "better-auth";
import { createCookieGetter } from "better-auth/cookies";
import { betterFetch } from "@better-fetch/fetch";
import { GenericActionCtx } from "convex/server";
import { JWT_COOKIE_NAME } from "../plugins/convex";
import { oneLine } from "common-tags";

export const getCookieName = async (
  createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>
) => {
  const auth = createAuth({} as any);
  const createCookie = createCookieGetter(auth.options);
  const cookie = createCookie(JWT_COOKIE_NAME);
  return cookie.name;
};

const requireConvexSiteUrl = (
  opts: { convexSiteUrl: string; verbose?: boolean },
  calledFrom: string
) => {
  if (!opts.convexSiteUrl) {
    throw new Error(`${calledFrom}: opts.convexSiteUrl is required`);
  }
  if (opts.verbose) {
    console.log(`${calledFrom}: opts.convexSiteUrl: ${opts.convexSiteUrl}`);
  }
  return opts.convexSiteUrl;
};

export const fetchSession = async <
  T extends (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>,
>(
  request: Request,
  opts: {
    convexSiteUrl: string;
    verbose?: boolean;
  }
) => {
  type Session = ReturnType<T>["$Infer"]["Session"];

  if (!request) {
    throw new Error("No request found");
  }
  const convexSiteUrl = requireConvexSiteUrl(opts, "fetchSession");
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: convexSiteUrl,
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
  opts: { convexSiteUrl: string; verbose?: boolean }
) => {
  const requestUrl = new URL(request.url);
  const convexSiteUrl = requireConvexSiteUrl(opts, "reactStartHandler");
  const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  request.headers.set("accept-encoding", "application/json");
  return fetch(nextUrl, new Request(request, { redirect: "manual" }));
};

export const reactStartHelpers = (
  createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>,
  opts: { convexSiteUrl: string; verbose?: boolean }
) => {
  if (!opts.convexSiteUrl) {
    throw new Error("opts.convexSiteUrl is required");
  }
  if (opts.convexSiteUrl.endsWith(".convex.cloud")) {
    throw new Error(
      oneLine(`
        opts.convexSiteUrl ends with .convex.cloud, which is your cloud URL.
        Use your Convex site URL instead.
        https://docs.convex.dev/production/environment-variables#system-environment-variables
      `)
    );
  }
  return {
    fetchSession: (request: Request) => fetchSession(request, opts),
    reactStartHandler: (request: Request) => reactStartHandler(request, opts),
    getCookieName: () => getCookieName(createAuth),
  };
};
