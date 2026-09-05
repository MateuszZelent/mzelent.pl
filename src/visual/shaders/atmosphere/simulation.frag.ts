export const simulationFragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uPositions;
uniform sampler2D uVelocities;
uniform float uTime;
uniform float uDelta;
uniform vec3 uPointer; // x, y, active intensity [0..1]
uniform vec3 uBounds;
uniform float uPointerRadius;

varying vec2 vUv;

void main() {
  vec4 currentPos = texture2D(uPositions, vUv);

  // Non-positive delta must leave state unchanged
  if (uDelta <= 0.0) {
    gl_FragColor = currentPos;
    return;
  }

  vec4 currentVel = texture2D(uVelocities, vUv);

  vec3 pos = currentPos.xyz;
  vec3 vel = currentVel.xyz;
  float energy = currentPos.w;

  // 1. Stateful inertial position integration (dt in seconds, no frame-rate multiplier)
  pos += vel * uDelta;

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
  energy = clamp(energy + speed * 0.003, 0.0, 2.0);

  // Natural energy dissipation with frame-rate invariant exponential decay
  energy = 0.2 + (energy - 0.2) * exp(-1.5 * uDelta);

  // 3. Boundary containment: clamp slightly inward so particles never get stuck on the wall
  const float eps = 0.002;
  pos.x = clamp(pos.x, -uBounds.x + eps, uBounds.x - eps);
  pos.y = clamp(pos.y, -uBounds.y + eps, uBounds.y - eps);
  pos.z = clamp(pos.z, -uBounds.z + eps, uBounds.z - eps);

  // Guarantee finite values
  if (isnan(pos.x) || isnan(pos.y) || isnan(pos.z) || isinf(pos.x) || isinf(pos.y) || isinf(pos.z) || isnan(energy)) {
    pos = vec3(0.0);
    energy = 0.2;
  }

  // Output updated position (xyz) and energy (w)
  gl_FragColor = vec4(pos, energy);
}
`;
