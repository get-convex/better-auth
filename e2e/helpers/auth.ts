import { Page, expect } from "@playwright/test";

export async function browserSignUp(
  page: Page,
  email: string,
  password: string,
  firstName = "Test",
  lastName = "User",
) {
  // Wait for unauthenticated state
  await expect(page.getByTestId("auth-unauthenticated")).toBeVisible({
    timeout: 30_000,
  });

  // Click "Sign up" toggle
  await page.getByRole("button", { name: "Sign up" }).click();

  // Fill sign-up form
  await page.getByLabel("First name").fill(firstName);
  await page.getByLabel("Last name").fill(lastName);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm Password").fill(password);

  // Submit
  await page.getByRole("button", { name: "Create an account" }).click();

  // Wait for authenticated state
  await expect(page.getByTestId("auth-authenticated")).toBeVisible({
    timeout: 30_000,
  });
}

export async function browserSignIn(
  page: Page,
  email: string,
  password: string,
) {
  // Wait for unauthenticated state
  await expect(page.getByTestId("auth-unauthenticated")).toBeVisible({
    timeout: 30_000,
  });

  // Switch to password sign-in mode
  await page
    .getByRole("button", { name: "Sign in with a password instead" })
    .click();

  // Fill sign-in form
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);

  // Submit
  await page.getByRole("button", { name: "Sign in with Password" }).click();

  // Wait for authenticated state
  await expect(page.getByTestId("auth-authenticated")).toBeVisible({
    timeout: 30_000,
  });
}

export async function browserSignOut(page: Page) {
  await page.getByRole("button", { name: "Sign out" }).click();

  // Wait for unauthenticated state
  await expect(page.getByTestId("auth-unauthenticated")).toBeVisible({
    timeout: 30_000,
  });
}
