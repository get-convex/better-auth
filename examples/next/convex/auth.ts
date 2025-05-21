import {
  AuthFunctions,
  BetterAuth,
  convexAdapter,
} from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api";
import { twoFactor } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { sendMagicLink, sendOTPVerification } from "./email";
import { sendEmailVerification, sendResetPassword } from "./email";
import { magicLink } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { GenericCtx } from "./_generated/server";
import { DataModel, Id } from "./_generated/dataModel";
import { asyncMap } from "convex-helpers";

const authFunctions: AuthFunctions = internal.auth;

export const betterAuthComponent = new BetterAuth(
  components.betterAuth,
  authFunctions,
);

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    database: convexAdapter(ctx, betterAuthComponent),
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
      requireEmailVerification: false,
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
    user: {
      deleteUser: {
        enabled: true,
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
      convex(),
      crossDomain(),
    ],
  });

export const { createUser, deleteUser, updateUser, createSession } =
  betterAuthComponent.createAuthFunctions<DataModel>({
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
        await ctx.db.delete(todo._id);
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
