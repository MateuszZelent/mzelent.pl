# Phase 1 — Real Runtime Evidence & Authentic Telemetry Report

**Author:** Antigravity  
**Branch:** `test/real-runtime-evidence`  
**Status:** Complete & Verified  

---

## 1. Context & Objectives

In earlier iterations of Phase 1, runtime diagnostics and test artifact JSON files contained placeholder values or synthetic constants for render statistics (such as fixed draw calls or point counts).

The goal of PR 7 (`test/real-runtime-evidence`) is to replace all synthetic telemetry with genuine, measurable runtime evidence extracted directly from the browser runtime and the graphics engine (`renderer.info`, `performance.now()`, `PerformanceResourceTiming`, and `PerformanceNavigationTiming`).

---

## 2. Technical Architecture

### 2.1 Live GPU Telemetry via Three.js `gl.info`
Rather than reporting nominal configuration values, [VisualRuntime.tsx](file:///home/kkingstoun/git/mzelent.pl/src/visual/canvas/VisualRuntime.tsx) periodically inspects the underlying WebGL context state:
- `gl.info.render.calls` — exact GPU draw calls dispatched in the current render pass.
- `gl.info.render.points` — exact point primitives rendered (e.g. 24,000 particles in enhanced mode).
- `gl.info.render.triangles` — surface geometry primitives.
- `gl.info.memory.textures` — total GPU textures currently allocated and active.
- `gl.info.memory.geometries` — total GPU buffer geometries currently allocated.

These counters are updated live in the transient scene store (`updateDiagnostics`) and exposed on `window.__VISUAL_RUNTIME_METRICS__`.

### 2.2 Authentic Frame Durations (`FrameMonitor`)
[FrameMonitor](file:///home/kkingstoun/git/mzelent.pl/src/visual/quality/frame-monitor.ts) maintains a rolling buffer of frame intervals measured via high-resolution timestamps (`performance.now()`).
- Calculates sorted median `p50Ms` and 95th percentile `p95Ms`.
- Filters invalid negative timestamps or massive background jumps (>1000ms).
- Updates diagnostics and DOM data attributes (`data-p50`, `data-p95`) without triggering per-frame React state re-renders.

### 2.3 First Frame Latency Measurement
`recordFirstFrame()` records `firstFrameTimeMs = Math.round(performance.now())` precisely when the first rendered frame executes in `useFrame`, confirming that the WebGL surface has committed pixels before transitioning status to `ready`.

### 2.4 Network Asset & Transfer Size Tracking
In Playwright automated tests, `page.evaluate()` collects live `PerformanceResourceTiming` entries:
- JavaScript payload bytes (`.js` chunks).
- CSS stylesheet bytes (`.css`).
- Image / texture bytes (`.webp`, `.avif`, `.png`).
- DOM Content Loaded and Load event timings (`PerformanceNavigationTiming`).

---

## 3. Verification & Test Evidence

### 3.1 Unit Tests
- [tests/unit/real-runtime-evidence.test.ts](file:///home/kkingstoun/git/mzelent.pl/tests/unit/real-runtime-evidence.test.ts) validates `FrameMonitor` quantile math, buffer bounds, and timestamp filtering.
- 32/32 unit tests pass (`vitest run`).

### 3.2 End-to-End Browser Tests
- Chromium: 22/22 passed.
- Firefox: 21/21 passed (1 skipped on intentional chromium-only enhanced fixture test).
- Genuine `metrics-${browserName}.json` and `metrics-enhanced-${browserName}.json` files generated and uploaded as Playwright artifacts.
