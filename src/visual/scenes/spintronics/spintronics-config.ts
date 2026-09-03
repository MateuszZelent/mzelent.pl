import type { QualityTier } from "../../quality/quality-contract";

export interface SpintronicsTierConfig {
  readonly gridResolution: number; // Mesh divisions (e.g. 128 for 128x128 vertices)
  readonly vectorDensity: number; // Arrow count per dimension (e.g. 32 for 1024 arrows)
  readonly enableShadows: boolean;
  readonly enableVectorArrows: boolean;
}

export const SPINTRONICS_TIER_CONFIGS: Record<QualityTier, SpintronicsTierConfig> = {
  high: {
    gridResolution: 128,
    vectorDensity: 28,
    enableShadows: true,
    enableVectorArrows: true,
  },
  medium: {
    gridResolution: 96,
    vectorDensity: 22,
    enableShadows: false,
    enableVectorArrows: true,
  },
  low: {
    gridResolution: 64,
    vectorDensity: 16,
    enableShadows: false,
    enableVectorArrows: true,
  },
  static: {
    gridResolution: 32,
    vectorDensity: 8,
    enableShadows: false,
    enableVectorArrows: false,
  },
};

/**
 * Theoretical spintronic physics parameters derived from Dr. Mateusz Zelent's research papers.
 */
export const SPINTRONICS_THEORY = {
  exchangeConstantA: 1.3e-11, // J/m
  saturationMagnetizationMs: 8.0e5, // A/m
  effectiveGilbertDampingAlpha: 0.008,
  interfacialDmiD: 1.8e-3, // J/m²
  uniaxialAnisotropyKu: 5.0e5, // J/m³
  exchangeLengthLex: 5.7, // nm (sqrt(2A / (mu0 * Ms^2)))
  gyromagneticRatioGamma: 1.76e11, // rad/(s*T)
};

export const PRESET_DESCRIPTIONS = {
  "skyrmion-neel": {
    name: "Interfacial Néel Skyrmion",
    topology: "Q = -1",
    mechanism: "Interfacial Dzyaloshinskii-Moriya Interaction (iDMI)",
    equation: "\\mathbf{m}(r, \\phi) = (\\sin\\Theta\\cos\\phi, \\sin\\Theta\\sin\\phi, \\cos\\Theta)",
    description:
      "Chiral topological skyrmion with radial hedgehog vector swirl stabilized by broken inversion symmetry at heavy-metal / ferromagnet interfaces (e.g., Pt/Co/AlOx).",
  },
  "skyrmion-bloch": {
    name: "Bulk Bloch Skyrmion",
    topology: "Q = -1",
    mechanism: "Bulk Dzyaloshinskii-Moriya Interaction (B20 structures)",
    equation: "\\mathbf{m}(r, \\phi) = (-\\sin\\Theta\\sin\\phi, \\sin\\Theta\\cos\\phi, \\cos\\Theta)",
    description:
      "Vortex-like tangential chirality typical of non-centrosymmetric crystals (MnSi, FeGe) with continuous vector curl around the skyrmion center.",
  },
  vortex: {
    name: "Magnetic Vortex Nanodisk",
    topology: "Q = +1/2",
    mechanism: "Geometrical Dipolar Demagnetization",
    equation: "\\mathbf{m}(r, \\phi) = (-c\\sin\\phi, c\\cos\\phi, p\\sqrt{1-r^2/R_c^2})",
    description:
      "In-plane flux-closure circulation with a sub-10 nm vertical core singularity, fundamental for spin-torque auto-oscillators and neuromorphic nodes.",
  },
  "spin-wave": {
    name: "Propagating Curvilinear Spin Waves",
    topology: "Continuum Dynamics",
    mechanism: "Dynamic Dipolar-Exchange Dispersion",
    equation:
      "\\omega^2 = (\\omega_0 + \\omega_M \\lambda_{\\text{ex}}^2 k^2)(\\omega_0 + \\omega_M \\lambda_{\\text{ex}}^2 k^2 + \\omega_M \\sin^2\\theta_k)",
    description:
      "High-frequency coherent magnonic excitations travelling across a curved magnetic film, guided by curvature-induced effective gauge fields.",
  },
  "caustic-lens": {
    name: "Caustic Spin-Wave Lens",
    topology: "Wavepacket Refraction",
    mechanism: "Curvature & Thickness Modulation Lens",
    equation:
      "I(x, y) = |\\int A(\\mathbf{k}) e^{i(\\mathbf{k}\\cdot\\mathbf{r} - \\omega t)} d\\mathbf{k}|^2",
    description:
      "Diffraction-limited focusing of exchange-dominated spin waves into high-intensity sub-micron caustic beams for low-power magnonic computing.",
  },
} as const;

/**
 * Converts HSL color space to RGB using the exact algorithm from MateuszZelent/mmpp:
 * https://github.com/MateuszZelent/mmpp/blob/main/mmpp/plotting.py
 *
 * @param h Hue in [0, 1] (or degree / 360)
 * @param s Saturation in [0, 1]
 * @param l Lightness in [0, 1]
 * @returns [r, g, b] with each component in [0, 1]
 */
export function hsl2rgb(h: number, s: number, l: number): [number, number, number] {
  const hDeg = (((h % 1) + 1) % 1) * 360.0;
  const rgb: [number, number, number] = [0, 0, 0];
  const ns = [0, 8, 4];
  for (let i = 0; i < 3; i++) {
    const k = (ns[i] + hDeg / 30.0) % 12.0;
    const a = s * Math.min(l, 1.0 - l);
    const kVal = Math.max(-1.0, Math.min(1.0, Math.min(k - 3.0, 9.0 - k)));
    rgb[i] = Math.max(0.0, Math.min(1.0, l - a * kVal));
  }
  return rgb;
}

export interface PolarArrowCoord {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly phi: number;
}

/**
 * Generate concentric polar rings of arrow positions matching authentic micromagnetic publications.
 */
export function generatePolarArrowPositions(
  ringCount: number = 8,
  maxRadius: number = 2.1,
): PolarArrowCoord[] {
  const coords: PolarArrowCoord[] = [];
  // Center arrow at (0,0)
  coords.push({ x: 0, y: 0, r: 0, phi: 0 });

  for (let rIdx = 1; rIdx <= ringCount; rIdx++) {
    const r = (rIdx / ringCount) * maxRadius;
    const countInRing = Math.round(6 * rIdx);
    for (let aIdx = 0; aIdx < countInRing; aIdx++) {
      const phi = (2 * Math.PI * aIdx) / countInRing;
      coords.push({
        x: r * Math.cos(phi),
        y: r * Math.sin(phi),
        r,
        phi,
      });
    }
  }
  return coords;
}
