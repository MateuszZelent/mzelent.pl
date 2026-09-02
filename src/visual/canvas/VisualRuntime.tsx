"use client";

import { useThree } from "@react-three/fiber";
import React, { useEffect } from "react";

import { attachVisibilityController } from "../lifecycle/visibility-controller";
import type { QualityProfile } from "../quality/quality-contract";
import { AtmosphereScene } from "../scenes/atmosphere/AtmosphereScene";
import { CalibrationScene } from "../scenes/calibration/CalibrationScene";
import type { SceneId } from "../state/scene-contract";
import { useSceneStore } from "../state/scene-store";
import { configureRenderer } from "./renderer-config";

interface VisualRuntimeProps {
  readonly qualityProfile: QualityProfile;
  readonly activeSceneId?: SceneId;
}

export function VisualRuntime({ qualityProfile, activeSceneId = "atmosphere" }: VisualRuntimeProps) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);
  const invalidate = useThree((state) => state.invalidate);
  const updateDiagnostics = useSceneStore((state) => state.updateDiagnostics);

  useEffect(() => {
    configureRenderer(gl);

    const isWebGL2 = gl.capabilities.isWebGL2;
    const frameloop = activeSceneId === "atmosphere" ? "always" : "demand";

    updateDiagnostics({
      webgl2Supported: isWebGL2,
      canvasCount: 1,
      qualityTier: qualityProfile.tier,
      effectiveDpr: gl.getPixelRatio(),
      viewportWidth: size.width,
      viewportHeight: size.height,
      frameloop,
      activeSceneId,
    });

    invalidate();
  }, [gl, size, viewport, qualityProfile, activeSceneId, invalidate, updateDiagnostics]);

  useEffect(() => {
    // Request demand frame when window is resized or orientation changes
    const handleResize = () => invalidate();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("orientationchange", handleResize, { passive: true });

    // Handle document visibility pause/resume
    const cleanupVisibility = attachVisibilityController((visibility) => {
      if (visibility === "visible") {
        invalidate();
      }
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      cleanupVisibility();
    };
  }, [invalidate]);

  const runtimeStatus = useSceneStore((state) => state.runtimeStatus);

  if (runtimeStatus === "lost" || runtimeStatus === "failed") {
    return null;
  }

  return (
    <>
      {activeSceneId === "atmosphere" && <AtmosphereScene qualityProfile={qualityProfile} />}
      {activeSceneId === "calibration" && <CalibrationScene />}
    </>
  );
}
