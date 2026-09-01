import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("has no automated accessibility violations on the shell @a11y", async ({ page }) => {
  await page.goto("/lab/visual-system");

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
