import * as THREE from "three";

import type { QualityProfile } from "../quality/quality-contract";

export interface WebGLRendererParameters {
  alpha: boolean;
  antialias: boolean;
  depth: boolean;
  stencil: boolean;
  preserveDrawingBuffer: boolean;
  powerPreference: WebGLPowerPreference;
}

export function createRendererParameters(profile: QualityProfile): WebGLRendererParameters {
  return {
    alpha: true,
    antialias: profile.antialias,
    depth: true,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: profile.powerPreference,
  };
}

export function configureRenderer(gl: THREE.WebGLRenderer): void {
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.0;
  gl.setClearColor(0x000000, 0);
  gl.shadowMap.enabled = false;
}
