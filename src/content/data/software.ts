import type { Software } from "../schemas/software.schema";

export const softwareData: Software[] = [
  {
    id: "mmpp",
    name: "MMPP",
    tagline: "High-performance Python library, CLI, and TUI for micromagnetic simulation analysis",
    description:
      "Micro Magnetic Post Processing (MMPP) is a comprehensive computational platform engineered to process multi-dimensional simulation outputs from Mumax3, OOMMF, and custom solvers. Features lazy Zarr/HDF5 evaluation, 1D/2D FFT dispersion relations, spatial eigenmode extraction, topological soliton/skyrmion tracking, nonlinear Thiele vortex dynamics, and automated SLURM batch execution.",
    role: "Lead Author & Core Developer",
    language: "Python",
    technologies: [
      "Python 3.9+",
      "Zarr",
      "HDF5",
      "NumPy",
      "SciPy",
      "Matplotlib",
      "Textual (TUI)",
      "Rich",
      "Numba",
    ],
    repoUrl: "https://github.com/MateuszZelent/mmpp",
    docsUrl: "https://github.com/MateuszZelent/mmpp#readme",
    license: "MIT",
    featured: true,
    highlights: [
      "Lazy multi-dimensional array access with spatial slicing and axis-aware downsampling on massive Zarr archives",
      "Automated 1D & 2D FFT dispersion relations f(k), spatial mode profiles, and wave transmission spectra",
      "Topological soliton & skyrmion tracking using Berg-Lüscher topological charge Q and nonlinear Thiele equation dynamics",
      "Interactive Terminal User Interface (mmpp-tui) and SLURM HPC cluster simulation sweep dispatcher",
    ],
    quickstart: `# Install from GitHub repository
pip install git+https://github.com/MateuszZelent/mmpp.git

# Or launch the interactive Terminal User Interface
mmpp-tui

# Python API: inspect simulation and compute dispersion
import mmpp as mp
jobs = mp.open("./simulation_data")
res = jobs.find(PBCx=1, PBCy=1)[0]
spec = res.fft.spectrum()
spec.plot.modes(freq=9.5)`,
  },
  {
    id: "mmpp-gui",
    name: "MMPP GUI",
    tagline: "Interactive desktop graphical workbench for micromagnetic post-processing",
    description:
      "A desktop graphical workbench built directly on top of the MMPP core engine. Designed for intuitive, scriptless exploration of 2D/3D magnetization fields, dynamic hysteresis loops, fast Fourier transform mode visualizations, and topological structure verification.",
    role: "Creator & Lead Developer",
    language: "Python / Qt",
    technologies: ["Python", "PyQt / PySide", "MMPP Core", "Matplotlib", "NumPy", "Zarr"],
    repoUrl: "https://github.com/MateuszZelent/MMPP_GUI",
    docsUrl: "https://github.com/MateuszZelent/MMPP_GUI#readme",
    license: "GPL-3.0",
    featured: true,
    highlights: [
      "Graphical workbench for inspecting Mumax3 and OOMMF simulation output files without writing code",
      "Real-time magnetization vector field slicing and perceptual colormaps (HSL cone, diverging colormaps)",
      "Interactive hysteresis loop metrics extractor: coercivity Hc, remanence Mr, and loop area calculations",
      "Visual export to high-resolution publication figures and multi-frame vector animations",
    ],
    quickstart: `# Clone and install desktop requirements
git clone https://github.com/MateuszZelent/MMPP_GUI.git
cd MMPP_GUI && pip install -r requirements.txt

# Launch GUI workbench
python main.py`,
  },
  {
    id: "pyzfn",
    name: "pyzfn",
    tagline: "Fast binary OVF2 parser and zero-flux Neumann boundary converter",
    description:
      "A specialized parsing and conversion engine for micromagnetic continuum simulation data. Implements zero-flux Neumann (ZFN) boundary condition transformations, provides high-speed binary OVF2 decoders, and seamlessly streams solver outputs into modern Python array stores.",
    role: "Author & Maintainer",
    language: "Python",
    technologies: ["Python", "NumPy", "OVF2", "Zarr", "SciPy", "Cython"],
    repoUrl: "https://github.com/MateuszZelent/pyzfn",
    docsUrl: "https://github.com/MateuszZelent/pyzfn#readme",
    license: "GPL-3.0",
    featured: true,
    highlights: [
      "High-speed streaming parser for multi-gigabyte binary OVF/OVF2 simulation snapshots",
      "Exact zero-flux Neumann boundary interpolation for arbitrary finite-difference grids",
      "Direct array serialization into compressed Zarr and HDF5 archives for downstream MMPP analysis",
    ],
    quickstart: `# Install pyzfn
pip install git+https://github.com/MateuszZelent/pyzfn.git

# Parse and convert Mumax3 OVF binary data
import pyzfn
data = pyzfn.read_ovf("m_ground_state.ovf")
print("Magnetization shape:", data.shape)`,
  },
  {
    id: "amumax",
    name: "AMUMax / MuMax+",
    tagline: "Custom GPU micromagnetic solver fork with magnetoelastic and graded-media capabilities",
    description:
      "An extended GPU-accelerated micromagnetic simulation suite based on Mumax3, tailored for research at Adam Mickiewicz University. Integrates custom CUDA kernels for graded magnetic anisotropy, spatial saturation magnetization gradients, and coupled magnetoelastic dynamics.",
    role: "Maintainer & Research Developer",
    language: "Go / CUDA",
    technologies: ["CUDA", "Go", "NVIDIA GPUs", "OpenCL", "FDTD"],
    repoUrl: "https://github.com/MateuszZelent/amumax",
    license: "GPL-3.0",
    featured: true,
    highlights: [
      "FDTD micromagnetic solver with custom Hamiltonian terms for graded refractive index profiles",
      "GPU-accelerated magnetoelastic coupling kernels for acoustic and spin-wave interactions",
      "Optimized for automated execution on Slurm-managed GPU cluster nodes",
    ],
    quickstart: `# Build custom solver on CUDA Linux workstation
git clone https://github.com/MateuszZelent/amumax.git
cd amumax && make

# Execute simulation on GPU
./amumax -gpu 0 graded_spinwave_lens.mx3`,
  },
  {
    id: "spinview",
    name: "SpinView",
    tagline: "Interactive 3D visual analysis tool for multi-scale computational magnetism",
    description:
      "An OpenGL-accelerated desktop visualization tool designed for intuitive 3D spatial exploration of non-collinear spin textures, skyrmion lattices, magnetic hopfions, and vortex dynamics in thin films and nanodots.",
    role: "Contributor & Co-Author",
    language: "Python / OpenGL",
    technologies: ["Python", "OpenGL", "VisPy", "PyQt", "NumPy"],
    repoUrl: "https://github.com/MateuszZelent/SpinView",
    license: "GPL-3.0",
    featured: false,
    highlights: [
      "Real-time 3D vector glyph and isosurface rendering with GPU shaders",
      "Interactive topological defect localization and core trajectory tracking",
      "High-resolution raymarched animation export for scientific presentations",
    ],
    quickstart: `# Clone and launch SpinView visualizer
git clone https://github.com/MateuszZelent/SpinView.git
cd SpinView && pip install -r requirements.txt
python spinview.py`,
  },
  {
    id: "mannga",
    name: "MANNGA",
    tagline: "Deep learning framework for predicting and accelerating spin-wave scattering in magnonic media",
    description:
      "A machine learning architecture leveraging physics-informed neural networks to predict spin-wave scattering matrices (S-parameters), phase shifts, and wavefront steering across complex magnonic junction designs without running full micromagnetic FDTD integrations.",
    role: "Lead Researcher & Developer",
    language: "Python / PyTorch",
    technologies: ["PyTorch", "Python", "Mumax3", "MMPP", "SciPy"],
    repoUrl: "https://github.com/MateuszZelent/MANNGA-Spin-Wave-Scattering",
    license: "MIT",
    featured: false,
    highlights: [
      "Deep neural surrogate models delivering 1000x acceleration over full FDTD simulations",
      "Predicts spin-wave transmission, reflection, and phase across non-uniform magnetic landscapes",
      "Integrated dataset generation pipeline coupling Mumax3 with MMPP spectral extraction",
    ],
    quickstart: `# Clone neural scattering engine
git clone https://github.com/MateuszZelent/MANNGA-Spin-Wave-Scattering.git
cd MANNGA-Spin-Wave-Scattering && pip install -r requirements.txt

# Run model evaluation
python evaluate.py --checkpoint weights/best_model.pt`,
  },
];
