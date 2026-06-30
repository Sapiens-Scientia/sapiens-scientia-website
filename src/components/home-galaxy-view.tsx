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

const cosmicHierarchy = [
  {
    name: "Dust grain",
    size: "~1 um",
    description: "Tiny mineral and carbon particles drifting between stars.",
  },
  {
    name: "Pebble",
    size: "~1 cm",
    description: "Early building blocks that can collect inside planet-forming disks.",
  },
  {
    name: "Boulder",
    size: "~1 m",
    description: "A compact rocky body shaped by collision, gravity, and accretion.",
  },
  {
    name: "Asteroid",
    size: "~1-1,000 km",
    description: "Leftover planetesimals preserving early Solar System material.",
  },
  {
    name: "Moon",
    size: "~1,000-5,000 km",
    description: "Natural satellites orbiting planets and sculpting tides and impacts.",
  },
  {
    name: "Planet",
    size: "~10,000 km",
    description: "A rounded world orbiting a star; Earth is the living example here.",
  },
  {
    name: "Star",
    size: "~1 million km",
    description: "A self-gravitating fusion engine that lights and enriches space.",
  },
  {
    name: "Solar system",
    size: "~10^13 m",
    description: "A star, its planets, and the small bodies bound to it.",
  },
  {
    name: "Stellar neighborhood",
    size: "~10-100 ly",
    description: "Nearby stars moving together through a small patch of the galaxy.",
  },
  {
    name: "Milky Way",
    size: "~100,000 ly",
    description: "A spiral galaxy of stars, gas, dust, dark matter, and our Sun.",
  },
  {
    name: "Local Group",
    size: "~10 million ly",
    description: "The Milky Way, Andromeda, and smaller galaxies gravitationally bound.",
  },
  {
    name: "Virgo Supercluster",
    size: "~100 million ly",
    description: "A vast regional concentration of galaxy groups and clusters.",
  },
  {
    name: "Laniakea",
    size: "~500 million ly",
    description: "The larger flow basin of galaxies that includes the Milky Way.",
  },
  {
    name: "Observable universe",
    size: "~93 billion ly",
    description: "Everything whose light has had time to reach us since the Big Bang.",
  },
];

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

        <aside className="cosmic-hierarchy-panel" aria-label="Cosmic object hierarchy">
          <div className="earth-event-browser-header">
            <span>Object Hierarchy</span>
            <strong>Scale</strong>
          </div>

          <div className="cosmic-hierarchy-list">
            {cosmicHierarchy.map((item) => (
              <article key={item.name} className="cosmic-hierarchy-item">
                <div className="cosmic-hierarchy-item__header">
                  <h2>{item.name}</h2>
                  <span>{item.size}</span>
                </div>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </aside>

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
