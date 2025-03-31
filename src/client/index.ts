import {
  Expand,
  FunctionReference,
  GenericDataModel,
  GenericMutationCtx,
  GenericQueryCtx,
  HttpRouter,
  mutationGeneric,
  queryGeneric,
} from "convex/server";
import { GenericId, v } from "convex/values";
import { api, internal } from "../component/_generated/api";
import { Adapter, betterAuth, BetterAuthOptions } from "better-auth";
import corsRouter from "./cors";
import { ActionCtx, httpAction } from "../component/_generated/server";
import { jwt } from "better-auth/plugins";
import { bearer } from "better-auth/plugins";
import { oidcProvider } from "better-auth/plugins";
import { Doc, Id, TableNames } from "../component/_generated/dataModel";

const transformInput = (data: any, model: string, action: string) => {
  return data;
};

const transformOutput = (
  { _id, _creationTime, ...data }: Doc<TableNames>,
  _model: string
) => {
  return { ...data, id: _id };
};

const convertWhereClause = (where: any, table: any, model: string) => {
  return where;
};

const getField = (model: string, field: string) => {
  return field;
};

const db = {
  user: [],
};

export class BetterAuth<O extends BetterAuthOptions> {
  constructor(
    public component: UseApi<typeof api>,
    public options?: O
  ) {}
  registerRoutes(
    http: HttpRouter,
    {
      path = "/api/auth",
    }: {
      path?: string;
    } = {}
  ) {
    const auth = (ctx: ActionCtx) => {
      return betterAuth({
        trustedOrigins: ["http://localhost:5173"],
        account: {
          accountLinking: {
            enabled: true,
          },
        },
        /*
    advanced: {
      defaultCookieAttributes: {
        secure: true,
        httpOnly: true,
        sameSite: "none", // Allows CORS-based cookie sharing across subdomains
        partitioned: true, // New browser standards will mandate this for foreign cookies
      },
    },
    */
        plugins: [
          oidcProvider({
            loginPage: "/login-page",
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
        emailAndPassword: {
          enabled: true,
        },
        socialProviders: {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
          },
        },
        user: {
          deleteUser: {
            enabled: true,
          },
        },
        database: () =>
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
                return ctx.runMutation(api.auth.create, {
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
                return ctx.runMutation(api.auth.create, {
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
                return ctx.runMutation(api.auth.create, {
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
                return ctx.runMutation(api.auth.create, {
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
                return ctx.runQuery(api.auth.getBy, {
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
                  api.auth.getAccountByAccountIdAndProviderId,
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
                return ctx.runQuery(api.auth.getAccountsByUserId, {
                  userId: where[0].value as Id<"user">,
                });
              }
              // Currently there exists exactly one jwks result which is inserted to
              // the db during setup.
              // TODO: support jwks creation when convex runtime supports subtle
              // crypto generateKeyPair or when http actions can run in node
              // (enabling BA to be run in node).
              if (model === "jwks") {
                return ctx.runQuery(api.auth.getJwks);
              }
              if (
                model === "verification" &&
                where?.length === 1 &&
                where[0].field === "identifier" &&
                !offset
              ) {
                return ctx.runQuery(api.auth.listVerificationsByIdentifier, {
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
              if (where?.length === 1 && where[0].field === "id") {
                const { value, field } = where[0];
                return ctx.runMutation(api.auth.update, {
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
                await ctx.runMutation(api.auth.deleteBy, {
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
                return ctx.runAction(api.auth.deleteOldVerifications, {
                  currentTimestamp: Date.now(),
                });
              }
              if (where?.length === 1 && where[0].field === "userId") {
                return ctx.runAction(api.auth.deleteAllForUser, {
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
          }) satisfies Adapter,
      });
    };
    const requireEnv = (name: string) => {
      const value = process.env[name];
      if (value === undefined) {
        throw new Error(`Missing environment variable \`${name}\``);
      }
      return value;
    };

    const cors = corsRouter(http, {
      allowedOrigins: ["http://localhost:5173", "https://localhost:5173"],
      allowCredentials: true,
      allowedHeaders: ["Authorization", "Set-Auth-Token", "Content-Type"],
      verbose: true,
      exposedHeaders: ["Set-Auth-Token"],
    });
    http.route({
      path: "/.well-known/openid-configuration",
      method: "GET",
      handler: httpAction(async () => {
        const url = `${requireEnv("CONVEX_SITE_URL")}/api/auth/.well-known/openid-configuration`;
        return Response.redirect(url);
      }),
    });

    http.route({
      path: `${path}/.well-known/openid-configuration`,
      method: "GET",
      handler: httpAction(async (ctx, request) => {
        return auth(ctx).handler(request);
      }),
    });

    http.route({
      pathPrefix: `${path}/oauth2/`,
      method: "GET",
      handler: httpAction(async (ctx, request) => {
        return auth(ctx).handler(request);
      }),
    });

    http.route({
      path: `${path}/jwks`,
      method: "GET",
      handler: httpAction(async (ctx, request) => {
        return auth(ctx).handler(request);
      }),
    });

    http.route({
      pathPrefix: `${path}/callback/`,
      method: "GET",
      handler: httpAction(async (ctx, request) => {
        return auth(ctx).handler(request);
      }),
    });

    cors.route({
      pathPrefix: `${path}/`,
      method: "GET",
      handler: httpAction(async (ctx, request) => {
        return auth(ctx).handler(request);
      }),
    });

    cors.route({
      pathPrefix: `${path}/`,
      method: "POST",
      handler: httpAction(async (ctx, request) => {
        return auth(ctx).handler(request);
      }),
    });
  }
  /*
  async add<Name extends string = keyof Shards & string>(
    ctx: RunMutationCtx,
    name: Name,
    count: number = 1
  ) {
    const shards = this.options?.shards?.[name] ?? this.options?.defaultShards;
    return ctx.runMutation(this.component.lib.add, {
      name,
      count,
      shards,
    });
  }
  async count<Name extends string = keyof Shards & string>(
    ctx: RunQueryCtx,
    name: Name
  ) {
    return ctx.runQuery(this.component.lib.count, { name });
  }
    */
  /**
   * For easy re-exporting.
   * Apps can do
   * ```ts
   * export const { add, count } = shardedCounter.api();
   * ```
   */
  /*
  api() {
    return {
      add: mutationGeneric({
        args: { name: v.string() },
        handler: async (ctx, args) => {
          await this.add(ctx, args.name);
        },
      }),
      count: queryGeneric({
        args: { name: v.string() },
        handler: async (ctx, args) => {
          return await this.count(ctx, args.name);
        },
      }),
    };
  }
  */
}

/* Type utils follow */

type RunQueryCtx = {
  runQuery: GenericQueryCtx<GenericDataModel>["runQuery"];
};
type RunMutationCtx = {
  runMutation: GenericMutationCtx<GenericDataModel>["runMutation"];
};

export type OpaqueIds<T> =
  T extends GenericId<infer _T>
    ? string
    : T extends (infer U)[]
      ? OpaqueIds<U>[]
      : T extends ArrayBuffer
        ? ArrayBuffer
        : T extends object
          ? { [K in keyof T]: OpaqueIds<T[K]> }
          : T;

export type UseApi<API> = Expand<{
  [mod in keyof API]: API[mod] extends FunctionReference<
    infer FType,
    "public",
    infer FArgs,
    infer FReturnType,
    infer FComponentPath
  >
    ? FunctionReference<
        FType,
        "internal",
        OpaqueIds<FArgs>,
        OpaqueIds<FReturnType>,
        FComponentPath
      >
    : UseApi<API[mod]>;
}>;
