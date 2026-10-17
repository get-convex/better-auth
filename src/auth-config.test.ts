import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAuthConfigProvider } from "./auth-config.js";

describe("getAuthConfigProvider", () => {
  const originalConvexSiteUrl = process.env.CONVEX_SITE_URL;

  beforeEach(() => {
    process.env.CONVEX_SITE_URL = "https://deployment.convex.site/";
  });

  afterEach(() => {
    if (originalConvexSiteUrl === undefined) {
      delete process.env.CONVEX_SITE_URL;
    } else {
      process.env.CONVEX_SITE_URL = originalConvexSiteUrl;
    }
  });

  it.each([
    [undefined, "https://deployment.convex.site/api/auth/convex/jwks"],
    ["/", "https://deployment.convex.site/convex/jwks"],
    ["/custom/auth/", "https://deployment.convex.site/custom/auth/convex/jwks"],
    ["custom/auth", "https://deployment.convex.site/custom/auth/convex/jwks"],
  ])("normalizes the %s base path", (basePath, expected) => {
    expect(getAuthConfigProvider({ basePath }).jwks).toBe(expected);
  });

  it("reports a missing Convex site URL", () => {
    delete process.env.CONVEX_SITE_URL;

    expect(() => getAuthConfigProvider()).toThrow("CONVEX_SITE_URL is not set");
  });

  it.each(["deployment.convex.site", "ftp://deployment.convex.site"])(
    "rejects the invalid Convex site URL %s",
    (siteUrl) => {
      process.env.CONVEX_SITE_URL = siteUrl;

      expect(() => getAuthConfigProvider()).toThrow(
        "CONVEX_SITE_URL must be a valid HTTP or HTTPS URL"
      );
      expect(() => getAuthConfigProvider({ jwks: "[]" })).toThrow(
        "CONVEX_SITE_URL must be a valid HTTP or HTTPS URL"
      );
    }
  );

  it.each([
    "https://deployment.convex.site?region=us",
    "https://deployment.convex.site#fragment",
  ])("rejects URL components in the Convex site URL %s", (siteUrl) => {
    process.env.CONVEX_SITE_URL = siteUrl;

    expect(() => getAuthConfigProvider()).toThrow(
      "CONVEX_SITE_URL must not include a query string or fragment"
    );
  });

  it("accepts an HTTP URL for a local Convex deployment", () => {
    process.env.CONVEX_SITE_URL = "http://127.0.0.1:3211";

    expect(getAuthConfigProvider().jwks).toBe(
      "http://127.0.0.1:3211/api/auth/convex/jwks"
    );
  });
});
