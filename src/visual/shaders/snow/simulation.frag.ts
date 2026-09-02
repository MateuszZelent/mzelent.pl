export const snowSimulationFragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uCurrentPosition;
uniform sampler2D uOriginalPosition;
uniform float uDeltaTime;
uniform float uTime;
uniform vec3 uBounds;
uniform float uFallSpeed;
uniform float uWindStrength;
uniform float uTurbulenceStrength;
uniform vec2 uPointerPos;
uniform vec2 uPointerVel;
uniform float uPointerActive;
uniform float uPointerRadius;
uniform float uPointerForce;

varying vec2 vUv;

// Simplex 3D noise for organic curl turbulence
vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  float n1 = snoise(vec3(p.x, p.y + e, p.z));
  float n2 = snoise(vec3(p.x, p.y - e, p.z));
  float n3 = snoise(vec3(p.x, p.y, p.z + e));
  float n4 = snoise(vec3(p.x, p.y, p.z - e));
  float n5 = snoise(vec3(p.x + e, p.y, p.z));
  float n6 = snoise(vec3(p.x - e, p.y, p.z));

  float x = (n3 - n4) - (n1 - n2);
  float y = (n5 - n6) - (n3 - n4);
  float z = (n1 - n2) - (n5 - n6);

  return normalize(vec3(x, y, z));
}

void main() {
  vec4 current = texture2D(uCurrentPosition, vUv);
  vec4 origin = texture2D(uOriginalPosition, vUv);

  vec3 pos = current.xyz;
  float seed = origin.w;
  float dt = min(uDeltaTime, 0.05);

  // Individual snowflake speed variation
  float speedFactor = 0.75 + 0.5 * seed;
  
  // Downward gravity fall
  float fall = uFallSpeed * speedFactor;

  // Horizontal wind drift + gentle harmonic sway
  float windX = sin(uTime * 0.35 + pos.y * 0.4 + seed * 6.28) * uWindStrength + uWindStrength * 0.3;
  float windZ = cos(uTime * 0.25 + pos.x * 0.3 + seed * 6.28) * (uWindStrength * 0.5);

  // 3D curl noise turbulence
  vec3 curl = curlNoise(pos * 0.35 + vec3(uTime * 0.1, uTime * 0.05, 0.0)) * uTurbulenceStrength;

  // Pointer wake deflection
  vec3 pointerForce = vec3(0.0);
  if (uPointerActive > 0.01) {
    vec2 pDiff = pos.xy - uPointerPos;
    float pDist = length(pDiff);
    if (pDist < uPointerRadius && pDist > 0.001) {
      float pFactor = 1.0 - smoothstep(0.0, uPointerRadius, pDist);
      vec2 pDir = pDiff / pDist;
      
      // Push force outwards from cursor (responsive repulsive air wake)
      vec2 push = pDir * (uPointerForce * pFactor * 2.6);
      
      // Swirling vortex wake from cursor movement velocity
      vec2 vortex = vec2(-uPointerVel.y, uPointerVel.x) * (uPointerForce * pFactor * 3.2);
      
      pointerForce.xy = (push + vortex) * uPointerActive;
    }
  }

  // Update position
  pos.x += (windX + curl.x + pointerForce.x) * dt;
  pos.y -= (fall - curl.y - pointerForce.y * 0.5) * dt;
  pos.z += (windZ + curl.z) * dt;

  // Wrap around boundaries
  // When snowflake falls below bottom boundary (-uBounds.y), respawn at top with stratified random X/Z
  if (pos.y < -uBounds.y) {
    pos.y = uBounds.y + fract(sin(seed * 91.345 + uTime * 1.2) * 43758.5453) * 0.4;
    pos.x = (fract(sin(seed * 157.123 + uTime * 0.8) * 23421.631) * 2.0 - 1.0) * uBounds.x;
    pos.z = -0.3 - fract(sin(seed * 289.456 + uTime * 0.5) * 65432.189) * 2.2;
  }

  // Horizontal edge wrap
  if (pos.x > uBounds.x) pos.x = -uBounds.x + 0.05;
  if (pos.x < -uBounds.x) pos.x = uBounds.x - 0.05;

  // Depth edge wrap: strictly confined behind the first mountain (z in [-2.6, -0.2])
  if (pos.z > -0.2) pos.z = -2.5;
  if (pos.z < -2.6) pos.z = -0.3;

  gl_FragColor = vec4(pos, seed);
}
`;
