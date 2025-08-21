import {
  AdapterDebugLogs,
  CleanedWhere,
  createAdapter,
} from "better-auth/adapters";
import {
  createFunctionHandle,
  FunctionHandle,
  GenericActionCtx,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
  PaginationOptions,
  PaginationResult,
} from "convex/server";
import { SetOptional } from "type-fest";
import { createSchema } from "./createSchema";
import { AuthFunctions, createClient, GenericCtx } from ".";

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

type ConvexCleanedWhere = CleanedWhere & {
  value: string | number | boolean | string[] | number[] | null;
};

const parseWhere = (where?: CleanedWhere[]): ConvexCleanedWhere[] => {
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
>(
  ctx: Ctx,
  componentClient: ReturnType<typeof createClient>,
  config: {
    debugLogs?: AdapterDebugLogs;
    authFunctions?: AuthFunctions;
    triggers?: NonNullable<Parameters<typeof createClient>[1]>["triggers"];
  } = {}
) => {
  const api = componentClient.component.adapter;
  return createAdapter({
    config: {
      adapterId: "convex",
      adapterName: "Convex Adapter",
      debugLogs: config.debugLogs || false,
      disableIdGeneration: true,
      supportsNumericIds: false,
      usePlural: false,
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
      options.telemetry = { enabled: false };
      return {
        id: "convex",
        createSchema,
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
          return ctx.runMutation(api.create, {
            input: { model, data },
            select,
            onCreateHandle: onCreateHandle,
          });
        },
        findOne: async (data): Promise<any> => {
          if (data.where?.every((w) => w.connector === "OR")) {
            for (const w of data.where) {
              const result = await ctx.runQuery(api.findOne, {
                ...data,
                where: parseWhere([w]),
              });
              if (result) {
                return result;
              }
            }
          }
          return await ctx.runQuery(api.findOne, {
            ...data,
            where: parseWhere(data.where),
          });
        },
        findMany: async (data): Promise<any[]> => {
          if (data.offset) {
            throw new Error("offset not supported");
          }
          if (data.where?.some((w) => w.connector === "OR")) {
            throw new Error("OR connector not supported in findMany");
          }
          const result = await handlePagination(
            async ({ paginationOpts }) => {
              return await ctx.runQuery(api.findMany, {
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
            throw new Error("OR connector not supported in findMany");
          }
          const result = await handlePagination(async ({ paginationOpts }) => {
            return await ctx.runQuery(api.findMany, {
              ...data,
              where: parseWhere(data.where),
              paginationOpts,
            });
          });
          return result.docs?.length ?? 0;
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
            return ctx.runMutation(api.updateOne, {
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
          console.log("pre onDeleteHandle");
          const onDeleteHandle =
            config.authFunctions?.onDelete &&
            config.triggers?.[data.model]?.onDelete
              ? ((await createFunctionHandle(
                  config.authFunctions.onDelete
                )) as FunctionHandle<"mutation">)
              : undefined;
          console.log("post onDeleteHandle");
          await ctx.runMutation(api.deleteOne, {
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
          console.log("pre onDeleteHandle 2", config.authFunctions?.onDelete);
          const onDeleteHandle =
            config.authFunctions?.onDelete &&
            config.triggers?.[data.model]?.onDelete
              ? ((await createFunctionHandle(
                  config.authFunctions.onDelete
                )) as FunctionHandle<"mutation">)
              : undefined;
          console.log("post onDeleteHandle 2");
          const result = await handlePagination(async ({ paginationOpts }) => {
            console.log("paginationOpts", paginationOpts);
            return await ctx.runMutation(api.deleteMany, {
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
            throw new Error("ctx is not an action ctx");
          }
          const onUpdateHandle =
            config.authFunctions?.onUpdate &&
            config.triggers?.[data.model]?.onUpdate
              ? ((await createFunctionHandle(
                  config.authFunctions.onUpdate
                )) as FunctionHandle<"mutation">)
              : undefined;
          const result = await handlePagination(async ({ paginationOpts }) => {
            return await ctx.runMutation(api.updateMany, {
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
