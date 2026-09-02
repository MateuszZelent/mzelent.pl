"use client";

import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { PointerTracker } from "../../interaction/pointer-tracker";
import type { QualityProfile } from "../../quality/quality-contract";
import { snowParticleFragmentShader } from "../../shaders/snow/particle.frag";
import { snowParticleVertexShader } from "../../shaders/snow/particle.vert";
import { GpuSnowSimulator } from "../../simulation/gpu-snow-simulator";
import { useSceneStore } from "../../state/scene-store";
import { SNOW_CONFIGS } from "./snow-config";

export interface SnowSceneProps {
  qualityProfile: QualityProfile;
}

export function SnowScene({ qualityProfile }: SnowSceneProps) {
  const { gl } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  const simulatorRef = useRef<GpuSnowSimulator | null>(null);
  const pointerTrackerRef = useRef<PointerTracker | null>(null);
  const pointerPos2D = useRef(new THREE.Vector2(0, 0));
  const pointerVel2D = useRef(new THREE.Vector2(0, 0));

  const updateDiagnostics = useSceneStore((state) => state.updateDiagnostics);
  const setStatus = useSceneStore((state) => state.setStatus);

  const config = SNOW_CONFIGS[qualityProfile.tier];
  const { particleCount, fboWidth, fboHeight } = config;

  // 1. Initialize GPU Snow Simulator and Pointer Tracker
  useEffect(() => {
    if (qualityProfile.tier === "static" || particleCount === 0) {
      return;
    }

    const simulator = new GpuSnowSimulator(gl, qualityProfile.tier);
    simulatorRef.current = simulator;

    const pointerTracker = new PointerTracker();
    pointerTracker.attach();
    pointerTrackerRef.current = pointerTracker;

    setStatus("ready");

    updateDiagnostics({
      points: particleCount,
      triangles: 0,
      drawCalls: 1,
      geometries: 1,
      textures: 2,
    });

    return () => {
      simulator.dispose();
      simulatorRef.current = null;
      pointerTracker.dispose();
      pointerTrackerRef.current = null;
    };
  }, [gl, qualityProfile.tier, particleCount, setStatus, updateDiagnostics]);

  // 2. Build particle UV buffer geometry
  const particleGeometry = useMemo(() => {
    if (particleCount === 0) return new THREE.BufferGeometry();

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    let idx = 0;
    for (let y = 0; y < fboHeight; y++) {
      for (let x = 0; x < fboWidth; x++) {
        // x and y in position buffer hold the normalized FBO UV coordinate
        positions[idx * 3 + 0] = (x + 0.5) / fboWidth;
        positions[idx * 3 + 1] = (y + 0.5) / fboHeight;
        positions[idx * 3 + 2] = 0;
        idx++;
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, [particleCount, fboWidth, fboHeight]);

  // 3. Build snow particle shader material
  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: snowParticleVertexShader,
      fragmentShader: snowParticleFragmentShader,
      uniforms: {
        uPositionTexture: { value: null },
        uBaseSize: { value: config.pointSize },
        uPixelRatio: { value: qualityProfile.dprCap },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
  }, [config.pointSize, qualityProfile.dprCap]);

  // Clean up geometry and material
  useEffect(() => {
    return () => {
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [particleGeometry, particleMaterial]);

  // 4. Hot per-frame simulation and render step
  useFrame((state, delta) => {
    const simulator = simulatorRef.current;
    const pointerTracker = pointerTrackerRef.current;
    const pointsMesh = pointsRef.current;
    if (!simulator || !pointerTracker || !pointsMesh) return;

    const { current, velocity } = pointerTracker.update(delta);
    pointerPos2D.current.set(current.x, current.y);
    pointerVel2D.current.set(velocity.x, velocity.y);

    const isPointerActive = Math.abs(current.x) > 0.001 || Math.abs(current.y) > 0.001;

    const simTexture = simulator.step(
      state.clock.getElapsedTime(),
      delta,
      pointerPos2D.current,
      pointerVel2D.current,
      isPointerActive,
    );

    const mat = pointsMesh.material as THREE.ShaderMaterial;
    if (mat?.uniforms?.uPositionTexture) {
      mat.uniforms.uPositionTexture.value = simTexture;
    }
  });

  if (qualityProfile.tier === "static" || particleCount === 0) {
    return null;
  }

  return (
    <points ref={pointsRef} geometry={particleGeometry} material={particleMaterial} frustumCulled={false} />
  );
}
