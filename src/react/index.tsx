"use client";

import { ConvexProviderWithAuth, ConvexReactClient } from "convex/react";
import { PropsWithChildren, useMemo } from "react";
import { AuthProvider, useAuth, type ConvexAuthClient } from "./client";
import { createAuthClient } from "better-auth/react";
import { BetterAuthClientPlugin, ClientOptions } from "better-auth";
import { convexClient } from "../plugins/convexClient";
import { crossDomainClient } from "../plugins/crossDomainClient";

export function ConvexBetterAuthProvider({
  client,
  authClient,
  children,
}: PropsWithChildren<{
  client: ConvexReactClient;
  authClient: ReturnType<
    typeof createAuthClient<
      ClientOptions & {
        plugins: [
          ReturnType<typeof convexClient>,
          ...(
            | [
                ReturnType<typeof crossDomainClient>,
                ...BetterAuthClientPlugin[],
              ]
            | BetterAuthClientPlugin[]
          ),
        ];
      }
    >
  >;
}>) {
  const convexAuthClient = useMemo(
    () =>
      ({
        verbose: (client as any).options?.verbose,
        logger: client.logger,
      }) satisfies ConvexAuthClient,
    [client]
  );
  return (
    <AuthProvider client={convexAuthClient} authClient={authClient}>
      <ConvexProviderWithAuth client={client} useAuth={useAuth}>
        {children}
      </ConvexProviderWithAuth>
    </AuthProvider>
  );
}

// TODO: Remove, short-lived alias
export { ConvexBetterAuthProvider as ConvexProviderWithBetterAuth };
