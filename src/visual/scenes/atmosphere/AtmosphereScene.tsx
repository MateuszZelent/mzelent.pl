"use client";

import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { PointerTracker } from "../../interaction/pointer-tracker";
import type { QualityProfile } from "../../quality/quality-contract";
import { particleFragmentShader } from "../../shaders/atmosphere/particle.frag";
import { particleVertexShader } from "../../shaders/atmosphere/particle.vert";
import { GpuParticleSimulator } from "../../simulation/gpu-particle-simulator";
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

  const updateDiagnostics = useSceneStore((state) => state.updateDiagnostics);
  const recordFirstFrame = useSceneStore((state) => state.recordFirstFrame);

  const tierConfig = PARTICLE_TIER_CONFIGS[qualityProfile.tier];
  const { count, textureWidth, textureHeight, pointSize } = tierConfig;

  // 1. Initialize GPU Particle Simulator
  useEffect(() => {
    hasCommittedFirstFrame.current = false;

    if (qualityProfile.tier === "static" || count === 0) {
      return;
    }

    const simulator = new GpuParticleSimulator(gl, qualityProfile.tier);
    simulatorRef.current = simulator;

    const pointerTracker = new PointerTracker();
    pointerTracker.attach();
    pointerTrackerRef.current = pointerTracker;

    updateDiagnostics({
      points: count,
      triangles: 0,
      drawCalls: 1,
      geometries: 1,
      textures: 4, // 2 position targets + 2 velocity targets
    });

    return () => {
      simulator.dispose();
      simulatorRef.current = null;
      pointerTracker.dispose();
      pointerTrackerRef.current = null;
    };
  }, [gl, qualityProfile.tier, count, updateDiagnostics]);

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
    // Pause simulation computation when document is hidden (hidden tab)
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }

    const simulator = simulatorRef.current;
    const pointerTracker = pointerTrackerRef.current;
    const pointsMesh = pointsRef.current;
    if (!simulator || !pointerTracker || !pointsMesh) return;

    // Clamp delta to prevent sudden particle jumps upon tab focus restore
    const safeDelta = Math.min(delta, 0.05);

    const { current, velocity } = pointerTracker.update(safeDelta);
    const simTexture = simulator.step(state.clock.getElapsedTime(), safeDelta, current, velocity);

    const mat = pointsMesh.material as THREE.ShaderMaterial;
    if (mat?.uniforms?.uPositions) {
      mat.uniforms.uPositions.value = simTexture;
    }

    // Commit readiness strictly after the first rendered frame
    if (!hasCommittedFirstFrame.current) {
      hasCommittedFirstFrame.current = true;
      recordFirstFrame();
    }
  });

  if (qualityProfile.tier === "static" || count === 0) {
    return null;
  }

  return (
    <points ref={pointsRef} geometry={particleGeometry} material={particleMaterial} frustumCulled={false} />
  );
}
