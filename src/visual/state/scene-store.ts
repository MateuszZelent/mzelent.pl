import { create } from "zustand";

import type { QualityTier } from "../quality/quality-contract";
import { isValidStatusTransition, type RuntimeStatus } from "./runtime-status";
import type {
  DiagnosticsSnapshot,
  MotionMode,
  SceneId,
  SceneState,
  SpintronicsPhysicsState,
} from "./scene-contract";

export interface SceneStoreActions {
  readonly setStatus: (status: RuntimeStatus) => boolean;
  readonly setQualityTier: (tier: QualityTier) => void;
  readonly setTierOverride: (override: QualityTier | null) => void;
  readonly setMotionMode: (mode: MotionMode) => void;
  readonly setCapabilities: (reducedMotion: boolean, coarsePointer: boolean) => void;
  readonly setVisibilityState: (visibility: DocumentVisibilityState) => void;
  readonly setActiveSceneId: (sceneId: SceneId) => void;
  readonly setPosterVisible: (visible: boolean) => void;
  readonly recordFirstFrame: () => void;
  readonly recordContextLoss: () => void;
  readonly recordContextRestore: () => void;
  readonly updateDiagnostics: (patch: Partial<DiagnosticsSnapshot>) => void;
  readonly setSpintronicsPhysics: (patch: Partial<SpintronicsPhysicsState>) => void;
  readonly reset: () => void;
}

export type VisualSceneStore = SceneState & SceneStoreActions;

export const initialSpintronicsPhysics: SpintronicsPhysicsState = {
  mode: "skyrmion-neel",
  magneticField: 45, // mT
  dmiStrength: 1.8, // mJ/m²
  rfFrequency: 9.2, // GHz
  dampingAlpha: 0.008,
  colorMap: "chiral",
  showVectorField: true,
};

const initialDiagnostics: DiagnosticsSnapshot = {
  runtimeStatus: "idle",
  qualityTier: "medium",
  tierOverride: null,
  motionMode: "auto",
  effectiveDpr: 1.0,
  viewportWidth: 0,
  viewportHeight: 0,
  webgl2Supported: false,
  reducedMotionDetected: false,
  canvasCount: 0,
  contextLossCount: 0,
  contextRestoreCount: 0,
  visibilityState: "visible",
  frameloop: "demand",
  drawCalls: 0,
  triangles: 0,
  points: 0,
  geometries: 0,
  textures: 0,
  activeSceneId: "none",
  posterVisible: true,
  firstFrameCommitted: false,
  p50Ms: 0,
  p95Ms: 0,
  firstFrameTimeMs: 0,
};

const initialState: SceneState = {
  runtimeStatus: "idle",
  qualityTier: "medium",
  tierOverride: null,
  motionMode: "auto",
  reducedMotion: false,
  coarsePointer: false,
  visibilityState: "visible",
  activeSceneId: "none",
  posterVisible: true,
  firstFrameCommitted: false,
  contextLossCount: 0,
  contextRestoreCount: 0,
  diagnostics: initialDiagnostics,
  spintronicsPhysics: initialSpintronicsPhysics,
};

export const useSceneStore = create<VisualSceneStore>((set, get) => ({
  ...initialState,

  setStatus: (newStatus: RuntimeStatus) => {
    const current = get().runtimeStatus;
    if (!isValidStatusTransition(current, newStatus)) {
      console.warn(`[VisualRuntime] Invalid status transition from ${current} to ${newStatus}`);
      return false;
    }
    set((state) => ({
      runtimeStatus: newStatus,
      diagnostics: { ...state.diagnostics, runtimeStatus: newStatus },
    }));
    return true;
  },

  setQualityTier: (qualityTier: QualityTier) =>
    set((state) => ({
      qualityTier,
      diagnostics: { ...state.diagnostics, qualityTier },
    })),

  setTierOverride: (tierOverride: QualityTier | null) =>
    set((state) => ({
      tierOverride,
      diagnostics: { ...state.diagnostics, tierOverride },
    })),

  setMotionMode: (motionMode: MotionMode) =>
    set((state) => ({
      motionMode,
      diagnostics: { ...state.diagnostics, motionMode },
    })),

  setCapabilities: (reducedMotion: boolean, coarsePointer: boolean) =>
    set((state) => ({
      reducedMotion,
      coarsePointer,
      diagnostics: { ...state.diagnostics, reducedMotionDetected: reducedMotion },
    })),

  setVisibilityState: (visibilityState: DocumentVisibilityState) =>
    set((state) => ({
      visibilityState,
      diagnostics: { ...state.diagnostics, visibilityState },
    })),

  setActiveSceneId: (activeSceneId: SceneId) =>
    set((state) => ({
      activeSceneId,
      diagnostics: { ...state.diagnostics, activeSceneId },
    })),

  setPosterVisible: (posterVisible: boolean) =>
    set((state) => ({
      posterVisible,
      diagnostics: { ...state.diagnostics, posterVisible },
    })),

  recordFirstFrame: (timestamp?: number) => {
    const firstFrameTimeMs =
      timestamp ?? (typeof performance !== "undefined" ? Math.round(performance.now()) : 0);
    set((state) => ({
      firstFrameCommitted: true,
      runtimeStatus: "ready",
      diagnostics: {
        ...state.diagnostics,
        firstFrameCommitted: true,
        runtimeStatus: "ready",
        firstFrameTimeMs,
      },
    }));
  },

  recordContextLoss: () =>
    set((state) => {
      const contextLossCount = state.contextLossCount + 1;
      return {
        runtimeStatus: "lost",
        contextLossCount,
        posterVisible: true,
        diagnostics: {
          ...state.diagnostics,
          runtimeStatus: "lost",
          contextLossCount,
          posterVisible: true,
        },
      };
    }),

  recordContextRestore: () =>
    set((state) => {
      const contextRestoreCount = state.contextRestoreCount + 1;
      return {
        runtimeStatus: "restoring",
        contextRestoreCount,
        diagnostics: {
          ...state.diagnostics,
          runtimeStatus: "restoring",
          contextRestoreCount,
        },
      };
    }),

  updateDiagnostics: (patch: Partial<DiagnosticsSnapshot>) =>
    set((state) => ({
      diagnostics: { ...state.diagnostics, ...patch },
    })),

  setSpintronicsPhysics: (patch: Partial<SpintronicsPhysicsState>) =>
    set((state) => ({
      spintronicsPhysics: { ...state.spintronicsPhysics, ...patch },
    })),

  reset: () => set(initialState),
}));
