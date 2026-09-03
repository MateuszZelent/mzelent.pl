export const spintronicsFragmentShader = /* glsl */ `
uniform float uTime;
uniform int uMode; // 0: neel, 1: bloch, 2: vortex, 3: spin-wave, 4: caustic-lens
uniform int uColorMap; // 0: hsl-cone, 1: racetrack, 2: chiral, 3: topological, 4: magnetization
uniform float uDmiStrength;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormalVec;
varying float vElevation;
varying float vDistCenter;
varying vec3 vMagVector;

// Editorial scientific palette
const vec3 COLOR_VOID = vec3(0.012, 0.016, 0.020);     // #030405
const vec3 COLOR_VIOLET = vec3(0.518, 0.424, 1.000);   // #846cff (Chiral Core)
const vec3 COLOR_INDIGO = vec3(0.337, 0.447, 0.969);   // #5672f7 (Domain Wall)
const vec3 COLOR_CYAN = vec3(0.341, 0.902, 0.867);     // #57e6dd (Spin Waves)
const vec3 COLOR_TITANIUM = vec3(0.949, 0.941, 0.918); // #f2f0ea (High Field)
const vec3 COLOR_AMBER = vec3(0.902, 0.639, 0.341);    // #e6a357 (Topological Peak)

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
  vec3 m = normalize(vMagVector);
  vec3 baseColor = COLOR_VOID;

  if (uColorMap == 0) {
    // 0: HSL Color Cone (MMPP Standard matching Dr. Zelent's reference)
    float inPlane = length(m.xy);
    float h = 0.0;
    float s = 0.95;
    float l = 0.5;

    if (inPlane > 0.05) {
      float inPlaneAngle = atan(m.y, m.x);
      h = mod(inPlaneAngle / 6.283185307, 1.0);
      if (h < 0.0) h += 1.0;
      l = clamp(0.5 + m.z * 0.15, 0.32, 0.68);
    } else if (m.z < 0.0) {
      h = 0.66; // Deep blue center
      l = 0.38;
    } else {
      h = 0.92; // Pink/magenta outer
      l = 0.62;
    }
    
    baseColor = hsl2rgb_glsl(h, s, l);
  } else if (uColorMap == 1) {
    // 1: Racetrack Spectrum (Image 1): Center (mz = -1) Red -> Orange -> Yellow -> Green -> Cyan -> Blue (mz = +1)
    float t = clamp((m.z + 1.0) * 0.5, 0.0, 1.0);
    // Hue from 0.0 (red) to 0.65 (deep blue)
    float h = t * 0.65;
    baseColor = hsl2rgb_glsl(h, 0.95, 0.52);
  } else if (uColorMap == 2) {
    // 2: Chiral In-Plane Color Map (Site luxury theme)
    float inPlaneAngle = atan(m.y, m.x);
    float normAngle = (inPlaneAngle + 3.14159265) / (2.0 * 3.14159265);
    
    vec3 chiralHue = mix(COLOR_VIOLET, COLOR_INDIGO, sin(normAngle * 6.28318) * 0.5 + 0.5);
    if (uMode >= 3) {
      chiralHue = mix(COLOR_INDIGO, COLOR_CYAN, sin(normAngle * 6.28318) * 0.5 + 0.5);
    }
    
    float mzWeight = clamp((m.z + 1.0) * 0.5, 0.0, 1.0);
    baseColor = mix(COLOR_VIOLET, COLOR_VOID, mzWeight * 0.8);
    baseColor = mix(baseColor, chiralHue, (1.0 - abs(m.z)) * 0.95);
    baseColor = mix(baseColor, COLOR_TITANIUM, smoothstep(0.85, 1.0, m.z) * 0.25);
  } else if (uColorMap == 3) {
    // 3: Topological Density Map q(r)
    float qDensity = (1.0 - abs(m.z)) * exp(-vDistCenter * 1.8);
    baseColor = mix(COLOR_VOID, COLOR_INDIGO, smoothstep(0.0, 0.4, qDensity));
    baseColor = mix(baseColor, COLOR_AMBER, smoothstep(0.4, 0.9, qDensity));
    baseColor = mix(baseColor, vec3(1.0), smoothstep(0.85, 1.0, qDensity));
  } else {
    // 4: Direct Out-of-Plane Magnetization (mz)
    float t = clamp((m.z + 1.0) * 0.5, 0.0, 1.0);
    if (t < 0.5) {
      baseColor = mix(COLOR_VIOLET, COLOR_INDIGO, t * 2.0);
    } else {
      baseColor = mix(COLOR_INDIGO, COLOR_TITANIUM, (t - 0.5) * 2.0);
    }
  }

  // Concentric nanoscale lithography guide tracks
  float ringDist = fract(vDistCenter / 0.5);
  float ringLine = smoothstep(0.96, 0.99, ringDist) + smoothstep(0.04, 0.01, ringDist);
  baseColor += vec3(ringLine * 0.06);

  // Micro-mesh grid lines (mimicking scanning microwave or MFM probe grid)
  vec2 grid = abs(fract(vUv * 48.0 - 0.5) - 0.5) / fwidth(vUv * 48.0);
  float gridLine = 1.0 - min(min(grid.x, grid.y), 1.0);
  baseColor += vec3(gridLine * 0.035);

  // Surface lighting and specular reflection on flat nanodot substrate
  vec3 viewDir = normalize(vec3(0.0, 0.0, 5.0) - vWorldPosition);
  vec3 lightDir = normalize(vec3(1.5, 2.0, 3.5));
  float diff = max(dot(vNormalVec, lightDir), 0.0);
  
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(vNormalVec, halfDir), 0.0), 32.0);

  // Fresnel rim glow
  float fresnel = pow(1.0 - max(dot(vNormalVec, viewDir), 0.0), 3.0);

  // Outer circular bevel rim highlight (fabricated nanodot edge)
  float bevelRim = smoothstep(2.12, 2.19, vDistCenter) * smoothstep(2.26, 2.20, vDistCenter);
  vec3 rimColor = mix(COLOR_CYAN, COLOR_TITANIUM, 0.6);

  vec3 finalColor = baseColor * (0.75 + diff * 0.25) 
                  + (vec3(1.0) * spec * 0.28) 
                  + (COLOR_VIOLET * fresnel * 0.22)
                  + (rimColor * bevelRim * 0.75);

  // Clean circular nanodot disk boundary falloff
  float diskMask = smoothstep(2.26, 2.20, vDistCenter);
  finalColor *= diskMask;

  gl_FragColor = vec4(finalColor, 0.88 * diskMask);
}
`;
