import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
  users: defineTable({
    email: v.string(),
  }).index("email", ["email"]),

  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
    userId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("userId", ["userId"]),
});

export default schema;
