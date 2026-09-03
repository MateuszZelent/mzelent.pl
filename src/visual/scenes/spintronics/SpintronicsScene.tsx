"use client";

import { useFrame } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

import type { QualityProfile } from "../../quality/quality-contract";
import { spintronicsFragmentShader } from "../../shaders/spintronics/spintronics.frag";
import { spintronicsVertexShader } from "../../shaders/spintronics/spintronics.vert";
import { useSceneStore } from "../../state/scene-store";
import {
  generatePolarArrowPositions,
  hsl2rgb,
  SPINTRONICS_TIER_CONFIGS,
  zelentPublicationRgb,
} from "./spintronics-config";

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
  "zelent-prb": 0,
  "hsl-cone": 1,
  racetrack: 2,
  chiral: 3,
  topological: 4,
  magnetization: 5,
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

  // Rotation damping refs (oblique scientific perspective)
  const targetRotation = useRef({ x: -0.55, y: 0.25 });
  const currentRotation = useRef({ x: -0.55, y: 0.25 });
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

  // Surface geometry: circular nanomembrane plane
  const geometry = useMemo(() => {
    const res = tierConfig.gridResolution;
    return new THREE.PlaneGeometry(4.6, 4.6, res, res);
  }, [tierConfig.gridResolution]);

  // Polar coordinates for concentric rings
  const ringCount = useMemo(() => {
    if (qualityProfile.tier === "high") return 9;
    if (qualityProfile.tier === "medium") return 8;
    return 6;
  }, [qualityProfile.tier]);

  const polarCoords = useMemo(() => {
    return generatePolarArrowPositions(ringCount, 2.15);
  }, [ringCount]);

  // Combined 3D Arrow Geometry: Pivot Sphere + Shaft Cylinder + Head Cone
  const arrowGeometry = useMemo(() => {
    // 1. Pivot Anchor Bead at nanodot surface (0, 0, 0)
    const beadRadius = 0.026;
    const bead = new THREE.SphereGeometry(beadRadius, 10, 8);

    // 2. Sleek Cylindrical Shaft
    const shaftRadius = 0.0135;
    const shaftHeight = 0.18;
    const shaft = new THREE.CylinderGeometry(shaftRadius, shaftRadius, shaftHeight, 10);
    shaft.translate(0, shaftHeight * 0.5, 0);

    // 3. Sharp Conical Arrowhead
    const headRadius = 0.04;
    const headHeight = 0.1;
    const head = new THREE.ConeGeometry(headRadius, headHeight, 10);
    head.translate(0, shaftHeight + headHeight * 0.5, 0);

    const merged = mergeGeometries([bead, shaft, head]);
    bead.dispose();
    shaft.dispose();
    head.dispose();
    return merged;
  }, []);

  const arrowMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.16,
      metalness: 0.38,
    });
  }, []);

  const maxCapacity = 1024;

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

  // Temp objects for instance matrix & color calculation (reused without allocation)
  const dummyMatrix = useMemo(() => new THREE.Matrix4(), []);
  const dummyPos = useMemo(() => new THREE.Vector3(), []);
  const dummyQuat = useMemo(() => new THREE.Quaternion(), []);
  const dummyScale = useMemo(() => new THREE.Vector3(1, 1, 1), []);
  const upVec = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const dirVec = useMemo(() => new THREE.Vector3(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

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
    if (mesh) {
      if (!tierConfig.enableVectorArrows || !spintronicsPhysics.showVectorField) {
        mesh.count = 0;
        return;
      }

      const mode = MODE_INDEX_MAP[spintronicsPhysics.mode] ?? 0;
      const bField = spintronicsPhysics.magneticField;
      const dmi = spintronicsPhysics.dmiStrength;
      const colormap = spintronicsPhysics.colorMap;

      let idx = 0;

      if (mode <= 2) {
        // Concentric circular rings for Skyrmions & Vortex (polar geometry matching Dr. Zelent's image)
        mesh.count = Math.min(polarCoords.length, maxCapacity);

        for (let i = 0; i < polarCoords.length && idx < maxCapacity; i++) {
          const { x, y, r, phi } = polarCoords[i];

          let mx = 0;
          let my = 0;
          let mz = 1;
          let zElev = 0;

          if (mode === 0 || mode === 1) {
            // Exact micromagnetic domain-wall ansatz (Bogdanov & Hubert / Zelent PRB model)
            const rSk = Math.max(0.35, Math.min(1.65, 0.88 + (dmi - 1.8) * 0.35 - bField * 0.0042));
            const deltaW = Math.max(0.18, Math.min(0.48, 0.32 - (dmi - 1.8) * 0.04));
            const arg = Math.max(-15, Math.min(15, (r - rSk) / deltaW));
            mz = Math.tanh(arg);
            const mPerp = 1.0 / Math.cosh(arg);

            zElev = 0.0; // Flat nanodot substrate without topography

            if (mode === 0) {
              // Néel skyrmion: radial in-plane chirality
              mx = mPerp * Math.cos(phi);
              my = mPerp * Math.sin(phi);
            } else {
              // Bloch skyrmion: tangential in-plane chirality
              mx = -mPerp * Math.sin(phi);
              my = mPerp * Math.cos(phi);
            }
          } else if (mode === 2) {
            // Magnetic Vortex
            const coreR = 0.24;
            const coreProfile = Math.exp(-Math.pow(r / coreR, 2));
            zElev = 0.0; // Flat vortex nanodot
            const inPlane = Math.sqrt(Math.max(0, 1 - coreProfile * coreProfile));
            mx = -Math.sin(phi) * inPlane;
            my = Math.cos(phi) * inPlane;
            mz = coreProfile;
          }

          dummyPos.set(x, y, 0.0);

          if (!reducedMotion) {
            // Subtle coherent magnonic precession micro-motion around local effective field
            const precessionAngle = elapsed * 2.4 + phi * 1.5;
            const precessAmp = 0.032 * (1.0 - Math.abs(mz) * 0.4);
            const px = Math.cos(precessionAngle) * precessAmp;
            const py = Math.sin(precessionAngle) * precessAmp;
            dirVec.set(mx + px, my + py, mz).normalize();
          } else {
            dirVec.set(mx, my, mz).normalize();
          }

          dummyQuat.setFromUnitVectors(upVec, dirVec);
          dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);

          // Color calculation
          if (colormap === "zelent-prb") {
            // Exact scientific colormap from Dr. Mateusz Zelent's publications:
            // mz = -1 (Blue) -> mz = 0 (Green) -> mz = +1 (Magenta/Pink)
            const [cr, cg, cb] = zelentPublicationRgb(mz);
            tempColor.setRGB(cr, cg, cb);
          } else if (colormap === "hsl-cone") {
            // MMPP in-plane orientation wheel
            const inPlaneAngle = Math.atan2(my, mx);
            const h = (((inPlaneAngle / (2 * Math.PI)) % 1) + 1) % 1;
            const s = Math.min(1.0, Math.sqrt(mx * mx + my * my));
            const l = Math.max(0.12, Math.min(0.88, (mz + 1.0) * 0.5));
            const [cr, cg, cb] = hsl2rgb(h, s, l);
            tempColor.setRGB(cr, cg, cb);
          } else if (colormap === "racetrack") {
            // Center (pointing down) Red -> Yellow -> Green -> Cyan -> Blue (pointing up)
            const t = Math.min(1.0, Math.max(0.0, (mz + 1.0) * 0.5));
            const h = (1.0 - t) * 0.65;
            const [cr, cg, cb] = hsl2rgb(h, 0.98, 0.52);
            tempColor.setRGB(cr, cg, cb);
          } else if (colormap === "topological") {
            const q = (1.0 - Math.abs(mz)) * Math.exp(-r * 1.8);
            if (q > 0.6) tempColor.setHex(0xe6a357);
            else if (q > 0.2) tempColor.setHex(0x5672f7);
            else tempColor.setHex(0x846cff);
          } else {
            // Direct mz colormap
            const t = Math.min(1.0, Math.max(0.0, (mz + 1.0) * 0.5));
            tempColor.setRGB(0.05 + 0.87 * t, 0.15 - 0.01 * t, 0.88 - 0.36 * t);
          }

          mesh.setMatrixAt(idx, dummyMatrix);
          mesh.setColorAt(idx, tempColor);
          idx++;
        }
      } else {
        // Waveguide grid for spin waves
        const density = Math.min(24, tierConfig.vectorDensity);
        const totalGrid = density * density;
        mesh.count = Math.min(totalGrid, maxCapacity);

        const step = 4.2 / density;
        const start = -2.1 + step * 0.5;

        for (let ix = 0; ix < density && idx < maxCapacity; ix++) {
          for (let iy = 0; iy < density && idx < maxCapacity; iy++) {
            const x = start + ix * step;
            const y = start + iy * step;
            const k = Math.PI * (spintronicsPhysics.rfFrequency / 4.8);
            const dist = x + 2.2;
            const decay = Math.exp(-Math.max(0, dist) * spintronicsPhysics.dampingAlpha * 35.0);
            const wavePhase = k * dist - elapsed * (spintronicsPhysics.rfFrequency * 0.6);
            const zElev = Math.sin(wavePhase) * decay * 0.3;

            const mx = 0;
            const my = zElev;
            const mz = Math.sqrt(Math.max(0, 1 - my * my));

            dummyPos.set(x, y, zElev + 0.04);
            dirVec.set(mx, my, mz).normalize();
            dummyQuat.setFromUnitVectors(upVec, dirVec);
            dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);

            const [cr, cg, cb] = hsl2rgb((((zElev * 2.0 + 0.5) % 1) + 1) % 1, 0.9, 0.55);
            tempColor.setRGB(cr, cg, cb);

            mesh.setMatrixAt(idx, dummyMatrix);
            mesh.setColorAt(idx, tempColor);
            idx++;
          }
        }
      }

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
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

      {/* Instanced 3D Magnetization Vector Arrows with HSL Cone Colors */}
      <instancedMesh ref={instancedArrowsRef} args={[arrowGeometry, arrowMaterial, maxCapacity]} />

      {/* Multi-directional scientific illumination revealing 3D arrow geometry */}
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 5, 6]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-4, -3, 4]} intensity={0.8} color="#57e6dd" />
      <directionalLight position={[0, -2, -4]} intensity={0.6} color="#445588" />
      <pointLight position={[0, 0, 2.5]} intensity={2.6} color="#846cff" distance={8} />
    </group>
  );
}
