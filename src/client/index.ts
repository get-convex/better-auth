import {
  type DataModelFromSchemaDefinition,
  type DefaultFunctionArgs,
  type FunctionHandle,
  type FunctionReference,
  type GenericActionCtx,
  type GenericDataModel,
  type GenericMutationCtx,
  type GenericQueryCtx,
  type GenericSchema,
  type HttpRouter,
  type SchemaDefinition,
  httpActionGeneric,
  internalMutationGeneric,
  mutationGeneric,
  paginationOptsValidator,
  queryGeneric,
} from "convex/server";
import { type GenericId, type Infer, v } from "convex/values";
import { convexAdapter } from "./adapter";
import { type Auth, betterAuth } from "better-auth";
import type { DBAdapterInstance } from "better-auth/adapters";
import { asyncMap } from "convex-helpers";
import { partial } from "convex-helpers/validators";
import {
  adapterWhereValidator,
  checkUniqueFields,
  hasUniqueFields,
  listOne,
  paginate,
  selectFields,
} from "./adapterUtils";
import { corsRouter } from "convex-helpers/server/cors";
import { version as convexVersion } from "convex";
import semver from "semver";
import defaultSchema from "../component/schema";
import { getAuthTables } from "better-auth/db";
import type { SetOptional } from "type-fest";
import type { ComponentApi } from "../component/_generated/component";
import type { TableNames } from "../component/_generated/dataModel";

export { convexAdapter };

export type CreateAdapter = <Ctx extends GenericCtx<GenericDataModel>>(
  ctx: Ctx
) => DBAdapterInstance;

export type CreateAuth<
  DataModel extends GenericDataModel,
  A extends ReturnType<typeof betterAuth> = Auth,
> =
  | ((ctx: GenericCtx<DataModel>) => A)
  | ((ctx: GenericCtx<DataModel>, opts?: { optionsOnly?: boolean }) => A);

export const getStaticAuth = <
  DataModel extends GenericDataModel,
  Auth extends ReturnType<typeof betterAuth>,
>(
  createAuth: CreateAuth<DataModel, Auth>
): Auth => {
  return createAuth({} as any, { optionsOnly: true });
};

if (semver.lt(convexVersion, "1.25.0")) {
  throw new Error("Convex version must be at least 1.25.0");
}

const whereValidator = (
  schema: SchemaDefinition<any, any>,
  tableName: TableNames
) =>
  v.object({
    field: v.union(
      ...Object.keys(schema.tables[tableName].validator.fields).map((field) =>
        v.literal(field)
      ),
      v.literal("_id")
    ),
    operator: v.optional(
      v.union(
        v.literal("lt"),
        v.literal("lte"),
        v.literal("gt"),
        v.literal("gte"),
        v.literal("eq"),
        v.literal("in"),
        v.literal("not_in"),
        v.literal("ne"),
        v.literal("contains"),
        v.literal("starts_with"),
        v.literal("ends_with")
      )
    ),
    value: v.union(
      v.string(),
      v.number(),
      v.boolean(),
      v.array(v.string()),
      v.array(v.number()),
      v.null()
    ),
    connector: v.optional(v.union(v.literal("AND"), v.literal("OR"))),
  });

export type EventFunction<T extends DefaultFunctionArgs> = FunctionReference<
  "mutation",
  "internal" | "public",
  T
>;

export type GenericCtx<DataModel extends GenericDataModel = GenericDataModel> =
  | GenericQueryCtx<DataModel>
  | GenericMutationCtx<DataModel>
  | GenericActionCtx<DataModel>;

export type AuthFunctions = {
  onCreate?: FunctionReference<"mutation", "internal", { [key: string]: any }>;
  onUpdate?: FunctionReference<"mutation", "internal", { [key: string]: any }>;
  onDelete?: FunctionReference<"mutation", "internal", { [key: string]: any }>;
};

export const createApi = <
  DataModel extends GenericDataModel,
  Schema extends SchemaDefinition<any, any>,
>(
  schema: Schema,
  createAuth: CreateAuth<DataModel>
) => {
  const betterAuthSchema = getAuthTables(getStaticAuth(createAuth).options);
  return {
    migrationRemoveUserId: mutationGeneric({
      args: {
        userId: v.string(),
      },
      handler: async (ctx, args) => {
        await ctx.db.patch(args.userId as GenericId<"user">, {
          userId: undefined,
        });
      },
    }),
    create: mutationGeneric({
      args: {
        input: v.union(
          ...Object.entries(schema.tables).map(([model, table]) =>
            v.object({
              model: v.literal(model),
              data: v.object((table as any).validator.fields),
            })
          )
        ),
        select: v.optional(v.array(v.string())),
        onCreateHandle: v.optional(v.string()),
      },
      handler: async (ctx, args) => {
        await checkUniqueFields(
          ctx,
          schema,
          betterAuthSchema,
          args.input.model,
          args.input.data
        );
        const id = await ctx.db.insert(
          args.input.model as any,
          args.input.data
        );
        const doc = await ctx.db.get(id);
        if (!doc) {
          throw new Error(`Failed to create ${args.input.model}`);
        }
        const result = selectFields(doc, args.select);
        if (args.onCreateHandle) {
          await ctx.runMutation(
            args.onCreateHandle as FunctionHandle<"mutation">,
            {
              model: args.input.model,
              doc,
            }
          );
        }
        return result;
      },
    }),
    findOne: queryGeneric({
      args: {
        model: v.union(
          ...Object.keys(schema.tables).map((model) => v.literal(model))
        ),
        where: v.optional(v.array(adapterWhereValidator)),
        select: v.optional(v.array(v.string())),
      },
      handler: async (ctx, args) => {
        return await listOne(ctx, schema, betterAuthSchema, args);
      },
    }),
    findMany: queryGeneric({
      args: {
        model: v.union(
          ...Object.keys(schema.tables).map((model) => v.literal(model))
        ),
        where: v.optional(v.array(adapterWhereValidator)),
        limit: v.optional(v.number()),
        sortBy: v.optional(
          v.object({
            direction: v.union(v.literal("asc"), v.literal("desc")),
            field: v.string(),
          })
        ),
        offset: v.optional(v.number()),
        paginationOpts: paginationOptsValidator,
      },
      handler: async (ctx, args) => {
        return await paginate(ctx, schema, betterAuthSchema, args);
      },
    }),
    updateOne: mutationGeneric({
      args: {
        input: v.union(
          ...Object.entries(schema.tables).map(
            ([name, table]: [string, Schema["tables"][string]]) => {
              const tableName = name as TableNames;
              const fields = partial(table.validator.fields);
              return v.object({
                model: v.literal(tableName),
                update: v.object(fields),
                where: v.optional(v.array(whereValidator(schema, tableName))),
              });
            }
          )
        ),
        onUpdateHandle: v.optional(v.string()),
      },
      handler: async (ctx, args) => {
        const doc = await listOne(ctx, schema, betterAuthSchema, args.input);
        if (!doc) {
          throw new Error(`Failed to update ${args.input.model}`);
        }
        await checkUniqueFields(
          ctx,
          schema,
          betterAuthSchema,
          args.input.model,
          args.input.update,
          doc
        );
        await ctx.db.patch(
          doc._id as GenericId<string>,
          args.input.update as any
        );
        const updatedDoc = await ctx.db.get(doc._id as GenericId<string>);
        if (!updatedDoc) {
          throw new Error(`Failed to update ${args.input.model}`);
        }
        if (args.onUpdateHandle) {
          await ctx.runMutation(
            args.onUpdateHandle as FunctionHandle<"mutation">,
            {
              model: args.input.model,
              newDoc: updatedDoc,
              oldDoc: doc,
            }
          );
        }
        return updatedDoc;
      },
    }),
    updateMany: mutationGeneric({
      args: {
        input: v.union(
          ...Object.entries(schema.tables).map(
            ([name, table]: [string, Schema["tables"][string]]) => {
              const tableName = name as TableNames;
              const fields = partial(table.validator.fields);
              return v.object({
                model: v.literal(tableName),
                update: v.object(fields),
                where: v.optional(v.array(whereValidator(schema, tableName))),
              });
            }
          )
        ),
        paginationOpts: paginationOptsValidator,
        onUpdateHandle: v.optional(v.string()),
      },
      handler: async (ctx, args) => {
        const { page, ...result } = await paginate(
          ctx,
          schema,
          betterAuthSchema,
          {
            ...args.input,
            paginationOpts: args.paginationOpts,
          }
        );
        if (args.input.update) {
          if (
            hasUniqueFields(
              betterAuthSchema,
              args.input.model,
              args.input.update ?? {}
            ) &&
            page.length > 1
          ) {
            throw new Error(
              `Attempted to set unique fields in multiple documents in ${args.input.model} with the same value. Fields: ${Object.keys(args.input.update ?? {}).join(", ")}`
            );
          }
          await asyncMap(page, async (doc) => {
            await checkUniqueFields(
              ctx,
              schema,
              betterAuthSchema,
              args.input.model,
              args.input.update ?? {},
              doc
            );
            await ctx.db.patch(
              doc._id as GenericId<string>,
              args.input.update as any
            );

            if (args.onUpdateHandle) {
              await ctx.runMutation(
                args.onUpdateHandle as FunctionHandle<"mutation">,
                {
                  model: args.input.model,
                  newDoc: await ctx.db.get(doc._id as GenericId<string>),
                  oldDoc: doc,
                }
              );
            }
          });
        }
        return {
          ...result,
          count: page.length,
          ids: page.map((doc) => doc._id),
        };
      },
    }),
    deleteOne: mutationGeneric({
      args: {
        input: v.union(
          ...Object.keys(schema.tables).map((name: string) => {
            const tableName = name as TableNames;
            return v.object({
              model: v.literal(tableName),
              where: v.optional(v.array(whereValidator(schema, tableName))),
            });
          })
        ),
        onDeleteHandle: v.optional(v.string()),
      },
      handler: async (ctx, args) => {
        const doc = await listOne(ctx, schema, betterAuthSchema, args.input);
        if (!doc) {
          return;
        }
        await ctx.db.delete(doc._id as GenericId<string>);
        if (args.onDeleteHandle) {
          await ctx.runMutation(
            args.onDeleteHandle as FunctionHandle<"mutation">,
            { model: args.input.model, doc }
          );
        }
        return doc;
      },
    }),
    deleteMany: mutationGeneric({
      args: {
        input: v.union(
          ...Object.keys(schema.tables).map((name: string) => {
            const tableName = name as TableNames;
            return v.object({
              model: v.literal(tableName),
              where: v.optional(v.array(whereValidator(schema, tableName))),
            });
          })
        ),
        paginationOpts: paginationOptsValidator,
        onDeleteHandle: v.optional(v.string()),
      },
      handler: async (ctx, args) => {
        const { page, ...result } = await paginate(
          ctx,
          schema,
          betterAuthSchema,
          {
            ...args.input,
            paginationOpts: args.paginationOpts,
          }
        );
        await asyncMap(page, async (doc) => {
          if (args.onDeleteHandle) {
            await ctx.runMutation(
              args.onDeleteHandle as FunctionHandle<"mutation">,
              {
                model: args.input.model,
                doc,
              }
            );
          }
          await ctx.db.delete(doc._id as GenericId<string>);
        });
        return {
          ...result,
          count: page.length,
          ids: page.map((doc) => doc._id),
        };
      },
    }),
  };
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

export const createClient = <
  DataModel extends GenericDataModel,
  Schema extends SchemaDefinition<GenericSchema, true> = typeof defaultSchema,
>(
  component: {
    adapter: SetOptional<ComponentApi["adapter"], "migrationRemoveUserId">;
    adapterTest?: ComponentApi["adapterTest"];
  },
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
        if (!config?.verbose) {
          console.log("options.baseURL", staticAuth.options.baseURL);
          console.log("request headers", request.headers);
        }
        const nodeENV =
          (typeof process !== "undefined" &&
            process.env &&
            process.env.NODE_ENV) ||
          "";
        const isProduction = nodeENV === "production";
        const auth = createAuth(ctx as any);
        const secure =
          auth.options.advanced?.useSecureCookies !== undefined
            ? auth.options.advanced?.useSecureCookies
            : auth.options.baseURL !== undefined
              ? auth.options.baseURL.startsWith("https://")
                ? true
                : false
              : isProduction;
        const response = await auth.handler(request);
        console.log({ nodeENV, isProduction, secure });
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
