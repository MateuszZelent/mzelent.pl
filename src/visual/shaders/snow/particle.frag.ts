export const snowParticleFragmentShader = /* glsl */ `
precision highp float;

varying float vSeed;
varying float vDepth;
varying vec3 vWorldPos;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) {
    discard;
  }

  // Soft Gaussian point shape with brighter core
  float core = exp(-dist * dist * 18.0);
  float halo = exp(-dist * dist * 6.0) * 0.4;
  float shape = core + halo;

  // Depth fade (soften distant and very close particles)
  float depthFade = smoothstep(0.5, 1.5, vDepth) * (1.0 - smoothstep(6.0, 10.0, vDepth));
  
  // Natural snowflake crystalline coloring (soft pure white with subtle cold tint)
  vec3 snowColor = mix(vec3(0.92, 0.96, 1.0), vec3(1.0, 1.0, 1.0), vSeed);

  float alpha = shape * (0.65 + 0.35 * vSeed) * depthFade;
  
  if (alpha < 0.01) {
    discard;
  }

  gl_FragColor = vec4(snowColor, alpha);
}
`;
