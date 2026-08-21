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
});
