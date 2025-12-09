import type { AuthProvider } from "convex/server";

export const getAuthConfigProvider = (opts?: { basePath?: string }) =>
  ({
    type: "customJwt",
    issuer: `${process.env.CONVEX_SITE_URL}`,
    applicationID: "convex",
    algorithm: "RS256",
    jwks: `${process.env.CONVEX_SITE_URL}${opts?.basePath ?? "/api/auth"}/convex/jwks`,
  }) satisfies AuthProvider;
