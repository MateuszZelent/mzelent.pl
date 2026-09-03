import type { QualityTier } from "../quality/quality-contract";
import type { RuntimeStatus } from "./runtime-status";

export type SceneId = "snow" | "atmosphere" | "calibration" | "spintronics" | "none";
export type MotionMode = "auto" | "reduced" | "full-preview";

export type SpintronicsMode = "skyrmion-neel" | "skyrmion-bloch" | "vortex" | "spin-wave" | "caustic-lens";

export type SpintronicsColorMap = "hsl-cone" | "racetrack" | "chiral" | "topological" | "magnetization";

export interface SpintronicsPhysicsState {
  readonly mode: SpintronicsMode;
  readonly magneticField: number; // mT (-150 to +150)
  readonly dmiStrength: number; // mJ/m² (0.0 to 3.5)
  readonly rfFrequency: number; // GHz (2.0 to 20.0)
  readonly dampingAlpha: number; // 0.001 to 0.05
  readonly colorMap: SpintronicsColorMap;
  readonly showVectorField: boolean;
}

export interface DiagnosticsSnapshot {
  readonly runtimeStatus: RuntimeStatus;
  readonly qualityTier: QualityTier;
  readonly tierOverride: QualityTier | null;
  readonly motionMode: MotionMode;
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
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly firstFrameTimeMs: number;
}

export interface SceneState {
  readonly runtimeStatus: RuntimeStatus;
  readonly qualityTier: QualityTier;
  readonly tierOverride: QualityTier | null;
  readonly motionMode: MotionMode;
  readonly reducedMotion: boolean;
  readonly coarsePointer: boolean;
  readonly visibilityState: DocumentVisibilityState;
  readonly activeSceneId: SceneId;
  readonly posterVisible: boolean;
  readonly firstFrameCommitted: boolean;
  readonly contextLossCount: number;
  readonly contextRestoreCount: number;
  readonly diagnostics: DiagnosticsSnapshot;
  readonly spintronicsPhysics: SpintronicsPhysicsState;
}
