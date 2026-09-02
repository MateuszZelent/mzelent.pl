"use client";

import React from "react";

import { useSceneStore } from "../state/scene-store";

export function RuntimeDiagnostics({ className }: { readonly className?: string }) {
  const isEnabled =
    process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DIAGNOSTICS === "1";

  const diag = useSceneStore((state) => state.diagnostics);

  if (!isEnabled) {
    return null;
  }

  return (
    <aside
      className={className}
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
        }}
      >
        Runtime diagnostics
      </p>
      <dl style={{ margin: 0, fontSize: "0.6rem" }}>
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
          <dt>WebGL2</dt>
          <dd style={{ color: "var(--color-ink)" }}>{diag.webgl2Supported ? "supported" : "unavailable"}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Canvases</dt>
          <dd style={{ color: "var(--color-ink)" }}>{diag.canvasCount}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Frameloop</dt>
          <dd style={{ color: "var(--color-ink)" }}>{diag.frameloop}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Scene</dt>
          <dd style={{ color: "var(--color-ink)" }}>{diag.activeSceneId}</dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Draw calls / Tris</dt>
          <dd style={{ color: "var(--color-ink)" }}>
            {diag.drawCalls} / {diag.triangles}
          </dd>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <dt>Context loss / restore</dt>
          <dd style={{ color: "var(--color-ink)" }}>
            {diag.contextLossCount} / {diag.contextRestoreCount}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
