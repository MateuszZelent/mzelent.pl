"use client";

import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { PointerTracker } from "../../interaction/pointer-tracker";
import type { QualityProfile } from "../../quality/quality-contract";
import { GpuParticleSimulator } from "../../simulation/gpu-particle-simulator";
import { negotiateParticleCapabilities } from "../../simulation/particle-capabilities";
import { createParticleTestBridge, isTestBridgeEnabled } from "../../simulation/particle-test-bridge";
import { particleFragmentShader } from "../../shaders/atmosphere/particle.frag";
import { particleVertexShader } from "../../shaders/atmosphere/particle.vert";
import { useSceneStore } from "../../state/scene-store";
import { ATMOSPHERE_CONFIG, PARTICLE_TIER_CONFIGS } from "./atmosphere-config";

export interface AtmosphereSceneProps {
  qualityProfile: QualityProfile;
}

export function AtmosphereScene({ qualityProfile }: AtmosphereSceneProps) {
  const { gl } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const simulatorRef = useRef<GpuParticleSimulator | null>(null);
  const pointerTrackerRef = useRef<PointerTracker | null>(null);
  const hasCommittedFirstFrame = useRef(false);
  const wasHiddenRef = useRef(false);

  const updateDiagnostics = useSceneStore((state) => state.updateDiagnostics);
  const setStatus = useSceneStore((state) => state.setStatus);
  const setStaticReason = useSceneStore((state) => state.setStaticReason);
  const setPosterVisible = useSceneStore((state) => state.setPosterVisible);
  const recordFirstFrame = useSceneStore((state) => state.recordFirstFrame);
  const contextGeneration = useSceneStore((state) => state.contextGeneration);

  const tierConfig = PARTICLE_TIER_CONFIGS[qualityProfile.tier];
  const { count, textureWidth, textureHeight, pointSize } = tierConfig;

  // 1. Initialize GPU Particle Simulator
  useEffect(() => {
    hasCommittedFirstFrame.current = false;

    if (qualityProfile.tier === "static" || count === 0) {
      return;
    }

    const capabilities = negotiateParticleCapabilities(gl);
    if (capabilities.renderTargetFormat === "unsupported" || !capabilities.framebufferComplete) {
      setStatus("static");
      setStaticReason(capabilities.staticReason ?? "unsupported-render-target");
      setPosterVisible(true);
      updateDiagnostics({
        webgl2Supported: capabilities.webgl2,
        renderTargetFormat: "unsupported",
        fragmentHighPrecision: capabilities.fragmentHighPrecision,
        framebufferComplete: false,
        staticReason: capabilities.staticReason ?? "unsupported-render-target",
      });
      return;
    }

    const simulator = new GpuParticleSimulator(gl, qualityProfile.tier, capabilities);
    simulatorRef.current = simulator;

    const pointerTracker = new PointerTracker();
    pointerTracker.attach();
    pointerTrackerRef.current = pointerTracker;

    const bytesPerComponent = capabilities.renderTargetFormat === "rgba16f" ? 2 : 4;
    const targetBytes = 4 * textureWidth * textureHeight * 4 * bytesPerComponent;
    const initialTextureBytes = textureWidth * textureHeight * 16;
    const geometryBytes = count * 24;
    const estimatedGpuBytes = targetBytes + initialTextureBytes + geometryBytes;

    updateDiagnostics({
      points: count,
      triangles: 0,
      drawCalls: 3,
      visibleDrawCalls: 1,
      simulationPassesPerFrame: 2,
      totalDrawCallsPerFrame: 3,
      geometries: 1,
      textures: 5,
      renderTargetCount: 4,
      renderTargetFormat: capabilities.renderTargetFormat,
      webgl2Supported: capabilities.webgl2,
      fragmentHighPrecision: capabilities.fragmentHighPrecision,
      framebufferComplete: capabilities.framebufferComplete,
      estimatedGpuBytes,
      finiteState: true,
      staticReason: null,
    });

    if (isTestBridgeEnabled() && typeof window !== "undefined") {
      const bridge = createParticleTestBridge(gl, simulator);
      if (bridge) {
        (window as any).__PARTICLE_TEST_BRIDGE__ = bridge;
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as any).__PARTICLE_TEST_BRIDGE__;
      }
      simulator.dispose();
      simulatorRef.current = null;
      pointerTracker.dispose();
      pointerTrackerRef.current = null;
    };
  }, [
    gl,
    qualityProfile.tier,
    count,
    textureWidth,
    textureHeight,
    contextGeneration,
    setStatus,
    setStaticReason,
    setPosterVisible,
    updateDiagnostics,
  ]);

  // 2. Build deterministic particle UV geometry
  const particleGeometry = useMemo(() => {
    if (count === 0) return new THREE.BufferGeometry();

    const geometry = new THREE.BufferGeometry();
    const uvs = new Float32Array(count * 2);
    const randoms = new Float32Array(count);
    const dummyPositions = new Float32Array(count * 3);

    let idx = 0;
    for (let y = 0; y < textureHeight; y++) {
      for (let x = 0; x < textureWidth; x++) {
        uvs[idx * 2 + 0] = (x + 0.5) / textureWidth;
        uvs[idx * 2 + 1] = (y + 0.5) / textureHeight;
        randoms[idx] = Math.sin(idx * 999.0) * 0.5 + 0.5;
        dummyPositions[idx * 3 + 0] = 0;
        dummyPositions[idx * 3 + 1] = 0;
        dummyPositions[idx * 3 + 2] = 0;
        idx++;
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(dummyPositions, 3));
    geometry.setAttribute("aParticleUv", new THREE.BufferAttribute(uvs, 2));
    geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));

    return geometry;
  }, [count, textureWidth, textureHeight]);

  // 3. Build particle points material
  const particleMaterial = useMemo(() => {
    const colorCyan = new THREE.Color(ATMOSPHERE_CONFIG.colors.cyan).convertSRGBToLinear();
    const colorViolet = new THREE.Color(ATMOSPHERE_CONFIG.colors.violet).convertSRGBToLinear();
    const colorHighlight = new THREE.Color(ATMOSPHERE_CONFIG.colors.highlight).convertSRGBToLinear();

    return new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uPositions: { value: null },
        uPointSize: { value: pointSize },
        uDpr: { value: qualityProfile.dprCap },
        uColorCyan: { value: new THREE.Vector3(colorCyan.r, colorCyan.g, colorCyan.b) },
        uColorViolet: { value: new THREE.Vector3(colorViolet.r, colorViolet.g, colorViolet.b) },
        uColorHighlight: { value: new THREE.Vector3(colorHighlight.r, colorHighlight.g, colorHighlight.b) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [pointSize, qualityProfile.dprCap]);

  // Clean up geometry and material when dependencies change
  useEffect(() => {
    return () => {
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [particleGeometry, particleMaterial]);

  // 4. Hot per-frame simulation and render step
  useFrame((state, delta) => {
    if (typeof document !== "undefined" && document.hidden) {
      wasHiddenRef.current = true;
      return;
    }

    const simulator = simulatorRef.current;
    const pointerTracker = pointerTrackerRef.current;
    const pointsMesh = pointsRef.current;
    if (!simulator || !pointerTracker || !pointsMesh) return;

    let safeDelta = delta;
    if (wasHiddenRef.current) {
      wasHiddenRef.current = false;
      safeDelta = 0.016;
    } else {
      safeDelta = Math.min(Math.max(delta, 0.0001), 0.064);
    }

    const { current, velocity } = pointerTracker.update(safeDelta);
    const simTexture = simulator.step(state.clock.getElapsedTime(), safeDelta, current, velocity);

    const mat = pointsMesh.material as THREE.ShaderMaterial;
    if (mat?.uniforms?.uPositions) {
      mat.uniforms.uPositions.value = simTexture;
    }
  });

  if (qualityProfile.tier === "static" || count === 0) {
    return null;
  }

  return (
    <points
      ref={pointsRef}
      geometry={particleGeometry}
      material={particleMaterial}
      frustumCulled={false}
      onAfterRender={() => {
        if (!hasCommittedFirstFrame.current && simulatorRef.current) {
          hasCommittedFirstFrame.current = true;
          recordFirstFrame();
        }
      }}
    />
  );
}
