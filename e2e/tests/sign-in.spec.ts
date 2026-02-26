import { test, expect } from "@playwright/test";
import { browserSignUp, browserSignIn, browserSignOut } from "../helpers/auth";

test("sign in with email and password after sign up", async ({ page }) => {
  const email = `test+${Date.now()}@example.com`;
  const password = "TestPassword123!";

  // Sign up first
  await page.goto("/");
  await browserSignUp(page, email, password);

  // Sign out
  await browserSignOut(page);

  // Sign in with the same credentials
  await browserSignIn(page, email, password);

  await expect(page.getByTestId("auth-authenticated")).toBeVisible();
});
