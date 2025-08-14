import { BetterAuthClientPlugin } from "better-auth/client";
import { convex } from ".";
import { BetterAuthOptions } from "better-auth";

export const convexClient = <O extends { options: BetterAuthOptions }>() => {
  return {
    id: "convex",
    $InferServerPlugin: {} as ReturnType<typeof convex<O["options"]>>,
  } satisfies BetterAuthClientPlugin;
};
