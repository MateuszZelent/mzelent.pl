export const simulationFragmentShader = /* glsl */ `
uniform sampler2D uPositions;
uniform sampler2D uVelocities;
uniform sampler2D uInitialPositions;
uniform float uTime;
uniform float uDelta;
uniform vec3 uPointer; // x, y, active intensity [0..1]
uniform vec2 uPointerVelocity;
uniform vec3 uBounds;
uniform float uSpeed;
uniform float uCurlScale;
uniform float uDamping;
uniform float uReturnStrength;
uniform float uPointerRadius;
uniform float uPointerStrength;

varying vec2 vUv;

// Simplex-inspired 3D noise for divergence-free vector field advection
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Curl noise computes the curl of 3D potential
vec3 computeCurl(vec3 p) {
  float eps = 0.08;
  float n1 = snoise(vec3(p.x, p.y + eps, p.z));
  float n2 = snoise(vec3(p.x, p.y - eps, p.z));
  float n3 = snoise(vec3(p.x, p.y, p.z + eps));
  float n4 = snoise(vec3(p.x, p.y, p.z - eps));
  float n5 = snoise(vec3(p.x + eps, p.y, p.z));
  float n6 = snoise(vec3(p.x - eps, p.y, p.z));

  float x = (n1 - n2) - (n3 - n4);
  float y = (n3 - n4) - (n5 - n6);
  float z = (n5 - n6) - (n1 - n2);

  return normalize(vec3(x, y, z));
}

void main() {
  vec4 currentPos = texture2D(uPositions, vUv);
  vec4 currentVel = texture2D(uVelocities, vUv);
  vec4 initPos = texture2D(uInitialPositions, vUv);

  vec3 pos = currentPos.xyz;
  vec3 vel = currentVel.xyz;
  float energy = currentPos.w;

  // 1. Organic curl advection
  vec3 noiseCoord = pos * uCurlScale + vec3(0.0, 0.0, uTime * 0.12);
  vec3 curl = computeCurl(noiseCoord) * uSpeed;

  // 2. Magnetic confinement & soft return to initial distribution
  vec3 returnVec = initPos.xyz - pos;
  vec3 returnForce = returnVec * uReturnStrength;

  // 3. Pointer interaction force
  vec3 pointerForce = vec3(0.0);
  if (uPointer.z > 0.01) {
    vec2 toPointer = pos.xy - uPointer.xy;
    float dist = length(toPointer);
    if (dist < uPointerRadius) {
      float influence = smoothstep(uPointerRadius, 0.0, dist) * uPointer.z;
      vec2 pushDir = dist > 0.001 ? normalize(toPointer) : vec2(0.0, 1.0);
      
      // Radial push + tangential vortex swirl
      vec2 swirlDir = vec2(-pushDir.y, pushDir.x);
      pointerForce.xy = (pushDir * 0.7 + swirlDir * 0.3) * influence * uPointerStrength;
      pointerForce.z = (snoise(vec3(pos.xy * 2.0, uTime)) - 0.5) * influence * uPointerStrength * 0.5;

      // Pointer velocity drag
      pointerForce.xy += uPointerVelocity * influence * 0.5;

      // Boost energy/glow during interaction
      energy = clamp(energy + influence * 0.8, 0.0, 2.0);
    }
  }

  // Energy natural decay
  energy = mix(energy, 0.2, clamp(uDelta * 1.5, 0.0, 1.0));

  // Integrate velocity & position
  vel = (vel + (curl + returnForce + pointerForce) * uDelta) * uDamping;
  pos += vel * uDelta * 60.0;

  // Soft boundary reflection
  if (abs(pos.x) > uBounds.x) { pos.x = sign(pos.x) * uBounds.x; vel.x *= -0.5; }
  if (abs(pos.y) > uBounds.y) { pos.y = sign(pos.y) * uBounds.y; vel.y *= -0.5; }
  if (abs(pos.z) > uBounds.z) { pos.z = sign(pos.z) * uBounds.z; vel.z *= -0.5; }

  // Output new position (xyz) and energy (w)
  gl_FragColor = vec4(pos, energy);
}
`;
