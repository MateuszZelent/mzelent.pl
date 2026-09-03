export const spintronicsVertexShader = /* glsl */ `
uniform float uTime;
uniform int uMode; // 0: neel, 1: bloch, 2: vortex, 3: spin-wave, 4: caustic-lens
uniform float uMagneticField; // mT
uniform float uDmiStrength; // mJ/m²
uniform float uRfFrequency; // GHz
uniform float uDampingAlpha;

varying vec2 vUv;
varying vec3 vWorldPosition;
varying vec3 vNormalVec;
varying float vElevation;
varying float vDistCenter;
varying vec3 vMagVector;

void main() {
  vUv = uv;
  vec3 pos = position;
  float r = length(pos.xy);
  vDistCenter = r;

  float elevation = 0.0;
  vec3 m = vec3(0.0, 0.0, 1.0);

  if (uMode == 0 || uMode == 1) {
    // Topologically protected Skyrmion (Neel or Bloch)
    // Radius modulated by DMI and external field Bz
    float baseR = 0.85 + (uDmiStrength - 1.8) * 0.22 - (uMagneticField * 0.0035);
    baseR = max(0.25, min(1.6, baseR));
    float wallWidth = max(0.18, 0.38 - (uDmiStrength * 0.04));
    
    // Domain wall profile Theta(r)
    float theta = 3.14159265 * (1.0 - smoothstep(baseR - wallWidth, baseR + wallWidth, r));
    float cosTheta = cos(theta);
    float sinTheta = sin(theta);
    float phi = atan(pos.y, pos.x);

    elevation = 0.0; // Flat disk nanodot substrate

    if (uMode == 0) {
      // Neel skyrmion (hedgehog radial in-plane component)
      m = vec3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);
    } else {
      // Bloch skyrmion (vortex tangential in-plane component)
      m = vec3(-sinTheta * sin(phi), sinTheta * cos(phi), cosTheta);
    }
  } else if (uMode == 2) {
    // Magnetic Vortex with out-of-plane singularity core
    float coreR = 0.24;
    float coreProfile = exp(-pow(r / coreR, 2.0));
    elevation = 0.0; // Flat nanodisk substrate
    float phi = atan(pos.y, pos.x);
    float inPlane = sqrt(max(0.0, 1.0 - pow(coreProfile, 2.0)));
    m = vec3(-sin(phi) * inPlane, cos(phi) * inPlane, coreProfile);
  } else if (uMode == 3) {
    // Propagating Spin Waves in a magnonic waveguide
    float k = 3.14159265 * (uRfFrequency / 4.8);
    float distFromSource = pos.x + 2.2;
    float decay = exp(-max(0.0, distFromSource) * uDampingAlpha * 35.0);
    float wavePhase = k * distFromSource - uTime * (uRfFrequency * 0.6);
    float wave = sin(wavePhase) * decay;
    
    // Waveguide lateral confinement
    float lateralEnvelope = exp(-pow(pos.y / 1.4, 4.0));
    elevation = wave * 0.32 * lateralEnvelope;

    m = vec3(0.0, elevation * 2.0, sqrt(max(0.0, 1.0 - pow(elevation * 2.0, 2.0))));
  } else if (uMode == 4) {
    // Caustic Spin-Wave Lens focusing
    float k = 3.14159265 * (uRfFrequency / 4.5);
    vec2 focalPoint = vec2(0.75, 0.0);
    float distToFocus = length(pos.xy - focalPoint);
    
    // Lens refraction creating caustic interference cusp
    float wave1 = sin(k * length(pos.xy + vec2(2.0, 0.0)) - uTime * 3.5);
    float wave2 = sin(k * distToFocus - uTime * 3.5);
    float caustic = (wave1 * 0.4 + wave2 * 0.6) * exp(-r * uDampingAlpha * 22.0);
    
    elevation = caustic * 0.36;
    m = vec3(elevation, caustic, 1.0 - abs(caustic));
  }

  pos.z += elevation;
  vElevation = elevation;
  vMagVector = m;

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPos.xyz;
  vNormalVec = normalize(normalMatrix * normal);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;
