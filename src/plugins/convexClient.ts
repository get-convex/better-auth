import { BetterAuthClientPlugin } from "better-auth/client";
import { convex } from "./convex";

export const convexClient = () => {
  return {
    id: "convex",
    $InferServerPlugin: {} as ReturnType<typeof convex>,
  } satisfies BetterAuthClientPlugin;
};
