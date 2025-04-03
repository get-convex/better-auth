import { internalMutation, mutation, query } from "./_generated/server";
import { asyncMap } from "convex-helpers";
import { betterAuth } from "./http";
import { userValidator } from "@convex-dev/better-auth";
import { v } from "convex/values";

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

export const onCreateUser = internalMutation({
  args: {
    user: userValidator,
  },
  handler: async (ctx, args) => {
    // Use this to add users to your app's own table if you want
    // to store custom data. This mutation runs within the create
    // user mutation, so this mutation is guaranteed to succeed if
    // the user is created, or else the user is not created.
    await ctx.db.insert("users", {
      authId: args.user._id,
    });
  },
});

export const onDeleteUser = internalMutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("authId", (q) => q.eq("authId", args.id))
      .unique();
    if (!user) {
      console.error("User not found");
      return;
    }
    await ctx.db.delete(user._id);
  },
});
