"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { EarthOverlay } from "@/components/earth-overlay";
import { EarthScene } from "@/components/earth-scene";
import { HomeNav } from "@/components/home-nav";
import { useTheme } from "@/lib/use-theme";

export function EarthHero() {
  const [isPanelPointerActive, setIsPanelPointerActive] = useState(false);
  const [isMetaEarthMerged, setIsMetaEarthMerged] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const [timelineYear, setTimelineYear] = useState(2026);
  const [isPlayMode, setIsPlayMode] = useState(false);

  const toggleMetaEarth = () => setIsMetaEarthMerged((value) => !value);

  useEffect(() => {
    if (!isPlayMode) return;

    let lastTime = performance.now();
    let frameId: number;

    const update = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setTimelineYear((prev) => {
        let next = prev + delta * 2.0; // Advance 2 years per second
        if (next > 2050) {
          next = 1970;
        }
        return next;
      });

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [isPlayMode]);

  return (
    <section className="relative min-h-screen bg-black">
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0.28, 9.99], fov: 45 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, alpha: false }}
          className="!h-full !w-full"
          style={{ height: "100%", width: "100%" }}
        >
          <Suspense fallback={null}>
            <EarthScene
              enableZoom={!isPanelPointerActive}
              isMerged={isMetaEarthMerged}
              onToggleMerged={toggleMetaEarth}
              theme={theme}
              timelineYear={timelineYear}
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
        timelineYear={timelineYear}
        setTimelineYear={setTimelineYear}
        isPlayMode={isPlayMode}
        setIsPlayMode={setIsPlayMode}
      />
    </section>
  );
}
