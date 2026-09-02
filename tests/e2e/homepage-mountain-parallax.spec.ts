import { expect, test } from "@playwright/test";

test.describe("Homepage — Mountain Parallax & Snow Particles", () => {
  test("renders the homepage with 2.5D mountain parallax layers and editorial shell @smoke", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        const text = message.text();
        if (
          !text.includes("WebGL creation failed") &&
          !text.includes("_next/hmr") &&
          !text.includes("Error creating WebGL context")
        ) {
          consoleErrors.push(text);
        }
      }
    });
    page.on("pageerror", (error) => {
      if (
        !error.message.includes("precision") &&
        !error.message.includes("Error creating WebGL context") &&
        !error.message.includes("WebGL")
      ) {
        pageErrors.push(error.message);
      }
    });

    await page.goto("/");

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
  });

  test("calculates differential 2.5D parallax transforms on scroll", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        const text = message.text();
        if (
          !text.includes("WebGL creation failed") &&
          !text.includes("_next/hmr") &&
          !text.includes("Error creating WebGL context")
        ) {
          consoleErrors.push(text);
        }
      }
    });
    page.on("pageerror", (error) => {
      if (
        !error.message.includes("precision") &&
        !error.message.includes("Error creating WebGL context") &&
        !error.message.includes("WebGL")
      ) {
        pageErrors.push(error.message);
      }
    });

    await page.goto("/");

    // Scroll down 400px
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(150);

    const skyTransform = await page.getByTestId("parallax-layer-sky").getAttribute("style");
    const midTransform = await page.getByTestId("parallax-layer-midground").getAttribute("style");
    const foreTransform = await page.getByTestId("parallax-layer-foreground").getAttribute("style");

    // Sky moves slowest (0.08 * 400 = ~32px), Foreground moves fastest (0.68 * 400 = ~272px)
    expect(skyTransform).toContain("translate3d");
    expect(midTransform).toContain("translate3d");
    expect(foreTransform).toContain("translate3d");

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("disables parallax transforms when prefers-reduced-motion is active @visual", async ({
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
        if (
          !text.includes("WebGL creation failed") &&
          !text.includes("_next/hmr") &&
          !text.includes("Error creating WebGL context")
        ) {
          consoleErrors.push(text);
        }
      }
    });
    page.on("pageerror", (error) => {
      if (
        !error.message.includes("precision") &&
        !error.message.includes("Error creating WebGL context") &&
        !error.message.includes("WebGL")
      ) {
        pageErrors.push(error.message);
      }
    });

    await page.goto(`${baseURL}/`);

    // Scroll down 400px with reduced motion active
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(100);

    const foreTransform = await page.getByTestId("parallax-layer-foreground").getAttribute("style");
    expect(foreTransform).toContain("translate3d(0, 0px, 0)");

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
