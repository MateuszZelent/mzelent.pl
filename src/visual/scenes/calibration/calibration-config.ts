export const CALIBRATION_CONFIG = {
  name: "Calibration Scene",
  coreRadius: 1.2,
  coreDetail: 2, // Icosahedron detail level (~320 triangles)
  ringOuterRadius: 2.1,
  ringTubeRadius: 0.015,
  ringSegments: 64,
  drawCallBudget: 5,
  triangleBudget: 50_000,
  colors: {
    core: "#0d1b22",
    accentCyan: "#57e6dd",
    accentViolet: "#846cff",
    ambient: "#030405",
  },
} as const;
