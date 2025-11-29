import type { BetterAuthClientPlugin } from "better-auth/client";
import { convex } from ".";

export const convexClient = () => {
  return {
    id: "convex",
    $InferServerPlugin: {} as ReturnType<typeof convex>,
  } satisfies BetterAuthClientPlugin;
};
