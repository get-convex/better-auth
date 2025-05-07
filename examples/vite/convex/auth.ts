import {
  BetterAuth,
  sessionValidator,
  userValidator,
} from "@convex-dev/better-auth";
import { components, internal } from "./_generated/api";
import { requireEnv } from "./util";
import { v } from "convex/values";
import schema from "./schema";
import { internalMutation } from "./_generated/server";
import { asyncMap } from "convex-helpers";

const authApi = internal.auth as any;
const onCreateUserFn = internal.auth.onCreateUser as any;
const onDeleteUserFn = internal.auth.onDeleteUser as any;
const onCreateSessionFn = internal.auth.onCreateSession as any;

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
      fields: {
        name: "full_name",
      },
    },
  },
  {
    verbose: true,
    onCreateUser: onCreateUserFn,
    onDeleteUser: onDeleteUserFn,
    onCreateSession: onCreateSessionFn,
  }
);

export const { create, getBy, update, deleteBy } =
  betterAuthComponent.authApi();

export const onCreateUser = internalMutation({
  args: {
    doc: userValidator,
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.doc.email,
      name: args.doc.name,
    });
    await ctx.db.insert("todos", {
      userId,
      text: "Test todo",
      completed: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const onDeleteUser = internalMutation({
  args: {
    id: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
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
    doc: sessionValidator,
  },
  handler: async () => {
    // do something with the session and user
  },
});
