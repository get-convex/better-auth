import {
  DataModelFromSchemaDefinition,
  type FunctionReference,
  type GenericDataModel,
  GenericMutationCtx,
  GenericSchema,
  type HttpRouter,
  SchemaDefinition,
  httpActionGeneric,
  internalMutationGeneric,
} from "convex/server";
import { Infer, v } from "convex/values";
import { convexAdapter } from "./adapter";
import { corsRouter } from "convex-helpers/server/cors";
import defaultSchema from "../component/schema";
import { SetOptional } from "type-fest";
import { ComponentApi } from "../component/_generated/component.js";
import { CreateAuth, GenericCtx, getStaticAuth } from ".";

export type AuthFunctions = {
  onCreate?: FunctionReference<"mutation", "internal", { [key: string]: any }>;
  onUpdate?: FunctionReference<"mutation", "internal", { [key: string]: any }>;
  onDelete?: FunctionReference<"mutation", "internal", { [key: string]: any }>;
};

export type Triggers<
  DataModel extends GenericDataModel,
  Schema extends SchemaDefinition<any, any>,
> = {
  [K in keyof Schema["tables"]]?: {
    onCreate?: <Ctx extends GenericMutationCtx<DataModel>>(
      ctx: Ctx,
      doc: Infer<Schema["tables"][K]["validator"]> & {
        _id: string;
        _creationTime: number;
      }
    ) => Promise<void>;
    onUpdate?: <Ctx extends GenericMutationCtx<DataModel>>(
      ctx: Ctx,
      newDoc: Infer<Schema["tables"][K]["validator"]> & {
        _id: string;
        _creationTime: number;
      },
      oldDoc: Infer<Schema["tables"][K]["validator"]> & {
        _id: string;
        _creationTime: number;
      }
    ) => Promise<void>;
    onDelete?: <Ctx extends GenericMutationCtx<DataModel>>(
      ctx: Ctx,
      doc: Infer<Schema["tables"][K]["validator"]> & {
        _id: string;
        _creationTime: number;
      }
    ) => Promise<void>;
  };
};

type SlimComponentApi = {
  adapter: {
    create: FunctionReference<"mutation", "internal">;
    findOne: FunctionReference<"query", "internal">;
    findMany: FunctionReference<"query", "internal">;
    updateOne: FunctionReference<"mutation", "internal">;
    updateMany: FunctionReference<"mutation", "internal">;
    deleteOne: FunctionReference<"mutation", "internal">;
    deleteMany: FunctionReference<"mutation", "internal">;
    migrationRemoveUserId?: FunctionReference<"mutation", "internal">;
  };
  adapterTest?: ComponentApi["adapterTest"];
};

export const createClient = <
  DataModel extends GenericDataModel,
  Schema extends SchemaDefinition<GenericSchema, true> = typeof defaultSchema,
  Api extends SlimComponentApi = SlimComponentApi,
>(
  component: Api,
  config?: {
    local?: {
      schema?: Schema;
    };
    verbose?: boolean;
  } & (
    | {
        triggers: Triggers<DataModel, Schema>;
        authFunctions: AuthFunctions;
      }
    | { triggers?: undefined }
  )
) => {
  type BetterAuthDataModel = DataModelFromSchemaDefinition<Schema>;

  const safeGetAuthUser = async (ctx: GenericCtx<DataModel>) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return;
    }

    const doc = (await ctx.runQuery(component.adapter.findOne, {
      model: "user",
      where: [
        {
          field: "_id",
          value: identity.subject,
        },
      ],
    })) as BetterAuthDataModel["user"]["document"] | null;
    if (!doc) {
      return;
    }
    return doc;
  };

  const getHeaders = async (ctx: GenericCtx<DataModel>) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return new Headers();
    }
    const session = await ctx.runQuery(component.adapter.findOne, {
      model: "session",
      where: [
        {
          field: "_id",
          value: identity.sessionId as string,
        },
      ],
    });
    return new Headers({
      ...(session?.token ? { authorization: `Bearer ${session.token}` } : {}),
      ...(session?.ipAddress
        ? { "x-forwarded-for": session.ipAddress as string }
        : {}),
    });
  };

  return {
    component,
    adapter: (ctx: GenericCtx<DataModel>) =>
      convexAdapter<DataModel, typeof ctx, Schema>(ctx, component, {
        ...config,
        debugLogs: config?.verbose,
      }),

    getAuth: async <T extends CreateAuth<DataModel>>(
      createAuth: T,
      ctx: GenericCtx<DataModel>
    ) => ({
      auth: createAuth(ctx) as ReturnType<T>,
      headers: await getHeaders(ctx),
    }),

    getHeaders,

    /**
     * Returns the current user or null if the user is not found
     * @param ctx - The Convex context
     * @returns The user or null if the user is not found
     */
    safeGetAuthUser,

    /**
     * Returns the current user.
     * @param ctx - The Convex context
     * @returns The user or throws an error if the user is not found
     */
    getAuthUser: async (ctx: GenericCtx<DataModel>) => {
      const user = await safeGetAuthUser(ctx);
      if (!user) {
        throw new Error("Unauthenticated");
      }
      return user;
    },

    /**
     * Returns a user by their Better Auth user id.
     * @param ctx - The Convex context
     * @param id - The Better Auth user id
     * @returns The user or null if the user is not found
     */
    getAnyUserById: async (ctx: GenericCtx<DataModel>, id: string) => {
      return (await ctx.runQuery(component.adapter.findOne, {
        model: "user",
        where: [{ field: "_id", value: id }],
      })) as BetterAuthDataModel["user"]["document"] | null;
    },

    // Replaces 0.7 behavior of returning a new user id from
    // onCreateUser, deprecated in 0.9
    /**
     * Replaces 0.7 behavior of returning a new user id from
     * onCreateUser
     * @param ctx - The Convex context
     * @param authId - The Better Auth user id
     * @param userId - The app user id
     * @deprecated in 0.9
     */
    setUserId: async (
      ctx: GenericMutationCtx<DataModel>,
      authId: string,
      userId: string
    ) => {
      await ctx.runMutation(component.adapter.updateOne, {
        input: {
          model: "user",
          where: [{ field: "_id", value: authId }],
          update: { userId },
        },
      });
    },

    /**
     * Temporary method to simplify 0.9 migration, gets a user by `userId` field
     * @param ctx - The Convex context
     * @param userId - The app user id
     * @returns The user or null if the user is not found
     */
    migrationGetUser: async (
      ctx: GenericMutationCtx<DataModel>,
      userId: string
    ) => {
      return (await ctx.runQuery(component.adapter.findOne, {
        model: "user",
        where: [{ field: "userId", value: userId }],
      })) as BetterAuthDataModel["user"]["document"] | null;
    },

    /**
     * Temporary method to simplify 0.9 migration, removes the `userId` field
     * from the Better Auth user record
     * @param ctx - The Convex context
     * @param userId - The app user id
     */
    migrationRemoveUserId: async (
      ctx: GenericMutationCtx<DataModel>,
      userId: string
    ) => {
      if (!component.adapter.migrationRemoveUserId) {
        throw new Error("migrationRemoveUserId not found");
      }
      await ctx.runMutation(component.adapter.migrationRemoveUserId, {
        userId,
      });
    },

    triggersApi: () => ({
      onCreate: internalMutationGeneric({
        args: {
          doc: v.any(),
          model: v.string(),
        },
        handler: async (ctx, args) => {
          await config?.triggers?.[args.model]?.onCreate?.(ctx, args.doc);
        },
      }),
      onUpdate: internalMutationGeneric({
        args: {
          oldDoc: v.any(),
          newDoc: v.any(),
          model: v.string(),
        },
        handler: async (ctx, args) => {
          await config?.triggers?.[args.model]?.onUpdate?.(
            ctx,
            args.newDoc,
            args.oldDoc
          );
        },
      }),
      onDelete: internalMutationGeneric({
        args: {
          doc: v.any(),
          model: v.string(),
        },
        handler: async (ctx, args) => {
          await config?.triggers?.[args.model]?.onDelete?.(ctx, args.doc);
        },
      }),
    }),

    registerRoutes: (
      http: HttpRouter,
      createAuth: CreateAuth<DataModel>,
      opts: {
        cors?:
          | boolean
          | {
              // These values are appended to the default values
              allowedOrigins?: string[];
              allowedHeaders?: string[];
              exposedHeaders?: string[];
            };
      } = {}
    ) => {
      const staticAuth = getStaticAuth(createAuth);
      const path = staticAuth.options.basePath ?? "/api/auth";
      const authRequestHandler = httpActionGeneric(async (ctx, request) => {
        console.log(request.url);
        if (config?.verbose) {
          console.log("options.baseURL", staticAuth.options.baseURL);
          console.log("request headers", request.headers);
        }
        const auth = createAuth(ctx as any);
        const response = await auth.handler(request);
        if (config?.verbose) {
          console.log("response headers", response.headers);
        }
        return response;
      });
      const wellKnown = http.lookup("/.well-known/openid-configuration", "GET");

      // If registerRoutes is used multiple times, this may already be defined
      if (!wellKnown) {
        // Redirect root well-known to api well-known
        http.route({
          path: "/.well-known/openid-configuration",
          method: "GET",
          handler: httpActionGeneric(async () => {
            const url = `${process.env.CONVEX_SITE_URL}${path}/convex/.well-known/openid-configuration`;
            return Response.redirect(url);
          }),
        });
      }

      if (!opts.cors) {
        http.route({
          pathPrefix: `${path}/`,
          method: "GET",
          handler: authRequestHandler,
        });

        http.route({
          pathPrefix: `${path}/`,
          method: "POST",
          handler: authRequestHandler,
        });

        return;
      }
      const corsOpts =
        typeof opts.cors === "boolean"
          ? { allowedOrigins: [], allowedHeaders: [], exposedHeaders: [] }
          : opts.cors;
      let trustedOriginsOption:
        | string[]
        | ((request: Request) => string[] | Promise<string[]>)
        | undefined;
      const cors = corsRouter(http, {
        allowedOrigins: async (request) => {
          trustedOriginsOption =
            trustedOriginsOption ??
            (await staticAuth.$context).options.trustedOrigins ??
            [];
          const trustedOrigins = Array.isArray(trustedOriginsOption)
            ? trustedOriginsOption
            : await trustedOriginsOption(request);
          return trustedOrigins
            .map((origin) =>
              // Strip trailing wildcards, unsupported for allowedOrigins
              origin.endsWith("*") && origin.length > 1
                ? origin.slice(0, -1)
                : origin
            )
            .concat(corsOpts.allowedOrigins ?? []);
        },
        allowCredentials: true,
        allowedHeaders: [
          "Content-Type",
          "Better-Auth-Cookie",
          "Authorization",
        ].concat(corsOpts.allowedHeaders ?? []),
        exposedHeaders: ["Set-Better-Auth-Cookie"].concat(
          corsOpts.exposedHeaders ?? []
        ),
        debug: config?.verbose,
        enforceAllowOrigins: false,
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
    },
  };
};
