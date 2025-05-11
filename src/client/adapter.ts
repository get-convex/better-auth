import { GenericActionCtx, GenericDataModel } from "convex/server";
import { AuthApi, UseApi } from "./index";
import { api } from "../component/_generated/api";
import { transformInput } from "../component/lib";
import { createAdapter } from "better-auth/adapters";

export const convexAdapter = <
  DataModel extends GenericDataModel,
  Ctx extends GenericActionCtx<DataModel>,
>(
  ctx: Ctx,
  component: UseApi<typeof api>,
  config: {
    verbose?: boolean;
    authApi: AuthApi;
  }
) =>
  createAdapter({
    config: {
      adapterId: "convex",
      adapterName: "Convex Adapter",
      debugLogs: config.verbose ?? false,
      disableIdGeneration: true,
    },
    adapter: ({ schema }) => {
      return {
        id: "convex",
        create: async ({ model, data, select }): Promise<any> => {
          if (select) {
            throw new Error("select is not supported");
          }
          const createFn =
            model === "user"
              ? config.authApi.createUser
              : model === "session" && config.authApi.createSession
                ? config.authApi.createSession
                : component.lib.create;
          return ctx.runMutation(createFn, {
            input: { table: model, ...transformInput(model, data) },
          });
        },
        findOne: async ({ model, where }): Promise<any> => {
          if (where.length === 1 && where[0].operator === "eq") {
            const { value, field } = where[0];
            const result = await ctx.runQuery(component.lib.getBy, {
              table: model,
              field,
              unique:
                field === "id" ? true : schema[model].fields[field].unique,
              value: value instanceof Date ? value.getTime() : value,
            });
            console.log("result", result);
            return result;
          }
          if (
            model === "account" &&
            where.length === 2 &&
            where[0].field === "accountId" &&
            where[1].field === "providerId" &&
            where[0].connector === "AND"
          ) {
            return ctx.runQuery(
              component.lib.getAccountByAccountIdAndProviderId,
              {
                accountId: where[0].value as string,
                providerId: where[1].value as string,
              }
            );
          }
          throw new Error("where clause not supported");
        },
        findMany: async ({ model, where, sortBy, offset }): Promise<any[]> => {
          if (offset) {
            throw new Error("where clause not supported");
          }
          if (
            model === "jwks" &&
            !where &&
            sortBy?.field === "createdAt" &&
            sortBy?.direction === "desc"
          ) {
            return ctx.runQuery(component.lib.getJwks);
          }
          if (where?.length !== 1 || where[0].operator !== "eq") {
            throw new Error("where clause not supported");
          }
          if (offset) {
            throw new Error("offset not supported");
          }
          if (model === "account" && where[0].field === "userId") {
            return ctx.runQuery(component.lib.getAccountsByUserId, {
              userId: where[0].value as any,
            });
          }
          if (model === "verification" && where[0].field === "identifier") {
            return ctx.runQuery(component.lib.listVerificationsByIdentifier, {
              identifier: where[0].value as string,
              sortBy,
            });
          }
          throw new Error("where clause not supported");
        },
        count: async ({ where }) => {
          throw new Error("count not implemented");
          // return 0;
        },
        update: async ({ model, where, update }): Promise<any> => {
          if (where?.length === 1 && where[0].operator === "eq") {
            const { value, field } = where[0];
            const updateFn =
              model === "user" && config.authApi.updateUser
                ? config.authApi.updateUser
                : component.lib.update;
            return ctx.runMutation(updateFn, {
              input: {
                table: model as any,
                where: {
                  field,
                  value: value instanceof Date ? value.getTime() : value,
                },
                value: transformInput(model, update as any),
              },
            });
          }
          throw new Error("where clause not supported");
        },
        delete: async ({ model, where }) => {
          if (where?.length === 1 && where[0].operator === "eq") {
            const { field, value } = where[0];
            const deleteFn =
              model === "user"
                ? config.authApi.deleteUser
                : component.lib.deleteBy;
            await ctx.runMutation(deleteFn, {
              table: model,
              field,
              value: value instanceof Date ? value.getTime() : value,
            });
            return;
          }
          throw new Error("where clause not supported");
          // return null
        },
        deleteMany: async ({ model, where }) => {
          if (
            model === "verification" &&
            where?.length === 1 &&
            where[0].operator === "lt" &&
            where[0].field === "expiresAt"
          ) {
            return ctx.runAction(component.lib.deleteOldVerifications, {
              currentTimestamp: Date.now(),
            });
          }
          if (where?.length === 1 && where[0].field === "userId") {
            return ctx.runAction(component.lib.deleteAllForUser, {
              table: model,
              userId: where[0].value as any,
            });
          }
          throw new Error("where clause not supported");
          // return count;
        },
        updateMany: async ({ where }) => {
          throw new Error("updateMany not implemented");
          //return 0;
          /*
          const { model, where, update } = data;
          const table = db[model];
          const res = convertWhereClause(where, table, model);
          res.forEach((record) => {
            Object.assign(record, update);
          });
          return res[0] || null;
          */
        },
      };
    },
  });
