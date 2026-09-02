"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { RuntimeDiagnostics } from "../../../visual/diagnostics/RuntimeDiagnostics";
import { type QualityProfile, type QualityTier } from "../../../visual/quality/quality-contract";
import { resolveQualityProfile } from "../../../visual/quality/quality-profile";
import type { MotionMode } from "../../../visual/state/scene-contract";
import { useSceneStore } from "../../../visual/state/scene-store";
import styles from "./visual-system.module.css";

// Lazily import VisualCanvas so Three.js, R3F and WebGL stay completely out of the initial bundle
const LazyVisualCanvas = dynamic(
  () => import("../../../visual/canvas/VisualCanvas").then((mod) => mod.VisualCanvas),
  { ssr: false },
);

const STATIC_FALLBACK_PROFILE: QualityProfile = {
  tier: "static",
  dprCap: 1.0,
  maxPixelLoad: 4_500_000,
  antialias: false,
  powerPreference: "default",
};

let cachedProfile: QualityProfile | null = null;
let lastCapabilitiesSignature = "";

function readBrowserCapabilities(): QualityProfile {
  if (typeof window === "undefined") {
    return STATIC_FALLBACK_PROFILE;
  }

  const hasWebGL2 = Boolean(window.WebGL2RenderingContext);
  const prefersReducedMotion =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
  const coarsePointer =
    typeof window.matchMedia === "function" ? window.matchMedia("(pointer: coarse)").matches : false;
  const viewportWidth = window.innerWidth || 1280;
  const viewportHeight = window.innerHeight || 800;
  const devicePixelRatio = window.devicePixelRatio || 1;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const deviceMemory = nav.deviceMemory;

  const signature = `${hasWebGL2}-${prefersReducedMotion}-${coarsePointer}-${viewportWidth}-${viewportHeight}-${devicePixelRatio}-${deviceMemory}`;
  if (signature === lastCapabilitiesSignature && cachedProfile) {
    return cachedProfile;
  }

  lastCapabilitiesSignature = signature;
  cachedProfile = resolveQualityProfile({
    hasWebGL2,
    prefersReducedMotion,
    coarsePointer,
    viewportWidth,
    viewportHeight,
    devicePixelRatio,
    deviceMemory,
  });

  return cachedProfile;
}

function subscribeToCapabilities(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const motionQuery =
    typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  motionQuery?.addEventListener?.("change", onStoreChange);
  window.addEventListener("resize", onStoreChange, { passive: true });
  window.addEventListener("orientationchange", onStoreChange, { passive: true });

  return () => {
    motionQuery?.removeEventListener?.("change", onStoreChange);
    window.removeEventListener("resize", onStoreChange);
    window.removeEventListener("orientationchange", onStoreChange);
  };
}

export function VisualStageClient() {
  const detectedProfile = useSyncExternalStore(
    subscribeToCapabilities,
    readBrowserCapabilities,
    () => STATIC_FALLBACK_PROFILE,
  );

  const [testMounted, setTestMounted] = useState(true);

  const runtimeStatus = useSceneStore((state) => state.runtimeStatus);
  const posterVisible = useSceneStore((state) => state.posterVisible);
  const tierOverride = useSceneStore((state) => state.tierOverride);
  const motionMode = useSceneStore((state) => state.motionMode);
  const setStatus = useSceneStore((state) => state.setStatus);
  const setPosterVisible = useSceneStore((state) => state.setPosterVisible);
  const setQualityTier = useSceneStore((state) => state.setQualityTier);
  const setTierOverride = useSceneStore((state) => state.setTierOverride);
  const setMotionMode = useSceneStore((state) => state.setMotionMode);
  const setCapabilities = useSceneStore((state) => state.setCapabilities);

  // Check URL query param for tier & motion overrides on the laboratory bench
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tierParam = params.get("tier");
    if (tierParam && ["high", "medium", "low", "static"].includes(tierParam)) {
      setTierOverride(tierParam as QualityTier);
    }

    const motionParam = params.get("motion");
    if (motionParam && ["auto", "reduced", "full-preview"].includes(motionParam)) {
      setMotionMode(motionParam as MotionMode);
    }

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    setCapabilities(prefersReducedMotion, coarsePointer);
  }, [setTierOverride, setMotionMode, setCapabilities]);

  // Compute effective profile
  const activeProfile: QualityProfile = useMemo(() => {
    // If OS prefers reduced motion, force static unless explicitly on laboratory full-preview mode
    if (detectedProfile.tier === "static" && motionMode !== "full-preview") {
      return STATIC_FALLBACK_PROFILE;
    }
    if (!tierOverride) return detectedProfile;
    return {
      tier: tierOverride,
      dprCap: tierOverride === "high" ? 1.75 : tierOverride === "medium" ? 1.35 : 1.0,
      maxPixelLoad: 4_500_000,
      antialias: tierOverride !== "low" && tierOverride !== "static",
      powerPreference: tierOverride === "high" ? "high-performance" : "default",
    };
  }, [tierOverride, motionMode, detectedProfile]);

  // Synchronize store when profile is evaluated
  useEffect(() => {
    setQualityTier(activeProfile.tier);
    if (activeProfile.tier === "static") {
      setStatus("static");
      setPosterVisible(true);
    } else {
      setStatus("loading");
    }
  }, [activeProfile, setQualityTier, setStatus, setPosterVisible]);

  // Support test automation remount cycles if requested
  useEffect(() => {
    const handleTestRemount = (e: CustomEvent<{ mount: boolean }>) => {
      setTestMounted(e.detail.mount);
    };

    window.addEventListener(
      "visual:test-remount" as keyof WindowEventMap,
      handleTestRemount as EventListener,
    );

    return () => {
      window.removeEventListener(
        "visual:test-remount" as keyof WindowEventMap,
        handleTestRemount as EventListener,
      );
    };
  }, []);

  // When runtime transitions to ready, initiate subtle crossfade from poster to canvas
  useEffect(() => {
    if (runtimeStatus === "ready") {
      setPosterVisible(false);
    } else if (runtimeStatus === "lost" || runtimeStatus === "failed" || runtimeStatus === "static") {
      setPosterVisible(true);
    }
  }, [runtimeStatus, setPosterVisible]);

  const shouldRenderCanvas = testMounted && activeProfile.tier !== "static";

  return (
    <>
      <div
        className={styles.canvasSlot}
        data-testid="canvas-slot"
        data-canvas-slot={shouldRenderCanvas ? "active" : "reserved"}
        aria-hidden="true"
      >
        {shouldRenderCanvas ? (
          <LazyVisualCanvas
            className={styles.webglCanvas}
            qualityProfile={activeProfile}
            activeSceneId="atmosphere"
            onError={() => {
              setStatus("failed");
              setPosterVisible(true);
            }}
          />
        ) : (
          <span>Future canvas region</span>
        )}
      </div>

      <div
        className={`${styles.scenePoster} ${!posterVisible ? styles.scenePosterHidden : ""}`}
        data-testid="static-poster"
        data-poster-state={posterVisible ? "visible" : "hidden"}
        role="img"
        aria-label="Static poster showing a restrained layered field calibration"
      >
        <span className={styles.posterOrb} aria-hidden="true" />
        <span className={styles.posterRing} aria-hidden="true" />
        <span className={styles.posterTrace} aria-hidden="true" />
        <span className={styles.posterAxis} aria-hidden="true" />
        <span className={styles.posterScale} aria-hidden="true" />
        <span className={styles.posterCoordinate} aria-hidden="true">
          00.01 / 03.00
        </span>
      </div>

      <RuntimeDiagnostics className={styles.diagnostics} />
    </>
  );
}
