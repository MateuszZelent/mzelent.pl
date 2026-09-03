export const spintronicsFragmentShader = /* glsl */ `
uniform float uTime;
uniform int uMode; // 0: neel, 1: bloch, 2: vortex, 3: spin-wave, 4: caustic-lens
uniform int uColorMap; // 0: zelent-prb, 1: hsl-cone, 2: racetrack, 3: chiral, 4: topological, 5: magnetization
uniform float uMagneticField; // mT
uniform float uDmiStrength; // mJ/m²

varying vec2 vUv;
varying vec2 vLocalPos;
varying vec3 vWorldPosition;
varying vec3 vNormalVec;
varying float vElevation;
varying float vDistCenter;
varying vec3 vMagVector;

// Continuous scientific colormap matching Dr. Mateusz Zelent's publications
// (Zelent et al., Phys. Rev. B / Phys. Status Solidi RRL / Nano Letters):
//   mz = -1.0  ->  Deep Cobalt Blue (core singularity pointing -z)
//   mz = -0.5  ->  Bright Cyan / Turquoise
//   mz =  0.0  ->  Vivid Emerald Green (in-plane domain wall transition)
//   mz = +0.5  ->  Amber / Golden Orange
//   mz = +1.0  ->  Crimson Pink / Magenta (perpendicular background pointing +z)
vec3 zelentPublicationColormap(float mz) {
  float t = clamp((mz + 1.0) * 0.5, 0.0, 1.0);
  vec3 c;
  if (t < 0.25) {
    float k = t / 0.25;
    c = mix(vec3(0.05, 0.15, 0.88), vec3(0.04, 0.85, 0.88), k);
  } else if (t < 0.50) {
    float k = (t - 0.25) / 0.25;
    c = mix(vec3(0.04, 0.85, 0.88), vec3(0.18, 0.88, 0.22), k);
  } else if (t < 0.75) {
    float k = (t - 0.50) / 0.25;
    c = mix(vec3(0.18, 0.88, 0.22), vec3(0.96, 0.65, 0.08), k);
  } else {
    float k = (t - 0.75) / 0.25;
    c = mix(vec3(0.96, 0.65, 0.08), vec3(0.92, 0.14, 0.52), k);
  }
  return c;
}

// Exact HSL to RGB conversion from MateuszZelent/mmpp
vec3 hsl2rgb_glsl(float h, float s, float l) {
  float hDeg = mod(h * 360.0, 360.0);
  if (hDeg < 0.0) hDeg += 360.0;
  
  float a = s * min(l, 1.0 - l);
  
  float kr = mod(0.0 + hDeg / 30.0, 12.0);
  float kg = mod(8.0 + hDeg / 30.0, 12.0);
  float kb = mod(4.0 + hDeg / 30.0, 12.0);
  
  float r = l - a * clamp(min(kr - 3.0, 9.0 - kr), -1.0, 1.0);
  float g = l - a * clamp(min(kg - 3.0, 9.0 - kg), -1.0, 1.0);
  float b = l - a * clamp(min(kb - 3.0, 9.0 - kb), -1.0, 1.0);
  
  return clamp(vec3(r, g, b), 0.0, 1.0);
}

void main() {
  vec2 localPos = vLocalPos;
  float r = length(localPos);
  vec3 m = vec3(0.0, 0.0, 1.0);

  // Exact per-pixel analytical micromagnetic evaluation:
  // completely eliminates mesh interpolation artifacts, diagonal seams, or branch cut errors
  if (uMode == 0 || uMode == 1) {
    float rSk = clamp(0.88 + (uDmiStrength - 1.8) * 0.35 - uMagneticField * 0.0042, 0.35, 1.65);
    float deltaW = clamp(0.32 - (uDmiStrength - 1.8) * 0.04, 0.18, 0.48);
    float arg = clamp((r - rSk) / deltaW, -15.0, 15.0);
    float mzVal = tanh(arg);
    float mPerp = 1.0 / cosh(arg);
    float phi = atan(localPos.y, localPos.x);

    if (uMode == 0) {
      m = vec3(mPerp * cos(phi), mPerp * sin(phi), mzVal);
    } else {
      m = vec3(-mPerp * sin(phi), mPerp * cos(phi), mzVal);
    }
  } else if (uMode == 2) {
    float coreR = 0.24;
    float coreProfile = exp(-pow(r / coreR, 2.0));
    float inPlane = sqrt(max(0.0, 1.0 - pow(coreProfile, 2.0)));
    float phi = atan(localPos.y, localPos.x);
    m = vec3(-sin(phi) * inPlane, cos(phi) * inPlane, coreProfile);
  } else {
    m = normalize(vMagVector);
  }

  vec3 baseColor = vec3(0.02);

  if (uColorMap == 0) {
    // 0: Zelent Publication Colormap (PRB/RRL) - peer-reviewed scientific ground truth
    baseColor = zelentPublicationColormap(m.z);
  } else if (uColorMap == 1) {
    // 1: HSL Color Cone (MMPP Standard) - in-plane orientation wheel
    float inPlaneAngle = atan(m.y, m.x);
    float h = mod(inPlaneAngle / 6.283185307, 1.0);
    if (h < 0.0) h += 1.0;
    float s = clamp(length(m.xy), 0.0, 1.0);
    float l = clamp((m.z + 1.0) * 0.5, 0.12, 0.88);
    baseColor = hsl2rgb_glsl(h, s, l);
  } else if (uColorMap == 2) {
    // 2: Racetrack Spectrum (Image 1): Center (mz = -1) Red -> Orange -> Yellow -> Green -> Cyan -> Blue (mz = +1)
    float t = clamp((m.z + 1.0) * 0.5, 0.0, 1.0);
    float h = (1.0 - t) * 0.65;
    baseColor = hsl2rgb_glsl(h, 0.95, 0.52);
  } else if (uColorMap == 3) {
    // 3: Chiral In-Plane Color Map (Site luxury theme)
    float inPlaneAngle = atan(m.y, m.x);
    float normAngle = (inPlaneAngle + 3.14159265) / (2.0 * 3.14159265);
    vec3 chiralHue = mix(vec3(0.518, 0.424, 1.0), vec3(0.337, 0.447, 0.969), sin(normAngle * 6.28318) * 0.5 + 0.5);
    float mzWeight = clamp((m.z + 1.0) * 0.5, 0.0, 1.0);
    baseColor = mix(vec3(0.518, 0.424, 1.0), vec3(0.012, 0.016, 0.02), mzWeight * 0.8);
    baseColor = mix(baseColor, chiralHue, (1.0 - abs(m.z)) * 0.95);
  } else if (uColorMap == 4) {
    // 4: Topological Density Map q(r)
    float qDensity = (1.0 - abs(m.z)) * exp(-r * 1.8);
    baseColor = mix(vec3(0.012, 0.016, 0.02), vec3(0.337, 0.447, 0.969), smoothstep(0.0, 0.4, qDensity));
    baseColor = mix(baseColor, vec3(0.902, 0.639, 0.341), smoothstep(0.4, 0.9, qDensity));
  } else {
    // 5: Direct Out-of-Plane Magnetization (mz)
    float t = clamp((m.z + 1.0) * 0.5, 0.0, 1.0);
    baseColor = mix(vec3(0.05, 0.15, 0.88), vec3(0.92, 0.14, 0.52), t);
  }

  // Subtle concentric nanoscale lithography guide tracks
  float ringDist = fract(r / 0.5);
  float ringLine = smoothstep(0.97, 0.995, ringDist) + smoothstep(0.03, 0.005, ringDist);
  baseColor += vec3(ringLine * 0.04);

  // Surface lighting and specular reflection on flat nanodot substrate
  vec3 viewDir = normalize(vec3(0.0, 0.0, 5.0) - vWorldPosition);
  vec3 lightDir = normalize(vec3(1.5, 2.0, 3.5));
  float diff = max(dot(vNormalVec, lightDir), 0.0);
  
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(vNormalVec, halfDir), 0.0), 32.0);

  // Fresnel rim glow
  float fresnel = pow(1.0 - max(dot(vNormalVec, viewDir), 0.0), 3.0);

  // Outer circular bevel rim highlight (fabricated nanodot edge at r ~ 2.15)
  float bevelRim = smoothstep(2.11, 2.15, r) * smoothstep(2.19, 2.15, r);
  vec3 rimColor = mix(vec3(0.341, 0.902, 0.867), vec3(0.92, 0.14, 0.52), 0.5);

  vec3 finalColor = baseColor * (0.78 + diff * 0.22) 
                  + (vec3(1.0) * spec * 0.22) 
                  + (vec3(0.518, 0.424, 1.0) * fresnel * 0.15)
                  + (rimColor * bevelRim * 0.85);

  // Clean circular nanodot disk boundary falloff
  float diskMask = smoothstep(2.18, 2.14, r);
  finalColor *= diskMask;

  // Semi-transparent luminous nanodot disk (allows viewing down-pointing core arrows through the plate)
  gl_FragColor = vec4(finalColor, 0.72 * diskMask);
}
`;
