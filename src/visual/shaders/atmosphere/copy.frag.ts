export const copyFragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D uSource;
varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(uSource, vUv);
}
`;
