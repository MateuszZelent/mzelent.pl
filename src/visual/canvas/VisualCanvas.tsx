"use client";

import { Canvas } from "@react-three/fiber";
import React, { useCallback, useEffect, useRef } from "react";
import type * as THREE from "three";

import { VisualRuntimeErrorBoundary } from "../errors/VisualRuntimeErrorBoundary";
import { attachContextController } from "../lifecycle/context-controller";
import { useSceneStore } from "../state/scene-store";
import { createRendererParameters } from "./renderer-config";
import type { VisualCanvasProps } from "./renderer-contract";
import { VisualRuntime } from "./VisualRuntime";

export function VisualCanvas({
  qualityProfile,
  activeSceneId = "snow",
  className,
  style,
  onReady,
  onError,
}: VisualCanvasProps) {
  const cleanupContextRef = useRef<(() => void) | null>(null);
  const setStatus = useSceneStore((state) => state.setStatus);
  const updateDiagnostics = useSceneStore((state) => state.updateDiagnostics);

  useEffect(() => {
    setStatus("loading");
    return () => {
      cleanupContextRef.current?.();
      cleanupContextRef.current = null;
      updateDiagnostics({ canvasCount: 0 });
    };
  }, [setStatus, updateDiagnostics]);

  const handleCreated = useCallback(
    (state: { gl: THREE.WebGLRenderer }) => {
      const canvas = state.gl.domElement;
      cleanupContextRef.current?.();
      cleanupContextRef.current = attachContextController(canvas);
      onReady?.();
    },
    [onReady],
  );

  const isContinuousLoop =
    activeSceneId === "atmosphere" || activeSceneId === "snow" || activeSceneId === "spintronics";

  return (
    <VisualRuntimeErrorBoundary onError={onError}>
      <Canvas
        className={className}
        frameloop={isContinuousLoop ? "always" : "demand"}
        dpr={[1, qualityProfile.dprCap]}
        gl={createRendererParameters(qualityProfile)}
        camera={{ position: [0, 0, 5.2], fov: 45, near: 0.1, far: 100 }}
        onCreated={handleCreated}
        style={{ pointerEvents: activeSceneId === "spintronics" ? "auto" : "none", ...style }}
      >
        <VisualRuntime qualityProfile={qualityProfile} activeSceneId={activeSceneId} />
      </Canvas>
    </VisualRuntimeErrorBoundary>
  );
}
