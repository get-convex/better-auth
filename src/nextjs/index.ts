import { stripIndent } from "common-tags";
import {
  fetchAction,
  fetchMutation,
  fetchQuery,
  preloadQuery,
  type NextjsOptions,
} from "convex/nextjs";
import type { Preloaded } from "convex/react";
import {
  type ArgsAndOptions,
  type FunctionReference,
  type FunctionReturnType,
} from "convex/server";
import { cache } from "react";
import { getToken, type GetTokenOptions } from "../utils/index.js";

const parseConvexSiteUrl = (url: string) => {
  if (!url) {
    throw new Error(stripIndent`
      CONVEX_SITE_URL is not set.
      This is automatically set in the Convex backend, but must be set in the Next.js environment.
      For local development, this can be set in the .env.local file.
    `);
  }
  if (url.endsWith(".convex.cloud")) {
    throw new Error(stripIndent`
      CONVEX_SITE_URL should be set to your Convex Site URL, which ends in .convex.site.
      Currently set to ${url}.
    `);
  }
  return url;
};

const handler = (request: Request, siteUrl: string) => {
  const requestUrl = new URL(request.url);
  const nextUrl = `${siteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const newRequest = new Request(nextUrl, request);
  newRequest.headers.set("accept-encoding", "application/json");
  newRequest.headers.set("host", siteUrl);
  return fetch(newRequest, { method: request.method, redirect: "manual" });
};

const nextJsHandler = (siteUrl: string) => ({
  GET: (request: Request) => handler(request, siteUrl),
  POST: (request: Request) => handler(request, siteUrl),
});

export const convexBetterAuthNextJs = (
  opts: GetTokenOptions & { convexUrl: string; convexSiteUrl: string }
) => {
  const siteUrl = parseConvexSiteUrl(opts.convexSiteUrl);

  const cachedGetToken = cache(
    async ({ forceRefresh }: { forceRefresh?: boolean } = {}) => {
      const headers = await (await import("next/headers.js")).headers();
      return getToken(siteUrl, headers, { ...opts, forceRefresh });
    }
  );

  const argsWithToken = <
    FnType extends "query" | "mutation" | "action",
    Fn extends FunctionReference<FnType>,
  >(
    args: ArgsAndOptions<Fn, NextjsOptions>,
    token?: string
  ) => {
    args[1] = { ...args[1], token };
    return args;
  };

  const callWithToken = async <
    FnType extends "query" | "mutation" | "action",
    Fn extends FunctionReference<FnType>,
  >(
    fn: (
      args: ArgsAndOptions<Fn, NextjsOptions>
    ) => Promise<FunctionReturnType<Fn>>,
    args: ArgsAndOptions<Fn, NextjsOptions>
  ): Promise<FunctionReturnType<Fn>> => {
    const tokenFromArgs = args[1]?.token;
    if (tokenFromArgs) {
      return fn(args);
    }
    const token = (await cachedGetToken()) ?? {};
    try {
      return await fn(argsWithToken(args, token?.token));
    } catch (error) {
      if (
        !opts?.jwtCache?.enabled ||
        token.isFresh ||
        opts.jwtCache.isAuthError(error)
      ) {
        throw error;
      }
      const newToken = await cachedGetToken({ forceRefresh: true });
      return await fn(argsWithToken(args, newToken.token));
    }
  };

  return {
    getToken: async () => {
      const token = await cachedGetToken();
      return token.token;
    },
    handler: nextJsHandler(siteUrl),
    isAuthenticated: async () => {
      const token = await cachedGetToken();
      return !!token.token;
    },
    preloadQuery: async <Query extends FunctionReference<"query">>(
      query: Query,
      ...args: ArgsAndOptions<Query, NextjsOptions>
    ): Promise<Preloaded<Query>> =>
      callWithToken((argsWithToken: ArgsAndOptions<Query, NextjsOptions>) => {
        return preloadQuery(query, ...argsWithToken);
      }, args),
    fetchQuery: async <Query extends FunctionReference<"query">>(
      query: Query,
      ...args: ArgsAndOptions<Query, NextjsOptions>
    ): Promise<FunctionReturnType<Query>> =>
      callWithToken((argsWithToken: ArgsAndOptions<Query, NextjsOptions>) => {
        return fetchQuery(query, ...argsWithToken);
      }, args),
    fetchMutation: async <Mutation extends FunctionReference<"mutation">>(
      mutation: Mutation,
      ...args: ArgsAndOptions<Mutation, NextjsOptions>
    ): Promise<FunctionReturnType<Mutation>> =>
      callWithToken(
        (argsWithToken: ArgsAndOptions<Mutation, NextjsOptions>) => {
          return fetchMutation(mutation, ...argsWithToken);
        },
        args
      ),
    fetchAction: async <Action extends FunctionReference<"action">>(
      action: Action,
      ...args: ArgsAndOptions<Action, NextjsOptions>
    ): Promise<FunctionReturnType<Action>> =>
      callWithToken((argsWithToken: ArgsAndOptions<Action, NextjsOptions>) => {
        return fetchAction(action, ...argsWithToken);
      }, args),
  };
};
