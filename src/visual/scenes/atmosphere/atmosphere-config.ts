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

export const ATMOSPHERE_CONFIG = {
  name: "GPU Particle Atmosphere",
  bounds: {
    x: 4.5,
    y: 3.2,
    z: 2.2,
  },
  simulation: {
    speed: 0.18,
    curlScale: 0.55,
    damping: 0.965,
    returnStrength: 0.008,
    pointerRadius: 0.45,
    pointerStrength: 0.35,
  },
  colors: {
    cyan: "#9d84fc",
    violet: "#8b6ff9",
    highlight: "#fff5ea",
    ambient: "#030405",
  },
} as const;
