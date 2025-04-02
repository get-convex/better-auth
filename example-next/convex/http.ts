//import "./polyfills";
import { httpRouter } from "convex/server";
import { BetterAuth } from "@convex-dev/better-auth";
import { components } from "./_generated/api";
import { sendVerification } from "./email";

export const betterAuth = new BetterAuth(components.betterAuth, {
  trustedOrigins: ["http://localhost:3000"],
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user }) => {
      await sendVerification({ to: user.email });
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
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
});

const http = httpRouter();

betterAuth.registerRoutes(http, {
  allowedOrigins: ["http://localhost:3000"],
});

export default http;
