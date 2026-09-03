"use client";

import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import type { QualityProfile } from "../../quality/quality-contract";
import { spintronicsFragmentShader } from "../../shaders/spintronics/spintronics.frag";
import { spintronicsVertexShader } from "../../shaders/spintronics/spintronics.vert";
import { useSceneStore } from "../../state/scene-store";
import { SPINTRONICS_TIER_CONFIGS } from "./spintronics-config";

interface SpintronicsSceneProps {
  readonly qualityProfile: QualityProfile;
}

const MODE_INDEX_MAP: Record<string, number> = {
  "skyrmion-neel": 0,
  "skyrmion-bloch": 1,
  vortex: 2,
  "spin-wave": 3,
  "caustic-lens": 4,
};

const COLORMAP_INDEX_MAP: Record<string, number> = {
  chiral: 0,
  topological: 1,
  magnetization: 2,
};

export function SpintronicsScene({ qualityProfile }: SpintronicsSceneProps) {
  const tierConfig = SPINTRONICS_TIER_CONFIGS[qualityProfile.tier];
  const spintronicsPhysics = useSceneStore((state) => state.spintronicsPhysics);
  const reducedMotion = useSceneStore((state) => state.reducedMotion);
  const setStatus = useSceneStore((state) => state.setStatus);
  const recordFirstFrame = useSceneStore((state) => state.recordFirstFrame);
  const updateDiagnostics = useSceneStore((state) => state.updateDiagnostics);

  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const instancedArrowsRef = useRef<THREE.InstancedMesh>(null);

  // Rotation damping refs
  const targetRotation = useRef({ x: -0.65, y: 0.35 });
  const currentRotation = useRef({ x: -0.65, y: 0.35 });
  const isDragging = useRef(false);
  const previousPointerPos = useRef({ x: 0, y: 0 });

  // Uniforms definition
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uMode: { value: 0 },
      uColorMap: { value: 0 },
      uMagneticField: { value: 45.0 },
      uDmiStrength: { value: 1.8 },
      uRfFrequency: { value: 9.2 },
      uDampingAlpha: { value: 0.008 },
    }),
    [],
  );

  // Surface geometry
  const geometry = useMemo(() => {
    const res = tierConfig.gridResolution;
    return new THREE.PlaneGeometry(4.6, 4.6, res, res);
  }, [tierConfig.gridResolution]);

  // Vector arrows geometry and instance matrix calculations
  const arrowCount = useMemo(() => {
    if (!tierConfig.enableVectorArrows || !spintronicsPhysics.showVectorField) return 0;
    const density = tierConfig.vectorDensity;
    return density * density;
  }, [tierConfig.enableVectorArrows, tierConfig.vectorDensity, spintronicsPhysics.showVectorField]);

  const arrowGeometry = useMemo(() => {
    // Elegant micro-arrow: thin cylinder + tiny cone
    const cone = new THREE.ConeGeometry(0.024, 0.09, 8);
    cone.translate(0, 0.045, 0);
    return cone;
  }, []);

  const arrowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color("#57e6dd"),
      wireframe: false,
    });
  }, []);

  // Update uniforms when store physics parameters change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uMode.value = MODE_INDEX_MAP[spintronicsPhysics.mode] ?? 0;
      materialRef.current.uniforms.uColorMap.value = COLORMAP_INDEX_MAP[spintronicsPhysics.colorMap] ?? 0;
      materialRef.current.uniforms.uMagneticField.value = spintronicsPhysics.magneticField;
      materialRef.current.uniforms.uDmiStrength.value = spintronicsPhysics.dmiStrength;
      materialRef.current.uniforms.uRfFrequency.value = spintronicsPhysics.rfFrequency;
      materialRef.current.uniforms.uDampingAlpha.value = spintronicsPhysics.dampingAlpha;
    }
  }, [spintronicsPhysics]);

  // Pointer interaction: drag to rotate 3D view
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      previousPointerPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const deltaX = e.clientX - previousPointerPos.current.x;
      const deltaY = e.clientY - previousPointerPos.current.y;
      previousPointerPos.current = { x: e.clientX, y: e.clientY };

      targetRotation.current.y += deltaX * 0.006;
      targetRotation.current.x += deltaY * 0.006;

      // Clamp vertical tilt
      targetRotation.current.x = Math.max(-1.3, Math.min(0.2, targetRotation.current.x));
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  // Mark scene ready
  useEffect(() => {
    setStatus("ready");
    recordFirstFrame();

    const triCount = geometry.index ? geometry.index.count / 3 : 0;
    updateDiagnostics({
      triangles: triCount,
      drawCalls: 2,
      points: 0,
      activeSceneId: "spintronics",
    });

    return () => {
      geometry.dispose();
      arrowGeometry.dispose();
      arrowMaterial.dispose();
    };
  }, [setStatus, recordFirstFrame, updateDiagnostics, geometry, arrowGeometry, arrowMaterial]);

  // Temp objects for instance matrix calculation (reused to prevent GC inside frame loop)
  const dummyMatrix = useMemo(() => new THREE.Matrix4(), []);
  const dummyPos = useMemo(() => new THREE.Vector3(), []);
  const dummyQuat = useMemo(() => new THREE.Quaternion(), []);
  const dummyScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const upVec = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const dirVec = useMemo(() => new THREE.Vector3(), []);

  // Hot render loop
  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = reducedMotion ? 0 : elapsed;
    }

    // Smooth rotation damping
    currentRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * 0.08;
    currentRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * 0.08;

    if (groupRef.current) {
      groupRef.current.rotation.x = currentRotation.current.x;
      groupRef.current.rotation.z = currentRotation.current.y;
    }

    // Update vector arrow instances if enabled
    const mesh = instancedArrowsRef.current;
    if (mesh && arrowCount > 0) {
      const density = tierConfig.vectorDensity;
      const step = 4.2 / density;
      const start = -2.1 + step * 0.5;

      const mode = MODE_INDEX_MAP[spintronicsPhysics.mode] ?? 0;
      const bField = spintronicsPhysics.magneticField;
      const dmi = spintronicsPhysics.dmiStrength;

      let idx = 0;
      for (let ix = 0; ix < density; ix++) {
        for (let iy = 0; iy < density; iy++) {
          const x = start + ix * step;
          const y = start + iy * step;
          const r = Math.sqrt(x * x + y * y);

          let mx = 0;
          let my = 0;
          let mz = 1;
          let zElev = 0;

          if (mode === 0 || mode === 1) {
            // Skyrmion profile
            const baseR = Math.max(0.25, Math.min(1.6, 0.85 + (dmi - 1.8) * 0.22 - bField * 0.0035));
            const wallWidth = Math.max(0.18, 0.38 - dmi * 0.04);
            const normDist = Math.max(0, Math.min(1, (r - (baseR - wallWidth)) / (2 * wallWidth)));
            const theta = Math.PI * (1.0 - normDist * normDist * (3 - 2 * normDist));
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            const phi = Math.atan2(y, x);

            zElev = cosTheta * 0.48;
            if (mode === 0) {
              // Neel (hedgehog)
              mx = sinTheta * Math.cos(phi);
              my = sinTheta * Math.sin(phi);
            } else {
              // Bloch (vortex)
              mx = -sinTheta * Math.sin(phi);
              my = sinTheta * Math.cos(phi);
            }
            mz = cosTheta;
          } else if (mode === 2) {
            // Vortex
            const coreR = 0.24;
            const coreProfile = Math.exp(-Math.pow(r / coreR, 2));
            zElev = coreProfile * 0.65;
            const phi = Math.atan2(y, x);
            const inPlane = Math.sqrt(Math.max(0, 1 - coreProfile * coreProfile));
            mx = -Math.sin(phi) * inPlane;
            my = Math.cos(phi) * inPlane;
            mz = coreProfile;
          } else {
            // Spin Wave
            const k = Math.PI * (spintronicsPhysics.rfFrequency / 4.8);
            const wavePhase = k * (x + 2.2) - elapsed * (spintronicsPhysics.rfFrequency * 0.6);
            zElev = Math.sin(wavePhase) * 0.3;
            mx = 0;
            my = zElev;
            mz = Math.sqrt(Math.max(0, 1 - my * my));
          }

          dummyPos.set(x, y, zElev + 0.05);
          dirVec.set(mx, my, mz).normalize();
          dummyQuat.setFromUnitVectors(upVec, dirVec);
          dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);

          mesh.setMatrixAt(idx, dummyMatrix);
          idx++;
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* 3D Spintronic Nanomembrane Mesh */}
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={spintronicsVertexShader}
          fragmentShader={spintronicsFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Instanced Magnetization Vector Arrows */}
      {arrowCount > 0 && (
        <instancedMesh ref={instancedArrowsRef} args={[arrowGeometry, arrowMaterial, arrowCount]} />
      )}

      {/* Ambient Lighting motivated by spintronic cavity */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#ffffff" />
      <pointLight position={[0, 0, 2]} intensity={2.0} color="#846cff" distance={6} />
    </group>
  );
}
