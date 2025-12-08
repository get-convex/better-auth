import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";

console.log("test");

const http = httpRouter();

console.log("test2");

authComponent.registerRoutes(http, createAuth, { cors: true });

console.log("test3");

export default http;
