"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { AppProvider } from "@/components/earthview/contexts";
import { EarthOverlay } from "@/components/earth-overlay";
import { HomeNav } from "@/components/home-nav";
import { getChartContinuationCamera } from "@/components/lab/earth-geometry";
import { guessLocation } from "@/lib/guess-location";
import { useTheme } from "@/lib/use-theme";

// The Meta Earth hero: the homepage journey's Current Sunlight globe wrapped
// in the geodesic digital shell, under the Meta Earth overlay chrome. It
// opens from the same constant camera as the journey's finale, so "enter
// meta earth" reads as the overlays changing over an unmoved globe while the
// digital shell materializes.
const SunlightGlobe = dynamic(
  () => import("@/components/lab/lab-earth-view").then((m) => m.LabEarthView),
  { ssr: false },
);

const HERO_CAMERA = getChartContinuationCamera();

// Fraction of the hero, centred, where wheel events drive the 3D zoom.
// Outside this rectangle, the wheel scrolls the page as normal.
const ZOOM_ZONE_WIDTH = 0.5;
const ZOOM_ZONE_HEIGHT = 0.55;

export function MetaEarthHero() {
  const [isPanelPointerActive, setIsPanelPointerActive] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  const { theme, toggleTheme } = useTheme();

  const [homeCoords] = useState(() => {
    const g = guessLocation();
    return { lat: g.lat, lng: g.lon };
  });
  const [timezone] = useState(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  });

  // Confine the globe's wheel-to-zoom to a central rectangle. A capture-phase
  // listener stops wheel events from reaching OrbitControls when the cursor is
  // outside that zone, so the page scrolls instead of the globe zooming.
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) {
      return;
    }

    const onWheelCapture = (event: WheelEvent) => {
      const rect = el.getBoundingClientRect();
      const halfZoneWidth = (rect.width * ZOOM_ZONE_WIDTH) / 2;
      const halfZoneHeight = (rect.height * ZOOM_ZONE_HEIGHT) / 2;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const insideZone =
        Math.abs(event.clientX - centerX) <= halfZoneWidth &&
        Math.abs(event.clientY - centerY) <= halfZoneHeight;

      if (!insideZone) {
        // Keep the event away from OrbitControls and let the page scroll.
        event.stopPropagation();
      }
    };

    el.addEventListener("wheel", onWheelCapture, { capture: true });
    return () => {
      el.removeEventListener("wheel", onWheelCapture, { capture: true });
    };
  }, []);

  return (
    <section className="earth-hero relative h-screen min-h-[48rem] overflow-hidden bg-black">
      <div ref={sceneRef} className="earth-hero-canvas absolute inset-0 h-full w-full">
        <AppProvider>
          <SunlightGlobe
            className="h-full w-full"
            mode="globe"
            digitalShell
            isDarkOverride={theme === "dark"}
            cameraOverride={HERO_CAMERA}
            enableWheelZoom={!isPanelPointerActive}
            timezone={timezone}
            timezoneRingScale={0.72}
            homeCoords={homeCoords}
          />
        </AppProvider>
      </div>

      <HomeNav />

      <div className="pointer-events-auto absolute right-6 top-8 z-50 max-lg:top-4">
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn pointer-events-auto rounded border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-300 transition-all hover:bg-black/60 hover:text-white cursor-pointer backdrop-blur-sm"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? "☀ Light" : "☾ Dark"}
        </button>
      </div>

      <EarthOverlay
        onPanelPointerEnter={() => setIsPanelPointerActive(true)}
        onPanelPointerLeave={() => setIsPanelPointerActive(false)}
      />
    </section>
  );
}
