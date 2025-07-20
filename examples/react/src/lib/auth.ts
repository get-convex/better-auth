import { convexAdapter } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { requireEnv, requireMutationCtx } from "@convex-dev/better-auth/utils";
import { emailOTP } from "better-auth/plugins";
import { magicLink } from "better-auth/plugins";
import {
  sendMagicLink,
  sendOTPVerification,
  sendEmailVerification,
  sendResetPassword,
} from "../../convex/email";
import { betterAuthComponent } from "../../convex/auth";
import type { GenericCtx } from "convex/_generated/server";

const siteUrl = requireEnv("SITE_URL");

export const createAuth = (ctx: GenericCtx) => {
  return betterAuth({
    trustedOrigins: [siteUrl],
    database: convexAdapter(ctx, betterAuthComponent),
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmailVerification(requireMutationCtx(ctx), {
          to: user.email,
          url,
        });
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPassword(requireMutationCtx(ctx), {
          to: user.email,
          url,
        });
      },
    },
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
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ email, url }) => {
          await sendMagicLink(requireMutationCtx(ctx), {
            to: email,
            url,
          });
        },
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp }) {
          await sendOTPVerification(requireMutationCtx(ctx), {
            to: email,
            code: otp,
          });
        },
      }),
      crossDomain({ siteUrl }),
      convex(),
    ],
    logger: {
      level: "debug",
    },
    account: {
      accountLinking: {
        enabled: true,
      },
    },
  });
};
