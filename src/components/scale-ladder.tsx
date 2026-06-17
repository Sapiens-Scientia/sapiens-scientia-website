"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  LADDER_LOG_MAX,
  LADDER_LOG_MIN,
  ORDERS_OF_MAGNITUDE,
  findRungIndexBySlug,
  platforms,
  rungSlug,
  scaleRungs,
  scaleTiers,
  type ScaleTierId,
} from "@/lib/scales";

const SUPERSCRIPT: Record<string, string> = {
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

function exponentLabel(log: number) {
  const exponent = String(Math.round(log))
    .split("")
    .map((char) => SUPERSCRIPT[char] ?? char)
    .join("");
  return `10${exponent}`;
}

const tierColor: Record<ScaleTierId, string> = {
  micro: "#38bdf8",
  meso: "#a78bfa",
  macro: "#818cf8",
  mega: "#34d399",
};

// Relative log-spans used to size the tier mini-map segments.
const tierWeight: Record<ScaleTierId, number> = {
  micro: 14,
  meso: 5.5,
  macro: 5,
  mega: 4.7,
};

const span = LADDER_LOG_MAX - LADDER_LOG_MIN;

const tierPlatforms = Object.fromEntries(
  scaleTiers.map((tier) => [tier.id, tier.platforms]),
) as Record<ScaleTierId, (keyof typeof platforms)[]>;

function rungPlatforms(rung: (typeof scaleRungs)[number]) {
  return rung.platforms ?? tierPlatforms[rung.tier];
}

export function ScaleLadder() {
  const defaultRung = useMemo(
    () => scaleRungs.findIndex((rung) => rung.here),
    [],
  );
  const [activeRung, setActiveRung] = useState(() => {
    if (typeof window === "undefined") {
      return defaultRung;
    }

    const fromHash = findRungIndexBySlug(window.location.hash.replace(/^#/, ""));
    return fromHash >= 0 ? fromHash : defaultRung;
  });
  const [focusedTier, setFocusedTier] = useState<ScaleTierId | null>(null);

  const active = scaleRungs[activeRung];

  const selectRung = (index: number) => {
    setActiveRung(index);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${rungSlug(scaleRungs[index].name)}`);
    }
  };

  return (
    <div className="border border-white/10 bg-white/[0.02] p-4 sm:p-6">
      {/* Tier mini-map — proportional to each tier's span in orders of magnitude */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-[0.18em] text-slate-500">
          <span>Smallest</span>
          <span>{ORDERS_OF_MAGNITUDE} orders of magnitude</span>
          <span>Largest</span>
        </div>
        <div className="flex h-9 w-full gap-1">
          {scaleTiers.map((tier) => {
            const isFocused = focusedTier === tier.id;
            const dimmed = focusedTier !== null && !isFocused;
            return (
              <button
                key={tier.id}
                type="button"
                aria-pressed={isFocused}
                onClick={() =>
                  setFocusedTier((current) => (current === tier.id ? null : tier.id))
                }
                style={{ flexGrow: tierWeight[tier.id], borderColor: tier.color }}
                className={`group relative flex items-center justify-center overflow-hidden border-b-2 bg-white/[0.03] text-[0.7rem] font-semibold uppercase tracking-[0.12em] transition-all hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                  dimmed ? "opacity-40" : "opacity-100"
                }`}
              >
                <span
                  className="absolute inset-0"
                  style={{ backgroundColor: tier.color, opacity: isFocused ? 0.16 : 0.05 }}
                />
                <span className="relative z-10 text-slate-200 max-sm:hidden" style={{ color: tier.color }}>
                  {tier.name.replace("systems", "")}
                </span>
                <span className="relative z-10 text-slate-200 sm:hidden" style={{ color: tier.color }}>
                  {tier.ordinal.replace("Tier ", "")}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[0.7rem] leading-4 text-slate-500">
          {focusedTier
            ? `Focusing ${scaleTiers.find((t) => t.id === focusedTier)?.name}. Tap again to clear.`
            : "Tap a tier to focus it. Hover a rung to read it."}
        </p>
      </div>

      {/* The ladder */}
      <ol className="mt-5 flex flex-col">
        {scaleRungs.map((rung, index) => {
          const fraction = Math.max(
            0.025,
            (rung.log - LADDER_LOG_MIN) / span,
          );
          const color = tierColor[rung.tier];
          const isActive = index === activeRung;
          const dimmed = focusedTier !== null && rung.tier !== focusedTier;
          const rungPlatformIds = rungPlatforms(rung);

          return (
            <li key={rung.name}>
              <button
                type="button"
                onMouseEnter={() => setActiveRung(index)}
                onFocus={() => setActiveRung(index)}
                onClick={() => selectRung(index)}
                className={`grid w-full grid-cols-[3.1rem_1fr] items-center gap-3 rounded-sm py-1.5 text-left transition-opacity sm:grid-cols-[4rem_1fr] ${
                  dimmed ? "opacity-25" : "opacity-100"
                }`}
              >
                <span
                  className="text-right font-mono text-xs tabular-nums sm:text-sm"
                  style={{ color }}
                >
                  {exponentLabel(rung.log)}
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
                      {rung.here ? (
                        <span
                          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                          style={{ backgroundColor: color }}
                        />
                      ) : null}
                      <span
                        className="relative inline-flex h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: isActive || rung.here ? color : "#0f172a",
                          boxShadow: `0 0 0 1.5px ${color}`,
                        }}
                      />
                    </span>
                  </span>
                  <span className="relative z-10 ml-3 flex flex-1 items-baseline justify-between gap-3 pr-3">
                    <span
                      className={`flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1 text-sm font-medium sm:text-base ${
                        isActive ? "text-white" : "text-slate-200"
                      }`}
                    >
                      <span>{rung.name}</span>
                      {rungPlatformIds.map((platformId) => {
                        const platform = platforms[platformId];
                        return (
                          <span
                            key={platformId}
                            className="align-middle text-[0.55rem] font-semibold uppercase tracking-[0.12em]"
                            style={{ color: platform.color }}
                          >
                            {platform.name}
                          </span>
                        );
                      })}
                      {rung.here ? (
                        <span
                          className="align-middle text-[0.6rem] font-semibold uppercase tracking-[0.14em]"
                          style={{ color }}
                        >
                          You are here
                        </span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-slate-400">
                      {rung.sizeLabel}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Active rung detail */}
      <div
        className="mt-4 flex items-start gap-3 border-t border-white/10 pt-4"
        aria-live="polite"
      >
        <span
          className="mt-1 h-3 w-3 shrink-0 rounded-full"
          style={{ backgroundColor: tierColor[active.tier] }}
        />
        <div>
          <p className="text-sm font-semibold text-white">
            {active.name}
            <span className="ml-2 font-mono text-xs font-normal text-slate-400">
              {active.sizeLabel}
            </span>
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{active.note}</p>
          {rungPlatforms(active).length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Platforms
              </span>
              {rungPlatforms(active).map((platformId) => {
                const platform = platforms[platformId];
                return (
                  <Link
                    key={platformId}
                    href={platform.href}
                    className="border px-2.5 py-1 text-xs font-medium transition-colors hover:text-white"
                    style={{
                      borderColor: `${platform.color}55`,
                      color: platform.color,
                    }}
                  >
                    {platform.name}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
