import { describe, it, expect, beforeEach, vi } from "vitest";
import { getCookie, getSetCookie, parseSetCookieHeader, crossDomainClient } from "./client.js";

describe("parseSetCookieHeader", () => {
  it("parses a simple cookie", () => {
    const header = "session_token=abc123";
    const map = parseSetCookieHeader(header);
    expect(map.get("session_token")?.value).toBe("abc123");
  });

  it("parses cookie with attributes", () => {
    const header = "session_token=abc123; Path=/; Secure; HttpOnly";
    const map = parseSetCookieHeader(header);
    const cookie = map.get("session_token");
    expect(cookie?.value).toBe("abc123");
  });

  it("parses multiple cookies", () => {
    const header = "a=1, b=2";
    const map = parseSetCookieHeader(header);
    expect(map.get("a")?.value).toBe("1");
    expect(map.get("b")?.value).toBe("2");
  });
});

describe("getSetCookie", () => {
  it("stores expires as ISO string", () => {
    const header = "session_token=abc; Max-Age=3600";
    const result = JSON.parse(getSetCookie(header));
    expect(typeof result.session_token.expires).toBe("string");
    expect(result.session_token.expires).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("stores null expires when no expiry is set", () => {
    const header = "session_token=abc";
    const result = JSON.parse(getSetCookie(header));
    expect(result.session_token.expires).toBeNull();
  });

  it("merges with previous cookies", () => {
    const prev = JSON.stringify({
      old_cookie: { value: "old", expires: null },
    });
    const header = "new_cookie=new";
    const result = JSON.parse(getSetCookie(header, prev));
    expect(result.old_cookie.value).toBe("old");
    expect(result.new_cookie.value).toBe("new");
  });

  it("overwrites previous cookies with same name", () => {
    const prev = JSON.stringify({
      token: { value: "old", expires: null },
    });
    const header = "token=new";
    const result = JSON.parse(getSetCookie(header, prev));
    expect(result.token.value).toBe("new");
  });

  it("survives invalid previous cookie JSON", () => {
    const header = "token=abc";
    const result = JSON.parse(getSetCookie(header, "not-json"));
    expect(result.token.value).toBe("abc");
  });
});

describe("getCookie", () => {
  it("returns cookie string for valid cookies", () => {
    const stored = JSON.stringify({
      session: { value: "abc", expires: new Date(Date.now() + 60000).toISOString() },
    });
    const result = getCookie(stored);
    expect(result).toContain("session=abc");
  });

  it("filters out expired cookies", () => {
    const stored = JSON.stringify({
      expired: { value: "old", expires: new Date(Date.now() - 60000).toISOString() },
      valid: { value: "new", expires: new Date(Date.now() + 60000).toISOString() },
    });
    const result = getCookie(stored);
    expect(result).not.toContain("expired=old");
    expect(result).toContain("valid=new");
  });

  it("keeps cookies with no expiry", () => {
    const stored = JSON.stringify({
      session: { value: "abc", expires: null },
    });
    const result = getCookie(stored);
    expect(result).toContain("session=abc");
  });

  it("handles expires after JSON round-trip (string, not Date)", () => {
    // This is the core bug #1 scenario: expires is a string after JSON.parse
    const past = new Date(Date.now() - 60000);
    const stored = JSON.stringify({
      expired: { value: "old", expires: past.toISOString() },
    });
    // After JSON.parse, expires is a string — getCookie must handle this
    const result = getCookie(stored);
    expect(result).not.toContain("expired=old");
  });

  it("returns empty string for empty cookie object", () => {
    expect(getCookie("{}")).toBe("");
  });

  it("returns empty string for invalid JSON", () => {
    expect(getCookie("not-json")).toBe("");
  });
});

describe("crossDomainClient", () => {
  let storage: Map<string, string>;
  let mockStorage: { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void };
  const cookieName = "better-auth_cookie";
  const localCacheName = "better-auth_session_data";

  beforeEach(() => {
    storage = new Map<string, string>();
    mockStorage = {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => { storage.set(key, value); },
    };
  });

  function getActions() {
    const plugin = crossDomainClient({ storage: mockStorage });
    const mockStore = {
      notify: () => {},
      atoms: { session: { set: () => {}, get: () => ({}) } },
    };
    return plugin.getActions({} as any, mockStore as any);
  }

  function getOnSuccessHook() {
    const plugin = crossDomainClient({ storage: mockStorage });
    return plugin.fetchPlugins[0].hooks!.onSuccess!;
  }

  function getOnSuccessHookWithStore() {
    const plugin = crossDomainClient({ storage: mockStorage });
    const notify = vi.fn();
    const mockStore = {
      notify,
      atoms: { session: { set: () => {}, get: () => ({}) } },
    };
    // getActions sets the internal store reference
    plugin.getActions({} as any, mockStore as any);
    return { onSuccess: plugin.fetchPlugins[0].hooks!.onSuccess!, notify };
  }

  describe("getSessionData", () => {
    it("returns null when storage is empty", () => {
      const actions = getActions();
      expect(actions.getSessionData()).toBeNull();
    });

    it("returns null for empty object in storage", () => {
      storage.set(localCacheName, "{}");
      const actions = getActions();
      expect(actions.getSessionData()).toBeNull();
    });

    it("returns parsed session data", () => {
      const sessionData = { session: { id: "123" }, user: { name: "test" } };
      storage.set(localCacheName, JSON.stringify(sessionData));
      const actions = getActions();
      expect(actions.getSessionData()).toEqual(sessionData);
    });

    it("returns null for stored 'null' string", () => {
      storage.set(localCacheName, "null");
      const actions = getActions();
      expect(actions.getSessionData()).toBeNull();
    });

    it("returns null for corrupt JSON in storage", () => {
      storage.set(localCacheName, "not-valid-json");
      const actions = getActions();
      expect(actions.getSessionData()).toBeNull();
    });
  });

  describe("onSuccess handler", () => {
    it("clears cookies when get-session returns null", async () => {
      storage.set(cookieName, JSON.stringify({
        "better-auth.session_token": { value: "stale", expires: null },
      }));

      const onSuccess = getOnSuccessHook();
      await onSuccess({
        data: null,
        request: { url: new URL("https://example.com/api/auth/get-session") },
        response: { headers: new Headers() },
      } as any);

      expect(storage.get(cookieName)).toBe("{}");
    });

    it("preserves cookies when get-session returns data", async () => {
      const existingCookies = JSON.stringify({
        "better-auth.session_token": { value: "valid", expires: null },
      });
      storage.set(cookieName, existingCookies);

      const onSuccess = getOnSuccessHook();
      await onSuccess({
        data: { session: { id: "123" }, user: { name: "test" } },
        request: { url: new URL("https://example.com/api/auth/get-session") },
        response: { headers: new Headers() },
      } as any);

      expect(storage.get(cookieName)).toBe(existingCookies);
    });

    it("caches session data on get-session", async () => {
      const sessionData = { session: { id: "123" }, user: { name: "test" } };
      const onSuccess = getOnSuccessHook();
      await onSuccess({
        data: sessionData,
        request: { url: new URL("https://example.com/api/auth/get-session") },
        response: { headers: new Headers() },
      } as any);

      expect(storage.get(localCacheName)).toBe(JSON.stringify(sessionData));
    });
  });

  describe("session signal notification", () => {
    it("notifies when session token changes", async () => {
      const { onSuccess, notify } = getOnSuccessHookWithStore();
      await onSuccess({
        data: null,
        request: { url: new URL("https://example.com/api/auth/sign-in") },
        response: {
          headers: new Headers({
            "set-better-auth-cookie":
              "better-auth.session_token=new-token; Max-Age=3600",
          }),
        },
      } as any);

      expect(notify).toHaveBeenCalledWith("$sessionSignal");
    });

    it("does not notify when session token value is unchanged", async () => {
      // Pre-populate storage with existing token
      storage.set(
        cookieName,
        JSON.stringify({
          "better-auth.session_token": {
            value: "same-token",
            expires: new Date(Date.now() + 3600000).toISOString(),
          },
        })
      );

      const { onSuccess, notify } = getOnSuccessHookWithStore();
      await onSuccess({
        data: null,
        request: { url: new URL("https://example.com/api/auth/get-session") },
        response: {
          headers: new Headers({
            "set-better-auth-cookie":
              "better-auth.session_token=same-token; Max-Age=3600",
          }),
        },
      } as any);

      expect(notify).not.toHaveBeenCalled();
    });

    it("notifies when session token value differs from stored", async () => {
      storage.set(
        cookieName,
        JSON.stringify({
          "better-auth.session_token": {
            value: "old-token",
            expires: new Date(Date.now() + 3600000).toISOString(),
          },
        })
      );

      const { onSuccess, notify } = getOnSuccessHookWithStore();
      await onSuccess({
        data: null,
        request: { url: new URL("https://example.com/api/auth/get-session") },
        response: {
          headers: new Headers({
            "set-better-auth-cookie":
              "better-auth.session_token=new-token; Max-Age=3600",
          }),
        },
      } as any);

      expect(notify).toHaveBeenCalledWith("$sessionSignal");
    });

    it("does not notify for non-session cookies", async () => {
      const { onSuccess, notify } = getOnSuccessHookWithStore();
      await onSuccess({
        data: null,
        request: { url: new URL("https://example.com/api/auth/something") },
        response: {
          headers: new Headers({
            "set-better-auth-cookie": "other_cookie=value; Max-Age=3600",
          }),
        },
      } as any);

      expect(notify).not.toHaveBeenCalled();
    });
  });
});
