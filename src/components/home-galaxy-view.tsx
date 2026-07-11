"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  GALAXY_TIMELINE_EVENTS,
  UnifiedEarthView,
} from "@/components/earthview/globe/UnifiedEarthView";
import { AppProvider } from "@/components/earthview/contexts";
import { GalaxyEventBrowser } from "@/components/galaxy-event-browser";

const HADEAN_EVENT_KEY =
  GALAXY_TIMELINE_EVENTS.find((event) => event.label === "Hadean Eon")?.key ??
  GALAXY_TIMELINE_EVENTS[0]?.key ??
  "";

function GalaxyScene() {
  const [selectedGalaxyEventKey, setSelectedGalaxyEventKey] = useState(HADEAN_EVENT_KEY);

  return (
    <main className="earth-shell">
      <section className="earth-stage earth-stage-dark" aria-label="Galaxy visualization">
        <UnifiedEarthView
          className="earth-canvas"
          mode="galaxy"
          isDarkOverride
          selectedGalaxyEventKey={selectedGalaxyEventKey}
          timezone="UTC"
        />

        <GalaxyEventBrowser
          selectedEventKey={selectedGalaxyEventKey}
          onSelectEventKey={setSelectedGalaxyEventKey}
        />
      </section>
    </main>
  );
}

export function HomeGalaxyView() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="earth-shell earth-shell-loading" aria-label="Loading galaxy view" />;
  }

  return (
    <AppProvider>
      <GalaxyScene />
    </AppProvider>
  );
}
