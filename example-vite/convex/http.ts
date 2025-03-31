import { httpRouter } from "convex/server";
import { corsRouter } from "./cors";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";

const requireEnv = (name: string) => {
  const value = process.env[name];
  if (value === undefined) {
    throw new Error(`Missing environment variable \`${name}\``);
  }
  return value;
};

const http = httpRouter();
const cors = corsRouter(http, {
  allowedOrigins: ["http://localhost:5173", "https://localhost:5173"],
  allowCredentials: true,
  allowedHeaders: ["Authorization", "Set-Auth-Token", "Content-Type"],
  verbose: true,
  exposedHeaders: ["Set-Auth-Token"],
});

http.route({
  path: "/.well-known/openid-configuration",
  method: "GET",
  handler: httpAction(async () => {
    const url = `${requireEnv("CONVEX_SITE_URL")}/api/auth/.well-known/openid-configuration`;
    return Response.redirect(url);
  }),
});

http.route({
  path: "/api/auth/.well-known/openid-configuration",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return auth(ctx).handler(request);
  }),
});

http.route({
  pathPrefix: "/api/auth/oauth2/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return auth(ctx).handler(request);
  }),
});

http.route({
  path: "/api/auth/jwks",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return auth(ctx).handler(request);
  }),
});

http.route({
  pathPrefix: "/api/auth/callback/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return auth(ctx).handler(request);
  }),
});

cors.route({
  pathPrefix: "/api/auth/",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return auth(ctx).handler(request);
  }),
});

cors.route({
  pathPrefix: "/api/auth/",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    return auth(ctx).handler(request);
  }),
});

export default cors.http;
