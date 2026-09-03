import { describe, expect, it } from "vitest";

import {
  PRESET_DESCRIPTIONS,
  SPINTRONICS_THEORY,
  SPINTRONICS_TIER_CONFIGS,
} from "../../src/visual/scenes/spintronics/spintronics-config";
import { initialSpintronicsPhysics, useSceneStore } from "../../src/visual/state/scene-store";

describe("3D Spintronics Simulation Engine & State Contract", () => {
  it("initializes with authentic spintronic physics defaults", () => {
    expect(initialSpintronicsPhysics.mode).toBe("skyrmion-neel");
    expect(initialSpintronicsPhysics.magneticField).toBe(45);
    expect(initialSpintronicsPhysics.dmiStrength).toBe(1.8);
    expect(initialSpintronicsPhysics.rfFrequency).toBe(9.2);
    expect(initialSpintronicsPhysics.dampingAlpha).toBe(0.008);
    expect(initialSpintronicsPhysics.colorMap).toBe("chiral");
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
});
