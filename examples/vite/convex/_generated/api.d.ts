/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as example from "../example.js";
import type * as http from "../http.js";
import type * as todos from "../todos.js";
import type * as util from "../util.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  example: typeof example;
  http: typeof http;
  todos: typeof todos;
  util: typeof util;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: {
    lib: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                createdAt: number;
                expiresAt: number;
                ipAddress?: string;
                table: string;
                token: string;
                updatedAt: number;
                userAgent?: string;
                userId: string;
              }
            | {
                accessToken?: string;
                accessTokenExpiresAt?: number;
                accountId: string;
                createdAt: number;
                idToken?: string;
                password?: string;
                providerId: string;
                refreshToken?: string;
                refreshTokenExpiresAt?: number;
                scope?: string;
                table: string;
                updatedAt: number;
                userId: string;
              }
            | {
                backupCodes: string;
                secret: string;
                table: string;
                userId: string;
              }
            | {
                createdAt?: number;
                expiresAt: number;
                identifier: string;
                table: string;
                updatedAt?: number;
                value: string;
              }
            | {
                createdAt: number;
                id?: string;
                privateKey: string;
                publicKey: string;
                table: string;
              };
          onCreateHandle?: string;
        },
        any
      >;
      deleteAllForUser: FunctionReference<
        "action",
        "internal",
        { table: string; userId: string },
        any
      >;
      deleteAllForUserPage: FunctionReference<
        "mutation",
        "internal",
        {
          paginationOpts?: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          table: string;
          userId: string;
        },
        any
      >;
      deleteBy: FunctionReference<
        "mutation",
        "internal",
        {
          field: string;
          onDeleteHandle?: string;
          table: string;
          unique?: boolean;
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        },
        any
      >;
      deleteOldVerifications: FunctionReference<
        "action",
        "internal",
        { currentTimestamp: number },
        any
      >;
      deleteOldVerificationsPage: FunctionReference<
        "mutation",
        "internal",
        {
          currentTimestamp: number;
          paginationOpts?: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      getAccountByAccountIdAndProviderId: FunctionReference<
        "query",
        "internal",
        { accountId: string; providerId: string },
        any
      >;
      getAccountsByUserId: FunctionReference<
        "query",
        "internal",
        { userId: string },
        any
      >;
      getBy: FunctionReference<
        "query",
        "internal",
        {
          field: string;
          table: string;
          unique?: boolean;
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        },
        any
      >;
      getByQuery: FunctionReference<
        "query",
        "internal",
        {
          field: string;
          table: string;
          unique?: boolean;
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        },
        any
      >;
      getJwks: FunctionReference<"query", "internal", {}, any>;
      listVerificationsByIdentifier: FunctionReference<
        "query",
        "internal",
        {
          identifier: string;
          limit?: number;
          sortBy?: { direction: "asc" | "desc"; field: string };
        },
        any
      >;
      update: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                table: "account";
                value: Record<string, any>;
                where: {
                  field: string;
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                };
              }
            | {
                table: "session";
                value: Record<string, any>;
                where: {
                  field: string;
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                };
              }
            | {
                table: "verification";
                value: Record<string, any>;
                where: {
                  field: string;
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                };
              }
            | {
                table: "user";
                value: Record<string, any>;
                where: {
                  field: string;
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                };
              };
        },
        any
      >;
    };
  };
};
