import type { ResearchDomain } from "../schemas/research-domain.schema";

export const researchDomainsData: ResearchDomain[] = [
  {
    id: "topological-solitons",
    index: "01",
    title: "Topological Solitons & Chiral Skyrmions",
    shortTitle: "Topological Solitons",
    tagline: "Stabilization, dynamics, and pin-free motion of nanoscale chiral spin textures",
    description:
      "Investigating the topological protection and current-driven dynamics of magnetic skyrmions, biskyrmions, and chiral domain walls in multilayer thin films with Dzyaloshinskii-Moriya interactions.",
    keyConcepts: [
      "Dzyaloshinskii-Moriya Interaction (DMI)",
      "Skyrmion Hall Effect Mitigation",
      "Topological Charge Q = ±1",
      "Nanoscale Confinement & Edge Repulsion",
    ],
    equationsOrNotation: ["E_DMI = -D · (m × (∇ × m))", "Q = (1 / 4π) ∫ m · (∂_x m × ∂_y m) dx dy"],
    colorAccent: "cyan",
  },
  {
    id: "spin-wave-optics",
    index: "02",
    title: "Spin-Wave Optics & Graded Magnonics",
    shortTitle: "Spin-Wave Optics",
    tagline: "Waveguide design, Snell's law refraction, and nonlinear interference of magnons",
    description:
      "Developing magnonic analogs of optical components: graded-index lenses, spin-wave interferometers, and frequency multiplexers operating in the GHz-THz regimes with zero Joule heating.",
    keyConcepts: [
      "Graded Index Magnonics (GRIM)",
      "Snell-Descartes Law for Spin Waves",
      "Caustic Beam Formation",
      "Magnonic Crystals & Bandgap Engineering",
    ],
    equationsOrNotation: ["n(x, y) = k(x, y) / k_0", "∂m/∂t = -γ (m × H_eff) + α (m × ∂m/∂t)"],
    colorAccent: "violet",
  },
  {
    id: "gpu-vector-fields",
    index: "03",
    title: "GPU Vector Fields & High-Performance Solvers",
    shortTitle: "GPU Vector Fields",
    tagline: "Accelerated finite-difference and micromagnetic continuum simulations",
    description:
      "Building high-throughput numerical modeling tools to solve the Landau-Lifshitz-Gilbert equation across complex 3D meshes with exact long-range demagnetizing tensor calculations.",
    keyConcepts: [
      "Landau-Lifshitz-Gilbert (LLG) Integration",
      "FFT-Accelerated Demagnetizing Field",
      "Adaptive Mesh Refinement",
      "Massively Parallel GPU Kernels",
    ],
    equationsOrNotation: ["H_demag = -N * M", "CUDA / WebGL2 Parallel Reduction"],
    colorAccent: "cyan",
  },
];
