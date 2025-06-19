import { httpRouter } from "convex/server";
import { betterAuthComponent, createAuth } from "./auth";

const http = httpRouter();

betterAuthComponent.registerRoutes(http, createAuth, { cors: true });

export default http;
