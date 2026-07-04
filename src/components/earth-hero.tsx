"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import { EarthOverlay } from "@/components/earth-overlay";
import { EarthScene } from "@/components/earth-scene";
import { HomeNav } from "@/components/home-nav";
import { useTheme } from "@/lib/use-theme";

// Fraction of the hero, centred, where wheel events drive the 3D zoom.
// Outside this rectangle, the wheel scrolls the page as normal.
const ZOOM_ZONE_WIDTH = 0.5;
const ZOOM_ZONE_HEIGHT = 0.55;

export function EarthHero() {
  const [isPanelPointerActive, setIsPanelPointerActive] = useState(false);
  const [isMetaEarthMerged, setIsMetaEarthMerged] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  const { theme, toggleTheme } = useTheme();

  const toggleMetaEarth = () => setIsMetaEarthMerged((value) => !value);

  // Confine the scene's wheel-to-zoom to a central rectangle. A capture-phase
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
      <div ref={sceneRef} className="absolute inset-0 h-full w-full">
        <Canvas
          camera={{ position: [0, 0.28, 9.99], fov: 45 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, alpha: false }}
          className="earth-hero-canvas !h-full !w-full"
          style={{ height: "100%", width: "100%" }}
        >
          <Suspense fallback={null}>
            <EarthScene
              enableZoom={!isPanelPointerActive}
              isMerged={isMetaEarthMerged}
              onToggleMerged={toggleMetaEarth}
              theme={theme}
            />
          </Suspense>
        </Canvas>
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
        isMetaEarthMerged={isMetaEarthMerged}
        onMetaEarthToggle={toggleMetaEarth}
        onPanelPointerEnter={() => setIsPanelPointerActive(true)}
        onPanelPointerLeave={() => setIsPanelPointerActive(false)}
      />
    </section>
  );
}
