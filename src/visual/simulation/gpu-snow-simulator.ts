import * as THREE from "three";

import type { QualityTier } from "../quality/quality-contract";
import { SNOW_CONFIGS, type SnowConfig } from "../scenes/snow/snow-config";
import { snowSimulationFragmentShader } from "../shaders/snow/simulation.frag";
import { snowSimulationVertexShader } from "../shaders/snow/simulation.vert";

import { negotiateParticleCapabilities, type ParticleRuntimeCapabilities } from "./particle-capabilities";

export class GpuSnowSimulator {
  readonly config: SnowConfig;
  readonly capabilities: ParticleRuntimeCapabilities;
  private readonly renderer: THREE.WebGLRenderer;
  private targetA: THREE.WebGLRenderTarget;
  private targetB: THREE.WebGLRenderTarget;
  private readTarget: THREE.WebGLRenderTarget;
  private writeTarget: THREE.WebGLRenderTarget;

  private readonly initialPositionTexture: THREE.DataTexture;
  private readonly simScene: THREE.Scene;
  private readonly simCamera: THREE.OrthographicCamera;
  private readonly simMaterial: THREE.ShaderMaterial;
  private readonly quadMesh: THREE.Mesh;

  constructor(renderer: THREE.WebGLRenderer, tier: QualityTier, capabilities?: ParticleRuntimeCapabilities) {
    this.renderer = renderer;
    this.config = SNOW_CONFIGS[tier];
    this.capabilities = capabilities ?? negotiateParticleCapabilities(renderer);

    const {
      fboWidth,
      fboHeight,
      bounds,
      fallSpeed,
      windStrength,
      turbulenceStrength,
      pointerRadius,
      pointerForce,
    } = this.config;

    const particleCount = fboWidth * fboHeight;
    const initialPositions = new Float32Array(particleCount * 4);

    // Seed snow positions evenly throughout the 3D volume
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 4;
      const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      const seedFrac = seed - Math.floor(seed);

      const x = ((Math.sin(i * 0.37 + 1.1) * 0.5 + 0.5) * 2.0 - 1.0) * bounds.x;
      const y = ((Math.cos(i * 0.49 + 2.3) * 0.5 + 0.5) * 2.0 - 1.0) * bounds.y;
      const z = -0.3 - seedFrac * 2.2;

      initialPositions[idx + 0] = x;
      initialPositions[idx + 1] = y;
      initialPositions[idx + 2] = z;
      initialPositions[idx + 3] = seedFrac; // Individual seed & size factor
    }

    this.initialPositionTexture = new THREE.DataTexture(
      initialPositions,
      fboWidth,
      fboHeight,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    this.initialPositionTexture.needsUpdate = true;

    // Select float or half-float precision based on capability negotiation
    const textureType =
      this.capabilities.renderTargetFormat === "rgba16f" ? THREE.HalfFloatType : THREE.FloatType;

    // Create double-buffered FBO render targets
    const fboOptions: THREE.RenderTargetOptions = {
      format: THREE.RGBAFormat,
      type: textureType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      stencilBuffer: false,
      depthBuffer: false,
    };

    this.targetA = new THREE.WebGLRenderTarget(fboWidth, fboHeight, fboOptions);
    this.targetB = new THREE.WebGLRenderTarget(fboWidth, fboHeight, fboOptions);
    this.readTarget = this.targetA;
    this.writeTarget = this.targetB;

    // Fullscreen quad orthographic pass
    this.simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.simScene = new THREE.Scene();

    this.simMaterial = new THREE.ShaderMaterial({
      vertexShader: snowSimulationVertexShader,
      fragmentShader: snowSimulationFragmentShader,
      uniforms: {
        uCurrentPosition: { value: this.initialPositionTexture },
        uOriginalPosition: { value: this.initialPositionTexture },
        uTime: { value: 0.0 },
        uDeltaTime: { value: 0.016 },
        uBounds: { value: new THREE.Vector3(bounds.x, bounds.y, bounds.z) },
        uFallSpeed: { value: fallSpeed },
        uWindStrength: { value: windStrength },
        uTurbulenceStrength: { value: turbulenceStrength },
        uPointerPos: { value: new THREE.Vector2(0, 0) },
        uPointerVel: { value: new THREE.Vector2(0, 0) },
        uPointerActive: { value: 0.0 },
        uPointerRadius: { value: pointerRadius },
        uPointerForce: { value: pointerForce },
      },
      depthTest: false,
      depthWrite: false,
    });

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    this.quadMesh = new THREE.Mesh(quadGeo, this.simMaterial);
    this.simScene.add(this.quadMesh);

    // Initial pass to seed targetA
    const prevRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.targetA);
    this.renderer.render(this.simScene, this.simCamera);
    this.renderer.setRenderTarget(prevRenderTarget);
  }

  step(
    time: number,
    deltaTime: number,
    pointerPos: THREE.Vector2,
    pointerVel: THREE.Vector2,
    pointerActive: boolean,
  ): THREE.Texture {
    this.simMaterial.uniforms.uCurrentPosition.value = this.readTarget.texture;
    this.simMaterial.uniforms.uTime.value = time;
    this.simMaterial.uniforms.uDeltaTime.value = Math.min(deltaTime, 0.05);
    this.simMaterial.uniforms.uPointerPos.value.copy(pointerPos);
    this.simMaterial.uniforms.uPointerVel.value.copy(pointerVel);
    this.simMaterial.uniforms.uPointerActive.value = pointerActive ? 1.0 : 0.0;

    const prevRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.writeTarget);
    this.renderer.render(this.simScene, this.simCamera);
    this.renderer.setRenderTarget(prevRenderTarget);

    const outputTexture = this.writeTarget.texture;
    const temp = this.readTarget;
    this.readTarget = this.writeTarget;
    this.writeTarget = temp;

    return outputTexture;
  }

  getCurrentTexture(): THREE.Texture {
    return this.readTarget.texture;
  }

  dispose(): void {
    this.targetA.dispose();
    this.targetB.dispose();
    this.initialPositionTexture.dispose();
    this.simMaterial.dispose();
    this.quadMesh.geometry.dispose();
  }
}
