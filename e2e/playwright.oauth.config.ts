import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./oauth-provider",
  forbidOnly: !!process.env.CI,
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3211",
    extraHTTPHeaders: { origin: "http://127.0.0.1:3211" },
  },
});
