import { AuthFunctions, BetterAuth } from "@convex-dev/better-auth";
import { components, internal } from "./_generated/api";
import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { asyncMap } from "convex-helpers";

const authFunctions: AuthFunctions = internal.auth;

export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
  verbose: true,
});

export const { createUser, deleteUser, updateUser, createSession } =
  betterAuthComponent.createAuthFunctions({
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

// Example function for getting the current user
// Feel free to edit, omit, etc.
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    // Get user data from Better Auth - email, name, image, etc.
    const userMetadata = await betterAuthComponent.getAuthUser(ctx);
    if (!userMetadata) {
      return null;
    }
    // Get user data from your application's database (skip this if you have no
    // fields in your users table schema)
    const user = await ctx.db.get(userMetadata.userId as Id<"users">);
    return {
      ...user,
      ...userMetadata,
    };
  },
});
