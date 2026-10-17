import { httpRouter, httpActionGeneric } from "convex/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();
const registration = process.env.OAUTH_ROUTE_REGISTRATION;
if (registration !== "eager" && registration !== "lazy") {
  throw new Error("OAUTH_ROUTE_REGISTRATION must be eager or lazy");
}
http.route({
  path: "/registration-mode",
  method: "GET",
  handler: httpActionGeneric(async () => Response.json({ registration })),
});
if (registration === "lazy") {
  authComponent.registerRoutesLazy(http, createAuth);
} else {
  authComponent.registerRoutes(http, createAuth);
}
export default http;
