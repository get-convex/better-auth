import { test, expect } from "@playwright/test";
import { browserSignUp, browserSignOut } from "../helpers/auth";

test("sign out after sign up", async ({ page }) => {
  const email = `test+${Date.now()}@example.com`;
  const password = "TestPassword123!";

  await page.goto("/");
  await browserSignUp(page, email, password);

  await browserSignOut(page);

  await expect(page.getByTestId("auth-unauthenticated")).toBeVisible();
});
