"use client";

import { useThree } from "@react-three/fiber";
import React, { useEffect, useMemo } from "react";
import * as THREE from "three";

import { useSceneStore } from "../../state/scene-store";
import { CALIBRATION_CONFIG } from "./calibration-config";

export function CalibrationScene() {
  const invalidate = useThree((state) => state.invalidate);
  const gl = useThree((state) => state.gl);
  const recordFirstFrame = useSceneStore((state) => state.recordFirstFrame);
  const updateDiagnostics = useSceneStore((state) => state.updateDiagnostics);

  // Memoize geometries and materials to guarantee zero allocations inside render loop
  const coreGeometry = useMemo(
    () => new THREE.IcosahedronGeometry(CALIBRATION_CONFIG.coreRadius, CALIBRATION_CONFIG.coreDetail),
    [],
  );

  const ringGeometry1 = useMemo(
    () =>
      new THREE.TorusGeometry(
        CALIBRATION_CONFIG.ringOuterRadius,
        CALIBRATION_CONFIG.ringTubeRadius,
        16,
        CALIBRATION_CONFIG.ringSegments,
      ),
    [],
  );

  const ringGeometry2 = useMemo(
    () =>
      new THREE.TorusGeometry(
        CALIBRATION_CONFIG.ringOuterRadius * 0.85,
        CALIBRATION_CONFIG.ringTubeRadius,
        16,
        CALIBRATION_CONFIG.ringSegments,
      ),
    [],
  );

  const coreMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(CALIBRATION_CONFIG.colors.core),
        roughness: 0.25,
        metalness: 0.15,
        transparent: true,
        opacity: 0.88,
      }),
    [],
  );

  const ringMaterialCyan = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(CALIBRATION_CONFIG.colors.accentCyan),
        transparent: true,
        opacity: 0.65,
      }),
    [],
  );

  const ringMaterialViolet = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(CALIBRATION_CONFIG.colors.accentViolet),
        transparent: true,
        opacity: 0.55,
      }),
    [],
  );

  useEffect(() => {
    // Notify store of first frame rendered and update renderer info
    recordFirstFrame();

    const info = gl.info;
    updateDiagnostics({
      drawCalls: info.render.calls,
      triangles: info.render.triangles,
      points: info.render.points,
      geometries: info.memory.geometries,
      textures: info.memory.textures,
      activeSceneId: "calibration",
    });

    // Request demand frame
    invalidate();

    return () => {
      coreGeometry.dispose();
      ringGeometry1.dispose();
      ringGeometry2.dispose();
      coreMaterial.dispose();
      ringMaterialCyan.dispose();
      ringMaterialViolet.dispose();
    };
  }, [
    gl,
    invalidate,
    recordFirstFrame,
    updateDiagnostics,
    coreGeometry,
    ringGeometry1,
    ringGeometry2,
    coreMaterial,
    ringMaterialCyan,
    ringMaterialViolet,
  ]);

  return (
    <group name="calibration-scene-root">
      <ambientLight intensity={0.4} color={CALIBRATION_CONFIG.colors.ambient} />
      <directionalLight position={[4, 5, 3]} intensity={1.6} color={CALIBRATION_CONFIG.colors.accentCyan} />
      <directionalLight
        position={[-3, -4, -2]}
        intensity={0.8}
        color={CALIBRATION_CONFIG.colors.accentViolet}
      />

      {/* Central calibration core form */}
      <mesh geometry={coreGeometry} material={coreMaterial} position={[0, 0, 0]} />

      {/* Calibration orientation rings */}
      <mesh
        geometry={ringGeometry1}
        material={ringMaterialCyan}
        position={[0, 0, 0]}
        rotation={[Math.PI / 4, Math.PI / 6, 0]}
      />
      <mesh
        geometry={ringGeometry2}
        material={ringMaterialViolet}
        position={[0, 0, 0]}
        rotation={[-Math.PI / 3, Math.PI / 4, Math.PI / 8]}
      />
    </group>
  );
}
