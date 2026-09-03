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
