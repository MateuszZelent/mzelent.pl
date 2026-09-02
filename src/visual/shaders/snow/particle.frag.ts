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

  // Soft Gaussian micro-point core with crystalline glint
  float core = exp(-dist * dist * 18.0);
  float halo = exp(-dist * dist * 6.0) * 0.4;
  float shape = core + halo;

  // Gentle depth fade: visible across entire mountain sky depth range
  float depthFade = smoothstep(0.2, 1.0, vDepth) * (1.0 - smoothstep(7.5, 12.0, vDepth));
  
  // Natural subtle cold-white crystalline tone
  vec3 snowColor = mix(vec3(0.92, 0.96, 1.0), vec3(1.0, 1.0, 1.0), vSeed);

  // Discrete, delicate opacity with visible crystalline brilliance
  float alpha = shape * (0.85 + 0.15 * vSeed) * depthFade;
  
  if (alpha < 0.01) {
    discard;
  }

  gl_FragColor = vec4(snowColor, alpha);
}
`;
