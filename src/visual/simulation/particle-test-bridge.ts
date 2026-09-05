import * as THREE from "three";

import type { GpuParticleSimulator } from "./gpu-particle-simulator";

export interface ParticleStateSnapshot {
  readonly count: number;
  readonly positions: Float32Array;
  readonly velocities: Float32Array;
  readonly finiteState: boolean;
  readonly allVelocitiesZero: boolean;
}

export interface ParticleValidationResult {
  readonly seedVelocityZero: boolean;
  readonly stepVelocityNonZero: boolean;
  readonly velocityPersistent: boolean;
  readonly positionUpdatedWithVelocity: boolean;
  readonly finiteState: boolean;
  readonly targetFormat: string;
  readonly framebufferComplete: boolean;
}

export interface ParticleTestBridge {
  readonly readSimulatorState: () => ParticleStateSnapshot;
  readonly stepSimulation: (dt?: number) => void;
  readonly runNumericalValidation: () => ParticleValidationResult;
}

export function isTestBridgeEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_TEST_BRIDGE === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_TEST_BRIDGE === "1"
  );
}

export function readRenderTargetToFloatArray(
  renderer: THREE.WebGLRenderer,
  target: THREE.WebGLRenderTarget,
): Float32Array {
  const width = target.width;
  const height = target.height;
  const pixelCount = width * height;
  const output = new Float32Array(pixelCount * 4);

  if (target.texture.type === THREE.HalfFloatType) {
    const halfFloatBuffer = new Uint16Array(pixelCount * 4);
    renderer.readRenderTargetPixels(target, 0, 0, width, height, halfFloatBuffer);
    for (let i = 0; i < halfFloatBuffer.length; i++) {
      output[i] = THREE.DataUtils.fromHalfFloat(halfFloatBuffer[i]);
    }
  } else {
    renderer.readRenderTargetPixels(target, 0, 0, width, height, output);
  }

  return output;
}

export function createParticleTestBridge(
  renderer: THREE.WebGLRenderer,
  simulator: GpuParticleSimulator,
): ParticleTestBridge | null {
  if (!isTestBridgeEnabled()) {
    return null;
  }

  const readState = (): ParticleStateSnapshot => {
    const { textureWidth, textureHeight } = simulator.config;
    const count = textureWidth * textureHeight;
    const positions = readRenderTargetToFloatArray(renderer, simulator.getReadTargetPos());
    const velocities = readRenderTargetToFloatArray(renderer, simulator.getReadTargetVel());

    let finiteState = true;
    let allVelocitiesZero = true;

    for (let i = 0; i < count * 4; i++) {
      if (!Number.isFinite(positions[i]) || !Number.isFinite(velocities[i])) {
        finiteState = false;
      }
      if (i % 4 < 3 && velocities[i] !== 0) {
        allVelocitiesZero = false;
      }
    }

    return {
      count,
      positions,
      velocities,
      finiteState,
      allVelocitiesZero,
    };
  };

  return {
    readSimulatorState: readState,
    stepSimulation: (dt = 0.016) => {
      simulator.step(1.0, dt, new THREE.Vector3(0, 0, 0), new THREE.Vector2(0, 0));
    },
    runNumericalValidation: () => {
      // 1. Validate seed state
      const seedState = readState();
      const seedVelocityZero = seedState.allVelocitiesZero;

      // 2. Step 1: with directional input to generate movement
      simulator.step(0.016, 0.016, new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector2(0.1, 0.1));
      const step1State = readState();
      const stepVelocityNonZero = !step1State.allVelocitiesZero;

      // 3. Step 2: continue simulation
      simulator.step(0.032, 0.016, new THREE.Vector3(0.5, 0.5, 0), new THREE.Vector2(0.1, 0.1));
      const step2State = readState();
      const velocityPersistent =
        step1State.velocities[0] !== step2State.velocities[0] ||
        step1State.velocities[1] !== step2State.velocities[1];

      const positionUpdatedWithVelocity =
        step1State.positions[0] !== step2State.positions[0] ||
        step1State.positions[1] !== step2State.positions[1];

      return {
        seedVelocityZero,
        stepVelocityNonZero,
        velocityPersistent,
        positionUpdatedWithVelocity,
        finiteState: seedState.finiteState && step1State.finiteState && step2State.finiteState,
        targetFormat: simulator.capabilities.renderTargetFormat,
        framebufferComplete: simulator.capabilities.framebufferComplete,
      };
    },
  };
}
