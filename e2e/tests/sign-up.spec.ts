import { test, expect } from "@playwright/test";
import { browserSignUp } from "../helpers/auth";

test("sign up with email and password", async ({ page }) => {
  const email = `test+${Date.now()}@example.com`;
  const password = "TestPassword123!";

  await page.goto("/");
  await browserSignUp(page, email, password);

  await expect(page.getByTestId("auth-authenticated")).toBeVisible();
});
