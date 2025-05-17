import {
  type Auth as ConvexAuth,
  type DefaultFunctionArgs,
  type Expand,
  type FunctionReference,
  GenericActionCtx,
  type GenericDataModel,
  GenericMutationCtx,
  type GenericQueryCtx,
  type HttpRouter,
  WithoutSystemFields,
  httpActionGeneric,
  internalMutationGeneric,
} from "convex/server";
import { type GenericId, v } from "convex/values";
import type { api } from "../component/_generated/api";
import { Doc } from "../component/_generated/dataModel";
import schema from "../component/schema";
import { convexAdapter } from "./adapter";
import corsRouter from "./cors";
import { vv } from "../component/util";
import { getByArgsValidator, updateArgsInputValidator } from "../component/lib";
import { omit } from "convex-helpers";
import { betterAuth } from "better-auth";
export { convexAdapter };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { userId, ...createUserFields } = schema.tables.user.validator.fields;
export const createUserArgsValidator = v.object(createUserFields);
export const updateUserArgsValidator = v.object(
  schema.tables.user.validator.fields
);
export const deleteUserArgsValidator = v.object({
  userId: v.string(),
});

export const onCreateSessionArgsValidator = v.object({
  ...vv.doc("session").fields,
  _id: v.string(),
});

export type EventFunction<T extends DefaultFunctionArgs> = FunctionReference<
  "mutation",
  "internal" | "public",
  T
>;

export type AuthApi = {
  createUser: FunctionReference<
    "mutation",
    "internal",
    typeof schema.tables.user.validator.fields
  >;
  deleteUser: FunctionReference<"mutation", "internal", { userId: string }>;
  updateUser?: FunctionReference<
    "mutation",
    "internal",
    typeof schema.tables.user.validator.fields
  >;
  createSession?: FunctionReference<
    "mutation",
    "internal",
    typeof schema.tables.session.validator.fields
  >;
};

export class BetterAuth<
  DataModel extends GenericDataModel,
  Id extends string = string,
> {
  constructor(
    public component: UseApi<typeof api>,
    public config?: {
      verbose?: boolean;
    }
  ) {}

  async getHeaders(ctx: RunQueryCtx & { auth: ConvexAuth }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return new Headers();
    }
    const session = await ctx.runQuery(this.component.lib.getCurrentSession);
    return new Headers({
      authorization: `Bearer ${session?.token}`,
    });
  }

  // Convenience function for getting the Better Auth user
  async getAuthUser(ctx: RunQueryCtx & { auth: ConvexAuth }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    const doc = await ctx.runQuery(this.component.lib.getBy, {
      table: "user",
      field: "userId",
      value: identity.subject,
    });
    return doc as WithoutSystemFields<Doc<"user">>;
  }

  authApi(opts: {
    onCreateUser: (
      ctx: GenericMutationCtx<DataModel>,
      user: Omit<WithoutSystemFields<Doc<"user">>, "userId">
    ) => Promise<Id>;
    onDeleteUser: (
      ctx: GenericMutationCtx<DataModel>,
      id: Id
    ) => void | Promise<void>;
    onUpdateUser?: (
      ctx: GenericMutationCtx<DataModel>,
      user: WithoutSystemFields<Doc<"user">>
    ) => void | Promise<void>;
    onCreateSession?: (
      ctx: GenericMutationCtx<DataModel>,
      session: Doc<"session">
    ) => void | Promise<void>;
  }) {
    return {
      createUser: internalMutationGeneric({
        args: {
          input: v.object({
            table: v.literal("user"),
            ...omit(schema.tables.user.validator.fields, ["userId"]),
          }),
        },
        returns: v.any(),
        handler: async (ctx, args) => {
          const userId = await opts.onCreateUser(ctx, args.input);
          const input = { ...args.input, table: "user", userId };
          return ctx.runMutation(this.component.lib.create, {
            input,
          });
        },
      }),
      deleteUser: internalMutationGeneric({
        args: getByArgsValidator,
        returns: v.any(),
        handler: async (ctx, args) => {
          const doc = await ctx.runMutation(this.component.lib.deleteBy, args);
          await opts.onDeleteUser(ctx, doc.userId as Id);
        },
      }),
      updateUser: internalMutationGeneric({
        args: {
          input: updateArgsInputValidator("user"),
        },
        returns: v.any(),
        handler: async (ctx, args) => {
          const updatedUser = await ctx.runMutation(
            this.component.lib.update,
            args
          );
          if (opts?.onUpdateUser) {
            await opts.onUpdateUser(ctx, updatedUser as any);
          }
          return updatedUser;
        },
      }),
      createSession: internalMutationGeneric({
        args: {
          input: v.object({
            table: v.literal("session"),
            ...schema.tables.session.validator.fields,
          }),
        },
        returns: v.any(),
        handler: async (ctx, args) => {
          const session = await ctx.runMutation(
            this.component.lib.create,
            args
          );
          await opts.onCreateSession?.(ctx, session as any);
          return session;
        },
      }),
    };
  }

  registerRoutes(
    http: HttpRouter,
    createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>,
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
      const auth = createAuth(ctx as any);
      const response = await auth.handler(request);
      if (this.config?.verbose) {
        console.log("response headers", response.headers);
      }
      return response;
    });

    const cors = corsRouter(http, {
      allowedOrigins,
      allowCredentials: true,
      allowedHeaders: ["Authorization", "Content-Type", "Better-Auth-Cookie"],
      verbose: this.config?.verbose,
      exposedHeaders: ["Set-Better-Auth-Cookie"],
    });

    http.route({
      path: "/.well-known/openid-configuration",
      method: "GET",
      handler: httpActionGeneric(async () => {
        const url = `${requireEnv("CONVEX_SITE_URL")}/api/auth/convex/.well-known/openid-configuration`;
        return Response.redirect(url);
      }),
    });

    http.route({
      path: `${path}/convex/.well-known/openid-configuration`,
      method: "GET",
      handler: authRequestHandler,
    });

    http.route({
      path: `${path}/convex/jwks`,
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
