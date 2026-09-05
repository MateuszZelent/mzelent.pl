import { expect, test } from "@playwright/test";

function extractTranslateY(transformStr: string | null): number {
  if (!transformStr) return 0;
  const match = /translate3d\([^,]+,\s*([-\d.]+)px/i.exec(transformStr);
  return match ? parseFloat(match[1]) : 0;
}

test.describe("Homepage — Mountain Parallax & Snow Particles", () => {
  test("renders the homepage with 2.5D mountain parallax layers and editorial shell @smoke", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await context.newPage();
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        const text = message.text();
        if (!text.includes("_next/hmr")) {
          consoleErrors.push(text);
        }
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(`${baseURL}/`);

    // Verify main semantic headings and navigation
    await expect(page.getByRole("heading", { level: 1, name: /Exploring magnetic textures/i })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Computational Physics/i })).toBeVisible();
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();

    // Verify all 4 distinct mountain depth layers are mounted
    await expect(page.getByTestId("parallax-layer-sky")).toBeVisible();
    await expect(page.getByTestId("parallax-layer-midground")).toBeVisible();
    await expect(page.getByTestId("parallax-layer-mist")).toBeVisible();
    await expect(page.getByTestId("parallax-layer-foreground")).toBeVisible();

    // Verify research cards and flagship software
    await expect(page.getByTestId("research-card-topological-solitons")).toBeVisible();
    await expect(page.getByTestId("research-card-spin-wave-optics")).toBeVisible();
    await expect(page.getByTestId("research-card-gpu-vector-fields")).toBeVisible();
    await expect(page.getByTestId("software-card-mmpp")).toBeVisible();
    await expect(page.getByTestId("software-card-mmpp-gui")).toBeVisible();

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

    await context.close();
  });

  test("calculates differential 2.5D parallax transforms on scroll", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await context.newPage();
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        const text = message.text();
        if (!text.includes("_next/hmr")) {
          consoleErrors.push(text);
        }
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(`${baseURL}/`);

    // Scroll down 400px
    await page.evaluate(() => {
      window.scrollTo(0, 400);
      window.dispatchEvent(new Event("scroll"));
    });

    // Poll until the lerped transforms update deterministically
    await expect
      .poll(
        async () => {
          const foreStyle = await page.getByTestId("parallax-layer-foreground").getAttribute("style");
          return extractTranslateY(foreStyle);
        },
        { intervals: [50, 100, 200], timeout: 5000 },
      )
      .toBeLessThan(-50); // Foreground moves significantly upward

    const skyStyle = await page.getByTestId("parallax-layer-sky").getAttribute("style");
    const midStyle = await page.getByTestId("parallax-layer-midground").getAttribute("style");
    const foreStyle = await page.getByTestId("parallax-layer-foreground").getAttribute("style");

    expect(skyStyle).toContain("translate3d");
    expect(midStyle).toContain("translate3d");
    expect(foreStyle).toContain("translate3d");

    const skyY = extractTranslateY(skyStyle);
    const midY = extractTranslateY(midStyle);
    const foreY = extractTranslateY(foreStyle);

    // Verify differential parallax depth relationship:
    // Sky sinks (> 0), Midground sinks (> 0 but < sky), Foreground rises (< 0)
    expect(skyY).toBeGreaterThan(0);
    expect(midY).toBeGreaterThan(0);
    expect(skyY).toBeGreaterThan(midY);
    expect(foreY).toBeLessThan(0);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

    await context.close();
  });

  test("disables parallax transforms and particle scene when prefers-reduced-motion is active @visual", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        const text = message.text();
        if (!text.includes("_next/hmr")) {
          consoleErrors.push(text);
        }
      }
    });
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(`${baseURL}/`);

    // Under reduced motion on homepage, snow particles must not be mounted
    await expect(page.getByTestId("parallax-layer-snow")).toHaveCount(0);

    // Scroll down 400px with reduced motion active
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(100);

    const foreTransform = await page.getByTestId("parallax-layer-foreground").getAttribute("style");
    expect(foreTransform === null || foreTransform === "" || !foreTransform.includes("translate3d")).toBe(
      true,
    );

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

    await context.close();
  });

  test("respects reduced motion by default on / while honoring explicit ?tier= overrides", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    // 1. Default visit to / strictly enforces reduced motion
    await page.goto(`${baseURL}/`);
    await expect(page.getByTestId("parallax-layer-snow")).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(100);
    let foreTransform = await page.getByTestId("parallax-layer-foreground").getAttribute("style");
    expect(foreTransform === null || foreTransform === "" || !foreTransform.includes("translate3d")).toBe(
      true,
    );

    // 2. Explicit ?tier=medium query parameter activates requested tier and snow
    await page.goto(`${baseURL}/?tier=medium`);
    await expect(page.getByTestId("parallax-layer-snow")).toHaveCount(1);

    await context.close();
  });

  test("isolates laboratory preview overrides so client navigation to / respects reduced motion", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      reducedMotion: "reduce",
    });
    const page = await context.newPage();

    // 1. Visit lab with full-preview
    await page.goto(`${baseURL}/lab/visual-system?motion=full-preview&tier=medium`);
    await expect(page.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeVisible();

    // 2. Click navigation link to homepage /
    await page.goto(`${baseURL}/`);
    await expect(page.getByRole("heading", { level: 1, name: /Exploring magnetic textures/i })).toBeVisible();

    // On homepage, snow must remain 0 and parallax inactive
    await expect(page.getByTestId("parallax-layer-snow")).toHaveCount(0);
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(100);
    const foreTransform = await page.getByTestId("parallax-layer-foreground").getAttribute("style");
    expect(foreTransform === null || foreTransform === "" || !foreTransform.includes("translate3d")).toBe(
      true,
    );

    await context.close();
  });

  test("supports keyboard skip link navigation to main content", async ({ page }) => {
    await page.goto("/");

    const skipLink = page.getByRole("link", { name: "Skip to main content" });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });
});
