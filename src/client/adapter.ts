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

const paginate = async (
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
        numItems: Math.min(numItems ?? 200, limit ?? 200, 200),
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
      customTransformInput: ({ data, fieldAttributes, field }) => {
        if (data && fieldAttributes.type === "date") {
          const result = data.getTime();
          console.log("transformed input", field, result);
          return result;
        }
        return data;
      },
      customTransformOutput: ({ data, fieldAttributes, field }) => {
        if (data && fieldAttributes.type === "date") {
          const result = new Date(data);
          console.log("transformed output", field, result);
          return result;
        }
        return data;
      },
    },
    adapter: ({ schema }) => {
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
          return await ctx.runQuery(component.component.lib.findOne, {
            ...data,
            where: parseWhere(data.where),
          });
        },
        findMany: async (data): Promise<any[]> => {
          if (data.offset) {
            throw new Error("offset not supported");
          }
          if (data.where?.length === 1 && data.where[0].operator === "in") {
            return ctx.runQuery(component.component.lib.getIn, {
              ...data,
              where: parseWhere(data.where),
            });
          }
          const result = await paginate(
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
        count: async () => {
          throw new Error("count not implemented");
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
          if (
            data.model === "session" &&
            data.where?.length === 1 &&
            data.where[0].operator === "in"
          ) {
            return ctx.runMutation(component.component.lib.deleteIn, {
              input: {
                table: data.model,
                field: data.where[0].field as any,
                values: data.where[0].value as string[],
              },
            });
          }
          const result = await paginate(async ({ paginationOpts }) => {
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
          const result = await paginate(async ({ paginationOpts }) => {
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
