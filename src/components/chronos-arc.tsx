"use client";

import { useMemo, useState } from "react";
import {
  CHRONOS_LOG_MAX,
  CHRONOS_LOG_MIN,
  ORDERS_OF_TIME,
  chronosEvents,
  eons,
  type EonId,
} from "@/lib/chronos";

const eonColor: Record<EonId, string> = {
  cosmos: "#f59e0b",
  gaia: "#34d399",
  mind: "#a78bfa",
  sapiens: "#38bdf8",
};

// Relative log-spans used to size the eon mini-map segments, mirroring how the
// scale ladder weights its tiers by orders of magnitude.
const eonWeight: Record<EonId, number> = {
  cosmos: 0.5,
  gaia: 0.9,
  mind: 2.3,
  sapiens: 5.0,
};

const span = CHRONOS_LOG_MAX - CHRONOS_LOG_MIN;

export function ChronosArc() {
  const defaultEvent = useMemo(
    () => chronosEvents.findIndex((event) => event.here),
    [],
  );
  const [activeEvent, setActiveEvent] = useState(defaultEvent);
  const [focusedEon, setFocusedEon] = useState<EonId | null>(null);

  const active = chronosEvents[activeEvent];

  return (
    <div className="border border-white/10 bg-white/[0.02] p-4 sm:p-6">
      {/* Eon mini-map — proportional to each eon's span on the log-time axis */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-[0.18em] text-slate-500">
          <span>Deep past</span>
          <span>{ORDERS_OF_TIME} orders of magnitude in time</span>
          <span>Present</span>
        </div>
        <div className="flex h-9 w-full gap-1">
          {eons.map((eon) => {
            const isFocused = focusedEon === eon.id;
            const dimmed = focusedEon !== null && !isFocused;
            return (
              <button
                key={eon.id}
                type="button"
                aria-pressed={isFocused}
                onClick={() =>
                  setFocusedEon((current) => (current === eon.id ? null : eon.id))
                }
                style={{ flexGrow: eonWeight[eon.id], borderColor: eon.color }}
                className={`group relative flex items-center justify-center overflow-hidden border-b-2 bg-white/[0.03] text-[0.7rem] font-semibold uppercase tracking-[0.12em] transition-all hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                  dimmed ? "opacity-40" : "opacity-100"
                }`}
              >
                <span
                  className="absolute inset-0"
                  style={{ backgroundColor: eon.color, opacity: isFocused ? 0.16 : 0.05 }}
                />
                <span className="relative z-10 max-sm:hidden" style={{ color: eon.color }}>
                  {eon.name}
                </span>
                <span className="relative z-10 sm:hidden" style={{ color: eon.color }}>
                  {eon.ordinal.replace("Eon ", "")}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[0.7rem] leading-4 text-slate-500">
          {focusedEon
            ? `Focusing the ${eons.find((e) => e.id === focusedEon)?.name} eon. Tap again to clear.`
            : "Tap an eon to focus it. Hover an event to read it."}
        </p>
      </div>

      {/* The arc */}
      <ol className="mt-5 flex flex-col">
        {chronosEvents.map((event, index) => {
          // Fill grows toward the present: recent events (smaller log) fill more
          // of the rail, dramatizing how a log axis stretches recent time.
          const fraction = Math.max(
            0.025,
            (CHRONOS_LOG_MAX - event.log) / span,
          );
          const color = eonColor[event.eon];
          const isActive = index === activeEvent;
          const dimmed = focusedEon !== null && event.eon !== focusedEon;

          return (
            <li key={event.name}>
              <button
                type="button"
                onMouseEnter={() => setActiveEvent(index)}
                onFocus={() => setActiveEvent(index)}
                onClick={() => setActiveEvent(index)}
                className={`grid w-full grid-cols-[3.6rem_1fr] items-center gap-3 rounded-sm py-1.5 text-left transition-opacity sm:grid-cols-[4.75rem_1fr] ${
                  dimmed ? "opacity-25" : "opacity-100"
                }`}
              >
                <span
                  className="text-right font-mono text-xs tabular-nums sm:text-sm"
                  style={{ color }}
                >
                  {event.ageLabel}
                </span>

                <span className="relative flex h-9 items-center overflow-hidden border border-white/5">
                  {/* proportional log fill */}
                  <span
                    className="absolute inset-y-0 left-0 transition-all duration-500"
                    style={{
                      width: `${fraction * 100}%`,
                      background: `linear-gradient(90deg, ${color}00, ${color}${
                        isActive ? "44" : "22"
                      })`,
                    }}
                  />
                  {/* rail node */}
                  <span className="relative z-10 ml-2 flex h-full items-center">
                    <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                      {event.here ? (
                        <span
                          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                          style={{ backgroundColor: color }}
                        />
                      ) : null}
                      <span
                        className="relative inline-flex h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: isActive || event.here ? color : "#0f172a",
                          boxShadow: `0 0 0 1.5px ${color}`,
                        }}
                      />
                    </span>
                  </span>
                  <span className="relative z-10 ml-3 flex flex-1 items-baseline justify-between gap-3 pr-3">
                    <span
                      className={`text-sm font-medium sm:text-base ${
                        isActive ? "text-white" : "text-slate-200"
                      }`}
                    >
                      {event.name}
                      {event.here ? (
                        <span
                          className="ml-2 align-middle text-[0.6rem] font-semibold uppercase tracking-[0.14em]"
                          style={{ color }}
                        >
                          You are here
                        </span>
                      ) : null}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Active event detail */}
      <div
        className="mt-4 flex items-start gap-3 border-t border-white/10 pt-4"
        aria-live="polite"
      >
        <span
          className="mt-1 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: eonColor[active.eon] }}
        />
        <div>
          <p className="text-sm font-semibold text-white">
            {active.name}
            <span className="ml-2 font-mono text-xs font-normal text-slate-400">
              {active.ageLabel} ago
            </span>
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{active.note}</p>
        </div>
      </div>
    </div>
  );
}
