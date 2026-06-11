import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(import.meta.dirname, ".env.test") });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  timeout: 60_000,
  use: {
    baseURL: "http://localhost:5176",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx vite --port 5176 --clearScreen false",
    cwd: path.resolve(import.meta.dirname, "../examples/react"),
    url: "http://localhost:5176",
    reuseExistingServer: false,
    env: {
      VITE_CONVEX_URL: process.env.VITE_CONVEX_URL!,
      VITE_CONVEX_SITE_URL: process.env.VITE_CONVEX_SITE_URL!,
      VITE_SITE_URL: process.env.VITE_SITE_URL!,
    },
  },
});
