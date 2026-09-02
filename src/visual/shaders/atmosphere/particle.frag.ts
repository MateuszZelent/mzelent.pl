export const particleFragmentShader = /* glsl */ `
uniform vec3 uColorCyan;
uniform vec3 uColorViolet;
uniform vec3 uColorHighlight;

varying float vEnergy;
varying float vDepth;
varying float vRandom;
varying vec3 vWorldPos;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);

  if (dist > 0.5) {
    discard;
  }

  // Soft Gaussian radial profile
  float radialAlpha = exp(-dist * dist * 12.0) * smoothstep(0.5, 0.15, dist);

  // Gradient choreography: blend between deep cyan and magnetic violet based on spatial coordinates
  float mixFactor = clamp((vWorldPos.x * 0.25) + 0.5 + (vRandom * 0.2 - 0.1), 0.0, 1.0);
  vec3 baseColor = mix(uColorCyan, uColorViolet, mixFactor);

  // Interaction excitation adds warm highlights
  vec3 finalColor = mix(baseColor, uColorHighlight, clamp((vEnergy - 0.2) * 0.8, 0.0, 1.0));

  // Depth attenuation on overall opacity
  float depthFade = clamp(1.0 - (vDepth - 3.0) * 0.2, 0.2, 1.0);
  float finalAlpha = radialAlpha * (0.35 + vEnergy * 0.45) * depthFade;

  gl_FragColor = vec4(finalColor, finalAlpha);
}
`;
