/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adapter from "../adapter.js";
import type * as auth from "../auth.js";

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
  adapter: typeof adapter;
  auth: typeof auth;
}>;
export type Mounts = {
  adapter: {
    create: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              data: {
                createdAt: number;
                email: string;
                emailVerified: boolean;
                foo?: null | string;
                image?: null | string;
                isAnonymous?: null | boolean;
                name: string;
                twoFactorEnabled?: null | boolean;
                updatedAt: number;
                userId?: null | string;
              };
              model: "user";
            }
          | {
              data: {
                createdAt: number;
                expiresAt: number;
                ipAddress?: null | string;
                token: string;
                updatedAt: number;
                userAgent?: null | string;
                userId: string;
              };
              model: "session";
            }
          | {
              data: {
                accessToken?: null | string;
                accessTokenExpiresAt?: null | number;
                accountId: string;
                createdAt: number;
                idToken?: null | string;
                password?: null | string;
                providerId: string;
                refreshToken?: null | string;
                refreshTokenExpiresAt?: null | number;
                scope?: null | string;
                updatedAt: number;
                userId: string;
              };
              model: "account";
            }
          | {
              data: {
                createdAt: number;
                expiresAt: number;
                identifier: string;
                updatedAt: number;
                value: string;
              };
              model: "verification";
            }
          | {
              data: { backupCodes: string; secret: string; userId: string };
              model: "twoFactor";
            }
          | {
              data: {
                createdAt: number;
                privateKey: string;
                publicKey: string;
              };
              model: "jwks";
            };
        onCreateHandle?: string;
        select?: Array<string>;
      },
      any
    >;
    deleteMany: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              model: "user";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "email"
                  | "emailVerified"
                  | "image"
                  | "createdAt"
                  | "updatedAt"
                  | "twoFactorEnabled"
                  | "isAnonymous"
                  | "userId"
                  | "foo"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "session";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "expiresAt"
                  | "token"
                  | "createdAt"
                  | "updatedAt"
                  | "ipAddress"
                  | "userAgent"
                  | "userId"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "account";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "accountId"
                  | "providerId"
                  | "userId"
                  | "accessToken"
                  | "refreshToken"
                  | "idToken"
                  | "accessTokenExpiresAt"
                  | "refreshTokenExpiresAt"
                  | "scope"
                  | "password"
                  | "createdAt"
                  | "updatedAt"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "verification";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "identifier"
                  | "value"
                  | "expiresAt"
                  | "createdAt"
                  | "updatedAt"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "twoFactor";
              where?: Array<{
                connector?: "AND" | "OR";
                field: "secret" | "backupCodes" | "userId" | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "jwks";
              where?: Array<{
                connector?: "AND" | "OR";
                field: "publicKey" | "privateKey" | "createdAt" | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            };
        onDeleteHandle?: string;
        paginationOpts: {
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
    deleteOne: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              model: "user";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "email"
                  | "emailVerified"
                  | "image"
                  | "createdAt"
                  | "updatedAt"
                  | "twoFactorEnabled"
                  | "isAnonymous"
                  | "userId"
                  | "foo"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "session";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "expiresAt"
                  | "token"
                  | "createdAt"
                  | "updatedAt"
                  | "ipAddress"
                  | "userAgent"
                  | "userId"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "account";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "accountId"
                  | "providerId"
                  | "userId"
                  | "accessToken"
                  | "refreshToken"
                  | "idToken"
                  | "accessTokenExpiresAt"
                  | "refreshTokenExpiresAt"
                  | "scope"
                  | "password"
                  | "createdAt"
                  | "updatedAt"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "verification";
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "identifier"
                  | "value"
                  | "expiresAt"
                  | "createdAt"
                  | "updatedAt"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "twoFactor";
              where?: Array<{
                connector?: "AND" | "OR";
                field: "secret" | "backupCodes" | "userId" | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "jwks";
              where?: Array<{
                connector?: "AND" | "OR";
                field: "publicKey" | "privateKey" | "createdAt" | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            };
        onDeleteHandle?: string;
      },
      any
    >;
    findMany: FunctionReference<
      "query",
      "public",
      {
        limit?: number;
        model:
          | "user"
          | "session"
          | "account"
          | "verification"
          | "twoFactor"
          | "jwks";
        offset?: number;
        paginationOpts: {
          cursor: string | null;
          endCursor?: string | null;
          id?: number;
          maximumBytesRead?: number;
          maximumRowsRead?: number;
          numItems: number;
        };
        sortBy?: { direction: "asc" | "desc"; field: string };
        where?: Array<{
          connector?: "AND" | "OR";
          field: string;
          operator?:
            | "lt"
            | "lte"
            | "gt"
            | "gte"
            | "eq"
            | "in"
            | "ne"
            | "contains"
            | "starts_with"
            | "ends_with";
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        }>;
      },
      any
    >;
    findOne: FunctionReference<
      "query",
      "public",
      {
        model:
          | "user"
          | "session"
          | "account"
          | "verification"
          | "twoFactor"
          | "jwks";
        select?: Array<string>;
        where?: Array<{
          connector?: "AND" | "OR";
          field: string;
          operator?:
            | "lt"
            | "lte"
            | "gt"
            | "gte"
            | "eq"
            | "in"
            | "ne"
            | "contains"
            | "starts_with"
            | "ends_with";
          value:
            | string
            | number
            | boolean
            | Array<string>
            | Array<number>
            | null;
        }>;
      },
      any
    >;
    updateMany: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              model: "user";
              update: {
                createdAt?: number;
                email?: string;
                emailVerified?: boolean;
                foo?: null | string;
                image?: null | string;
                isAnonymous?: null | boolean;
                name?: string;
                twoFactorEnabled?: null | boolean;
                updatedAt?: number;
                userId?: null | string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "email"
                  | "emailVerified"
                  | "image"
                  | "createdAt"
                  | "updatedAt"
                  | "twoFactorEnabled"
                  | "isAnonymous"
                  | "userId"
                  | "foo"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "session";
              update: {
                createdAt?: number;
                expiresAt?: number;
                ipAddress?: null | string;
                token?: string;
                updatedAt?: number;
                userAgent?: null | string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "expiresAt"
                  | "token"
                  | "createdAt"
                  | "updatedAt"
                  | "ipAddress"
                  | "userAgent"
                  | "userId"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "account";
              update: {
                accessToken?: null | string;
                accessTokenExpiresAt?: null | number;
                accountId?: string;
                createdAt?: number;
                idToken?: null | string;
                password?: null | string;
                providerId?: string;
                refreshToken?: null | string;
                refreshTokenExpiresAt?: null | number;
                scope?: null | string;
                updatedAt?: number;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "accountId"
                  | "providerId"
                  | "userId"
                  | "accessToken"
                  | "refreshToken"
                  | "idToken"
                  | "accessTokenExpiresAt"
                  | "refreshTokenExpiresAt"
                  | "scope"
                  | "password"
                  | "createdAt"
                  | "updatedAt"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "verification";
              update: {
                createdAt?: number;
                expiresAt?: number;
                identifier?: string;
                updatedAt?: number;
                value?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "identifier"
                  | "value"
                  | "expiresAt"
                  | "createdAt"
                  | "updatedAt"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "twoFactor";
              update: {
                backupCodes?: string;
                secret?: string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field: "secret" | "backupCodes" | "userId" | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "jwks";
              update: {
                createdAt?: number;
                privateKey?: string;
                publicKey?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field: "publicKey" | "privateKey" | "createdAt" | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            };
        onUpdateHandle?: string;
        paginationOpts: {
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
    updateOne: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              model: "user";
              update: {
                createdAt?: number;
                email?: string;
                emailVerified?: boolean;
                foo?: null | string;
                image?: null | string;
                isAnonymous?: null | boolean;
                name?: string;
                twoFactorEnabled?: null | boolean;
                updatedAt?: number;
                userId?: null | string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "name"
                  | "email"
                  | "emailVerified"
                  | "image"
                  | "createdAt"
                  | "updatedAt"
                  | "twoFactorEnabled"
                  | "isAnonymous"
                  | "userId"
                  | "foo"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "session";
              update: {
                createdAt?: number;
                expiresAt?: number;
                ipAddress?: null | string;
                token?: string;
                updatedAt?: number;
                userAgent?: null | string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "expiresAt"
                  | "token"
                  | "createdAt"
                  | "updatedAt"
                  | "ipAddress"
                  | "userAgent"
                  | "userId"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "account";
              update: {
                accessToken?: null | string;
                accessTokenExpiresAt?: null | number;
                accountId?: string;
                createdAt?: number;
                idToken?: null | string;
                password?: null | string;
                providerId?: string;
                refreshToken?: null | string;
                refreshTokenExpiresAt?: null | number;
                scope?: null | string;
                updatedAt?: number;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "accountId"
                  | "providerId"
                  | "userId"
                  | "accessToken"
                  | "refreshToken"
                  | "idToken"
                  | "accessTokenExpiresAt"
                  | "refreshTokenExpiresAt"
                  | "scope"
                  | "password"
                  | "createdAt"
                  | "updatedAt"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "verification";
              update: {
                createdAt?: number;
                expiresAt?: number;
                identifier?: string;
                updatedAt?: number;
                value?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field:
                  | "identifier"
                  | "value"
                  | "expiresAt"
                  | "createdAt"
                  | "updatedAt"
                  | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "twoFactor";
              update: {
                backupCodes?: string;
                secret?: string;
                userId?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field: "secret" | "backupCodes" | "userId" | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            }
          | {
              model: "jwks";
              update: {
                createdAt?: number;
                privateKey?: string;
                publicKey?: string;
              };
              where?: Array<{
                connector?: "AND" | "OR";
                field: "publicKey" | "privateKey" | "createdAt" | "id";
                operator?:
                  | "lt"
                  | "lte"
                  | "gt"
                  | "gte"
                  | "eq"
                  | "in"
                  | "ne"
                  | "contains"
                  | "starts_with"
                  | "ends_with";
                value:
                  | string
                  | number
                  | boolean
                  | Array<string>
                  | Array<number>
                  | null;
              }>;
            };
        onUpdateHandle?: string;
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
