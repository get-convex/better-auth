import { describe, expect, it } from "vitest";
import { crossDomain } from "./index.js";

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
