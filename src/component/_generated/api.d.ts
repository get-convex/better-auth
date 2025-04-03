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
import type * as lib from "../lib.js";

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
  lib: typeof lib;
}>;
export type Mounts = {
  auth: {
    create: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              createdAt: number;
              email: string;
              emailVerified: boolean;
              image?: string;
              name: string;
              table: string;
              twoFactorEnabled?: boolean;
              updatedAt: number;
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
              id: string;
              privateKey: string;
              publicKey: string;
              table: string;
            }
          | {
              clientId: string;
              clientSecret?: string;
              createdAt?: number;
              disabled?: boolean;
              icon?: string;
              metadata?: string;
              name?: string;
              redirectURLs?: string;
              table: string;
              type?: string;
              updatedAt?: number;
              userId?: string;
            }
          | {
              accessToken: string;
              accessTokenExpiresAt?: number;
              clientId?: string;
              createdAt?: number;
              refreshToken?: string;
              refreshTokenExpiresAt?: number;
              scopes?: string;
              table: string;
              updatedAt?: number;
              userId?: string;
            }
          | {
              clientId?: string;
              consentGiven?: boolean;
              createdAt?: number;
              scopes?: string;
              table: string;
              updatedAt?: number;
              userId?: string;
            };
        onCreateHandle?: string;
      },
      any
    >;
    deleteAllForUser: FunctionReference<
      "action",
      "public",
      { table: string; userId: string },
      any
    >;
    deleteAllForUserPage: FunctionReference<
      "mutation",
      "public",
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
      "public",
      {
        field: string;
        onDeleteHandle?: string;
        table: string;
        value: string | number | boolean | Array<string> | Array<number> | null;
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
    getAccountByAccountIdAndProviderId: FunctionReference<
      "query",
      "public",
      { accountId: string; providerId: string },
      any
    >;
    getAccountsByUserId: FunctionReference<
      "query",
      "public",
      { userId: string },
      any
    >;
    getBy: FunctionReference<
      "query",
      "public",
      {
        field: string;
        table: string;
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
        value: string | number | boolean | Array<string> | Array<number> | null;
      },
      any
    >;
    getJwks: FunctionReference<"query", "public", {}, any>;
    listVerificationsByIdentifier: FunctionReference<
      "query",
      "public",
      {
        identifier: string;
        limit?: number;
        sortBy?: { direction: "asc" | "desc"; field: string };
      },
      any
    >;
    update: FunctionReference<
      "mutation",
      "public",
      {
        input:
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
            }
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
            };
      },
      any
    >;
  };
  lib: {
    getUserById: FunctionReference<"query", "public", { id: string }, any>;
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
