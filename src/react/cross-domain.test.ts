import { describe, expect, it, vi } from "vitest";
import { createAuthClient } from "better-auth/react";
import {
  crossDomainCapability,
  crossDomainClient,
} from "../plugins/cross-domain/client.js";
import { handleCrossDomainCallback } from "./cross-domain.js";
import type { RequiredAuthClient } from "./cross-domain.js";

const coreClient = (): RequiredAuthClient => ({
  useSession: () => ({ data: null, isPending: false }),
  getSession: vi.fn(),
  convex: {
    token: vi.fn(),
  },
});

describe("handleCrossDomainCallback", () => {
  it("preserves the token when the client lacks cross-domain support", async () => {
    const authClient = createAuthClient({
      baseURL: "https://example.com",
    }) as unknown as RequiredAuthClient;
    const replaceUrl = vi.fn();

    await handleCrossDomainCallback(
      authClient,
      "https://example.com/callback?ott=one-time-token&next=%2Fsettings",
      replaceUrl
    );

    expect(replaceUrl).not.toHaveBeenCalled();
  });

  it("marks real clients only when the cross-domain plugin is installed", () => {
    const stored = new Map<string, string>();
    const core = createAuthClient({ baseURL: "https://example.com" });
    const crossDomain = createAuthClient({
      baseURL: "https://example.com",
      plugins: [
        crossDomainClient({
          storage: {
            getItem: (key) => stored.get(key) ?? null,
            setItem: (key, value) => stored.set(key, value),
          },
        }),
      ],
    });

    expect(
      (core as unknown as { crossDomainCapability?: unknown })
        .crossDomainCapability === crossDomainCapability
    ).toBe(false);
    expect(crossDomain.crossDomainCapability === crossDomainCapability).toBe(
      true
    );
  });

  it("verifies supported callbacks and refreshes the session", async () => {
    const authClient = {
      ...coreClient(),
      crossDomainCapability,
      crossDomain: {
        oneTimeToken: {
          verify: vi.fn().mockResolvedValue({
            data: { session: { token: "session-token" } },
          }),
        },
      },
      updateSession: vi.fn(),
    };
    const replaceUrl = vi.fn();

    await handleCrossDomainCallback(
      authClient,
      "https://example.com/callback?ott=one-time-token&next=%2Fsettings",
      replaceUrl
    );

    expect(authClient.crossDomain.oneTimeToken.verify).toHaveBeenCalledWith({
      token: "one-time-token",
    });
    expect(replaceUrl).toHaveBeenCalledOnce();
    const replacedUrl = replaceUrl.mock.calls[0]?.[0] as URL;
    expect(replacedUrl.searchParams.has("ott")).toBe(false);
    expect(replacedUrl.searchParams.get("next")).toBe("/settings");
    expect(authClient.getSession).toHaveBeenCalledWith({
      fetchOptions: {
        headers: { Authorization: "Bearer session-token" },
      },
    });
    expect(authClient.updateSession).toHaveBeenCalledOnce();
  });
});
