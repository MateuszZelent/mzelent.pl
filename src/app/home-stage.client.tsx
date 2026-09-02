"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useSyncExternalStore } from "react";

import { RuntimeDiagnostics } from "../visual/diagnostics/RuntimeDiagnostics";
import type { QualityProfile, QualityTier } from "../visual/quality/quality-contract";
import { resolveQualityProfile } from "../visual/quality/quality-profile";
import type { MotionMode } from "../visual/state/scene-contract";
import { useSceneStore } from "../visual/state/scene-store";

const LazyVisualCanvas = dynamic(
  () => import("../visual/canvas/VisualCanvas").then((mod) => mod.VisualCanvas),
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

function subscribeMounted(): () => void {
  return () => {};
}

function useActiveProfile(): { activeProfile: QualityProfile; mounted: boolean } {
  const detectedProfile = useSyncExternalStore(
    subscribeToCapabilities,
    readBrowserCapabilities,
    () => STATIC_FALLBACK_PROFILE,
  );

  const mounted = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  );
  const tierOverride = useSceneStore((state) => state.tierOverride);
  const motionMode = useSceneStore((state) => state.motionMode);
  const setStatus = useSceneStore((state) => state.setStatus);
  const setQualityTier = useSceneStore((state) => state.setQualityTier);
  const setTierOverride = useSceneStore((state) => state.setTierOverride);
  const setMotionMode = useSceneStore((state) => state.setMotionMode);
  const setCapabilities = useSceneStore((state) => state.setCapabilities);

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

  const activeProfile: QualityProfile = useMemo(() => {
    // If motionMode is reduced, force static
    if (motionMode === "reduced") {
      return STATIC_FALLBACK_PROFILE;
    }
    // OS reduced motion forces static by default unless developer explicitly toggles tier override or motionMode
    if (detectedProfile.tier === "static" && motionMode === "auto" && tierOverride === null) {
      return STATIC_FALLBACK_PROFILE;
    }
    const targetTier = tierOverride ?? (detectedProfile.tier === "static" ? "medium" : detectedProfile.tier);
    return {
      tier: targetTier,
      dprCap: targetTier === "high" ? 1.75 : targetTier === "medium" ? 1.35 : 1.0,
      maxPixelLoad: 4_500_000,
      antialias: targetTier !== "low" && targetTier !== "static",
      powerPreference: targetTier === "high" ? "high-performance" : "default",
    };
  }, [tierOverride, motionMode, detectedProfile]);

  useEffect(() => {
    setQualityTier(activeProfile.tier);
    if (activeProfile.tier === "static") {
      setStatus("static");
    } else {
      setStatus("loading");
    }
  }, [activeProfile, setQualityTier, setStatus]);

  return { activeProfile, mounted };
}

export function HomeSnowCanvas() {
  const { activeProfile, mounted } = useActiveProfile();
  const setStatus = useSceneStore((state) => state.setStatus);

  const shouldRenderCanvas = mounted && activeProfile.tier !== "static";
  if (!shouldRenderCanvas) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      aria-hidden="true"
      data-testid="snow-canvas-slot"
    >
      <LazyVisualCanvas
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        qualityProfile={activeProfile}
        activeSceneId="snow"
        onError={() => {
          setStatus("failed");
        }}
      />
    </div>
  );
}

export function HomeDiagnostics() {
  return (
    <RuntimeDiagnostics
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        zIndex: 999,
        background: "rgba(3, 4, 5, 0.9)",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "6px",
        padding: "0.75rem",
        fontFamily: "var(--font-mono, monospace)",
        backdropFilter: "blur(12px)",
        maxWidth: "260px",
      }}
    />
  );
}

export function HomeVisualStage() {
  return (
    <>
      <HomeSnowCanvas />
      <HomeDiagnostics />
    </>
  );
}
