"use client";

import React from "react";

import type { QualityTier } from "../quality/quality-contract";
import type { MotionMode } from "../state/scene-contract";
import { useSceneStore } from "../state/scene-store";

function subscribeMounted(): () => void {
  return () => {};
}

export function RuntimeDiagnostics({
  className,
  style,
  forceEnable = false,
}: {
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly forceEnable?: boolean;
}) {
  const mounted = React.useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  );

  const isLabRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/lab");
  const isEnabled =
    mounted &&
    (forceEnable ||
      isLabRoute ||
      process.env.NODE_ENV === "development" ||
      process.env.NEXT_PUBLIC_ENABLE_DIAGNOSTICS === "1");

  const diag = useSceneStore((state) => state.diagnostics);
  const setTierOverride = useSceneStore((state) => state.setTierOverride);
  const setMotionMode = useSceneStore((state) => state.setMotionMode);

  if (!isEnabled) {
    return null;
  }

  const handleTierClick = (tier: QualityTier | null) => {
    setTierOverride(tier);
  };

  const handleMotionClick = (mode: MotionMode) => {
    setMotionMode(mode);
  };

  return (
    <aside
      className={className}
      style={style}
      aria-label="Runtime diagnostics"
      data-testid="runtime-diagnostics"
      data-status={diag.runtimeStatus}
      data-tier={diag.qualityTier}
      data-motion-mode={diag.motionMode}
      data-dpr={diag.effectiveDpr}
      data-canvas-count={diag.canvasCount}
      data-webgl2={diag.webgl2Supported}
      data-draw-calls={diag.drawCalls}
      data-triangles={diag.triangles}
      data-points={diag.points}
      data-geometries={diag.geometries}
      data-textures={diag.textures}
      data-context-loss={diag.contextLossCount}
      data-context-restore={diag.contextRestoreCount}
      data-frameloop={diag.frameloop}
      data-scene={diag.activeSceneId}
      data-first-frame={diag.firstFrameCommitted}
      data-p50={diag.p50Ms}
      data-p95={diag.p95Ms}
      data-first-frame-time={diag.firstFrameTimeMs}
    >
      <p
        style={{
          color: "var(--accent-cyan)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          margin: "0 0 0.5rem",
          fontWeight: 600,
        }}
      >
        Runtime diagnostics
      </p>
      <dl style={{ margin: "0 0 0.5rem", fontSize: "0.6rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Status</dt>
          <dd style={{ color: "var(--color-ink)", fontWeight: 600 }}>{diag.runtimeStatus}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Quality tier</dt>
          <dd style={{ color: "var(--color-ink)" }}>
            {diag.qualityTier} (DPR {diag.effectiveDpr.toFixed(2)})
          </dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>OS Reduced Motion</dt>
          <dd style={{ color: diag.reducedMotionDetected ? "var(--accent-violet)" : "var(--color-ink)" }}>
            {diag.reducedMotionDetected ? "active (enforced)" : "off"}
          </dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Motion Mode</dt>
          <dd style={{ color: "var(--color-ink)" }}>{diag.motionMode}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>WebGL2</dt>
          <dd style={{ color: "var(--color-ink)" }}>{diag.webgl2Supported ? "supported" : "unavailable"}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Canvases</dt>
          <dd style={{ color: "var(--color-ink)" }}>{diag.canvasCount}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Scene</dt>
          <dd style={{ color: "var(--color-ink)" }}>{diag.activeSceneId}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Draw calls / Points</dt>
          <dd style={{ color: "var(--color-ink)" }}>
            {diag.drawCalls} / {diag.points.toLocaleString()}
          </dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Frame p50 / p95</dt>
          <dd style={{ color: "var(--color-ink)" }}>
            {diag.p50Ms > 0 ? `${diag.p50Ms}ms / ${diag.p95Ms}ms` : "measuring..."}
          </dd>
        </div>
      </dl>

      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "0.4rem" }}>
        <span
          style={{ fontSize: "0.55rem", color: "var(--color-muted)", display: "block", marginBottom: "4px" }}
        >
          Preview Tier Override:
        </span>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "6px" }}>
          {(["auto", "high", "medium", "low", "static"] as const).map((t) => {
            const isSelected = t === "auto" ? diag.tierOverride === null : diag.tierOverride === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => handleTierClick(t === "auto" ? null : t)}
                style={{
                  background: isSelected ? "var(--accent-cyan)" : "rgba(255, 255, 255, 0.05)",
                  color: isSelected ? "#030405" : "var(--color-ink)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "2px",
                  fontSize: "0.55rem",
                  padding: "2px 5px",
                  cursor: "pointer",
                  fontWeight: isSelected ? 700 : 400,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        <span
          style={{ fontSize: "0.55rem", color: "var(--color-muted)", display: "block", marginBottom: "4px" }}
        >
          Lab Motion Override:
        </span>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {(["auto", "reduced", "full-preview"] as const).map((m) => {
            const isSelected = diag.motionMode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleMotionClick(m)}
                style={{
                  background: isSelected ? "var(--accent-violet)" : "rgba(255, 255, 255, 0.05)",
                  color: isSelected ? "#030405" : "var(--color-ink)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "2px",
                  fontSize: "0.55rem",
                  padding: "2px 5px",
                  cursor: "pointer",
                  fontWeight: isSelected ? 700 : 400,
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
