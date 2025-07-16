import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { genericOAuth, twoFactor } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import {
  sendMagicLink,
  sendOTPVerification,
  sendEmailVerification,
  sendResetPassword,
} from "../convex/email";
import { magicLink } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { betterAuthComponent } from "../convex/auth";
import { GenericActionCtx } from "convex/server";
import { DataModel } from "../convex/_generated/dataModel";

export const createAuth = (ctx: GenericActionCtx<DataModel>) =>
  betterAuth({
    baseURL: "https://localhost:3000",
    database: convexAdapter(ctx, betterAuthComponent),
    account: {
      accountLinking: {
        enabled: true,
        allowDifferentEmails: true,
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmailVerification(ctx, {
          to: user.email,
          url,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPassword(ctx, {
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
          await sendMagicLink(ctx, {
            to: email,
            url,
          });
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await sendOTPVerification(ctx, {
            to: email,
            code: otp,
          });
        },
      }),
      twoFactor(),
      genericOAuth({
        config: [
          {
            providerId: "slack",
            clientId: process.env.SLACK_CLIENT_ID as string,
            clientSecret: process.env.SLACK_CLIENT_SECRET as string,
            discoveryUrl: "https://slack.com/.well-known/openid-configuration",
            scopes: ["openid", "email", "profile"],
          },
        ],
      }),
      convex(),
    ],
  });
