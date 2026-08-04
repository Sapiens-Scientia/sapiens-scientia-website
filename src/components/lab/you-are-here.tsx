"use client";

// ============================================================================
// THE HISTORY OF THE UNIVERSE — a scroll through everything     (the homepage)
// (born as "You Are Here"; file and export names keep the original slug)
//
// The brief (self-prompt):
//   One unbroken shot from the first instant of time to the reader's own
//   ticking second. Scroll is the only control and it changes meaning as you
//   go: first a throttle through time (all 13.8 billion years), then a descent
//   through space (an exponential zoom down the reader's cosmic mailing
//   address), then it runs out of universe and lands on NOW — a live clock,
//   the sun's real terminator, a pin near the reader, and finally (by
//   invitation only) the reader themselves — a small live camera porthole
//   hanging from their pin on the globe, the last object in the zoom.
//   A spacetime altimeter rides the left edge; its units flip
//   from seconds to metres to o'clock. Every number is true. Procedural
//   everything; the only texture allowed is the blue marble. The tone is a
//   poem with correct units, and the ending is quiet.
//
// Standalone by design: one component, no site chrome. Born as a lab
// experiment; now the landing page, handing off to /meta-earth at the end.
// ============================================================================

import * as THREE from "three";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppProvider } from "@/components/earthview/contexts";
import { useSunlightPreview } from "@/hooks/use-sunlight-preview";
import { guessLocation } from "@/lib/guess-location";
import { getChartContinuationCamera } from "@/components/lab/earth-geometry";

// The finale opens from the orbit chart's own viewpoint — same ecliptic
// frame, same elevation — so the sun arrow lands exactly where the chart's
// sun was, on any date. Constant by construction.
const FINALE_CAMERA = getChartContinuationCamera();

// The finale is the lab's own copy of the site's Current Earth Sunlight model
// — season halo, timezone ring, subsolar annual track and all — extended for
// this UX: camera aimed at the reader's location, home-marker projection for
// the porthole, and drag-to-rotate with the wheel left to page scroll.
const SunlightGlobe = dynamic(
  () => import("@/components/lab/lab-earth-view").then((m) => m.LabEarthView),
  { ssr: false },
);

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
/** Fade in over [a,b], hold, fade out over [c,d]. */
const winP = (p: number, a: number, b: number, c: number, d: number) =>
  smooth01(mapRange(p, a, b)) * (1 - smooth01(mapRange(p, c, d)));

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

function formatCoords(lat: number, lon: number) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(1)}°${ns}, ${Math.abs(lon).toFixed(1)}°${ew}`;
}

// Orbital position helpers, matching the tuned geometry of the site's
// EarthView scenes: progress 0..1 through the calendar year, and the ring
// convention angle = progress·2π + π/2 with z negated.
function getOrbitalProgress(date: Date) {
  const y = date.getFullYear();
  const start = new Date(y, 0, 1).getTime();
  const end = new Date(y + 1, 0, 1).getTime();
  return (date.getTime() - start) / (end - start);
}
function progressForDate(year: number, monthIndex: number, day: number) {
  return getOrbitalProgress(new Date(year, monthIndex, day));
}
function orbitPos(progress: number, radius: number, y = 0) {
  const a = progress * Math.PI * 2 + Math.PI / 2;
  return new THREE.Vector3(Math.cos(a) * radius, y, -Math.sin(a) * radius);
}

// ---------------------------------------------------------------------------
// The script: journey coordinates, narration, and the address label
// ---------------------------------------------------------------------------

// Scroll fraction → log10(seconds since the Big Bang). Movement I, through
// the birth of the Milky Way (~17.06) and the Sun (~17.46); after that the
// clock hands over to Earth-age time below. Stops are placed so the clock
// reaches each narrated moment INSIDE its caption's window — nucleosynthesis
// while "Three minutes in" is up, recombination (and its flash) mid-way
// through "380,000 years" — then dwells at the Sun's formation while the
// planets condense.
const TIME_STOPS: [number, number][] = [
  [0.02, -43], [0.045, -35], [0.075, 0], [0.09, 2.26],
  [0.13, 13.08], [0.19, 15.8], [0.24, 16.6], [0.3, 17.06],
  [0.33, 17.4629], [0.363, 17.4655],
];
const pToLogT = piecewise(TIME_STOPS);

// Scroll fraction → millions of years BEFORE PRESENT, for Earth's own history
// (Movement I·b). Dwells sit on the geologic beats.
const AGO_STOPS: [number, number][] = [
  [0.365, 4540], [0.418, 4000], [0.46, 2600], [0.468, 2400], [0.494, 800],
  [0.5, 650], [0.505, 538.8],
  // the vertebrate → human climb, paced so each milestone gets even scroll
  [0.516, 425], [0.524, 375], [0.532, 320], [0.54, 210], [0.548, 66],
  [0.553, 20], [0.558, 6], [0.562, 0.3], [0.575, 0],
];
const pToAgoMa = piecewise(AGO_STOPS);

// The geologic time scale rail (colors shared with the site's galaxy helix).
const GEO_EONS = [
  { name: "Hadean", from: 4540, to: 4000, color: "#dc2626" },
  { name: "Archean", from: 4000, to: 2500, color: "#facc15" },
  { name: "Proterozoic", from: 2500, to: 538.8, color: "#8b5cf6" },
  { name: "Phanerozoic", from: 538.8, to: 0, color: "#16a34a" },
];
const EARTH_AGE_MA = 4540;

function eonAt(agoMa: number) {
  if (agoMa > 4000) return "Hadean";
  if (agoMa > 2500) return "Archean";
  if (agoMa > 538.8) return "Proterozoic";
  return "Phanerozoic";
}

function formatAgo(agoMa: number) {
  if (agoMa >= 1000) return `${(agoMa / 1000).toFixed(2)} billion years ago`;
  if (agoMa >= 1) return `${Math.round(agoMa).toLocaleString()} million years ago`;
  if (agoMa > 0.001) return `${Math.round(agoMa * 1e6).toLocaleString()} years ago`;
  return "today";
}

// ---------------------------------------------------------------------------
// The Thread of Life: the evolutionary lineage that leads, unbroken, from the
// first cell to Homo sapiens, drawn beside the aging Earth. The main thread is
// our own ancestry — a luminous gold line running down from the oldest life at
// the top to you at the bottom, matching the altimeter's oldest-on-top axis;
// the muted branches forking off it are the rest of the bush of life. Nodes
// light as the aging globe's clock (agoMa) passes each one. SVG viewBox is
// 0 0 300 640; the thread is authored top→bottom so it draws on as time runs.
// ---------------------------------------------------------------------------

type LifeNode = { age: number; x: number; y: number; label: string; sub: string };

// Oldest first (top of the SVG) → newest last (bottom). x wanders gently for
// an organic descent; y is hand-spaced, compressing toward the recent so the
// vertebrate → human story gets room near the bottom.
const LIFE_NODES: LifeNode[] = [
  { age: 3800, x: 150, y: 36, label: "First life", sub: "3.8 billion years ago" },
  { age: 2100, x: 168, y: 95, label: "The complex cell", sub: "2.1 billion years ago" },
  { age: 800, x: 138, y: 154, label: "First animals", sub: "800 million years ago" },
  { age: 540, x: 170, y: 212, label: "Backbones", sub: "540 Mya · the Cambrian" },
  { age: 425, x: 140, y: 265, label: "Jawed fish", sub: "425 million years ago" },
  { age: 375, x: 172, y: 318, label: "Onto land", sub: "375 Mya · first walkers" },
  { age: 320, x: 142, y: 369, label: "Eggs on dry land", sub: "320 million years ago" },
  { age: 210, x: 170, y: 420, label: "First mammals", sub: "210 million years ago" },
  { age: 66, x: 144, y: 472, label: "Primates", sub: "66 Mya · after the dinosaurs" },
  { age: 20, x: 168, y: 523, label: "Apes", sub: "20 million years ago" },
  { age: 6, x: 150, y: 566, label: "Upright walkers", sub: "6 Mya · the first hominins" },
  { age: 0.3, x: 150, y: 606, label: "Homo sapiens", sub: "300,000 years ago · you" },
];

// The bush: a short tendril forking left off a lineage node into the dark, one
// for each of the great groups that split away from our own line.
type LifeBranch = { forkIdx: number; label: string };
const LIFE_BRANCHES: LifeBranch[] = [
  { forkIdx: 0, label: "Bacteria · Archaea" },
  { forkIdx: 1, label: "Plants · Fungi" },
  { forkIdx: 2, label: "Insects · Molluscs" },
  { forkIdx: 4, label: "Sharks" },
  { forkIdx: 5, label: "Amphibians" },
  { forkIdx: 6, label: "Reptiles · Dinosaurs · Birds" },
  { forkIdx: 7, label: "Other mammals" },
  { forkIdx: 8, label: "Monkeys" },
  { forkIdx: 9, label: "Gorillas · Chimpanzees" },
  { forkIdx: 10, label: "Other Homo species" },
];

const LIFE_Y_OLDEST = LIFE_NODES[0].y;
const LIFE_Y_NEWEST = LIFE_NODES[LIFE_NODES.length - 1].y;

// The SVG path (a smooth Catmull-Rom-ish curve) through the lineage nodes,
// authored oldest→newest (top→bottom) so a stroke-dash reveal reads as life
// descending the page as time advances.
const LIFE_THREAD_D = (() => {
  const pts = LIFE_NODES.map((n) => [n.x, n.y] as const);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const my = (y0 + y1) / 2;
    d += ` C ${x0} ${my}, ${x1} ${my}, ${x1} ${y1}`;
  }
  return d;
})();

// Interpolate the descent height (SVG y) reached at a given age, so the thread
// and its "front" marker sit exactly where the clock is.
function lifeYAtAge(age: number) {
  if (age >= LIFE_NODES[0].age) return LIFE_Y_OLDEST;
  const last = LIFE_NODES[LIFE_NODES.length - 1];
  if (age <= last.age) return LIFE_Y_NEWEST;
  for (let i = 0; i < LIFE_NODES.length - 1; i++) {
    const a = LIFE_NODES[i];
    const b = LIFE_NODES[i + 1];
    if (age <= a.age && age >= b.age) {
      const t = (a.age - age) / (a.age - b.age || 1);
      return a.y + (b.y - a.y) * t;
    }
  }
  return LIFE_Y_NEWEST;
}

// Scroll fraction → log10(metres across the view). Movements II & III.
// Dwells sit on each address line; the long plunges land on the "emptiness"
// beats between them. Starts after the pivot's beat of black.
const SCALE_STOPS: [number, number][] = [
  [0.602, 26.95], [0.63, 26.2], [0.657, 24.6], [0.695, 22.9], [0.739, 20.9],
  [0.763, 19.55], [0.783, 18.85], [0.807, 17.9], [0.84, 14.6], [0.853, 13.4],
  [0.874, 12.6], [0.893, 11.78], [0.906, 11.6], [0.936, 7.35], [1.0, 7.35],
];
const pToLogM = piecewise(SCALE_STOPS);

type Beat = {
  from: number;
  to: number;
  title: string;
  sub?: string;
  live?: boolean;
  /** Renders as a full-center chapter card — a hard reset between movements. */
  chapter?: boolean;
};

const BEATS: Beat[] = [
  // Movement I — cosmic time
  { from: 0.0, to: 0.028, title: "This is everything there is.", sub: "Every galaxy, every atom of you — in a point smaller than small. Scroll, and let it begin." },
  { from: 0.032, to: 0.064, title: "10⁻³⁵ seconds", sub: "Space itself tears outward, doubling and doubling, faster than light." },
  { from: 0.069, to: 0.106, title: "Three minutes in", sub: "The universe is a furnace forging the first nuclei — hydrogen and helium, the stuff of every future sun." },
  { from: 0.111, to: 0.15, title: "380,000 years", sub: "The fog clears and light gets loose. That first flash is still all around you — part of the static between radio stations." },
  { from: 0.155, to: 0.192, title: "The dark ages", sub: "A hundred million years of nothing but cooling gas. Then, one by one, the lights come on." },
  { from: 0.197, to: 0.24, title: "The age of galaxies", sub: "Gravity spends billions of years braiding gas into hundreds of billions of galaxies." },
  // Movement I·b — home is built
  { from: 0.246, to: 0.3, title: "Home is built", sub: "Our galaxy assembles itself out of smaller ones. The disc you live in settles into a slow, patient spin." },
  { from: 0.306, to: 0.362, title: "9.2 billion years in", sub: "A cloud of recycled star-dust collapses. A new sun switches on, and the leftovers dry into worlds." },
  { from: 0.368, to: 0.423, title: "Earth, day one", sub: "A ball of molten rock under a rain of asteroids. One collision the size of a planet carves off the Moon." },
  { from: 0.428, to: 0.462, title: "3.7 billion years ago", sub: "In the young oceans, chemistry learns to copy itself — and one unbroken thread of that first life leads, cell by cell, all the way to you." },
  { from: 0.466, to: 0.5, title: "2.4 billion years ago", sub: "Microbes exhale oxygen; the sky turns blue. Then cells learn to keep a nucleus — the start of everything larger than a smudge." },
  { from: 0.505, to: 0.518, title: "540 million years ago", sub: "The Cambrian explosion invents almost every kind of body at once — including the first with a nerve cord down its back, the line that becomes us." },
  { from: 0.521, to: 0.532, title: "375 million years ago", sub: "A fish with sturdy fins hauls itself onto land. Every animal that has walked since is its descendant." },
  { from: 0.535, to: 0.549, title: "In the dinosaurs' shadow", sub: "For 150 million years our ancestors stay small and warm-blooded. Then, 66 million years ago, the sky falls — and the survivors inherit the world." },
  { from: 0.553, to: 0.569, title: "300,000 years ago", sub: "Homo sapiens: one twig, on one branch, of a 3.7-billion-year-old tree — now looking back down its own trunk." },
  // pivot — a hard chapter break between time and space
  { from: 0.572, to: 0.607, chapter: true, title: "That brings us to the present universe.", sub: "All of time has passed — the clock reads today. Now we cross space instead: from everything we can see, down to you." },
  // Movement II — the descent
  { from: 0.612, to: 0.65, title: "The observable universe", sub: "93 billion light-years of cosmic web — every thread a chain of galaxies. Your address starts here." },
  { from: 0.65, to: 0.685, title: "Laniakea", sub: "“Immeasurable heaven”: a hundred thousand galaxies drifting the same slow current. One of them matters to you." },
  { from: 0.69, to: 0.728, title: "The Local Group", sub: "The spiral ahead is home. The other big one arrives in about four billion years. No rush." },
  { from: 0.733, to: 0.77, title: "The Milky Way", sub: "The spiral we watched assemble — a hundred thousand light-years, several hundred billion stars. You live between two arms." },
  { from: 0.774, to: 0.806, title: "The neighborhood", sub: "Every star any human eye has ever seen, unaided, lives inside this one small bright bubble." },
  { from: 0.812, to: 0.848, title: "And in between", sub: "Almost all of everything is this: nothing. Cold, clean, patient vacuum." },
  { from: 0.852, to: 0.886, title: "One ordinary star", sub: "The sun we watched ignite, with its eight worlds. Yours is the third — the damp one." },
  { from: 0.89, to: 0.912, title: "One year, from above", sub: "Earth's whole orbit, annotated: the months are places on this ring, and “today” is a location. There you are, on it." },
  { from: 0.912, to: 0.935, title: "Earth, live", sub: "The daylight on this globe is where daylight actually is, this second." },
  { from: 0.941, to: 0.97, title: "And after 13.8 billion years…", live: true },
  { from: 0.973, to: 1.01, title: "You are the universe, 13.8 billion years in, looking back at itself.", sub: "Every “here” is the center. This one is yours." },
];

// Each line stamps in the moment its object becomes recognizable on screen
// (fade-in complete), not at the zoom's deepest dwell — the label greets the
// thing, it doesn't eulogize it.
const ADDRESS: { p: number; line: string; note: string }[] = [
  { p: 0.618, line: "OBSERVABLE UNIVERSE", note: "8.8×10²⁶ m" },
  { p: 0.648, line: "LANIAKEA SUPERCLUSTER", note: "~5×10²⁴ m" },
  { p: 0.678, line: "THE LOCAL GROUP", note: "~10²³ m" },
  { p: 0.722, line: "MILKY WAY GALAXY", note: "9×10²⁰ m" },
  { p: 0.775, line: "ORION–CYGNUS ARM", note: "~10¹⁹ m" },
  { p: 0.852, line: "THE SOLAR SYSTEM", note: "~10¹³ m" },
  { p: 0.89, line: "EARTH ORBIT", note: "3×10¹¹ m" },
  { p: 0.911, line: "EARTH", note: "1.27×10⁷ m" },
  { p: 0.945, line: "@COORDS@", note: "" },
  { p: 0.958, line: "NOW", note: "@TIME@" },
  { p: 0.978, line: "YOU", note: "13.8 billion years in the making" },
];

const TIME_TICKS: [number, string][] = [
  [-43, "10⁻⁴³ s"], [-35, "inflation"], [0, "1 second"], [2.26, "3 minutes"],
  [13.08, "380,000 yr"], [15.8, "first stars"], [16.6, "galaxies"],
  [17.06, "the Milky Way"], [17.4655, "the Sun"],
];
const SCALE_TICKS: [number, string][] = [
  [26.9, "observable universe"], [24.7, "Laniakea"], [23.0, "Local Group"],
  [21.0, "Milky Way"], [19.0, "the neighborhood"], [13.1, "Solar System"],
  [11.75, "Earth's orbit"], [7.35, "Earth"],
];

// The altimeter lays out its ticks — and moves its cursor — in SCROLL space:
// the fraction of the journey at which each value is actually reached. A
// linear log/Ma axis crushed the eventful late universe into the rail's last
// few pixels (and the whole Phanerozoic into a sliver) while the cursor
// sprinted, then crawled. Story-paced spacing keeps the cursor gliding evenly
// with the scroll; the labels still carry the true values.
const TIME_P: [number, number] = [0.02, 0.363];
const GEO_P: [number, number] = [0.365, 0.575];
const SCALE_P: [number, number] = [0.602, 0.936];

/** Inverse of piecewise(): the x at which the map first reaches value v. */
function pAt(stops: [number, number][], v: number) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [x0, y0] = stops[i];
    const [x1, y1] = stops[i + 1];
    if (v >= Math.min(y0, y1) && v <= Math.max(y0, y1)) {
      return x0 + ((v - y0) / (y1 - y0 || 1)) * (x1 - x0);
    }
  }
  const [firstX, firstY] = stops[0];
  const [lastX, lastY] = stops[stops.length - 1];
  return (lastY >= firstY ? v < firstY : v > firstY) ? firstX : lastX;
}
const railF = (stops: [number, number][], span: [number, number]) =>
  (v: number) => mapRange(pAt(stops, v), span[0], span[1]);
const timeTickF = railF(TIME_STOPS, TIME_P);
const scaleTickF = railF(SCALE_STOPS, SCALE_P);
const geoRailF = railF(AGO_STOPS, GEO_P);

const SCROLL_VH = 2100; // scrollable length of the piece, in viewport-heights

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

/** Procedural moon: regolith mottling, dark maria, cratered, a few ray systems. */
function makeMoonTexture() {
  const w = 1024;
  const h = 512;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const rng = mulberry32(77);
  g.fillStyle = "#b9b5ac";
  g.fillRect(0, 0, w, h);
  // large-scale tonal variation
  for (let i = 0; i < 70; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = 40 + rng() * 160;
    const v = 168 + Math.floor(rng() * 42);
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(${v},${v - 3},${v - 10},0.16)`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // maria: clustered dark basalt plains
  for (let i = 0; i < 9; i++) {
    const x = rng() * w;
    const y = h * (0.18 + rng() * 0.5);
    const r = 50 + rng() * 110;
    for (let k = 0; k < 5; k++) {
      const ox = x + (rng() - 0.5) * r * 1.4;
      const oy = y + (rng() - 0.5) * r * 0.9;
      const rr = r * (0.4 + rng() * 0.6);
      const grad = g.createRadialGradient(ox, oy, 0, ox, oy, rr);
      grad.addColorStop(0, "rgba(86,84,83,0.32)");
      grad.addColorStop(0.7, "rgba(92,90,88,0.2)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grad;
      g.fillRect(ox - rr, oy - rr, rr * 2, rr * 2);
    }
  }
  // craters, power-law sized, lit from the upper left
  for (let i = 0; i < 430; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = 1.5 + Math.pow(rng(), 2.6) * 26;
    const floor = g.createRadialGradient(x, y, 0, x, y, r);
    floor.addColorStop(0, "rgba(70,68,66,0.36)");
    floor.addColorStop(0.75, "rgba(80,78,76,0.22)");
    floor.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = floor;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.strokeStyle = `rgba(232,229,222,${0.22 + rng() * 0.24})`;
    g.lineWidth = Math.max(1, r * 0.16);
    g.beginPath(); g.arc(x, y, r * 0.92, Math.PI * 0.8, Math.PI * 1.7); g.stroke();
    g.strokeStyle = `rgba(55,53,50,${0.18 + rng() * 0.2})`;
    g.beginPath(); g.arc(x, y, r * 0.92, Math.PI * -0.2, Math.PI * 0.7); g.stroke();
  }
  // a few young craters with bright ray systems
  for (let i = 0; i < 3; i++) {
    const x = rng() * w;
    const y = h * (0.25 + rng() * 0.5);
    const rays = 9 + Math.floor(rng() * 6);
    for (let k = 0; k < rays; k++) {
      const a = rng() * Math.PI * 2;
      const len = 30 + rng() * 90;
      const ray = g.createLinearGradient(x, y, x + Math.cos(a) * len, y + Math.sin(a) * len);
      ray.addColorStop(0, "rgba(235,232,225,0.26)");
      ray.addColorStop(1, "rgba(235,232,225,0)");
      g.strokeStyle = ray;
      g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
    }
    g.fillStyle = "rgba(240,238,230,0.5)";
    g.beginPath(); g.arc(x, y, 4 + rng() * 4, 0, Math.PI * 2); g.fill();
  }
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
// Deep-time Earth: the globe aged by uniforms — molten Hadean crust with
// glowing cracks, orange Archean haze, Cryogenian ice creeping from the poles,
// and PROCEDURAL CONTINENTS that drift, gather into supercontinents, and split
// (a noise field on the sphere whose domain crawls with uDrift and clusters
// toward one hemisphere with uGather). The real blue marble only fades in for
// the recent past, when the plates approach their modern seats.
const DEEP_TIME_FRAG = `
  uniform sampler2D map;
  uniform vec3 sunDir;
  uniform float uMolten;
  uniform float uHaze;
  uniform float uIce;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uHasMap;
  uniform float uDrift;
  uniform float uGather;
  uniform float uSea;
  uniform float uGreen;
  uniform float uModern;
  varying vec3 vNormal;
  varying vec2 vUv;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int k = 0; k < 4; k++) { v += a * noise(p); p *= 2.17; a *= 0.5; }
    return v;
  }
  float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float noise3(vec3 p) {
    vec3 i = floor(p); vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float n000 = hash3(i);
    float n100 = hash3(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash3(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash3(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash3(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash3(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash3(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash3(i + vec3(1.0, 1.0, 1.0));
    return mix(mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
               mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y), f.z);
  }
  float fbm3(vec3 p) {
    float v = 0.0; float a = 0.5;
    for (int k = 0; k < 5; k++) { v += a * noise3(p); p *= 2.07; a *= 0.5; }
    return v;
  }
  void main() {
    // ancient world: continents as a drifting, warping noise field
    vec3 sp = normalize(vNormal);
    float ca = cos(uDrift); float sa = sin(uDrift);
    vec3 rp = vec3(sp.x * ca - sp.z * sa, sp.y, sp.x * sa + sp.z * ca);
    float warp = fbm3(sp * 1.6 + uDrift * 0.35);
    vec3 q = rp * 2.1 + (warp - 0.5) * 1.3;
    float field = fbm3(q)
      + uGather * (0.22 * dot(rp, normalize(vec3(0.8, 0.25, -0.45))) + 0.06);
    float land = smoothstep(uSea, uSea + 0.045, field);
    float shallow = smoothstep(uSea - 0.055, uSea, field) - land;
    vec3 rock = vec3(0.48, 0.37, 0.27);
    vec3 veg = vec3(0.19, 0.36, 0.16);
    float vegMask = uGreen * smoothstep(0.42, 0.72, fbm3(q * 1.7 + 3.1));
    vec3 landCol = mix(rock, veg, vegMask);
    vec3 ocean = vec3(0.035, 0.11, 0.24);
    vec3 shallowCol = vec3(0.08, 0.22, 0.34);
    vec3 ancient = mix(mix(ocean, shallowCol, clamp(shallow * 2.2, 0.0, 1.0)), landCol, land);
    // modern world, only for the recent past
    vec3 modern = mix(vec3(0.05, 0.09, 0.16), texture2D(map, vUv).rgb, uHasMap);
    vec3 day = mix(ancient, modern, uModern);
    float n = fbm(vUv * vec2(9.0, 5.0) + uTime * 0.008);
    float cracks = smoothstep(0.52, 0.74, n);
    vec3 molten = mix(vec3(0.09, 0.025, 0.012), vec3(1.0, 0.34, 0.05) * 1.7, cracks);
    vec3 col = mix(day, molten, uMolten);
    col = mix(col, col * vec3(1.06, 0.74, 0.42) + vec3(0.09, 0.045, 0.0), uHaze);
    float lat = abs(vUv.y - 0.5) * 2.0;
    float iceLine = 1.0 - uIce * 1.15;
    float iceMask = smoothstep(iceLine, iceLine + 0.14, lat + (fbm(vUv * 6.0) - 0.5) * 0.22) * step(0.01, uIce);
    col = mix(col, vec3(0.88, 0.93, 1.0), iceMask);
    // wrapped lighting: a soft terminator and a readable night side, so the
    // globe stays legible while still reading as lit from one side
    float d = dot(normalize(vNormal), normalize(sunDir));
    float lit = pow(clamp(d * 0.55 + 0.45, 0.0, 1.0), 1.35);
    col = col * (0.32 + 0.88 * lit) + vec3(1.0, 0.42, 0.1) * cracks * uMolten * 0.85;
    gl_FragColor = vec4(col, uOpacity);
  }
`;
// The moon, lit with the same wrapped lighting as the deep-time Earth.
const MOON_FRAG = `
  uniform sampler2D map;
  uniform vec3 sunDir;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec2 vUv;
  void main() {
    vec3 tex = texture2D(map, vUv).rgb;
    float d = dot(normalize(vNormal), normalize(sunDir));
    float lit = pow(clamp(d * 0.55 + 0.45, 0.0, 1.0), 1.3);
    gl_FragColor = vec4(tex * (0.2 + 0.95 * lit), uOpacity);
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

type AltimeterMode = "time" | "geo" | "scale" | "now";
type MirrorState = "off" | "pending" | "on" | "denied";

export function YouAreHereExperience() {
  const journeyRef = useRef<HTMLDivElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mirrorWinRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const readoutBigRef = useRef<HTMLDivElement | null>(null);
  const readoutSmallRef = useRef<HTMLDivElement | null>(null);
  const beatTimeRef = useRef<HTMLSpanElement | null>(null);
  const addrCoordsRef = useRef<HTMLSpanElement | null>(null);
  const addrTimeRef = useRef<HTMLSpanElement | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);
  // the Thread of Life overlay (Earth-history movement)
  const lifeWrapRef = useRef<HTMLDivElement | null>(null);
  const lifeThreadRef = useRef<SVGPathElement | null>(null);
  const lifeThreadLenRef = useRef(0);
  const lifeFrontRef = useRef<SVGGElement | null>(null);
  const lifeNodeEls = useRef<(SVGGElement | null)[]>([]);
  const lifeBranchEls = useRef<(SVGGElement | null)[]>([]);
  const smoothRef = useRef(0);
  const geoRef = useRef(guessLocation());
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
  // the Current Earth Sunlight finale layer
  const sunLayerRef = useRef<HTMLDivElement | null>(null);
  const sunAlphaRef = useRef(0);
  const homeProjRef = useRef<{ x: number; y: number; visible: boolean } | null>(null);
  const [sunMounted, setSunMounted] = useState(false);
  const [finaleOn, setFinaleOn] = useState(false);
  const [homeCoords] = useState(() => {
    const g = guessLocation();
    return { lat: g.lat, lng: g.lon };
  });
  const [finaleTz] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  });
  const preview = useSunlightPreview();

  // ------------------------------------------------------------------ scene
  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // the Thread of Life only shows at lg+; below it, keep the globe centred
    const wideMql = window.matchMedia("(min-width: 1024px)");

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

    // Canvas-rendered text as billboarded sprites, for in-scene annotations
    // (month names, solstices, latitude lines, hours — the tuned chartwork of
    // the site's EarthView scenes, regenerated for this single canvas).
    const makeLabel = (text: string, color: string, height: number) => {
      const fs = 46;
      const pad = 14;
      const probe = document.createElement("canvas").getContext("2d")!;
      probe.font = `600 ${fs}px system-ui, -apple-system, sans-serif`;
      const w = Math.ceil(probe.measureText(text).width) + pad * 2;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = fs + pad * 2;
      const g = c.getContext("2d")!;
      g.font = `600 ${fs}px system-ui, -apple-system, sans-serif`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.shadowColor = "rgba(0,0,0,0.9)";
      g.shadowBlur = 8;
      g.fillStyle = color;
      g.fillText(text, w / 2, c.height / 2);
      const tex = track(new THREE.CanvasTexture(c));
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = track(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(height * (c.width / c.height), height, 1);
      return { sprite, mat };
    };

    // The solar system and the annotated orbit share this tilt so their rings
    // stay geometrically coincident while both are visible; it then swings
    // toward face-on for chart legibility as the year-ring takes the frame.
    const eclipticTilt = (logM: number) =>
      lerp(0.42, 0.95, smooth01(mapRange(logM, 12.6, 11.9)));

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

    // -- Movement I·b: home is built ----------------------------------------
    // The Milky Way assembles: stars rain out of scatter into a spiral.
    const proto = makePointCloud(3200, 0.085, dot, 1);
    track(proto.points.geometry); track(proto.material);
    fillSpiralGalaxy(proto, 2.7, 23, 1);
    const protoTarget = proto.positions.slice();
    const protoScatter = new Float32Array(protoTarget.length);
    {
      const rng = mulberry32(131);
      for (let i = 0; i < protoScatter.length / 3; i++) {
        const r = 1.2 + Math.pow(rng(), 0.5) * 2.6;
        const th = rng() * Math.PI * 2;
        const ph = Math.acos(2 * rng() - 1);
        protoScatter[i * 3] = r * Math.sin(ph) * Math.cos(th);
        protoScatter[i * 3 + 1] = r * Math.cos(ph) * 0.8;
        protoScatter[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
      }
    }
    proto.points.rotation.x = -0.95;
    proto.points.visible = false;
    scene.add(proto.points);

    // The Solar System: a cloud collapses into a spinning disc, a sun ignites,
    // and the leftovers condense into worlds.
    const NEB_N = 2000;
    const neb = makePointCloud(NEB_N, 0.09, dot, 1);
    track(neb.points.geometry); track(neb.material);
    const nebR = new Float32Array(NEB_N);
    const nebA0 = new Float32Array(NEB_N);
    const nebY = new Float32Array(NEB_N);
    const nebStart = new Float32Array(NEB_N * 3);
    {
      const rng = mulberry32(151);
      for (let i = 0; i < NEB_N; i++) {
        nebR[i] = 0.28 + Math.pow(rng(), 0.7) * 2.4;
        nebA0[i] = rng() * Math.PI * 2;
        nebY[i] = gauss(rng) * 0.05;
        const r = 0.5 + Math.pow(rng(), 0.6) * 2.9;
        const th = rng() * Math.PI * 2;
        const ph = Math.acos(2 * rng() - 1);
        nebStart[i * 3] = r * Math.sin(ph) * Math.cos(th);
        nebStart[i * 3 + 1] = r * Math.cos(ph) * 0.85;
        nebStart[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
        const warm = 0.5 + rng() * 0.5;
        neb.colors[i * 3] = warm;
        neb.colors[i * 3 + 1] = warm * 0.82;
        neb.colors[i * 3 + 2] = warm * 0.64;
      }
      neb.points.geometry.attributes.color.needsUpdate = true;
    }
    const nebGroup = new THREE.Group();
    nebGroup.rotation.x = 0.55;
    nebGroup.visible = false;
    nebGroup.add(neb.points);
    const youngSunMat = track(new THREE.SpriteMaterial({
      map: track(makeSunTexture()), transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    const youngSun = new THREE.Sprite(youngSunMat);
    nebGroup.add(youngSun);
    const nebPlanets: THREE.MeshBasicMaterial[] = [];
    // where the third world condenses — Earth is born HERE, not at the sun
    const earthSeedPos = new THREE.Vector3();
    ([
      [0.62, 0x9c9488, 0.028], [0.95, 0xd9b98a, 0.04],
      [1.3, 0x6f9fd8, 0.05], [1.9, 0xc86a4a, 0.036],
    ] as const).forEach(([r, color, size], i) => {
      const mat = track(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 }));
      const mesh = new THREE.Mesh(track(new THREE.SphereGeometry(size, 12, 12)), mat);
      const ang = 1.1 + i * 1.7;
      mesh.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
      if (i === 2) earthSeedPos.copy(mesh.position).applyEuler(nebGroup.rotation);
      nebGroup.add(mesh);
      nebPlanets.push(mat);
    });
    scene.add(nebGroup);

    // The young Earth, aging through the geologic time scale, with its Moon.
    const timeEarthGroup = new THREE.Group();
    timeEarthGroup.visible = false;
    scene.add(timeEarthGroup);
    const timeEarthMat = track(new THREE.ShaderMaterial({
      vertexShader: EARTH_VERT,
      fragmentShader: DEEP_TIME_FRAG,
      transparent: true,
      uniforms: {
        map: { value: null },
        sunDir: { value: new THREE.Vector3(1, 0.25, 0.85).normalize() },
        uMolten: { value: 1 },
        uHaze: { value: 0 },
        uIce: { value: 0 },
        uOpacity: { value: 0 },
        uTime: { value: 0 },
        uHasMap: { value: 0 },
        uDrift: { value: 0 },
        uGather: { value: 0 },
        uSea: { value: 0.6 },
        uGreen: { value: 0 },
        uModern: { value: 0 },
      },
    }));
    new THREE.TextureLoader().load("/earth-blue-marble-5400x2700.jpg", (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      track(tex);
      timeEarthMat.uniforms.map.value = tex;
      timeEarthMat.uniforms.uHasMap.value = 1;
    });
    const timeEarth = new THREE.Mesh(track(new THREE.SphereGeometry(2.0, 56, 56)), timeEarthMat);
    timeEarthGroup.add(timeEarth);
    const moonTex = track(makeMoonTexture());
    const timeMoonMat = track(new THREE.ShaderMaterial({
      vertexShader: EARTH_VERT,
      fragmentShader: MOON_FRAG,
      transparent: true,
      uniforms: {
        map: { value: moonTex },
        sunDir: { value: new THREE.Vector3(1, 0.25, 0.85).normalize() },
        uOpacity: { value: 0 },
      },
    }));
    const timeMoon = new THREE.Mesh(track(new THREE.SphereGeometry(0.2, 24, 24)), timeMoonMat);
    timeEarthGroup.add(timeMoon);

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
    // The Milky Way here is a true miniature of the next set's disc — same
    // seed (its stars are a subset of the big cloud's), same tilt, same spin —
    // and the set is pinned by the same landmark (the sun's seat inside it),
    // so the zoom hands off as ONE spiral at two scales, not two spirals.
    const sunMarkerLocal = new THREE.Vector3(1.55, 0.06, 1.55); // ~55% out, between arms
    const MW_MINI_SCALE = 0.62 / 4.0;
    const mwCenter = new THREE.Vector3(-1.15, -0.2, 0.25);
    const mwSunSeat = sunMarkerLocal.clone()
      .multiplyScalar(MW_MINI_SCALE)
      .applyEuler(new THREE.Euler(-1.0, 0, 0))
      .add(mwCenter);
    const groupSet = addSet(22.9, mwSunSeat);
    {
      const mw = makePointCloud(750, 0.07, dot, 0.95);
      fillSpiralGalaxy(mw, 4.0, 17, 1);
      const mwTilt = new THREE.Group();
      mwTilt.position.copy(mwCenter);
      mwTilt.rotation.x = -1.0;
      mwTilt.scale.setScalar(MW_MINI_SCALE);
      mwTilt.add(mw.points);
      const m31 = makePointCloud(850, 0.07, dot, 0.95);
      fillSpiralGalaxy(m31, 0.78, 9, 0.9);
      m31.points.position.set(1.35, 0.42, -0.4);
      m31.points.rotation.set(1.15, -0.4, 0.35);
      track(mw.points.geometry); track(mw.material);
      track(m31.points.geometry); track(m31.material);
      groupSet.group.add(mwTilt, m31.points);
      groupSet.update = (t) => {
        // the mini's arms swirl in phase with the big disc's
        mw.points.rotation.y = reduceMotion ? 0 : t * 0.006;
      };
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
      // tip the disc toward the camera; the quaternion-aware pinning keeps the
      // sun's seat on the zoom line
      galaxySet.group.rotation.x = -1.0;
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
    const nowProgress = getOrbitalProgress(new Date());
    const AUu = 4 / 30; // scene units per AU
    const earthFocus = orbitPos(nowProgress, AUu);
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
        const mat = track(new THREE.MeshBasicMaterial({ color, transparent: true }));
        const dotMesh = new THREE.Mesh(track(new THREE.SphereGeometry(size, 12, 12)), mat);
        if (idx === 2) dotMesh.position.copy(orbitPos(nowProgress, r));
        else {
          const ang = rng() * Math.PI * 2;
          dotMesh.position.set(Math.cos(ang) * r, 0, Math.sin(ang) * r);
        }
        solarSet.group.add(dotMesh);
        fadeMat(solarSet, mat, 1);
      });
      solarSet.group.rotation.x = 0.42; // a three-quarter view of the ecliptic
      fadeMat(solarSet, sunMat, 1);
      fadeMat(solarSet, ringMat, 0.34);
      fadeMat(solarSet, earthRingMat, 0.9);
      solarSet.update = (_t, s) => {
        // keep the sun's glow from swallowing the view as we dive past it
        sun.scale.setScalar(0.7 / Math.pow(Math.max(s, 1), 0.4));
        solarSet.group.rotation.x = eclipticTilt(13.1 - Math.log10(s));
      };
    }

    // 6·b) Earth's orbit, annotated — the year as a place --------------- 10^11.75
    // Regenerated from the site's Earth Orbit scene: the gold band, season
    // arcs on the real equinox/solstice dates, month labels, and Earth at its
    // true position today. Ring radius is chosen so this circle coincides
    // exactly with the solar set's amber Earth-ring during the crossfade.
    const ORBIT_R = 2.98;
    const orbitSet = addSet(11.75, orbitPos(nowProgress, ORBIT_R));
    {
      const yearNow = new Date().getFullYear();
      const pSpring = progressForDate(yearNow, 2, 20);
      const pSummer = progressForDate(yearNow, 5, 21);
      const pAutumn = progressForDate(yearNow, 8, 22);
      const pWinter = progressForDate(yearNow, 11, 21);

      const bandMat = track(new THREE.MeshBasicMaterial({
        color: 0xb8a86a, transparent: true, opacity: 0.09, side: THREE.DoubleSide, depthWrite: false,
      }));
      const band = new THREE.Mesh(track(new THREE.RingGeometry(ORBIT_R * 0.86, ORBIT_R * 1.15, 128)), bandMat);
      band.rotation.x = -Math.PI / 2;
      orbitSet.group.add(band);
      fadeMat(orbitSet, bandMat, 0.09);

      const seasonArcs: [number, number, number][] = [
        [0, pSpring, 0x38bdf8], [pSpring, pSummer, 0x22c55e], [pSummer, pAutumn, 0xfacc15],
        [pAutumn, pWinter, 0xf97316], [pWinter, 1, 0x38bdf8],
      ];
      for (const [from, to, color] of seasonArcs) {
        const pts: THREE.Vector3[] = [];
        for (let k = 0; k <= 48; k++) pts.push(orbitPos(from + ((to - from) * k) / 48, ORBIT_R));
        const mat = track(new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85, depthWrite: false }));
        orbitSet.group.add(new THREE.Line(track(new THREE.BufferGeometry().setFromPoints(pts)), mat));
        fadeMat(orbitSet, mat, 0.85);
      }

      const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const tickMat = track(new THREE.LineBasicMaterial({ color: 0xd8cfc0, transparent: true, opacity: 0.5, depthWrite: false }));
      const tickPts: THREE.Vector3[] = [];
      MONTHS.forEach((name, m) => {
        const pStart = progressForDate(yearNow, m, 1);
        tickPts.push(orbitPos(pStart, ORBIT_R - 0.09), orbitPos(pStart, ORBIT_R + 0.09));
        const label = makeLabel(name, "#c9c2b4", 0.22);
        label.sprite.position.copy(orbitPos(progressForDate(yearNow, m, 15), ORBIT_R + 0.44));
        orbitSet.group.add(label.sprite);
        fadeMat(orbitSet, label.mat, 0.92);
      });
      orbitSet.group.add(new THREE.LineSegments(track(new THREE.BufferGeometry().setFromPoints(tickPts)), tickMat));
      fadeMat(orbitSet, tickMat, 0.5);

      const seasonEvents: [number, string, string][] = [
        [pSpring, "Mar equinox", "#22c55e"], [pSummer, "Jun solstice", "#facc15"],
        [pAutumn, "Sep equinox", "#f97316"], [pWinter, "Dec solstice", "#38bdf8"],
      ];
      for (const [pe, name, color] of seasonEvents) {
        const mat = track(new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.95, depthWrite: false }));
        orbitSet.group.add(new THREE.Line(track(new THREE.BufferGeometry().setFromPoints([
          orbitPos(pe, ORBIT_R - 0.14), orbitPos(pe, ORBIT_R + 0.14),
        ])), mat));
        fadeMat(orbitSet, mat, 0.95);
        const label = makeLabel(name, color, 0.18);
        label.sprite.position.copy(orbitPos(pe, ORBIT_R - 0.58));
        orbitSet.group.add(label.sprite);
        fadeMat(orbitSet, label.mat, 0.95);
      }

      const orbitSunMat = track(new THREE.SpriteMaterial({
        map: track(makeSunTexture()), transparent: true, opacity: 1,
        depthWrite: false, blending: THREE.AdditiveBlending,
      }));
      const orbitSun = new THREE.Sprite(orbitSunMat);
      orbitSun.scale.setScalar(0.62);
      orbitSet.group.add(orbitSun);
      fadeMat(orbitSet, orbitSunMat, 1);
      const dateLabel = makeLabel(
        new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
        "#fde68a", 0.26,
      );
      dateLabel.sprite.position.set(0, 0.74, 0);
      orbitSet.group.add(dateLabel.sprite);
      fadeMat(orbitSet, dateLabel.mat, 0.95);

      const orbitEarthMat = track(new THREE.MeshBasicMaterial({ color: 0x6f9fd8, transparent: true, opacity: 1 }));
      const orbitEarth = new THREE.Mesh(track(new THREE.SphereGeometry(0.075, 16, 16)), orbitEarthMat);
      orbitEarth.position.copy(orbitPos(nowProgress, ORBIT_R));
      orbitSet.group.add(orbitEarth);
      fadeMat(orbitSet, orbitEarthMat, 1);
      const sunLineMat = track(new THREE.LineBasicMaterial({ color: 0xf2ece1, transparent: true, opacity: 0.14, depthWrite: false }));
      orbitSet.group.add(new THREE.Line(track(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0), orbitPos(nowProgress, ORBIT_R),
      ])), sunLineMat));
      fadeMat(orbitSet, sunLineMat, 0.14);
      const earthLabel = makeLabel("Earth · today", "#9cc4f0", 0.2);
      earthLabel.sprite.position.copy(orbitPos(nowProgress, ORBIT_R)).add(new THREE.Vector3(0, 0.32, 0));
      orbitSet.group.add(earthLabel.sprite);
      fadeMat(orbitSet, earthLabel.mat, 0.95);

      orbitSet.group.rotation.x = 0.42;
      orbitSet.update = (_t, s) => {
        orbitSet.group.rotation.x = eclipticTilt(11.75 - Math.log10(s));
      };
    }

    // 7) Earth itself is the LabEarthView finale — the full Current Earth
    // Sunlight instrument fades straight in as the annotated orbit chart
    // blows past. No intermediate globe.

    // ----------------------------------------------------------------- loop
    const fadeWindow = (x: number) =>
      smooth01((x + 2.05) / 0.85) * (1 - smooth01((x - 0.62) / 0.95));

    const pinTmp = new THREE.Vector3();
    const setStackVisible = (p: number, t: number, stackAlpha: number) => {
      const logM = pToLogM(p);
      for (const set of stack) {
        const s = Math.pow(10, set.ref - logM);
        const x = Math.log10(s);
        const a = (set.window ?? fadeWindow)(x) * stackAlpha;
        if (a <= 0.004 || s < 0.0012 || s > 70) { set.group.visible = false; continue; }
        set.group.visible = true;
        set.group.scale.setScalar(s);
        // pin the focus to the zoom line through the group's own rotation, so
        // tilted (even tilting) sets stay glued to the descent
        pinTmp.copy(set.focus).applyQuaternion(set.group.quaternion).multiplyScalar(-s);
        set.group.position.copy(pinTmp);
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
      const visible = p > 0.578 && p < 0.81 && s > 0.35 && s < 6 && galaxySet.group.visible;
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

    // The mirror porthole hangs from the reader's home marker on the finale
    // globe: LabEarthView reports the marker's on-canvas position each frame
    // (homeProjRef), and the porthole hides while the marker is behind the
    // globe or the finale hasn't taken the frame yet.
    const projectMirror = () => {
      const el = mirrorWinRef.current;
      if (!el) return;
      const hp = homeProjRef.current;
      if (!mirrorOnRef.current || !hp || !hp.visible || sunAlphaRef.current < 0.4) {
        el.style.opacity = "0";
        return;
      }
      el.style.left = `${hp.x}px`;
      el.style.top = `${hp.y + 10}px`;
      el.style.opacity = "1";
    };

    const updateChrome = (p: number) => {
      // altimeter
      const mode: AltimeterMode =
        p < 0.365 ? "time" : p < 0.594 ? "geo" : p < 0.932 ? "scale" : "now";
      setAltMode(mode);
      if (cursorRef.current) {
        // the cursor rides in scroll space, matching the tick layout — an
        // even glide instead of a log-axis sprint-then-crawl
        let f = 0;
        if (mode === "time") f = mapRange(p, TIME_P[0], TIME_P[1]);
        else if (mode === "geo") f = mapRange(p, GEO_P[0], GEO_P[1]);
        else if (mode === "scale") f = mapRange(p, SCALE_P[0], SCALE_P[1]);
        else f = 1;
        cursorRef.current.style.top = `${(f * 100).toFixed(2)}%`;
      }
      // readout
      const big = readoutBigRef.current, small = readoutSmallRef.current;
      if (big && small) {
        if (mode === "time") {
          const logT = pToLogT(p);
          big.textContent = formatAge(logT);
          small.textContent =
            logT > 16.2 ? "after the beginning" : `after the beginning · ~${formatTemp(logT)}`;
        } else if (mode === "geo") {
          const ago = pToAgoMa(p);
          big.textContent = formatAgo(ago);
          small.textContent = `${eonAt(ago)} Eon · the geologic time scale`;
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

      // --- the Thread of Life (Earth-history movement) --------------------
      const lifeWrap = lifeWrapRef.current;
      if (lifeWrap) {
        const lifeAlpha = winP(p, 0.418, 0.452, 0.566, 0.586);
        lifeWrap.style.opacity = lifeAlpha.toFixed(3);
        lifeWrap.style.visibility = lifeAlpha < 0.004 ? "hidden" : "visible";
        if (lifeAlpha >= 0.004) {
          const front = pToAgoMa(p); // Ma before present, from the globe's clock
          const thread = lifeThreadRef.current;
          if (thread) {
            if (lifeThreadLenRef.current === 0) {
              lifeThreadLenRef.current = thread.getTotalLength();
              thread.style.strokeDasharray = `${lifeThreadLenRef.current}`;
            }
            const climb = clamp01((LIFE_Y_OLDEST - lifeYAtAge(front)) / (LIFE_Y_OLDEST - LIFE_Y_NEWEST));
            thread.style.strokeDashoffset = `${(lifeThreadLenRef.current * (1 - climb)).toFixed(1)}`;
          }
          if (lifeFrontRef.current) {
            const fy = lifeYAtAge(front);
            lifeFrontRef.current.setAttribute("transform", `translate(150 ${fy.toFixed(1)})`);
            lifeFrontRef.current.style.opacity = front > LIFE_NODES[0].age || front <= 0.29 ? "0" : "1";
          }
          // reveal a lineage node once the clock has reached its age; the most
          // recently reached one is the "active" beacon
          let activeIdx = -1;
          for (let i = 0; i < LIFE_NODES.length; i++) {
            if (front <= LIFE_NODES[i].age) activeIdx = i;
          }
          for (let i = 0; i < LIFE_NODES.length; i++) {
            const el = lifeNodeEls.current[i];
            if (!el) continue;
            const reached = front <= LIFE_NODES[i].age;
            el.style.opacity = reached ? "1" : "0";
            if ((el.dataset.active === "1") !== (i === activeIdx)) {
              el.dataset.active = i === activeIdx ? "1" : "0";
              el.classList.toggle("yah-life-active", i === activeIdx);
            }
          }
          for (let i = 0; i < LIFE_BRANCHES.length; i++) {
            const el = lifeBranchEls.current[i];
            if (!el) continue;
            el.style.opacity = front <= LIFE_NODES[LIFE_BRANCHES[i].forkIdx].age ? "1" : "0";
          }
        }
      }

      setStarted(p > 0.004);
      setArrived(p > 0.93);
      setEnded(p > 0.985);
      setSunMounted(p > 0.88);
      setFinaleOn(p > 0.93);
    };

    let raf = 0;
    let last = performance.now();
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

      // the space stack waits out the pivot's beat of black before fading in
      const stackAlpha = smooth01(mapRange(p, 0.602, 0.634));

      // Movement I — cosmic time on the particle fuse
      const fuseAlpha = 1 - smooth01(mapRange(p, 0.242, 0.278));
      fuse.points.visible = fuseAlpha > 0.004;
      if (fuse.points.visible) {
        fuse.material.opacity = fuseAlpha;
        updateFuse(pToLogT(p), t);
      } else {
        // impact flashes: Theia carving off the Moon, and the K-Pg afternoon —
        // sharp pulses, not washes
        const theia = Math.exp(-Math.pow((p - 0.3995) / 0.0035, 2)) * 0.4;
        const kpg = Math.exp(-Math.pow((p - 0.5465) / 0.0022, 2)) * 0.22;
        flashMat.opacity = theia + kpg;
      }

      // Movement I·b — home is built
      const protoA = winP(p, 0.242, 0.268, 0.302, 0.338);
      proto.points.visible = protoA > 0.004;
      if (proto.points.visible) {
        proto.material.opacity = protoA;
        const settle = smooth01(mapRange(p, 0.248, 0.286));
        for (let i = 0; i < protoTarget.length; i++) {
          proto.positions[i] = lerp(protoScatter[i], protoTarget[i], settle);
        }
        proto.points.geometry.attributes.position.needsUpdate = true;
        proto.points.rotation.y = reduceMotion ? 0 : t * (0.015 + settle * 0.045);
      }

      // Earth is born on its orbit: the whole nebula frame pans so the third
      // planet-dot glides to center (the sun sliding away) while the molten
      // globe grows out of that exact spot at the dot's own size.
      const earthGrowK = smooth01(mapRange(p, 0.371, 0.414));

      const nebA = winP(p, 0.302, 0.33, 0.373, 0.406);
      nebGroup.visible = nebA > 0.004;
      if (nebGroup.visible) {
        nebGroup.position.copy(earthSeedPos).multiplyScalar(-earthGrowK);
        neb.material.opacity = nebA * 0.9;
        const collapse = smooth01(mapRange(p, 0.308, 0.352));
        for (let i = 0; i < NEB_N; i++) {
          const swirl = nebA0[i] + (reduceMotion ? 0 : t * (0.22 / (nebR[i] + 0.25))) + collapse * 2.2;
          neb.positions[i * 3] = lerp(nebStart[i * 3], Math.cos(swirl) * nebR[i], collapse);
          neb.positions[i * 3 + 1] = lerp(nebStart[i * 3 + 1], nebY[i], collapse);
          neb.positions[i * 3 + 2] = lerp(nebStart[i * 3 + 2], Math.sin(swirl) * nebR[i], collapse);
        }
        neb.points.geometry.attributes.position.needsUpdate = true;
        const ignite = smooth01(mapRange(p, 0.318, 0.35));
        youngSunMat.opacity = nebA * ignite;
        const pulse = reduceMotion ? 1 : 1 + 0.06 * Math.sin(t * 3.1);
        youngSun.scale.setScalar(Math.max(0.001, 0.62 * ignite * pulse));
        const condense = smooth01(mapRange(p, 0.344, 0.365));
        for (const mat of nebPlanets) mat.opacity = nebA * condense;
      }

      const agoMa = pToAgoMa(p);
      // the aged Earth leaves completely before the space movement begins —
      // a beat of pure black marks the chapter break
      const earthTimeA = winP(p, 0.371, 0.4, 0.572, 0.596);
      timeEarthGroup.visible = earthTimeA > 0.004;
      if (timeEarthGroup.visible) {
        // start at the condensed dot's size and position, arrive centred
        const grow = lerp(0.025, 1.0, Math.pow(earthGrowK, 1.6));
        const recede = 1 - smooth01(mapRange(p, 0.572, 0.596)) * 0.985;
        timeEarthGroup.position.copy(earthSeedPos).multiplyScalar(1 - earthGrowK);
        // slide left while the Thread of Life climbs on the right, then
        // re-centre before the globe recedes into the chapter break (only when
        // the thread is actually shown — below lg it stays centred)
        if (wideMql.matches) {
          timeEarthGroup.position.x -= 1.35 * winP(p, 0.44, 0.49, 0.556, 0.575);
        }
        timeEarthGroup.scale.setScalar(grow * recede);
        timeEarth.rotation.y = reduceMotion ? 0 : t * 0.05;
        timeEarthMat.uniforms.uOpacity.value = earthTimeA;
        timeEarthMat.uniforms.uTime.value = t;
        timeEarthMat.uniforms.uMolten.value = smooth01(mapRange(agoMa, 3950, 4460));
        timeEarthMat.uniforms.uHaze.value =
          smooth01(mapRange(agoMa, 2350, 2650)) * (1 - smooth01(mapRange(agoMa, 3850, 4150)));
        timeEarthMat.uniforms.uIce.value = 0.92 * Math.exp(-Math.pow((agoMa - 690) / 95, 2));
        // continental drift: the plates crawl continuously; land gathers into
        // supercontinents (Kenorland → Rodinia → Pangaea) and disperses again;
        // continents grow with time; green arrives with land plants; the real
        // map only fades in near the present
        timeEarthMat.uniforms.uDrift.value = (EARTH_AGE_MA - agoMa) * 0.0011;
        timeEarthMat.uniforms.uGather.value =
          0.55 * Math.exp(-Math.pow((agoMa - 2650) / 320, 2)) +
          0.8 * Math.exp(-Math.pow((agoMa - 1050) / 240, 2)) +
          0.95 * Math.exp(-Math.pow((agoMa - 285) / 105, 2));
        timeEarthMat.uniforms.uSea.value = lerp(0.615, 0.525, smooth01(mapRange(agoMa, 4000, 700)));
        timeEarthMat.uniforms.uGreen.value = smooth01(mapRange(agoMa, 470, 380));
        timeEarthMat.uniforms.uModern.value = smooth01(mapRange(agoMa, 130, 35));
        const moonIn = smooth01(mapRange(p, 0.402, 0.428));
        timeMoonMat.uniforms.uOpacity.value = earthTimeA * moonIn;
        const moonR = lerp(2.7, 3.7, clamp01((EARTH_AGE_MA - agoMa) / EARTH_AGE_MA));
        const moonAng = reduceMotion ? 1.2 : t * 0.32;
        timeMoon.position.set(
          Math.cos(moonAng) * moonR,
          Math.sin(moonAng * 0.9) * 0.4,
          Math.sin(moonAng) * moonR,
        );
        timeMoon.rotation.y = -moonAng; // tidally locked: one face kept homeward
        // the lock rotates the moon's object space, so carry the sun with it
        const ca2 = Math.cos(moonAng);
        const sa2 = Math.sin(moonAng);
        (timeMoonMat.uniforms.sunDir.value as THREE.Vector3).set(
          1.0 * ca2 + 0.85 * sa2,
          0.25,
          -1.0 * sa2 + 0.85 * ca2,
        );
      }

      // Movements II & III
      setStackVisible(p, t, stackAlpha);

      // ambient drift
      bg.points.rotation.y = (reduceMotion ? 0 : t * 0.0035) + p * 0.35;

      // the full sunlight instrument fades in as the orbit chart blows past
      const sunA = smooth01(mapRange(p, 0.906, 0.932));
      sunAlphaRef.current = sunA;
      if (sunLayerRef.current) sunLayerRef.current.style.opacity = String(sunA);

      droneRef.current?.set(p);
      projectMarker(p);
      projectMirror();
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

  // Paint the document itself in the lab's void-black and disable overscroll
  // bounce, so nothing white can peek past the journey's end. The sitewide
  // body padding-bottom (for other pages' chrome) is zeroed too — otherwise
  // the page scrolls past the sticky stage and shoves the pinned chrome up.
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previous = [
      html.style.background,
      body.style.background,
      html.style.overscrollBehaviorY,
      body.style.paddingBottom,
    ];
    html.style.background = "#050308";
    body.style.background = "#050308";
    html.style.overscrollBehaviorY = "none";
    body.style.paddingBottom = "0px";
    return () => {
      html.style.background = previous[0];
      body.style.background = previous[1];
      html.style.overscrollBehaviorY = previous[2];
      body.style.paddingBottom = previous[3];
    };
  }, []);

  // Arriving at /#end (Meta Earth's "You Are Here" link) opens on the
  // journey's last frame — the live finale — instead of the singularity.
  useEffect(() => {
    if (window.location.hash !== "#end") return;
    const jump = () => {
      window.scrollTo(0, document.documentElement.scrollHeight);
    };
    jump();
    // Once more after layout settles, in case fonts/canvas shifted heights.
    const raf = requestAnimationFrame(jump);
    return () => cancelAnimationFrame(raf);
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

  return (
    <div ref={journeyRef} className="yah relative bg-[#050308] text-[#f2ece1]">
      <style>{`
        @keyframes yahRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes yahLine { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes yahPulse { 0%, 100% { opacity: 0.45; } 50% { opacity: 1; } }
        @keyframes yahFade { from { opacity: 0; } to { opacity: 1; } }
        .yah ::selection { background: rgba(255, 180, 84, 0.35); }
        .yah-life-node { transition: opacity 0.55s ease; }
        .yah-life-node circle { transition: r 0.4s ease, fill 0.4s ease; }
        .yah-life-active circle.yah-life-dot { r: 4.4px; fill: #fff6e6; }
        .yah-life-active .yah-life-label { fill: #ffd9a0; }
        .yah-life-branch { transition: opacity 0.7s ease; }
        @keyframes yahLifePulse { 0%, 100% { opacity: 0.25; transform: scale(0.9); } 50% { opacity: 0.7; transform: scale(1.5); } }
        .yah-life-front circle { animation: yahLifePulse 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
      `}</style>

      <div className="relative" style={{ height: `calc(${SCROLL_VH}vh + 100vh)` }}>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* the mirror — a live porthole hanging from your pin on the globe */}
          <div
            ref={mirrorWinRef}
            className="pointer-events-none absolute z-30 flex -translate-x-1/2 flex-col items-center transition-opacity duration-1000"
            style={{ opacity: 0, left: "50%", top: "58%" }}
          >
            <div className="h-8 w-px bg-gradient-to-b from-[#ffb454]/75 to-[#ffb454]/20" />
            <div
              className="relative overflow-hidden rounded-full border border-[#ffb454]/50 shadow-[0_0_36px_rgba(255,180,84,0.3)]"
              style={{
                width: "clamp(112px, 17vh, 172px)",
                height: "clamp(112px, 17vh, 172px)",
              }}
            >
              <video
                ref={videoRef}
                muted
                playsInline
                aria-label="Your camera, mirrored — video stays on this device"
                className="h-full w-full object-cover"
                style={{
                  transform: "scaleX(-1)",
                  filter: "grayscale(0.25) sepia(0.16) brightness(0.9) contrast(1.05)",
                }}
              />
              <div
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: "inset 0 0 26px rgba(5,3,8,0.7)" }}
              />
            </div>
            <div className="mt-2 text-[9px] font-semibold uppercase tracking-[0.26em] text-[#ffb454]/90">
              you · live
            </div>
          </div>

          {/* the cosmos */}
          <div ref={canvasHostRef} className="pointer-events-none absolute inset-0 z-10 [&>canvas]:h-full [&>canvas]:w-full" />

          {/* the finale: the lab's copy of the Current Earth Sunlight model,
              taking over from the approach dot — camera aimed at the reader's
              location, draggable, with the wheel left to page scroll */}
          {sunMounted ? (
            <div
              ref={sunLayerRef}
              className={`absolute inset-0 z-[15] ${finaleOn ? "" : "pointer-events-none"}`}
              style={{ opacity: 0 }}
            >
              <AppProvider>
                <SunlightGlobe
                  className="h-full w-full"
                  mode="globe"
                  isDarkOverride
                  interactive={finaleOn}
                  enableWheelZoom={false}
                  cameraOverride={FINALE_CAMERA}
                  dateOffsetMs={preview.dateOffsetMs}
                  rotationOffsetMs={preview.rotationOffsetMs}
                  sunOrbitProgress={preview.sunOrbitProgress}
                  sunOrbitActive={preview.previewMode === "sun-year"}
                  timezone={finaleTz}
                  timezoneRingScale={0.72}
                  homeCoords={homeCoords}
                  onHomeProject={(x, y, visible) => {
                    homeProjRef.current = { x, y, visible };
                  }}
                />
              </AppProvider>
            </div>
          ) : null}

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
          <div
            className={`pointer-events-none absolute left-5 top-5 z-40 text-[10px] font-semibold uppercase tracking-[0.26em] text-[#8a8378] transition-opacity duration-1000 ${started ? "opacity-100" : "opacity-0"}`}
          >
            <span className="sm:hidden">Sapiens Scientia</span>
            <span className="hidden sm:inline">Sapiens Scientia · The History of the Universe</span>
          </div>

          {/* spacetime altimeter */}
          <div
            className={`pointer-events-none absolute left-5 top-1/2 z-40 hidden h-[62vh] -translate-y-1/2 transition-opacity duration-1000 sm:block ${started ? "opacity-100" : "opacity-0"}`}
          >
            <div className="relative h-full w-px bg-[#f2ece1]/15">
              {/* keyed by mode so each coordinate system visibly re-arms */}
              <div key={altMode} className="absolute inset-0 [animation:yahFade_1.1s_ease_both]">
              {altMode === "geo" ? (
                // the geologic time scale: four eons, oldest at the top,
                // each spanning the scroll it actually occupies — so the
                // Phanerozoic gets room for its run of milestones
                GEO_EONS.map((eon) => {
                  const top = geoRailF(eon.from) * 100;
                  const height = geoRailF(eon.to) * 100 - top;
                  return (
                    <div key={eon.name}>
                      <div
                        className="absolute -left-[1px] w-[3px] rounded-full"
                        style={{ top: `${top}%`, height: `${height}%`, background: eon.color, opacity: 0.8 }}
                      />
                      <div
                        className="absolute left-3.5 -translate-y-1/2 whitespace-nowrap text-[9px] uppercase tracking-[0.18em]"
                        style={{ top: `${top + height / 2}%`, color: eon.color }}
                      >
                        {eon.name}
                      </div>
                    </div>
                  );
                })
              ) : altMode !== "now" ? (
                (altMode === "time" ? TIME_TICKS : SCALE_TICKS).map(([v, label]) => {
                  const f = (altMode === "time" ? timeTickF : scaleTickF)(v);
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
              </div>
              <div
                ref={cursorRef}
                className="absolute -left-[3px] h-[7px] w-[7px] -translate-y-1/2 rounded-full bg-[#ffb454] shadow-[0_0_12px_rgba(255,180,84,0.9)]"
                style={{ top: "0%" }}
              />
            </div>
            <div
              key={`cap-${altMode}`}
              className="absolute -left-1 top-[-26px] text-[9px] font-bold uppercase tracking-[0.24em] text-[#8a8378] [animation:yahFade_1.1s_ease_both]"
            >
              {altMode === "time" ? "time" : altMode === "geo" ? "earth" : altMode === "scale" ? "size" : "·"}
            </div>
          </div>

          {/* the Thread of Life — our lineage climbing beside the aging Earth */}
          <div
            ref={lifeWrapRef}
            className="pointer-events-none absolute right-3 top-1/2 z-30 hidden h-[84vh] w-[min(30rem,44vw)] -translate-y-1/2 lg:block"
            style={{ opacity: 0, visibility: "hidden" }}
          >
            <svg viewBox="0 0 300 640" className="h-full w-full" style={{ overflow: "visible" }} aria-hidden="true">
              <text x="150" y="16" textAnchor="middle" className="fill-[#8a8378]" style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase" }}>
                The thread of life
              </text>
              {/* faint full track the lineage will climb */}
              <path d={LIFE_THREAD_D} fill="none" stroke="#ffb454" strokeOpacity={0.12} strokeWidth={1.4} />
              {/* the bright, drawn-on lineage */}
              <path
                ref={lifeThreadRef}
                d={LIFE_THREAD_D}
                fill="none"
                stroke="#ffb454"
                strokeWidth={2.4}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 4px rgba(255,180,84,0.6))" }}
              />
              {/* the bush: branches forking away from our line */}
              {LIFE_BRANCHES.map((br, i) => {
                const n = LIFE_NODES[br.forkIdx];
                const ex = n.x - 62;
                const ey = n.y + 20;
                return (
                  <g
                    key={br.label}
                    className="yah-life-branch"
                    ref={(el) => { lifeBranchEls.current[i] = el; }}
                    style={{ opacity: 0 }}
                  >
                    <path d={`M ${n.x} ${n.y} Q ${n.x - 30} ${n.y + 4}, ${ex} ${ey}`} fill="none" stroke="#8a8378" strokeOpacity={0.5} strokeWidth={1} />
                    <circle cx={ex} cy={ey} r={1.7} fill="#8a8378" />
                    <text x={ex - 5} y={ey + 3} textAnchor="end" className="fill-[#8a8378]" style={{ fontSize: 8, letterSpacing: "0.04em" }}>
                      {br.label}
                    </text>
                  </g>
                );
              })}
              {/* the climbing "front" — where the clock is right now */}
              <g ref={lifeFrontRef} className="yah-life-front" style={{ opacity: 0 }} transform="translate(150 36)">
                <circle cx={0} cy={0} r={7} fill="#ffb454" fillOpacity={0.5} />
              </g>
              {/* the lineage milestones */}
              {LIFE_NODES.map((n, i) => (
                <g
                  key={n.label}
                  className="yah-life-node"
                  ref={(el) => { lifeNodeEls.current[i] = el; }}
                  style={{ opacity: 0 }}
                >
                  <circle className="yah-life-dot" cx={n.x} cy={n.y} r={3.2} fill="#ffb454" />
                  <text x={n.x + 12} y={n.y - 1} className="yah-life-label fill-[#f2ece1]" style={{ fontSize: 11, fontWeight: 600 }}>
                    {n.label}
                  </text>
                  <text x={n.x + 12} y={n.y + 10} className="fill-[#8a8378]" style={{ fontSize: 8, letterSpacing: "0.06em" }}>
                    {n.sub}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* the cosmic address, typing itself */}
          <div
            className={`absolute right-5 top-5 z-40 w-[15.5rem] text-right transition-opacity duration-1000 sm:right-8 sm:top-8 ${started ? "opacity-100" : "opacity-0"}`}
          >
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
                        <span className="text-[#8a8378]"> · est. from your clock</span>
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
          </div>

          {/* the big readout */}
          <div
            className={`pointer-events-none absolute bottom-6 left-5 z-40 transition-opacity duration-1000 sm:bottom-8 sm:left-8 ${started ? "opacity-100" : "opacity-0"}`}
          >
            <div ref={readoutBigRef} className="font-mono text-xl font-extralight tabular-nums tracking-tight text-[#f2ece1] sm:text-4xl" />
            <div ref={readoutSmallRef} className="mt-1 text-[10px] uppercase tracking-[0.2em] text-[#8a8378]" />
          </div>

          {/* narration */}
          {beat && beat.chapter ? (
            // the chapter card: a hard reset between the time and space movements
            <div
              key={beatIdx}
              className="pointer-events-none absolute left-1/2 top-1/2 z-40 w-[min(40rem,calc(100vw-3rem))] -translate-x-1/2 -translate-y-1/2 text-center [animation:yahRise_1.1s_ease_both]"
            >
              <div className="mx-auto mb-6 h-px w-24 bg-[#ffb454]/45" />
              <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#ffb454]/90">
                13.8 billion years · complete
              </div>
              <h2 className="mt-5 text-3xl font-light leading-tight tracking-tight text-[#f2ece1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] sm:text-5xl">
                {beat.title}
              </h2>
              {beat.sub ? (
                <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-[#c9c2b4] sm:text-base">{beat.sub}</p>
              ) : null}
              <div className="mx-auto mt-6 h-px w-24 bg-[#ffb454]/45" />
            </div>
          ) : beat ? (
            <div
              key={beatIdx}
              className="pointer-events-none absolute bottom-[26vh] left-1/2 z-40 w-[min(38rem,calc(100vw-3rem))] -translate-x-1/2 text-center [animation:yahRise_0.7s_ease_both] sm:bottom-[16vh]"
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

          {/* the mirror invitation (raised above the clock line on phones) */}
          {arrived ? (
            <div className="absolute bottom-20 left-1/2 z-40 -translate-x-1/2 text-center sm:bottom-8">
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
                    className="cursor-pointer whitespace-nowrap border border-[#ffb454]/40 bg-black/40 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ffb454] backdrop-blur-sm transition-colors hover:bg-[#ffb454]/10 disabled:opacity-50"
                  >
                    {mirror === "pending" ? "opening…" : "☉ see yourself in it"}
                  </button>
                  <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-[#8a8378]">
                    {mirror === "denied"
                      ? "camera declined — you are still here"
                      : "a live porthole at your pin — stays on this device, never recorded"}
                  </p>
                </>
              )}
              {/* onward: the journey's end hands off to the rest of the site */}
              <div
                className={`transition-opacity duration-700 ${ended ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <Link
                  href="/meta-earth"
                  className="mt-4 inline-block whitespace-nowrap border border-[#ffb454]/45 bg-black/40 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffb454] backdrop-blur-sm transition-colors hover:bg-[#ffb454]/10"
                >
                  enter meta earth →
                </Link>
              </div>
            </div>
          ) : null}

          {/* finale animations: play controls on the right edge */}
          {finaleOn ? (
            <div className="absolute right-5 top-1/2 z-40 flex -translate-y-1/2 flex-col items-end gap-3 sm:right-8">
              {(
                [
                  ["day", "one day"],
                  ["sun-year", "one year"],
                ] as const
              ).map(([modeKey, label]) => {
                const active = preview.previewMode === modeKey;
                return (
                  <button
                    key={modeKey}
                    type="button"
                    onClick={() => preview.togglePreview(modeKey)}
                    aria-pressed={active}
                    aria-label={active ? `Stop the ${label} animation` : `Play the ${label} animation`}
                    className="group flex cursor-pointer items-center gap-2.5"
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                        active ? "text-[#ffb454]" : "text-[#c9c2b4] group-hover:text-[#f2ece1]"
                      }`}
                    >
                      {label}
                    </span>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition-colors ${
                        active
                          ? "border-[#ffb454]/70 bg-[#ffb454]/10 text-[#ffb454]"
                          : "border-[#f2ece1]/25 bg-black/40 text-[#c9c2b4] group-hover:border-[#f2ece1]/55 group-hover:text-[#f2ece1]"
                      }`}
                    >
                      {active ? (
                        <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                          <rect x="2.5" y="2.5" width="7" height="7" fill="currentColor" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 12 12" className="ml-0.5 h-3 w-3" aria-hidden="true">
                          <path d="M3 1.8l7.2 4.2L3 10.2z" fill="currentColor" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {/* sound */}
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
            title={soundOn ? "Sound on" : "Sound off"}
            className={`absolute bottom-6 right-5 z-40 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border bg-black/40 backdrop-blur-sm transition-colors sm:bottom-8 sm:right-8 ${
              soundOn
                ? "border-[#ffb454]/70 bg-[#ffb454]/10 text-[#ffb454]"
                : "border-[#f2ece1]/25 text-[#c9c2b4] hover:border-[#f2ece1]/55 hover:text-[#f2ece1]"
            }`}
          >
            {soundOn ? (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            )}
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
