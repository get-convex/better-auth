import { httpRouter } from "convex/server";
import { betterAuthComponent, createAuth } from "./auth";
import { requireEnv } from "./util";

const http = httpRouter();

betterAuthComponent.registerRoutes(http, createAuth, {
  allowedOrigins: [requireEnv("SITE_URL")],
});

export default http;
