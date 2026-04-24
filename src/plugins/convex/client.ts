import type { BetterAuthClientPlugin } from "better-auth/client";
import type { convex } from "./index.js";
import { VERSION } from "../../version.js";

export const convexClient = () => {
  return {
    id: "convex",
    version: VERSION,
    $InferServerPlugin: {} as ReturnType<typeof convex>,
  } satisfies BetterAuthClientPlugin;
};
