import { beforeEach, describe, expect, it } from "vitest";

import { CALIBRATION_CONFIG } from "../../src/visual/scenes/calibration/calibration-config";
import { isValidStatusTransition } from "../../src/visual/state/runtime-status";
import { useSceneStore } from "../../src/visual/state/scene-store";

describe("Runtime Status State Machine & Store", () => {
  beforeEach(() => {
    useSceneStore.getState().reset();
  });

  it("validates permissible status transitions", () => {
    expect(isValidStatusTransition("idle", "loading")).toBe(true);
    expect(isValidStatusTransition("idle", "static")).toBe(true);
    expect(isValidStatusTransition("loading", "ready")).toBe(true);
    expect(isValidStatusTransition("loading", "failed")).toBe(true);
    expect(isValidStatusTransition("ready", "lost")).toBe(true);
    expect(isValidStatusTransition("lost", "restoring")).toBe(true);
    expect(isValidStatusTransition("restoring", "ready")).toBe(true);

    // Invalid transitions
    expect(isValidStatusTransition("idle", "ready")).toBe(false);
    expect(isValidStatusTransition("ready", "loading")).toBe(false);
    expect(isValidStatusTransition("failed", "ready")).toBe(false);
  });

  it("records first frame committed and transitions to ready status", () => {
    const store = useSceneStore.getState();
    expect(store.runtimeStatus).toBe("idle");
    expect(store.firstFrameCommitted).toBe(false);

    store.setStatus("loading");
    store.recordFirstFrame();

    const updated = useSceneStore.getState();
    expect(updated.runtimeStatus).toBe("ready");
    expect(updated.firstFrameCommitted).toBe(true);
  });

  it("handles WebGL context loss and restoration sequence correctly", () => {
    const store = useSceneStore.getState();
    store.setStatus("loading");
    store.recordFirstFrame();

    expect(useSceneStore.getState().runtimeStatus).toBe("ready");

    // Context lost
    store.recordContextLoss();
    const lostState = useSceneStore.getState();
    expect(lostState.runtimeStatus).toBe("lost");
    expect(lostState.contextLossCount).toBe(1);
    expect(lostState.posterVisible).toBe(true);

    // Context restored
    store.recordContextRestore();
    const restoringState = useSceneStore.getState();
    expect(restoringState.runtimeStatus).toBe("restoring");
    expect(restoringState.contextRestoreCount).toBe(1);

    // Frame rendered again
    store.recordFirstFrame();
    expect(useSceneStore.getState().runtimeStatus).toBe("ready");
  });

  it("preserves calibration scene budget constraints", () => {
    expect(CALIBRATION_CONFIG.drawCallBudget).toBe(5);
    expect(CALIBRATION_CONFIG.triangleBudget).toBe(50_000);
  });
});
