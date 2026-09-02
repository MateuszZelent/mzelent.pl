import type { QualityTier } from "../../quality/quality-contract";

export interface SnowConfig {
  readonly particleCount: number;
  readonly fboWidth: number;
  readonly fboHeight: number;
  readonly bounds: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
  readonly fallSpeed: number;
  readonly windStrength: number;
  readonly turbulenceStrength: number;
  readonly pointerForce: number;
  readonly pointerRadius: number;
  readonly pointSize: number;
  readonly dprCap: number;
}

export const SNOW_CONFIGS: Record<QualityTier, SnowConfig> = {
  high: {
    particleCount: 4_096, // 64 x 64 - delicate and atmospheric
    fboWidth: 64,
    fboHeight: 64,
    bounds: { x: 6.0, y: 4.5, z: 3.5 },
    fallSpeed: 0.52,
    windStrength: 0.22,
    turbulenceStrength: 0.14,
    pointerForce: 1.5,
    pointerRadius: 1.5,
    pointSize: 1.4,
    dprCap: 1.75,
  },
  medium: {
    particleCount: 2_304, // 48 x 48 - subtle atmospheric micro-snow
    fboWidth: 48,
    fboHeight: 48,
    bounds: { x: 6.0, y: 4.5, z: 3.5 },
    fallSpeed: 0.48,
    windStrength: 0.18,
    turbulenceStrength: 0.12,
    pointerForce: 1.3,
    pointerRadius: 1.3,
    pointSize: 1.3,
    dprCap: 1.35,
  },
  low: {
    particleCount: 1_024, // 32 x 32
    fboWidth: 32,
    fboHeight: 32,
    bounds: { x: 6.0, y: 4.5, z: 3.5 },
    fallSpeed: 0.42,
    windStrength: 0.15,
    turbulenceStrength: 0.1,
    pointerForce: 1.1,
    pointerRadius: 1.1,
    pointSize: 1.2,
    dprCap: 1.0,
  },
  static: {
    particleCount: 0,
    fboWidth: 0,
    fboHeight: 0,
    bounds: { x: 0, y: 0, z: 0 },
    fallSpeed: 0,
    windStrength: 0,
    turbulenceStrength: 0,
    pointerForce: 0,
    pointerRadius: 0,
    pointSize: 0,
    dprCap: 1.0,
  },
};
