import { httpRouter } from "convex/server";
import { BetterAuth } from "@convex-dev/better-auth";
import { components } from "./_generated/api";

export const betterAuth = new BetterAuth(components.betterAuth);

const http = httpRouter();

betterAuth.registerRoutes(http, {
  allowedOrigins: ["*"],
});

export default http;
