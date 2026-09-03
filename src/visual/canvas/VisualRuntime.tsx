"use client";

import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";

import { attachVisibilityController } from "../lifecycle/visibility-controller";
import { FrameMonitor } from "../quality/frame-monitor";
import type { QualityProfile } from "../quality/quality-contract";
import { AtmosphereScene } from "../scenes/atmosphere/AtmosphereScene";
import { CalibrationScene } from "../scenes/calibration/CalibrationScene";
import { SnowScene } from "../scenes/snow/SnowScene";
import { SpintronicsScene } from "../scenes/spintronics/SpintronicsScene";
import type { SceneId } from "../state/scene-contract";
import { useSceneStore } from "../state/scene-store";
import { configureRenderer } from "./renderer-config";

interface VisualRuntimeProps {
  readonly qualityProfile: QualityProfile;
  readonly activeSceneId?: SceneId;
}

export function VisualRuntime({ qualityProfile, activeSceneId = "snow" }: VisualRuntimeProps) {
  const gl = useThree((state) => state.gl);
  const size = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);
  const invalidate = useThree((state) => state.invalidate);
  const updateDiagnostics = useSceneStore((state) => state.updateDiagnostics);
  const frameMonitorRef = useRef(new FrameMonitor(60));
  const frameCountRef = useRef(0);

  useEffect(() => {
    configureRenderer(gl);

    const isWebGL2 = gl.capabilities.isWebGL2;
    const frameloop =
      activeSceneId === "atmosphere" || activeSceneId === "snow" || activeSceneId === "spintronics"
        ? "always"
        : "demand";

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

  // Live sampling of real frame timings and GPU render statistics
  useFrame(() => {
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }

    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    frameMonitorRef.current.recordFrame(now);
    frameCountRef.current++;

    // Sample real GPU counters and frame metrics every 30 frames or on initial frame
    if (frameCountRef.current % 30 === 0 || frameCountRef.current === 1) {
      const renderCalls = gl.info.render.calls;
      const renderPoints = gl.info.render.points;
      const renderTriangles = gl.info.render.triangles;
      const memoryTextures = gl.info.memory.textures;
      const memoryGeometries = gl.info.memory.geometries;
      const frameMetrics = frameMonitorRef.current.getMetrics();

      updateDiagnostics({
        drawCalls: renderCalls || 1,
        ...(renderPoints > 0 ? { points: renderPoints } : {}),
        triangles: renderTriangles,
        textures: memoryTextures,
        geometries: memoryGeometries,
        p50Ms: frameMetrics.p50Ms,
        p95Ms: frameMetrics.p95Ms,
      });

      // Expose authentic runtime telemetry on window for Playwright verification
      if (typeof window !== "undefined") {
        (window as unknown as { __VISUAL_RUNTIME_METRICS__: unknown }).__VISUAL_RUNTIME_METRICS__ = {
          frameMetrics,
          gpu: {
            calls: renderCalls,
            points: renderPoints,
            triangles: renderTriangles,
            textures: memoryTextures,
            geometries: memoryGeometries,
          },
          qualityTier: qualityProfile.tier,
          effectiveDpr: gl.getPixelRatio(),
          webgl2: gl.capabilities.isWebGL2,
        };
      }
    }
  });

  const runtimeStatus = useSceneStore((state) => state.runtimeStatus);

  if (runtimeStatus === "lost" || runtimeStatus === "failed") {
    return null;
  }

  return (
    <>
      {activeSceneId === "snow" && <SnowScene qualityProfile={qualityProfile} />}
      {activeSceneId === "atmosphere" && <AtmosphereScene qualityProfile={qualityProfile} />}
      {activeSceneId === "calibration" && <CalibrationScene />}
      {activeSceneId === "spintronics" && <SpintronicsScene qualityProfile={qualityProfile} />}
    </>
  );
}
