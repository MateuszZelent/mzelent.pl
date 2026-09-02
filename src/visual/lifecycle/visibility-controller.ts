import { useSceneStore } from "../state/scene-store";

export function attachVisibilityController(
  onVisibilityChange?: (state: DocumentVisibilityState) => void,
): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  const handleVisibilityChange = () => {
    const state = document.visibilityState;
    useSceneStore.getState().setVisibilityState(state);
    onVisibilityChange?.(state);
  };

  document.addEventListener("visibilitychange", handleVisibilityChange, false);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange, false);
  };
}
