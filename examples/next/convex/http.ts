import "./polyfills";
import { httpRouter } from "convex/server";
import { betterAuthComponent } from "./auth";

const http = httpRouter();

betterAuthComponent.registerRoutes(http);

export default http;
