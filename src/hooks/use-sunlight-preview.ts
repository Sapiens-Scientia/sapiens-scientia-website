"use client";

import { useEffect, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;
const YEAR_MS = 365 * DAY_MS;

export type SunlightPreviewMode = "day" | "year-no-spin" | "year-spin" | "sun-year";

/**
 * Drives the Current Earth Sunlight preview animations (24 hours, one year
 * with/without daily spin, and the sun-direction year) shared by
 * /current-earth-sunlight and the homepage cosmic journey. Returns the offsets
 * to feed UnifiedEarthView in globe mode plus the toggle for the buttons.
 */
export function useSunlightPreview() {
  const [previewMode, setPreviewMode] = useState<SunlightPreviewMode | null>(null);
  const [dateOffsetMs, setDateOffsetMs] = useState(0);
  const [rotationOffsetMs, setRotationOffsetMs] = useState(0);
  const [sunOrbitProgress, setSunOrbitProgress] = useState(0);

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

  const togglePreview = (nextMode: SunlightPreviewMode) => {
    setDateOffsetMs(0);
    setRotationOffsetMs(0);
    setSunOrbitProgress(0);
    setPreviewMode((current) => (current === nextMode ? null : nextMode));
  };

  return { previewMode, dateOffsetMs, rotationOffsetMs, sunOrbitProgress, togglePreview };
}
