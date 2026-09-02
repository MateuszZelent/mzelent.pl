export const simulationFragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uPositions;
uniform sampler2D uVelocities;
uniform sampler2D uInitialPositions;
uniform float uTime;
uniform float uDelta;
uniform vec3 uPointer; // x, y, active intensity [0..1]
uniform vec3 uBounds;
uniform float uPointerRadius;

varying vec2 vUv;

void main() {
  vec4 currentPos = texture2D(uPositions, vUv);
  vec4 currentVel = texture2D(uVelocities, vUv);
  vec4 initPos = texture2D(uInitialPositions, vUv);

  vec3 pos = currentPos.xyz;
  vec3 vel = currentVel.xyz;
  float energy = currentPos.w;

  // 1. Position integration from physical velocity vector
  pos += vel * uDelta * 60.0;

  // 2. Interaction energy boost
  if (uPointer.z > 0.01) {
    float dist = length(pos.xy - uPointer.xy);
    if (dist < uPointerRadius) {
      float influence = smoothstep(uPointerRadius, 0.0, dist) * uPointer.z;
      energy = clamp(energy + influence * 0.8, 0.0, 2.0);
    }
  }

  // Energy excitation from velocity speed
  float speed = length(vel);
  energy = clamp(energy + speed * 0.15, 0.0, 2.0);

  // Natural energy dissipation
  energy = mix(energy, 0.2, clamp(uDelta * 1.5, 0.0, 1.0));

  // 3. Soft boundary containment with soft harmonic clamp
  if (abs(pos.x) > uBounds.x) { pos.x = sign(pos.x) * uBounds.x; }
  if (abs(pos.y) > uBounds.y) { pos.y = sign(pos.y) * uBounds.y; }
  if (abs(pos.z) > uBounds.z) { pos.z = sign(pos.z) * uBounds.z; }

  // Output updated position (xyz) and energy (w)
  gl_FragColor = vec4(pos, energy);
}
`;
