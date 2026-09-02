import { describe, expect, it } from "vitest";

import { SNOW_CONFIGS } from "../../src/visual/scenes/snow/snow-config";

describe("Snow Simulation Configuration", () => {
  it("defines exact particle counts and FBO grid resolutions per tier", () => {
    expect(SNOW_CONFIGS.high.particleCount).toBe(50_176);
    expect(SNOW_CONFIGS.high.fboWidth * SNOW_CONFIGS.high.fboHeight).toBe(50_176);
    expect(SNOW_CONFIGS.high.dprCap).toBe(1.75);

    expect(SNOW_CONFIGS.medium.particleCount).toBe(24_000);
    expect(SNOW_CONFIGS.medium.fboWidth * SNOW_CONFIGS.medium.fboHeight).toBe(24_000);
    expect(SNOW_CONFIGS.medium.dprCap).toBe(1.35);

    expect(SNOW_CONFIGS.low.particleCount).toBe(8_064);
    expect(SNOW_CONFIGS.low.fboWidth * SNOW_CONFIGS.low.fboHeight).toBe(8_064);
    expect(SNOW_CONFIGS.low.dprCap).toBe(1.0);

    expect(SNOW_CONFIGS.static.particleCount).toBe(0);
    expect(SNOW_CONFIGS.static.fboWidth).toBe(0);
  });

  it("configures positive downward fall speeds and lateral wind", () => {
    expect(SNOW_CONFIGS.high.fallSpeed).toBeGreaterThan(0.5);
    expect(SNOW_CONFIGS.high.windStrength).toBeGreaterThan(0.1);
    expect(SNOW_CONFIGS.high.turbulenceStrength).toBeGreaterThan(0.1);

    expect(SNOW_CONFIGS.medium.fallSpeed).toBeGreaterThan(0.5);
    expect(SNOW_CONFIGS.low.fallSpeed).toBeGreaterThan(0.4);
  });

  it("defines symmetric 3D simulation bounds", () => {
    const { bounds } = SNOW_CONFIGS.high;
    expect(bounds.x).toBeGreaterThan(4.0);
    expect(bounds.y).toBeGreaterThan(3.0);
    expect(bounds.z).toBeGreaterThan(2.0);
  });

  it("provides pointer interaction radius and force", () => {
    expect(SNOW_CONFIGS.high.pointerForce).toBeGreaterThan(1.0);
    expect(SNOW_CONFIGS.high.pointerRadius).toBeGreaterThan(1.0);
    expect(SNOW_CONFIGS.medium.pointerForce).toBeGreaterThan(1.0);
  });
});
