import { createAuthClient } from "better-auth/react";
import { jwtClient, twoFactorClient } from "better-auth/client/plugins";
import { magicLinkClient } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
  plugins: [
    jwtClient(),
    magicLinkClient(),
    emailOTPClient(),
    twoFactorClient(),
  ],
  /*
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("bearer_token") || "",
    },
    onResponse: (ctx) => {
      if (ctx.response.status !== 200) {
        return;
      }
      const authToken = ctx.response.headers.get("Set-Auth-Token");
      if (authToken) {
        localStorage.setItem("bearer_token", authToken);
      }
    },
  },
  */
});
