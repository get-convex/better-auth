import {
  createAdapterFactory,
  DBAdapterDebugLogOption,
} from "better-auth/adapters";
import {
  createFunctionHandle,
  FunctionHandle,
  GenericActionCtx,
  GenericDataModel,
  PaginationOptions,
  PaginationResult,
  SchemaDefinition,
} from "convex/server";
import { SetOptional } from "type-fest";
import { AuthFunctions, GenericCtx, Triggers, UseApi } from ".";
import defaultSchema from "../component/schema";
import { api as componentApi } from "../component/_generated/api";
import { Where } from "better-auth/types";
import { asyncMap } from "convex-helpers";
import { prop, sortBy, unique } from "remeda";
import { isRunMutationCtx } from "../utils";

const handlePagination = async (
  next: ({
    paginationOpts,
  }: {
    paginationOpts: PaginationOptions;
  }) => Promise<
    SetOptional<PaginationResult<any>, "page"> & { count?: number }
  >,
  { limit, numItems }: { limit?: number; numItems?: number } = {}
) => {
  const state: {
    isDone: boolean;
    cursor: string | null;
    docs: any[];
    count: number;
  } = {
    isDone: false,
    cursor: null,
    docs: [],
    count: 0,
  };
  const onResult = (
    result: SetOptional<PaginationResult<any>, "page"> & { count?: number }
  ) => {
    state.cursor =
      result.pageStatus === "SplitRecommended" ||
      result.pageStatus === "SplitRequired"
        ? result.splitCursor ?? result.continueCursor
        : result.continueCursor;
    if (result.page) {
      state.docs.push(...result.page);
      state.isDone = (limit && state.docs.length >= limit) || result.isDone;
      return;
    }
    // Update and delete only return a count
    if (result.count) {
      state.count += result.count;
      state.isDone = (limit && state.count >= limit) || result.isDone;
      return;
    }
    state.isDone = result.isDone;
  };

  do {
    const result = await next({
      paginationOpts: {
        numItems: Math.min(
          numItems ?? 200,
          (limit ?? 200) - state.docs.length,
          200
        ),
        cursor: state.cursor,
      },
    });
    onResult(result);
  } while (!state.isDone);
  return state;
};

type ConvexCleanedWhere = Where & {
  value: string | number | boolean | string[] | number[] | null;
};

const parseWhere = (where?: Where[]): ConvexCleanedWhere[] => {
  return where?.map((where) => {
    if (where.value instanceof Date) {
      return {
        ...where,
        value: where.value.getTime(),
      };
    }
    return where;
  }) as ConvexCleanedWhere[];
};

export const convexAdapter = <
  DataModel extends GenericDataModel,
  Ctx extends GenericCtx<DataModel> = GenericActionCtx<DataModel>,
  Schema extends SchemaDefinition<any, any> = typeof defaultSchema,
>(
  ctx: Ctx,
  api: {
    adapter: SetOptional<
      UseApi<typeof componentApi>["adapter"],
      "migrationRemoveUserId"
    >;
    adapterTest?: UseApi<typeof componentApi>["adapterTest"];
  },
  config: {
    debugLogs?: DBAdapterDebugLogOption;
    authFunctions?: AuthFunctions;
    triggers?: Triggers<DataModel, Schema>;
  } = {}
) => {
  return createAdapterFactory({
    config: {
      adapterId: "convex",
      adapterName: "Convex Adapter",
      debugLogs: config.debugLogs || false,
      disableIdGeneration: true,
      transaction: false,
      supportsNumericIds: false,
      usePlural: false,
      mapKeysTransformInput: {
        id: "_id",
      },
      mapKeysTransformOutput: {
        _id: "id",
      },
      // With supportsDates: false, dates are stored as strings,
      // we convert them to numbers here. This aligns with how
      // Convex stores _creationTime, and avoids a breaking change.
      supportsDates: false,
      customTransformInput: ({ data, fieldAttributes }) => {
        if (data && fieldAttributes.type === "date") {
          return new Date(data).getTime();
        }
        return data;
      },
      customTransformOutput: ({ data, fieldAttributes }) => {
        if (data && fieldAttributes.type === "date") {
          return new Date(data).getTime();
        }
        return data;
      },
    },
    adapter: ({ options }) => {
      // Disable telemetry in all cases because it requires Node
      options.telemetry = { enabled: false };
      return {
        id: "convex",
        options: {
          isRunMutationCtx: isRunMutationCtx(ctx),
        },
        createSchema: async ({ file, tables }) => {
          const { createSchema } = await import("./createSchema");
          return createSchema({ file, tables });
        },
        create: async ({ model, data, select }): Promise<any> => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not a mutation ctx");
          }
          const onCreateHandle =
            config.authFunctions?.onCreate && config.triggers?.[model]?.onCreate
              ? ((await createFunctionHandle(
                  config.authFunctions.onCreate
                )) as FunctionHandle<"mutation">)
              : undefined;
          return ctx.runMutation(api.adapter.create, {
            input: { model, data },
            select,
            onCreateHandle: onCreateHandle,
          });
        },
        findOne: async (data): Promise<any> => {
          if (data.where?.every((w) => w.connector === "OR")) {
            for (const w of data.where) {
              const result = await ctx.runQuery(api.adapter.findOne, {
                ...data,
                where: parseWhere([w]),
              });
              if (result) {
                return result;
              }
            }
          }
          return await ctx.runQuery(api.adapter.findOne, {
            ...data,
            where: parseWhere(data.where),
          });
        },
        findMany: async (data): Promise<any[]> => {
          if (data.offset) {
            throw new Error("offset not supported");
          }
          if (data.where?.some((w) => w.connector === "OR")) {
            const results = await asyncMap(data.where, async (w) =>
              handlePagination(
                async ({ paginationOpts }) => {
                  return await ctx.runQuery(api.adapter.findMany, {
                    ...data,
                    where: parseWhere([w]),
                    paginationOpts,
                  });
                },
                { limit: data.limit }
              )
            );
            const docs = unique(results.flatMap((r) => r.docs));
            if (data.sortBy) {
              const result = sortBy(docs, [
                prop(data.sortBy.field),
                data.sortBy.direction,
              ]);
              console.log(result);
              return result;
            }
            return docs;
          }

          const result = await handlePagination(
            async ({ paginationOpts }) => {
              return await ctx.runQuery(api.adapter.findMany, {
                ...data,
                where: parseWhere(data.where),
                paginationOpts,
              });
            },
            { limit: data.limit }
          );
          return result.docs;
        },
        count: async (data) => {
          // Yes, count is just findMany returning a number.
          if (data.where?.some((w) => w.connector === "OR")) {
            const results = await asyncMap(data.where, async (w) =>
              handlePagination(async ({ paginationOpts }) => {
                return await ctx.runQuery(api.adapter.findMany, {
                  ...data,
                  where: parseWhere([w]),
                  paginationOpts,
                });
              })
            );
            const docs = unique(results.flatMap((r) => r.docs));
            return docs.length;
          }

          const result = await handlePagination(async ({ paginationOpts }) => {
            return await ctx.runQuery(api.adapter.findMany, {
              ...data,
              where: parseWhere(data.where),
              paginationOpts,
            });
          });
          return result.docs.length;
        },
        update: async (data): Promise<any> => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not a mutation ctx");
          }
          if (data.where?.length === 1 && data.where[0].operator === "eq") {
            const onUpdateHandle =
              config.authFunctions?.onUpdate &&
              config.triggers?.[data.model]?.onUpdate
                ? ((await createFunctionHandle(
                    config.authFunctions.onUpdate
                  )) as FunctionHandle<"mutation">)
                : undefined;
            return ctx.runMutation(api.adapter.updateOne, {
              input: {
                model: data.model,
                where: parseWhere(data.where),
                update: data.update as any,
              },
              onUpdateHandle: onUpdateHandle,
            });
          }
          throw new Error("where clause not supported");
        },
        delete: async (data) => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not a mutation ctx");
          }
          const onDeleteHandle =
            config.authFunctions?.onDelete &&
            config.triggers?.[data.model]?.onDelete
              ? ((await createFunctionHandle(
                  config.authFunctions.onDelete
                )) as FunctionHandle<"mutation">)
              : undefined;
          await ctx.runMutation(api.adapter.deleteOne, {
            input: {
              model: data.model,
              where: parseWhere(data.where),
            },
            onDeleteHandle: onDeleteHandle,
          });
        },
        deleteMany: async (data) => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not a mutation ctx");
          }
          const onDeleteHandle =
            config.authFunctions?.onDelete &&
            config.triggers?.[data.model]?.onDelete
              ? ((await createFunctionHandle(
                  config.authFunctions.onDelete
                )) as FunctionHandle<"mutation">)
              : undefined;
          const result = await handlePagination(async ({ paginationOpts }) => {
            return await ctx.runMutation(api.adapter.deleteMany, {
              input: {
                ...data,
                where: parseWhere(data.where),
              },
              paginationOpts,
              onDeleteHandle: onDeleteHandle,
            });
          });
          return result.count;
        },
        updateMany: async (data) => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not a mutation ctx");
          }
          const onUpdateHandle =
            config.authFunctions?.onUpdate &&
            config.triggers?.[data.model]?.onUpdate
              ? ((await createFunctionHandle(
                  config.authFunctions.onUpdate
                )) as FunctionHandle<"mutation">)
              : undefined;
          const result = await handlePagination(async ({ paginationOpts }) => {
            return await ctx.runMutation(api.adapter.updateMany, {
              input: {
                ...data,
                where: parseWhere(data.where),
              },
              paginationOpts,
              onUpdateHandle: onUpdateHandle,
            });
          });
          return result.count;
        },
      };
    },
  });
};
