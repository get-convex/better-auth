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
              data: {
                banExpires?: null | number;
                banReason?: null | string;
                banned?: null | boolean;
                createdAt: number;
                displayUsername?: null | string;
                email: string;
                emailVerified: boolean;
                image?: null | string;
                isAnonymous?: null | boolean;
                name: string;
                phoneNumber?: null | string;
                phoneNumberVerified?: null | boolean;
                role?: null | string;
                stripeCustomerId?: null | string;
                teamId?: null | string;
                twoFactorEnabled?: null | boolean;
                updatedAt: number;
                userId?: null | string;
                username?: null | string;
              };
              model: "user";
            }
          | {
              data: {
                activeOrganizationId?: null | string;
                activeTeamId?: null | string;
                createdAt: number;
                expiresAt: number;
                impersonatedBy?: null | string;
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
                aaguid?: null | string;
                backedUp: boolean;
                counter: number;
                createdAt?: null | number;
                credentialID: string;
                deviceType: string;
                name?: null | string;
                publicKey: string;
                transports?: null | string;
                userId: string;
              };
              model: "passkey";
            }
          | {
              data: {
                createdAt: number;
                enabled?: null | boolean;
                expiresAt?: null | number;
                key: string;
                lastRefillAt?: null | number;
                lastRequest?: null | number;
                metadata?: null | string;
                name?: null | string;
                permissions?: null | string;
                prefix?: null | string;
                rateLimitEnabled?: null | boolean;
                rateLimitMax?: null | number;
                rateLimitTimeWindow?: null | number;
                refillAmount?: null | number;
                refillInterval?: null | number;
                remaining?: null | number;
                requestCount?: null | number;
                start?: null | string;
                updatedAt: number;
                userId: string;
              };
              model: "apikey";
            }
          | {
              data: {
                clientId?: null | string;
                clientSecret?: null | string;
                createdAt?: null | number;
                disabled?: null | boolean;
                icon?: null | string;
                metadata?: null | string;
                name?: null | string;
                redirectURLs?: null | string;
                type?: null | string;
                updatedAt?: null | number;
                userId?: null | string;
              };
              model: "oauthApplication";
            }
          | {
              data: {
                accessToken?: null | string;
                accessTokenExpiresAt?: null | number;
                clientId?: null | string;
                createdAt?: null | number;
                refreshToken?: null | string;
                refreshTokenExpiresAt?: null | number;
                scopes?: null | string;
                updatedAt?: null | number;
                userId?: null | string;
              };
              model: "oauthAccessToken";
            }
          | {
              data: {
                clientId?: null | string;
                consentGiven?: null | boolean;
                createdAt?: null | number;
                scopes?: null | string;
                updatedAt?: null | number;
                userId?: null | string;
              };
              model: "oauthConsent";
            }
          | {
              data: {
                createdAt: number;
                name: string;
                organizationId: string;
                updatedAt?: null | number;
              };
              model: "team";
            }
          | {
              data: {
                createdAt?: null | number;
                teamId: string;
                userId: string;
              };
              model: "teamMember";
            }
          | {
              data: {
                createdAt: number;
                logo?: null | string;
                metadata?: null | string;
                name: string;
                slug?: null | string;
              };
              model: "organization";
            }
          | {
              data: {
                createdAt: number;
                organizationId: string;
                role: string;
                userId: string;
              };
              model: "member";
            }
          | {
              data: {
                email: string;
                expiresAt: number;
                inviterId: string;
                organizationId: string;
                role?: null | string;
                status: string;
                teamId?: null | string;
              };
              model: "invitation";
            }
          | {
              data: {
                domain: string;
                issuer: string;
                oidcConfig?: null | string;
                organizationId?: null | string;
                providerId: string;
                samlConfig?: null | string;
                userId?: null | string;
              };
              model: "ssoProvider";
            }
          | {
              data: {
                createdAt: number;
                privateKey: string;
                publicKey: string;
              };
              model: "jwks";
            }
          | {
              data: {
                cancelAtPeriodEnd?: null | boolean;
                periodEnd?: null | number;
                periodStart?: null | number;
                plan: string;
                referenceId: string;
                seats?: null | number;
                status?: null | string;
                stripeCustomerId?: null | string;
                stripeSubscriptionId?: null | string;
                trialEnd?: null | number;
                trialStart?: null | number;
              };
              model: "subscription";
            }
          | {
              data: {
                address: string;
                chainId: number;
                createdAt: number;
                isPrimary?: null | boolean;
                userId: string;
              };
              model: "walletAddress";
            }
          | {
              data: {
                count?: null | number;
                key?: null | string;
                lastRequest?: null | number;
              };
              model: "rateLimit";
            };
      },
      any
    >;
    deleteMany: FunctionReference<
      "mutation",
      "public",
      {
        limit?: number;
        model: string;
        offset?: number;
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
    deleteOne: FunctionReference<
      "mutation",
      "public",
      {
        limit?: number;
        model: string;
        offset?: number;
        select?: Array<string>;
        sortBy?: { direction: "asc" | "desc"; field: string };
        unique?: boolean;
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
    findMany: FunctionReference<
      "query",
      "public",
      {
        limit?: number;
        model: string;
        offset?: number;
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
        limit?: number;
        model: string;
        offset?: number;
        select?: Array<string>;
        sortBy?: { direction: "asc" | "desc"; field: string };
        unique?: boolean;
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
    getCurrentSession: FunctionReference<"query", "public", {}, any>;
    updateMany: FunctionReference<
      "mutation",
      "public",
      {
        input:
          | {
              limit?: number;
              model: "user";
              offset?: number;
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
              update: {
                banExpires?: null | number;
                banReason?: null | string;
                banned?: null | boolean;
                createdAt?: number;
                displayUsername?: null | string;
                email?: string;
                emailVerified?: boolean;
                image?: null | string;
                isAnonymous?: null | boolean;
                name?: string;
                phoneNumber?: null | string;
                phoneNumberVerified?: null | boolean;
                role?: null | string;
                stripeCustomerId?: null | string;
                teamId?: null | string;
                twoFactorEnabled?: null | boolean;
                updatedAt?: number;
                userId?: null | string;
                username?: null | string;
              };
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
            }
          | {
              limit?: number;
              model: "session";
              offset?: number;
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
              update: {
                activeOrganizationId?: null | string;
                activeTeamId?: null | string;
                createdAt?: number;
                expiresAt?: number;
                impersonatedBy?: null | string;
                ipAddress?: null | string;
                token?: string;
                updatedAt?: number;
                userAgent?: null | string;
                userId?: string;
              };
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
            }
          | {
              limit?: number;
              model: "account";
              offset?: number;
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
            }
          | {
              limit?: number;
              model: "verification";
              offset?: number;
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
              update: {
                createdAt?: number;
                expiresAt?: number;
                identifier?: string;
                updatedAt?: number;
                value?: string;
              };
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
            }
          | {
              limit?: number;
              model: "twoFactor";
              offset?: number;
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
              update: {
                backupCodes?: string;
                secret?: string;
                userId?: string;
              };
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
            }
          | {
              limit?: number;
              model: "passkey";
              offset?: number;
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
              update: {
                aaguid?: null | string;
                backedUp?: boolean;
                counter?: number;
                createdAt?: null | number;
                credentialID?: string;
                deviceType?: string;
                name?: null | string;
                publicKey?: string;
                transports?: null | string;
                userId?: string;
              };
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
            }
          | {
              limit?: number;
              model: "apikey";
              offset?: number;
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
              update: {
                createdAt?: number;
                enabled?: null | boolean;
                expiresAt?: null | number;
                key?: string;
                lastRefillAt?: null | number;
                lastRequest?: null | number;
                metadata?: null | string;
                name?: null | string;
                permissions?: null | string;
                prefix?: null | string;
                rateLimitEnabled?: null | boolean;
                rateLimitMax?: null | number;
                rateLimitTimeWindow?: null | number;
                refillAmount?: null | number;
                refillInterval?: null | number;
                remaining?: null | number;
                requestCount?: null | number;
                start?: null | string;
                updatedAt?: number;
                userId?: string;
              };
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
            }
          | {
              limit?: number;
              model: "oauthApplication";
              offset?: number;
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
              update: {
                clientId?: null | string;
                clientSecret?: null | string;
                createdAt?: null | number;
                disabled?: null | boolean;
                icon?: null | string;
                metadata?: null | string;
                name?: null | string;
                redirectURLs?: null | string;
                type?: null | string;
                updatedAt?: null | number;
                userId?: null | string;
              };
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
            }
          | {
              limit?: number;
              model: "oauthAccessToken";
              offset?: number;
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
              update: {
                accessToken?: null | string;
                accessTokenExpiresAt?: null | number;
                clientId?: null | string;
                createdAt?: null | number;
                refreshToken?: null | string;
                refreshTokenExpiresAt?: null | number;
                scopes?: null | string;
                updatedAt?: null | number;
                userId?: null | string;
              };
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
            }
          | {
              limit?: number;
              model: "oauthConsent";
              offset?: number;
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
              update: {
                clientId?: null | string;
                consentGiven?: null | boolean;
                createdAt?: null | number;
                scopes?: null | string;
                updatedAt?: null | number;
                userId?: null | string;
              };
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
            }
          | {
              limit?: number;
              model: "team";
              offset?: number;
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
              update: {
                createdAt?: number;
                name?: string;
                organizationId?: string;
                updatedAt?: null | number;
              };
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
            }
          | {
              limit?: number;
              model: "teamMember";
              offset?: number;
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
              update: {
                createdAt?: null | number;
                teamId?: string;
                userId?: string;
              };
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
            }
          | {
              limit?: number;
              model: "organization";
              offset?: number;
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
              update: {
                createdAt?: number;
                logo?: null | string;
                metadata?: null | string;
                name?: string;
                slug?: null | string;
              };
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
            }
          | {
              limit?: number;
              model: "member";
              offset?: number;
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
              update: {
                createdAt?: number;
                organizationId?: string;
                role?: string;
                userId?: string;
              };
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
            }
          | {
              limit?: number;
              model: "invitation";
              offset?: number;
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
              update: {
                email?: string;
                expiresAt?: number;
                inviterId?: string;
                organizationId?: string;
                role?: null | string;
                status?: string;
                teamId?: null | string;
              };
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
            }
          | {
              limit?: number;
              model: "ssoProvider";
              offset?: number;
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
              update: {
                domain?: string;
                issuer?: string;
                oidcConfig?: null | string;
                organizationId?: null | string;
                providerId?: string;
                samlConfig?: null | string;
                userId?: null | string;
              };
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
            }
          | {
              limit?: number;
              model: "jwks";
              offset?: number;
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
              update: {
                createdAt?: number;
                privateKey?: string;
                publicKey?: string;
              };
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
            }
          | {
              limit?: number;
              model: "subscription";
              offset?: number;
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
              update: {
                cancelAtPeriodEnd?: null | boolean;
                periodEnd?: null | number;
                periodStart?: null | number;
                plan?: string;
                referenceId?: string;
                seats?: null | number;
                status?: null | string;
                stripeCustomerId?: null | string;
                stripeSubscriptionId?: null | string;
                trialEnd?: null | number;
                trialStart?: null | number;
              };
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
            }
          | {
              limit?: number;
              model: "walletAddress";
              offset?: number;
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
              update: {
                address?: string;
                chainId?: number;
                createdAt?: number;
                isPrimary?: null | boolean;
                userId?: string;
              };
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
            }
          | {
              limit?: number;
              model: "rateLimit";
              offset?: number;
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
              update: {
                count?: null | number;
                key?: null | string;
                lastRequest?: null | number;
              };
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
                banExpires?: null | number;
                banReason?: null | string;
                banned?: null | boolean;
                createdAt?: number;
                displayUsername?: null | string;
                email?: string;
                emailVerified?: boolean;
                image?: null | string;
                isAnonymous?: null | boolean;
                name?: string;
                phoneNumber?: null | string;
                phoneNumberVerified?: null | boolean;
                role?: null | string;
                stripeCustomerId?: null | string;
                teamId?: null | string;
                twoFactorEnabled?: null | boolean;
                updatedAt?: number;
                userId?: null | string;
                username?: null | string;
              };
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
            }
          | {
              model: "session";
              update: {
                activeOrganizationId?: null | string;
                activeTeamId?: null | string;
                createdAt?: number;
                expiresAt?: number;
                impersonatedBy?: null | string;
                ipAddress?: null | string;
                token?: string;
                updatedAt?: number;
                userAgent?: null | string;
                userId?: string;
              };
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
            }
          | {
              model: "passkey";
              update: {
                aaguid?: null | string;
                backedUp?: boolean;
                counter?: number;
                createdAt?: null | number;
                credentialID?: string;
                deviceType?: string;
                name?: null | string;
                publicKey?: string;
                transports?: null | string;
                userId?: string;
              };
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
            }
          | {
              model: "apikey";
              update: {
                createdAt?: number;
                enabled?: null | boolean;
                expiresAt?: null | number;
                key?: string;
                lastRefillAt?: null | number;
                lastRequest?: null | number;
                metadata?: null | string;
                name?: null | string;
                permissions?: null | string;
                prefix?: null | string;
                rateLimitEnabled?: null | boolean;
                rateLimitMax?: null | number;
                rateLimitTimeWindow?: null | number;
                refillAmount?: null | number;
                refillInterval?: null | number;
                remaining?: null | number;
                requestCount?: null | number;
                start?: null | string;
                updatedAt?: number;
                userId?: string;
              };
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
            }
          | {
              model: "oauthApplication";
              update: {
                clientId?: null | string;
                clientSecret?: null | string;
                createdAt?: null | number;
                disabled?: null | boolean;
                icon?: null | string;
                metadata?: null | string;
                name?: null | string;
                redirectURLs?: null | string;
                type?: null | string;
                updatedAt?: null | number;
                userId?: null | string;
              };
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
            }
          | {
              model: "oauthAccessToken";
              update: {
                accessToken?: null | string;
                accessTokenExpiresAt?: null | number;
                clientId?: null | string;
                createdAt?: null | number;
                refreshToken?: null | string;
                refreshTokenExpiresAt?: null | number;
                scopes?: null | string;
                updatedAt?: null | number;
                userId?: null | string;
              };
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
            }
          | {
              model: "oauthConsent";
              update: {
                clientId?: null | string;
                consentGiven?: null | boolean;
                createdAt?: null | number;
                scopes?: null | string;
                updatedAt?: null | number;
                userId?: null | string;
              };
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
            }
          | {
              model: "team";
              update: {
                createdAt?: number;
                name?: string;
                organizationId?: string;
                updatedAt?: null | number;
              };
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
            }
          | {
              model: "teamMember";
              update: {
                createdAt?: null | number;
                teamId?: string;
                userId?: string;
              };
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
            }
          | {
              model: "organization";
              update: {
                createdAt?: number;
                logo?: null | string;
                metadata?: null | string;
                name?: string;
                slug?: null | string;
              };
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
            }
          | {
              model: "member";
              update: {
                createdAt?: number;
                organizationId?: string;
                role?: string;
                userId?: string;
              };
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
            }
          | {
              model: "invitation";
              update: {
                email?: string;
                expiresAt?: number;
                inviterId?: string;
                organizationId?: string;
                role?: null | string;
                status?: string;
                teamId?: null | string;
              };
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
            }
          | {
              model: "ssoProvider";
              update: {
                domain?: string;
                issuer?: string;
                oidcConfig?: null | string;
                organizationId?: null | string;
                providerId?: string;
                samlConfig?: null | string;
                userId?: null | string;
              };
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
            }
          | {
              model: "subscription";
              update: {
                cancelAtPeriodEnd?: null | boolean;
                periodEnd?: null | number;
                periodStart?: null | number;
                plan?: string;
                referenceId?: string;
                seats?: null | number;
                status?: null | string;
                stripeCustomerId?: null | string;
                stripeSubscriptionId?: null | string;
                trialEnd?: null | number;
                trialStart?: null | number;
              };
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
            }
          | {
              model: "walletAddress";
              update: {
                address?: string;
                chainId?: number;
                createdAt?: number;
                isPrimary?: null | boolean;
                userId?: string;
              };
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
            }
          | {
              model: "rateLimit";
              update: {
                count?: null | number;
                key?: null | string;
                lastRequest?: null | number;
              };
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
            };
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
