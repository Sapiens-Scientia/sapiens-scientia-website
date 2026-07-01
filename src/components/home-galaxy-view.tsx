"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  GALAXY_TIMELINE_EVENTS,
  UnifiedEarthView,
} from "@/components/earthview/globe/UnifiedEarthView";
import { AppProvider } from "@/components/earthview/contexts";

function formatEventBrowserYear(yearMa: string) {
  return yearMa.replace(" Ma", " Million Years Old");
}

function GalaxyScene() {
  const [selectedGalaxyEventKey, setSelectedGalaxyEventKey] = useState(
    () =>
      GALAXY_TIMELINE_EVENTS.find((event) => event.group === "present")?.key ??
      GALAXY_TIMELINE_EVENTS[0]?.key ??
      "",
  );
  const displayedGalaxyEvents = useMemo(() => [...GALAXY_TIMELINE_EVENTS].reverse(), []);
  const selectedGalaxyEventIndex = GALAXY_TIMELINE_EVENTS.findIndex(
    (event) => event.key === selectedGalaxyEventKey,
  );
  const selectedGalaxyEvent =
    GALAXY_TIMELINE_EVENTS[selectedGalaxyEventIndex] ?? GALAXY_TIMELINE_EVENTS[0];
  const displayedGalaxyEventIndex = displayedGalaxyEvents.findIndex(
    (event) => event.key === selectedGalaxyEventKey,
  );
  const selectGalaxyEventAt = (nextIndex: number) => {
    const boundedIndex = (nextIndex + GALAXY_TIMELINE_EVENTS.length) % GALAXY_TIMELINE_EVENTS.length;
    setSelectedGalaxyEventKey(GALAXY_TIMELINE_EVENTS[boundedIndex].key);
  };

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

        {selectedGalaxyEvent ? (
          <aside className="earth-event-browser" aria-label="Earth Event Browser">
            <div className="earth-event-browser-header">
              <span>Earth Event Browser</span>
              <strong>
                {displayedGalaxyEventIndex + 1} / {displayedGalaxyEvents.length}
              </strong>
            </div>

            <label className="earth-event-select-label" htmlFor="home-earth-event-select">
              Timeline event
            </label>
            <select
              id="home-earth-event-select"
              className="earth-event-select"
              value={selectedGalaxyEvent.key}
              onChange={(event) => setSelectedGalaxyEventKey(event.target.value)}
            >
              {displayedGalaxyEvents.map((event) => (
                <option key={event.key} value={event.key}>
                  {event.label}
                </option>
              ))}
            </select>

            <div className="earth-event-stepper" aria-label="Browse timeline events">
              <button
                type="button"
                onClick={() => selectGalaxyEventAt(selectedGalaxyEventIndex - 1)}
                aria-label="Previous timeline event"
                title="Previous event"
              >
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => selectGalaxyEventAt(selectedGalaxyEventIndex + 1)}
                aria-label="Next timeline event"
                title="Next event"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>

            <div
              className="earth-event-detail"
              style={{ "--event-color": selectedGalaxyEvent.color } as CSSProperties}
            >
              <div className="earth-event-color" aria-hidden="true" />
              <h2>{selectedGalaxyEvent.label}</h2>
              <p className="earth-event-year">
                {formatEventBrowserYear(selectedGalaxyEvent.yearMa)}
              </p>
              <p className="earth-event-description">{selectedGalaxyEvent.description}</p>
            </div>

            <div className="earth-gts-glossary" aria-label="Geologic time scale nomenclature">
              <h3>Geologic Time Scale nomenclature</h3>
              <p>Eon &gt; Era &gt; Period &gt; Epoch</p>
              <dl>
                <div>
                  <dt>Eon</dt>
                  <dd>Largest named span of geologic time.</dd>
                </div>
                <div>
                  <dt>Era</dt>
                  <dd>Major subdivision within an eon.</dd>
                </div>
                <div>
                  <dt>Period</dt>
                  <dd>Subdivision within an era.</dd>
                </div>
                <div>
                  <dt>Epoch</dt>
                  <dd>Finer subdivision within a period.</dd>
                </div>
              </dl>
            </div>
          </aside>
        ) : null}
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
