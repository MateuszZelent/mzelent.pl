"use client";

import React from "react";

import type { QualityTier } from "../quality/quality-contract";
import { useSceneStore } from "../state/scene-store";

export function RuntimeDiagnostics({
  className,
  style,
}: {
  readonly className?: string;
  readonly style?: React.CSSProperties;
}) {
  const isEnabled =
    process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DIAGNOSTICS === "1";

  const diag = useSceneStore((state) => state.diagnostics);
  const setTierOverride = useSceneStore((state) => state.setTierOverride);

  if (!isEnabled) {
    return null;
  }

  const handleTierClick = (tier: QualityTier | null) => {
    setTierOverride(tier);
  };

  return (
    <aside
      className={className}
      style={style}
      aria-label="Runtime diagnostics"
      data-testid="runtime-diagnostics"
      data-status={diag.runtimeStatus}
      data-tier={diag.qualityTier}
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
            {diag.reducedMotionDetected ? "active (fallback)" : "off"}
          </dd>
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
      </dl>

      <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "0.4rem" }}>
        <span
          style={{ fontSize: "0.55rem", color: "var(--color-muted)", display: "block", marginBottom: "4px" }}
        >
          Preview Tier Override:
        </span>
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
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
      </div>
    </aside>
  );
}
