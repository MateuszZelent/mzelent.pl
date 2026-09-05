import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { expect, test } from "@playwright/test";

test("real-gpu hardware performance audit and benchmark @perf", async ({ page }) => {
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

  // 1. Navigate to enhanced visual laboratory bench
  await page.goto("/lab/visual-system?tier=medium&motion=full-preview");

  // 2. Wait deterministically for ready status and first visible frame commitment
  await page.waitForFunction(
    () => {
      const diag = (window as any).__SCENE_STORE__?.getState().diagnostics;
      return diag?.runtimeStatus === "ready" && diag?.firstFrameCommitted === true;
    },
    { timeout: 15_000 },
  );

  // 3. Warm-up period (2 seconds)
  await page.waitForTimeout(2000);

  // 4. Idle sample collection (5 seconds)
  await page.waitForTimeout(5000);

  // 5. Pointer reactive sample collection (5 seconds)
  for (let i = 0; i < 25; i++) {
    const x = 300 + Math.sin(i * 0.4) * 250;
    const y = 300 + Math.cos(i * 0.4) * 150;
    await page.mouse.move(x, y);
    await page.waitForTimeout(200);
  }

  // 6. Extract hardware, WebGL, frame, and resource telemetry
  const hardwareReport = await page.evaluate(() => {
    const diag = (window as any).__SCENE_STORE__?.getState().diagnostics;
    const canvas = document.querySelector("canvas");
    let unmaskedVendor = "Unknown";
    let unmaskedRenderer = "Unknown";

    if (canvas) {
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
          unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
      }
    }

    const navEntries = performance.getEntriesByType("navigation");
    const navTiming = navEntries[0] as PerformanceNavigationTiming | undefined;

    return {
      userAgent: navigator.userAgent,
      dpr: window.devicePixelRatio,
      unmaskedVendor,
      unmaskedRenderer,
      diagnostics: diag,
      network: {
        encodedBodySize: navTiming?.encodedBodySize ?? 0,
        decodedBodySize: navTiming?.decodedBodySize ?? 0,
        transferSize: navTiming?.transferSize ?? 0,
      },
    };
  });

  const outputDir = path.resolve(process.cwd(), "test-results");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const finalReport = {
    timestamp: new Date().toISOString(),
    os: {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
    },
    browser: {
      name: test.info().project.name,
      userAgent: hardwareReport.userAgent,
    },
    gpu: {
      unmaskedVendor: hardwareReport.unmaskedVendor,
      unmaskedRenderer: hardwareReport.unmaskedRenderer,
      webgl2Supported: hardwareReport.diagnostics?.webgl2Supported,
      renderTargetFormat: hardwareReport.diagnostics?.renderTargetFormat,
      framebufferComplete: hardwareReport.diagnostics?.framebufferComplete,
    },
    viewport: page.viewportSize(),
    dpr: hardwareReport.dpr,
    performance: {
      frameSampleCount: hardwareReport.diagnostics?.frameSampleCount,
      frameP50Ms: hardwareReport.diagnostics?.frameP50Ms,
      frameP95Ms: hardwareReport.diagnostics?.frameP95Ms,
      frameWorstMs: hardwareReport.diagnostics?.frameWorstMs,
      slowFrameCount: hardwareReport.diagnostics?.slowFrameCount,
      firstFrameTimeMs: hardwareReport.diagnostics?.firstFrameTimeMs,
    },
    resources: {
      qualityTier: hardwareReport.diagnostics?.qualityTier,
      points: hardwareReport.diagnostics?.points,
      geometries: hardwareReport.diagnostics?.geometries,
      textures: hardwareReport.diagnostics?.textures,
      renderTargetCount: hardwareReport.diagnostics?.renderTargetCount,
      visibleDrawCalls: hardwareReport.diagnostics?.visibleDrawCalls,
      simulationPassesPerFrame: hardwareReport.diagnostics?.simulationPassesPerFrame,
      totalDrawCallsPerFrame: hardwareReport.diagnostics?.totalDrawCallsPerFrame,
      estimatedGpuBytes: hardwareReport.diagnostics?.estimatedGpuBytes,
      finiteState: hardwareReport.diagnostics?.finiteState,
    },
    network: hardwareReport.network,
    errors: {
      consoleErrorsCount: consoleErrors.length,
      pageErrorsCount: pageErrors.length,
    },
  };

  const reportPath = path.join(outputDir, "hardware-benchmark-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));

  console.log("\n==================================================");
  console.log("HARDWARE BENCHMARK AUDIT REPORT (pnpm perf:visual)");
  console.log("==================================================");
  console.log(`OS:                  ${finalReport.os.platform} (${finalReport.os.release})`);
  console.log(`Renderer:            ${finalReport.gpu.unmaskedRenderer}`);
  console.log(`Format:              ${finalReport.gpu.renderTargetFormat}`);
  console.log(`Points:              ${finalReport.resources.points}`);
  console.log(`Total Draw Calls:    ${finalReport.resources.totalDrawCallsPerFrame} (2 sim + 1 visible)`);
  console.log(
    `Estimated GPU Memory:${((finalReport.resources.estimatedGpuBytes ?? 0) / (1024 * 1024)).toFixed(2)} MB`,
  );
  console.log(`Frame p50:           ${finalReport.performance.frameP50Ms} ms`);
  console.log(`Frame p95:           ${finalReport.performance.frameP95Ms} ms`);
  console.log(`Worst Frame:         ${finalReport.performance.frameWorstMs} ms`);
  console.log(`Slow Frames (>33ms): ${finalReport.performance.slowFrameCount}`);
  console.log(`Finite State:        ${finalReport.resources.finiteState}`);
  console.log("==================================================\n");

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(finalReport.resources.finiteState).toBe(true);
});
