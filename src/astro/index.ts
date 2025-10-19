import { betterFetch } from "@better-fetch/fetch";
import type { betterAuth } from "better-auth";
import { createCookieGetter } from "better-auth/cookies";
import { ConvexHttpClient } from "convex/browser";
import type {
  FunctionReference,
  FunctionReturnType,
  GenericActionCtx,
  GenericDataModel,
} from "convex/server";
import type { APIContext, AstroCookies } from "astro";
import { type CreateAuth, getStaticAuth } from "../client";
import { JWT_COOKIE_NAME } from "../plugins/convex";

type CookieReader = (name: string) => string | undefined;
type CookieSource = AstroCookies | CookieReader | undefined;
type AstroRequestContext =
  | Pick<APIContext, "request" | "cookies">
  | {
      request: Request;
      cookies?: CookieSource;
    };
type CookieInput =
  | CookieSource
  | AstroRequestContext
  | Request
  | Headers
  | string
  | {
      request?: Request;
      headers?: Headers | string;
      cookies?: CookieSource | string;
      cookie?: string;
    };

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const cookieReaderFromString = (cookieHeader: string): CookieReader => {
  if (!cookieHeader) {
    return () => undefined;
  }
  const pairs = cookieHeader.split(/;\s*/).filter(Boolean);
  const store = new Map<string, string>();
  for (const pair of pairs) {
    const separatorIndex = pair.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const key = safeDecode(pair.slice(0, separatorIndex).trim());
    const value = safeDecode(pair.slice(separatorIndex + 1));
    if (!store.has(key)) {
      store.set(key, value);
    }
  }
  if (store.size === 0) {
    return () => undefined;
  }
  return (name) => {
    if (!name) {
      return undefined;
    }
    return store.get(name);
  };
};

const isAstroCookies = (source: unknown): source is AstroCookies => {
  if (!source || typeof source !== "object") {
    return false;
  }
  return (
    "get" in source &&
    typeof (source as { get?: unknown }).get === "function" &&
    "has" in source &&
    typeof (source as { has?: unknown }).has === "function" &&
    "merge" in source &&
    typeof (source as { merge?: unknown }).merge === "function"
  );
};

const isHeadersLike = (source: unknown): source is Headers => {
  return typeof Headers !== "undefined" && source instanceof Headers;
};

const isRequestLike = (source: unknown): source is Request => {
  if (typeof Request !== "undefined" && source instanceof Request) {
    return true;
  }
  if (!source || typeof source !== "object") {
    return false;
  }
  return (
    "headers" in source &&
    typeof (source as { headers?: unknown }).headers !== "undefined" &&
    "method" in source
  );
};

const normalizeCookieSource = (source: CookieInput): CookieSource => {
  if (!source) {
    return undefined;
  }
  if (typeof source === "function") {
    return source;
  }
  if (isAstroCookies(source)) {
    return source;
  }
  if (isRequestLike(source)) {
    return normalizeCookieSource((source as Request).headers);
  }
  if (isHeadersLike(source)) {
    const cookieHeader = (source as Headers).get("cookie") ?? "";
    return cookieHeader ? cookieReaderFromString(cookieHeader) : undefined;
  }
  if (typeof source === "string") {
    return cookieReaderFromString(source);
  }
  if (typeof source === "object") {
    if ("cookies" in source && source.cookies) {
      const normalized = normalizeCookieSource(source.cookies as CookieInput);
      if (normalized) {
        return normalized;
      }
    }
    if ("request" in source && source.request) {
      const normalized = normalizeCookieSource(source.request as CookieInput);
      if (normalized) {
        return normalized;
      }
    }
    if ("headers" in source && source.headers) {
      const normalized = normalizeCookieSource(source.headers as CookieInput);
      if (normalized) {
        return normalized;
      }
    }
    if ("cookie" in source && typeof source.cookie === "string") {
      const normalized = normalizeCookieSource(source.cookie);
      if (normalized) {
        return normalized;
      }
    }
  }
  return undefined;
};

const createCookieReader = (source: CookieInput): CookieReader => {
  const normalized = normalizeCookieSource(source);
  if (typeof normalized === "function") {
    return normalized;
  }
  if (normalized && typeof normalized.get === "function") {
    return (name) => {
      const cookie = normalized.get(name) as { value?: string } | undefined;
      return typeof cookie?.value === "string" ? cookie.value : undefined;
    };
  }
  return () => undefined;
};

export const getCookieName = <DataModel extends GenericDataModel>(
  createAuth: CreateAuth<DataModel>
) => {
  const createCookie = createCookieGetter(getStaticAuth(createAuth).options);
  const cookie = createCookie(JWT_COOKIE_NAME);
  return cookie.name;
};

export const getToken = <DataModel extends GenericDataModel>(
  createAuth: CreateAuth<DataModel>,
  cookies?: CookieInput
) => {
  const sessionCookieName = getCookieName(createAuth);
  const readCookie = createCookieReader(cookies);
  const token = readCookie(sessionCookieName);

  if (!token) {
    const isSecure = sessionCookieName.startsWith("__Secure-");
    const insecureCookieName = sessionCookieName.replace("__Secure-", "");
    const secureCookieName = isSecure
      ? sessionCookieName
      : `__Secure-${insecureCookieName}`;
    const secureToken = readCookie(secureCookieName);
    const insecureToken = readCookie(insecureCookieName);

    if (isSecure && insecureToken) {
      console.warn(
        `Looking for secure cookie ${sessionCookieName} but found insecure cookie ${sessionCookieName.replace("__Secure-", "")}`
      );
    }
    if (!isSecure && secureToken) {
      console.warn(
        `Looking for insecure cookie ${sessionCookieName} but found secure cookie ${secureCookieName}`
      );
    }
  }

  return token;
};

export const setupFetchClient = async <DataModel extends GenericDataModel>(
  createAuth: CreateAuth<DataModel>,
  cookies?: CookieInput,
  opts?: { convexUrl?: string }
) => {
  const readCookie = createCookieReader(cookies);
  const createClient = () => {
    const convexUrl = opts?.convexUrl ?? process.env.VITE_CONVEX_URL;
    if (!convexUrl) {
      throw new Error("VITE_CONVEX_URL is not set");
    }
    const sessionCookieName = getCookieName(createAuth);
    const token = readCookie(sessionCookieName);
    const client = new ConvexHttpClient(convexUrl);
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
  context: AstroRequestContext,
  createAuth: CreateAuth<DataModel>,
  opts?: { convexSiteUrl?: string }
) => {
  const { request } = context;
  if (!request) {
    throw new Error("No request found");
  }
  const readCookie = createCookieReader(context);
  const sessionCookieName = getCookieName(createAuth);
  const token = readCookie(sessionCookieName);
  const { session } = await fetchSession(request, opts);
  return {
    userId: session?.user.id,
    token,
  };
};

const handler = (request: Request, opts?: { convexSiteUrl?: string }) => {
  const requestUrl = new URL(request.url);
  const convexSiteUrl = opts?.convexSiteUrl ?? process.env.VITE_CONVEX_SITE_URL;
  if (!convexSiteUrl) {
    throw new Error("VITE_CONVEX_SITE_URL is not set");
  }
  const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const forwardRequest = new Request(nextUrl, request);
  forwardRequest.headers.set("accept-encoding", "application/json");
  return fetch(forwardRequest, { method: request.method, redirect: "manual" });
};

export const astroHandler =
  (opts?: { convexSiteUrl?: string }) =>
  async ({ request }: Pick<APIContext, "request">) =>
    handler(request, opts);
