"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
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

type MirrorState = "off" | "pending" | "on" | "denied";

export function MetaEarthHero() {
  const [isPanelPointerActive, setIsPanelPointerActive] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);

  // The mirror: a live camera porthole hanging from the reader's pin on the
  // globe, carried over from The History of the Universe finale. The stream
  // never leaves the device.
  const [mirror, setMirror] = useState<MirrorState>("off");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mirrorWinRef = useRef<HTMLDivElement | null>(null);
  const mirrorOnRef = useRef(false);

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

  const openMirror = useCallback(async () => {
    setMirror("pending");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
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

  // The porthole hangs from the home marker: LabEarthView reports the
  // marker's on-canvas position each frame, and the porthole hides while the
  // marker is behind the globe or the mirror is closed.
  const handleHomeProject = useCallback((x: number, y: number, visible: boolean) => {
    const el = mirrorWinRef.current;
    if (!el) return;
    if (!mirrorOnRef.current || !visible) {
      el.style.opacity = "0";
      return;
    }
    el.style.left = `${x}px`;
    el.style.top = `${y + 10}px`;
    el.style.opacity = "1";
  }, []);

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
            onHomeProject={handleHomeProject}
          />
        </AppProvider>
      </div>

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

      {/* the mirror invitation, bottom-right (lg+ only — the phone layout's
          bottom edge belongs to the systems chips and platforms bridge) */}
      <div className="absolute bottom-6 right-5 z-40 hidden max-w-[15rem] flex-col items-end text-right sm:bottom-8 sm:right-8 lg:flex">
        {mirror === "on" ? (
          <button
            type="button"
            onClick={closeMirror}
            className="pointer-events-auto inline-flex h-9 cursor-pointer items-center whitespace-nowrap border border-cyan-200/30 bg-black/48 px-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur-md transition-colors hover:border-cyan-100/60 hover:bg-black/60 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
          >
            ✕ close the mirror
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={openMirror}
              disabled={mirror === "pending"}
              className="pointer-events-auto inline-flex h-9 cursor-pointer items-center whitespace-nowrap border border-cyan-200/30 bg-black/48 px-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur-md transition-colors hover:border-cyan-100/60 hover:bg-black/60 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 disabled:opacity-50"
            >
              {mirror === "pending" ? "opening…" : "☉ see yourself in it"}
            </button>
            <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-slate-400">
              {mirror === "denied"
                ? "camera declined — you are still here"
                : "a live porthole at your pin — stays on this device, never recorded"}
            </p>
          </>
        )}
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
