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

/**
 * Exact continuous scientific colormap matching Dr. Mateusz Zelent's publication figures
 * (e.g. Zelent et al., Phys. Rev. B / Phys. Status Solidi RRL / Nano Letters):
 *   mz = -1.0  ->  Deep Cobalt Blue (core singularity pointing -z)
 *   mz = -0.5  ->  Bright Cyan / Turquoise
 *   mz =  0.0  ->  Vivid Emerald Green (in-plane domain wall transition)
 *   mz = +0.5  ->  Amber / Golden Orange
 *   mz = +1.0  ->  Crimson Pink / Magenta (perpendicular background pointing +z)
 */
export function zelentPublicationRgb(mz: number): [number, number, number] {
  const t = Math.max(0.0, Math.min(1.0, (mz + 1.0) * 0.5));
  let r = 0;
  let g = 0;
  let b = 0;
  if (t < 0.25) {
    const k = t / 0.25;
    r = 0.05;
    g = 0.15 + (0.82 - 0.15) * k;
    b = 0.85;
  } else if (t < 0.5) {
    const k = (t - 0.25) / 0.25;
    r = 0.05 + (0.15 - 0.05) * k;
    g = 0.82 + (0.85 - 0.82) * k;
    b = 0.85 - (0.85 - 0.2) * k;
  } else if (t < 0.75) {
    const k = (t - 0.5) / 0.25;
    r = 0.15 + (0.95 - 0.15) * k;
    g = 0.85 - (0.85 - 0.65) * k;
    b = 0.2 - (0.2 - 0.08) * k;
  } else {
    const k = (t - 0.75) / 0.25;
    r = 0.95 - (0.95 - 0.92) * k;
    g = 0.65 - (0.65 - 0.12) * k;
    b = 0.08 + (0.48 - 0.08) * k;
  }
  return [r, g, b];
}

export interface PolarArrowCoord {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly phi: number;
}

/**
 * Generate concentric polar rings of arrow positions matching authentic micromagnetic publications
 * (Dr. Mateusz Zelent's PRB/RRL figures with clearly resolved vector swirl).
 */
export function generatePolarArrowPositions(
  ringCount: number = 7,
  maxRadius: number = 2.15,
): PolarArrowCoord[] {
  const coords: PolarArrowCoord[] = [];
  // Central core arrow at (0, 0)
  coords.push({ x: 0, y: 0, r: 0, phi: 0 });

  // Concentric ring counts designed for optimal vector legibility
  const counts = [6, 12, 16, 20, 24, 28, 32];

  for (let rIdx = 1; rIdx <= ringCount; rIdx++) {
    // Non-linear power distribution ensuring dense sampling across the domain wall
    const frac = rIdx / ringCount;
    const r = Math.pow(frac, 0.94) * maxRadius;
    const countInRing = counts[rIdx - 1] ?? Math.round(5 * rIdx);

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
