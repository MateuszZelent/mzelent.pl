export const snowParticleVertexShader = /* glsl */ `
precision highp float;

uniform sampler2D uPositionTexture;
uniform float uBaseSize;
uniform float uPixelRatio;

varying float vSeed;
varying float vDepth;
varying vec3 vWorldPos;

void main() {
  vec4 data = texture2D(uPositionTexture, position.xy);
  vec3 particlePos = data.xyz;
  vSeed = data.w;
  vWorldPos = particlePos;

  vec4 mvPosition = modelViewMatrix * vec4(particlePos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Depth attenuation for crisp, sparkling micro-snowflakes
  float depth = -mvPosition.z;
  vDepth = depth;
  
  // Point size calculation with seed variation: delicate, crystalline micro-flakes
  float size = uBaseSize * (0.7 + 0.5 * vSeed);
  gl_PointSize = size * (160.0 / max(depth, 1.0)) * uPixelRatio;
  gl_PointSize = clamp(gl_PointSize, 1.0, 5.5);
}
`;
