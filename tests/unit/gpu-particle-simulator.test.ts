import { describe, expect, it } from "vitest";

import { PointerTracker } from "../../src/visual/interaction/pointer-tracker";
import {
  ATMOSPHERE_CONFIG,
  PARTICLE_TIER_CONFIGS,
} from "../../src/visual/scenes/atmosphere/atmosphere-config";

describe("atmosphere configuration & tier budgets", () => {
  it("defines exact particle counts and texture dimensions per tier", () => {
    expect(PARTICLE_TIER_CONFIGS.high.count).toBe(50_176);
    expect(PARTICLE_TIER_CONFIGS.high.textureWidth).toBe(224);
    expect(PARTICLE_TIER_CONFIGS.high.textureHeight).toBe(224);
    expect(PARTICLE_TIER_CONFIGS.high.textureWidth * PARTICLE_TIER_CONFIGS.high.textureHeight).toBe(
      PARTICLE_TIER_CONFIGS.high.count,
    );

    expect(PARTICLE_TIER_CONFIGS.medium.count).toBe(24_000);
    expect(PARTICLE_TIER_CONFIGS.medium.textureWidth).toBe(160);
    expect(PARTICLE_TIER_CONFIGS.medium.textureHeight).toBe(150);
    expect(PARTICLE_TIER_CONFIGS.medium.textureWidth * PARTICLE_TIER_CONFIGS.medium.textureHeight).toBe(
      PARTICLE_TIER_CONFIGS.medium.count,
    );

    expect(PARTICLE_TIER_CONFIGS.low.count).toBe(8_064);
    expect(PARTICLE_TIER_CONFIGS.low.textureWidth).toBe(96);
    expect(PARTICLE_TIER_CONFIGS.low.textureHeight).toBe(84);
    expect(PARTICLE_TIER_CONFIGS.low.textureWidth * PARTICLE_TIER_CONFIGS.low.textureHeight).toBe(
      PARTICLE_TIER_CONFIGS.low.count,
    );

    expect(PARTICLE_TIER_CONFIGS.static.count).toBe(0);
  });

  it("specifies calibrated atmosphere constants and physical bounds", () => {
    expect(ATMOSPHERE_CONFIG.bounds.x).toBeGreaterThan(0);
    expect(ATMOSPHERE_CONFIG.bounds.y).toBeGreaterThan(0);
    expect(ATMOSPHERE_CONFIG.bounds.z).toBeGreaterThan(0);
    expect(ATMOSPHERE_CONFIG.simulation.damping).toBeLessThan(1.0);
    expect(ATMOSPHERE_CONFIG.simulation.pointerRadius).toBeGreaterThan(0.2);
    expect(ATMOSPHERE_CONFIG.colors.cyan).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(ATMOSPHERE_CONFIG.colors.violet).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

describe("PointerTracker", () => {
  it("initializes with zero coordinates and handles updates smoothly", () => {
    const tracker = new PointerTracker();
    const state = tracker.update(0.016);

    expect(state.current.x).toBe(0);
    expect(state.current.y).toBe(0);
    expect(state.current.z).toBe(0);
    expect(state.velocity.x).toBe(0);
    expect(state.velocity.y).toBe(0);

    tracker.dispose();
  });

  it("attaches and disposes event listeners cleanly", () => {
    const tracker = new PointerTracker();
    const cleanup = tracker.attach();
    expect(typeof cleanup).toBe("function");

    cleanup();
    tracker.dispose();
  });
});
