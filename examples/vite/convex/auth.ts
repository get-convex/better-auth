import {
  AuthFunctions,
  BetterAuth,
  convexAdapter,
} from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components, internal } from "./_generated/api";
import { betterAuth } from "better-auth";
import { GenericCtx } from "./_generated/server";
import { requireEnv } from "./util";

const authFunctions: AuthFunctions = internal.users;

export const betterAuthComponent = new BetterAuth(
  components.betterAuth,
  authFunctions
);

export const createAuth = (ctx: GenericCtx) =>
  betterAuth({
    database: convexAdapter(ctx, betterAuthComponent),
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
    plugins: [convex(), crossDomain()],
    logger: {
      level: "debug",
    },
  });
