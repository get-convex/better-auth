import type { BetterAuthOptions } from "better-auth";
import {
  type Auth,
  type DefaultFunctionArgs,
  type Expand,
  type FunctionReference,
  type GenericActionCtx,
  type GenericDataModel,
  type GenericMutationCtx,
  type GenericQueryCtx,
  type HttpRouter,
  httpActionGeneric,
} from "convex/server";
import { type GenericId, type Infer, v } from "convex/values";
import type { api } from "../component/_generated/api";
import type { Id } from "../component/_generated/dataModel";
import schema from "../component/schema";
import { auth, database } from "./auth";
import corsRouter from "./cors";

export { schema };

export const userValidator = v.object({
  ...schema.tables.user.validator.fields,
  _id: v.string(),
  _creationTime: v.number(),
});

export const sessionValidator = v.object({
  ...schema.tables.session.validator.fields,
  userId: v.string(),
  _id: v.string(),
  _creationTime: v.number(),
});

export type EventFunction<T extends DefaultFunctionArgs> = FunctionReference<
  "mutation",
  "internal" | "public",
  T
>;

export type OnCreateUser = EventFunction<{ user: Infer<typeof userValidator> }>;
export type OnDeleteUser = EventFunction<{ id: string }>;
export type OnCreateSession = EventFunction<{
  session: Infer<typeof sessionValidator>;
}>;

export class BetterAuth {
  constructor(
    public component: UseApi<typeof api>,
    public betterAuthOptions?:
      | BetterAuthOptions
      | ((
          ctx: GenericActionCtx<GenericDataModel>,
          request: Request
        ) => BetterAuthOptions),
    public config?: {
      onCreateUser?: OnCreateUser;
      onDeleteUser?: OnDeleteUser;
      onCreateSession?: OnCreateSession;
    }
  ) {}
  async getAuthUserId(ctx: RunQueryCtx & { auth: Auth }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return identity.subject;
  }
  async getAuthUser(ctx: RunQueryCtx & { auth: Auth }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return ctx.runQuery(this.component.lib.getUserById, {
      id: identity.subject as Id<"user">,
    });
  }
  async getAnyUserById(ctx: RunQueryCtx, id: string) {
    return ctx.runQuery(this.component.lib.getUserById, {
      id,
    });
  }
  registerRoutes(
    http: HttpRouter,
    {
      path = "/api/auth",
      allowedOrigins,
    }: {
      path?: string;
      allowedOrigins: string[];
    }
  ) {
    const requireEnv = (name: string) => {
      const value = process.env[name];
      if (value === undefined) {
        throw new Error(`Missing environment variable \`${name}\``);
      }
      return value;
    };

    const authRequestHandler = httpActionGeneric(async (ctx, request) => {
      const response = await auth(
        database(ctx, this.component, this.config),
        typeof this.betterAuthOptions === "function"
          ? this.betterAuthOptions(ctx, request)
          : this.betterAuthOptions || {}
      ).handler(request);
      console.log("response headers", response.headers);
      return response;
    });

    const cors = corsRouter(http, {
      allowedOrigins,
      allowCredentials: true,
      allowedHeaders: ["Authorization", "Set-Auth-Token", "Content-Type"],
      verbose: true,
      exposedHeaders: ["Set-Auth-Token"],
    });

    http.route({
      path: "/.well-known/openid-configuration",
      method: "GET",
      handler: httpActionGeneric(async () => {
        const url = `${requireEnv("CONVEX_SITE_URL")}/api/auth/.well-known/openid-configuration`;
        return Response.redirect(url);
      }),
    });

    http.route({
      path: `${path}/.well-known/openid-configuration`,
      method: "GET",
      handler: authRequestHandler,
    });

    http.route({
      pathPrefix: `${path}/oauth2/`,
      method: "GET",
      handler: authRequestHandler,
    });

    http.route({
      path: `${path}/jwks`,
      method: "GET",
      handler: authRequestHandler,
    });

    http.route({
      pathPrefix: `${path}/callback/`,
      method: "GET",
      handler: authRequestHandler,
    });

    http.route({
      path: `${path}/magic-link/verify`,
      method: "GET",
      handler: authRequestHandler,
    });

    http.route({
      path: `${path}/verify-email`,
      method: "GET",
      handler: authRequestHandler,
    });

    http.route({
      pathPrefix: `${path}/reset-password/`,
      method: "GET",
      handler: authRequestHandler,
    });

    cors.route({
      pathPrefix: `${path}/`,
      method: "GET",
      handler: authRequestHandler,
    });

    cors.route({
      pathPrefix: `${path}/`,
      method: "POST",
      handler: authRequestHandler,
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
