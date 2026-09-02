export const particleVertexShader = /* glsl */ `
uniform sampler2D uPositions;
uniform float uPointSize;
uniform float uDpr;

attribute vec2 aParticleUv;
attribute float aRandom;

varying float vEnergy;
varying float vDepth;
varying float vRandom;
varying vec3 vWorldPos;

void main() {
  vec4 posData = texture2D(uPositions, aParticleUv);
  vec3 particlePos = posData.xyz;
  vEnergy = posData.w;
  vRandom = aRandom;
  vWorldPos = particlePos;

  vec4 mvPosition = modelViewMatrix * vec4(particlePos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Depth attenuation: closer particles appear slightly larger with smooth falloff
  float depthScale = clamp(180.0 / max(-mvPosition.z, 0.5), 0.5, 3.5);
  gl_PointSize = uPointSize * uDpr * depthScale * (0.75 + aRandom * 0.5);

  vDepth = -mvPosition.z;
}
`;
