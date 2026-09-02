import {
  MAX_PIXEL_LOAD_BUDGET,
  QUALITY_DPR_CAPS,
  type QualityProfile,
  type QualityTier,
} from "./quality-contract";

export interface QualitySignals {
  readonly hasWebGL2: boolean;
  readonly prefersReducedMotion: boolean;
  readonly coarsePointer: boolean;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly devicePixelRatio: number;
  readonly deviceMemory?: number;
}

/**
 * Pure function to evaluate quality tier from capability signals.
 * No global window access, no user-agent sniffing, no fingerprinting.
 */
export function selectQualityTier(signals: QualitySignals): QualityTier {
  if (!signals.hasWebGL2 || signals.prefersReducedMotion) {
    return "static";
  }

  // Coarse pointer or mobile viewport width forces low tier
  if (signals.coarsePointer || signals.viewportWidth < 768) {
    return "low";
  }

  // Check candidate High tier requirements
  const isCandidateHigh =
    !signals.coarsePointer &&
    signals.viewportWidth >= 1440 &&
    signals.viewportHeight >= 800 &&
    signals.deviceMemory !== undefined &&
    signals.deviceMemory >= 8;

  if (isCandidateHigh) {
    const highDpr = Math.min(signals.devicePixelRatio, QUALITY_DPR_CAPS.high);
    const highPixelLoad = signals.viewportWidth * signals.viewportHeight * Math.pow(highDpr, 2);
    if (highPixelLoad <= MAX_PIXEL_LOAD_BUDGET) {
      return "high";
    }
  }

  // Evaluate Medium tier with pixel load check
  const medDpr = Math.min(signals.devicePixelRatio, QUALITY_DPR_CAPS.medium);
  const medPixelLoad = signals.viewportWidth * signals.viewportHeight * Math.pow(medDpr, 2);
  if (medPixelLoad > MAX_PIXEL_LOAD_BUDGET) {
    return "low";
  }

  return "medium";
}

/**
 * Resolves full quality profile from signals.
 */
export function resolveQualityProfile(signals: QualitySignals): QualityProfile {
  const tier = selectQualityTier(signals);
  return {
    tier,
    dprCap: QUALITY_DPR_CAPS[tier],
    maxPixelLoad: MAX_PIXEL_LOAD_BUDGET,
    antialias: tier === "high" || tier === "medium",
    powerPreference: tier === "high" ? "high-performance" : "default",
  };
}

/**
 * Calculates clamped DPR given target tier and raw devicePixelRatio.
 */
export function calculateEffectiveDpr(tier: QualityTier, rawDpr: number): number {
  if (tier === "static") return 1.0;
  const cap = QUALITY_DPR_CAPS[tier];
  return Math.min(Math.max(rawDpr, 1.0), cap);
}
