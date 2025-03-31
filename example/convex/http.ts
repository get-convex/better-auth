import { httpRouter } from "convex/server";
import { BetterAuth } from "../../src/client";
import { components } from "./_generated/api";

const betterAuth = new BetterAuth(components.betterAuth);

const http = httpRouter();

betterAuth.registerRoutes(http);

export default http;
