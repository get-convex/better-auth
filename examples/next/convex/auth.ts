import { components, internal } from "./_generated/api";
import { query } from "./_generated/server";
import betterAuthSchema from "./betterAuth/schema";
import { AuthFunctions, createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import {
  anonymous,
  genericOAuth,
  twoFactor,
  username,
} from "better-auth/plugins";
import { emailOTP } from "better-auth/plugins";
import {
  sendMagicLink,
  sendOTPVerification,
  sendEmailVerification,
  sendResetPassword,
} from "../convex/email";
import { magicLink } from "better-auth/plugins";
import { betterAuth, BetterAuthOptions } from "better-auth";
import { requireMutationCtx } from "@convex-dev/better-auth/utils";
import {
  CreateAdapter,
  getInactiveAuthInstance,
  type RunCtx,
} from "@convex-dev/better-auth";
import { Id } from "./_generated/dataModel";

const siteUrl = process.env.SITE_URL;

const createAuth = (ctx: RunCtx, createAdapter: CreateAdapter) =>
  betterAuth({
    baseURL: siteUrl,
    database: createAdapter(ctx),
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
        prompt: "select_account consent",
      },
    },
    user: {
      // This field is available in the `onCreateUser` hook from the component,
      // but will not be committed to the database. Must be persisted in the
      // hook if persistence is required.
      additionalFields: {
        foo: {
          type: "string",
          required: false,
        },
      },
      deleteUser: {
        enabled: true,
      },
    },
    plugins: [
      anonymous(),
      username(),
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
      convex(),
    ],
  } satisfies BetterAuthOptions);

// Export a static instance for Better Auth schema generation and other
// options-derived use cases.
export const auth = getInactiveAuthInstance(createAuth);

const authFunctions: AuthFunctions = internal.auth;

export const betterAuthComponent = createClient(
  components.betterAuth.adapter,
  createAuth,
  {
    local: {
      schema: betterAuthSchema,
    },
    authFunctions,
    verbose: false,
    triggers: {
      user: {
        onCreate: async (ctx, user) => {
          console.log("onCreate", user);
        },
      },
    },
  },
);

export const { onCreate } = betterAuthComponent.triggersApi();

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("identity", identity);
    if (!identity) {
      return;
    }
    const betterAuthUser = await betterAuthComponent.getAuthUser(ctx);
    console.log("betterAuthUser", betterAuthUser);
    if (!betterAuthUser) {
      return;
    }
    const user = await ctx.db.get(
      (identity.userId ?? identity.subject) as Id<"users">,
    );
    const result = {
      ...betterAuthUser,
      ...user,
    };
    return result;
  },
});
