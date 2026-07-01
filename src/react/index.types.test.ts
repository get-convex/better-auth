import { anonymousClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { expectTypeOf, it } from "vitest";
import { convexClient } from "../plugins/convex/client.js";
import type { AuthClient } from "./index.js";

it("accepts createAuthClient with convexClient plugin", () => {
  const authClient = createAuthClient({
    plugins: [convexClient()],
  });

  expectTypeOf(authClient).toMatchTypeOf<AuthClient>();
});

it("accepts createAuthClient with convexClient and anonymousClient plugins", () => {
  const authClient = createAuthClient({
    plugins: [anonymousClient(), convexClient()],
  });

  expectTypeOf(authClient).toMatchTypeOf<AuthClient>();
});
