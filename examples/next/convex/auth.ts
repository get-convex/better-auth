import { BetterAuth, sessionValidator } from "@convex-dev/better-auth";
import { components, internal } from "./_generated/api";
import { twoFactor } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { sendMagicLink, sendOTPVerification } from "./email";
import { sendEmailVerification, sendResetPassword } from "./email";
import { magicLink } from "better-auth/plugins";
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { asyncMap } from "convex-helpers";
import { vv } from "./util";

const authApi = internal.auth as any;
const onCreateUserFn = internal.auth.onCreateUser as any;
const onDeleteUserFn = internal.example.onDeleteUser as any;
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
    authApi,

    // Optional
    onCreateUser: onCreateUserFn,
    onDeleteUser: onDeleteUserFn,
    onCreateSession: onCreateSessionFn,
    useAppUserTable: true,
    verbose: true,
  },
);

export const { create, getBy, update, deleteBy } =
  betterAuthComponent.authApi();

export const onCreateUser = internalMutation({
  args: {
    doc: vv.doc("users"),
  },
  handler: async (ctx, args) => {
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
    id: v.id("users"),
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
    doc: sessionValidator,
  },
  handler: async (ctx, args) => {
    const user = await betterAuthComponent.getAuthUserId;
    // do something with the session and user
  },
});
