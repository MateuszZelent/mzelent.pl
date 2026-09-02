export const snowParticleVertexShader = /* glsl */ `
precision highp float;

uniform sampler2D uPositionTexture;
uniform float uBaseSize;
uniform float uPixelRatio;

varying float vSeed;
varying float vDepth;
varying vec3 vWorldPos;

void main() {
  // position.xy contains the normalized UV coordinate in the FBO texture
  vec4 data = texture2D(uPositionTexture, position.xy);
  vec3 particlePos = data.xyz;
  vSeed = data.w;
  vWorldPos = particlePos;

  vec4 mvPosition = modelViewMatrix * vec4(particlePos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Depth attenuation for snowflake size
  float depth = -mvPosition.z;
  vDepth = depth;
  
  // Variable snowflake size based on seed and perspective
  float size = uBaseSize * (0.8 + 0.6 * vSeed);
  gl_PointSize = size * (250.0 / max(depth, 0.5)) * uPixelRatio;
  gl_PointSize = clamp(gl_PointSize, 1.0, 36.0);
}
`;
