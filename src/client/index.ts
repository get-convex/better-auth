import {
  type Auth as ConvexAuth,
  type DefaultFunctionArgs,
  type Expand,
  FunctionHandle,
  type FunctionReference,
  GenericActionCtx,
  type GenericDataModel,
  GenericMutationCtx,
  type GenericQueryCtx,
  type HttpRouter,
  SchemaDefinition,
  httpActionGeneric,
  internalMutationGeneric,
  mutationGeneric,
  paginationOptsValidator,
  queryGeneric,
} from "convex/server";
import { type GenericId, Infer, v } from "convex/values";
import { convexAdapter } from "./adapter";
import { AdapterInstance, betterAuth } from "better-auth";
import { asyncMap, omit } from "convex-helpers";
import { requireEnv } from "../utils";
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
import { api } from "../component/_generated/api";

export { convexAdapter };

export type CreateAdapter = <Ctx extends RunCtx>(ctx: Ctx) => AdapterInstance;

if (semver.lt(convexVersion, "1.25.0")) {
  throw new Error("Convex version must be at least 1.25.0");
}

const whereValidator = (
  schema: SchemaDefinition<any, any>,
  tableName: string
) =>
  v.object({
    field: v.union(
      ...Object.keys(schema.tables[tableName].validator.fields).map((field) =>
        v.literal(field)
      ),
      v.literal("id")
    ),
    operator: v.union(
      v.literal("lt"),
      v.literal("lte"),
      v.literal("gt"),
      v.literal("gte"),
      v.literal("eq"),
      v.literal("in"),
      v.literal("ne"),
      v.literal("contains"),
      v.literal("starts_with"),
      v.literal("ends_with")
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

export const createApi = <Schema extends SchemaDefinition<any, any>>(
  schema: Schema,
  createAuth: (ctx: GenericCtx) => ReturnType<typeof betterAuth>
) => {
  const betterAuthSchema = getAuthTables(createAuth({} as any).options);
  return {
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
            ([tableName, table]: [string, Schema["tables"][string]]) => {
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
              input: {
                model: args.input.model,
                oldDoc: doc,
                newDoc: updatedDoc,
              },
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
            ([tableName, table]: [string, Schema["tables"][string]]) => {
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
                  oldDoc: doc,
                  newDoc: await ctx.db.get(doc._id as GenericId<string>),
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
          ...Object.keys(schema.tables).map((tableName: string) => {
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
          ...Object.keys(schema.tables).map((tableName: string) => {
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

export const createClient = <
  DataModel extends GenericDataModel,
  Schema extends SchemaDefinition<any, any> = typeof defaultSchema,
>(
  component: UseApi<typeof api>,
  config?: {
    local?: {
      schema?: Schema;
    };
    authFunctions?: AuthFunctions;
    verbose?: boolean;
    triggers?: {
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
          oldDoc: Infer<Schema["tables"][K]["validator"]> & {
            _id: string;
            _creationTime: number;
          },
          newDoc: Infer<Schema["tables"][K]["validator"]> & {
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
  }
) => {
  return {
    component,
    getHeaders: async (ctx: RunQueryCtx & { auth: ConvexAuth }) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null;
      }
      const session = await ctx.runQuery(component.adapter.findOne, {
        model: "session",
        where: [
          {
            field: "userId",
            value: identity.subject,
          },
        ],
      });
      return new Headers({
        ...(session?.token ? { authorization: `Bearer ${session.token}` } : {}),
        ...(session?.ipAddress
          ? { "x-forwarded-for": session.ipAddress as string }
          : {}),
      });
    },

    getAuthUserId: async (ctx: RunQueryCtx & { auth: ConvexAuth }) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null;
      }
      return identity.subject;
    },

    getAuthUser: async (ctx: RunQueryCtx & { auth: ConvexAuth }) => {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null;
      }
      const _schema = config?.local?.schema ?? defaultSchema;

      const doc:
        | null
        | (Infer<typeof _schema.tables.user.validator> & {
            _id: string;
            _creationTime: number;
          }) = await ctx.runQuery(component.adapter.findOne, {
        model: "user",
        where: [
          {
            field: "id",
            value: identity.subject,
          },
        ],
      });
      if (!doc) {
        return null;
      }
      // Type narrowing
      if (!("emailVerified" in doc)) {
        throw new Error("invalid user");
      }
      return omit(doc, ["_id", "_creationTime"]);
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
            args.oldDoc,
            args.newDoc
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

    registerRoutes: <
      DataModel extends GenericDataModel,
      Ctx extends GenericCtx<DataModel> = GenericActionCtx<DataModel>,
    >(
      http: HttpRouter,
      createAuth: (ctx: Ctx) => ReturnType<typeof betterAuth>,
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
      const authDummy = createAuth({} as any);
      const path = authDummy.options.basePath ?? "/api/auth";
      const authRequestHandler = httpActionGeneric(async (ctx, request) => {
        if (config?.verbose) {
          console.log("options.baseURL", authDummy.options.baseURL);
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
            const url = `${requireEnv("CONVEX_SITE_URL")}${path}/convex/.well-known/openid-configuration`;
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
            (await authDummy.$context).options.trustedOrigins ??
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
        allowedHeaders: ["Content-Type", "Better-Auth-Cookie"].concat(
          corsOpts.allowedHeaders ?? []
        ),
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

/* Type utils follow */

export type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
};

export type RunMutationCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
};

export type RunActionCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
  runAction: GenericActionCtx<GenericDataModel>["runAction"];
};

export type RunCtx = RunQueryCtx | RunMutationCtx | RunActionCtx;

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
