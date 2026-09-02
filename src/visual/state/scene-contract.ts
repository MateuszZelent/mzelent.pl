import type { QualityTier } from "../quality/quality-contract";
import type { RuntimeStatus } from "./runtime-status";

export type SceneId = "snow" | "atmosphere" | "calibration" | "none";

export interface DiagnosticsSnapshot {
  readonly runtimeStatus: RuntimeStatus;
  readonly qualityTier: QualityTier;
  readonly tierOverride: QualityTier | null;
  readonly effectiveDpr: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly webgl2Supported: boolean;
  readonly reducedMotionDetected: boolean;
  readonly canvasCount: number;
  readonly contextLossCount: number;
  readonly contextRestoreCount: number;
  readonly visibilityState: DocumentVisibilityState;
  readonly frameloop: "demand" | "never" | "always";
  readonly drawCalls: number;
  readonly triangles: number;
  readonly points: number;
  readonly geometries: number;
  readonly textures: number;
  readonly activeSceneId: SceneId;
  readonly posterVisible: boolean;
  readonly firstFrameCommitted: boolean;
}

export interface SceneState {
  readonly runtimeStatus: RuntimeStatus;
  readonly qualityTier: QualityTier;
  readonly tierOverride: QualityTier | null;
  readonly reducedMotion: boolean;
  readonly coarsePointer: boolean;
  readonly visibilityState: DocumentVisibilityState;
  readonly activeSceneId: SceneId;
  readonly posterVisible: boolean;
  readonly firstFrameCommitted: boolean;
  readonly contextLossCount: number;
  readonly contextRestoreCount: number;
  readonly diagnostics: DiagnosticsSnapshot;
}
