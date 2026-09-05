import * as THREE from "three";
import { describe, expect, it, vi } from "vitest";

import { TEST_PARTICLE_FIXTURE } from "../../src/visual/scenes/atmosphere/atmosphere-config";
import { GpuParticleSimulator } from "../../src/visual/simulation/gpu-particle-simulator";
import {
  createParticleTestBridge,
  isTestBridgeEnabled,
  readRenderTargetToFloatArray,
} from "../../src/visual/simulation/particle-test-bridge";

describe("particle-test-bridge", () => {
  it("confirms test bridge is enabled in non-production test environments", () => {
    expect(isTestBridgeEnabled()).toBe(true);
  });

  it("decodes FloatType render targets directly into Float32Array", () => {
    const mockTarget = {
      width: 2,
      height: 2,
      texture: { type: THREE.FloatType },
    } as unknown as THREE.WebGLRenderTarget;

    const mockRenderer = {
      readRenderTargetPixels: vi.fn((_target, _x, _y, _w, _h, buffer: Float32Array) => {
        buffer[0] = 1.25;
        buffer[1] = -2.5;
        buffer[2] = 0.5;
        buffer[3] = 1.0;
      }),
    } as unknown as THREE.WebGLRenderer;

    const result = readRenderTargetToFloatArray(mockRenderer, mockTarget);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(16); // 2 * 2 * 4
    expect(result[0]).toBeCloseTo(1.25);
    expect(result[1]).toBeCloseTo(-2.5);
    expect(result[2]).toBeCloseTo(0.5);
    expect(result[3]).toBeCloseTo(1.0);
  });

  it("decodes HalfFloatType render targets into Float32Array via DataUtils.fromHalfFloat", () => {
    const mockTarget = {
      width: 1,
      height: 1,
      texture: { type: THREE.HalfFloatType },
    } as unknown as THREE.WebGLRenderTarget;

    const halfVal = THREE.DataUtils.toHalfFloat(3.14);

    const mockRenderer = {
      readRenderTargetPixels: vi.fn((_target, _x, _y, _w, _h, buffer: Uint16Array) => {
        buffer[0] = halfVal;
        buffer[1] = 0;
        buffer[2] = 0;
        buffer[3] = 0;
      }),
    } as unknown as THREE.WebGLRenderer;

    const result = readRenderTargetToFloatArray(mockRenderer, mockTarget);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(4);
    expect(result[0]).toBeCloseTo(3.14, 2);
  });

  it("runs full numerical validation on GpuParticleSimulator via bridge", () => {
    let currentStep = 0;

    const mockRenderer = {
      getRenderTarget: vi.fn().mockReturnValue(null),
      setRenderTarget: vi.fn(),
      render: vi.fn(),
      readRenderTargetPixels: vi.fn((target: THREE.WebGLRenderTarget, _x, _y, w, h, buffer: any) => {
        const isVel = target === (simulator as any).readTargetVel;
        const isHalf = target.texture.type === THREE.HalfFloatType;
        for (let i = 0; i < w * h * 4; i++) {
          const val = isVel ? (currentStep === 0 ? 0 : currentStep * 0.25) : 1.0 + currentStep * 0.1;
          buffer[i] = isHalf ? THREE.DataUtils.toHalfFloat(val) : val;
        }
      }),
    } as unknown as THREE.WebGLRenderer;

    const mockCapabilities = {
      webgl2: true,
      vertexTextureFetch: true,
      fragmentHighPrecision: true,
      renderTargetFormat: "rgba16f" as const,
      framebufferComplete: true,
      staticReason: null,
    };

    const simulator = new GpuParticleSimulator(mockRenderer, TEST_PARTICLE_FIXTURE, mockCapabilities);

    const originalStep = simulator.step.bind(simulator);
    simulator.step = vi.fn((...args: Parameters<typeof originalStep>) => {
      currentStep++;
      return originalStep(...args);
    });

    const bridge = createParticleTestBridge(mockRenderer, simulator);
    expect(bridge).not.toBeNull();

    const validation = bridge!.runNumericalValidation();
    expect(validation.seedVelocityZero).toBe(true);
    expect(validation.stepVelocityNonZero).toBe(true);
    expect(validation.velocityPersistent).toBe(true);
    expect(validation.finiteState).toBe(true);
    expect(validation.framebufferComplete).toBe(true);

    simulator.dispose();
  });
});
