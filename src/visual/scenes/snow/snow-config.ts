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
  readonly dprCap: number;
}

export const SNOW_CONFIGS: Record<QualityTier, SnowConfig> = {
  high: {
    particleCount: 50_176, // 224 x 224
    fboWidth: 224,
    fboHeight: 224,
    bounds: { x: 5.5, y: 4.0, z: 3.5 },
    fallSpeed: 0.65,
    windStrength: 0.25,
    turbulenceStrength: 0.18,
    pointerForce: 1.8,
    pointerRadius: 1.5,
    dprCap: 1.75,
  },
  medium: {
    particleCount: 24_000, // 160 x 150
    fboWidth: 160,
    fboHeight: 150,
    bounds: { x: 5.5, y: 4.0, z: 3.5 },
    fallSpeed: 0.6,
    windStrength: 0.22,
    turbulenceStrength: 0.15,
    pointerForce: 1.6,
    pointerRadius: 1.4,
    dprCap: 1.35,
  },
  low: {
    particleCount: 8_064, // 96 x 84
    fboWidth: 96,
    fboHeight: 84,
    bounds: { x: 5.5, y: 4.0, z: 3.5 },
    fallSpeed: 0.55,
    windStrength: 0.2,
    turbulenceStrength: 0.12,
    pointerForce: 1.4,
    pointerRadius: 1.2,
    dprCap: 1.0,
  },
  static: {
    particleCount: 0,
    fboWidth: 0,
    fboHeight: 0,
    bounds: { x: 5.5, y: 4.0, z: 3.5 },
    fallSpeed: 0,
    windStrength: 0,
    turbulenceStrength: 0,
    pointerForce: 0,
    pointerRadius: 0,
    dprCap: 1.0,
  },
};
