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
import type * as email from "../email.js";
import type * as emails_components_BaseEmail from "../emails/components/BaseEmail.js";
import type * as emails_magicLink from "../emails/magicLink.js";
import type * as emails_resetPassword from "../emails/resetPassword.js";
import type * as emails_verifyEmail from "../emails/verifyEmail.js";
import type * as emails_verifyOTP from "../emails/verifyOTP.js";
import type * as http from "../http.js";
import type * as todos from "../todos.js";

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
  email: typeof email;
  "emails/components/BaseEmail": typeof emails_components_BaseEmail;
  "emails/magicLink": typeof emails_magicLink;
  "emails/resetPassword": typeof emails_resetPassword;
  "emails/verifyEmail": typeof emails_verifyEmail;
  "emails/verifyOTP": typeof emails_verifyOTP;
  http: typeof http;
  todos: typeof todos;
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
    adapterTest: {
      count: FunctionReference<"query", "internal", any, any>;
      create: FunctionReference<"mutation", "internal", any, any>;
      delete: FunctionReference<"mutation", "internal", any, any>;
      deleteMany: FunctionReference<"mutation", "internal", any, any>;
      findMany: FunctionReference<"query", "internal", any, any>;
      findOne: FunctionReference<"query", "internal", any, any>;
      isAuthenticated: FunctionReference<"query", "internal", {}, any>;
      update: FunctionReference<"mutation", "internal", any, any>;
      updateMany: FunctionReference<"mutation", "internal", any, any>;
    };
    lib: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                data: {
                  banExpires?: number;
                  banReason?: string;
                  banned?: boolean;
                  createdAt: number;
                  displayUsername?: string;
                  email: string;
                  emailVerified: boolean;
                  image?: string;
                  isAnonymous?: boolean;
                  name: string;
                  phoneNumber?: string;
                  phoneNumberVerified?: boolean;
                  role?: string;
                  stripeCustomerId?: string;
                  twoFactorEnabled?: boolean;
                  updatedAt: number;
                  userId?: string;
                  username?: string;
                };
                model: "user";
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
                data: {
                  activeOrganizationId?: string;
                  createdAt: number;
                  expiresAt: number;
                  impersonatedBy?: string;
                  ipAddress?: string;
                  token: string;
                  updatedAt: number;
                  userAgent?: string;
                  userId: string;
                };
                model: "session";
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
                data: {
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
                  updatedAt: number;
                  userId: string;
                };
                model: "account";
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
                data: {
                  createdAt?: number;
                  expiresAt: number;
                  identifier: string;
                  updatedAt?: number;
                  value: string;
                };
                model: "verification";
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
                data: { backupCodes: string; secret: string; userId: string };
                model: "twoFactor";
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
                data: {
                  aaguid?: string;
                  backedUp: boolean;
                  counter: number;
                  createdAt?: number;
                  credentialID: string;
                  deviceType: string;
                  name?: string;
                  publicKey: string;
                  transports?: string;
                  userId: string;
                };
                model: "passkey";
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
                data: {
                  createdAt: number;
                  enabled?: boolean;
                  expiresAt?: number;
                  key: string;
                  lastRefillAt?: number;
                  lastRequest?: number;
                  metadata?: string;
                  name?: string;
                  permissions?: string;
                  prefix?: string;
                  rateLimitEnabled?: boolean;
                  rateLimitMax?: number;
                  rateLimitTimeWindow?: number;
                  refillAmount?: number;
                  refillInterval?: number;
                  remaining?: number;
                  requestCount?: number;
                  start?: string;
                  updatedAt: number;
                  userId: string;
                };
                model: "apikey";
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
                data: {
                  clientId?: string;
                  clientSecret?: string;
                  createdAt?: number;
                  disabled?: boolean;
                  icon?: string;
                  metadata?: string;
                  name?: string;
                  redirectURLs?: string;
                  type?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                model: "oauthApplication";
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
                data: {
                  accessToken?: string;
                  accessTokenExpiresAt?: number;
                  clientId?: string;
                  createdAt?: number;
                  refreshToken?: string;
                  refreshTokenExpiresAt?: number;
                  scopes?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                model: "oauthAccessToken";
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
                data: {
                  clientId?: string;
                  consentGiven?: boolean;
                  createdAt?: number;
                  scopes?: string;
                  updatedAt?: number;
                  userId?: string;
                };
                model: "oauthConsent";
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
                data: {
                  createdAt: number;
                  logo?: string;
                  metadata?: string;
                  name: string;
                  slug?: string;
                };
                model: "organization";
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
                data: {
                  createdAt: number;
                  organizationId: string;
                  role: string;
                  teamId?: string;
                  userId: string;
                };
                model: "member";
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
                data: {
                  email: string;
                  expiresAt: number;
                  inviterId: string;
                  organizationId: string;
                  role?: string;
                  status: string;
                  teamId?: string;
                };
                model: "invitation";
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
                data: {
                  createdAt: number;
                  name: string;
                  organizationId: string;
                  updatedAt?: number;
                };
                model: "team";
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
                data: {
                  domain: string;
                  issuer: string;
                  oidcConfig?: string;
                  organizationId?: string;
                  providerId: string;
                  samlConfig?: string;
                  userId?: string;
                };
                model: "ssoProvider";
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
                data: {
                  createdAt: number;
                  privateKey: string;
                  publicKey: string;
                };
                model: "jwks";
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
                data: {
                  cancelAtPeriodEnd?: boolean;
                  periodEnd?: number;
                  periodStart?: number;
                  plan: string;
                  referenceId: string;
                  seats?: number;
                  status?: string;
                  stripeCustomerId?: string;
                  stripeSubscriptionId?: string;
                };
                model: "subscription";
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
                data: { count?: number; key?: string; lastRequest?: number };
                model: "rateLimit";
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
      deleteMany: FunctionReference<
        "mutation",
        "internal",
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
        "internal",
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
        "internal",
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
        "internal",
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
      getCurrentSession: FunctionReference<"query", "internal", {}, any>;
      updateMany: FunctionReference<
        "mutation",
        "internal",
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
                  banExpires?: number;
                  banReason?: string;
                  banned?: boolean;
                  createdAt?: number;
                  displayUsername?: string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: string;
                  isAnonymous?: boolean;
                  name?: string;
                  phoneNumber?: string;
                  phoneNumberVerified?: boolean;
                  role?: string;
                  stripeCustomerId?: string;
                  twoFactorEnabled?: boolean;
                  updatedAt?: number;
                  userId?: string;
                  username?: string;
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
                  activeOrganizationId?: string;
                  createdAt?: number;
                  expiresAt?: number;
                  impersonatedBy?: string;
                  ipAddress?: string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: string;
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
                  accessToken?: string;
                  accessTokenExpiresAt?: number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: string;
                  password?: string;
                  providerId?: string;
                  refreshToken?: string;
                  refreshTokenExpiresAt?: number;
                  scope?: string;
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
                  aaguid?: string;
                  backedUp?: boolean;
                  counter?: number;
                  createdAt?: number;
                  credentialID?: string;
                  deviceType?: string;
                  name?: string;
                  publicKey?: string;
                  transports?: string;
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
                  enabled?: boolean;
                  expiresAt?: number;
                  key?: string;
                  lastRefillAt?: number;
                  lastRequest?: number;
                  metadata?: string;
                  name?: string;
                  permissions?: string;
                  prefix?: string;
                  rateLimitEnabled?: boolean;
                  rateLimitMax?: number;
                  rateLimitTimeWindow?: number;
                  refillAmount?: number;
                  refillInterval?: number;
                  remaining?: number;
                  requestCount?: number;
                  start?: string;
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
                  clientId?: string;
                  clientSecret?: string;
                  createdAt?: number;
                  disabled?: boolean;
                  icon?: string;
                  metadata?: string;
                  name?: string;
                  redirectURLs?: string;
                  type?: string;
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
                  accessToken?: string;
                  accessTokenExpiresAt?: number;
                  clientId?: string;
                  createdAt?: number;
                  refreshToken?: string;
                  refreshTokenExpiresAt?: number;
                  scopes?: string;
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
                  clientId?: string;
                  consentGiven?: boolean;
                  createdAt?: number;
                  scopes?: string;
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
                  logo?: string;
                  metadata?: string;
                  name?: string;
                  slug?: string;
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
                  role?: string;
                  status?: string;
                  teamId?: string;
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
                  updatedAt?: number;
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
                  oidcConfig?: string;
                  organizationId?: string;
                  providerId?: string;
                  samlConfig?: string;
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
                  cancelAtPeriodEnd?: boolean;
                  periodEnd?: number;
                  periodStart?: number;
                  plan?: string;
                  referenceId?: string;
                  seats?: number;
                  status?: string;
                  stripeCustomerId?: string;
                  stripeSubscriptionId?: string;
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
                update: { count?: number; key?: string; lastRequest?: number };
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
        "internal",
        {
          input:
            | {
                model: "user";
                update: {
                  banExpires?: number;
                  banReason?: string;
                  banned?: boolean;
                  createdAt?: number;
                  displayUsername?: string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: string;
                  isAnonymous?: boolean;
                  name?: string;
                  phoneNumber?: string;
                  phoneNumberVerified?: boolean;
                  role?: string;
                  stripeCustomerId?: string;
                  twoFactorEnabled?: boolean;
                  updatedAt?: number;
                  userId?: string;
                  username?: string;
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
                  activeOrganizationId?: string;
                  createdAt?: number;
                  expiresAt?: number;
                  impersonatedBy?: string;
                  ipAddress?: string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: string;
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
                  accessToken?: string;
                  accessTokenExpiresAt?: number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: string;
                  password?: string;
                  providerId?: string;
                  refreshToken?: string;
                  refreshTokenExpiresAt?: number;
                  scope?: string;
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
                  aaguid?: string;
                  backedUp?: boolean;
                  counter?: number;
                  createdAt?: number;
                  credentialID?: string;
                  deviceType?: string;
                  name?: string;
                  publicKey?: string;
                  transports?: string;
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
                  enabled?: boolean;
                  expiresAt?: number;
                  key?: string;
                  lastRefillAt?: number;
                  lastRequest?: number;
                  metadata?: string;
                  name?: string;
                  permissions?: string;
                  prefix?: string;
                  rateLimitEnabled?: boolean;
                  rateLimitMax?: number;
                  rateLimitTimeWindow?: number;
                  refillAmount?: number;
                  refillInterval?: number;
                  remaining?: number;
                  requestCount?: number;
                  start?: string;
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
                  clientId?: string;
                  clientSecret?: string;
                  createdAt?: number;
                  disabled?: boolean;
                  icon?: string;
                  metadata?: string;
                  name?: string;
                  redirectURLs?: string;
                  type?: string;
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
                model: "oauthAccessToken";
                update: {
                  accessToken?: string;
                  accessTokenExpiresAt?: number;
                  clientId?: string;
                  createdAt?: number;
                  refreshToken?: string;
                  refreshTokenExpiresAt?: number;
                  scopes?: string;
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
                model: "oauthConsent";
                update: {
                  clientId?: string;
                  consentGiven?: boolean;
                  createdAt?: number;
                  scopes?: string;
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
                model: "organization";
                update: {
                  createdAt?: number;
                  logo?: string;
                  metadata?: string;
                  name?: string;
                  slug?: string;
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
                model: "invitation";
                update: {
                  email?: string;
                  expiresAt?: number;
                  inviterId?: string;
                  organizationId?: string;
                  role?: string;
                  status?: string;
                  teamId?: string;
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
                  updatedAt?: number;
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
                  oidcConfig?: string;
                  organizationId?: string;
                  providerId?: string;
                  samlConfig?: string;
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
                  cancelAtPeriodEnd?: boolean;
                  periodEnd?: number;
                  periodStart?: number;
                  plan?: string;
                  referenceId?: string;
                  seats?: number;
                  status?: string;
                  stripeCustomerId?: string;
                  stripeSubscriptionId?: string;
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
                update: { count?: number; key?: string; lastRequest?: number };
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
};
