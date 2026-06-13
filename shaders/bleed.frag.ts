export const bleedFrag = `
uniform sampler2D textureA;
uniform sampler2D textureB;
uniform vec3 overlayColorA;
uniform vec3 overlayColorB;
uniform float progress;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // Simple linear crossfade between the two video textures
  vec4 colorA = texture2D(textureA, uv);
  vec4 colorB = texture2D(textureB, uv);
  
  // As progress goes from 0 to 1, we fade from A to B
  vec4 videoColor = mix(colorA, colorB, progress);

  // Crossfade the cinematic tint
  vec3 cinematicTint = mix(overlayColorA, overlayColorB, progress);

  // ---- STRONG CINEMATIC OVERLAY ----
  // Create a strong vertical gradient (dark at bottom)
  float vertGrad = pow(1.0 - uv.y, 1.5); 
  
  // Radial vignette (dark at edges)
  float dist = length(uv - vec2(0.5)) * 1.414;
  float vignette = smoothstep(0.3, 1.0, dist);
  
  // Combine: base darkness + heavy bottom gradient + vignette edges
  float overlayStr = 0.40 + vertGrad * 0.65 + vignette * 0.30;
  
  // Let it get very dark (up to 0.95) to match the HTML poster overlay
  overlayStr = clamp(overlayStr, 0.0, 0.95);

  // Mix the video with the overlay
  vec3 finalColor = mix(videoColor.rgb, cinematicTint, overlayStr);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;
