import { expect, test } from "@playwright/test";

test("renders the semantic shell and static fallback @smoke", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/lab/visual-system");

  await expect(page.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeVisible();
  await expect(page.getByTestId("static-poster")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Laboratory sections" })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("remains readable with JavaScript disabled", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto(`${baseURL}/lab/visual-system`);

  await expect(page.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeVisible();
  await expect(page.getByTestId("static-poster")).toBeVisible();
  await expect(page.getByTestId("fallback-note")).toContainText("complete fallback");

  await context.close();
});

test("captures the shell visual fixture @visual", async ({ page }, testInfo) => {
  await page.goto("/lab/visual-system");
  await expect(page.getByTestId("static-poster")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("visual-system-shell.png"), fullPage: true });
});

test("keeps the fallback composed for mobile reduced-motion input @visual", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  await page.goto(`${baseURL}/lab/visual-system`);

  await expect(page.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeVisible();
  await expect(page.getByTestId("static-poster")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Laboratory sections" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("visual-system-mobile-shell.png"), fullPage: true });

  await context.close();
});
