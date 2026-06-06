export const bleedFrag = `
uniform sampler2D textureA;
uniform sampler2D textureB;
uniform vec3 overlayColorA;
uniform vec3 overlayColorB;
uniform vec3 bleedAccentA;   // vivid version of old climate color
uniform vec3 bleedAccentB;   // vivid version of new climate color — floods in during bleed
uniform float progress;
uniform float time;
uniform vec2 uMouse;
varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(random(i), random(i + vec2(1.0, 0.0)), u.x),
    mix(random(i + vec2(0.0, 1.0)), random(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;

  // ---- LIQUID MOUSE RIPPLE ----
  float md = length(uv - uMouse);
  if (md > 0.001) {
    vec2 mDir = (uv - uMouse) / md;
    float mn = fbm(uv * 14.0 - time * 0.6);
    float ripple = sin(md * 28.0 - time * 5.5) * smoothstep(0.18, 0.0, md);
    uv += mDir * ripple * (0.012 + mn * 0.008);
  }

  // ---- ORGANIC LIQUID BLEED MASK ----
  // Three fbm layers animated at different rates = complex liquid tendrils
  float n1 = fbm(uv * 2.2 + vec2(time * 0.07,  time * 0.05));
  float n2 = fbm(uv * 4.5 - vec2(time * 0.04, -time * 0.06) + 3.7);
  float n3 = fbm(uv * 9.0 + vec2(-time * 0.03,  time * 0.08) + 7.3);
  float organicSurface = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

  // p sweeps from -0.05 to 1.05 to fully cover the 0–1 noise range
  float p = progress * 1.1 - 0.05;

  // Main bleed mask — sharp edge so the wipe front is clearly visible
  float bleedMask = smoothstep(p - 0.04, p + 0.04, organicSurface);
  // bleedMask = 1.0 → old scene (A), bleedMask = 0.0 → new scene (B)

  // ---- SAMPLE VIDEOS ----
  vec4 colorA = texture2D(textureA, uv);
  vec4 colorB = texture2D(textureB, uv);
  vec4 videoColor = mix(colorB, colorA, bleedMask);

  // ---- DARK CINEMATIC OVERLAY (subtle) ----
  // Keep overlay lighter so video is visible and color bleed reads clearly
  vec3 cinematicTint = mix(overlayColorB, overlayColorA, bleedMask);
  float vertGrad   = 1.0 - uv.y;
  float dist       = length(uv - vec2(0.5)) * 1.414;
  float vignette   = 1.0 - smoothstep(0.4, 1.0, dist);
  float overlayStr = 0.15 + vertGrad * 0.18 + (1.0 - vignette) * 0.10;
  overlayStr = clamp(overlayStr, 0.0, 0.40);

  vec3 finalColor = mix(videoColor.rgb, cinematicTint, overlayStr);

  // ---- VIVID CLIMATE COLOR BLEED FLOOD ----
  // Only active during the transition (progress 0 → 1)
  // The new climate's vivid accent color floods in as a liquid ink wave ahead of the bleed front
  float transitionLife = smoothstep(0.0, 0.12, progress) * smoothstep(1.0, 0.88, progress);

  // "Flood zone" = a wide band just behind the wipe front (where new color pours in)
  float floodZone = smoothstep(p - 0.22, p - 0.02, organicSurface)   // rises at wipe front
                  - smoothstep(p - 0.02, p + 0.04, organicSurface);  // ends at actual wipe edge
  // clamp to 0-1
  floodZone = clamp(floodZone, 0.0, 1.0);

  // Mix the vivid accent with black to give a moody dark-tinted bleed
  vec3 tintedAccent = mix(vec3(0.02, 0.01, 0.015), bleedAccentB, 0.55);
  finalColor = mix(finalColor, tintedAccent, floodZone * transitionLife * 0.47);

  // Subtle ink edge (very soft)
  float inkBand = smoothstep(p - 0.025, p, organicSurface) - smoothstep(p, p + 0.025, organicSurface);
  finalColor = mix(finalColor, vec3(0.02, 0.01, 0.01), inkBand * 0.40 * transitionLife);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;
