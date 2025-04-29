import { BetterAuth, sessionValidator } from "@convex-dev/better-auth";
import { components, internal } from "./_generated/api";
import { requireEnv } from "./util";
import { v } from "convex/values";
import schema from "./schema";
import { internalMutation } from "./_generated/server";
import { asyncMap } from "convex-helpers";

const authApi = internal.auth as any;
const onCreateUserFn = internal.auth.onCreateUser as any;
const onDeleteUserFn = internal.auth.onDeleteUser as any;

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
      modelName: "users",
      fields: {
        name: "full_name",
      },
    },
  },
  {
    verbose: true,
    authApi,
    onCreateUser: onCreateUserFn,
    onDeleteUser: onDeleteUserFn,
  }
);

export const { create, getBy, update, deleteBy } =
  betterAuthComponent.authApi();

export const onCreateUser = internalMutation({
  args: {
    doc: v.object({
      ...schema.tables.users.validator.fields,
      _id: v.string(),
      _creationTime: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Use this to make database changes when a user is created.
    // This mutation runs within the create user mutation, so this
    // mutation is guaranteed to run if the user is created, or
    // else the user is not created.
    await ctx.db.insert("todos", {
      userId: args.doc._id,
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
