import { betterAuth } from "better-auth";
import { createCookieGetter } from "better-auth/cookies";
import { betterFetch } from "@better-fetch/fetch";
import {
  FunctionReference,
  FunctionReturnType,
  GenericActionCtx,
  GenericDataModel,
} from "convex/server";
import { JWT_COOKIE_NAME } from "../plugins/convex";
import { ConvexHttpClient } from "convex/browser";
import { CreateAuth, getStaticAuth } from "../client";

export const getCookieName = <DataModel extends GenericDataModel>(
  createAuth: CreateAuth<DataModel>
) => {
  const createCookie = createCookieGetter(getStaticAuth(createAuth).options);
  const cookie = createCookie(JWT_COOKIE_NAME);
  return cookie.name;
};

export const setupFetchClient = async <DataModel extends GenericDataModel>(
  createAuth: CreateAuth<DataModel>,
  getCookie: (name: string) => string | undefined
) => {
  const createClient = () => {
    const sessionCookieName = getCookieName(createAuth);
    const token = getCookie(sessionCookieName);
    const client = new ConvexHttpClient(process.env.VITE_CONVEX_URL!);
    if (token) {
      client.setAuth(token);
    }
    return client;
  };
  return {
    fetchQuery<
      Query extends FunctionReference<"query">,
      FuncRef extends FunctionReference<any, any>,
    >(
      query: Query,
      args: FuncRef["_args"]
    ): Promise<FunctionReturnType<Query>> {
      return createClient().query(query, args);
    },
    fetchMutation<
      Mutation extends FunctionReference<"mutation">,
      FuncRef extends FunctionReference<any, any>,
    >(
      mutation: Mutation,
      args: FuncRef["_args"]
    ): Promise<FunctionReturnType<Mutation>> {
      return createClient().mutation(mutation, args);
    },
    fetchAction<
      Action extends FunctionReference<"action">,
      FuncRef extends FunctionReference<any, any>,
    >(
      action: Action,
      args: FuncRef["_args"]
    ): Promise<FunctionReturnType<Action>> {
      return createClient().action(action, args);
    },
  };
};

export const fetchSession = async <
  T extends (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>,
>(
  request: Request,
  opts?: {
    convexSiteUrl?: string;
    verbose?: boolean;
  }
) => {
  type Session = ReturnType<T>["$Infer"]["Session"];

  if (!request) {
    throw new Error("No request found");
  }
  const convexSiteUrl = opts?.convexSiteUrl ?? process.env.VITE_CONVEX_SITE_URL;
  if (!convexSiteUrl) {
    throw new Error("VITE_CONVEX_SITE_URL is not set");
  }
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

export const getAuth = async <DataModel extends GenericDataModel>(
  request: Request,
  getCookie: (name: string) => string | undefined,
  createAuth: CreateAuth<DataModel>,
  opts?: { convexSiteUrl?: string }
) => {
  const sessionCookieName = getCookieName(createAuth);
  const token = getCookie(sessionCookieName);
  const { session } = await fetchSession(request, opts);
  return {
    userId: session?.user.id,
    token,
  };
};

export const reactStartHandler = (
  request: Request,
  opts?: { convexSiteUrl?: string; verbose?: boolean }
) => {
  const requestUrl = new URL(request.url);
  const convexSiteUrl = opts?.convexSiteUrl ?? process.env.VITE_CONVEX_SITE_URL;
  if (!convexSiteUrl) {
    throw new Error("VITE_CONVEX_SITE_URL is not set");
  }
  const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  request.headers.set("accept-encoding", "application/json");
  return fetch(nextUrl, new Request(request, { redirect: "manual" }));
};
