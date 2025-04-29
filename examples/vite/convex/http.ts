import { httpRouter } from "convex/server";
import { betterAuthComponent } from "./auth";
import { requireEnv } from "./util";

const http = httpRouter();

betterAuthComponent.registerRoutes(http, {
  allowedOrigins: [requireEnv("SITE_URL")],
});

export default http;
