import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { TableNames } from "./_generated/dataModel";

const schema = defineSchema({
  user: defineTable({
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    twoFactorEnabled: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("email", ["email"]),

  session: defineTable({
    expiresAt: v.number(),
    token: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    userId: v.id("user"),
  })
    .index("token", ["token"])
    .index("userId", ["userId"]),

  account: defineTable({
    accountId: v.string(),
    providerId: v.string(),
    userId: v.id("user"),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    idToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    scope: v.optional(v.string()),
    password: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("providerId_accountId", ["providerId", "accountId"])
    .index("userId", ["userId"]),

  twoFactor: defineTable({
    secret: v.string(),
    backupCodes: v.string(),
    userId: v.id("user"),
  }).index("userId", ["userId"]),

  verification: defineTable({
    identifier: v.string(),
    value: v.string(),
    expiresAt: v.number(),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("identifier", ["identifier"])
    .index("expiresAt", ["expiresAt"]),

  jwks: defineTable({
    id: v.string(),
    publicKey: v.string(),
    privateKey: v.string(),
    createdAt: v.number(),
  }),

  oauthApplication: defineTable({
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    metadata: v.optional(v.string()),
    clientId: v.string(),
    clientSecret: v.optional(v.string()),
    redirectURLs: v.optional(v.string()),
    type: v.optional(v.string()),
    disabled: v.optional(v.boolean()),
    userId: v.optional(v.id("user")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("clientId", ["clientId"]),

  oauthAccessToken: defineTable({
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    accessTokenExpiresAt: v.optional(v.number()),
    refreshTokenExpiresAt: v.optional(v.number()),
    clientId: v.optional(v.string()),
    userId: v.optional(v.id("user")),
    scopes: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("accessToken", ["accessToken"])
    .index("refreshToken", ["refreshToken"]),

  oauthConsent: defineTable({
    clientId: v.optional(v.string()),
    userId: v.optional(v.id("user")),
    scopes: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    consentGiven: v.optional(v.boolean()),
  }).index("clientId_userId", ["clientId", "userId"]),
});

export default schema;

type Fields<T extends TableNames> =
  (typeof schema.tables)[T]["validator"]["fieldPaths"];

type UniqueFields = {
  [K in TableNames]: Fields<K>[];
};

const uniqueFields: UniqueFields = {
  account: [],
  verification: [],
  jwks: [],
  oauthConsent: [],
  twoFactor: [],
  user: ["email"],
  session: ["token"],
  oauthApplication: ["clientId"],
  oauthAccessToken: ["accessToken", "refreshToken"],
};

export const isUniqueField = <T extends keyof typeof uniqueFields>(
  table: T,
  field: (typeof uniqueFields)[T][number]
) => {
  return uniqueFields[table]?.some((f) => f === field);
};
