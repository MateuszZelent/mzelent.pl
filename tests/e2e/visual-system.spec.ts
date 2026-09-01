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
  await expect(page.getByRole("list", { name: "Current shell capabilities" })).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);

  if (process.env.PLAYWRIGHT_USE_PRODUCTION === "1") {
    await expect(page.getByTestId("dev-diagnostics")).toHaveCount(0);
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("supports keyboard navigation to skip link and focuses laboratory shell", async ({ page }) => {
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

  const skipLink = page.getByRole("link", { name: "Skip to laboratory shell" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#laboratory-shell")).toBeFocused();
  expect(page.url()).toContain("#laboratory-shell");

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

test("remains readable and high contrast in forced-colors mode @visual", async ({
  browser,
  baseURL,
}, testInfo) => {
  const context = await browser.newContext({ forcedColors: "active" });
  const page = await context.newPage();
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

  await page.goto(`${baseURL}/lab/visual-system`);

  await expect(page.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Laboratory sections" })).toBeVisible();
  await expect(page.getByTestId("surface-sample")).toBeVisible();
  await expect(page.getByText("Local light / not yet connected")).toBeVisible();

  // Test focus visibility in forced colors
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to laboratory shell" })).toBeFocused();

  await page.screenshot({ path: testInfo.outputPath("visual-system-forced-colors.png"), fullPage: true });

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);

  await context.close();
});

test("captures the shell visual fixture @visual", async ({ page }, testInfo) => {
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
  await expect(page.getByTestId("static-poster")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("visual-system-shell.png"), fullPage: true });

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("keeps the fallback composed for mobile reduced-motion input @visual", async ({
  browser,
  baseURL,
}, testInfo) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
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

  await page.goto(`${baseURL}/lab/visual-system`);

  await expect(page.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeVisible();
  await expect(page.getByTestId("static-poster")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Laboratory sections" })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("visual-system-mobile-shell.png"), fullPage: true });

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);

  await context.close();
});
