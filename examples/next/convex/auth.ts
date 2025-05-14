import { BetterAuth, convexAdapter, convex } from "@convex-dev/better-auth";
import { components, internal } from "./_generated/api";
import { twoFactor } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import { sendMagicLink, sendOTPVerification } from "./email";
import { sendEmailVerification, sendResetPassword } from "./email";
import { magicLink } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { GenericCtx } from "./_generated/server";

export const betterAuthComponent = new BetterAuth(components.betterAuth, {
  verbose: true,
});

// Still some work to do on types 🙈
const authApi = internal.users as any;

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    database: convexAdapter(ctx, components.betterAuth, {
      authApi,
      verbose: true,
    }),
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
    ],
  });
