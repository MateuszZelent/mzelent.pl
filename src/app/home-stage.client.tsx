"use client";

import dynamic from "next/dynamic";
import React, { useEffect, useMemo, useSyncExternalStore } from "react";

import { RuntimeDiagnostics } from "../visual/diagnostics/RuntimeDiagnostics";
import type { QualityProfile, QualityTier } from "../visual/quality/quality-contract";
import { resolveQualityProfile } from "../visual/quality/quality-profile";
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

export function HomeVisualStage() {
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
  const setStatus = useSceneStore((state) => state.setStatus);
  const setQualityTier = useSceneStore((state) => state.setQualityTier);
  const setTierOverride = useSceneStore((state) => state.setTierOverride);
  const setCapabilities = useSceneStore((state) => state.setCapabilities);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tierParam = params.get("tier");
    if (tierParam && ["high", "medium", "low", "static"].includes(tierParam)) {
      setTierOverride(tierParam as QualityTier);
    }

    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    setCapabilities(prefersReducedMotion, coarsePointer);
  }, [setTierOverride, setCapabilities]);

  const activeProfile: QualityProfile = useMemo(() => {
    if (!tierOverride) return detectedProfile;
    return {
      tier: tierOverride,
      dprCap: tierOverride === "high" ? 1.75 : tierOverride === "medium" ? 1.35 : 1.0,
      maxPixelLoad: 4_500_000,
      antialias: tierOverride !== "low" && tierOverride !== "static",
      powerPreference: tierOverride === "high" ? "high-performance" : "default",
    };
  }, [tierOverride, detectedProfile]);

  useEffect(() => {
    setQualityTier(activeProfile.tier);
    if (activeProfile.tier === "static") {
      setStatus("static");
    } else {
      setStatus("loading");
    }
  }, [activeProfile, setQualityTier, setStatus]);

  const shouldRenderCanvas = mounted && activeProfile.tier !== "static";

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 4, // Sits between midground and foreground layers
          pointerEvents: "none",
        }}
        aria-hidden="true"
        data-testid="snow-canvas-slot"
      >
        {shouldRenderCanvas && (
          <LazyVisualCanvas
            style={{ width: "100%", height: "100%", pointerEvents: "none" }}
            qualityProfile={activeProfile}
            activeSceneId="snow"
            onError={() => {
              setStatus("failed");
            }}
          />
        )}
      </div>

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
    </>
  );
}
