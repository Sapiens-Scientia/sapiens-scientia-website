"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Axis3d, Layers2, RotateCcw } from "lucide-react";
import { AppProvider } from "@/components/earthview/contexts";
import { UnifiedEarthView } from "@/components/earthview/globe/UnifiedEarthView";

function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function OrbitScene() {
  const [orbitTiltView, setOrbitTiltView] = useState(false);
  const [orbitTiltStripsVisible, setOrbitTiltStripsVisible] = useState(true);
  const [resetViewKey, setResetViewKey] = useState(0);
  const timezone = useMemo(() => getBrowserTimezone(), []);

  return (
    <main className="earth-shell">
      <section className="earth-stage earth-stage-dark" aria-label="Earth orbit visualization">
        <UnifiedEarthView
          className="earth-canvas"
          mode="orbit"
          isDarkOverride
          orbitTiltView={orbitTiltView}
          orbitTiltStripsVisible={orbitTiltStripsVisible}
          resetViewKey={resetViewKey}
          timezone={timezone}
          timezoneRingScale={0.72}
        />

        <header
          className="pointer-events-none absolute bottom-5 right-5 z-[2] flex justify-end sm:bottom-6 sm:right-6"
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
              title={orbitTiltView ? "Turn off Tilt View" : "Turn on Tilt View"}
            >
              <Axis3d aria-hidden="true" />
              <span>Tilt View</span>
            </button>
            <button
              type="button"
              className={`earth-action-button ${orbitTiltStripsVisible ? "is-active" : ""}`}
              onClick={() => setOrbitTiltStripsVisible((value) => !value)}
              aria-pressed={orbitTiltStripsVisible}
              aria-label={orbitTiltStripsVisible ? "Hide tilt reference strips" : "Show tilt reference strips"}
              title={orbitTiltStripsVisible ? "Hide tilt reference strips" : "Show tilt reference strips"}
            >
              <Layers2 aria-hidden="true" />
              <span>Strips</span>
            </button>
          </div>
        </header>
      </section>
    </main>
  );
}

export function HomeOrbitExperience() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!isMounted) {
    return <div className="earth-shell earth-shell-loading" aria-label="Loading Earth orbit view" />;
  }

  return (
    <AppProvider>
      <section className="relative min-h-screen overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <OrbitScene />
        </div>

        <div className="pointer-events-none absolute left-1/2 top-5 z-[125] w-[min(34rem,calc(100vw-22rem))] -translate-x-1/2 text-center max-lg:top-20 max-lg:w-[min(34rem,calc(100vw-2.5rem))]">
          <h1 className="text-balance text-2xl font-semibold leading-none tracking-normal text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.65)] sm:text-4xl">
            <span>Earth Orbit</span>
            <br />
            <span className="mt-1 inline-block text-lg font-medium text-slate-400 sm:text-2xl">
              From planetary year to Meta Earth
            </span>
          </h1>
        </div>

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
