"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Moon, RotateCcw, Sun } from "lucide-react";
import { AppProvider } from "@/components/earthview/contexts";
import { UnifiedEarthView } from "@/components/earthview/globe/UnifiedEarthView";

const DAY_MS = 24 * 60 * 60 * 1000;
const YEAR_MS = 365 * DAY_MS;

type PreviewMode = "day" | "year-no-spin" | "year-spin" | "sun-year";

function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function CurrentEarthSunlightScene() {
  const [sceneIsDark, setSceneIsDark] = useState(true);
  const [previewMode, setPreviewMode] = useState<PreviewMode | null>(null);
  const [dateOffsetMs, setDateOffsetMs] = useState(0);
  const [rotationOffsetMs, setRotationOffsetMs] = useState(0);
  const [sunOrbitProgress, setSunOrbitProgress] = useState(0);
  const [resetViewKey, setResetViewKey] = useState(0);
  const timezone = useMemo(() => getBrowserTimezone(), []);

  useEffect(() => {
    if (!previewMode) return;

    const durationMs = previewMode === "day" ? 16000 : previewMode === "year-spin" ? 96000 : 48000;
    const start = performance.now();
    let frame = 0;

    const animate = (time: number) => {
      const progress = Math.min(1, (time - start) / durationMs);
      if (previewMode === "sun-year") {
        setDateOffsetMs(0);
        setRotationOffsetMs(0);
        setSunOrbitProgress(progress);
      } else {
        const offsetMs = previewMode === "day" ? progress * DAY_MS : progress * YEAR_MS;
        setDateOffsetMs(offsetMs);
        setRotationOffsetMs(previewMode === "year-no-spin" ? 0 : offsetMs);
        setSunOrbitProgress(0);
      }

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        setPreviewMode(null);
        setDateOffsetMs(0);
        setRotationOffsetMs(0);
        setSunOrbitProgress(0);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [previewMode]);

  const togglePreview = (nextMode: PreviewMode) => {
    setDateOffsetMs(0);
    setRotationOffsetMs(0);
    setSunOrbitProgress(0);
    setPreviewMode((current) => (current === nextMode ? null : nextMode));
  };

  return (
    <main className="earth-shell">
      <section
        className={`earth-stage ${sceneIsDark ? "earth-stage-dark" : "earth-stage-light"}`}
        aria-label="Current Earth sunlight visualization"
      >
        <UnifiedEarthView
          className="earth-canvas"
          mode="globe"
          dateOffsetMs={dateOffsetMs}
          rotationOffsetMs={rotationOffsetMs}
          sunOrbitProgress={sunOrbitProgress}
          sunOrbitActive={previewMode === "sun-year"}
          isDarkOverride={sceneIsDark}
          resetViewKey={resetViewKey}
          timezone={timezone}
          timezoneRingScale={0.72}
        />

        <header
          className="pointer-events-none absolute bottom-5 right-5 z-[2] flex justify-end sm:bottom-6 sm:right-6"
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
              className={`earth-action-button earth-animation-button ${previewMode === "day" ? "is-active" : ""}`}
              onClick={() => togglePreview("day")}
              aria-pressed={previewMode === "day"}
              aria-label={previewMode === "day" ? "Stop 24-hour animation" : "Animate 24 hours"}
              title={previewMode === "day" ? "Stop 24-hour animation" : "Animate 24 hours"}
            >
              <span>{previewMode === "day" ? "Stop 24h" : "24 Hours"}</span>
            </button>
            <button
              type="button"
              className={`earth-action-button earth-animation-button ${previewMode === "year-no-spin" ? "is-active" : ""}`}
              onClick={() => togglePreview("year-no-spin")}
              aria-pressed={previewMode === "year-no-spin"}
              aria-label={previewMode === "year-no-spin" ? "Stop 1-year animation without Earth rotation" : "Animate 1 year without Earth rotation"}
              title={previewMode === "year-no-spin" ? "Stop 1-year animation without Earth rotation" : "Animate 1 year without Earth rotation"}
            >
              <span>{previewMode === "year-no-spin" ? "Stop Year" : "1 Year"}</span>
            </button>
            <button
              type="button"
              className={`earth-action-button earth-animation-button ${previewMode === "year-spin" ? "is-active" : ""}`}
              onClick={() => togglePreview("year-spin")}
              aria-pressed={previewMode === "year-spin"}
              aria-label={previewMode === "year-spin" ? "Stop 1-year animation with daily rotations" : "Animate 1 year with daily rotations"}
              title={previewMode === "year-spin" ? "Stop 1-year animation with daily rotations" : "Animate 1 year with daily rotations"}
            >
              <span>{previewMode === "year-spin" ? "Stop Spin" : "Year + Spin"}</span>
            </button>
            <button
              type="button"
              className={`earth-action-button earth-animation-button ${previewMode === "sun-year" ? "is-active" : ""}`}
              onClick={() => togglePreview("sun-year")}
              aria-pressed={previewMode === "sun-year"}
              aria-label={previewMode === "sun-year" ? "Stop sun direction year animation" : "Animate sun direction through one year"}
              title={previewMode === "sun-year" ? "Stop sun direction year animation" : "Animate sun direction through one year"}
            >
              <span>{previewMode === "sun-year" ? "Stop Sun" : "Sun Year"}</span>
            </button>
            <button
              type="button"
              className="earth-icon-button"
              onClick={() => setSceneIsDark((value) => !value)}
              aria-pressed={sceneIsDark}
              aria-label={sceneIsDark ? "Use light 3D scene" : "Use dark 3D scene"}
              title={sceneIsDark ? "Use light 3D scene" : "Use dark 3D scene"}
            >
              {sceneIsDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </button>
          </div>
        </header>
      </section>
    </main>
  );
}

export function CurrentEarthSunlightExperience() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!isMounted) {
    return <div className="earth-shell earth-shell-loading" aria-label="Loading current Earth sunlight view" />;
  }

  return (
    <AppProvider>
      <section className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <CurrentEarthSunlightScene />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-5 z-[125] w-[min(28rem,calc(100vw-22rem))] -translate-x-1/2 text-center max-lg:top-20 max-lg:w-[min(28rem,calc(100vw-2.5rem))]">
          <h1 className="text-balance text-xl font-semibold leading-none tracking-normal text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.65)] sm:text-3xl">
            Current Earth Sunlight
          </h1>
        </div>

        <Link
          href="/meta-earth"
          aria-label="Zoom from current Earth sunlight into Meta Earth"
          title="Zoom into Meta Earth"
          className="cosmic-hotspot left-1/2 top-1/2 z-[120] h-[min(34rem,56vw)] w-[min(34rem,56vw)] -translate-x-1/2 -translate-y-1/2 max-sm:h-[74vw] max-sm:w-[74vw]"
          style={{ "--hotspot-color": "45 212 191" } as React.CSSProperties}
        >
          <span className="cosmic-hotspot__label">Enter Meta Earth</span>
        </Link>

        <div className="pointer-events-none absolute right-5 top-5 z-[130] flex max-w-[min(28rem,calc(100vw-2.5rem))] flex-col items-end gap-3 sm:right-6 sm:top-6">
          <Link
            href="/meta-earth"
            className="pointer-events-auto w-fit border border-sky-200/30 bg-black/58 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100 shadow-[0_16px_36px_rgba(0,0,0,0.3)] backdrop-blur-md transition-colors hover:border-sky-100/60 hover:bg-black/72 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-200"
          >
            Enter Meta Earth
          </Link>
        </div>
      </section>
    </AppProvider>
  );
}
