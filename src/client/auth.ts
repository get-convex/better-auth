import { Adapter, BetterAuthOptions } from "better-auth";
import {
  createFunctionHandle,
  FunctionReference,
  GenericActionCtx,
  GenericDataModel,
} from "convex/server";
import { UseApi, BetterAuth } from "./index";
import { api } from "../component/_generated/api";
import { transformInput } from "../component/lib";
import { getSchema } from "better-auth/db";

const getFunctionHandle = <T extends FunctionReference<any, any, any, any>>(
  fn?: T
) => {
  if (!fn) {
    throw Error("Function reference is undefined");
  }
  return createFunctionHandle(fn);
};

export const database =
  <O extends BetterAuthOptions>(
    ctx: GenericActionCtx<GenericDataModel>,
    component: UseApi<typeof api>,
    betterAuthOptions: O,
    config: InstanceType<typeof BetterAuth>["config"]
  ) =>
  (): Adapter => {
    return {
      id: "convex",
      create: async ({ model, data, select }): Promise<any> => {
        if (config?.verbose) {
          console.log({ fn: "create", model, data, select });
        }
        if (select) {
          throw new Error("select is not supported");
        }
        const createFn =
          model === "user" ? component.lib.createUser : component.lib.create;
        return ctx.runMutation(createFn, {
          input: {
            table: model,
            ...transformInput(model, data),
          },
          ...(model === "user"
            ? {
                createHandle: await getFunctionHandle(config.createUser),
              }
            : {}),
          onCreateHandle:
            (config?.onCreateSession &&
              model === "session" &&
              (await createFunctionHandle(config.onCreateSession))) ||
            undefined,
        });
      },
      findOne: async ({ model, where, select }): Promise<any> => {
        if (config?.verbose) {
          console.log({ fn: "findOne", model, where, select });
        }
        if (where.some((w) => w.operator || w.connector)) {
          throw new Error(
            "where clause with operator or connector is not supported"
          );
        }
        if (where.length === 1) {
          const { value, field } = where[0];
          const schema = getSchema(betterAuthOptions);
          const result = await ctx.runQuery(component.lib.getBy, {
            table: model,
            field,
            unique: field === "id" ? true : schema[model].fields[field].unique,
            value: value instanceof Date ? value.getTime() : value,
          });
          if (config?.verbose) {
            console.log("result", result);
          }
          return result;
        }
        if (
          model === "account" &&
          where.length === 2 &&
          where[0].field === "accountId" &&
          where[1].field === "providerId"
        ) {
          return ctx.runQuery(
            component.lib.getAccountByAccountIdAndProviderId,
            {
              accountId: where[0].value as string,
              providerId: where[1].value as string,
            }
          );
        }
        throw new Error("no matching function found");
      },
      findMany: async ({
        model,
        where,
        sortBy,
        limit,
        offset,
      }): Promise<any[]> => {
        if (config?.verbose) {
          console.log({
            fn: "findMany",
            model,
            where,
            sortBy,
            limit,
            offset,
          });
        }
        if (where?.some((w) => w.operator || w.connector)) {
          throw new Error(
            "where clause with operator or connector is not supported"
          );
        }
        if (
          model === "account" &&
          where?.length === 1 &&
          where[0].field === "userId"
        ) {
          return ctx.runQuery(component.lib.getAccountsByUserId, {
            userId: where[0].value as any,
          });
        }
        if (model === "jwks") {
          return ctx.runQuery(component.lib.getJwks);
        }
        if (
          model === "verification" &&
          where?.length === 1 &&
          where[0].field === "identifier" &&
          !offset
        ) {
          return ctx.runQuery(component.lib.listVerificationsByIdentifier, {
            identifier: where[0].value as string,
            sortBy,
          });
        }
        throw new Error("no matching function found");
      },
      count: async ({ model, where }) => {
        if (config?.verbose) {
          console.log({ fn: "count", model, where });
        }
        if (where?.some((w) => w.operator || w.connector)) {
          throw new Error(
            "where clause with operator or connector is not supported"
          );
        }
        throw new Error("Not implemented");
        // return 0;
      },
      update: async ({ model, where, update }): Promise<any> => {
        if (config?.verbose) {
          console.log({ fn: "update", model, where, update });
        }
        if (where?.some((w) => w.operator || w.connector)) {
          throw new Error(
            "where clause with operator or connector is not supported"
          );
        }
        if (where?.length === 1) {
          const { value, field } = where[0];
          const updateFn =
            model === "user" ? component.lib.updateUser : component.lib.update;
          return ctx.runMutation(updateFn, {
            input: {
              table: model as any,
              where: {
                field,
                value: value instanceof Date ? value.getTime() : value,
              },
              value: transformInput(model, update),
            },
            ...(model === "user"
              ? {
                  updateHandle: await getFunctionHandle(config.updateUser),
                }
              : {}),
          });
        }
        throw new Error("Not implemented");
      },
      delete: async ({ model, where }) => {
        if (config?.verbose) {
          console.log({ fn: "delete", model, where });
        }
        if (where?.some((w) => w.operator || w.connector)) {
          throw new Error(
            "where clause with operator or connector is not supported"
          );
        }
        if (where?.length === 1) {
          const { field, value } = where[0];
          const deleteFn =
            model === "user"
              ? component.lib.deleteUser
              : component.lib.deleteBy;
          await ctx.runMutation(deleteFn, {
            table: model,
            field,
            value: value instanceof Date ? value.getTime() : value,
            ...(model === "user"
              ? {
                  deleteHandle: await getFunctionHandle(config.deleteUser),
                }
              : {}),
          });
          return;
        }
        throw new Error("no matching function found");
        // return null
      },
      deleteMany: async ({ model, where }) => {
        if (config?.verbose) {
          console.log({ fn: "deleteMany", model, where });
        }
        if (where?.some((w) => w.connector)) {
          throw new Error("where clause with connector is not supported");
        }
        if (
          model === "verification" &&
          where?.length === 1 &&
          where[0].operator === "lt" &&
          where[0].field === "expiresAt" &&
          !where[0].connector
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
        throw new Error("no matching function found");
        // return count;
      },
      updateMany: async ({ model, where, update }) => {
        if (config?.verbose) {
          console.log({ fn: "updateMany", model, where, update });
        }
        if (where?.some((w) => w.operator || w.connector)) {
          throw new Error(
            "where clause with operator or connector is not supported"
          );
        }
        throw new Error("Not implemented");
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
    } satisfies Adapter;
  };
