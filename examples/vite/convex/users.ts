import { asyncMap } from "convex-helpers";
import { betterAuthComponent } from "./auth";
import { Id } from "./_generated/dataModel";

export const { createUser, deleteUser, updateUser, createSession } =
  betterAuthComponent.authApi({
    onCreateUser: async (ctx, user) => {
      // Example: copy the user's email to the application users table.
      // We'll use onUpdateUser to keep it synced.
      const userId = await ctx.db.insert("users", {
        email: user.email,
      });

      // This function must return the user id.
      return userId;
    },
    onDeleteUser: async (ctx, userId) => {
      // Delete the user's data if the user is being deleted
      const todos = await ctx.db
        .query("todos")
        .withIndex("userId", (q) => q.eq("userId", userId as Id<"users">))
        .collect();
      await asyncMap(todos, async (todo) => {
        await ctx.db.delete(todo._id as Id<"todos">);
      });
      await ctx.db.delete(userId as Id<"users">);
    },
    onUpdateUser: async (ctx, user) => {
      // Keep the user's email synced
      const userId = user.userId as Id<"users">;
      await ctx.db.patch(userId, {
        email: user.email,
      });
    },
  });
