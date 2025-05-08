import { BetterAuth } from "@convex-dev/better-auth";
import { components, internal } from "./_generated/api";
import { requireEnv } from "./util";
import { asyncMap } from "convex-helpers";
import { Id } from "./_generated/dataModel";

const createUserFn = internal.auth.createUser as any;
const updateUserFn = internal.auth.updateUser as any;
const deleteUserFn = internal.auth.deleteUser as any;
const createSessionFn = internal.auth.createSession as any;

export const betterAuthComponent = new BetterAuth(
  components.betterAuth,
  {
    trustedOrigins: [requireEnv("SITE_URL")],
    socialProviders: {
      github: {
        clientId: requireEnv("GITHUB_CLIENT_ID"),
        clientSecret: requireEnv("GITHUB_CLIENT_SECRET"),
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
    },
  },
  {
    authApi: {
      createUser: createUserFn,
      deleteUser: deleteUserFn,

      // optional
      updateUser: updateUserFn,
      createSession: createSessionFn,
    },
    verbose: true,
  }
);

export const { createUser, deleteUser, updateUser, createSession } =
  betterAuthComponent.authApi({
    onCreateUser: async (ctx, user) => {
      const userId = await ctx.db.insert("users", {
        email: user.email,
      });
      await ctx.db.insert("todos", {
        userId,
        text: "Test todo",
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      return userId;
    },
    onDeleteUser: async (ctx, userId) => {
      // TODO: use correct id type
      const todos = await ctx.db
        .query("todos")
        .withIndex("userId", (q) => q.eq("userId", userId))
        .collect();
      await asyncMap(todos, async (todo) => {
        await ctx.db.delete(todo._id as Id<"todos">);
      });
      await ctx.db.delete(userId as Id<"users">);
    },
    onUpdateUser: async (ctx, user) => {
      // TODO: use correct id type
      const userId = user.userId as Id<"users">;
      await ctx.db.patch(userId, {
        email: user.email,
      });
    },
  });
