/**
 * tests/e2e/checkin-flow.spec.ts — Playwright E2E smoke test
 * Full implementation in Phase 10.
 * Guest login → check in a habit → streak increments → milestone celebration fires.
 */
import { test, expect } from "@playwright/test";

test.describe("Check-in smoke test", () => {
  test("guest login and check-in flow", async ({ page }) => {
    // Phase 10: full implementation
    await page.goto("/login");
    await expect(page).toHaveTitle(/Cadence/);
  });
});
