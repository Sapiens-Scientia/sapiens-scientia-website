"use client";

// The homepage cosmic journey: one continuous scroll from the Planck epoch to
// Meta Earth. A tall scroll container drives a sticky full-viewport stage with
// four layers — the Big Bang canvas runtime, the observable-universe disc, the
// shared EarthView WebGL scene (galaxy → orbit → globe), and the Meta Earth
// hero — so the six former flow pages read as one zoom through spacetime.
//
// Scroll progress P (0..1) is smoothed with an exponential follower and then
// applied imperatively (refs + direct style writes) so per-frame work never
// re-renders React; React state changes only at act boundaries and discrete
// scrub steps.

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Axis3d, ChevronDown, Layers2, RotateCcw } from "lucide-react";
import { AppProvider } from "@/components/earthview/contexts";
import {
  GALAXY_TIMELINE_EVENTS,
  UnifiedEarthView,
  type GalaxyTimelineEvent,
} from "@/components/earthview/globe/UnifiedEarthView";
import {
  BigBangUniverseExperience,
  type BigBangUniverseController,
} from "@/components/big-bang-universe-experience";
import { CosmicObjectHierarchy } from "@/components/cosmic-object-hierarchy";
import { GalaxyEventBrowser } from "@/components/galaxy-event-browser";
import { HomeOverview } from "@/components/home-overview";
import { SiteFooter } from "@/components/site-footer";
import { useSunlightPreview } from "@/hooks/use-sunlight-preview";

const EarthHero = dynamic(
  () => import("@/components/earth-hero").then((m) => m.EarthHero),
  { ssr: false },
);

const DAY_MS = 24 * 60 * 60 * 1000;

// Scrollable length of the journey in viewport-heights (the sticky stage adds
// one more). Roughly: each act gets enough travel to be read, not raced.
const JOURNEY_SCROLL_VH = 1150;

// Journey progress segments. Order: scrub cosmic history, morph the bell's
// present-day rim into the full observable-universe disc, hold, dive into its
// center (the Solar System), then the EarthView scene carries galaxy → orbit →
// globe before the Meta Earth reveal.
const SEG = {
  bang: [0, 0.3],
  rim: [0.3, 0.365],
  hold: [0.365, 0.455],
  dive: [0.455, 0.53],
  galaxy: [0.53, 0.665],
  orbit: [0.665, 0.78],
  globe: [0.78, 0.88],
  meta: [0.88, 1],
} as const;

// Overlay act starts: Big Bang, Observable Universe, Planet Earth history,
// Earth Orbit, Current Sunlight, Meta Earth. The second act begins slightly
// into the rim morph so its title never overlaps the fading Big Bang title.
const ACT_STARTS = [0, 0.322, 0.505, SEG.orbit[0], SEG.globe[0], SEG.meta[0]];

const CHAPTERS = [
  { label: "Big Bang", p: 0 },
  { label: "Observable Universe", p: 0.4 },
  { label: "Planet Earth", p: 0.6 },
  { label: "Earth Orbit", p: 0.725 },
  { label: "Current Sunlight", p: 0.835 },
  { label: "Meta Earth", p: 1 },
];

const ACT_TITLES: ({ title: string; sub: string; href: string } | null)[] = [
  null, // the Big Bang runtime draws its own title
  {
    title: "Observable Universe",
    sub: "93 Billion Light Years Diameter",
    href: "/observable-universe",
  },
  {
    title: "History of Planet Earth",
    sub: "In the Milky Way Galactic Orbit",
    href: "/history-of-planet-earth",
  },
  {
    title: "Earth Orbit",
    sub: "From planetary year to current sunlight",
    href: "/earth-orbit",
  },
  {
    title: "Current Earth Sunlight",
    sub: "Day and night across Earth right now",
    href: "/current-earth-sunlight",
  },
  null, // Meta Earth introduces itself
];

// Scroll stops through Earth's 4.54-billion-year history: the four eons, the
// Phanerozoic eras, and the run-up to the present. The full 37-event timeline
// stays available in the Earth Event Browser panel.
const GALAXY_STOP_LABELS = [
  "Hadean Eon",
  "Archean Eon",
  "Proterozoic Eon",
  "Phanerozoic Eon",
  "Paleozoic Era",
  "Mesozoic Era",
  "Cenozoic Era",
  "Quaternary Period",
  "Holocene Epoch",
  "Earth Now",
];
const GALAXY_STOPS = GALAXY_STOP_LABELS.map((label) =>
  GALAXY_TIMELINE_EVENTS.find((event) => event.label === label),
).filter((event): event is GalaxyTimelineEvent => Boolean(event));

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const mapRange = (v: number, a: number, b: number) => clamp01((v - a) / (b - a || 1));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function actAt(p: number) {
  let act = 0;
  for (let i = 0; i < ACT_STARTS.length; i++) if (p >= ACT_STARTS[i]) act = i;
  return act;
}

export function CosmicJourney() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const journeyRef = useRef<HTMLDivElement | null>(null);
  const bangLayerRef = useRef<HTMLDivElement | null>(null);
  const discRef = useRef<HTMLDivElement | null>(null);
  const discImgRef = useRef<HTMLImageElement | null>(null);
  const discLabelsRef = useRef<HTMLDivElement | null>(null);
  const earthLayerRef = useRef<HTMLDivElement | null>(null);
  const metaLayerRef = useRef<HTMLDivElement | null>(null);
  const readoutRef = useRef<HTMLDivElement | null>(null);
  const bbControllerRef = useRef<BigBangUniverseController | null>(null);
  const smoothRef = useRef(0);
  const galaxyIdxRef = useRef(-1);
  const orbitDayRef = useRef(0);
  const scrollAnimRef = useRef(0);

  const [act, setAct] = useState(0);
  const [started, setStarted] = useState(false);
  const [bangMounted, setBangMounted] = useState(true);
  const [earthViewMounted, setEarthViewMounted] = useState(false);
  const [metaMounted, setMetaMounted] = useState(false);
  const [earthViewPaused, setEarthViewPaused] = useState(false);
  const [metaInteractive, setMetaInteractive] = useState(false);
  const [earthMode, setEarthMode] = useState<"galaxy" | "orbit" | "globe">("galaxy");
  const [galaxyKey, setGalaxyKey] = useState(GALAXY_STOPS[0]?.key ?? "");
  const [orbitDay, setOrbitDay] = useState(0);
  const [orbitTiltView, setOrbitTiltView] = useState(false);
  const [orbitTiltStripsVisible, setOrbitTiltStripsVisible] = useState(true);
  const [resetViewKey, setResetViewKey] = useState(0);
  const [timezone] = useState(getBrowserTimezone);
  const preview = useSunlightPreview();

  const readoutFor = useCallback((p: number) => {
    if (p < SEG.rim[0]) {
      const readout = bbControllerRef.current?.getReadout();
      return readout ? `Age ${readout.ageLabel} · ${readout.tempLabel}` : "";
    }
    if (p < SEG.galaxy[0]) return "93 billion light-years · centered on Earth";
    if (p < SEG.orbit[0]) {
      const stop = GALAXY_STOPS[Math.max(0, galaxyIdxRef.current)];
      return stop ? `${stop.label} · Earth age ${stop.yearMa}` : "";
    }
    if (p < SEG.globe[0]) {
      const date = new Date(Date.now() + orbitDayRef.current * DAY_MS);
      return date.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    if (p < SEG.meta[0]) {
      const time = new Date().toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
      return `Right now · ${time}`;
    }
    return "You are here";
  }, []);

  const apply = useCallback(
    (p: number) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      setAct(actAt(p));
      setStarted(p > 0.004);
      setBangMounted(p < 0.6);
      setEarthViewMounted(p > 0.28);
      setMetaMounted(p > 0.74);
      setEarthViewPaused(p > 0.96);
      setMetaInteractive(p > 0.955);
      setEarthMode(p < 0.645 ? "galaxy" : p < 0.767 ? "orbit" : "globe");

      // Act I — scrub cosmic history on the Big Bang canvas.
      const bb = bbControllerRef.current;
      bb?.setProgress(mapRange(p, SEG.bang[0], SEG.bang[1]));
      if (bangLayerRef.current) {
        const o = 1 - mapRange(p, 0.315, 0.36);
        bangLayerRef.current.style.opacity = String(o);
        bangLayerRef.current.style.visibility = o <= 0.001 ? "hidden" : "visible";
      }

      // Act II — the present-day rim of the bell becomes the full observable
      // universe disc, holds, then dives into its own center.
      if (discRef.current && discImgRef.current) {
        const disc = discRef.current;
        const img = discImgRef.current;
        const active = p >= SEG.rim[0] - 0.002 && p <= SEG.dive[1] + 0.01;
        if (active) {
          const side = Math.min(0.78 * vh, 0.84 * vw);
          const rim = bb?.getTodayRimRect() ?? {
            cx: vw / 2,
            cy: vh * 0.85,
            rx: side / 2,
            ry: 30,
            rotation: -0.12,
          };
          const t = smoothstep(mapRange(p, SEG.rim[0], SEG.rim[1]));
          const cx = lerp(rim.cx, vw / 2, t);
          const cy = lerp(rim.cy, vh / 2, t);
          const w = lerp(rim.rx * 2, side, t);
          const h = lerp(rim.ry * 2, side, t);
          const rot = lerp(rim.rotation, 0, t);
          const tDive = mapRange(p, SEG.dive[0], SEG.dive[1]);
          const scale = 1 + 6.5 * tDive * tDive * tDive;
          const oIn = mapRange(p, SEG.rim[0], SEG.rim[0] + 0.016);
          const oOut = 1 - mapRange(p, SEG.dive[0] + 0.03, SEG.dive[1]);
          disc.style.left = `${cx - w / 2}px`;
          disc.style.top = `${cy - h / 2}px`;
          disc.style.width = `${w}px`;
          disc.style.height = `${h}px`;
          disc.style.transform = `scale(${scale})`;
          disc.style.opacity = String(Math.min(oIn, oOut));
          disc.style.visibility = "visible";
          img.style.width = `${w}px`;
          img.style.height = `${w}px`;
          img.style.transform = `translate(-50%, -50%) rotate(${rot}rad)`;
          if (discLabelsRef.current) {
            const labelO = Math.min(
              mapRange(p, 0.36, 0.385),
              1 - mapRange(p, SEG.dive[0], SEG.dive[0] + 0.03),
            );
            discLabelsRef.current.style.opacity = String(labelO);
          }
        } else {
          disc.style.visibility = "hidden";
          disc.style.opacity = "0";
        }
      }

      // Acts III–V — one EarthView canvas fades in beneath the dive and stays
      // through galaxy, orbit, and globe; its mode changes fly the camera.
      if (earthLayerRef.current) {
        const o = Math.min(mapRange(p, 0.468, 0.525), 1 - mapRange(p, 0.9, 0.945));
        earthLayerRef.current.style.opacity = String(o);
        earthLayerRef.current.style.visibility = o <= 0.001 ? "hidden" : "visible";
      }

      if (GALAXY_STOPS.length) {
        const tGalaxy = mapRange(p, SEG.galaxy[0], SEG.galaxy[1] - 0.008);
        const idx = Math.min(
          GALAXY_STOPS.length - 1,
          Math.floor(tGalaxy * GALAXY_STOPS.length),
        );
        if (p >= SEG.galaxy[0] - 0.04 && idx !== galaxyIdxRef.current) {
          galaxyIdxRef.current = idx;
          setGalaxyKey(GALAXY_STOPS[idx].key);
        }
      }

      const tOrbit = mapRange(p, SEG.orbit[0] + 0.012, SEG.orbit[1] - 0.006);
      const day = Math.round(tOrbit * 365);
      orbitDayRef.current = day;
      setOrbitDay(day);

      // Act VI — Meta Earth reveal.
      if (metaLayerRef.current) {
        const o = mapRange(p, SEG.meta[0], SEG.meta[0] + 0.05);
        metaLayerRef.current.style.opacity = String(o);
        metaLayerRef.current.style.visibility = o <= 0.001 ? "hidden" : "visible";
      }

      if (readoutRef.current) readoutRef.current.textContent = readoutFor(p);
    },
    [readoutFor],
  );

  // Scroll engine: raw progress from the container's position, smoothed with
  // an exponential follower, applied every frame.
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.25);
      last = now;
      const root = journeyRef.current;
      if (root) {
        const rect = root.getBoundingClientRect();
        const range = rect.height - window.innerHeight;
        const target = range > 0 ? clamp01(-rect.top / range) : 0;
        const previous = smoothRef.current;
        // Time-based exponential follower so the feel is frame-rate independent.
        const k = reduceMotion ? 1 : 1 - Math.exp(-dt * 11);
        let next = previous + (target - previous) * k;
        if (Math.abs(next - target) < 0.0004) next = target;
        smoothRef.current = next;
        apply(next);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [apply]);

  // Animated jump to a journey position; any manual scroll input cancels it.
  const goTo = useCallback((fraction: number, duration = 1500) => {
    const root = journeyRef.current;
    if (!root) return;
    const top = root.getBoundingClientRect().top + window.scrollY;
    const range = root.offsetHeight - window.innerHeight;
    const targetY = top + fraction * range;
    const startY = window.scrollY;
    const startT = performance.now();
    cancelAnimationFrame(scrollAnimRef.current);
    const cancel = () => cancelAnimationFrame(scrollAnimRef.current);
    window.addEventListener("wheel", cancel, { once: true, passive: true });
    window.addEventListener("touchstart", cancel, { once: true, passive: true });
    const step = (now: number) => {
      const t = clamp01((now - startT) / duration);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      window.scrollTo(0, startY + (targetY - startY) * eased);
      if (t < 1) scrollAnimRef.current = requestAnimationFrame(step);
    };
    scrollAnimRef.current = requestAnimationFrame(step);
  }, []);

  const handleMilestoneTravel = useCallback(
    (vy: number) => {
      goTo(SEG.bang[0] + vy * (SEG.bang[1] - SEG.bang[0]), 1100);
    },
    [goTo],
  );

  // Act overlays fade via opacity only (visibility transitions can strand a
  // compositor layer unpainted). Wrappers never take pointer events; inactive
  // acts also force their interactive children inert.
  const panelCls = (on: boolean) =>
    `pointer-events-none transition-opacity duration-700 ${
      on ? "opacity-100" : "opacity-0 [&_*]:!pointer-events-none"
    }`;

  return (
    <AppProvider>
      <div ref={rootRef} className="relative bg-black text-white">
        <div
          ref={journeyRef}
          className="relative"
          style={{ height: `calc(${JOURNEY_SCROLL_VH}vh + 100vh)` }}
        >
          <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
            {/* Layer I — Big Bang canvas runtime (scroll-scrubbed) */}
            {bangMounted ? (
              <div ref={bangLayerRef} className="absolute inset-0 z-10">
                <BigBangUniverseExperience
                  journey
                  onController={(controller) => {
                    bbControllerRef.current = controller;
                  }}
                  onMilestoneTravel={handleMilestoneTravel}
                />
              </div>
            ) : null}

            {/* Layer III — EarthView: galaxy → orbit → globe on one canvas */}
            {earthViewMounted ? (
              <div
                ref={earthLayerRef}
                className="pointer-events-none absolute inset-0 z-20"
                style={{ opacity: 0, visibility: "hidden" }}
              >
                <div
                  className="earth-stage earth-stage-dark absolute inset-0"
                  aria-label="Earth history, orbit, and sunlight visualization"
                >
                  <UnifiedEarthView
                    className="earth-canvas"
                    mode={earthMode}
                    isDarkOverride
                    interactive={false}
                    paused={earthViewPaused}
                    selectedGalaxyEventKey={galaxyKey}
                    dateOffsetMs={
                      earthMode === "orbit" ? orbitDay * DAY_MS : preview.dateOffsetMs
                    }
                    rotationOffsetMs={
                      earthMode === "globe" ? preview.rotationOffsetMs : 0
                    }
                    sunOrbitProgress={
                      earthMode === "globe" ? preview.sunOrbitProgress : 0
                    }
                    sunOrbitActive={
                      earthMode === "globe" && preview.previewMode === "sun-year"
                    }
                    orbitTiltView={orbitTiltView}
                    orbitTiltStripsVisible={orbitTiltStripsVisible}
                    resetViewKey={resetViewKey}
                    timezone={timezone}
                    timezoneRingScale={0.72}
                  />
                </div>
              </div>
            ) : null}

            {/* Layer II — the observable universe disc (rim → full → dive) */}
            <div
              ref={discRef}
              className="pointer-events-none absolute z-30 overflow-hidden rounded-full"
              style={{ opacity: 0, visibility: "hidden", willChange: "transform" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={discImgRef}
                src="/images/observable-universe-logarithmic-illustration.png"
                alt="Logarithmic illustration of the observable universe, centered on the Solar System and expanding outward through nearby stars, the Milky Way, galaxies, cosmic web, cosmic microwave background, and Big Bang plasma."
                className="absolute left-1/2 top-1/2 max-w-none"
                draggable={false}
              />
              <div ref={discLabelsRef} style={{ opacity: 0 }}>
                <div className="absolute left-1/2 top-[13.1%] -translate-x-1/2 text-center text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/90 drop-shadow-[0_0_12px_rgba(56,189,248,0.75)] sm:text-sm">
                  Milky Way Galaxy
                </div>
                <div className="absolute left-1/2 top-[calc(50%-8.9rem)] -translate-x-1/2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-100/85 drop-shadow-[0_0_12px_rgba(56,189,248,0.7)] sm:text-[0.68rem]">
                  Solar System
                </div>
              </div>
            </div>

            {/* Layer IV — Meta Earth (the destination) */}
            {metaMounted ? (
              <div
                ref={metaLayerRef}
                className={`absolute inset-0 z-40 ${metaInteractive ? "" : "pointer-events-none"}`}
                style={{ opacity: 0, visibility: "hidden" }}
              >
                <EarthHero />
              </div>
            ) : null}

            {/* Act titles */}
            {ACT_TITLES.map((entry, index) =>
              entry ? (
                <div
                  key={entry.title}
                  className={`pointer-events-none absolute left-1/2 top-5 z-[55] w-[min(34rem,calc(100vw-24rem))] -translate-x-1/2 text-center max-lg:top-14 max-lg:w-[min(34rem,calc(100vw-2.5rem))] ${panelCls(act === index)}`}
                >
                  <h2 className="text-balance text-2xl font-semibold leading-none tracking-normal text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.65)] sm:text-4xl">
                    <span>{entry.title}</span>
                    <br />
                    <span className="mt-1 inline-block text-lg font-medium text-slate-400 sm:text-2xl">
                      {entry.sub}
                    </span>
                  </h2>
                  <Link
                    href={entry.href}
                    className="pointer-events-auto mt-3 inline-flex border border-white/10 bg-black/48 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 backdrop-blur-md transition-colors hover:border-sky-200/35 hover:text-sky-100"
                  >
                    Open full view ↗
                  </Link>
                </div>
              ) : null,
            )}

            {/* Act II panels: object sizes + required image attribution */}
            <div className={`absolute inset-0 z-[52] ${panelCls(act === 1)}`}>
              <div className="pointer-events-none absolute inset-0 [&>aside]:pointer-events-auto">
                <CosmicObjectHierarchy />
              </div>
              <p className="pointer-events-auto absolute left-1/2 w-[min(36rem,calc(100vw-3rem))] -translate-x-1/2 text-center text-[0.62rem] font-medium leading-4 text-slate-500 max-sm:bottom-14 sm:bottom-4">
                Image by{" "}
                <a
                  href="https://commons.wikimedia.org/wiki/File:Observable_universe_logarithmic_illustration.png"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 underline-offset-4 transition-colors hover:text-sky-200 hover:underline"
                >
                  Pablo Carlos Budassi
                </a>
                , licensed{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/3.0/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 underline-offset-4 transition-colors hover:text-sky-200 hover:underline"
                >
                  CC BY-SA 3.0
                </a>
                .
              </p>
            </div>

            {/* Act III panel: Earth Event Browser */}
            <div className={`absolute inset-0 z-[52] ${panelCls(act === 2)}`}>
              <div className="pointer-events-none absolute inset-0 [&>aside]:pointer-events-auto">
                <GalaxyEventBrowser
                  selectedEventKey={galaxyKey}
                  onSelectEventKey={setGalaxyKey}
                  className="max-sm:!inset-x-2 sm:!left-4 sm:!right-auto"
                />
              </div>
            </div>

            {/* Act IV panel: orbit controls */}
            <div
              className={`absolute bottom-5 right-5 z-[52] sm:bottom-6 sm:right-6 ${panelCls(act === 3)}`}
              aria-label="Orbit controls"
            >
              <div className="earth-actions">
                <button
                  type="button"
                  className="earth-icon-button"
                  onClick={() => setResetViewKey((key) => key + 1)}
                  aria-label="Reset view"
                  title="Reset view"
                >
                  <RotateCcw aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`earth-action-button ${orbitTiltView ? "is-active" : ""}`}
                  onClick={() => setOrbitTiltView((value) => !value)}
                  aria-pressed={orbitTiltView}
                  aria-label={orbitTiltView ? "Turn off Tilt View" : "Turn on Tilt View"}
                >
                  <Axis3d aria-hidden="true" />
                  <span>Tilt View</span>
                </button>
                <button
                  type="button"
                  className={`earth-action-button ${orbitTiltStripsVisible ? "is-active" : ""}`}
                  onClick={() => setOrbitTiltStripsVisible((value) => !value)}
                  aria-pressed={orbitTiltStripsVisible}
                  aria-label={
                    orbitTiltStripsVisible
                      ? "Hide tilt reference strips"
                      : "Show tilt reference strips"
                  }
                >
                  <Layers2 aria-hidden="true" />
                  <span>Strips</span>
                </button>
              </div>
            </div>

            {/* Act V panel: sunlight animation controls */}
            <div
              className={`absolute bottom-5 right-5 z-[52] sm:bottom-6 sm:right-6 ${panelCls(act === 4)}`}
              aria-label="Sunlight controls"
            >
              <div className="earth-actions">
                <button
                  type="button"
                  className="earth-icon-button"
                  onClick={() => setResetViewKey((key) => key + 1)}
                  aria-label="Reset view"
                  title="Reset view"
                >
                  <RotateCcw aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`earth-action-button earth-animation-button ${preview.previewMode === "day" ? "is-active" : ""}`}
                  onClick={() => preview.togglePreview("day")}
                  aria-pressed={preview.previewMode === "day"}
                >
                  <span>{preview.previewMode === "day" ? "Stop 24h" : "24 Hours"}</span>
                </button>
                <button
                  type="button"
                  className={`earth-action-button earth-animation-button ${preview.previewMode === "year-no-spin" ? "is-active" : ""}`}
                  onClick={() => preview.togglePreview("year-no-spin")}
                  aria-pressed={preview.previewMode === "year-no-spin"}
                >
                  <span>{preview.previewMode === "year-no-spin" ? "Stop Year" : "1 Year"}</span>
                </button>
                <button
                  type="button"
                  className={`earth-action-button earth-animation-button ${preview.previewMode === "year-spin" ? "is-active" : ""}`}
                  onClick={() => preview.togglePreview("year-spin")}
                  aria-pressed={preview.previewMode === "year-spin"}
                >
                  <span>{preview.previewMode === "year-spin" ? "Stop Spin" : "Year + Spin"}</span>
                </button>
                <button
                  type="button"
                  className={`earth-action-button earth-animation-button ${preview.previewMode === "sun-year" ? "is-active" : ""}`}
                  onClick={() => preview.togglePreview("sun-year")}
                  aria-pressed={preview.previewMode === "sun-year"}
                >
                  <span>{preview.previewMode === "sun-year" ? "Stop Sun" : "Sun Year"}</span>
                </button>
              </div>
            </div>

            {/* Chapter rail */}
            <nav
              aria-label="Journey chapters"
              className="absolute right-4 top-1/2 z-[60] flex -translate-y-1/2 flex-col items-end gap-3 max-sm:right-2"
            >
              {CHAPTERS.map((chapter, index) => (
                <button
                  key={chapter.label}
                  type="button"
                  onClick={() => goTo(chapter.p)}
                  className="group pointer-events-auto flex cursor-pointer items-center gap-2"
                  aria-label={`Go to ${chapter.label}`}
                  aria-current={act === index ? "step" : undefined}
                >
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-[0.18em] transition-opacity duration-300 ${
                      act === index
                        ? "text-sky-100 opacity-90"
                        : "text-slate-300 opacity-0 group-hover:opacity-70"
                    }`}
                  >
                    {chapter.label}
                  </span>
                  <span
                    className={`block h-2 w-2 rounded-full border transition-all duration-300 ${
                      act === index
                        ? "scale-125 border-sky-200 bg-sky-200 shadow-[0_0_10px_rgba(125,211,252,0.8)]"
                        : "border-white/40 bg-white/10 group-hover:bg-white/40"
                    }`}
                  />
                </button>
              ))}
            </nav>

            {/* Spacetime readout */}
            <div
              className={`pointer-events-none absolute bottom-5 left-5 z-[60] max-sm:bottom-3 max-sm:left-3 transition-opacity duration-700 ${
                act === 5 || !started ? "opacity-0" : "opacity-100"
              }`}
            >
              <div
                ref={readoutRef}
                className="border border-white/10 bg-black/55 px-3.5 py-2 font-mono text-[11px] tracking-wide text-sky-100/90 backdrop-blur-md"
              />
            </div>

            {/* Skip ahead */}
            <button
              type="button"
              onClick={() => goTo(1, 2000)}
              className={`absolute z-[60] border border-white/10 bg-black/48 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300 backdrop-blur-md transition-all duration-500 hover:border-sky-200/35 hover:text-sky-100 max-sm:bottom-24 max-sm:left-1/2 max-sm:-translate-x-1/2 sm:right-6 sm:top-6 ${
                act === 5 ? "pointer-events-none opacity-0" : "cursor-pointer opacity-100"
              }`}
            >
              Skip to Meta Earth ↓
            </button>

            {/* Opening scroll cue */}
            <div
              className={`pointer-events-none absolute left-1/2 z-[60] -translate-x-1/2 text-center transition-opacity duration-700 max-sm:bottom-4 sm:bottom-8 ${
                started ? "opacity-0" : "opacity-100"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                Scroll to travel 13.8 billion years to this moment
              </p>
              <ChevronDown
                aria-hidden="true"
                className="mx-auto mt-2 h-4 w-4 animate-bounce text-sky-200/80"
              />
            </div>
          </div>
        </div>

        {/* The journey ends at Meta Earth; the atlas continues below. */}
        <HomeOverview />
        <div className="bg-black px-6 pb-24 text-white sm:px-10 sm:pb-28">
          <SiteFooter />
        </div>
      </div>
    </AppProvider>
  );
}
