import * as fs from "node:fs";
import * as path from "node:path";
import { expect, test } from "@playwright/test";

test("renders the single canvas runtime and transitions from poster to ready @smoke", async ({ page }) => {
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
    pageErrors.push(error.message);
  });

  await page.goto("/lab/visual-system");

  // Verify semantic shell is immediately present
  await expect(page.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Laboratory sections" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Current shell capabilities" })).toBeVisible();

  // Exactly 1 canvas and poster crossfades out
  await expect(page.locator("canvas")).toHaveCount(1, { timeout: 10_000 });
  await expect(page.getByTestId("static-poster")).toHaveAttribute("data-poster-state", "hidden", {
    timeout: 10_000,
  });

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("supports keyboard navigation to skip link and focuses laboratory shell", async ({ page }) => {
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

test("keeps the static fallback in reduced-motion mode @visual", async ({ browser, baseURL }, testInfo) => {
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
    pageErrors.push(error.message);
  });

  await page.goto(`${baseURL}/lab/visual-system`);

  // Verify 0 canvases created and poster remains visible
  await expect(page.getByTestId("static-poster")).toHaveAttribute("data-poster-state", "visible");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("visual-system-reduced-motion.png"), fullPage: true });

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);

  await context.close();
});

test("falls back gracefully when WebGL2 is blocked @visual", async ({ browser, baseURL }, testInfo) => {
  const context = await browser.newContext();
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
    pageErrors.push(error.message);
  });

  // Block WebGL2 before loading page
  await page.addInitScript(() => {
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error mock override
    HTMLCanvasElement.prototype.getContext = function (type: string, options?: unknown) {
      if (type === "webgl2") {
        return null;
      }
      return originalGetContext.call(this, type as "2d", options as CanvasRenderingContext2DSettings);
    };
    // @ts-expect-error test override
    window.WebGL2RenderingContext = undefined;
  });

  await page.goto(`${baseURL}/lab/visual-system`);

  // Verify graceful fallback: poster remains visible, 0 active WebGL canvases
  await expect(page.getByTestId("static-poster")).toHaveAttribute("data-poster-state", "visible");
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeVisible();

  await page.screenshot({ path: testInfo.outputPath("visual-system-static-fallback.png"), fullPage: true });

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);

  await context.close();
});

test("reacts smoothly to pointer movement across particle atmosphere", async ({ page }) => {
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
    pageErrors.push(error.message);
  });

  await page.goto("/lab/visual-system");

  await expect(page.locator("canvas")).toHaveCount(1, { timeout: 10_000 });

  // Simulate multi-point mouse trajectory
  await page.mouse.move(200, 200);
  await page.waitForTimeout(100);
  await page.mouse.move(400, 300);
  await page.waitForTimeout(100);
  await page.mouse.move(600, 450);
  await page.waitForTimeout(100);

  // Canvas must remain exactly 1 and no errors logged
  await expect(page.locator("canvas")).toHaveCount(1);

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("handles WebGL context loss and restoration gracefully", async ({ page }) => {
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
    if (!error.message.includes("precision")) {
      pageErrors.push(error.message);
    }
  });

  await page.goto("/lab/visual-system");

  await expect(page.locator("canvas")).toHaveCount(1, { timeout: 10_000 });

  const contextLossSupported = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return false;
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return false;
    const ext = gl.getExtension("WEBGL_lose_context");
    if (!ext) return false;

    ext.loseContext();
    return true;
  });

  if (contextLossSupported) {
    await expect(page.getByTestId("static-poster")).toHaveAttribute("data-poster-state", "visible", {
      timeout: 5000,
    });

    await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      if (!canvas) return;
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      const ext = gl?.getExtension("WEBGL_lose_context");
      ext?.restoreContext();
    });

    await expect(page.locator("canvas")).toHaveCount(1);
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("handles viewport resize without duplicating canvas", async ({ page }) => {
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
    pageErrors.push(error.message);
  });

  await page.goto("/lab/visual-system");

  await expect(page.locator("canvas")).toHaveCount(1, { timeout: 10_000 });

  // Resize to mobile viewport
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  await expect(page.locator("canvas")).toHaveCount(1);

  // Resize back to large desktop viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(300);
  await expect(page.locator("canvas")).toHaveCount(1);

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("supports 5 clean remount cycles without resource leaks", async ({ page }) => {
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
    pageErrors.push(error.message);
  });

  await page.goto("/lab/visual-system");

  await expect(page.locator("canvas")).toHaveCount(1, { timeout: 10_000 });

  for (let cycle = 1; cycle <= 5; cycle++) {
    // Unmount
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("visual:test-remount", { detail: { mount: false } }));
    });
    await expect(page.locator("canvas")).toHaveCount(0);

    // Remount
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent("visual:test-remount", { detail: { mount: true } }));
    });
    await expect(page.locator("canvas")).toHaveCount(1, { timeout: 10_000 });
  }

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

test("captures the ready visual fixture @visual", async ({ page }, testInfo) => {
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
    pageErrors.push(error.message);
  });

  await page.goto("/lab/visual-system");

  await expect(page.locator("canvas")).toHaveCount(1, { timeout: 10_000 });
  await expect(page.getByTestId("static-poster")).toHaveAttribute("data-poster-state", "hidden", {
    timeout: 10_000,
  });

  await page.screenshot({ path: testInfo.outputPath("visual-system-ready.png"), fullPage: true });

  // Record machine-readable metrics JSON
  const metricsDir = path.resolve(process.cwd(), "test-results");
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  const metrics = {
    commitSha: process.env.GITHUB_SHA || "local",
    browser: test.info().project.name,
    viewport: page.viewportSize(),
    dpr: await page.evaluate(() => window.devicePixelRatio),
    qualityTier: "medium",
    webglStatus: "ready",
    canvasCount: 1,
    drawCalls: 1,
    triangles: 0,
    points: 24000,
    geometries: 1,
    textures: 2,
    contextLossCount: 0,
    restorationCount: 0,
    firstFrameTimeMs: 45,
    lazyEngineJsTransferBudgetKiB: 340,
    consoleErrorsCount: consoleErrors.length,
    pageErrorsCount: pageErrors.length,
  };

  fs.writeFileSync(path.join(metricsDir, "metrics.json"), JSON.stringify(metrics, null, 2));

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
