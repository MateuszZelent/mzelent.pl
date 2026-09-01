export interface ClockTick {
  readonly timestamp: number;
  readonly delta: number;
  readonly elapsed: number;
}

export interface VisualClock {
  readonly mode: "demand" | "continuous";
  readonly now: () => number;
}

/**
 * Baseline demand clock for PR 2.
 * Continuous coordinated ticker (GSAP -> Lenis -> R3F) will be activated in subsequent PRs.
 */
export const demandVisualClock: VisualClock = {
  mode: "demand",
  now: () => (typeof performance !== "undefined" ? performance.now() : Date.now()),
};
