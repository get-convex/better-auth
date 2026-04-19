import { describe, expect, it, vi } from "vitest";

const verifyOneTimeTokenMock = vi.fn(async (ctx: { asResponse?: boolean }) => {
  if (ctx?.asResponse === false) {
    return {
      session: { token: "FAKE_SESSION_TOKEN" },
      user: { id: "u1" },
    };
  }
  // Simulate v1.6.0 default where a Request-bearing ctx gets wrapped
  // into a Response. Without `asResponse: false`, setSessionCookie would
  // crash on `response.session.token` being undefined.
  return new Response(
    JSON.stringify({ session: { token: "FAKE_SESSION_TOKEN" }, user: { id: "u1" } }),
    { headers: { "content-type": "application/json" } }
  );
});

const setSessionCookieMock = vi.fn(
  async (
    _ctx: unknown,
    _session: { session?: { token?: string }; user?: { id?: string } }
  ) => {}
);

vi.mock("better-auth/plugins/one-time-token", () => {
  return {
    oneTimeToken: () => ({
      id: "one-time-token",
      endpoints: {
        verifyOneTimeToken: verifyOneTimeTokenMock,
      },
    }),
  };
});

vi.mock("better-auth/cookies", () => {
  return {
    setSessionCookie: setSessionCookieMock,
  };
});

const { crossDomain } = await import("./index.js");

const getPostRewriteMatcher = () => {
  const plugin = crossDomain({ siteUrl: "https://example.com" });
  const matcher = plugin.hooks?.before?.[2]?.matcher;
  if (!matcher) {
    throw new Error("expected cross-domain POST rewrite matcher");
  }
  return matcher;
};

describe("crossDomain POST rewrite matcher", () => {
  it("matches POST requests regardless of route", () => {
    const matcher = getPostRewriteMatcher();
    type MatcherContext = Parameters<typeof matcher>[0];

    const knownPathCtx = {
      method: "POST",
      path: "/sign-in/email",
      headers: new Headers(),
    } satisfies Partial<MatcherContext>;
    const unknownPathCtx = {
      method: "POST",
      path: "/custom-endpoint",
      headers: new Headers(),
    } satisfies Partial<MatcherContext>;

    expect(matcher(knownPathCtx as MatcherContext)).toBe(true);
    expect(matcher(unknownPathCtx as MatcherContext)).toBe(true);
  });

  it("rejects non-POST methods", () => {
    const matcher = getPostRewriteMatcher();
    type MatcherContext = Parameters<typeof matcher>[0];

    const getSignInCtx = {
      method: "GET",
      path: "/sign-in/email",
      headers: new Headers(),
    } satisfies Partial<MatcherContext>;
    const optionsLinkSocialCtx = {
      method: "OPTIONS",
      path: "/link-social",
      headers: new Headers(),
    } satisfies Partial<MatcherContext>;

    expect(matcher(getSignInCtx as MatcherContext)).toBe(false);
    expect(matcher(optionsLinkSocialCtx as MatcherContext)).toBe(false);
  });

  it("rejects expo-native requests", () => {
    const matcher = getPostRewriteMatcher();
    type MatcherContext = Parameters<typeof matcher>[0];

    const headers = new Headers();
    headers.set("expo-origin", "expo");

    const expoCtx = {
      method: "POST",
      path: "/sign-in/social",
      headers,
    } satisfies Partial<MatcherContext>;

    expect(matcher(expoCtx as MatcherContext)).toBe(false);
  });
});

describe("crossDomain verifyOneTimeToken asResponse regression", () => {
  it("forwards asResponse: false to the inner one-time-token endpoint", async () => {
    verifyOneTimeTokenMock.mockClear();
    setSessionCookieMock.mockClear();

    const plugin = crossDomain({ siteUrl: "https://example.com" });
    const endpoint = plugin.endpoints?.verifyOneTimeToken;
    if (!endpoint) {
      throw new Error("expected cross-domain verifyOneTimeToken endpoint");
    }

    // Pre-set the outer flags to true so the spread inside the handler
    // would carry true forward unless the production code explicitly
    // overrides them. If a refactor drops the override, the inner mock
    // sees true, returns a Response, and both assertions below fail.
    const inputCtx = {
      body: { token: "ott-abc" },
      method: "POST",
      request: new Request(
        "https://example.com/api/auth/cross-domain/one-time-token/verify",
        { method: "POST" }
      ),
      headers: new Headers(),
      asResponse: true,
      returnHeaders: true,
      returnStatus: true,
      context: {},
    };
    await endpoint(
      inputCtx as unknown as Parameters<typeof endpoint>[0]
    );

    expect(verifyOneTimeTokenMock).toHaveBeenCalled();
    const innerCtx = verifyOneTimeTokenMock.mock.calls[0]?.[0] as {
      asResponse?: boolean;
      returnHeaders?: boolean;
      returnStatus?: boolean;
    };
    // Without these flags, v1.6.0 wraps the result in a Response and
    // setSessionCookie crashes on `response.session.token === undefined`.
    expect(innerCtx?.asResponse).toBe(false);
    expect(innerCtx?.returnHeaders).toBe(false);
    expect(innerCtx?.returnStatus).toBe(false);

    // setSessionCookie must have received the unwrapped session object,
    // not a Response.
    expect(setSessionCookieMock).toHaveBeenCalled();
    const passedSession = setSessionCookieMock.mock.calls[0]?.[1];
    expect(passedSession?.session?.token).toBe("FAKE_SESSION_TOKEN");
  });
});
