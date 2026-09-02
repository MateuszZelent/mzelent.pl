import type { Talk } from "../schemas/talk.schema";

export const talksData: Talk[] = [
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
];
