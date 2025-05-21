import {
  AuthFunctions,
  BetterAuth,
  convexAdapter,
} from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api";
import { betterAuth } from "better-auth";
import { GenericCtx } from "./_generated/server";
import { requireEnv } from "./util";
import { Id } from "./_generated/dataModel";
import { asyncMap } from "convex-helpers";

const authFunctions: AuthFunctions = internal.auth;
const siteUrl = requireEnv("SITE_URL");

export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  authFunctions,
});

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    database: convexAdapter(ctx, betterAuthComponent),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
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
    plugins: [crossDomain({ siteUrl }), convex()],
    logger: {
      level: "debug",
    },
    account: {
      accountLinking: {
        enabled: true,
      },
    },
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
