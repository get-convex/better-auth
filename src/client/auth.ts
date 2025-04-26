import { Adapter, betterAuth, BetterAuthOptions } from "better-auth";
import { createAuthMiddleware, jwt } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";
import { oidcProvider } from "better-auth/plugins";
import { oneTimeToken } from "better-auth/plugins/one-time-token";
import { Id } from "../component/_generated/dataModel";
import {
  createFunctionHandle,
  GenericActionCtx,
  GenericDataModel,
} from "convex/server";
import { OnDeleteUser, OnCreateUser, OnCreateSession, UseApi } from "./index";
import { api } from "../component/_generated/api";
import { transformInput } from "../component/auth";
import { generateRandomString } from "better-auth/crypto";

export const auth = (
  database: () => Adapter,
  config: BetterAuthOptions
): ReturnType<typeof betterAuth> => {
  return betterAuth({
    ...config,
    plugins: [
      ...(config.plugins || []),
      oidcProvider({
        loginPage: "/not-used",
      }),
      bearer(),
      jwt({
        jwt: {
          issuer: `${process.env.CONVEX_SITE_URL}`,
          audience: "convex",
          definePayload: (session) => ({
            sub: `${session.user.id}|${session.session.id}`,
          }),
        },
        jwks: {
          //disablePrivateKeyEncryption: true,
          keyPairConfig: {
            alg: "RS256",
            extractable: true,
          } as any,
        },
      }),
      oneTimeToken({ disableClientRequest: true }),
    ],
    database,
    hooks: {
      // Mostly copied from better-auth/plugins/one-time-token/src/index.ts,
      // pending redirect handling to be added to that plugin.
      after: createAuthMiddleware(async (ctx) => {
        // Only run for /callback/:id
        if (!ctx.path.startsWith("/callback/") || !ctx.params.id) {
          return;
        }
        const session = ctx.context.newSession;
        if (!session) {
          console.error("No session found");
          return;
        }
        const token = generateRandomString(32);
        const expiresAt = new Date(Date.now() + 3 * 60 * 1000);
        await ctx.context.internalAdapter.createVerificationValue({
          value: session.session.token,
          identifier: `one-time-token:${token}`,
          expiresAt,
        });
        const redirectTo = ctx.context.responseHeaders?.get("location");
        if (!redirectTo) {
          console.error("No redirect to found");
          return;
        }
        const url = new URL(redirectTo);
        url.searchParams.set("ott", token);
        throw ctx.redirect(url.toString());
      }),
    },
  });
};

export const database =
  (
    ctx: GenericActionCtx<GenericDataModel>,
    component: UseApi<typeof api>,
    config?: {
      onCreateUser?: OnCreateUser;
      onDeleteUser?: OnDeleteUser;
      onCreateSession?: OnCreateSession;
    }
  ) =>
  (): Adapter =>
    ({
      id: "convex",
      create: async ({ model, data, select }): Promise<any> => {
        console.log({ fn: "create", model, data, select });
        if (select) {
          throw new Error("select is not supported");
        }
        return ctx.runMutation(component.auth.create, {
          input: {
            table: model,
            ...transformInput(model, data),
          },
          onCreateHandle:
            (config?.onCreateUser &&
              model === "user" &&
              (await createFunctionHandle(config.onCreateUser))) ||
            (config?.onCreateSession &&
              model === "session" &&
              (await createFunctionHandle(config.onCreateSession))) ||
            undefined,
        });
      },
      findOne: async ({ model, where, select }): Promise<any> => {
        console.log({ fn: "findOne", model, where, select });
        if (where.some((w) => w.operator || w.connector)) {
          throw new Error(
            "where clause with operator or connector is not supported"
          );
        }
        if (where.length === 1) {
          const { value, field } = where[0];
          const result = await ctx.runQuery(component.auth.getBy, {
            table: model,
            field,
            value: value instanceof Date ? value.getTime() : value,
          });
          console.log("result", result);
          return result;
        }
        if (
          model === "account" &&
          where.length === 2 &&
          where[0].field === "accountId" &&
          where[1].field === "providerId"
        ) {
          return ctx.runQuery(
            component.auth.getAccountByAccountIdAndProviderId,
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
        console.log({
          fn: "findMany",
          model,
          where,
          sortBy,
          limit,
          offset,
        });
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
          return ctx.runQuery(component.auth.getAccountsByUserId, {
            userId: where[0].value as Id<"user">,
          });
        }
        if (model === "jwks") {
          return ctx.runQuery(component.auth.getJwks);
        }
        if (
          model === "verification" &&
          where?.length === 1 &&
          where[0].field === "identifier" &&
          !offset
        ) {
          return ctx.runQuery(component.auth.listVerificationsByIdentifier, {
            identifier: where[0].value as string,
            sortBy,
          });
        }
        throw new Error("no matching function found");
      },
      count: async ({ model, where }) => {
        console.log({ fn: "count", model, where });
        if (where?.some((w) => w.operator || w.connector)) {
          throw new Error(
            "where clause with operator or connector is not supported"
          );
        }
        throw new Error("Not implemented");
        // return 0;
      },
      update: async ({ model, where, update }): Promise<any> => {
        console.log({ fn: "update", model, where, update });
        if (where?.some((w) => w.operator || w.connector)) {
          throw new Error(
            "where clause with operator or connector is not supported"
          );
        }
        if (where?.length === 1) {
          const { value, field } = where[0];
          return ctx.runMutation(component.auth.update, {
            input: {
              table: model as any,
              where: {
                field,
                value: value instanceof Date ? value.getTime() : value,
              },
              value: transformInput(model, update),
            },
          });
        }
        throw new Error("Not implemented");
      },
      delete: async ({ model, where }) => {
        console.log({ fn: "delete", model, where });
        if (where?.some((w) => w.operator || w.connector)) {
          throw new Error(
            "where clause with operator or connector is not supported"
          );
        }
        if (where?.length === 1) {
          const { field, value } = where[0];
          await ctx.runMutation(component.auth.deleteBy, {
            table: model,
            field,
            value: value instanceof Date ? value.getTime() : value,
            onDeleteHandle:
              config?.onDeleteUser && model === "user"
                ? await createFunctionHandle(config.onDeleteUser)
                : undefined,
          });
          return;
        }
        throw new Error("no matching function found");
        // return null
      },
      deleteMany: async ({ model, where }) => {
        console.log({ fn: "deleteMany", model, where });
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
          return ctx.runAction(component.auth.deleteOldVerifications, {
            currentTimestamp: Date.now(),
          });
        }
        if (where?.length === 1 && where[0].field === "userId") {
          return ctx.runAction(component.auth.deleteAllForUser, {
            table: model,
            userId: where[0].value as Id<"user">,
          });
        }
        throw new Error("no matching function found");
        // return count;
      },
      updateMany: async ({ model, where, update }) => {
        console.log({ fn: "updateMany", model, where, update });
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
    }) satisfies Adapter;
