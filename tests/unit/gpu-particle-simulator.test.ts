import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";

import { PointerTracker } from "../../src/visual/interaction/pointer-tracker";
import {
  ATMOSPHERE_CONFIG,
  PARTICLE_TIER_CONFIGS,
  TEST_PARTICLE_FIXTURE,
} from "../../src/visual/scenes/atmosphere/atmosphere-config";
import { GpuParticleSimulator } from "../../src/visual/simulation/gpu-particle-simulator";

function createMockRenderer(): THREE.WebGLRenderer & { boundTargets: (THREE.WebGLRenderTarget | null)[] } {
  const boundTargets: (THREE.WebGLRenderTarget | null)[] = [];
  return {
    getRenderTarget: vi.fn().mockReturnValue(null),
    setRenderTarget: vi.fn((target: THREE.WebGLRenderTarget | null) => {
      boundTargets.push(target);
    }),
    render: vi.fn(),
    readRenderTargetPixels: vi.fn(),
    boundTargets,
  } as unknown as THREE.WebGLRenderer & { boundTargets: (THREE.WebGLRenderTarget | null)[] };
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
  it("initializes 4 double-buffered FBO targets and seeds initial state with exactly two copy passes in proper sequence", () => {
    const mockRenderer = createMockRenderer();
    const simulator = new GpuParticleSimulator(mockRenderer, "medium");

    expect(simulator.config.count).toBe(24_000);
    expect(simulator.getCurrentTexture()).toBeDefined();
    expect(simulator.getCurrentVelocityTexture()).toBeDefined();

    // In constructor: exactly 2 copy passes occurred (targetVelA, then targetPosA)
    expect(mockRenderer.render).toHaveBeenCalledTimes(2);
    expect(mockRenderer.boundTargets[0]).toBe(simulator.getReadTargetVel());
    expect(mockRenderer.boundTargets[1]).toBe(simulator.getReadTargetPos());

    simulator.dispose();
  });

  it("executes exactly two compute passes per step and alternates ping-pong buffers deterministically in sequence", () => {
    const mockRenderer = createMockRenderer();
    const simulator = new GpuParticleSimulator(mockRenderer, "low");

    // Clear render calls and bound targets recorded during constructor seeding
    vi.clearAllMocks();
    mockRenderer.boundTargets.length = 0;

    const initialPosTexture = simulator.getCurrentTexture();
    const initialVelTexture = simulator.getCurrentVelocityTexture();

    const expectedVelTarget1 = (simulator as any).writeTargetVel;
    const expectedPosTarget1 = (simulator as any).writeTargetPos;

    // Step 1: velB, then posB
    const outputPosTexture1 = simulator.step(
      1.0,
      0.016,
      new THREE.Vector3(0.5, 0.5, 1.0),
      new THREE.Vector2(0.1, -0.2),
    );

    // Exactly 2 passes in step 1 (velocity pass to writeTargetVel, position pass to writeTargetPos)
    expect(mockRenderer.render).toHaveBeenCalledTimes(2);
    expect(outputPosTexture1).toBeDefined();
    expect(mockRenderer.boundTargets[0]).toBe(expectedVelTarget1);
    expect(mockRenderer.boundTargets[1]).toBe(expectedPosTarget1);
    expect(simulator.getCurrentTexture()).not.toBe(initialPosTexture);
    expect(simulator.getCurrentVelocityTexture()).not.toBe(initialVelTexture);

    const posTextureStep1 = simulator.getCurrentTexture();
    const velTextureStep1 = simulator.getCurrentVelocityTexture();

    // Step 2: velA, then posA
    const outputPosTexture2 = simulator.step(
      1.016,
      0.016,
      new THREE.Vector3(0.5, 0.5, 1.0),
      new THREE.Vector2(0.1, -0.2),
    );

    // Exactly 4 passes total across two steps (2 per step)
    expect(mockRenderer.render).toHaveBeenCalledTimes(4);
    expect(outputPosTexture2).toBe(initialPosTexture);
    expect(simulator.getCurrentTexture()).toBe(initialPosTexture);
    expect(simulator.getCurrentVelocityTexture()).toBe(initialVelTexture);
    expect(simulator.getCurrentTexture()).not.toBe(posTextureStep1);
    expect(simulator.getCurrentVelocityTexture()).not.toBe(velTextureStep1);

    simulator.dispose();
  });

  it("disposes all 4 render targets, materials, and textures exactly once", () => {
    const mockRenderer = createMockRenderer();
    const simulator = new GpuParticleSimulator(mockRenderer, "high");

    const spyPosA = vi.spyOn((simulator as any).targetPosA, "dispose");
    const spyPosB = vi.spyOn((simulator as any).targetPosB, "dispose");
    const spyVelA = vi.spyOn((simulator as any).targetVelA, "dispose");
    const spyVelB = vi.spyOn((simulator as any).targetVelB, "dispose");
    const spyInitialPos = vi.spyOn((simulator as any).initialPositionTexture, "dispose");
    const spyMatVel = vi.spyOn((simulator as any).simMaterialVel, "dispose");
    const spyMatPos = vi.spyOn((simulator as any).simMaterialPos, "dispose");
    const spyQuadVel = vi.spyOn((simulator as any).quadMeshVel.geometry, "dispose");
    const spyQuadPos = vi.spyOn((simulator as any).quadMeshPos.geometry, "dispose");

    simulator.dispose();

    expect(spyPosA).toHaveBeenCalledTimes(1);
    expect(spyPosB).toHaveBeenCalledTimes(1);
    expect(spyVelA).toHaveBeenCalledTimes(1);
    expect(spyVelB).toHaveBeenCalledTimes(1);
    expect(spyInitialPos).toHaveBeenCalledTimes(1);
    expect(spyMatVel).toHaveBeenCalledTimes(1);
    expect(spyMatPos).toHaveBeenCalledTimes(1);
    expect(spyQuadVel).toHaveBeenCalledTimes(1);
    expect(spyQuadPos).toHaveBeenCalledTimes(1);
  });

  it("supports test-only 8x8 particle fixture and bridge inspection", () => {
    const mockRenderer = createMockRenderer();
    const simulator = new GpuParticleSimulator(mockRenderer, TEST_PARTICLE_FIXTURE);

    expect(simulator.config.count).toBe(64);
    expect(simulator.config.textureWidth).toBe(8);
    expect(simulator.config.textureHeight).toBe(8);
    expect(simulator.getReadTargetPos().width).toBe(8);
    expect(simulator.getReadTargetPos().height).toBe(8);

    simulator.dispose();
  });
});

describe("continuous time integration & frame-rate invariance", () => {
  it("maintains integration invariance across 30, 60, and 120 Hz over a 2.0s duration", () => {
    function simulate(fps: number, duration: number) {
      const dt = 1 / fps;
      const steps = Math.round(duration / dt);
      const gamma = ATMOSPHERE_CONFIG.simulation.dragPerSecond;
      const returnStrength = ATMOSPHERE_CONFIG.simulation.returnStrength;
      const speed = ATMOSPHERE_CONFIG.simulation.speed;

      let posX = 1.0;
      let velX = 0.0;
      const initX = 1.0;

      for (let i = 0; i < steps; i++) {
        const time = i * dt;
        const curl = Math.sin(time * 2.0 + posX * 0.5) * speed;
        const returnForce = (initX - posX) * returnStrength;
        const totalAccel = curl + returnForce;

        const decay = Math.exp(-gamma * dt);
        velX = (velX + totalAccel * dt) * decay;
        posX += velX * dt;
      }

      return { posX, velX };
    }

    const res120 = simulate(120, 2.0);
    const res60 = simulate(60, 2.0);
    const res30 = simulate(30, 2.0);

    const diffPos60vs120 = Math.abs(res60.posX - res120.posX) / (Math.abs(res120.posX) + 1e-5);
    const diffVel60vs120 = Math.abs(res60.velX - res120.velX) / (Math.abs(res120.velX) + 1e-5);
    const diffPos30vs120 = Math.abs(res30.posX - res120.posX) / (Math.abs(res120.posX) + 1e-5);
    const diffVel30vs120 = Math.abs(res30.velX - res120.velX) / (Math.abs(res120.velX) + 1e-5);

    expect(diffPos60vs120).toBeLessThan(0.03);
    expect(diffVel60vs120).toBeLessThan(0.03);
    expect(diffPos30vs120).toBeLessThan(0.08);
    expect(diffVel30vs120).toBeLessThan(0.08);
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
