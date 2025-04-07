import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

const siteUrl = (import.meta.env.VITE_CONVEX_URL as string)
  .split(".cloud")[0]
  .concat(".site");

export const authClient = createAuthClient({
  baseURL: siteUrl,
  plugins: [jwtClient()],
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => {
        console.log("retrieving token");
        return localStorage.getItem("bearer_token") || ""; // get the token from localStorage
      },
    },
    onRequest: (ctx) => {
      console.log("onRequest", ctx.url);
    },
    onResponse: (ctx) => {
      console.log("onResponse", ctx.response.status, ctx.response.headers);
      if (ctx.response.status !== 200) {
        return;
      }
      const authToken = ctx.response.headers.get("Set-Auth-Token"); // get the token from the response headers
      console.log({ authToken });
      // Store the token securely (e.g., in localStorage)
      if (authToken) {
        localStorage.setItem("bearer_token", authToken);
      }
    },
  },
});
