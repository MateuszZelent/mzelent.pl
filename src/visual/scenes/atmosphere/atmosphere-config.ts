import type { QualityTier } from "../../quality/quality-contract";

export interface ParticleTierConfig {
  readonly count: number;
  readonly textureWidth: number;
  readonly textureHeight: number;
  readonly pointSize: number;
}

export const PARTICLE_TIER_CONFIGS: Record<QualityTier, ParticleTierConfig> = {
  high: {
    count: 50_176,
    textureWidth: 224,
    textureHeight: 224,
    pointSize: 3.0,
  },
  medium: {
    count: 24_000,
    textureWidth: 160,
    textureHeight: 150,
    pointSize: 3.5,
  },
  low: {
    count: 8_064,
    textureWidth: 96,
    textureHeight: 84,
    pointSize: 4.0,
  },
  static: {
    count: 0,
    textureWidth: 0,
    textureHeight: 0,
    pointSize: 0,
  },
};

export const TEST_PARTICLE_FIXTURE: ParticleTierConfig = {
  count: 64,
  textureWidth: 8,
  textureHeight: 8,
  pointSize: 1.0,
};

export const ATMOSPHERE_CONFIG = {
  name: "GPU Particle Atmosphere",
  bounds: {
    x: 4.5,
    y: 3.2,
    z: 2.2,
  },
  simulation: {
    speed: 10.8, // curl acceleration in units/s^2
    curlScale: 0.55,
    damping: 0.965, // frame-decay reference
    dragPerSecond: 2.14, // continuous gamma drag in s^-1, equivalent to 0.965 at 60 Hz
    boundaryRestitution: 0.65, // coefficient of restitution on boundary reflection
    returnStrength: 0.48, // harmonic return acceleration in s^-2
    pointerRadius: 0.45,
    pointerStrength: 21.0, // pointer repulsion acceleration in units/s^2
  },
  colors: {
    cyan: "#57e6dd",
    violet: "#846cff",
    highlight: "#fff5ea",
    ambient: "#030405",
  },
} as const;
