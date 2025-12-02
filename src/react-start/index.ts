import { stripIndent } from "common-tags";
import type { FunctionReference, FunctionReturnType } from "convex/server";
import { ConvexHttpClient } from "convex/browser";
import type { SetOptional } from "type-fest";
import { getToken, type GetTokenOptions } from "../utils/index.js";
import React from "react";

// Caching supported for React 19+
const cache =
  React.cache ||
  ((fn: (...args: any[]) => any) => {
    return (...args: any[]) => fn(...args);
  });

type ClientOptions = {
  /**
   * The headers from the request.
   * This is used to get the token from the request cookies.
   */
  headers: Headers;
  /**
   * The URL of the Convex deployment to use for the function call.
   */
  convexUrl: string;
  /**
   * The HTTP Actions URL of the Convex deployment to use for the function call.
   */
  convexSiteUrl: string;
  /**
   * The JWT-encoded OpenID Connect authentication token to use for the function call.
   * Just an optional override for edge cases, you probably don't need this.
   */
  token?: string;
};

type FetchOptions = SetOptional<ClientOptions, "convexUrl" | "convexSiteUrl">;

function setupClient(options: ClientOptions) {
  const client = new ConvexHttpClient(options.convexUrl);
  if (options.token !== undefined) {
    client.setAuth(options.token);
  }
  // @ts-expect-error - setFetchOptions is internal
  client.setFetchOptions({ cache: "no-store" });
  return client;
}

async function fetchQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: Query["_args"],
  options: ClientOptions
): Promise<FunctionReturnType<Query>> {
  const client = setupClient(options);
  return client.query(query, args);
}

async function fetchMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  args: Mutation["_args"],
  options: ClientOptions
): Promise<FunctionReturnType<Mutation>> {
  const client = setupClient(options);
  return client.mutation(mutation, args);
}

async function fetchAction<Action extends FunctionReference<"action">>(
  action: Action,
  args: Action["_args"],
  options: ClientOptions
): Promise<FunctionReturnType<Action>> {
  const client = setupClient(options);
  return client.action(action, args);
}

const parseConvexSiteUrl = (url: string) => {
  if (!url) {
    throw new Error(stripIndent`
      CONVEX_SITE_URL is not set.
      This is automatically set in the Convex backend, but must be set in the TanStack Start environment.
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

const handler = (request: Request, opts: { convexSiteUrl: string }) => {
  const requestUrl = new URL(request.url);
  const nextUrl = `${opts.convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const headers = new Headers(request.headers);
  headers.set("accept-encoding", "application/json");
  headers.set("host", opts.convexSiteUrl);
  return fetch(nextUrl, {
    method: request.method,
    headers,
    redirect: "manual",
    body: request.body,
    // @ts-expect-error - duplex is required for streaming request bodies in modern fetch
    duplex: "half",
  });
};

export const convexBetterAuthReactStart = (
  opts: Omit<GetTokenOptions, "forceRefresh"> & {
    convexUrl: string;
    convexSiteUrl: string;
  }
) => {
  const siteUrl = parseConvexSiteUrl(opts.convexSiteUrl);

  const cachedGetToken = cache(
    (opts: GetTokenOptions & { headers: Headers }) => {
      const { headers, ...rest } = opts;
      return getToken(siteUrl, headers, rest);
    }
  );

  const callWithToken = async <
    FnType extends "query" | "mutation" | "action",
    Fn extends FunctionReference<FnType>,
  >(
    fn: (token?: string) => Promise<FunctionReturnType<Fn>>,
    options: FetchOptions
  ): Promise<FunctionReturnType<Fn>> => {
    if (options.token) {
      return fn(options.token);
    }
    const token = (await cachedGetToken({ ...opts, ...options })) ?? {};
    try {
      return await fn(token?.token);
    } catch (error) {
      if (
        !opts?.jwtCache?.enabled ||
        token.isFresh ||
        opts.jwtCache.isAuthError(error)
      ) {
        throw error;
      }
      const newToken = await cachedGetToken({ ...options, forceRefresh: true });
      return await fn(newToken.token);
    }
  };

  return {
    getToken: async (headers: Headers) => {
      const token = await cachedGetToken({ ...opts, headers });
      return token.token;
    },
    handler: (request: Request) => handler(request, opts),
    fetchQuery: async <Query extends FunctionReference<"query">>(
      query: Query,
      args: Query["_args"],
      options: FetchOptions
    ): Promise<FunctionReturnType<Query>> => {
      return callWithToken(
        (token?: string) =>
          fetchQuery(query, args, {
            convexUrl: opts.convexUrl,
            convexSiteUrl: opts.convexSiteUrl,
            ...options,
            token,
          }),
        options
      );
    },
    fetchMutation: async <Mutation extends FunctionReference<"mutation">>(
      mutation: Mutation,
      args: Mutation["_args"],
      options: FetchOptions
    ): Promise<FunctionReturnType<Mutation>> =>
      callWithToken((token?: string) => {
        return fetchMutation(mutation, args, {
          convexUrl: opts.convexUrl,
          convexSiteUrl: opts.convexSiteUrl,
          ...options,
          token,
        });
      }, options),
    fetchAction: async <Action extends FunctionReference<"action">>(
      action: Action,
      args: Action["_args"],
      options: FetchOptions
    ): Promise<FunctionReturnType<Action>> =>
      callWithToken((token?: string) => {
        return fetchAction(action, args, {
          convexUrl: opts.convexUrl,
          convexSiteUrl: opts.convexSiteUrl,
          ...options,
          token,
        });
      }, options),
  };
};
