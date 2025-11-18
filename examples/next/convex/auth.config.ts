import { AuthConfig } from "convex/server";
export default {
  providers: [
    {
      type: "customJwt",
      issuer: `${process.env.CONVEX_SITE_URL}`,
      applicationID: "convex",
      algorithm: "RS256",
      //jwks: `${process.env.CONVEX_SITE_URL}/api/auth/convex/jwks`,
      jwks: `data:text/plain;charset=utf-8;base64,${btoa(process.env.JWKS as string)}`,
    },
  ],
} satisfies AuthConfig;
