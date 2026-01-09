import { test, expect } from '@playwright/test';

test('sample test - should pass', async ({ page }) => {
  // Example test that always passes
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);
});

test('sample test - should also pass', async ({ page }) => {
  // Another example test
  const title = await page.title();
  expect(title).toBeTruthy();
});

