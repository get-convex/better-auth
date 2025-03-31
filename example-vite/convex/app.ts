import { asyncMap } from "convex-helpers";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db.get(identity.subject as Id<"user">);
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject as Id<"user">;

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
