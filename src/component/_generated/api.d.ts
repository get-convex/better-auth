/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adapterTest from "../adapterTest.js";
import type * as lib from "../lib.js";
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
  adapterTest: typeof adapterTest;
  lib: typeof lib;
  util: typeof util;
}>;
export type Mounts = {
  adapterTest: {
    count: FunctionReference<"query", "public", any, any>;
    create: FunctionReference<"mutation", "public", any, any>;
    delete: FunctionReference<"mutation", "public", any, any>;
    deleteMany: FunctionReference<"mutation", "public", any, any>;
    findMany: FunctionReference<"query", "public", any, any>;
    findOne: FunctionReference<"query", "public", any, any>;
    isAuthenticated: FunctionReference<"query", "public", {}, any>;
    update: FunctionReference<"mutation", "public", any, any>;
    updateMany: FunctionReference<"mutation", "public", any, any>;
  };
  lib: {
    create: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              createdAt: number;
              displayUsername?: string;
              email: string;
              emailVerified: boolean;
              image?: string;
              isAnonymous?: boolean;
              name: string;
              table: string;
              twoFactorEnabled?: boolean;
              updatedAt: number;
              userId?: string;
              username?: string;
            }
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
              createdAt?: number;
              expiresAt: number;
              identifier: string;
              table: string;
              updatedAt?: number;
              value: string;
            }
          | {
              backupCodes: string;
              secret: string;
              table: string;
              userId: string;
            }
          | {
              createdAt: number;
              privateKey: string;
              publicKey: string;
              table: string;
            }
          | {
              count?: number;
              key?: string;
              lastRequest?: number;
              table: string;
            };
      },
      any
    >;
    deleteBy: FunctionReference<
      "mutation",
      "public",
      {
        field: string;
        table: string;
        unique?: boolean;
        value: string | number | boolean | Array<string> | Array<number> | null;
      },
      any
    >;
    deleteIn: FunctionReference<
      "mutation",
      "public",
      { input: { field: "token"; table: "session"; values: Array<string> } },
      any
    >;
    deleteMany: FunctionReference<
      "mutation",
      "public",
      {
        limit?: number;
        model: string;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
        select?: Array<string>;
        sortBy?: { direction: "asc" | "desc"; field: string };
        unique?: boolean;
        where?: Array<{
          connector?: "AND" | "OR";
          field: string;
          operator: string;
          value: any;
        }>;
      },
      any
    >;
    deleteOldVerifications: FunctionReference<
      "action",
      "public",
      { currentTimestamp: number },
      any
    >;
    deleteOldVerificationsPage: FunctionReference<
      "mutation",
      "public",
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
    findMany: FunctionReference<
      "query",
      "public",
      {
        limit?: number;
        model: string;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
        select?: Array<string>;
        sortBy?: { direction: "asc" | "desc"; field: string };
        unique?: boolean;
        where?: Array<{
          connector?: "AND" | "OR";
          field: string;
          operator: string;
          value: any;
        }>;
      },
      any
    >;
    findOne: FunctionReference<
      "query",
      "public",
      {
        limit?: number;
        model: string;
        select?: Array<string>;
        sortBy?: { direction: "asc" | "desc"; field: string };
        unique?: boolean;
        where?: Array<{
          connector?: "AND" | "OR";
          field: string;
          operator: string;
          value: any;
        }>;
      },
      any
    >;
    getBy: FunctionReference<
      "query",
      "public",
      {
        field: string;
        table: string;
        unique?: boolean;
        value: string | number | boolean | Array<string> | Array<number> | null;
      },
      any
    >;
    getByQuery: FunctionReference<
      "query",
      "public",
      {
        field: string;
        table: string;
        unique?: boolean;
        value: string | number | boolean | Array<string> | Array<number> | null;
      },
      any
    >;
    getCurrentSession: FunctionReference<"query", "public", {}, any>;
    getIn: FunctionReference<
      "query",
      "public",
      {
        limit?: number;
        model: string;
        where?: Array<{
          connector?: "AND" | "OR";
          field: string;
          operator: string;
          value: any;
        }>;
      },
      any
    >;
    listBy: FunctionReference<
      "query",
      "public",
      {
        input: {
          field: string;
          limit?: number;
          sortDirection?: "asc" | "desc";
          sortField?: string;
          table: string;
          value: any;
        };
      },
      any
    >;
    update: FunctionReference<
      "mutation",
      "public",
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
    updateMany: FunctionReference<
      "mutation",
      "public",
      {
        limit?: number;
        model: string;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
        select?: Array<string>;
        sortBy?: { direction: "asc" | "desc"; field: string };
        unique?: boolean;
        update?: {
          createdAt?: number;
          displayUsername?: string;
          email?: string;
          emailVerified?: boolean;
          image?: string;
          isAnonymous?: boolean;
          name?: string;
          twoFactorEnabled?: boolean;
          updatedAt?: number;
          userId?: string;
          username?: string;
        };
        where?: Array<{
          connector?: "AND" | "OR";
          field: string;
          operator: string;
          value: any;
        }>;
      },
      any
    >;
  };
};
// For now fullApiWithMounts is only fullApi which provides
// jump-to-definition in component client code.
// Use Mounts for the same type without the inference.
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
