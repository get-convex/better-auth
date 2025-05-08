import {
  BetterAuth,
  createUserArgsValidator,
  updateUserArgsValidator,
  deleteUserArgsValidator,
  onCreateSessionArgsValidator,
} from "@convex-dev/better-auth";
import { components, internal } from "./_generated/api";
import { twoFactor } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { sendMagicLink, sendOTPVerification } from "./email";
import { sendEmailVerification, sendResetPassword } from "./email";
import { magicLink } from "better-auth/plugins";
import { internalMutation } from "./_generated/server";
import { asyncMap } from "convex-helpers";
import { Id } from "./_generated/dataModel";

const createUserFn = internal.auth.createUser as any;
const updateUserFn = internal.auth.updateUser as any;
const deleteUserFn = internal.auth.deleteUser as any;
const onCreateSessionFn = internal.auth.onCreateSession as any;

export const betterAuthComponent = new BetterAuth(
  components.betterAuth,
  {
    trustedOrigins: ["http://localhost:3000", "https://localhost:3000"],
    account: {
      accountLinking: {
        enabled: true,
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmailVerification({
          to: user.email,
          url,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPassword({
          to: user.email,
          url,
        });
      },
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLink({
            to: email,
            url,
          });
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await sendOTPVerification({
            to: email,
            code: otp,
          });
        },
      }),
      twoFactor(),
    ],
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      },
    },
    user: {
      deleteUser: {
        enabled: true,
      },
      modelName: "users",
    },
  },
  {
    createUser: createUserFn,
    updateUser: updateUserFn,
    deleteUser: deleteUserFn,

    // optional
    onCreateSession: onCreateSessionFn,
    verbose: true,
  },
);

export const createUser = internalMutation({
  args: createUserArgsValidator,
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      email: args.email,
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
});

export const updateUser = internalMutation({
  args: updateUserArgsValidator,
  handler: async (ctx, args) => {
    // TODO: use correct id type
    const userId = args.userId as Id<"users">;
    await ctx.db.patch(userId, {
      email: args.email,
    });
  },
});

export const deleteUser = internalMutation({
  args: deleteUserArgsValidator,
  handler: async (ctx, args) => {
    // TODO: use correct id type
    const userId = args.userId as Id<"users">;
    const todos = await ctx.db
      .query("todos")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .collect();
    await asyncMap(todos, async (todo) => {
      await ctx.db.delete(todo._id);
    });
    await ctx.db.delete(userId);
  },
});

export const onCreateSession = internalMutation({
  args: onCreateSessionArgsValidator,
  handler: async () => {
    // do something with the session and user
  },
});
