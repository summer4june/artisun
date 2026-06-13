export const bleedFrag = `
uniform sampler2D textureA;
uniform sampler2D textureB;
uniform vec3 overlayColorA;
uniform vec3 overlayColorB;
uniform vec3 bleedAccentA;   // Not used, kept for compatibility
uniform vec3 bleedAccentB;   // Not used, kept for compatibility
uniform float progress;
uniform float time;          // Not used, kept for compatibility
uniform vec2 uMouse;         // Not used, kept for compatibility
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // ---- SAMPLE VIDEOS ----
  vec4 colorA = texture2D(textureA, uv);
  vec4 colorB = texture2D(textureB, uv);
  
  // Simple smooth crossfade
  // progress goes from 0.0 (A) to 1.0 (B)
  vec4 videoColor = mix(colorA, colorB, progress);

  // ---- STRONG CINEMATIC OVERLAY ----
  // Deep gradient at the bottom so text is highly legible
  vec3 cinematicTint = mix(overlayColorA, overlayColorB, progress);
  
  // Create a strong vertical gradient (dark at bottom)
  float vertGrad = pow(1.0 - uv.y, 1.5); 
  
  // Radial vignette (dark at edges)
  float dist = length(uv - vec2(0.5)) * 1.414;
  float vignette = smoothstep(0.3, 1.0, dist);
  
  // Combine: base darkness + heavy bottom gradient + vignette edges
  float overlayStr = 0.40 + vertGrad * 0.65 + vignette * 0.30;
  
  // Let it get very dark (up to 0.95) to match the HTML poster overlay
  overlayStr = clamp(overlayStr, 0.0, 0.95);

  vec3 finalColor = mix(videoColor.rgb, cinematicTint, overlayStr);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;
