import * as THREE from "three";

import type { QualityTier } from "../quality/quality-contract";
import {
  ATMOSPHERE_CONFIG,
  PARTICLE_TIER_CONFIGS,
  type ParticleTierConfig,
} from "../scenes/atmosphere/atmosphere-config";
import { simulationFragmentShader } from "../shaders/atmosphere/simulation.frag";
import { simulationVertexShader } from "../shaders/atmosphere/simulation.vert";

export class GpuParticleSimulator {
  readonly config: ParticleTierConfig;
  private readonly renderer: THREE.WebGLRenderer;
  private targetA: THREE.WebGLRenderTarget;
  private targetB: THREE.WebGLRenderTarget;
  private readTarget: THREE.WebGLRenderTarget;
  private writeTarget: THREE.WebGLRenderTarget;

  private readonly initialPositionTexture: THREE.DataTexture;
  private readonly initialVelocityTexture: THREE.DataTexture;

  private readonly simScene: THREE.Scene;
  private readonly simCamera: THREE.OrthographicCamera;
  private readonly simMaterial: THREE.ShaderMaterial;
  private readonly quadMesh: THREE.Mesh;

  constructor(renderer: THREE.WebGLRenderer, tier: QualityTier) {
    this.renderer = renderer;
    this.config = PARTICLE_TIER_CONFIGS[tier];

    const { textureWidth, textureHeight } = this.config;

    // Allocate initial deterministic particle distribution data
    const particleCount = textureWidth * textureHeight;
    const initialPositions = new Float32Array(particleCount * 4);
    const initialVelocities = new Float32Array(particleCount * 4);

    const { bounds } = ATMOSPHERE_CONFIG;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 4;
      // Stratified pseudorandom distribution within elliptical bounds
      const u = ((i * 137.5) % 360) * (Math.PI / 180);
      const radiusX = (Math.sin(i * 0.1) * 0.5 + 0.5) * bounds.x;
      const radiusY = (Math.cos(i * 0.17) * 0.5 + 0.5) * bounds.y;
      const depthZ = Math.sin(i * 0.23) * 0.5 * bounds.z;

      initialPositions[idx + 0] = Math.cos(u) * radiusX;
      initialPositions[idx + 1] = Math.sin(u) * radiusY;
      initialPositions[idx + 2] = depthZ;
      initialPositions[idx + 3] = 0.2; // Initial energy/glow value

      initialVelocities[idx + 0] = 0.0;
      initialVelocities[idx + 1] = 0.0;
      initialVelocities[idx + 2] = 0.0;
      initialVelocities[idx + 3] = 0.0;
    }

    this.initialPositionTexture = new THREE.DataTexture(
      initialPositions,
      textureWidth,
      textureHeight,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    this.initialPositionTexture.needsUpdate = true;

    this.initialVelocityTexture = new THREE.DataTexture(
      initialVelocities,
      textureWidth,
      textureHeight,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    this.initialVelocityTexture.needsUpdate = true;

    // Create double-buffered FBO render targets
    const fboOptions: THREE.RenderTargetOptions = {
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      stencilBuffer: false,
      depthBuffer: false,
    };

    this.targetA = new THREE.WebGLRenderTarget(textureWidth, textureHeight, fboOptions);
    this.targetB = new THREE.WebGLRenderTarget(textureWidth, textureHeight, fboOptions);
    this.readTarget = this.targetA;
    this.writeTarget = this.targetB;

    // Fullscreen quad orthographic pass
    this.simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.simScene = new THREE.Scene();

    this.simMaterial = new THREE.ShaderMaterial({
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
      uniforms: {
        uPositions: { value: this.initialPositionTexture },
        uVelocities: { value: this.initialVelocityTexture },
        uInitialPositions: { value: this.initialPositionTexture },
        uTime: { value: 0.0 },
        uDelta: { value: 0.016 },
        uPointer: { value: new THREE.Vector3(0, 0, 0) },
        uPointerVelocity: { value: new THREE.Vector2(0, 0) },
        uBounds: { value: new THREE.Vector3(bounds.x, bounds.y, bounds.z) },
        uSpeed: { value: ATMOSPHERE_CONFIG.simulation.speed },
        uCurlScale: { value: ATMOSPHERE_CONFIG.simulation.curlScale },
        uDamping: { value: ATMOSPHERE_CONFIG.simulation.damping },
        uReturnStrength: { value: ATMOSPHERE_CONFIG.simulation.returnStrength },
        uPointerRadius: { value: ATMOSPHERE_CONFIG.simulation.pointerRadius },
        uPointerStrength: { value: ATMOSPHERE_CONFIG.simulation.pointerStrength },
      },
      depthTest: false,
      depthWrite: false,
    });

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    this.quadMesh = new THREE.Mesh(quadGeo, this.simMaterial);
    this.simScene.add(this.quadMesh);

    // Initial render pass to seed targetA
    const prevRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.targetA);
    this.renderer.render(this.simScene, this.simCamera);
    this.renderer.setRenderTarget(prevRenderTarget);
  }

  step(time: number, delta: number, pointer: THREE.Vector3, pointerVelocity: THREE.Vector2): THREE.Texture {
    // Update simulation uniforms
    this.simMaterial.uniforms.uPositions.value = this.readTarget.texture;
    this.simMaterial.uniforms.uTime.value = time;
    this.simMaterial.uniforms.uDelta.value = Math.min(delta, 0.05);
    this.simMaterial.uniforms.uPointer.value.copy(pointer);
    this.simMaterial.uniforms.uPointerVelocity.value.copy(pointerVelocity);

    // Perform FBO compute step
    const prevRenderTarget = this.renderer.getRenderTarget();
    this.renderer.setRenderTarget(this.writeTarget);
    this.renderer.render(this.simScene, this.simCamera);
    this.renderer.setRenderTarget(prevRenderTarget);

    // Swap buffers
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
    this.initialVelocityTexture.dispose();
    this.simMaterial.dispose();
    this.quadMesh.geometry.dispose();
  }
}
