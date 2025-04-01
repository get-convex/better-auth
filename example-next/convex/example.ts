import { mutation, query } from "./_generated/server";
import { asyncMap } from "convex-helpers";
import { betterAuth } from "./http";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await betterAuth.getAuthUser(ctx);
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Delete all todos for this user
    const todos = await ctx.db
      .query("todos")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();

    await asyncMap(todos, async (todo) => {
      await ctx.db.delete(todo._id);
    });
  },
});
