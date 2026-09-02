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

  // Soft Gaussian micro-point core
  float core = exp(-dist * dist * 24.0);
  float halo = exp(-dist * dist * 8.0) * 0.3;
  float shape = core + halo;

  // Gentle depth fade
  float depthFade = smoothstep(0.5, 1.2, vDepth) * (1.0 - smoothstep(5.0, 9.0, vDepth));
  
  // Natural subtle cold-white crystalline tone
  vec3 snowColor = mix(vec3(0.94, 0.97, 1.0), vec3(1.0, 1.0, 1.0), vSeed);

  // Discrete, delicate opacity
  float alpha = shape * (0.35 + 0.35 * vSeed) * depthFade;
  
  if (alpha < 0.01) {
    discard;
  }

  gl_FragColor = vec4(snowColor, alpha);
}
`;
