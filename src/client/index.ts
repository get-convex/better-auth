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
  httpActionGeneric,
  internalMutationGeneric,
} from "convex/server";
import { type GenericId, Infer, v } from "convex/values";
import type { api } from "../component/_generated/api";
import schema from "../component/schema";
import { convexAdapter } from "./adapter";
import corsRouter from "./cors";
import { getByArgsValidator, updateArgsInputValidator } from "../component/lib";
import { betterAuth } from "better-auth";
import { omit } from "convex-helpers";
export { convexAdapter };

const createUserFields = omit(schema.tables.user.validator.fields, ["userId"]);
const createUserValidator = v.object(createUserFields);
const createUserArgsValidator = v.object({
  input: v.object({
    ...createUserFields,
    table: v.literal("user"),
  }),
});
const updateUserArgsValidator = v.object({
  input: updateArgsInputValidator("user"),
});
const deleteUserArgsValidator = v.object(getByArgsValidator);

const createSessionArgsValidator = v.object({
  input: v.object({
    table: v.literal("session"),
    ...schema.tables.session.validator.fields,
  }),
});

export type EventFunction<T extends DefaultFunctionArgs> = FunctionReference<
  "mutation",
  "internal" | "public",
  T
>;

export type AuthFunctions = {
  createUser: FunctionReference<
    "mutation",
    "internal",
    Infer<typeof createUserArgsValidator>
  >;
  deleteUser: FunctionReference<
    "mutation",
    "internal",
    Infer<typeof deleteUserArgsValidator>
  >;
  updateUser: FunctionReference<
    "mutation",
    "internal",
    Infer<typeof updateUserArgsValidator>
  >;
  createSession: FunctionReference<
    "mutation",
    "internal",
    Infer<typeof createSessionArgsValidator>
  >;
};

export class BetterAuth<UserId extends string = string> {
  constructor(
    public component: UseApi<typeof api>,
    public authFunctions: AuthFunctions,
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

  // TODO: use the proper id type for auth functions
  async getAuthUserId(ctx: RunQueryCtx & { auth: ConvexAuth }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return identity.subject as UserId;
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
    if (!doc) {
      return null;
    }
    // Type narrowing
    if (!("emailVerified" in doc)) {
      throw new Error("invalid user");
    }
    const { id: _id, ...user } = doc;
    return user;
  }

  createAuthFunctions<DataModel extends GenericDataModel>(opts: {
    onCreateUser: (
      ctx: GenericMutationCtx<DataModel>,
      user: Infer<typeof createUserValidator>
    ) => Promise<UserId>;
    onDeleteUser?: (
      ctx: GenericMutationCtx<DataModel>,
      id: UserId
    ) => void | Promise<void>;
    onUpdateUser?: (
      ctx: GenericMutationCtx<DataModel>,
      user: Infer<typeof schema.tables.user.validator>
    ) => void | Promise<void>;
    onCreateSession?: (
      ctx: GenericMutationCtx<DataModel>,
      session: Infer<typeof schema.tables.session.validator>
    ) => void | Promise<void>;
  }) {
    return {
      createUser: internalMutationGeneric({
        args: createUserArgsValidator,
        handler: async (ctx, args) => {
          const userId = await opts.onCreateUser(ctx, args.input);
          const input = { ...args.input, table: "user", userId };
          return ctx.runMutation(this.component.lib.create, {
            input,
          });
        },
      }),
      deleteUser: internalMutationGeneric({
        args: deleteUserArgsValidator,
        handler: async (ctx, args) => {
          const doc = await ctx.runMutation(this.component.lib.deleteBy, args);
          if (opts.onDeleteUser) {
            await opts.onDeleteUser(ctx, doc.userId as UserId);
          }
        },
      }),
      updateUser: internalMutationGeneric({
        args: updateUserArgsValidator,
        handler: async (ctx, args) => {
          const updatedUser = await ctx.runMutation(
            this.component.lib.update,
            args
          );
          // Type narrowing
          if (!("emailVerified" in updatedUser)) {
            throw new Error("invalid user");
          }
          if (opts.onUpdateUser) {
            await opts.onUpdateUser(ctx, omit(updatedUser, ["id"]));
          }
          return updatedUser;
        },
      }),
      createSession: internalMutationGeneric({
        args: createSessionArgsValidator,
        handler: async (ctx, args) => {
          const session = await ctx.runMutation(
            this.component.lib.create,
            args
          );
          // Type narrowing
          if (!("ipAddress" in session)) {
            throw new Error("invalid session");
          }
          await opts.onCreateSession?.(ctx, session);
          return session;
        },
      }),
    };
  }

  registerRoutes(
    http: HttpRouter,
    createAuth: (ctx: GenericActionCtx<any>) => ReturnType<typeof betterAuth>,
    opts?: {
      path?: string;
      allowedOrigins?: string[];
    }
  ) {
    const path = opts?.path ?? "/api/auth";
    const trustedOrigins = createAuth({} as any).options.trustedOrigins;
    if (typeof trustedOrigins === "function") {
      throw new Error("trustedOrigins cannot be a function");
    }
    const allowedOrigins = opts?.allowedOrigins ?? trustedOrigins;
    const requireEnv = (name: string) => {
      const value = process.env[name];
      if (value === undefined) {
        throw new Error(`Missing environment variable \`${name}\``);
      }
      return value;
    };

    const authRequestHandler = httpActionGeneric(async (ctx, request) => {
      const auth = createAuth(ctx);
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
