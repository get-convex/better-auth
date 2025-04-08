import { createAuthClient } from "@convex-dev/better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_CONVEX_SITE_URL,
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
      console.log(
        "onRequest",
        typeof ctx.url === "string" ? ctx.url : ctx.url.toString()
      );
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
