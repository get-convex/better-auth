import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { genericOAuth, organization, twoFactor } from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import {
  sendMagicLink,
  sendOTPVerification,
  sendEmailVerification,
  sendResetPassword,
} from "../convex/email";
import { magicLink } from "better-auth/plugins";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { betterAuthComponent } from "../convex/auth";
import { requireMutationCtx } from "@convex-dev/better-auth/utils";
import { GenericCtx } from "../convex/_generated/server";

// Split out options so they can be passed to the convex plugin
const createOptions = (ctx: GenericCtx) =>
  ({
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
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        accessType: "offline",
        prompt: "select_account+consent",
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
      organization(),
    ],
  }) satisfies BetterAuthOptions;

export const createAuth = (ctx: GenericCtx) => {
  const options = createOptions(ctx);
  return betterAuth({
    ...options,
    plugins: [
      ...options.plugins,
      // Pass in options so plugin schema inference flows through. Only required
      // for plugins that customize the user or session schema.
      // See "Some caveats":
      // https://www.better-auth.com/docs/concepts/session-management#customizing-session-response
      convex({ options }),
    ],
  });
};
