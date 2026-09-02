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

    // Verify research cards
    await expect(page.getByTestId("research-card-skyrmions")).toBeVisible();
    await expect(page.getByTestId("research-card-magnonics")).toBeVisible();
    await expect(page.getByTestId("research-card-simulations")).toBeVisible();
    await expect(page.getByTestId("research-card-instrumentation")).toBeVisible();

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
    await page.evaluate(() => window.scrollTo(0, 400));

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
    // Under reduced motion, no inline transform is applied or it is empty
    expect(foreTransform === null || foreTransform === "" || !foreTransform.includes("translate3d")).toBe(
      true,
    );

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);

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
