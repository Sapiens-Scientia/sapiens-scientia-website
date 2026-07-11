"use client";

// ============================================================================
// YOU ARE HERE — a scroll through everything                    (lab experiment)
//
// The brief (self-prompt):
//   One unbroken shot from the first instant of time to the reader's own
//   ticking second. Scroll is the only control and it changes meaning as you
//   go: first a throttle through time (all 13.8 billion years), then a descent
//   through space (an exponential zoom down the reader's cosmic mailing
//   address), then it runs out of universe and lands on NOW — a live clock,
//   the sun's real terminator, a pin near the reader, and finally (by
//   invitation only) the reader themselves, live on camera, composited into
//   the starfield. A spacetime altimeter rides the left edge; its units flip
//   from seconds to metres to o'clock. Every number is true. Procedural
//   everything; the only texture allowed is the blue marble. The tone is a
//   poem with correct units, and the ending is quiet.
//
// Standalone by design: one component, one hidden route, no site chrome.
// ============================================================================

import * as THREE from "three";
import { useCallback, useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Small math + formatting helpers
// ---------------------------------------------------------------------------

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth01 = (t: number) => {
  const u = clamp01(t);
  return u * u * (3 - 2 * u);
};
const mapRange = (v: number, a: number, b: number) => clamp01((v - a) / (b - a || 1));

/** Piecewise-linear map through [x, y] stops (x ascending). Clamps outside. */
function piecewise(stops: [number, number][]) {
  return (x: number) => {
    if (x <= stops[0][0]) return stops[0][1];
    for (let i = 0; i < stops.length - 1; i++) {
      const [x0, y0] = stops[i];
      const [x1, y1] = stops[i + 1];
      if (x <= x1) return y0 + ((x - x0) / (x1 - x0 || 1)) * (y1 - y0);
    }
    return stops[stops.length - 1][1];
  };
}

const SUP: Record<string, string> = {
  "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴",
  "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};
const sup = (n: number) => String(Math.round(n)).split("").map((c) => SUP[c] ?? c).join("");

const YEAR_S = 3.156e7;
const LY_M = 9.461e15;
const AU_M = 1.496e11;

function formatAge(logT: number) {
  const t = Math.pow(10, logT);
  if (t < 1e-3) return `10${sup(Math.floor(logT))} seconds`;
  if (t < 90) return `${t < 10 ? t.toFixed(1) : Math.round(t)} seconds`;
  if (t < 5400) return `${(t / 60).toFixed(0)} minutes`;
  if (t < 2 * YEAR_S) return `${(t / 86400).toFixed(0)} days`;
  const y = t / YEAR_S;
  if (y < 1e3) return `${Math.round(y)} years`;
  if (y < 1e6) return `${(y / 1e3).toFixed(0)} thousand years`;
  if (y < 1e9) return `${(y / 1e6).toFixed(0)} million years`;
  return `${(y / 1e9).toFixed(2)} billion years`;
}

const tempAtLogT = piecewise([
  [-43, 32], [-32, 27], [-6, 12.2], [0, 10], [2.26, 9],
  [13.08, 3.48], [14.5, 2.2], [15.8, 1.8], [17.64, 0.435],
]); // returns log10(K)

function formatTemp(logT: number) {
  const logK = tempAtLogT(logT);
  const k = Math.pow(10, logK);
  if (k >= 1e5) return `10${sup(Math.floor(logK))} K`;
  if (k >= 1000) return `${Math.round(k).toLocaleString()} K`;
  return `${k.toFixed(k < 10 ? 1 : 0)} K`;
}

function formatSpan(logM: number) {
  const m = Math.pow(10, logM);
  if (m >= 0.05 * LY_M) {
    const ly = m / LY_M;
    if (ly >= 1e9) return `${(ly / 1e9).toFixed(1)} billion light-years`;
    if (ly >= 1e6) return `${(ly / 1e6).toFixed(1)} million light-years`;
    if (ly >= 1e3) return `${Math.round(ly / 1e3).toLocaleString()} thousand light-years`;
    return `${Math.round(ly).toLocaleString()} light-years`;
  }
  if (m >= 0.2 * AU_M) return `${(m / AU_M).toFixed(m / AU_M < 10 ? 1 : 0)} AU`;
  return `${Math.round(m / 1000).toLocaleString()} km`;
}

// ---------------------------------------------------------------------------
// Where is the reader? Timezone → rough coordinates (no permission needed).
// ---------------------------------------------------------------------------

const TZ_COORDS: Record<string, [number, number]> = {
  "America/New_York": [40.7, -74.0], "America/Chicago": [41.9, -87.6],
  "America/Denver": [39.7, -105.0], "America/Phoenix": [33.4, -112.1],
  "America/Los_Angeles": [34.1, -118.2], "America/Anchorage": [61.2, -149.9],
  "America/Toronto": [43.7, -79.4], "America/Vancouver": [49.3, -123.1],
  "America/Mexico_City": [19.4, -99.1], "America/Bogota": [4.7, -74.1],
  "America/Lima": [-12.0, -77.0], "America/Santiago": [-33.4, -70.7],
  "America/Sao_Paulo": [-23.6, -46.6], "America/Argentina/Buenos_Aires": [-34.6, -58.4],
  "Europe/London": [51.5, -0.1], "Europe/Dublin": [53.3, -6.3],
  "Europe/Lisbon": [38.7, -9.1], "Europe/Madrid": [40.4, -3.7],
  "Europe/Paris": [48.9, 2.3], "Europe/Amsterdam": [52.4, 4.9],
  "Europe/Berlin": [52.5, 13.4], "Europe/Zurich": [47.4, 8.5],
  "Europe/Rome": [41.9, 12.5], "Europe/Vienna": [48.2, 16.4],
  "Europe/Prague": [50.1, 14.4], "Europe/Warsaw": [52.2, 21.0],
  "Europe/Stockholm": [59.3, 18.1], "Europe/Oslo": [59.9, 10.8],
  "Europe/Copenhagen": [55.7, 12.6], "Europe/Helsinki": [60.2, 24.9],
  "Europe/Athens": [38.0, 23.7], "Europe/Istanbul": [41.0, 29.0],
  "Europe/Kyiv": [50.5, 30.5], "Europe/Moscow": [55.8, 37.6],
  "Africa/Casablanca": [33.6, -7.6], "Africa/Cairo": [30.0, 31.2],
  "Africa/Lagos": [6.5, 3.4], "Africa/Nairobi": [-1.3, 36.8],
  "Africa/Johannesburg": [-26.2, 28.0], "Asia/Jerusalem": [31.8, 35.2],
  "Asia/Dubai": [25.2, 55.3], "Asia/Riyadh": [24.7, 46.7],
  "Asia/Tehran": [35.7, 51.4], "Asia/Karachi": [24.9, 67.0],
  "Asia/Kolkata": [22.6, 88.4], "Asia/Bangkok": [13.8, 100.5],
  "Asia/Jakarta": [-6.2, 106.8], "Asia/Singapore": [1.4, 103.8],
  "Asia/Hong_Kong": [22.3, 114.2], "Asia/Shanghai": [31.2, 121.5],
  "Asia/Taipei": [25.0, 121.6], "Asia/Manila": [14.6, 121.0],
  "Asia/Seoul": [37.6, 127.0], "Asia/Tokyo": [35.7, 139.7],
  "Australia/Perth": [-32.0, 115.9], "Australia/Brisbane": [-27.5, 153.0],
  "Australia/Sydney": [-33.9, 151.2], "Australia/Melbourne": [-37.8, 145.0],
  "Pacific/Auckland": [-36.8, 174.8], "Pacific/Honolulu": [21.3, -157.9],
};

function guessLocation(): { lat: number; lon: number; precise: boolean } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hit = tz ? TZ_COORDS[tz] : undefined;
    if (hit) return { lat: hit[0], lon: hit[1], precise: false };
  } catch {
    // Intl can be restricted; fall through to the clock-offset estimate.
  }
  const lon = (-new Date().getTimezoneOffset() / 60) * 15;
  return { lat: 25, lon, precise: false };
}

function formatCoords(lat: number, lon: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(1)}°${ns}, ${Math.abs(lon).toFixed(1)}°${ew}`;
}

// Earth-fixed lat/lng → unit vector, matching the blue-marble equirect mapping
// used elsewhere in this repo.
function latLngToVec(lat: number, lng: number, r = 1) {
  const latRad = (Math.max(-89.9, Math.min(89.9, lat)) * Math.PI) / 180;
  const lngRad = ((lng + 180) * Math.PI) / 180;
  const cosLat = Math.cos(latRad);
  return new THREE.Vector3(
    -Math.cos(lngRad) * cosLat * r,
    Math.sin(latRad) * r,
    Math.sin(lngRad) * cosLat * r,
  );
}

// The real subsolar point (±~1° without the equation of time — good enough
// for an honest terminator).
function subsolarDirection(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const day = (date.getTime() - start) / 86400000;
  const decl = -23.44 * Math.cos(((2 * Math.PI) / 365.25) * (day + 10));
  const utcH = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const lon = 15 * (12 - utcH);
  return latLngToVec(decl, lon, 1);
}

// ---------------------------------------------------------------------------
// The script: journey coordinates, narration, and the address label
// ---------------------------------------------------------------------------

// Scroll fraction → log10(seconds since the Big Bang). Movement I.
const pToLogT = piecewise([
  [0.02, -43], [0.055, -35], [0.09, 0], [0.13, 2.26],
  [0.185, 13.08], [0.235, 15.8], [0.275, 16.8], [0.33, 17.64],
]);

// Scroll fraction → log10(metres across the view). Movement II & III.
// Dwells sit on each address line; the long plunges land on the "emptiness"
// beats between them.
const pToLogM = piecewise([
  [0.335, 27.2], [0.4, 26.2], [0.46, 24.6], [0.52, 22.9], [0.59, 20.9],
  [0.628, 19.55], [0.66, 18.85], [0.698, 17.9], [0.75, 14.6], [0.775, 13.35],
  [0.83, 12.35], [0.868, 10.2], [0.905, 7.35], [1.0, 7.18],
]);

type Beat = { from: number; to: number; title: string; sub?: string; live?: boolean };

const BEATS: Beat[] = [
  { from: 0.0, to: 0.032, title: "This is everything there is.", sub: "Every galaxy, every atom of you — in a point smaller than small. Scroll, and let it begin." },
  { from: 0.04, to: 0.082, title: "10⁻³⁵ seconds", sub: "Space itself tears outward, doubling and doubling, faster than light." },
  { from: 0.09, to: 0.13, title: "Three minutes in", sub: "The universe is a furnace forging the first nuclei — hydrogen and helium, the stuff of every future sun." },
  { from: 0.15, to: 0.202, title: "380,000 years", sub: "The fog clears and light gets loose. That first flash is still all around you — part of the static between radio stations." },
  { from: 0.21, to: 0.258, title: "The dark ages", sub: "A hundred million years of nothing but cooling gas. Then, one by one, the lights come on." },
  { from: 0.266, to: 0.325, title: "The age of galaxies", sub: "Gravity spends billions of years braiding gas into hundreds of billions of galaxies." },
  { from: 0.338, to: 0.39, title: "That brings us to tonight.", sub: "Time stops scrolling here. Space starts. Let's find you." },
  { from: 0.396, to: 0.455, title: "The observable universe", sub: "93 billion light-years of cosmic web — every thread a chain of galaxies. Your address starts here." },
  { from: 0.463, to: 0.515, title: "Laniakea", sub: "“Immeasurable heaven”: a hundred thousand galaxies drifting the same slow current. One of them matters to you." },
  { from: 0.523, to: 0.585, title: "The Local Group", sub: "The spiral ahead is home. The other big one arrives in about four billion years. No rush." },
  { from: 0.593, to: 0.647, title: "The Milky Way", sub: "A hundred thousand light-years, several hundred billion stars. You live in the quiet suburbs, between two arms." },
  { from: 0.653, to: 0.695, title: "The neighborhood", sub: "Every star any human eye has ever seen, unaided, lives inside this one small bright bubble." },
  { from: 0.7, to: 0.755, title: "And in between", sub: "Almost all of everything is this: nothing. Cold, clean, patient vacuum." },
  { from: 0.762, to: 0.85, title: "One ordinary star", sub: "Eight worlds. Yours is the third — the damp one." },
  { from: 0.868, to: 0.902, title: "Earth, live", sub: "The daylight on this globe is where daylight actually is, this second." },
  { from: 0.908, to: 0.955, title: "And after 13.8 billion years…", live: true },
  { from: 0.958, to: 1.01, title: "You are the universe, 13.8 billion years in, looking back at itself.", sub: "Every “here” is the center. This one is yours." },
];

const ADDRESS: { p: number; line: string; note: string }[] = [
  { p: 0.4, line: "OBSERVABLE UNIVERSE", note: "8.8×10²⁶ m" },
  { p: 0.465, line: "LANIAKEA SUPERCLUSTER", note: "~5×10²⁴ m" },
  { p: 0.525, line: "THE LOCAL GROUP", note: "~10²³ m" },
  { p: 0.595, line: "MILKY WAY GALAXY", note: "9×10²⁰ m" },
  { p: 0.655, line: "ORION–CYGNUS ARM", note: "~10¹⁹ m" },
  { p: 0.768, line: "THE SOLAR SYSTEM", note: "~10¹³ m" },
  { p: 0.862, line: "EARTH", note: "1.27×10⁷ m" },
  { p: 0.915, line: "@COORDS@", note: "" },
  { p: 0.945, line: "NOW", note: "@TIME@" },
  { p: 0.972, line: "YOU", note: "13.8 billion years in the making" },
];

const TIME_TICKS: [number, string][] = [
  [-43, "10⁻⁴³ s"], [-35, "inflation"], [0, "1 second"], [2.26, "3 minutes"],
  [13.08, "380,000 yr"], [15.8, "first stars"], [17.64, "today"],
];
const SCALE_TICKS: [number, string][] = [
  [26.9, "observable universe"], [24.7, "Laniakea"], [23.0, "Local Group"],
  [21.0, "Milky Way"], [19.0, "the neighborhood"], [13.1, "Solar System"], [7.35, "Earth"],
];
const TIME_RANGE: [number, number] = [-43, 17.64];
const SCALE_RANGE: [number, number] = [27.2, 7.0];

const SCROLL_VH = 1500; // scrollable length of the piece, in viewport-heights

// ---------------------------------------------------------------------------
// Procedural scenery
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(rng: () => number) {
  return (rng() + rng() + rng() - 1.5) * 0.82;
}

/** Soft round glow texture so points render as luminous dots. */
function makeDotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeSunTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,252,240,1)");
  grad.addColorStop(0.12, "rgba(255,238,180,0.95)");
  grad.addColorStop(0.35, "rgba(255,190,90,0.4)");
  grad.addColorStop(1, "rgba(255,150,50,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type PointCloud = {
  points: THREE.Points;
  material: THREE.PointsMaterial;
  positions: Float32Array;
  colors: Float32Array;
};

function makePointCloud(
  count: number, size: number, dot: THREE.Texture, opacity = 1,
): PointCloud {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size, map: dot, vertexColors: true, transparent: true, opacity,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  return { points, material, positions, colors };
}

/** A hand-rolled spiral galaxy: bulge + log-spiral arms + faint halo. */
function fillSpiralGalaxy(
  cloud: PointCloud, radius: number, seed: number, brightness = 1,
) {
  const rng = mulberry32(seed);
  const n = cloud.positions.length / 3;
  for (let i = 0; i < n; i++) {
    let x = 0, y = 0, z = 0, r = 0, g = 0, b = 0;
    const kind = rng();
    if (kind < 0.28) {
      // bulge
      x = gauss(rng) * radius * 0.14;
      y = gauss(rng) * radius * 0.07;
      z = gauss(rng) * radius * 0.14;
      r = 1.0; g = 0.86; b = 0.62;
    } else if (kind < 0.9) {
      // arms
      const arm = Math.floor(rng() * 4);
      const t = Math.pow(rng(), 0.62);
      const rad = (0.12 + 0.88 * t) * radius;
      const theta = arm * (Math.PI / 2) + t * 3.9 + gauss(rng) * 0.22 * (1.15 - t);
      x = Math.cos(theta) * rad;
      z = Math.sin(theta) * rad;
      y = gauss(rng) * radius * 0.025;
      if (rng() < 0.09) { r = 1.0; g = 0.55; b = 0.68; } // HII blush
      else { r = 0.72; g = 0.8; b = 1.0; }
      const dim = 0.55 + 0.45 * (1 - t);
      r *= dim; g *= dim; b *= dim;
    } else {
      // halo
      const rad = radius * (0.5 + rng() * 0.9);
      const th = rng() * Math.PI * 2;
      const ph = Math.acos(2 * rng() - 1);
      x = rad * Math.sin(ph) * Math.cos(th);
      y = rad * Math.cos(ph) * 0.5;
      z = rad * Math.sin(ph) * Math.sin(th);
      r = 0.5; g = 0.5; b = 0.62;
      const dim = 0.25;
      r *= dim; g *= dim; b *= dim;
    }
    cloud.positions[i * 3] = x;
    cloud.positions[i * 3 + 1] = y;
    cloud.positions[i * 3 + 2] = z;
    cloud.colors[i * 3] = r * brightness;
    cloud.colors[i * 3 + 1] = g * brightness;
    cloud.colors[i * 3 + 2] = b * brightness;
  }
  cloud.points.geometry.attributes.position.needsUpdate = true;
  cloud.points.geometry.attributes.color.needsUpdate = true;
}

// Earth day/night shader — object-space sun direction so the group can rotate.
const EARTH_VERT = `
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vNormal = normal;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const EARTH_FRAG = `
  uniform sampler2D map;
  uniform vec3 sunDir;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vec3 day = texture2D(map, vUv).rgb;
    float d = dot(normalize(vNormal), normalize(sunDir));
    float lit = smoothstep(-0.10, 0.12, d);
    float band = smoothstep(-0.14, 0.0, d) * smoothstep(0.16, 0.0, d);
    vec3 night = day * 0.05 + vec3(0.008, 0.014, 0.035);
    vec3 col = mix(night, day * 1.06, lit) + vec3(1.0, 0.45, 0.16) * band * 0.22;
    gl_FragColor = vec4(col, 1.0);
  }
`;
const ATMO_VERT = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const ATMO_FRAG = `
  varying vec3 vNormal;
  uniform float strength;
  void main() {
    float rim = pow(clamp(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 3.0);
    gl_FragColor = vec4(vec3(0.35, 0.6, 1.0) * rim * strength, rim * strength);
  }
`;

// ---------------------------------------------------------------------------
// Procedural sound: a drone that cools with the universe
// ---------------------------------------------------------------------------

type Drone = { enable: () => void; disable: () => void; set: (p: number) => void; dispose: () => void };

function makeDrone(): Drone {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let filter: BiquadFilterNode | null = null;
  let on = false;

  const build = () => {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.9;
    const mk = (type: OscillatorType, freq: number, gain: number) => {
      const o = ctx!.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      const g = ctx!.createGain();
      g.gain.value = gain;
      o.connect(g).connect(filter!);
      o.start();
    };
    mk("sine", 55, 0.5);
    mk("sine", 55.38, 0.5); // slow beat against the first
    mk("triangle", 110.6, 0.12);
    mk("sine", 220.9, 0.05);
    filter.connect(master).connect(ctx.destination);
  };

  return {
    enable() {
      if (!ctx) build();
      ctx!.resume();
      master!.gain.cancelScheduledValues(ctx!.currentTime);
      master!.gain.linearRampToValueAtTime(0.09, ctx!.currentTime + 1.2);
      on = true;
    },
    disable() {
      if (!ctx) return;
      master!.gain.cancelScheduledValues(ctx.currentTime);
      master!.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      on = false;
    },
    set(p: number) {
      if (!ctx || !on || !filter) return;
      // hot and bright at ignition, cooling toward a near-silent hum at "now"
      const f = 2400 * Math.pow(70 / 2400, clamp01(p * 1.08));
      filter.frequency.setTargetAtTime(Math.max(58, f), ctx.currentTime, 0.2);
    },
    dispose() {
      try { ctx?.close(); } catch { /* already closed */ }
      ctx = null;
    },
  };
}

// ---------------------------------------------------------------------------
// The component
// ---------------------------------------------------------------------------

type AltimeterMode = "time" | "scale" | "now";
type MirrorState = "off" | "pending" | "on" | "denied";

export function YouAreHereExperience() {
  const journeyRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const readoutBigRef = useRef<HTMLDivElement | null>(null);
  const readoutSmallRef = useRef<HTMLDivElement | null>(null);
  const beatTimeRef = useRef<HTMLSpanElement | null>(null);
  const addrCoordsRef = useRef<HTMLSpanElement | null>(null);
  const addrTimeRef = useRef<HTMLSpanElement | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);
  const smoothRef = useRef(0);
  const geoRef = useRef(guessLocation());
  const apiRef = useRef<{ setBeacon: (lat: number, lon: number) => void } | null>(null);
  const droneRef = useRef<Drone | null>(null);
  const mirrorOnRef = useRef(false);
  const scrollAnimRef = useRef(0);

  const [beatIdx, setBeatIdx] = useState(-1);
  const [addrCount, setAddrCount] = useState(0);
  const [altMode, setAltMode] = useState<AltimeterMode>("time");
  const [started, setStarted] = useState(false);
  const [arrived, setArrived] = useState(false); // Movement III reached
  const [ended, setEnded] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [mirror, setMirror] = useState<MirrorState>("off");
  const [geoLabel, setGeoLabel] = useState<"estimated" | "precise">("estimated");

  // ------------------------------------------------------------------ scene
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.01, 400);
    camera.position.set(0, 0, 10);

    const disposables: { dispose: () => void }[] = [renderer];
    const track = <T extends { dispose: () => void }>(d: T): T => { disposables.push(d); return d; };

    const dot = track(makeDotTexture());

    // -- persistent background stars ---------------------------------------
    const bg = makePointCloud(1700, 0.09, dot, 0.55);
    track(bg.points.geometry); track(bg.material);
    {
      const rng = mulberry32(11);
      for (let i = 0; i < 1700; i++) {
        const r = 42 + rng() * 26;
        const th = rng() * Math.PI * 2;
        const ph = Math.acos(2 * rng() - 1);
        bg.positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
        bg.positions[i * 3 + 1] = r * Math.cos(ph);
        bg.positions[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
        const warm = rng();
        bg.colors[i * 3] = 0.7 + warm * 0.3;
        bg.colors[i * 3 + 1] = 0.72 + warm * 0.2;
        bg.colors[i * 3 + 2] = 0.85;
      }
      bg.points.geometry.attributes.position.needsUpdate = true;
      bg.points.geometry.attributes.color.needsUpdate = true;
    }
    scene.add(bg.points);

    // -- Movement I: the fuse (all of time as one expanding particle field) -
    const FUSE_N = 5200;
    const fuse = makePointCloud(FUSE_N, 0.13, dot, 1);
    track(fuse.points.geometry); track(fuse.material);
    const fuseDir = new Float32Array(FUSE_N * 3);
    const fuseRad = new Float32Array(FUSE_N);
    const fuseJit = new Float32Array(FUSE_N);
    const fuseCluster = new Uint16Array(FUSE_N);
    const CLUSTERS = 64;
    const clusterCenters = new Float32Array(CLUSTERS * 3);
    {
      const rng = mulberry32(29);
      for (let c = 0; c < CLUSTERS; c++) {
        const r = 1.4 + Math.pow(rng(), 0.5) * 2.9;
        const th = rng() * Math.PI * 2;
        const ph = Math.acos(2 * rng() - 1);
        clusterCenters[c * 3] = r * Math.sin(ph) * Math.cos(th);
        clusterCenters[c * 3 + 1] = r * Math.cos(ph) * 0.85;
        clusterCenters[c * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      }
      for (let i = 0; i < FUSE_N; i++) {
        const th = rng() * Math.PI * 2;
        const ph = Math.acos(2 * rng() - 1);
        fuseDir[i * 3] = Math.sin(ph) * Math.cos(th);
        fuseDir[i * 3 + 1] = Math.cos(ph);
        fuseDir[i * 3 + 2] = Math.sin(ph) * Math.sin(th);
        fuseRad[i] = 0.25 + Math.pow(rng(), 0.7) * 0.75;
        fuseJit[i] = rng();
        fuseCluster[i] = Math.floor(rng() * CLUSTERS);
      }
    }
    scene.add(fuse.points);

    // expansion of the fuse field with log-time (inflation kink included)
    const expansionAt = piecewise([
      [-43, 0.012], [-35, 0.02], [-32, 0.75], [-6, 1.15], [0, 1.35],
      [2.26, 1.5], [13.08, 2.1], [15.8, 3.1], [17.64, 4.4],
    ]);
    const eraColor = (logT: number, out: THREE.Color) => {
      if (logT < -6) out.setRGB(0.92, 0.88, 1.0);
      else if (logT < 2.26) out.setRGB(1.0, 0.97, 0.9);
      else if (logT < 13.08) {
        const f = mapRange(logT, 2.26, 13.08);
        out.setRGB(1.0, lerp(0.95, 0.55, f), lerp(0.85, 0.25, f));
      } else if (logT < 14.6) {
        const f = mapRange(logT, 13.08, 14.6);
        out.setRGB(lerp(1.0, 0.16, f), lerp(0.5, 0.05, f), lerp(0.22, 0.09, f));
      } else out.setRGB(0.16, 0.06, 0.1);
    };
    const fuseColor = new THREE.Color();
    const starColor = new THREE.Color(0.78, 0.85, 1.0);

    // the recombination flash
    const flashMat = track(new THREE.MeshBasicMaterial({
      color: 0xffd9a8, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    const flash = new THREE.Mesh(track(new THREE.PlaneGeometry(80, 80)), flashMat);
    flash.position.z = 5;
    scene.add(flash);

    // -- Movement II: the nested zoom stack ---------------------------------
    type ZoomSet = {
      group: THREE.Group;
      ref: number;                    // log10(m) where this set "fills" the frame
      focus: THREE.Vector3;           // local point where the next set nests
      fades: { mat: THREE.Material & { opacity: number }; base: number }[];
      update?: (t: number, s: number) => void;
      window?: (x: number) => number; // custom fade curve over x = log10(scale)
    };
    const stack: ZoomSet[] = [];
    const addSet = (ref: number, focus: THREE.Vector3): ZoomSet => {
      const group = new THREE.Group();
      group.visible = false;
      scene.add(group);
      const set: ZoomSet = { group, ref, focus, fades: [] };
      stack.push(set);
      return set;
    };
    const fadeMat = (set: ZoomSet, mat: THREE.Material & { opacity: number }, base: number) => {
      mat.transparent = true;
      set.fades.push({ mat, base });
    };

    // 1) cosmic web -------------------------------------------------- 10^26.2
    const webSet = addSet(26.2, new THREE.Vector3(0.55, -0.35, 0.2));
    {
      const rng = mulberry32(47);
      const nodes: THREE.Vector3[] = [];
      for (let i = 0; i < 42; i++) {
        const r = Math.pow(rng(), 0.6) * 4.1;
        const th = rng() * Math.PI * 2;
        const ph = Math.acos(2 * rng() - 1);
        nodes.push(new THREE.Vector3(
          r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.85, r * Math.sin(ph) * Math.sin(th),
        ));
      }
      const web = makePointCloud(4200, 0.1, dot, 0.9);
      track(web.points.geometry); track(web.material);
      let w = 0;
      const put = (v: THREE.Vector3, bright: number) => {
        if (w >= 4200) return;
        web.positions[w * 3] = v.x; web.positions[w * 3 + 1] = v.y; web.positions[w * 3 + 2] = v.z;
        web.colors[w * 3] = 0.62 * bright;
        web.colors[w * 3 + 1] = 0.58 * bright;
        web.colors[w * 3 + 2] = 0.95 * bright;
        w++;
      };
      for (const a of nodes) {
        // node cluster
        for (let k = 0; k < 22; k++) {
          put(a.clone().add(new THREE.Vector3(gauss(rng), gauss(rng), gauss(rng)).multiplyScalar(0.12)), 1.15);
        }
        // filaments to the two nearest nodes
        const near = nodes
          .filter((b) => b !== a)
          .sort((b, c) => a.distanceToSquared(b) - a.distanceToSquared(c))
          .slice(0, 2);
        for (const b of near) {
          const mid = a.clone().lerp(b, 0.5).add(
            new THREE.Vector3(gauss(rng), gauss(rng), gauss(rng)).multiplyScalar(a.distanceTo(b) * 0.16),
          );
          const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
          for (let k = 0; k < 26; k++) {
            const v = curve.getPoint((k + rng() * 0.6) / 26);
            v.add(new THREE.Vector3(gauss(rng), gauss(rng), gauss(rng)).multiplyScalar(0.045));
            put(v, 0.45 + rng() * 0.3);
          }
        }
      }
      webSet.group.add(web.points);
      fadeMat(webSet, web.material, 0.9);
      // spin the visuals only — the group's focus frame must stay put
      webSet.update = (t) => { web.points.rotation.y = reduceMotion ? 0 : t * 0.008; };
    }

    // 2) Laniakea flows ------------------------------------------------ 10^24.6
    const flowSet = addSet(24.6, new THREE.Vector3(-0.5, 0.28, 0.15));
    {
      const rng = mulberry32(83);
      // the spin pivots on the attractor so the convergence point stays pinned
      // to the focus where the Local Group nests
      const attractor = new THREE.Vector3(-0.5, 0.28, 0.15);
      const flowSpin = new THREE.Group();
      flowSpin.position.copy(attractor);
      flowSet.group.add(flowSpin);
      const lineMat = track(new THREE.LineDashedMaterial({
        color: 0xd8c9a8, transparent: true, opacity: 0.5, dashSize: 0.16, gapSize: 0.34,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      for (let i = 0; i < 42; i++) {
        const th = rng() * Math.PI * 2;
        const ph = Math.acos(2 * rng() - 1);
        const r0 = 3.4 + rng() * 1.2;
        const start = new THREE.Vector3(
          r0 * Math.sin(ph) * Math.cos(th), r0 * Math.cos(ph) * 0.7, r0 * Math.sin(ph) * Math.sin(th),
        );
        const mid1 = start.clone().lerp(attractor, 0.35).add(new THREE.Vector3(gauss(rng), gauss(rng), gauss(rng)).multiplyScalar(0.7));
        const mid2 = start.clone().lerp(attractor, 0.72).add(new THREE.Vector3(gauss(rng), gauss(rng), gauss(rng)).multiplyScalar(0.3));
        const curve = new THREE.CatmullRomCurve3([start, mid1, mid2, attractor]);
        // express in flowSpin space (origin = attractor) so rotation pivots there
        const pts = curve.getPoints(70).map((v) => v.sub(attractor));
        const geo = track(new THREE.BufferGeometry().setFromPoints(pts));
        const line = new THREE.Line(geo, lineMat);
        line.computeLineDistances();
        flowSpin.add(line);
      }
      // galaxies riding the flows
      const dots = makePointCloud(900, 0.09, dot, 0.85);
      track(dots.points.geometry); track(dots.material);
      for (let i = 0; i < 900; i++) {
        const r = Math.pow(rng(), 0.5) * 4.2;
        const th = rng() * Math.PI * 2;
        const ph = Math.acos(2 * rng() - 1);
        dots.positions[i * 3] = r * Math.sin(ph) * Math.cos(th) - attractor.x;
        dots.positions[i * 3 + 1] = r * Math.cos(ph) * 0.7 - attractor.y;
        dots.positions[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th) - attractor.z;
        dots.colors[i * 3] = 0.85; dots.colors[i * 3 + 1] = 0.78; dots.colors[i * 3 + 2] = 0.6;
      }
      dots.points.geometry.attributes.position.needsUpdate = true;
      dots.points.geometry.attributes.color.needsUpdate = true;
      flowSpin.add(dots.points);
      fadeMat(flowSet, lineMat, 0.5);
      fadeMat(flowSet, dots.material, 0.85);
      flowSet.update = (t) => {
        if (!reduceMotion) {
          flowSpin.rotation.y = t * 0.012;
          flowSpin.rotation.x = Math.sin(t * 0.05) * 0.04;
        }
      };
    }

    // 3) the Local Group ------------------------------------------------ 10^22.9
    const groupSet = addSet(22.9, new THREE.Vector3(-1.15, -0.2, 0.25));
    {
      const mw = makePointCloud(750, 0.07, dot, 0.95);
      fillSpiralGalaxy(mw, 0.62, 5, 1);
      mw.points.position.set(-1.15, -0.2, 0.25);
      mw.points.rotation.set(0.5, 0.3, 0.1);
      const m31 = makePointCloud(850, 0.07, dot, 0.95);
      fillSpiralGalaxy(m31, 0.78, 9, 0.9);
      m31.points.position.set(1.35, 0.42, -0.4);
      m31.points.rotation.set(1.15, -0.4, 0.35);
      track(mw.points.geometry); track(mw.material);
      track(m31.points.geometry); track(m31.material);
      groupSet.group.add(mw.points, m31.points);
      const rng = mulberry32(61);
      const dwarfs = makePointCloud(420, 0.06, dot, 0.7);
      track(dwarfs.points.geometry); track(dwarfs.material);
      for (let i = 0; i < 420; i++) {
        const which = Math.floor(rng() * 14);
        const cx = Math.sin(which * 2.4) * 2.6, cy = Math.cos(which * 1.7) * 1.4, cz = Math.sin(which * 3.1) * 1.8;
        dwarfs.positions[i * 3] = cx + gauss(rng) * 0.09;
        dwarfs.positions[i * 3 + 1] = cy + gauss(rng) * 0.09;
        dwarfs.positions[i * 3 + 2] = cz + gauss(rng) * 0.09;
        dwarfs.colors[i * 3] = 0.6; dwarfs.colors[i * 3 + 1] = 0.55; dwarfs.colors[i * 3 + 2] = 0.5;
      }
      dwarfs.points.geometry.attributes.position.needsUpdate = true;
      dwarfs.points.geometry.attributes.color.needsUpdate = true;
      groupSet.group.add(dwarfs.points);
      fadeMat(groupSet, mw.material, 0.95);
      fadeMat(groupSet, m31.material, 0.95);
      fadeMat(groupSet, dwarfs.material, 0.7);
    }

    // 4) the Milky Way, up close ---------------------------------------- 10^20.9
    const sunMarkerLocal = new THREE.Vector3(1.55, 0.06, 1.55); // ~55% out, between arms
    const galaxySet = addSet(20.9, sunMarkerLocal.clone());
    let sunMarker: THREE.Mesh;
    {
      const gal = makePointCloud(9000, 0.075, dot, 1);
      fillSpiralGalaxy(gal, 4.0, 17, 1);
      track(gal.points.geometry); track(gal.material);
      galaxySet.group.add(gal.points);
      const markerMat = track(new THREE.MeshBasicMaterial({
        color: 0xffb454, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      sunMarker = new THREE.Mesh(track(new THREE.SphereGeometry(0.035, 12, 12)), markerMat);
      sunMarker.position.copy(sunMarkerLocal);
      const ringMat = track(new THREE.MeshBasicMaterial({
        color: 0xffb454, transparent: true, opacity: 0.55, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      const ring = new THREE.Mesh(track(new THREE.RingGeometry(0.07, 0.085, 40)), ringMat);
      ring.position.copy(sunMarkerLocal);
      galaxySet.group.add(sunMarker, ring);
      fadeMat(galaxySet, gal.material, 1);
      fadeMat(galaxySet, markerMat, 0.95);
      fadeMat(galaxySet, ringMat, 0.55);
      galaxySet.update = (t, s) => {
        // the arms swirl beneath a fixed marker so the zoom line stays true
        gal.points.rotation.y = reduceMotion ? 0 : t * 0.006;
        const pulse = reduceMotion ? 1 : 1 + 0.35 * Math.sin(t * 2.4);
        ring.scale.setScalar(pulse);
        ring.lookAt(camera.position);
        // the marker announces the sun's seat on approach, then steps aside
        const w = smooth01((s - 0.22) / 0.3) * (1 - smooth01((s - 2.0) / 1.1));
        markerMat.opacity *= w;
        ringMat.opacity *= w;
      };
      // tip the disc toward the camera; rotate the focus identically so the
      // sun's seat stays pinned to the zoom line
      galaxySet.group.rotation.x = -1.0;
      galaxySet.focus.applyEuler(new THREE.Euler(-1.0, 0, 0));
    }

    // 5) the stellar neighborhood (a tunnel of naked-eye stars) ---------- 10^19
    const tunnelSet = addSet(19.0, new THREE.Vector3(0, 0, 0));
    {
      const rng = mulberry32(101);
      const tun = makePointCloud(2300, 0.12, dot, 0.95);
      track(tun.points.geometry); track(tun.material);
      for (let i = 0; i < 2300; i++) {
        tun.positions[i * 3] = gauss(rng) * 2.6;
        tun.positions[i * 3 + 1] = gauss(rng) * 2.6;
        tun.positions[i * 3 + 2] = -34 + rng() * 40;
        const k = rng();
        if (k < 0.68) { tun.colors[i * 3] = 1.0; tun.colors[i * 3 + 1] = 0.75; tun.colors[i * 3 + 2] = 0.5; }
        else if (k < 0.92) { tun.colors[i * 3] = 1.0; tun.colors[i * 3 + 1] = 0.95; tun.colors[i * 3 + 2] = 0.85; }
        else { tun.colors[i * 3] = 0.65; tun.colors[i * 3 + 1] = 0.78; tun.colors[i * 3 + 2] = 1.0; }
        const dim = 0.4 + rng() * 0.6;
        tun.colors[i * 3] *= dim; tun.colors[i * 3 + 1] *= dim; tun.colors[i * 3 + 2] *= dim;
      }
      tun.points.geometry.attributes.position.needsUpdate = true;
      tun.points.geometry.attributes.color.needsUpdate = true;
      tunnelSet.group.add(tun.points);
      fadeMat(tunnelSet, tun.material, 0.95);
      // volumetric along the camera axis — arriving early it would compress
      // into a blob, so it only fades in once it has depth to offer
      tunnelSet.window = (x) => smooth01((x + 0.62) / 0.45) * (1 - smooth01((x - 0.8) / 0.9));
    }

    // 6) the Solar System ---------------------------------------------- 10^13.1
    // Natural units: Neptune's orbit at r=4 → 4.5e12 m; frame ≈ 9e12 m.
    const dayOfYear = (() => {
      const now = new Date();
      return (now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 0)) / 86400000;
    })();
    const earthAngle = ((dayOfYear - 80) / 365.25) * Math.PI * 2 + Math.PI;
    const AUu = 4 / 30; // scene units per AU
    const earthFocus = new THREE.Vector3(Math.cos(earthAngle) * AUu, 0, Math.sin(earthAngle) * AUu);
    const solarSet = addSet(13.1, earthFocus.clone());
    {
      const sunTex = track(makeSunTexture());
      const sunMat = track(new THREE.SpriteMaterial({
        map: sunTex, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      const sun = new THREE.Sprite(sunMat);
      sun.scale.setScalar(0.7);
      solarSet.group.add(sun);

      const ringMat = track(new THREE.LineBasicMaterial({
        color: 0x8b86a8, transparent: true, opacity: 0.34, depthWrite: false,
      }));
      const earthRingMat = track(new THREE.LineBasicMaterial({
        color: 0xffb454, transparent: true, opacity: 0.9, depthWrite: false,
      }));
      const planets: [number, number, number][] = [
        // [AU, dot radius, hue-ish color]
        [0.39, 0.012, 0x9c9488], [0.72, 0.02, 0xd9b98a], [1.0, 0.022, 0x6f9fd8],
        [1.52, 0.016, 0xc86a4a], [5.2, 0.05, 0xd8b48a], [9.55, 0.045, 0xd8c9a0],
        [19.2, 0.03, 0xa8d0d8], [30.05, 0.03, 0x7a95e0],
      ];
      const rng = mulberry32(7);
      planets.forEach(([au, size, color], idx) => {
        const r = au * AUu;
        const pts: THREE.Vector3[] = [];
        for (let k = 0; k <= 128; k++) {
          const a = (k / 128) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
        }
        const geo = track(new THREE.BufferGeometry().setFromPoints(pts));
        solarSet.group.add(new THREE.LineLoop(geo, idx === 2 ? earthRingMat : ringMat));
        const ang = idx === 2 ? earthAngle : rng() * Math.PI * 2;
        const mat = track(new THREE.MeshBasicMaterial({ color }));
        const dotMesh = new THREE.Mesh(track(new THREE.SphereGeometry(size, 12, 12)), mat);
        dotMesh.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
        solarSet.group.add(dotMesh);
      });
      solarSet.group.rotation.x = 0.42; // a three-quarter view of the ecliptic
      fadeMat(solarSet, sunMat, 1);
      fadeMat(solarSet, ringMat, 0.34);
      fadeMat(solarSet, earthRingMat, 0.9);
      solarSet.update = (_t, s) => {
        // keep the sun's glow from swallowing the view as we dive past it
        sun.scale.setScalar(0.7 / Math.pow(Math.max(s, 1), 0.4));
      };
    }
    // rotate the focus into the tilted frame so the earth-dot stays pinned
    solarSet.focus.applyEuler(new THREE.Euler(0.42, 0, 0));

    // 7) Earth, live ----------------------------------------------------- 10^7.35
    const earthSet = addSet(7.35, new THREE.Vector3(0, 0, 0));
    const earthSpin = new THREE.Group();
    const beacon = new THREE.Group();
    let atmoMat: THREE.ShaderMaterial;
    let earthMat: THREE.ShaderMaterial | null = null;
    {
      earthSet.group.add(earthSpin);
      const loader = new THREE.TextureLoader();
      const sphereGeo = track(new THREE.SphereGeometry(2.2, 72, 72));
      // placeholder until the texture arrives
      const placeholder = track(new THREE.MeshBasicMaterial({ color: 0x0d2c52 }));
      const earthMesh = new THREE.Mesh<THREE.SphereGeometry, THREE.Material>(sphereGeo, placeholder);
      earthSpin.add(earthMesh);
      loader.load("/earth-blue-marble-5400x2700.jpg", (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        earthMat = new THREE.ShaderMaterial({
          vertexShader: EARTH_VERT,
          fragmentShader: EARTH_FRAG,
          uniforms: {
            map: { value: tex },
            sunDir: { value: subsolarDirection(new Date()) },
          },
        });
        track(earthMat); track(tex);
        earthMesh.material = earthMat;
      });
      atmoMat = track(new THREE.ShaderMaterial({
        vertexShader: ATMO_VERT, fragmentShader: ATMO_FRAG,
        uniforms: { strength: { value: 1 } },
        transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
      }));
      earthSpin.add(new THREE.Mesh(track(new THREE.SphereGeometry(2.31, 48, 48)), atmoMat));

      // the pin
      const pinMat = track(new THREE.MeshBasicMaterial({
        color: 0xffb454, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      const pin = new THREE.Mesh(track(new THREE.SphereGeometry(0.028, 12, 12)), pinMat);
      const pulseMat = track(new THREE.MeshBasicMaterial({
        color: 0xffb454, transparent: true, opacity: 0.5, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      const pulse = new THREE.Mesh(track(new THREE.RingGeometry(0.05, 0.06, 40)), pulseMat);
      beacon.add(pin, pulse);
      earthSpin.add(beacon);
      const placeBeacon = (lat: number, lon: number) => {
        const dir = latLngToVec(lat, lon, 1);
        beacon.position.copy(dir.clone().multiplyScalar(2.225));
        beacon.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
      };
      placeBeacon(geoRef.current.lat, geoRef.current.lon);
      apiRef.current = { setBeacon: placeBeacon };

      // the Moon, to scale, on its real-radius orbit (visible on approach)
      const moonRingMat = track(new THREE.LineBasicMaterial({
        color: 0x8b86a8, transparent: true, opacity: 0.2, depthWrite: false,
      }));
      // tilted slightly so the orbit reads as an ellipse, not a hairline
      const moonSystem = new THREE.Group();
      moonSystem.rotation.x = 0.5;
      earthSet.group.add(moonSystem);
      const moonPts: THREE.Vector3[] = [];
      const moonR = 2.2 * 60.3;
      for (let k = 0; k <= 160; k++) {
        const a = (k / 160) * Math.PI * 2;
        moonPts.push(new THREE.Vector3(Math.cos(a) * moonR, 0, Math.sin(a) * moonR));
      }
      moonSystem.add(new THREE.LineLoop(track(new THREE.BufferGeometry().setFromPoints(moonPts)), moonRingMat));
      const moonMat = track(new THREE.MeshBasicMaterial({ color: 0xb8b4ac }));
      const moon = new THREE.Mesh(track(new THREE.SphereGeometry(0.6, 16, 16)), moonMat);
      const moonA = Math.PI * 0.3;
      moon.position.set(Math.cos(moonA) * moonR, 0, Math.sin(moonA) * moonR);
      moonSystem.add(moon);

      fadeMat(earthSet, pinMat, 0.95);
      fadeMat(earthSet, pulseMat, 0.5);
      fadeMat(earthSet, moonRingMat, 0.14);
      fadeMat(earthSet, atmoMat, 1);
      earthSet.update = (t) => {
        if (earthMat) earthMat.uniforms.sunDir.value = subsolarDirection(new Date());
        const k = reduceMotion ? 1 : 1 + 0.5 * Math.sin(t * 2.2);
        pulse.scale.setScalar(k);
      };
      // the Moon's orbit is 60 Earth-radii wide, so this set must wake long
      // before the globe itself fills the frame — and it never leaves
      earthSet.window = (x) => smooth01((x + 2.78) / 0.55);
    }

    // ----------------------------------------------------------------- loop
    const beaconTarget = new THREE.Quaternion();
    const identityQ = new THREE.Quaternion();
    const fadeWindow = (x: number) =>
      smooth01((x + 2.05) / 0.85) * (1 - smooth01((x - 0.62) / 0.95));

    const setStackVisible = (p: number, t: number, stackAlpha: number) => {
      const logM = pToLogM(p);
      for (const set of stack) {
        const s = Math.pow(10, set.ref - logM);
        const x = Math.log10(s);
        const a = (set.window ?? fadeWindow)(x) * stackAlpha;
        if (a <= 0.004 || s < 0.0012 || s > 70) { set.group.visible = false; continue; }
        set.group.visible = true;
        set.group.scale.setScalar(s);
        set.group.position.copy(set.focus).multiplyScalar(-s);
        for (const f of set.fades) f.mat.opacity = f.base * a;
        set.update?.(t, s);
      }
    };

    const colorTmp = new THREE.Color();
    const updateFuse = (logT: number, t: number) => {
      const expansion = expansionAt(logT);
      const clump = smooth01(mapRange(logT, 15.9, 17.3));
      const ignite = smooth01(mapRange(logT, 15.3, 16.4));
      eraColor(logT, fuseColor);
      const brightness = logT < 13.08 ? 1 : logT < 14.6 ? lerp(1, 0.42, mapRange(logT, 13.08, 14.6)) : lerp(0.42, 1, clump);
      for (let i = 0; i < FUSE_N; i++) {
        const r = expansion * fuseRad[i] * 4.4;
        let px = fuseDir[i * 3] * r;
        let py = fuseDir[i * 3 + 1] * r;
        let pz = fuseDir[i * 3 + 2] * r;
        if (clump > 0) {
          const c = fuseCluster[i] * 3;
          const spread = 0.28 + fuseJit[i] * 0.2;
          px = lerp(px, clusterCenters[c] + fuseDir[i * 3] * spread, clump);
          py = lerp(py, clusterCenters[c + 1] + fuseDir[i * 3 + 1] * spread, clump);
          pz = lerp(pz, clusterCenters[c + 2] + fuseDir[i * 3 + 2] * spread, clump);
        }
        fuse.positions[i * 3] = px;
        fuse.positions[i * 3 + 1] = py;
        fuse.positions[i * 3 + 2] = pz;
        const isStar = ignite > 0 && fuseJit[i] < ignite * 0.5;
        colorTmp.copy(isStar ? starColor : fuseColor);
        const tw = reduceMotion ? 1 : 0.85 + 0.15 * Math.sin(t * 2 + fuseJit[i] * 40);
        const k = brightness * (0.5 + fuseJit[i] * 0.5) * tw * (isStar ? 1.5 : 1);
        fuse.colors[i * 3] = colorTmp.r * k;
        fuse.colors[i * 3 + 1] = colorTmp.g * k;
        fuse.colors[i * 3 + 2] = colorTmp.b * k;
      }
      fuse.points.geometry.attributes.position.needsUpdate = true;
      fuse.points.geometry.attributes.color.needsUpdate = true;
      if (!reduceMotion) fuse.points.rotation.y = t * 0.01;
      // recombination flash + the big one at the start
      const recomb = Math.exp(-Math.pow((logT - 13.08) / 0.35, 2));
      const bang = Math.exp(-Math.pow((logT + 34) / 2.4, 2));
      flashMat.opacity = Math.min(0.5, recomb * 0.34 + bang * 0.5);
    };

    // DOM update helpers (all imperative, once per frame)
    const vec = new THREE.Vector3();
    const projectMarker = (p: number) => {
      const el = markerRef.current;
      if (!el) return;
      const logM = pToLogM(p);
      const s = Math.pow(10, galaxySet.ref - logM);
      const visible = p > 0.335 && p < 0.7 && s > 0.35 && s < 6 && galaxySet.group.visible;
      if (!visible) { el.style.opacity = "0"; return; }
      vec.copy(sunMarker.position);
      galaxySet.group.localToWorld(vec);
      vec.project(camera);
      if (vec.z > 1) { el.style.opacity = "0"; return; }
      const w = host.clientWidth, h = host.clientHeight;
      el.style.opacity = String(0.9 * fadeWindow(Math.log10(s)));
      el.style.left = `${(vec.x * 0.5 + 0.5) * w}px`;
      el.style.top = `${(-vec.y * 0.5 + 0.5) * h}px`;
    };

    const updateChrome = (p: number) => {
      // altimeter
      const mode: AltimeterMode = p < 0.338 ? "time" : p < 0.908 ? "scale" : "now";
      setAltMode(mode);
      if (cursorRef.current) {
        let f = 0;
        if (mode === "time") f = mapRange(pToLogT(p), TIME_RANGE[0], TIME_RANGE[1]);
        else if (mode === "scale") f = mapRange(pToLogM(p), SCALE_RANGE[0], SCALE_RANGE[1]);
        else f = 1;
        cursorRef.current.style.top = `${(f * 100).toFixed(2)}%`;
      }
      // readout
      const big = readoutBigRef.current, small = readoutSmallRef.current;
      if (big && small) {
        if (mode === "time") {
          const logT = pToLogT(p);
          big.textContent = formatAge(logT);
          small.textContent = `after the beginning · ~${formatTemp(logT)}`;
        } else if (mode === "scale") {
          const logM = pToLogM(p);
          big.textContent = formatSpan(logM);
          small.textContent = `across this view · 10${sup(Math.floor(logM))} m`;
        } else {
          const now = new Date();
          big.textContent = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          small.textContent = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
        }
      }
      // narration beat
      let idx = -1;
      for (let i = 0; i < BEATS.length; i++) {
        if (p >= BEATS[i].from && p <= BEATS[i].to) { idx = i; break; }
      }
      setBeatIdx(idx);
      if (beatTimeRef.current) {
        const now = new Date();
        beatTimeRef.current.textContent = `…it is ${now.toLocaleDateString(undefined, { weekday: "long" })}, ${now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}.`;
      }
      // address
      let count = 0;
      for (const line of ADDRESS) if (p >= line.p) count++;
      setAddrCount(count);
      if (addrCoordsRef.current) {
        addrCoordsRef.current.textContent = formatCoords(geoRef.current.lat, geoRef.current.lon);
      }
      if (addrTimeRef.current) {
        addrTimeRef.current.textContent = new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      }
      setStarted(p > 0.004);
      setArrived(p > 0.9);
      setEnded(p > 0.985);
    };

    let raf = 0;
    let last = performance.now();
    let mirrorFade = 0;
    const tick = (nowMs: number) => {
      const dt = Math.min((nowMs - last) / 1000, 0.25);
      last = nowMs;
      const t = nowMs * 0.001;

      // scroll → smoothed progress
      const rootEl = journeyRef.current;
      if (rootEl) {
        const rect = rootEl.getBoundingClientRect();
        const range = rect.height - window.innerHeight;
        const target = range > 0 ? clamp01(-rect.top / range) : 0;
        const prev = smoothRef.current;
        const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 10);
        let next = prev + (target - prev) * k;
        if (Math.abs(next - target) < 0.0004) next = target;
        smoothRef.current = next;
      }
      const p = smoothRef.current;

      // mirror dims the cosmos so the reader shines through
      mirrorFade += ((mirrorOnRef.current ? 1 : 0) - mirrorFade) * (1 - Math.exp(-dt * 3));
      const stackAlpha = smooth01(mapRange(p, 0.332, 0.372)) * lerp(1, 0.16, mirrorFade);

      // Movement I
      const fuseAlpha = (1 - smooth01(mapRange(p, 0.335, 0.378))) * lerp(1, 0.16, mirrorFade);
      fuse.points.visible = fuseAlpha > 0.004;
      if (fuse.points.visible) {
        fuse.material.opacity = fuseAlpha;
        updateFuse(pToLogT(p), t);
      } else {
        flashMat.opacity = 0;
      }

      // Movements II & III
      setStackVisible(p, t, stackAlpha);

      // Movement III: turn the reader's pin to face the camera
      const face = smooth01(mapRange(p, 0.905, 0.96));
      if (face > 0) {
        const dir = beacon.position.clone().normalize();
        beaconTarget.setFromUnitVectors(dir, new THREE.Vector3(0, 0.12, 1).normalize());
        earthSpin.quaternion.slerpQuaternions(identityQ, beaconTarget, face);
      } else {
        earthSpin.quaternion.identity();
      }

      // ambient drift
      bg.points.rotation.y = (reduceMotion ? 0 : t * 0.0035) + p * 0.35;
      bg.material.opacity = 0.55 * lerp(1, 0.75, mirrorFade);

      droneRef.current?.set(p);
      projectMarker(p);
      updateChrome(p);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      apiRef.current = null;
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      for (const d of disposables) d.dispose();
      renderer.domElement.remove();
    };
    // The scene mounts exactly once; everything dynamic flows through refs.
  }, []);

  // ----------------------------------------------------------------- sound
  const toggleSound = useCallback(() => setSoundOn((on) => !on), []);
  useEffect(() => {
    if (soundOn) {
      if (!droneRef.current) droneRef.current = makeDrone();
      droneRef.current.enable();
    } else {
      droneRef.current?.disable();
    }
  }, [soundOn]);
  useEffect(() => () => { droneRef.current?.dispose(); }, []);

  // ------------------------------------------------------------- location
  const usePreciseLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        geoRef.current = { lat: pos.coords.latitude, lon: pos.coords.longitude, precise: true };
        apiRef.current?.setBeacon(pos.coords.latitude, pos.coords.longitude);
        setGeoLabel("precise");
      },
      () => { /* declined — the clock estimate stands */ },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }, []);

  // --------------------------------------------------------------- mirror
  const openMirror = useCallback(async () => {
    setMirror("pending");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, audio: false,
      });
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((tr) => tr.stop());
        return;
      }
      video.srcObject = stream;
      await video.play();
      mirrorOnRef.current = true;
      setMirror("on");
    } catch {
      setMirror("denied");
    }
  }, []);
  const closeMirror = useCallback(() => {
    const video = videoRef.current;
    const stream = video?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((tr) => tr.stop());
    if (video) video.srcObject = null;
    mirrorOnRef.current = false;
    setMirror("off");
  }, []);
  useEffect(() => () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((tr) => tr.stop());
  }, []);

  // --------------------------------------------------------------- restart
  const backToBeginning = useCallback(() => {
    const root = journeyRef.current;
    if (!root) return;
    const top = root.getBoundingClientRect().top + window.scrollY;
    const startY = window.scrollY;
    const startT = performance.now();
    cancelAnimationFrame(scrollAnimRef.current);
    const step = (now: number) => {
      const t = clamp01((now - startT) / 2200);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, startY + (top - startY) * e);
      if (t < 1) scrollAnimRef.current = requestAnimationFrame(step);
    };
    scrollAnimRef.current = requestAnimationFrame(step);
  }, []);

  // ------------------------------------------------------------------- UI
  const beat = beatIdx >= 0 ? BEATS[beatIdx] : null;
  const ticks = altMode === "time" ? TIME_TICKS : SCALE_TICKS;
  const range = altMode === "time" ? TIME_RANGE : SCALE_RANGE;

  return (
    <div ref={journeyRef} className="yah relative bg-[#050308] text-[#f2ece1]">
      <style>{`
        @keyframes yahRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes yahLine { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes yahPulse { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
        .yah ::selection { background: rgba(255, 180, 84, 0.35); }
      `}</style>

      <div className="relative" style={{ height: `calc(${SCROLL_VH}vh + 100vh)` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* the mirror — beneath the cosmos, revealed only by invitation */}
          <video
            ref={videoRef}
            muted
            playsInline
            aria-label="Your camera, mirrored — video stays on this device"
            className="absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-[1600ms]"
            style={{
              transform: "scaleX(-1)",
              filter: "grayscale(0.35) sepia(0.22) brightness(0.72) contrast(1.06)",
              opacity: mirror === "on" ? 1 : 0,
            }}
          />
          {mirror === "on" ? (
            <div
              className="pointer-events-none absolute inset-0 z-[5]"
              style={{ background: "radial-gradient(ellipse at center, transparent 38%, rgba(5,3,8,0.88) 100%)" }}
            />
          ) : null}

          {/* the cosmos */}
          <div ref={canvasHostRef} className="pointer-events-none absolute inset-0 z-10 [&>canvas]:h-full [&>canvas]:w-full" />

          {/* cinematic vignette */}
          <div
            className="pointer-events-none absolute inset-0 z-20"
            style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(3,2,6,0.55) 100%)" }}
          />

          {/* projected label: the Sun's seat in the galaxy */}
          <div
            ref={markerRef}
            className="pointer-events-none absolute z-30 -translate-x-1/2 translate-y-3 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ffb454] opacity-0 transition-opacity duration-300"
          >
            ↑ you are here
          </div>

          {/* lab badge */}
          <div className="pointer-events-none absolute left-5 top-5 z-40 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8a8378]">
            Lab experiment · You Are Here
          </div>

          {/* spacetime altimeter */}
          <div className="pointer-events-none absolute left-5 top-1/2 z-40 hidden h-[62vh] -translate-y-1/2 sm:block">
            <div className="relative h-full w-px bg-[#f2ece1]/15">
              {altMode !== "now" ? (
                ticks.map(([v, label]) => {
                  const f = mapRange(v, range[0], range[1]);
                  return (
                    <div key={label} className="absolute left-0" style={{ top: `${f * 100}%` }}>
                      <div className="h-px w-2 bg-[#f2ece1]/40" />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[9px] uppercase tracking-[0.18em] text-[#8a8378]">
                        {label}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="absolute left-3.5 top-full mt-2 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.22em] text-[#ffb454] [animation:yahPulse_2.2s_ease-in-out_infinite]">
                  now
                </div>
              )}
              <div
                ref={cursorRef}
                className="absolute -left-[3px] h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-[#ffb454] shadow-[0_0_12px_rgba(255,180,84,0.9)]"
                style={{ top: "0%" }}
              />
            </div>
            <div className="absolute -left-1 top-[-26px] text-[9px] font-bold uppercase tracking-[0.24em] text-[#8a8378]">
              {altMode === "time" ? "time" : altMode === "scale" ? "size" : "·"}
            </div>
          </div>

          {/* the cosmic address, typing itself */}
          <div className="absolute right-5 top-5 z-40 w-[15.5rem] text-right sm:right-8 sm:top-8">
            <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#8a8378]">
              your cosmic address
            </div>
            <div className="mt-2 space-y-1 font-mono">
              {ADDRESS.slice(0, addrCount).map((line) => (
                <div key={line.line} className="[animation:yahLine_0.7s_ease_both]">
                  <span className="text-[11px] tracking-[0.08em] text-[#f2ece1]">
                    {line.line === "@COORDS@" ? (
                      <>
                        <span ref={addrCoordsRef} />
                        <span className="text-[#8a8378]"> · {geoLabel === "precise" ? "your location" : "est. from your clock"}</span>
                      </>
                    ) : (
                      line.line
                    )}
                  </span>
                  {line.note ? (
                    <span className="ml-2 text-[9px] text-[#8a8378]">
                      {line.note === "@TIME@" ? <span ref={addrTimeRef} /> : line.note}
                    </span>
                  ) : null}
                </div>
              ))}
              {addrCount > 0 && addrCount < ADDRESS.length ? (
                <div className="text-[11px] text-[#ffb454] [animation:yahPulse_1.2s_steps(2)_infinite]">▌</div>
              ) : null}
            </div>
            {arrived && geoLabel === "estimated" ? (
              <button
                type="button"
                onClick={usePreciseLocation}
                className="mt-3 cursor-pointer border border-[#f2ece1]/15 bg-black/40 px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#c9c2b4] backdrop-blur-sm transition-colors hover:border-[#ffb454]/50 hover:text-[#ffb454]"
              >
                ◎ pin my precise location
              </button>
            ) : null}
          </div>

          {/* the big readout */}
          <div className="pointer-events-none absolute bottom-6 left-5 z-40 sm:bottom-8 sm:left-8">
            <div ref={readoutBigRef} className="font-mono text-2xl font-extralight tabular-nums tracking-tight text-[#f2ece1] sm:text-4xl" />
            <div ref={readoutSmallRef} className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#8a8378]" />
          </div>

          {/* narration */}
          {beat ? (
            <div
              key={beatIdx}
              className="pointer-events-none absolute bottom-[16vh] left-1/2 z-40 w-[min(38rem,calc(100vw-3rem))] -translate-x-1/2 text-center [animation:yahRise_0.9s_ease_both]"
            >
              <h2 className="text-2xl font-light leading-tight tracking-tight text-[#f2ece1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] sm:text-4xl">
                {beat.title}
              </h2>
              {beat.live ? (
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#c9c2b4] sm:text-base">
                  <span ref={beatTimeRef} />
                </p>
              ) : beat.sub ? (
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#c9c2b4] sm:text-base">{beat.sub}</p>
              ) : null}
            </div>
          ) : null}

          {/* the mirror invitation */}
          {arrived ? (
            <div className="absolute bottom-6 left-1/2 z-40 -translate-x-1/2 text-center sm:bottom-8">
              {mirror === "on" ? (
                <button
                  type="button"
                  onClick={closeMirror}
                  className="cursor-pointer border border-[#f2ece1]/15 bg-black/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9c2b4] backdrop-blur-sm transition-colors hover:text-[#f2ece1]"
                >
                  ✕ close the mirror
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={openMirror}
                    disabled={mirror === "pending"}
                    className="cursor-pointer border border-[#ffb454]/40 bg-black/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ffb454] backdrop-blur-sm transition-colors hover:bg-[#ffb454]/10 disabled:opacity-50"
                  >
                    {mirror === "pending" ? "opening…" : "☉ see yourself in it"}
                  </button>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-[#8a8378]">
                    {mirror === "denied"
                      ? "camera declined — you are still here"
                      : "your camera, mirrored into the cosmos — stays on this device, never recorded"}
                  </p>
                </>
              )}
            </div>
          ) : null}

          {/* sound */}
          <button
            type="button"
            onClick={toggleSound}
            className="absolute bottom-6 right-5 z-40 cursor-pointer border border-[#f2ece1]/15 bg-black/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9c2b4] backdrop-blur-sm transition-colors hover:text-[#f2ece1] sm:bottom-8 sm:right-8"
            aria-pressed={soundOn}
          >
            {soundOn ? "● sound on" : "○ sound off"}
          </button>

          {/* restart */}
          {ended ? (
            <button
              type="button"
              onClick={backToBeginning}
              className="absolute left-5 top-12 z-40 cursor-pointer border border-[#f2ece1]/15 bg-black/40 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9c2b4] backdrop-blur-sm transition-colors hover:text-[#f2ece1]"
            >
              ↺ begin again
            </button>
          ) : null}

          {/* opening cue */}
          <div
            className={`pointer-events-none absolute bottom-[7vh] left-1/2 z-40 -translate-x-1/2 text-center transition-opacity duration-700 ${started ? "opacity-0" : "opacity-100"}`}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8a8378] [animation:yahPulse_2.6s_ease-in-out_infinite]">
              scroll
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
