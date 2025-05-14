import "./polyfills";
import { httpRouter } from "convex/server";
import { betterAuthComponent, createAuth } from "./auth";

const http = httpRouter();

betterAuthComponent.registerRoutes(http, createAuth, {
  allowedOrigins: ["http://localhost:3000"],
});

export default http;
