import type { Talk } from "../schemas/talk.schema";

export const talksData: Talk[] = [
  {
    id: "dpg-2024",
    title: "Nonlinear spin-wave dynamics and reservoir computing in chiral nano-oscillators",
    event: "DPG Spring Meeting (Condensed Matter Physics)",
    location: "Berlin, Germany",
    date: "2024-03-20",
    type: "Contributed",
    abstract:
      "Investigation of non-stationary spin-torque auto-oscillators under MSCA 'CNMA' framework, highlighting high-harmonic generation and recurrent state dynamics for neuromorphic computing.",
  },
  {
    id: "intermag-2023",
    title: "Curvilinear skyrmionics: Guiding and pinning chiral solitons on non-planar surfaces",
    event: "IEEE International Magnetics Conference (INTERMAG 2023)",
    location: "Sendai, Japan",
    date: "2023-05-18",
    type: "Invited",
    abstract:
      "Invited presentation exploring how geometric curvature couples with DMI to enable pin-free skyrmion transport along designated curvilinear trajectories.",
  },
  {
    id: "solsky-2022",
    title: "Magnon optics in inhomogeneous ferromagnetic landscapes",
    event: "International Workshop on Topological Solitons & Skyrmionics",
    location: "Kraków, Poland",
    date: "2022-09-12",
    type: "Invited",
    abstract:
      "Overview of graded-index magnonic devices and the experimental realization of magnonic caustic beams.",
  },
  {
    id: "emma-2021",
    title: "Curved magnetic membranes for advanced spintronic functionalities",
    event: "European Conference on Magnetic Materials and Applications (EMMA)",
    location: "Madrid, Spain",
    date: "2021-09-08",
    type: "Contributed",
    abstract:
      "Theoretical framework describing geometry-induced chiral gauge fields and anisotropic exchange terms in flexible ferromagnetic nanotubes and nano-helices.",
  },
];
