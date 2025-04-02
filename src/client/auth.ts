import { Adapter, betterAuth, BetterAuthOptions } from "better-auth";
import { jwt } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";
import { oidcProvider } from "better-auth/plugins";
import { Id } from "../component/_generated/dataModel";
import { GenericActionCtx, GenericDataModel } from "convex/server";
import { UseApi } from ".";
import { api } from "../component/_generated/api";

export const auth = (database: () => Adapter, config: BetterAuthOptions) =>
  betterAuth({
    ...config,
    advanced: {
      ...config.advanced,
      defaultCookieAttributes: {
        ...config.advanced?.defaultCookieAttributes,
        secure: true,
        //httpOnly: true,
        sameSite: "none", // Allows CORS-based cookie sharing across subdomains
        //partitioned: true, // New browser standards will mandate this for
      },
    },
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
          disablePrivateKeyEncryption: true,
          keyPairConfig: {
            alg: "RS256",
          },
        },
      }),
    ],
    database,
  });

export const database =
  (ctx: GenericActionCtx<GenericDataModel>, component: UseApi<typeof api>) =>
  (): Adapter =>
    ({
      id: "convex",
      create: async ({ model, data, select }): Promise<any> => {
        console.log({ fn: "create", model, data, select });
        if (select) {
          throw new Error("select is not supported");
        }
        if (model === "session") {
          if (!data.userId) {
            throw new Error("userId is required for session creation");
          }
          return ctx.runMutation(component.auth.create, {
            input: {
              table: "session",
              token: data.token,
              userId: data.userId,
              expiresAt: data.expiresAt.getTime(),
              ipAddress: data.ipAddress,
              userAgent: data.userAgent,
              createdAt: data.createdAt.getTime(),
              updatedAt: data.updatedAt.getTime(),
            },
          });
        }
        if (model === "account") {
          return ctx.runMutation(component.auth.create, {
            input: {
              table: "account",
              accountId: data.accountId,
              providerId: data.providerId,
              userId: data.userId,
              password: data.password,
              createdAt: data.createdAt.getTime(),
              updatedAt: data.updatedAt.getTime(),
            },
          });
        }
        if (model === "user") {
          return ctx.runMutation(component.auth.create, {
            input: {
              table: "user",
              email: data.email,
              image: data.image,
              name: data.name,
              emailVerified: data.emailVerified,
              createdAt: data.createdAt.getTime(),
              updatedAt: data.updatedAt.getTime(),
            },
          });
        }
        if (model === "verification") {
          return ctx.runMutation(component.auth.create, {
            input: {
              table: "verification",
              value: data.value,
              expiresAt: data.expiresAt.getTime(),
              identifier: data.identifier,
              createdAt: data.createdAt.getTime(),
              updatedAt: data.updatedAt.getTime(),
            },
          });
        }
        throw new Error("no matching function found");
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
          return ctx.runQuery(component.auth.getBy, {
            table: model,
            field,
            value: value instanceof Date ? value.getTime() : value,
          });
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
        /*
          const table = db[model];
          const res = convertWhereClause(where, table, model);
          const record = res[0] || null;
          return transformOutput(record, model, select);
          */
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
        // Currently there exists exactly one jwks result which is inserted to
        // the db during setup.
        // TODO: support jwks creation when convex runtime supports subtle
        // crypto generateKeyPair or when http actions can run in node
        // (enabling BA to be run in node).
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
        /*
          let table = db[model];
          if (where) {
            table = convertWhereClause(where, table, model);
          }
          if (sortBy) {
            table = table.sort((a, b) => {
              const field = getField(model, sortBy.field);
              if (sortBy.direction === "asc") {
                return a[field] > b[field] ? 1 : -1;
              } else {
                return a[field] < b[field] ? 1 : -1;
              }
            });
          }
          if (offset !== undefined) {
            table = table.slice(offset);
          }
          if (limit !== undefined) {
            table = table.slice(0, limit);
          }
          return table.map((record) => transformOutput(record, model));
          */
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
        /*
          return db[model].length;
          */
      },
      update: async ({ model, where, update }) => {
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
              value: update,
            },
          });
        }
        throw new Error("Not implemented");
        // return null
        /*
          const table = db[model];
          const res = convertWhereClause(where, table, model);
          res.forEach((record) => {
            Object.assign(record, transformInput(update, model, "update"));
          });
          return transformOutput(res[0], model);
          */
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
          });
          return;
        }
        throw new Error("no matching function found");
        // return null
        /*
          const table = db[model];
          const res = convertWhereClause(where, table, model);
          db[model] = table.filter((record) => !res.includes(record));
          */
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
        /*
          const table = db[model];
          const res = convertWhereClause(where, table, model);
          let count = 0;
          db[model] = table.filter((record) => {
            if (res.includes(record)) {
              count++;
              return false;
            }
            return !res.includes(record);
          });
          return count;
          */
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
