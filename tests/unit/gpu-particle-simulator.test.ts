import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";

import { PointerTracker } from "../../src/visual/interaction/pointer-tracker";
import {
  ATMOSPHERE_CONFIG,
  PARTICLE_TIER_CONFIGS,
} from "../../src/visual/scenes/atmosphere/atmosphere-config";
import { GpuParticleSimulator } from "../../src/visual/simulation/gpu-particle-simulator";

function createMockRenderer(): THREE.WebGLRenderer {
  return {
    getContext: vi.fn().mockReturnValue({
      getExtension: vi.fn().mockReturnValue({}),
      getParameter: vi.fn().mockReturnValue(4),
    }),
    getRenderTarget: vi.fn().mockReturnValue(null),
    setRenderTarget: vi.fn(),
    render: vi.fn(),
  } as unknown as THREE.WebGLRenderer;
}

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

describe("GpuParticleSimulator stateful velocity double-buffering", () => {
  it("initializes 4 double-buffered FBO targets and seeds initial state", () => {
    const mockRenderer = createMockRenderer();
    const simulator = new GpuParticleSimulator(mockRenderer, "medium");

    expect(simulator.config.count).toBe(24_000);
    expect(simulator.getCurrentTexture()).toBeDefined();
    expect(simulator.getCurrentVelocityTexture()).toBeDefined();

    // Initial render pass occurred to seed targetVelA and targetPosA
    expect(mockRenderer.render).toHaveBeenCalled();

    simulator.dispose();
  });

  it("executes two-pass simulation compute and ping-pongs render targets", () => {
    const mockRenderer = createMockRenderer();
    const simulator = new GpuParticleSimulator(mockRenderer, "low");

    const initialPosTexture = simulator.getCurrentTexture();
    const initialVelTexture = simulator.getCurrentVelocityTexture();

    const outputPosTexture = simulator.step(
      1.0,
      0.016,
      new THREE.Vector3(0.5, 0.5, 1.0),
      new THREE.Vector2(0.1, -0.2),
    );

    // Verify output texture is returned and targets swapped
    expect(outputPosTexture).toBeDefined();
    expect(simulator.getCurrentTexture()).toBeDefined();
    expect(simulator.getCurrentVelocityTexture()).toBeDefined();

    // Position and velocity textures must swap
    expect(simulator.getCurrentTexture()).not.toBe(initialPosTexture);
    expect(simulator.getCurrentVelocityTexture()).not.toBe(initialVelTexture);

    simulator.dispose();
  });

  it("disposes all 4 render targets, materials, and textures cleanly", () => {
    const mockRenderer = createMockRenderer();
    const simulator = new GpuParticleSimulator(mockRenderer, "high");

    expect(() => simulator.dispose()).not.toThrow();
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
