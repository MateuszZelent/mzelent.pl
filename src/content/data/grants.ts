import type { Grant } from "../schemas/grant.schema";

export const grantsData: Grant[] = [
  {
    id: "ncn-sonata-2023",
    title: "Chiral and Curvilinear Effects in Nanoscale Magnonics",
    funder: "National Science Centre (NCN Poland)",
    program: "SONATA",
    grantNumber: "2022/47/D/ST3/01234",
    role: "Principal Investigator",
    startYear: 2023,
    endYear: 2026,
    status: "Active",
    description:
      "Investigation of non-Euclidean geometric effects on chiral spin textures and the steering of short-wavelength spin waves in 3D nano-architectures.",
    budget: "PLN 1,240,000",
  },
  {
    id: "ncn-opus-2020",
    title: "Wave Phenomena in Graded Magnonic Media",
    funder: "National Science Centre (NCN Poland)",
    program: "OPUS",
    grantNumber: "2019/35/B/ST3/03874",
    role: "Key Researcher",
    startYear: 2020,
    endYear: 2024,
    status: "Completed",
    description:
      "Theoretical framework and computational validation of graded refractive index landscapes for analog computing and low-loss spin-wave transport.",
  },
];
