import { BetterAuth, convexAdapter, convex } from "@convex-dev/better-auth";
import { components, internal } from "./_generated/api";
import { betterAuth } from "better-auth";
import { GenericCtx } from "./_generated/server";
import { requireEnv } from "./util";

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
    trustedOrigins: [requireEnv("SITE_URL")],
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
    plugins: [convex()],
    logger: {
      level: "debug",
    },
  });
