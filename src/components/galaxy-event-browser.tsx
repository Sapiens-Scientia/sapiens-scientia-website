"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";
import { GALAXY_TIMELINE_EVENTS } from "@/components/earthview/globe/UnifiedEarthView";

function formatEventBrowserYear(yearMa: string) {
  return yearMa.replace(" Ma", " Million Years Old");
}

type GalaxyEventBrowserProps = {
  selectedEventKey: string;
  onSelectEventKey: (key: string) => void;
  className?: string;
};

/**
 * The Earth Event Browser aside shared by /history-of-planet-earth and the
 * homepage cosmic journey: a timeline-event select, stepper, detail card, and
 * the Geologic Time Scale glossary.
 */
export function GalaxyEventBrowser({
  selectedEventKey,
  onSelectEventKey,
  className,
}: GalaxyEventBrowserProps) {
  const selectedGalaxyEventIndex = GALAXY_TIMELINE_EVENTS.findIndex(
    (event) => event.key === selectedEventKey,
  );
  const selectedGalaxyEvent =
    GALAXY_TIMELINE_EVENTS[selectedGalaxyEventIndex] ?? GALAXY_TIMELINE_EVENTS[0];
  const selectGalaxyEventAt = (nextIndex: number) => {
    const boundedIndex =
      (nextIndex + GALAXY_TIMELINE_EVENTS.length) % GALAXY_TIMELINE_EVENTS.length;
    onSelectEventKey(GALAXY_TIMELINE_EVENTS[boundedIndex].key);
  };

  if (!selectedGalaxyEvent) return null;

  return (
    <aside
      className={["earth-event-browser", className].filter(Boolean).join(" ")}
      aria-label="Earth Event Browser"
    >
      <div className="earth-event-browser-header">
        <span>Earth Event Browser</span>
        <strong>
          {selectedGalaxyEventIndex + 1} / {GALAXY_TIMELINE_EVENTS.length}
        </strong>
      </div>

      <label className="earth-event-select-label" htmlFor="home-earth-event-select">
        Timeline event
      </label>
      <select
        id="home-earth-event-select"
        className="earth-event-select"
        value={selectedGalaxyEvent.key}
        onChange={(event) => onSelectEventKey(event.target.value)}
      >
        {GALAXY_TIMELINE_EVENTS.map((event) => (
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
  );
}
