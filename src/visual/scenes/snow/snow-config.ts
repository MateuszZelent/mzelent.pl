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
    bounds: { x: 6.0, y: 4.5, z: 1.5 },
    fallSpeed: 0.44,
    windStrength: 0.18,
    turbulenceStrength: 0.12,
    pointerForce: 2.6,
    pointerRadius: 1.8,
    pointSize: 1.0,
    dprCap: 1.75,
  },
  medium: {
    particleCount: 2_304, // 48 x 48 - subtle atmospheric micro-snow
    fboWidth: 48,
    fboHeight: 48,
    bounds: { x: 6.0, y: 4.5, z: 1.5 },
    fallSpeed: 0.4,
    windStrength: 0.15,
    turbulenceStrength: 0.1,
    pointerForce: 2.4,
    pointerRadius: 1.8,
    pointSize: 0.95,
    dprCap: 1.35,
  },
  low: {
    particleCount: 1_024, // 32 x 32
    fboWidth: 32,
    fboHeight: 32,
    bounds: { x: 6.0, y: 4.5, z: 1.5 },
    fallSpeed: 0.36,
    windStrength: 0.12,
    turbulenceStrength: 0.08,
    pointerForce: 2.0,
    pointerRadius: 1.6,
    pointSize: 0.9,
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
