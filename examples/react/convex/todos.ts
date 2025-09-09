import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUserId } from "./auth";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return [];
    }
    return await ctx.db
      .query("todos")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    await ctx.db.insert("todos", {
      text: args.text,
      completed: false,
      userId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const toggle = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      completed: !todo.completed,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
