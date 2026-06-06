export const bleedVert = `
uniform vec2 uMouse;
varying vec2 vUv;
void main() {
  vUv = uv + uMouse * 0.015;
  gl_Position = vec4(position, 1.0);
}
`;
