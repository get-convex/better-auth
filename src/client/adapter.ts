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

const parseData = (data: {
  model: string;
  where?: CleanedWhere[];
  offset?: number;
  limit?: number;
  sortBy?: {
    field: string;
    direction: "asc" | "desc";
  };
  update?: any;
}) => {
  return {
    ...data,
    where: data.where?.map((where) => {
      if (where.value instanceof Date) {
        return {
          ...where,
          value: where.value.getTime(),
        };
      }
      return where;
    }),
  };
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
      customTransformInput: ({ data, fieldAttributes }) => {
        if (fieldAttributes.type === "date") {
          return data.getTime();
        }
        return data;
      },
      customTransformOutput: ({ data, fieldAttributes }) => {
        if (fieldAttributes.type === "date") {
          return new Date(data);
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
            input: { table: model, ...data },
          });
        },
        findOne: async (data): Promise<any> => {
          return await ctx.runQuery(
            component.component.lib.findOne,
            parseData(data)
          );
        },
        findMany: async (data): Promise<any[]> => {
          if (data.offset) {
            throw new Error("offset not supported");
          }
          if (data.where?.length === 1 && data.where[0].operator === "in") {
            return ctx.runQuery(component.component.lib.getIn, parseData(data));
          }
          const result = await paginate(
            async ({ paginationOpts }) => {
              return await ctx.runQuery(component.component.lib.findMany, {
                ...parseData(data),
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
          const { model, where, update } = parseData(data);
          if (where?.length === 1 && where[0].operator === "eq") {
            const { value, field } = where[0];
            const updateFn =
              model === "user"
                ? component.config.authFunctions.updateUser
                : component.component.lib.update;
            return ctx.runMutation(updateFn, {
              input: {
                table: model as any,
                where: {
                  field,
                  value: value as Exclude<typeof value, Date>,
                },
                value: update as any,
              },
            });
          }
          throw new Error("where clause not supported");
        },
        delete: async (data) => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not a mutation ctx");
          }
          const { model, where } = parseData(data);
          if (where?.length === 1 && where[0].operator === "eq") {
            const { field, value } = where[0];
            const deleteFn =
              model === "user"
                ? component.config.authFunctions.deleteUser
                : component.component.lib.deleteBy;
            await ctx.runMutation(deleteFn, {
              table: model,
              field,
              value: value as Exclude<typeof value, Date>,
            });
            return;
          }
          throw new Error("where clause not supported");
        },
        deleteMany: async (data) => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not a mutation ctx");
          }
          const parsedData = parseData(data);
          if (
            parsedData.model === "session" &&
            parsedData.where?.length === 1 &&
            parsedData.where[0].operator === "in"
          ) {
            return ctx.runMutation(component.component.lib.deleteIn, {
              input: {
                table: parsedData.model,
                field: parsedData.where[0].field as any,
                values: parsedData.where[0].value as string[],
              },
            });
          }
          const result = await paginate(async ({ paginationOpts }) => {
            return await ctx.runMutation(component.component.lib.deleteMany, {
              ...parsedData,
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
              ...parseData(data),
              paginationOpts,
            });
          });
          return result.count;
        },
      };
    },
  });
};
