import { BetterAuth } from "./index";
import { transformInput } from "../component/lib";
import { createAdapter } from "better-auth/adapters";
import {
  GenericActionCtx,
  GenericMutationCtx,
  GenericQueryCtx,
} from "convex/server";

export const convexAdapter = <
  Ctx extends
    | GenericQueryCtx<any>
    | GenericMutationCtx<any>
    | GenericActionCtx<any>,
>(
  ctx: Ctx,
  component: BetterAuth
) =>
  createAdapter({
    config: {
      adapterId: "convex",
      adapterName: "Convex Adapter",
      debugLogs: component.config.verbose ?? false,
      disableIdGeneration: true,
    },
    adapter: ({ schema }) => {
      return {
        id: "convex",
        create: async ({ model, data, select }): Promise<any> => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not an action ctx");
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
          return ctx.runMutation(createFn, {
            input: { table: model, ...transformInput(model, data) },
          });
        },
        findOne: async ({ model, where }): Promise<any> => {
          if (where.length === 1 && where[0].operator === "eq") {
            const { value, field } = where[0];
            const result = await ctx.runQuery(component.component.lib.getBy, {
              table: model,
              field,
              unique:
                field === "id" ? true : schema[model].fields[field].unique,
              value: value instanceof Date ? value.getTime() : value,
            });
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
              component.component.lib.getAccountByAccountIdAndProviderId,
              {
                accountId: where[0].value as string,
                providerId: where[1].value as string,
              }
            );
          }
          throw new Error("where clause not supported");
        },
        findMany: async ({
          model,
          where,
          sortBy,
          offset,
          limit,
        }): Promise<any[]> => {
          if (offset) {
            throw new Error("offset not supported");
          }
          if (
            model === "jwks" &&
            !where &&
            (!sortBy ||
              (sortBy?.field === "createdAt" && sortBy?.direction === "desc"))
          ) {
            return ctx.runQuery(component.component.lib.getJwks, { limit });
          }
          if (
            where?.length !== 1 ||
            (where[0].operator && where[0].operator !== "eq")
          ) {
            throw new Error("where clause not supported");
          }
          if (model === "verification" && where[0].field === "identifier") {
            return ctx.runQuery(
              component.component.lib.listVerificationsByIdentifier,
              {
                identifier: where[0].value as string,
                sortBy,
                limit,
              }
            );
          }
          if (model === "account" && where[0].field === "userId" && !sortBy) {
            return ctx.runQuery(component.component.lib.getAccountsByUserId, {
              userId: where[0].value as any,
              limit,
            });
          }
          if (model === "session" && where[0].field === "userId" && !sortBy) {
            return ctx.runQuery(component.component.lib.getSessionsByUserId, {
              userId: where[0].value as any,
              limit,
            });
          }
          throw new Error("where clause not supported");
        },
        count: async ({ where }) => {
          throw new Error("count not implemented");
          // return 0;
        },
        update: async ({ model, where, update }): Promise<any> => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not an action ctx");
          }
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
                  value: value instanceof Date ? value.getTime() : value,
                },
                value: transformInput(model, update as any),
              },
            });
          }
          throw new Error("where clause not supported");
        },
        delete: async ({ model, where }) => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not an action ctx");
          }
          if (where?.length === 1 && where[0].operator === "eq") {
            const { field, value } = where[0];
            const deleteFn =
              model === "user"
                ? component.config.authFunctions.deleteUser
                : component.component.lib.deleteBy;
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
          if (!("runAction" in ctx)) {
            throw new Error("ctx is not an action ctx");
          }
          if (
            model === "verification" &&
            where?.length === 1 &&
            where[0].operator === "lt" &&
            where[0].field === "expiresAt"
          ) {
            return ctx.runAction(
              component.component.lib.deleteOldVerifications,
              {
                currentTimestamp: Date.now(),
              }
            );
          }
          if (where?.length === 1 && where[0].field === "userId") {
            return ctx.runAction(component.component.lib.deleteAllForUser, {
              table: model,
              userId: where[0].value as any,
            });
          }
          if (
            model === "session" &&
            where?.length === 2 &&
            where[0].operator === "eq" &&
            where[0].connector === "AND" &&
            where[0].field === "userId" &&
            where[1].operator === "lte" &&
            where[1].field === "expiresAt" &&
            typeof where[1].value === "number"
          ) {
            return ctx.runMutation(
              component.component.lib.deleteExpiredSessions,
              {
                userId: where[0].value as string,
                expiresAt: where[1].value as number,
              }
            );
          }
          throw new Error("where clause not supported");
          // return count;
        },
        updateMany: async ({ model, where, update }) => {
          if (!("runMutation" in ctx)) {
            throw new Error("ctx is not an action ctx");
          }
          if (
            model === "twoFactor" &&
            where?.length === 1 &&
            where[0].operator === "eq" &&
            where[0].field === "userId"
          ) {
            return ctx.runMutation(component.component.lib.updateTwoFactor, {
              userId: where[0].value as string,
              update: transformInput(model, update as any),
            });
          }
          if (
            model === "account" &&
            where?.length === 2 &&
            where[0].operator === "eq" &&
            where[0].connector === "AND" &&
            where[0].field === "userId" &&
            where[1].operator === "eq" &&
            where[1].field === "providerId"
          ) {
            return ctx.runMutation(
              component.component.lib.updateUserProviderAccounts,
              {
                userId: where[0].value as string,
                providerId: where[1].value as string,
                update: transformInput(model, update as any),
              }
            );
          }
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
