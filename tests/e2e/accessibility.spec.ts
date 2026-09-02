import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Accessibility & Semantic Integrity", () => {
  test("has no automated accessibility violations on the laboratory shell @a11y", async ({ page }) => {
    await page.goto("/lab/visual-system");

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("has no automated accessibility violations on the homepage @a11y", async ({ page }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("verifies all internal anchor links resolve to existing elements on homepage", async ({ page }) => {
    await page.goto("/");

    const internalLinks = await page.locator('a[href^="#"]').all();
    expect(internalLinks.length).toBeGreaterThan(0);

    for (const link of internalLinks) {
      const href = await link.getAttribute("href");
      if (href && href.length > 1) {
        const targetId = href.substring(1);
        const targetElement = page.locator(`#${targetId}`);
        await expect(targetElement).toHaveCount(1);
      }
    }
  });
});
