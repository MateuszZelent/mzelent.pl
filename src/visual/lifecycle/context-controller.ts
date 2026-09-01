import { useSceneStore } from "../state/scene-store";

export interface ContextControllerOptions {
  readonly onLost?: () => void;
  readonly onRestored?: () => void;
}

export function attachContextController(
  canvas: HTMLCanvasElement,
  options: ContextControllerOptions = {},
): () => void {
  const handleContextLost = (event: Event) => {
    // Prevent default to allow restoration if the browser supports it
    event.preventDefault();
    useSceneStore.getState().recordContextLoss();
    options.onLost?.();
  };

  const handleContextRestored = () => {
    useSceneStore.getState().recordContextRestore();
    options.onRestored?.();
  };

  canvas.addEventListener("webglcontextlost", handleContextLost, false);
  canvas.addEventListener("webglcontextrestored", handleContextRestored, false);

  return () => {
    canvas.removeEventListener("webglcontextlost", handleContextLost, false);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored, false);
  };
}
