import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchAction = vi.fn(async () => ({ ok: true }));
const fetchMutation = vi.fn(async () => ({ ok: true }));
const fetchQuery = vi.fn(async () => ({ ok: true }));
const preloadQuery = vi.fn(async () => ({ ok: true }));

vi.mock("convex/nextjs", () => ({
  fetchAction,
  fetchMutation,
  fetchQuery,
  preloadQuery,
}));

vi.mock("next/headers.js", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("../utils/index.js", () => ({
  getToken: vi.fn(async () => ({ isFresh: true, token: "test-token" })),
}));

describe("convexBetterAuthNextJs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes convexUrl to authenticated Convex fetches", async () => {
    const { convexBetterAuthNextJs } = await import("./index.js");
    const query = "users:getCurrentUser" as never;
    const mutation = "users:createOrUpdateUserFromAuth" as never;
    const action = "admin:sendDirectSupportEmail" as never;

    const auth = convexBetterAuthNextJs({
      convexUrl: "https://example-deployment.convex.cloud",
      convexSiteUrl: "https://example-deployment.convex.site",
    });

    await auth.preloadAuthQuery(query, { userId: "user_123" } as never);
    await auth.fetchAuthQuery(query, { userId: "user_123" } as never);
    await auth.fetchAuthMutation(mutation, { userId: "user_123" } as never);
    await auth.fetchAuthAction(action, { userId: "user_123" } as never);

    expect(preloadQuery).toHaveBeenCalledWith(
      query,
      { userId: "user_123" },
      {
        token: "test-token",
        url: "https://example-deployment.convex.cloud",
      }
    );
    expect(fetchQuery).toHaveBeenCalledWith(
      query,
      { userId: "user_123" },
      {
        token: "test-token",
        url: "https://example-deployment.convex.cloud",
      }
    );
    expect(fetchMutation).toHaveBeenCalledWith(
      mutation,
      { userId: "user_123" },
      {
        token: "test-token",
        url: "https://example-deployment.convex.cloud",
      }
    );
    expect(fetchAction).toHaveBeenCalledWith(
      action,
      { userId: "user_123" },
      {
        token: "test-token",
        url: "https://example-deployment.convex.cloud",
      }
    );
  });
});
