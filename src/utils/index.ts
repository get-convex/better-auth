import { betterFetch } from "@better-fetch/fetch";
import type { Auth } from "better-auth";
import type { betterAuth } from "better-auth/minimal";
import { getSessionCookie } from "better-auth/cookies";
import type {
  AuthProvider,
  DefaultFunctionArgs,
  FunctionReference,
  GenericActionCtx,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";
import { JWT_COOKIE_NAME } from "../plugins/convex/index.js";
import * as jose from "jose";
import type { Jwk } from "better-auth/plugins/jwt";

export type CreateAuth<
  DataModel extends GenericDataModel,
  A extends ReturnType<typeof betterAuth> = Auth,
> = (ctx: GenericCtx<DataModel>) => A;

export type EventFunction<T extends DefaultFunctionArgs> = FunctionReference<
  "mutation",
  "internal" | "public",
  T
>;

export type GenericCtx<DataModel extends GenericDataModel = GenericDataModel> =
  | GenericQueryCtx<DataModel>
  | GenericMutationCtx<DataModel>
  | GenericActionCtx<DataModel>;

export type RunMutationCtx<DataModel extends GenericDataModel> = (
  | GenericMutationCtx<DataModel>
  | GenericActionCtx<DataModel>
) & {
  runMutation: GenericMutationCtx<DataModel>["runMutation"];
};

export const isQueryCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): ctx is GenericQueryCtx<DataModel> => {
  return "db" in ctx;
};

export const isMutationCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): ctx is GenericMutationCtx<DataModel> => {
  return "db" in ctx && "scheduler" in ctx;
};

export const isActionCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): ctx is GenericActionCtx<DataModel> => {
  return "runAction" in ctx;
};

export const isRunMutationCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): ctx is RunMutationCtx<DataModel> => {
  return "runMutation" in ctx;
};

export const requireQueryCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): GenericQueryCtx<DataModel> => {
  if (!isQueryCtx(ctx)) {
    throw new Error("Query context required");
  }
  return ctx;
};

export const requireMutationCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): GenericMutationCtx<DataModel> => {
  if (!isMutationCtx(ctx)) {
    throw new Error("Mutation context required");
  }
  return ctx;
};

export const requireActionCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): GenericActionCtx<DataModel> => {
  if (!isActionCtx(ctx)) {
    throw new Error("Action context required");
  }
  return ctx;
};

export const requireRunMutationCtx = <DataModel extends GenericDataModel>(
  ctx: GenericCtx<DataModel>
): RunMutationCtx<DataModel> => {
  if (!isRunMutationCtx(ctx)) {
    throw new Error("Mutation or action context required");
  }
  return ctx;
};

export type GetTokenOptions = {
  forceRefresh?: boolean;
  cookiePrefix?: string;
  jwtCache?: {
    enabled: boolean;
    expirationToleranceSeconds?: number;
    isAuthError: (error: unknown) => boolean;
  };
};

export const getToken = async (
  siteUrl: string,
  headers: Headers,
  opts?: GetTokenOptions
) => {
  const fetchToken = async () => {
    const { data } = await betterFetch<{ token: string }>(
      "/api/auth/convex/token",
      {
        baseURL: siteUrl,
        headers,
      }
    );
    return { isFresh: true, token: data?.token };
  };
  if (!opts?.jwtCache?.enabled || opts.forceRefresh) {
    return await fetchToken();
  }
  const token = getSessionCookie(new Headers(headers), {
    cookieName: JWT_COOKIE_NAME,
    cookiePrefix: opts?.cookiePrefix,
  });
  if (!token) {
    return await fetchToken();
  }
  try {
    const claims = jose.decodeJwt(token);
    const exp = claims?.exp;
    const now = Math.floor(new Date().getTime() / 1000);
    const isExpired = exp
      ? now > exp + (opts?.jwtCache?.expirationToleranceSeconds ?? 60)
      : true;
    if (!isExpired) {
      return { isFresh: false, token };
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error decoding JWT", error);
  }
  return await fetchToken();
};

export const parseJwks = (providerConfig: AuthProvider) => {
  const staticJwksString =
    "jwks" in providerConfig && providerConfig.jwks?.startsWith("data:text/")
      ? atob(providerConfig.jwks.split("base64,")[1])
      : undefined;

  if (!staticJwksString) {
    return;
  }
  const parsed = JSON.parse(
    staticJwksString?.slice(1, -1).replaceAll(/[\s\\]/g, "") || "{}"
  );
  const staticJwks = {
    ...parsed,
    privateKey: `"${parsed.privateKey}"`,
    publicKey: `"${parsed.publicKey}"`,
  } as Jwk;
  return staticJwks;
};
