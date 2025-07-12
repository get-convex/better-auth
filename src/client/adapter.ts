import { BetterAuth } from "./index";
import {
  AdapterDebugLogs,
  CleanedWhere,
  createAdapter,
} from "better-auth/adapters";
import {
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
  PaginationOptions,
  PaginationResult,
} from "convex/server";
import { SetOptional } from "type-fest";

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

type GenericCtx =
  | GenericQueryCtx<any>
  | GenericMutationCtx<any>
  | GenericActionCtx<any>;

interface ConvexAdapterConfig {
  /**
   * Helps you debug issues with the adapter.
   */
  debugLogs?: AdapterDebugLogs;
}
export const convexAdapter = (
  ctx: GenericCtx,
  component: BetterAuth,
  config: ConvexAdapterConfig = {}
) => {
  const { debugLogs } = config;
  return createAdapter({
    config: {
      adapterId: "convex",
      adapterName: "Convex Adapter",
      debugLogs: component.config.verbose ?? debugLogs ?? false,
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
    adapter: () => {
      return {
        id: "convex",
        create: async ({ model, data, select }): Promise<any> => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not a mutation ctx");
          }
          if (select) {
            throw new Error("select is not supported");
          }
          const createFn =
            model === "user"
              ? component.config.authFunctions.createUser
              : model === "session"
                ? component.config.authFunctions.createSession
                : component.component.lib.create;
          return await ctx.runMutation(createFn, {
            input: { model, data },
          });
        },
        findOne: async (data): Promise<any> => {
          if (data.where?.every((w) => w.connector === "OR")) {
            for (const w of data.where) {
              const result = await ctx.runQuery(
                component.component.lib.findOne,
                {
                  ...data,
                  where: parseWhere([w]),
                }
              );
              if (result) {
                return result;
              }
            }
          }
          return await ctx.runQuery(component.component.lib.findOne, {
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
              return await ctx.runQuery(component.component.lib.findMany, {
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
            return await ctx.runQuery(component.component.lib.findMany, {
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
            const updateFn =
              data.model === "user"
                ? component.config.authFunctions.updateUser
                : component.component.lib.updateOne;
            return ctx.runMutation(updateFn, {
              input: {
                model: data.model,
                where: parseWhere(data.where),
                update: data.update as any,
              },
            });
          }
          throw new Error("where clause not supported");
        },
        delete: async (data) => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not a mutation ctx");
          }
          const deleteFn =
            data.model === "user"
              ? component.config.authFunctions.deleteUser
              : component.component.lib.deleteOne;
          await ctx.runMutation(deleteFn, {
            model: data.model,
            where: parseWhere(data.where),
          });
          return;
        },
        deleteMany: async (data) => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not a mutation ctx");
          }
          const result = await handlePagination(async ({ paginationOpts }) => {
            return await ctx.runMutation(component.component.lib.deleteMany, {
              ...data,
              where: parseWhere(data.where),
              paginationOpts,
            });
          });
          return result.count;
        },
        updateMany: async (data) => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not an action ctx");
          }
          const result = await handlePagination(async ({ paginationOpts }) => {
            return await ctx.runMutation(component.component.lib.updateMany, {
              input: {
                ...data,
                where: parseWhere(data.where),
                paginationOpts,
              },
            });
          });
          return result.count;
        },
      };
    },
  });
};
