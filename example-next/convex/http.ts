import "./polyfills";
import { httpRouter } from "convex/server";
import { BetterAuth } from "@convex-dev/better-auth";
import { components } from "./_generated/api";
import {
  sendEmailVerification,
  sendMagicLink,
  sendResetPassword,
  sendOTPVerification,
} from "./email";
import { magicLink, emailOTP, twoFactor } from "better-auth/plugins";

export const betterAuth = new BetterAuth(components.betterAuth, {
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
  },
});

const http = httpRouter();

betterAuth.registerRoutes(http, {
  allowedOrigins: ["http://localhost:3000", "https://localhost:3000"],
});

export default http;
