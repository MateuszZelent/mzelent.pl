export const spintronicsFragmentShader = /* glsl */ `
uniform float uTime;
uniform int uMode; // 0: neel, 1: bloch, 2: vortex, 3: spin-wave, 4: caustic-lens
uniform int uColorMap; // 0: chiral, 1: topological, 2: magnetization
uniform float uDmiStrength;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormalVec;
varying float vElevation;
varying float vDistCenter;
varying vec3 vMagVector;

// Luxury editorial scientific palette
const vec3 COLOR_VOID = vec3(0.012, 0.016, 0.020);     // #030405
const vec3 COLOR_VIOLET = vec3(0.518, 0.424, 1.000);   // #846cff (Chiral Core)
const vec3 COLOR_INDIGO = vec3(0.337, 0.447, 0.969);   // #5672f7 (Domain Wall)
const vec3 COLOR_CYAN = vec3(0.341, 0.902, 0.867);     // #57e6dd (Spin Waves)
const vec3 COLOR_TITANIUM = vec3(0.949, 0.941, 0.918); // #f2f0ea (High Field)
const vec3 COLOR_AMBER = vec3(0.902, 0.639, 0.341);    // #e6a357 (Topological Peak)

void main() {
  vec3 m = normalize(vMagVector);
  vec3 baseColor = COLOR_VOID;

  if (uColorMap == 0) {
    // Chiral In-Plane Color Map: In-plane orientation phi defines color hue, mz defines brightness
    float inPlaneAngle = atan(m.y, m.x);
    float normAngle = (inPlaneAngle + 3.14159265) / (2.0 * 3.14159265);
    
    vec3 chiralHue = mix(COLOR_VIOLET, COLOR_INDIGO, sin(normAngle * 6.28318) * 0.5 + 0.5);
    if (uMode >= 3) {
      chiralHue = mix(COLOR_INDIGO, COLOR_CYAN, sin(normAngle * 6.28318) * 0.5 + 0.5);
    }
    
    // Mix with core mz
    float mzWeight = clamp((m.z + 1.0) * 0.5, 0.0, 1.0);
    baseColor = mix(COLOR_VIOLET, COLOR_VOID, mzWeight * 0.8);
    baseColor = mix(baseColor, chiralHue, (1.0 - abs(m.z)) * 0.95);
    
    // Rim highlight on outer periphery
    baseColor = mix(baseColor, COLOR_TITANIUM, smoothstep(0.85, 1.0, m.z) * 0.25);
  } else if (uColorMap == 1) {
    // Topological Density Map q(r)
    float qDensity = (1.0 - abs(m.z)) * exp(-vDistCenter * 1.8);
    baseColor = mix(COLOR_VOID, COLOR_INDIGO, smoothstep(0.0, 0.4, qDensity));
    baseColor = mix(baseColor, COLOR_AMBER, smoothstep(0.4, 0.9, qDensity));
    baseColor = mix(baseColor, vec3(1.0), smoothstep(0.85, 1.0, qDensity));
  } else {
    // Direct Out-of-Plane Magnetization (mz)
    float t = clamp((m.z + 1.0) * 0.5, 0.0, 1.0);
    if (t < 0.5) {
      baseColor = mix(COLOR_VIOLET, COLOR_INDIGO, t * 2.0);
    } else {
      baseColor = mix(COLOR_INDIGO, COLOR_TITANIUM, (t - 0.5) * 2.0);
    }
  }

  // Micro-mesh grid lines (mimicking scanning microwave or MFM probe grid)
  vec2 grid = abs(fract(vUv * 48.0 - 0.5) - 0.5) / fwidth(vUv * 48.0);
  float gridLine = 1.0 - min(min(grid.x, grid.y), 1.0);
  baseColor += vec3(gridLine * 0.08);

  // Surface lighting and specular reflection
  vec3 viewDir = normalize(vec3(0.0, 0.0, 5.0) - vWorldPosition);
  vec3 lightDir = normalize(vec3(1.5, 2.0, 3.0));
  float diff = max(dot(vNormalVec, lightDir), 0.0);
  
  vec3 halfDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(vNormalVec, halfDir), 0.0), 32.0);

  // Fresnel rim glow
  float fresnel = pow(1.0 - max(dot(vNormalVec, viewDir), 0.0), 3.0);

  vec3 finalColor = baseColor * (0.45 + diff * 0.55) + (COLOR_CYAN * spec * 0.35) + (COLOR_VIOLET * fresnel * 0.4);

  // Clean vignette boundary falloff
  float vignette = smoothstep(2.4, 1.5, vDistCenter);
  finalColor *= vignette;

  gl_FragColor = vec4(finalColor, 0.96 * vignette);
}
`;
