import { betterAuth, type BetterAuthOptions } from "better-auth";
import {
  type Auth,
  type DefaultFunctionArgs,
  type Expand,
  FunctionHandle,
  type FunctionReference,
  type GenericDataModel,
  GenericMutationCtx,
  type GenericQueryCtx,
  type HttpRouter,
  WithoutSystemFields,
  httpActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
  mutationGeneric,
} from "convex/server";
import { type GenericId, Infer, v, VString } from "convex/values";
import { customSession, jwt } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";
import { oidcProvider } from "better-auth/plugins";
import { oneTimeToken } from "better-auth/plugins/one-time-token";
import type { api } from "../component/_generated/api";
import {
  Doc,
  type DataModel as ComponentDataModel,
} from "../component/_generated/dataModel";
import schema from "../component/schema";
import { database } from "./auth";
import corsRouter from "./cors";
import { vv } from "../component/util";
import { convex } from "./plugin";
import { getByArgsValidator, transformOutput } from "../component/lib";
import { omit } from "convex-helpers";

export { schema };

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

export class BetterAuth<
  DataModel extends GenericDataModel,
  O extends BetterAuthOptions = BetterAuthOptions,
  Id extends string = string,
> {
  constructor(
    public component: UseApi<typeof api>,
    public betterAuthOptions: O,
    public config: {
      createUser: FunctionReference<
        "mutation",
        "internal",
        typeof schema.tables.user.validator.fields
      >;
      updateUser: FunctionReference<
        "mutation",
        "internal",
        typeof schema.tables.user.validator.fields
      >;
      deleteUser: FunctionReference<"mutation", "internal", { userId: Id }>;
      onCreateSession?: FunctionReference<
        "mutation",
        "internal",
        { session: Infer<typeof onCreateSessionArgsValidator> }
      >;
        // These are the authApi methods from below, exported out by the
        // parent app, and their references are passed in here. These are
        // only required if useAppUserTable is true (currently).
        authApi?: {
          create: FunctionReference<"mutation", "internal", any>;
          getBy: FunctionReference<"query", "internal", any>;
          update: FunctionReference<"mutation", "internal", any>;
          deleteBy: FunctionReference<"mutation", "internal", any>;
        };
      verbose?: boolean;
    }
  ) {
    this.betterAuthOptions = {
      ...this.betterAuthOptions,
      user: {
        additionalFields: {
          userId: {
            type: "string",
            required: true,
            input: false,
          },
        },
        deleteUser: this.betterAuthOptions.user?.deleteUser,
      },
      plugins: [
        ...(betterAuthOptions.plugins || []),
        customSession(async ({ user, session }) => {
          const { id, ...userData } = user as typeof user & {
            userId: string;
          };
          return {
            user: userData,
            session: {
              ...session,
              userId: userData.userId as string,
            },
          };
        }),
        oidcProvider({
          loginPage: "/not-used",
        }),
        bearer(),
        jwt({
          jwt: {
            issuer: `${process.env.CONVEX_SITE_URL}`,
            audience: "convex",
            getSubject: (session) => session.user.userId,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            definePayload: ({ user: { id, userId, ...user } }) => user,
          },
        }),
        oneTimeToken({ disableClientRequest: true }),
        convex(),
      ],
      advanced: {
        database: {
          generateId: false,
        },
      },
    };
  }

  async getAuthUserId(ctx: RunQueryCtx & { auth: Auth }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return identity.subject as Id;
  }

  async getAuthUser(ctx: RunQueryCtx & { auth: Auth }) {
    const identity = await ctx.auth.getUserIdentity();
    console.log("identity", identity);
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

  async getAnyUser(ctx: GenericQueryCtx<ComponentDataModel>, id: string) {
    return ctx.db
      .query("user")
      .withIndex("userId", (q) => q.eq("userId", id))
      .unique();
  }
  syncApi(opts: {
    onCreateUser: (
      ctx: GenericMutationCtx<DataModel>,
      user: Omit<WithoutSystemFields<Doc<'user'>>, 'userId'>,
    ) => Promise<Id>;
    onDeleteUser: (
      ctx: GenericMutationCtx<DataModel>,
      id: Id,
    ) => void | Promise<void>;
    onUpdateUser?: (
      ctx: GenericMutationCtx<DataModel>,
      user: WithoutSystemFields<Doc<'user'>>,
    ) => void | Promise<void>;
    onCreateSession?: (
      ctx: GenericMutationCtx<DataModel>,
      session: Doc<'session'>
    ) => void | Promise<void>;
  }) {
    const id = v.string() as VString<Id>;
    return {
      onCreateUser: mutationGeneric({
        args: {
          input: v.object({
            ...omit(schema.tables.user.validator.fields, ["userId"]),
          }),
        },
        returns: id,
        handler: async (ctx, args) => {
          const userId = await opts.onCreateUser(ctx, args.input);
          return ctx.runMutation(this.component.lib.create, {
            table: "user",
            input: { ...args.input, userId },
          });
        },
      }),
      onUpdateUser: mutationGeneric({
        args: {
          input: schema.tables.user.validator,
        },
        returns: v.null(),
        handler: async (ctx, args) => {
          const updatedUser = await ctx.runMutation(this.component.lib.update, args)
          if (opts?.onUpdateUser) {
            await opts.onUpdateUser(ctx, updatedUser);
          }
          return updatedUser
        },
      }),
      onDeleteUser: mutationGeneric({
        args: getByArgsValidator,
        returns: v.null(),
        handler: async (ctx, args) => {
          await opts.onDeleteUser(ctx, args.value as Id);
        },
      }),
    };
  }

  authApi() {
    return {
      create: internalMutationGeneric({
        args: v.object({
          input: v.object({
            table: v.literal("user"),
            ...schema.tables.user.validator.fields,
            // we don't expect a userId here, overwrite the field
            userId: v.optional(v.any()),
          }),
          createHandle: v.string(),
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
      const response = await betterAuth({
        ...this.betterAuthOptions,
        database: database(
          ctx,
          this.component,
          this.betterAuthOptions,
          this.config
        ),
      }).handler(request);
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
