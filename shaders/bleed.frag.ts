export const bleedFrag = `
uniform sampler2D textureA;
uniform sampler2D textureB;
uniform vec3 overlayColorA;
uniform vec3 overlayColorB;
uniform float progress;
uniform float time;
varying vec2 vUv;

// Random noise generator
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// Value noise
float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix( mix( random( i + vec2(0.0,0.0) ),
                     random( i + vec2(1.0,0.0) ), u.x),
                mix( random( i + vec2(0.0,1.0) ),
                     random( i + vec2(1.0,1.0) ), u.x), u.y);
}

// fBm noise function returns 0.0 - 1.0
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

uniform vec2 uMouse;

void main() {
  vec2 uv = vUv;
  
  // -- LIQUID MOUSE EFFECT --
  float mouseDist = length(uv - uMouse);
  vec2 liquidOffset = vec2(0.0);
  
  if (mouseDist > 0.001) {
    // Normalize direction from mouse
    vec2 mouseDir = (uv - uMouse) / mouseDist;
    
    // Create an undulating liquid ripple that travels outward and decays over distance (radius 0.15)
    // The fbm noise adds organic water-like imperfections to the ripple
    float mouseNoise = fbm(uv * 15.0 - time * 0.5);
    float ripple = sin(mouseDist * 30.0 - time * 6.0) * smoothstep(0.15, 0.0, mouseDist);
    
    // Combine for a glassy, refractive liquid offset
    liquidOffset = mouseDir * ripple * (0.015 + mouseNoise * 0.01);
  }
  
  // Displace the core UVs with the liquid offset so the entire scene refracts!
  uv += liquidOffset;
  
  // Calculate true distance from center to corners (max dist ~1.0)
  float dist = length(uv - vec2(0.5)) * 1.414;
  
  // Single, extremely smooth noise layer for elegant, flowing liquid edges
  float n = fbm(uv * 2.5 + time * 0.08);
  
  // Combine distance and noise for outward fluid growth
  // Increased noise influence (0.6) for a much more organic, highly fluid liquid spread
  float spreadMap = dist * 0.4 + n * 0.6;
  
  // Scale progress (0.0 to 1.0) to safely cover the entire spreadMap (-0.25 to 1.25)
  float p = progress * 1.5 - 0.25;
  
  // The transition edge - widened (0.3) for a deeply watery, mixing fluid blend
  float edge = smoothstep(p - 0.3, p + 0.3, spreadMap);
  
  vec4 colorA = texture2D(textureA, uv);
  vec4 colorB = texture2D(textureB, uv);
  
  // Mix the videos smoothly
  vec4 baseColor = mix(colorB, colorA, edge);
  
  // Smoothly mix the overlay colors
  vec3 overlayColor = mix(overlayColorB, overlayColorA, edge);
  
  // -- ELEGANT INK SOAK --
  // A very soft, subtle darkening right on the expansion boundary, like wet ink soaking into paper
  float inkSoak = smoothstep(p - 0.15, p, spreadMap) - smoothstep(p, p + 0.15, spreadMap);
  baseColor = mix(baseColor, vec4(0.02, 0.02, 0.02, 1.0), inkSoak * 0.35);
  
  // Cinematic Gradient Overlay Calculation
  float verticalGrad = smoothstep(0.0, 1.0, 1.0 - uv.y); 
  float vignette = smoothstep(0.8, 0.2, dist);
  
  float strength = 0.4 + (verticalGrad * 0.45) + ((1.0 - vignette) * 0.25);
  strength = clamp(strength, 0.0, 0.95);
  
  // Mix the video with the calming specific color overlay
  vec3 finalColor = mix(baseColor.rgb, overlayColor, strength);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;
