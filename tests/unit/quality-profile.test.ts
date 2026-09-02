import { describe, expect, it } from "vitest";

import {
  calculateEffectiveDpr,
  type QualitySignals,
  resolveQualityProfile,
  selectQualityTier,
} from "../../src/visual/quality/quality-profile";

describe("Quality Profile and Tier Selection", () => {
  const baseDesktopSignals: QualitySignals = {
    hasWebGL2: true,
    prefersReducedMotion: false,
    coarsePointer: false,
    viewportWidth: 1920,
    viewportHeight: 1080,
    devicePixelRatio: 1,
    deviceMemory: 16,
  };

  it("selects static tier when prefers-reduced-motion is true", () => {
    const tier = selectQualityTier({
      ...baseDesktopSignals,
      prefersReducedMotion: true,
    });
    expect(tier).toBe("static");
  });

  it("selects static tier when WebGL2 is not supported", () => {
    const tier = selectQualityTier({
      ...baseDesktopSignals,
      hasWebGL2: false,
    });
    expect(tier).toBe("static");
  });

  it("selects low tier for coarse pointer (touch devices)", () => {
    const tier = selectQualityTier({
      ...baseDesktopSignals,
      coarsePointer: true,
    });
    expect(tier).toBe("low");
  });

  it("selects low tier for mobile viewport width (< 768px)", () => {
    const tier = selectQualityTier({
      ...baseDesktopSignals,
      viewportWidth: 390,
      viewportHeight: 844,
    });
    expect(tier).toBe("low");
  });

  it("selects high tier for large viewport, fine pointer, and >= 8GiB device memory within pixel budget", () => {
    const tier = selectQualityTier({
      ...baseDesktopSignals,
      viewportWidth: 1920,
      viewportHeight: 1080,
      devicePixelRatio: 1,
      deviceMemory: 16,
    });
    expect(tier).toBe("high");
  });

  it("safely defaults to medium tier when deviceMemory is undefined", () => {
    const tier = selectQualityTier({
      ...baseDesktopSignals,
      viewportWidth: 1920,
      viewportHeight: 1080,
      deviceMemory: undefined,
    });
    expect(tier).toBe("medium");
  });

  it("defaults to medium for desktop with deviceMemory < 8GiB", () => {
    const tier = selectQualityTier({
      ...baseDesktopSignals,
      viewportWidth: 1920,
      viewportHeight: 1080,
      deviceMemory: 4,
    });
    expect(tier).toBe("medium");
  });

  it("caps DPR according to quality tier rules", () => {
    expect(calculateEffectiveDpr("high", 3.0)).toBe(1.75);
    expect(calculateEffectiveDpr("medium", 3.0)).toBe(1.35);
    expect(calculateEffectiveDpr("low", 3.0)).toBe(1.0);
    expect(calculateEffectiveDpr("static", 3.0)).toBe(1.0);
    expect(calculateEffectiveDpr("high", 1.5)).toBe(1.5);
  });

  it("resolves full quality profile with powerPreference and antialias", () => {
    const highProfile = resolveQualityProfile(baseDesktopSignals);
    expect(highProfile.tier).toBe("high");
    expect(highProfile.dprCap).toBe(1.75);
    expect(highProfile.antialias).toBe(true);
    expect(highProfile.powerPreference).toBe("high-performance");

    const lowProfile = resolveQualityProfile({
      ...baseDesktopSignals,
      coarsePointer: true,
    });
    expect(lowProfile.tier).toBe("low");
    expect(lowProfile.dprCap).toBe(1.0);
    expect(lowProfile.antialias).toBe(false);
    expect(lowProfile.powerPreference).toBe("default");
  });
});
