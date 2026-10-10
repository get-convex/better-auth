import { afterEach, describe, expect, it, vi } from "vitest";
import { getToken } from "./index.js";

const SITE_URL = "https://test.convex.site";

describe("getToken", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not send x-forwarded-host to the Convex site", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ token: "jwt" }), {
        headers: { "content-type": "application/json" },
      })
    );
    // Callers hand over the inbound request headers, and hosting platforms put
    // the app's own domain in `x-forwarded-host` on the way in. Convex's edge
    // routes on it, so it has to be dropped alongside the host rewrite.
    const headers = new Headers({ "x-forwarded-host": "app.example.com" });

    await getToken(SITE_URL, headers);

    expect(headers.get("x-forwarded-host")).toBeNull();
    expect(headers.get("host")).toBe(new URL(SITE_URL).host);
    const sent = new Headers(
      (fetchSpy.mock.calls[0]?.[1] as RequestInit | undefined)?.headers
    );
    expect(sent.get("x-forwarded-host")).toBeNull();
  });
});
