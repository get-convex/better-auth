import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  users: defineTable({
    // Better Auth fields
    name: v.string(),
    email: v.string(),
    emailVerified: v.boolean(),
    image: v.optional(v.string()),
    twoFactorEnabled: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number(),

    // Custom fields
    // ...
  })
    // Better Auth indexes
    .index("email", ["email"]),

  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"]),
});

export default schema;
