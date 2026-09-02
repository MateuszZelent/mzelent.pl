/**
 * Authoritative runtime status state machine contract.
 */
export type RuntimeStatus =
  | "idle" // Initial state, lazy runtime not yet requested
  | "loading" // Lazy chunk loading or WebGL context initializing
  | "ready" // WebGL2 context initialized and first frame rendered
  | "lost" // WebGL context lost event fired
  | "restoring" // WebGL context restored event fired, rebuilding resources
  | "failed" // Critical initialization or runtime failure (falls back to poster)
  | "static"; // Deliberate static mode (reduced motion, no-WebGL, or unsupported)

const VALID_TRANSITIONS: Record<RuntimeStatus, readonly RuntimeStatus[]> = {
  idle: ["loading", "static", "failed"],
  loading: ["ready", "failed", "static"],
  ready: ["lost", "static", "failed"],
  lost: ["restoring", "failed", "static"],
  restoring: ["ready", "failed", "static"],
  failed: ["loading", "static"],
  static: ["loading"],
};

/**
 * Pure function to validate state machine transitions.
 */
export function isValidStatusTransition(from: RuntimeStatus, to: RuntimeStatus): boolean {
  if (from === to) return true;
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}
