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
  
  // Point size calculation with seed variation
  float size = uBaseSize * (0.8 + 0.6 * vSeed);
  gl_PointSize = size * (260.0 / max(depth, 0.5)) * uPixelRatio;
  gl_PointSize = clamp(gl_PointSize, 2.0, 14.0);
}
`;
