export const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

// Night sky: gradient, stars, a haloed moon, drifting fog and rising embers.
// uMood bleeds everything toward blood red and shakes the frame.
export const FRAG = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;   // 0..1, y up
uniform float uScroll;   // 0..1 page progress
uniform float uMood;     // 0 calm .. 1 database is down
uniform vec3 uTop;
uniform vec3 uBottom;
uniform vec3 uGlow;
uniform vec3 uMoon;
uniform float uMoonY;
uniform float uMoonR;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(5.2, 1.3);
    a *= 0.5;
  }
  return v;
}

void main() {
  float asp = uRes.x / uRes.y;
  vec2 uv = vUv;

  // database down: the world shakes
  float shake = floor(uTime * 18.0);
  uv += (vec2(hash(vec2(shake, 1.0)), hash(vec2(shake, 2.0))) - 0.5) * 0.007 * uMood;

  vec2 p = uv * vec2(asp, 1.0);
  vec3 alarm = vec3(0.9, 0.08, 0.05);

  vec3 col = mix(uBottom, uTop, pow(uv.y, 0.8));

  // stars
  float sh = hash(floor(p * 240.0));
  float star = step(0.9965, sh) * (0.55 + 0.45 * sin(uTime * 1.4 + sh * 60.0)) * smoothstep(0.4, 0.95, uv.y);
  col += vec3(0.95, 0.88, 0.8) * star * (1.0 - uMood);

  // moon
  vec2 mc = vec2(asp * 0.74 + (uPointer.x - 0.5) * 0.02, uMoonY + uScroll * 0.12 + (uPointer.y - 0.5) * 0.01);
  float R = uMoonR * min(1.0, asp * 1.2) * (1.0 + uMood * 0.1);
  float d = length(p - mc);
  vec3 glow = mix(uGlow, alarm, uMood * 0.8);
  col += glow * exp(-max(d - R, 0.0) * 4.2) * (0.5 + 0.4 * uMood);
  float disc = 1.0 - smoothstep(R - 0.003, R + 0.003, d);
  vec3 moonCol = mix(uMoon, vec3(1.0, 0.16, 0.08), uMood) * (0.76 + 0.36 * fbm((p - mc) * 5.5 + 3.1));
  col = mix(col, moonCol, disc);

  // fog creeping across the low ground
  float fog = smoothstep(0.35, 0.9, fbm(vec2(p.x * 1.1 + uTime * 0.035, p.y * 2.4 - uTime * 0.01)));
  fog *= 1.0 - smoothstep(0.0, 0.62, uv.y);
  col = mix(col, mix(uGlow * 0.9 + 0.04, vec3(0.5, 0.05, 0.04), uMood), fog * 0.45);

  // embers rising
  for (int i = 0; i < 24; i++) {
    float fi = float(i);
    float h1 = hash(vec2(fi, 1.7));
    float h2 = hash(vec2(fi, 9.1));
    float h3 = hash(vec2(fi, 4.3));
    float y = fract(h1 + uTime * (0.03 + 0.06 * h2 + uMood * 0.1));
    float x = (h3 + sin(uTime * 0.4 + fi) * 0.04) * asp;
    float e = length(p - vec2(x, y));
    float s = 0.0016 + 0.0022 * h2;
    col += vec3(1.0, 0.46, 0.2) * exp(-e * e / (s * s * 6.0)) * (1.0 - y) * (0.5 + uMood * 1.4);
  }

  col = mix(col, col * vec3(1.25, 0.55, 0.5), uMood * 0.5);

  float vig = 1.0 - smoothstep(0.4, 1.2, length((vUv - 0.5) * vec2(asp, 1.0)));
  col *= mix(0.45, 1.0, vig);
  col += (hash(vUv * uRes + uTime) - 0.5) * 0.022;

  gl_FragColor = vec4(col, 1.0);
}
`
