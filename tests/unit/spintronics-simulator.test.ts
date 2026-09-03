import { describe, expect, it } from "vitest";

import {
  generatePolarArrowPositions,
  hsl2rgb,
  PRESET_DESCRIPTIONS,
  SPINTRONICS_THEORY,
  SPINTRONICS_TIER_CONFIGS,
  zelentPublicationRgb,
} from "../../src/visual/scenes/spintronics/spintronics-config";
import { initialSpintronicsPhysics, useSceneStore } from "../../src/visual/state/scene-store";

describe("3D Spintronics Simulation Engine & State Contract", () => {
  it("initializes with authentic spintronic physics defaults", () => {
    expect(initialSpintronicsPhysics.mode).toBe("skyrmion-neel");
    expect(initialSpintronicsPhysics.magneticField).toBe(45);
    expect(initialSpintronicsPhysics.dmiStrength).toBe(1.8);
    expect(initialSpintronicsPhysics.rfFrequency).toBe(9.2);
    expect(initialSpintronicsPhysics.dampingAlpha).toBe(0.008);
    expect(initialSpintronicsPhysics.colorMap).toBe("hsl-cone");
    expect(initialSpintronicsPhysics.showVectorField).toBe(true);
  });

  it("updates physics parameters through store actions without mutating previous state", () => {
    const { setSpintronicsPhysics } = useSceneStore.getState();

    setSpintronicsPhysics({
      mode: "skyrmion-bloch",
      magneticField: -30,
      dmiStrength: 2.5,
      rfFrequency: 14.0,
      dampingAlpha: 0.015,
      colorMap: "topological",
      showVectorField: false,
    });

    const state = useSceneStore.getState().spintronicsPhysics;
    expect(state.mode).toBe("skyrmion-bloch");
    expect(state.magneticField).toBe(-30);
    expect(state.dmiStrength).toBe(2.5);
    expect(state.rfFrequency).toBe(14.0);
    expect(state.dampingAlpha).toBe(0.015);
    expect(state.colorMap).toBe("topological");
    expect(state.showVectorField).toBe(false);

    // Reset to defaults
    useSceneStore.getState().reset();
    const resetState = useSceneStore.getState().spintronicsPhysics;
    expect(resetState.mode).toBe("skyrmion-neel");
    expect(resetState.magneticField).toBe(45);
  });

  it("provides quality tier configurations compliant with performance budgets", () => {
    const tiers = ["high", "medium", "low", "static"] as const;

    for (const tier of tiers) {
      const cfg = SPINTRONICS_TIER_CONFIGS[tier];
      expect(cfg).toBeDefined();
      expect(cfg.gridResolution).toBeGreaterThanOrEqual(32);
      expect(cfg.vectorDensity).toBeGreaterThanOrEqual(8);

      if (tier === "high") {
        expect(cfg.gridResolution).toBe(128);
        expect(cfg.enableShadows).toBe(true);
        expect(cfg.enableVectorArrows).toBe(true);
      } else if (tier === "static") {
        expect(cfg.enableVectorArrows).toBe(false);
      }
    }
  });

  it("defines physical descriptions and topological mechanisms for all presets", () => {
    const presets = ["skyrmion-neel", "skyrmion-bloch", "vortex", "spin-wave", "caustic-lens"] as const;

    for (const preset of presets) {
      const desc = PRESET_DESCRIPTIONS[preset];
      expect(desc).toBeDefined();
      expect(desc.name.length).toBeGreaterThan(5);
      expect(desc.topology.length).toBeGreaterThan(1);
      expect(desc.mechanism.length).toBeGreaterThan(5);
      expect(desc.equation).toContain("\\");
      expect(desc.description.length).toBeGreaterThan(20);
    }
  });

  it("contains Dr. Zelent's authentic exchange and DMI physical constants", () => {
    expect(SPINTRONICS_THEORY.exchangeConstantA).toBe(1.3e-11);
    expect(SPINTRONICS_THEORY.saturationMagnetizationMs).toBe(8.0e5);
    expect(SPINTRONICS_THEORY.interfacialDmiD).toBe(1.8e-3);
    expect(SPINTRONICS_THEORY.uniaxialAnisotropyKu).toBe(5.0e5);
    expect(SPINTRONICS_THEORY.exchangeLengthLex).toBeCloseTo(5.7, 0.1);
  });

  it("converts HSL coordinates to RGB using MMPP algorithm", () => {
    // -z core (mz = -1.0) -> L = 0.0 -> PURE BLACK
    const blackCore = hsl2rgb(0.0, 1.0, 0.0);
    expect(blackCore[0]).toBe(0);
    expect(blackCore[1]).toBe(0);
    expect(blackCore[2]).toBe(0);

    // +z perimeter (mz = +1.0) -> L = 1.0 -> PURE WHITE
    const whitePerimeter = hsl2rgb(0.0, 1.0, 1.0);
    expect(whitePerimeter[0]).toBe(1);
    expect(whitePerimeter[1]).toBe(1);
    expect(whitePerimeter[2]).toBe(1);

    // In-plane domain wall (mz = 0.0) -> L = 0.5:
    // 0 deg -> Red
    const red = hsl2rgb(0.0, 1.0, 0.5);
    expect(red[0]).toBeCloseTo(1.0, 2);
    expect(red[1]).toBeCloseTo(0.0, 2);
    expect(red[2]).toBeCloseTo(0.0, 2);

    // 120 deg -> Green
    const green = hsl2rgb(120 / 360, 1.0, 0.5);
    expect(green[0]).toBeCloseTo(0.0, 2);
    expect(green[1]).toBeCloseTo(1.0, 2);
    expect(green[2]).toBeCloseTo(0.0, 2);

    // 240 deg -> Blue
    const blue = hsl2rgb(240 / 360, 1.0, 0.5);
    expect(blue[0]).toBeCloseTo(0.0, 2);
    expect(blue[1]).toBeCloseTo(0.0, 2);
    expect(blue[2]).toBeCloseTo(1.0, 2);
  });

  it("converts magnetization mz to continuous scientific colormap from Dr. Zelent's publications", () => {
    // mz = -1.0 -> Deep Cobalt Blue (core)
    const coreColor = zelentPublicationRgb(-1.0);
    expect(coreColor[0]).toBeLessThan(0.1);
    expect(coreColor[1]).toBeLessThan(0.2);
    expect(coreColor[2]).toBeGreaterThan(0.8);

    // mz = 0.0 -> Emerald Green (in-plane domain wall transition)
    const wallColor = zelentPublicationRgb(0.0);
    expect(wallColor[0]).toBeLessThan(0.25);
    expect(wallColor[1]).toBeGreaterThan(0.8);
    expect(wallColor[2]).toBeLessThan(0.3);

    // mz = +1.0 -> Crimson Pink / Magenta (periphery)
    const outerColor = zelentPublicationRgb(1.0);
    expect(outerColor[0]).toBeGreaterThan(0.85);
    expect(outerColor[1]).toBeLessThan(0.2);
    expect(outerColor[2]).toBeGreaterThan(0.4);
  });

  it("generates concentric polar rings for authentic skyrmion arrow arrangement", () => {
    const coords = generatePolarArrowPositions(7, 2.15);
    expect(coords.length).toBeGreaterThan(100);
    // Center arrow is at origin
    expect(coords[0].x).toBe(0);
    expect(coords[0].y).toBe(0);
    expect(coords[0].r).toBe(0);
    // All coordinates are within max radius
    for (const c of coords) {
      expect(c.r).toBeLessThanOrEqual(2.1501);
    }
  });
});
