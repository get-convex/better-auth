import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { requireActionCtx } from "@convex-dev/better-auth/utils";
import { components } from "./_generated/api";
import { internalAction, query, QueryCtx } from "./_generated/server";
import { betterAuth, type BetterAuthOptions } from "better-auth";
import { emailOTP, magicLink } from "better-auth/plugins";
import { DataModel } from "./_generated/dataModel";
import {
  sendEmailVerification,
  sendMagicLink,
  sendOTPVerification,
  sendResetPassword,
} from "./email";
import authConfig from "convex/auth.config";

const siteUrl = process.env.SITE_URL!;

export const authComponent = createClient<DataModel>(components.betterAuth, {
  verbose: false,
});

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
  ({
    trustedOrigins: [siteUrl],
    database: authComponent.adapter(ctx),
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmailVerification(requireActionCtx(ctx), {
          to: user.email,
          url,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPassword(requireActionCtx(ctx), {
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

    secret: "Zs4/lrLCVgUgEVFeKVrbJ5Y+FrodQL2DPJHN7nK16mU",
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLink(requireActionCtx(ctx), {
            to: email,
            url,
          });
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await sendOTPVerification(requireActionCtx(ctx), {
            to: email,
            code: otp,
          });
        },
      }),
      crossDomain({ siteUrl }),
      convex({ authConfig }),
    ],
    account: {
      accountLinking: {
        enabled: true,
      },
    },
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth(createAuthOptions(ctx));

// Example function for getting the current user
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await authComponent.getAuthUser(ctx);
  },
});
