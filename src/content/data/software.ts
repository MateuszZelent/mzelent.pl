import type { Software } from "../schemas/software.schema";

export const softwareData: Software[] = [
  {
    id: "mag-lens-sim",
    name: "MagLens",
    tagline: "Ray-tracing and wave-optics engine for graded-index magnonic media",
    description:
      "A high-performance numerical package designed to compute 2D and 3D spin-wave trajectories, ray equations, and wavefront evolutions across arbitrary spatial distributions of magnetic parameters.",
    role: "Lead Author & Maintainer",
    language: "Python / C++ / CUDA",
    technologies: ["NumPy", "SciPy", "CUDA", "Matplotlib", "HDF5"],
    repoUrl: "https://github.com/MateuszZelent/mag-lens-sim",
    docsUrl: "https://github.com/MateuszZelent/mag-lens-sim#readme",
    license: "MIT",
    featured: true,
    highlights: [
      "Exact Hamilton-Jacobi ray-tracing for dipolar-exchange spin waves",
      "GPU-accelerated wavefront synthesis in non-uniform landscapes",
      "Seamless integration with Mumax3 output files",
    ],
  },
  {
    id: "skyrmion-tracker-gpu",
    name: "SkyrmionTracker",
    tagline: "Real-time topological charge and centroid tracking for micromagnetic datasets",
    description:
      "Automated analysis toolkit for detecting, tracking, and characterizing topological solitons, skyrmion numbers, and gyrovector trajectories from large-scale continuum simulation outputs.",
    role: "Creator",
    language: "Python / OpenCL",
    technologies: ["PyOpenCL", "Numba", "Scikit-image"],
    repoUrl: "https://github.com/MateuszZelent/skyrmion-tracker-gpu",
    license: "GPL-3.0",
    featured: true,
    highlights: [
      "Discrete topological charge Q computation using Berg-Lüscher algorithm",
      "Sub-grid centroid resolution with Thiele equation parameter extraction",
      "Batch processing for multi-terabyte OVF2/VTK datasets",
    ],
  },
];
