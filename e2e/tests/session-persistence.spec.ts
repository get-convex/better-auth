import { test, expect } from "@playwright/test";
import { browserSignUp } from "../helpers/auth";

test("session persists across page reload", async ({ page }) => {
  const email = `test+${Date.now()}@example.com`;
  const password = "TestPassword123!";

  await page.goto("/");
  await browserSignUp(page, email, password);

  await expect(page.getByTestId("auth-authenticated")).toBeVisible();

  // Reload and verify session persists
  await page.reload();

  await expect(page.getByTestId("auth-authenticated")).toBeVisible({
    timeout: 30_000,
  });
});
