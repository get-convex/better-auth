import {
  AuthApi,
  BetterAuth,
  convexAdapter,
  convex,
} from "@convex-dev/better-auth";
import { components, internal } from "./_generated/api";
import { twoFactor } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { sendMagicLink, sendOTPVerification } from "./email";
import { sendEmailVerification, sendResetPassword } from "./email";
import { magicLink } from "better-auth/plugins";
import { asyncMap } from "convex-helpers";
import { DataModel, Id } from "./_generated/dataModel";
import { betterAuth } from "better-auth";
import { GenericActionCtx } from "convex/server";

const authApi: AuthApi = {
  createUser: internal.auth.createUser as any,
  deleteUser: internal.auth.deleteUser as any,
  updateUser: internal.auth.updateUser as any,
  createSession: internal.auth.createSession as any,
};

export const createAuth = (ctx: GenericActionCtx<DataModel>) =>
  betterAuth({
    database: convexAdapter<DataModel, GenericActionCtx<DataModel>>(
      ctx,
      components.betterAuth,
      { authApi, verbose: true },
    ),
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
    /*
    user: {
      deleteUser: {
        enabled: true,
      },
    },
    */
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
      convex(),
    ],
  });

export const betterAuthComponent = new BetterAuth(
  components.betterAuth,
  createAuth as any,
  { verbose: true },
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
        .withIndex("userId", (q) => q.eq("userId", userId as Id<"users">))
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
