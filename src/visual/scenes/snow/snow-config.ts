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
    particleCount: 4_096, // 64 x 64 - delicate and sparse
    fboWidth: 64,
    fboHeight: 64,
    bounds: { x: 5.5, y: 4.0, z: 2.5 },
    fallSpeed: 0.45,
    windStrength: 0.18,
    turbulenceStrength: 0.12,
    pointerForce: 1.4,
    pointerRadius: 1.4,
    pointSize: 1.2,
    dprCap: 1.75,
  },
  medium: {
    particleCount: 2_304, // 48 x 48 - subtle atmospheric micro-snow
    fboWidth: 48,
    fboHeight: 48,
    bounds: { x: 5.5, y: 4.0, z: 2.5 },
    fallSpeed: 0.4,
    windStrength: 0.15,
    turbulenceStrength: 0.1,
    pointerForce: 1.2,
    pointerRadius: 1.2,
    pointSize: 1.1,
    dprCap: 1.35,
  },
  low: {
    particleCount: 1_024, // 32 x 32
    fboWidth: 32,
    fboHeight: 32,
    bounds: { x: 5.5, y: 4.0, z: 2.5 },
    fallSpeed: 0.35,
    windStrength: 0.12,
    turbulenceStrength: 0.08,
    pointerForce: 1.0,
    pointerRadius: 1.0,
    pointSize: 1.0,
    dprCap: 1.0,
  },
  static: {
    particleCount: 0,
    fboWidth: 0,
    fboHeight: 0,
    bounds: { x: 5.5, y: 4.0, z: 2.5 },
    fallSpeed: 0,
    windStrength: 0,
    turbulenceStrength: 0,
    pointerForce: 0,
    pointerRadius: 0,
    pointSize: 0,
    dprCap: 1.0,
  },
};
