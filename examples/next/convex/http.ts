import "./polyfills";
import { httpRouter } from "convex/server";
import { betterAuthComponent } from "./auth";

const http = httpRouter();

betterAuthComponent.registerRoutes(http, {
  allowedOrigins: ["http://localhost:3000", "https://localhost:3000"],
});

export default http;
