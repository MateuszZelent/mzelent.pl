import * as THREE from "three";

import type { QualityTier } from "../quality/quality-contract";
import {
  ATMOSPHERE_CONFIG,
  PARTICLE_TIER_CONFIGS,
  type ParticleTierConfig,
} from "../scenes/atmosphere/atmosphere-config";
import { copyFragmentShader } from "../shaders/atmosphere/copy.frag";
import { simulationFragmentShader } from "../shaders/atmosphere/simulation.frag";
import { simulationVertexShader } from "../shaders/atmosphere/simulation.vert";
import { velocityFragmentShader } from "../shaders/atmosphere/velocity.frag";
import { negotiateParticleCapabilities, type ParticleRuntimeCapabilities } from "./particle-capabilities";

export class GpuParticleSimulator {
  readonly config: ParticleTierConfig;
  readonly capabilities: ParticleRuntimeCapabilities;
  private readonly renderer: THREE.WebGLRenderer;

  // Double-buffered render targets for Position (xyz = position, w = energy)
  private targetPosA: THREE.WebGLRenderTarget;
  private targetPosB: THREE.WebGLRenderTarget;
  private readTargetPos: THREE.WebGLRenderTarget;
  private writeTargetPos: THREE.WebGLRenderTarget;

  // Double-buffered render targets for Velocity (xyz = velocity, w = age)
  private targetVelA: THREE.WebGLRenderTarget;
  private targetVelB: THREE.WebGLRenderTarget;
  private readTargetVel: THREE.WebGLRenderTarget;
  private writeTargetVel: THREE.WebGLRenderTarget;

  private readonly initialPositionTexture: THREE.DataTexture;
  private readonly initialVelocityTexture: THREE.DataTexture;

  private readonly simSceneVel: THREE.Scene;
  private readonly simScenePos: THREE.Scene;
  private readonly simCamera: THREE.OrthographicCamera;
  private readonly simMaterialVel: THREE.ShaderMaterial;
  private readonly simMaterialPos: THREE.ShaderMaterial;
  private readonly quadMeshVel: THREE.Mesh;
  private readonly quadMeshPos: THREE.Mesh;

  constructor(
    renderer: THREE.WebGLRenderer,
    tier: QualityTier | ParticleTierConfig,
    capabilities?: ParticleRuntimeCapabilities,
  ) {
    this.renderer = renderer;
    this.config = typeof tier === "string" ? PARTICLE_TIER_CONFIGS[tier] : tier;
    this.capabilities = capabilities ?? negotiateParticleCapabilities(renderer);

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
      initialVelocities[idx + 3] = 0.0; // Initial age
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

    // Select float or half-float precision based on capability negotiation
    const textureType =
      this.capabilities.renderTargetFormat === "rgba16f" ? THREE.HalfFloatType : THREE.FloatType;

    const fboOptions: THREE.RenderTargetOptions = {
      format: THREE.RGBAFormat,
      type: textureType,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      stencilBuffer: false,
      depthBuffer: false,
    };

    this.targetPosA = new THREE.WebGLRenderTarget(textureWidth, textureHeight, fboOptions);
    this.targetPosB = new THREE.WebGLRenderTarget(textureWidth, textureHeight, fboOptions);
    this.readTargetPos = this.targetPosA;
    this.writeTargetPos = this.targetPosB;

    this.targetVelA = new THREE.WebGLRenderTarget(textureWidth, textureHeight, fboOptions);
    this.targetVelB = new THREE.WebGLRenderTarget(textureWidth, textureHeight, fboOptions);
    this.readTargetVel = this.targetVelA;
    this.writeTargetVel = this.targetVelB;

    // Fullscreen quad orthographic passes
    this.simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // 1. Velocity simulation pass setup
    this.simMaterialVel = new THREE.ShaderMaterial({
      vertexShader: simulationVertexShader,
      fragmentShader: velocityFragmentShader,
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
        uDragPerSecond: { value: ATMOSPHERE_CONFIG.simulation.dragPerSecond },
        uBoundaryRestitution: { value: ATMOSPHERE_CONFIG.simulation.boundaryRestitution },
        uReturnStrength: { value: ATMOSPHERE_CONFIG.simulation.returnStrength },
        uPointerRadius: { value: ATMOSPHERE_CONFIG.simulation.pointerRadius },
        uPointerStrength: { value: ATMOSPHERE_CONFIG.simulation.pointerStrength },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.simSceneVel = new THREE.Scene();
    this.quadMeshVel = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.simMaterialVel);
    this.simSceneVel.add(this.quadMeshVel);

    // 2. Position simulation pass setup
    this.simMaterialPos = new THREE.ShaderMaterial({
      vertexShader: simulationVertexShader,
      fragmentShader: simulationFragmentShader,
      uniforms: {
        uPositions: { value: this.initialPositionTexture },
        uVelocities: { value: this.initialVelocityTexture },
        uTime: { value: 0.0 },
        uDelta: { value: 0.016 },
        uPointer: { value: new THREE.Vector3(0, 0, 0) },
        uBounds: { value: new THREE.Vector3(bounds.x, bounds.y, bounds.z) },
        uPointerRadius: { value: ATMOSPHERE_CONFIG.simulation.pointerRadius },
      },
      depthTest: false,
      depthWrite: false,
    });

    this.simScenePos = new THREE.Scene();
    this.quadMeshPos = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.simMaterialPos);
    this.simScenePos.add(this.quadMeshPos);

    // Seed initial double-buffered render targets deterministically via copy pass
    const copyMaterial = new THREE.ShaderMaterial({
      vertexShader: simulationVertexShader,
      fragmentShader: copyFragmentShader,
      uniforms: {
        uSource: { value: null },
      },
      depthTest: false,
      depthWrite: false,
    });
    const copyScene = new THREE.Scene();
    const copyQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), copyMaterial);
    copyScene.add(copyQuad);

    const prevRenderTarget = this.renderer.getRenderTarget();

    // 1. Seed initial zero velocity state to targetVelA
    copyMaterial.uniforms.uSource.value = this.initialVelocityTexture;
    this.renderer.setRenderTarget(this.targetVelA);
    this.renderer.render(copyScene, this.simCamera);

    // 2. Seed initial position distribution to targetPosA
    copyMaterial.uniforms.uSource.value = this.initialPositionTexture;
    this.renderer.setRenderTarget(this.targetPosA);
    this.renderer.render(copyScene, this.simCamera);

    this.renderer.setRenderTarget(prevRenderTarget);

    // Clean up temporary seed pass resources and initial velocity texture
    copyQuad.geometry.dispose();
    copyMaterial.dispose();
    this.initialVelocityTexture.dispose();
  }

  step(time: number, delta: number, pointer: THREE.Vector3, pointerVelocity: THREE.Vector2): THREE.Texture {
    if (delta <= 0.0) {
      return this.getCurrentTexture();
    }
    const clampedDelta = Math.min(delta, 0.05);

    // === Pass 1: Compute updated velocity ===
    this.simMaterialVel.uniforms.uPositions.value = this.readTargetPos.texture;
    this.simMaterialVel.uniforms.uVelocities.value = this.readTargetVel.texture;
    this.simMaterialVel.uniforms.uTime.value = time;
    this.simMaterialVel.uniforms.uDelta.value = clampedDelta;
    this.simMaterialVel.uniforms.uPointer.value.copy(pointer);
    this.simMaterialVel.uniforms.uPointerVelocity.value.copy(pointerVelocity);

    const prevRenderTarget = this.renderer.getRenderTarget();

    this.renderer.setRenderTarget(this.writeTargetVel);
    this.renderer.render(this.simSceneVel, this.simCamera);

    // === Pass 2: Compute updated position using new velocity ===
    this.simMaterialPos.uniforms.uPositions.value = this.readTargetPos.texture;
    this.simMaterialPos.uniforms.uVelocities.value = this.writeTargetVel.texture;
    this.simMaterialPos.uniforms.uTime.value = time;
    this.simMaterialPos.uniforms.uDelta.value = clampedDelta;
    this.simMaterialPos.uniforms.uPointer.value.copy(pointer);

    this.renderer.setRenderTarget(this.writeTargetPos);
    this.renderer.render(this.simScenePos, this.simCamera);

    this.renderer.setRenderTarget(prevRenderTarget);

    // === Buffer Swaps (Ping-Pong) ===
    const outputPosTexture = this.writeTargetPos.texture;

    const tempPos = this.readTargetPos;
    this.readTargetPos = this.writeTargetPos;
    this.writeTargetPos = tempPos;

    const tempVel = this.readTargetVel;
    this.readTargetVel = this.writeTargetVel;
    this.writeTargetVel = tempVel;

    return outputPosTexture;
  }

  getCurrentTexture(): THREE.Texture {
    return this.readTargetPos.texture;
  }

  getCurrentVelocityTexture(): THREE.Texture {
    return this.readTargetVel.texture;
  }

  getReadTargetPos(): THREE.WebGLRenderTarget {
    return this.readTargetPos;
  }

  getReadTargetVel(): THREE.WebGLRenderTarget {
    return this.readTargetVel;
  }

  dispose(): void {
    this.targetPosA.dispose();
    this.targetPosB.dispose();
    this.targetVelA.dispose();
    this.targetVelB.dispose();
    this.initialPositionTexture.dispose();
    this.simMaterialVel.dispose();
    this.simMaterialPos.dispose();
    this.quadMeshVel.geometry.dispose();
    this.quadMeshPos.geometry.dispose();
  }
}
