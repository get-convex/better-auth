import { internalMutation, query } from "./_generated/server";
import { asyncMap } from "convex-helpers";
import { betterAuthComponent } from "./auth";
import { sessionValidator } from "@convex-dev/better-auth";
import { v } from "convex/values";
import schema from "./schema";
import { Id } from "./_generated/dataModel";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await betterAuthComponent.getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db.get(userId as Id<"users">);
  },
});

export const onCreateUser = internalMutation({
  args: {
    user: v.object({
      ...schema.tables.users.validator.fields,
      _id: v.string(),
      _creationTime: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("todos", {
      userId: args.user._id,
      text: "Test todo",
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const onDeleteUser = internalMutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const todos = await ctx.db
      .query("todos")
      .withIndex("userId", (q) => q.eq("userId", args.id))
      .collect();
    await asyncMap(todos, async (todo) => {
      await ctx.db.delete(todo._id);
    });
  },
});

export const onCreateSession = internalMutation({
  args: {
    session: sessionValidator,
    user: schema.tables.users.validator,
  },
  handler: async () => {
    // do something with the session and user
  },
});
