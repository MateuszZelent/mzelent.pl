export type QualityTier = "high" | "medium" | "low" | "static";

export interface QualityProfile {
  readonly tier: QualityTier;
  readonly dprCap: number;
  readonly maxPixelLoad: number;
  readonly antialias: boolean;
  readonly powerPreference: WebGLPowerPreference;
}

export const QUALITY_DPR_CAPS: Record<QualityTier, number> = {
  high: 1.75,
  medium: 1.35,
  low: 1.0,
  static: 1.0,
};

export const MAX_PIXEL_LOAD_BUDGET = 4_500_000;
