import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_CONVEX_SITE_URL,
  plugins: [convexClient()],
});
