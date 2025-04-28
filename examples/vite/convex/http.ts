import { httpRouter } from "convex/server";
import { BetterAuth } from "@convex-dev/better-auth";
import { components } from "./_generated/api";

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Missing environment variable \`${name}\``);
  }
  return value;
};

export const betterAuth = new BetterAuth(
  components.betterAuth,
  {
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
  },
  { verbose: true }
);

const http = httpRouter();

betterAuth.registerRoutes(http, {
  allowedOrigins: [requireEnv("SITE_URL")],
});

export default http;
