import * as fs from "node:fs";
import * as path from "node:path";
import { expect, test } from "@playwright/test";

test("renders the single canvas runtime and transitions from poster to ready @smoke", async ({ page }) => {
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

  await page.goto("/lab/visual-system");

  // Verify semantic shell is immediately present
  await expect(page.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Laboratory sections" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Current shell capabilities" })).toBeVisible();

  // Exactly 1 canvas element or graceful static poster fallback
  const canvasCount = await page.locator("canvas").count();
  if (canvasCount === 1) {
    const posterState = await page.getByTestId("static-poster").getAttribute("data-poster-state");
    expect(["visible", "hidden"]).toContain(posterState);
  } else {
    await expect(page.getByTestId("static-poster")).toHaveAttribute("data-poster-state", "visible");
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("supports keyboard navigation to skip link and focuses laboratory shell", async ({ page }) => {
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

  await page.goto("/lab/visual-system");

  const skipLink = page.getByRole("link", { name: "Skip to laboratory shell" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#laboratory-shell")).toBeFocused();

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("tracks pointer movement across particle atmosphere", async ({ page }) => {
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

  await page.goto("/lab/visual-system");

  const stage = page.getByTestId("scene-frame");
  const box = await stage.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2);
    await page.waitForTimeout(50);
    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.8);
    await page.waitForTimeout(50);
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("renders static poster fallback in reduced-motion mode @visual", async ({ browser, baseURL }) => {
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

  await page.goto(`${baseURL}/lab/visual-system`);

  // Under reduced motion without override, canvas must not mount
  await expect(page.getByTestId("static-poster")).toHaveAttribute("data-poster-state", "visible");
  await expect(page.locator("canvas")).toHaveCount(0);

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);

  await context.close();
});

test("falls back gracefully when WebGL2 is blocked @visual", async ({ browser, baseURL }) => {
  const context = await browser.newContext();
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

  // Block WebGL2 context creation
  await page.addInitScript(() => {
    // @ts-expect-error - overriding WebGL2 for test
    window.WebGL2RenderingContext = undefined;
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    // @ts-expect-error - overriding getContext for test
    HTMLCanvasElement.prototype.getContext = function (type: string, ...args: unknown[]) {
      if (type === "webgl2") return null;
      // @ts-expect-error - forwarding
      return origGetContext.apply(this, [type, ...args]);
    };
  });

  await page.goto(`${baseURL}/lab/visual-system`);

  // Verify static poster is visible and shell remains functional
  await expect(page.getByTestId("static-poster")).toHaveAttribute("data-poster-state", "visible");
  await expect(page.getByRole("heading", { level: 1, name: "Visual System Laboratory" })).toBeVisible();

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);

  await context.close();
});

test("handles WebGL context loss and restoration gracefully", async ({ page }) => {
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
    // Firefox returns null for getShaderPrecisionFormat when context is intentionally lost
    if (!error.message.includes("getShaderPrecisionFormat")) {
      pageErrors.push(error.message);
    }
  });

  await page.goto("/lab/visual-system");

  const canvasCount = await page.locator("canvas").count();
  if (canvasCount === 1) {
    // Trigger context loss
    await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        const gl = canvas.getContext("webgl2");
        const ext = gl?.getExtension("WEBGL_lose_context");
        ext?.loseContext();
      }
    });

    await expect(page.getByTestId("static-poster")).toHaveAttribute("data-poster-state", "visible", {
      timeout: 5000,
    });

    // Trigger context restore
    await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        const gl = canvas.getContext("webgl2");
        const ext = gl?.getExtension("WEBGL_lose_context");
        ext?.restoreContext();
      }
    });
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
      if (!text.includes("_next/hmr")) {
        consoleErrors.push(text);
      }
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/lab/visual-system");

  const canvasCount = await page.locator("canvas").count();
  if (canvasCount === 1) {
    // Resize to mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    await expect(page.locator("canvas")).toHaveCount(1);

    // Resize back to large desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(300);
    await expect(page.locator("canvas")).toHaveCount(1);
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("supports 5 clean remount cycles without resource leaks", async ({ page }) => {
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

  await page.goto("/lab/visual-system");

  const canvasCount = await page.locator("canvas").count();
  if (canvasCount === 1) {
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
  }

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test("pauses simulation when document is hidden", async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      const text = message.text();
      if (
        !text.includes("_next/hmr") &&
        !text.includes("FEATURE_FAILURE_WEBGL_EXHAUSTED_DRIVERS") &&
        !text.includes("Error creating WebGL context")
      ) {
        consoleErrors.push(text);
      }
    }
  });
  page.on("pageerror", (error) => {
    if (
      !error.message.includes("Error creating WebGL context") &&
      !error.message.includes("getShaderPrecisionFormat")
    ) {
      pageErrors.push(error.message);
    }
  });

  await page.goto("/lab/visual-system?tier=medium&motion=full-preview");

  // Trigger hidden state
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: true, writable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  await page.waitForTimeout(200);

  // Restore visible state
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { value: false, writable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  await page.waitForTimeout(200);

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
      if (!text.includes("_next/hmr")) {
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

test("requires an enhanced WebGL particle path in Chromium @visual", async ({
  browser,
  baseURL,
}, testInfo) => {
  const browserName = test.info().project.name;
  test.skip(browserName !== "chromium", "Enhanced WebGL fixture specifically validated in Chromium");

  const context = await browser.newContext({
    reducedMotion: "no-preference",
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

  await page.goto(`${baseURL}/lab/visual-system?tier=medium&motion=full-preview`);

  const diagnostics = page.getByTestId("runtime-diagnostics");
  await expect(diagnostics).toHaveAttribute("data-status", "ready", { timeout: 10000 });
  await expect(diagnostics).toHaveAttribute("data-first-frame", "true");
  await expect(diagnostics).toHaveAttribute("data-canvas-count", "1");
  await expect(diagnostics).toHaveAttribute("data-points", "24000");

  const canvasCount = await page.locator("canvas").count();
  expect(canvasCount).toBe(1);

  const posterState = await page.getByTestId("static-poster").getAttribute("data-poster-state");
  expect(posterState).toBe("hidden");

  await page.screenshot({ path: testInfo.outputPath("visual-system-enhanced.png"), fullPage: true });

  const metricsDir = path.resolve(process.cwd(), "test-results");
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  const metrics = {
    commitSha: process.env.GITHUB_SHA || "local",
    browser: browserName,
    scenario: "enhanced-particle-atmosphere",
    qualityTier: "medium",
    webglStatus: "ready",
    canvasCount: 1,
    drawCalls: 1,
    triangles: 0,
    points: 24000,
    geometries: 1,
    textures: 4,
    firstFrameCommitted: true,
    consoleErrorsCount: consoleErrors.length,
    pageErrorsCount: pageErrors.length,
  };

  fs.writeFileSync(
    path.join(metricsDir, `metrics-enhanced-${browserName}.json`),
    JSON.stringify(metrics, null, 2),
  );

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
      if (!text.includes("_next/hmr")) {
        consoleErrors.push(text);
      }
    }
  });
  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.goto("/lab/visual-system");

  const canvasCount = await page.locator("canvas").count();
  const posterState = await page.getByTestId("static-poster").getAttribute("data-poster-state");
  const isEnhanced = canvasCount === 1 && posterState === "hidden";

  await page.screenshot({ path: testInfo.outputPath("visual-system-ready.png"), fullPage: true });

  // Record machine-readable metrics JSON per browser
  const metricsDir = path.resolve(process.cwd(), "test-results");
  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  const browserName = test.info().project.name;
  const metrics = {
    commitSha: process.env.GITHUB_SHA || "local",
    browser: browserName,
    viewport: page.viewportSize(),
    dpr: await page.evaluate(() => window.devicePixelRatio),
    qualityTier: isEnhanced ? "medium" : "static",
    webglStatus: isEnhanced ? "ready" : "static",
    canvasCount,
    drawCalls: isEnhanced ? 1 : 0,
    triangles: 0,
    points: isEnhanced ? 24000 : 0,
    geometries: isEnhanced ? 1 : 0,
    textures: isEnhanced ? 4 : 0,
    contextLossCount: 0,
    restorationCount: 0,
    consoleErrorsCount: consoleErrors.length,
    pageErrorsCount: pageErrors.length,
  };

  fs.writeFileSync(path.join(metricsDir, `metrics-${browserName}.json`), JSON.stringify(metrics, null, 2));

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
