import { describe, expect, it } from "vitest";
import { betterAuth } from "better-auth/minimal";
import { memoryAdapter } from "better-auth/adapters/memory";
import type { MemoryDB } from "better-auth/adapters/memory";
import { magicLink } from "better-auth/plugins/magic-link";
import { crossDomain } from "./index.js";

const SITE_URL = "https://myapp.example.com";
const AUTH_BASE_URL = "http://localhost:3000";
const BASE_PATH = "/api/auth";

describe("crossDomain plugin", async () => {
  let capturedMagicLinkUrl = "";

  const db: MemoryDB = {
    user: [],
    session: [],
    account: [],
    verification: [],
  };

  const auth = betterAuth({
    baseURL: AUTH_BASE_URL,
    basePath: BASE_PATH,
    secret: "test-secret-at-least-thirty-two-characters-long",
    database: memoryAdapter(db),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      magicLink({
        sendMagicLink: async ({ url }) => {
          capturedMagicLinkUrl = url;
        },
      }),
      crossDomain({ siteUrl: SITE_URL }),
    ],
  });

  const post = (
    path: string,
    body: Record<string, unknown>,
    extraHeaders?: Record<string, string>
  ) =>
    auth.handler(
      new Request(`${AUTH_BASE_URL}${BASE_PATH}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...extraHeaders },
        body: JSON.stringify(body),
      })
    );

  await post("/sign-up/email", {
    email: "test@example.com",
    password: "testpassword123",
    name: "Test User",
  });

  describe("callbackURL defaulting for magic-link", () => {
    it("injects siteUrl when callbackURL is absent", async () => {
      capturedMagicLinkUrl = "";
      await post("/sign-in/magic-link", { email: "test@example.com" });
      const url = new URL(capturedMagicLinkUrl);
      expect(url.searchParams.get("callbackURL")).toBe(SITE_URL);
    });

    it("rewrites relative callbackURL to absolute using siteUrl", async () => {
      capturedMagicLinkUrl = "";
      await post("/sign-in/magic-link", {
        email: "test@example.com",
        callbackURL: "/dashboard",
      });
      const url = new URL(capturedMagicLinkUrl);
      expect(url.searchParams.get("callbackURL")).toBe(`${SITE_URL}/dashboard`);
    });

    it("preserves absolute callbackURL", async () => {
      capturedMagicLinkUrl = "";
      await post("/sign-in/magic-link", {
        email: "test@example.com",
        callbackURL: "https://other.example.com/callback",
      });
      const url = new URL(capturedMagicLinkUrl);
      expect(url.searchParams.get("callbackURL")).toBe(
        "https://other.example.com/callback"
      );
    });
  });

  describe("no callbackURL injection for email sign-in", () => {
    it("does not redirect when callbackURL is absent", async () => {
      const response = await post("/sign-in/email", {
        email: "test@example.com",
        password: "testpassword123",
      });
      expect(response.status).not.toBe(302);
    });
  });
});
