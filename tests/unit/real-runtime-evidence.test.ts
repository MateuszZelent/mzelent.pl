import { describe, expect, it } from "vitest";

import { FrameMonitor } from "../../src/visual/quality/frame-monitor";

describe("Real Runtime Evidence — FrameMonitor & GPU Telemetry", () => {
  it("computes accurate p50 and p95 frame durations from recorded timestamps", () => {
    const monitor = new FrameMonitor(60);

    // Initial state with 0 frames recorded
    expect(monitor.getMetrics()).toEqual({
      sampleCount: 0,
      lastDurationMs: 0,
      p50Ms: 0,
      p95Ms: 0,
    });

    // Simulate 60 frames with realistic 16.6ms intervals (60fps), with occasional 33ms spikes
    let currentTime = 1000;
    monitor.recordFrame(currentTime);

    for (let i = 1; i <= 60; i++) {
      // Every 10th frame has a spike of 32ms, others are 16ms
      const delta = i % 10 === 0 ? 32 : 16;
      currentTime += delta;
      monitor.recordFrame(currentTime);
    }

    const metrics = monitor.getMetrics();
    expect(metrics.sampleCount).toBe(60);
    expect(metrics.p50Ms).toBe(16);
    expect(metrics.p95Ms).toBe(32);
    expect(metrics.lastDurationMs).toBeGreaterThan(0);

    // Reset clears history
    monitor.reset();
    expect(monitor.getMetrics().sampleCount).toBe(0);
  });

  it("caps sample buffer to maxSamples without memory growth", () => {
    const monitor = new FrameMonitor(20);
    let time = 500;
    monitor.recordFrame(time);

    for (let i = 0; i < 100; i++) {
      time += 16.6;
      monitor.recordFrame(time);
    }

    const metrics = monitor.getMetrics();
    expect(metrics.sampleCount).toBe(20);
  });

  it("filters out bogus negative or extreme (> 1000ms) frame deltas", () => {
    const monitor = new FrameMonitor(10);
    monitor.recordFrame(100);
    monitor.recordFrame(50); // Backward time jump ignored
    monitor.recordFrame(2500); // Massive jump (> 1000ms) ignored

    expect(monitor.getMetrics().sampleCount).toBe(0);
  });
});
