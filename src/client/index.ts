import type { BetterAuthOptions } from "better-auth";
import {
  type Auth,
  type DefaultFunctionArgs,
  type Expand,
  FunctionHandle,
  type FunctionReference,
  type GenericDataModel,
  type GenericQueryCtx,
  type HttpRouter,
  WithoutSystemFields,
  createFunctionHandle,
  httpActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
} from "convex/server";
import { type GenericId, Infer, v } from "convex/values";
import type { api } from "../component/_generated/api";
import {
  Doc,
  type DataModel as ComponentDataModel,
} from "../component/_generated/dataModel";
import schema from "../component/schema";
import { auth, database } from "./auth";
import corsRouter from "./cors";
import {
  getByArgsValidator,
  getByHelper,
  transformOutput,
  updateArgs,
} from "../component/lib";
import { vv } from "../component/util";
import { RequireAllOrNone } from "type-fest";

export { schema };

export const userValidator = v.object({
  ...vv.doc("user").fields,
  _id: v.string(),
});
export const sessionValidator = v.object({
  ...vv.doc("session").fields,
  _id: v.string(),
});

export type EventFunction<T extends DefaultFunctionArgs> = FunctionReference<
  "mutation",
  "internal" | "public",
  T
>;

export class BetterAuth<
  DataModel extends GenericDataModel,
  O extends BetterAuthOptions = BetterAuthOptions,
  Id extends string = string,
> {
  constructor(
    public component: UseApi<typeof api>,
    public betterAuthOptions: O,
    public config: RequireAllOrNone<
      {
        createUser: FunctionReference<"mutation", "internal">;
        onCreateUser?: FunctionReference<
          "mutation",
          "internal",
          { userId: Id }
        >;
        onDeleteUser?: FunctionReference<
          "mutation",
          "internal",
          {
            id: DataModel["users"]["document"]["_id"];
          }
        >;
        onCreateSession?: FunctionReference<
          "mutation",
          "internal",
          {
            session: Infer<typeof sessionValidator>;
          }
        >;
        verbose?: boolean;
        // These are the authApi methods from below, exported out by the
        // parent app, and their references are passed in here. These are
        // only required if useAppUserTable is true (currently).
        authApi?: {
          create: FunctionReference<"mutation", "internal", any>;
          getBy: FunctionReference<"query", "internal", any>;
          update: FunctionReference<"mutation", "internal", any>;
          deleteBy: FunctionReference<"mutation", "internal", any>;
        };
        useAppUserTable?: boolean;
      },
      "useAppUserTable" | "authApi"
    >
  ) {}

  async getAuthUserId(ctx: RunQueryCtx & { auth: Auth }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return identity.subject as Id;
  }

  async getAuthUser(ctx: RunQueryCtx & { auth: Auth }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const getBy = this.config.useAppUserTable
      ? await createFunctionHandle(this.config.authApi?.getBy)
      : this.component.lib.getBy;
    const doc = await ctx.runQuery(getBy, {
      table: "user",
      field: "userId",
      value: identity.subject,
    });
    return doc as WithoutSystemFields<Doc<"user">>;
  }

  async getAnyUser(ctx: GenericQueryCtx<ComponentDataModel>, id: string) {
    return ctx.db
      .query("user")
      .withIndex("userId", (q) => q.eq("userId", id))
      .unique();
  }

  authApi() {
    return {
      create: internalMutationGeneric({
        args: v.object({
          input: v.union(
            // User is the only table that can be located
            // in the user's app for now
            v.object({
              // The table name may be custom
              table: v.string(),
              name: v.string(),
              email: v.string(),
              emailVerified: v.boolean(),
              image: v.optional(v.string()),
              twoFactorEnabled: v.optional(v.boolean()),
              createdAt: v.number(),
              updatedAt: v.number(),
            })
          ),
          onCreateHandle: v.optional(v.string()),
        }),
        handler: async (ctx, args) => {
          const { table, ...input } = args.input;
          const id = await ctx.db.insert(table as any, {
            ...input,
          });
          const doc = await ctx.db.get(id);
          if (!doc) {
            throw new Error(`Failed to create ${table}`);
          }
          if (args.onCreateHandle) {
            await ctx.runMutation(
              args.onCreateHandle as FunctionHandle<
                "mutation",
                {
                  doc: any;
                }
              >,
              { doc }
            );
          }
          return transformOutput(doc, table);
        },
      }),
      getBy: internalQueryGeneric({
        args: getByArgsValidator,
        handler: async (ctx, args) => {
          const doc = await getByHelper(ctx, args);
          if (!doc) {
            return;
          }
          return transformOutput(doc, args.table);
        },
      }),
      update: internalMutationGeneric({
        args: updateArgs,
        handler: async (ctx, args) => {
          return ctx.runMutation(this.component.lib.update, args);
        },
      }),
      deleteBy: internalMutationGeneric({
        args: v.object({
          ...getByArgsValidator,
          onDeleteHandle: v.optional(v.string()),
        }),
        handler: async (ctx, args) => {
          const doc = await getByHelper(ctx, args);
          if (!doc) {
            return;
          }
          await ctx.db.delete(doc._id);
          if (args.onDeleteHandle) {
            await ctx.runMutation(
              args.onDeleteHandle as FunctionHandle<
                "mutation",
                { id: string },
                void
              >,
              { id: doc._id }
            );
          }
        },
      }),
    };
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
        database(ctx, this.component, this.betterAuthOptions, this.config),
        this.betterAuthOptions,
        this.config
      ).handler(request);
      if (this.config?.verbose) {
        console.log("response headers", response.headers);
      }
      return response;
    });

    const cors = corsRouter(http, {
      allowedOrigins,
      allowCredentials: true,
      allowedHeaders: ["Authorization", "Set-Auth-Token", "Content-Type"],
      verbose: this.config?.verbose,
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
}

/* Type utils follow */

type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
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
