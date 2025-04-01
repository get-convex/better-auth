import {
  Expand,
  FunctionReference,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
  HttpRouter,
} from "convex/server";
import { GenericId } from "convex/values";
import { api } from "../component/_generated/api";
import { BetterAuthOptions } from "better-auth";
import corsRouter from "./cors";
import { httpAction } from "../component/_generated/server";
import { Doc, TableNames } from "../component/_generated/dataModel";
import { auth, database } from "./auth";

const transformInput = (data: any, model: string, action: string) => {
  return data;
};

const transformOutput = (
  { _id, _creationTime, ...data }: Doc<TableNames>,
  _model: string
) => {
  return { ...data, id: _id };
};

const convertWhereClause = (where: any, table: any, model: string) => {
  return where;
};

const getField = (model: string, field: string) => {
  return field;
};

const db = {
  user: [],
};

export class BetterAuth<O extends BetterAuthOptions> {
  constructor(
    public component: UseApi<typeof api>,
    public options?: O
  ) {}
  registerRoutes(
    http: HttpRouter,
    {
      path = "/api/auth",
    }: {
      path?: string;
    } = {}
  ) {
    const requireEnv = (name: string) => {
      const value = process.env[name];
      if (value === undefined) {
        throw new Error(`Missing environment variable \`${name}\``);
      }
      return value;
    };

    const cors = corsRouter(http, {
      allowedOrigins: ["http://localhost:5173", "https://localhost:5173"],
      allowCredentials: true,
      allowedHeaders: ["Authorization", "Set-Auth-Token", "Content-Type"],
      verbose: true,
      exposedHeaders: ["Set-Auth-Token"],
    });

    http.route({
      path: "/.well-known/openid-configuration",
      method: "GET",
      handler: httpAction(async () => {
        const url = `${requireEnv("CONVEX_SITE_URL")}/api/auth/.well-known/openid-configuration`;
        return Response.redirect(url);
      }),
    });

    http.route({
      path: `${path}/.well-known/openid-configuration`,
      method: "GET",
      handler: httpAction(async (ctx, request) => {
        return auth(database(ctx)()).handler(request);
      }),
    });

    http.route({
      pathPrefix: `${path}/oauth2/`,
      method: "GET",
      handler: httpAction(async (ctx, request) => {
        return auth(database(ctx)()).handler(request);
      }),
    });

    http.route({
      path: `${path}/jwks`,
      method: "GET",
      handler: httpAction(async (ctx, request) => {
        return auth(database(ctx)()).handler(request);
      }),
    });

    http.route({
      pathPrefix: `${path}/callback/`,
      method: "GET",
      handler: httpAction(async (ctx, request) => {
        return auth(database(ctx)()).handler(request);
      }),
    });

    cors.route({
      pathPrefix: `${path}/`,
      method: "GET",
      handler: httpAction(async (ctx, request) => {
        return auth(database(ctx)()).handler(request);
      }),
    });

    cors.route({
      pathPrefix: `${path}/`,
      method: "POST",
      handler: httpAction(async (ctx, request) => {
        return auth(database(ctx)()).handler(request);
      }),
    });
  }
  /*
  async add<Name extends string = keyof Shards & string>(
    ctx: RunMutationCtx,
    name: Name,
    count: number = 1
  ) {
    const shards = this.options?.shards?.[name] ?? this.options?.defaultShards;
    return ctx.runMutation(this.component.lib.add, {
      name,
      count,
      shards,
    });
  }
  async count<Name extends string = keyof Shards & string>(
    ctx: RunQueryCtx,
    name: Name
  ) {
    return ctx.runQuery(this.component.lib.count, { name });
  }
    */
  /**
   * For easy re-exporting.
   * Apps can do
   * ```ts
   * export const { add, count } = shardedCounter.api();
   * ```
   */
  /*
  api() {
    return {
      add: mutationGeneric({
        args: { name: v.string() },
        handler: async (ctx, args) => {
          await this.add(ctx, args.name);
        },
      }),
      count: queryGeneric({
        args: { name: v.string() },
        handler: async (ctx, args) => {
          return await this.count(ctx, args.name);
        },
      }),
    };
  }
  */
}

/* Type utils follow */

type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
};
type RunMutationCtx = {
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
};

export type OpaqueIds<T> =
  T extends GenericId<infer _T>
    ? string
    : T extends (infer U)[]
      ? OpaqueIds<U>[]
      : T extends ArrayBuffer
        ? ArrayBuffer
        : T extends object
          ? { [K in keyof T]: OpaqueIds<T[K]> }
          : T;

export type UseApi<API> = Expand<{
  [mod in keyof API]: API[mod] extends FunctionReference<
    infer FType,
    "public",
    infer FArgs,
    infer FReturnType,
    infer FComponentPath
  >
    ? FunctionReference<
        FType,
        "internal",
        OpaqueIds<FArgs>,
        OpaqueIds<FReturnType>,
        FComponentPath
      >
    : UseApi<API[mod]>;
}>;
