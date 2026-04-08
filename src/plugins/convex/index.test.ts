import { describe, expect, it, vi } from "vitest";
import type { AuthConfig } from "convex/server";

const getTokenMock = vi.fn(async (ctx: { asResponse?: boolean }) => {
  if (ctx?.asResponse === false) {
    return { token: "FAKE_JWT" };
  }
  // Simulate v1.6.0 default where a Request-bearing ctx gets wrapped
  // into a Response (the silent break ITEM 21 guards against).
  return new Response(JSON.stringify({ token: "FAKE_JWT" }), {
    headers: { "content-type": "application/json" },
  });
});

vi.mock("better-auth/plugins/jwt", () => {
  return {
    jwt: () => ({
      id: "jwt",
      endpoints: {
        getToken: getTokenMock,
        getJwks: vi.fn(async () => ({ keys: [] })),
      },
      schema: {},
    }),
  };
});

const { convex } = await import("./index.js");

const authConfig = {
  providers: [{ applicationID: "convex", domain: "https://example.com" }],
} satisfies AuthConfig;

const getJwtSetCookieMatcher = () => {
  const plugin = convex({ authConfig });
  const afterHooks = plugin.hooks?.after ?? [];
  const matcher = afterHooks.find((hook) => {
    return (
      hook.matcher({
        path: "/sign-in/email",
        context: { session: { id: "s1" } },
      } as unknown as Parameters<typeof hook.matcher>[0]) &&
      !hook.matcher({
        path: "/sign-out",
        context: { session: null },
      } as unknown as Parameters<typeof hook.matcher>[0])
    );
  })?.matcher;
  if (!matcher) {
    throw new Error("Failed to find Convex JWT set-cookie after hook matcher");
  }
  return matcher;
};

describe("convex plugin JWT cookie refresh matcher", () => {
  it("matches update-session", () => {
    const matcher = getJwtSetCookieMatcher();
    type MatcherContext = Parameters<typeof matcher>[0];
    const ctx = {
      path: "/update-session",
      context: { session: { id: "s1" } },
    };
    expect(matcher(ctx as unknown as MatcherContext)).toBe(true);
  });

  it("matches get-session only when a session exists", () => {
    const matcher = getJwtSetCookieMatcher();
    type MatcherContext = Parameters<typeof matcher>[0];
    const withSessionCtx = {
      path: "/get-session",
      context: { session: { id: "s1" } },
    };
    const withoutSessionCtx = {
      path: "/get-session",
      context: { session: null },
    };
    expect(matcher(withSessionCtx as unknown as MatcherContext)).toBe(true);
    expect(matcher(withoutSessionCtx as unknown as MatcherContext)).toBe(false);
  });
});

describe("convex plugin JWT cookie after-hook asResponse regression (ITEM 21)", () => {
  it("sets a real token, not the literal 'undefined', when request is a Request", async () => {
    getTokenMock.mockClear();
    const plugin = convex({ authConfig });
    const afterHooks = plugin.hooks?.after ?? [];
    // Find the specific jwt-cookie hook: matches sign-in but NOT sign-out.
    // Avoids picking up the oidcProvider after-hooks spread at the top.
    const hook = afterHooks.find((h) => {
      return (
        h.matcher({
          path: "/sign-in/email",
          context: { session: { id: "s1" } },
        } as unknown as Parameters<typeof h.matcher>[0]) &&
        !h.matcher({
          path: "/sign-out",
          context: { session: null },
        } as unknown as Parameters<typeof h.matcher>[0])
      );
    });
    expect(hook).toBeDefined();

    const inputCtx = {
      path: "/sign-in/email",
      method: "POST",
      request: new Request("https://example.com/api/auth/sign-in/email", {
        method: "POST",
      }),
      headers: new Headers(),
      returnHeaders: true,
      context: {
        session: { id: "s1", user: { id: "u1" } },
        newSession: null,
        createAuthCookie: () => ({
          name: "convex_jwt",
          attributes: {},
        }),
      },
    };
    const result = (await hook!.handler(
      inputCtx as unknown as Parameters<NonNullable<typeof hook>["handler"]>[0]
    )) as unknown as { headers: Headers };

    expect(getTokenMock).toHaveBeenCalled();
    const innerCtx = getTokenMock.mock.calls[0]?.[0] as {
      asResponse?: boolean;
    };
    expect(innerCtx?.asResponse).toBe(false);

    // Internal better-call setCookie writes set-cookie headers on the
    // middleware's responseHeaders. Inspect them to verify the cookie
    // received a real token, not the literal string "undefined".
    const setCookieHeader = result.headers.get("set-cookie");
    expect(setCookieHeader).toBeTruthy();
    expect(setCookieHeader).toContain("convex_jwt=FAKE_JWT");
    expect(setCookieHeader).not.toContain("convex_jwt=undefined");
  });
});
