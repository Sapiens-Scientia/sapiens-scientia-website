"use client";

import { useMemo, useState } from "react";
import {
  vitalSignDomains,
  vitalSignTrend,
  type EarthVitalSign,
  type VitalSignDomainId,
} from "@/lib/vital-signs";

// The /vitals dashboard surface: a filterable, sortable grid of planetary
// indicators, each drawn as a hover-readable sparkline with its historical
// series and dashed projection to 2050. Pure React state + inline SVG — no
// render loop, no chart library — to match the hand-built visuals used across
// the site. Colours come from each sign's accent; chrome uses currentColor so
// the charts adapt to the light/dark theme automatically.

import { VitalSignChart } from "@/components/vital-sign-chart";
import { useLiveVitalSigns } from "@/hooks/use-live-vital-signs";

type DomainFilter = VitalSignDomainId | "all";
type SortMode = "default" | "name" | "change";

const sortModes: { id: SortMode; label: string }[] = [
  { id: "default", label: "By domain" },
  { id: "change", label: "Most changed" },
  { id: "name", label: "A–Z" },
];

const domainName = new Map(vitalSignDomains.map((domain) => [domain.id, domain.name]));

function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

export function VitalSignsDashboard() {
  const { signs, liveIds, status } = useLiveVitalSigns();
  const [domain, setDomain] = useState<DomainFilter>("all");
  const [sort, setSort] = useState<SortMode>("default");

  const visibleSigns = useMemo(() => {
    const filtered =
      domain === "all"
        ? signs
        : signs.filter((sign) => sign.domain === domain);

    if (sort === "name") {
      return [...filtered].sort((a, b) => a.label.localeCompare(b.label));
    }

    if (sort === "change") {
      return [...filtered].sort(
        (a, b) =>
          (vitalSignTrend(b)?.changeMagnitude ?? 0) -
          (vitalSignTrend(a)?.changeMagnitude ?? 0),
      );
    }

    return filtered;
  }, [domain, sort, signs]);

  // When showing everything in default order, lay the cards out under their
  // domain headings; otherwise render one flat, ranked grid.
  const grouped = domain === "all" && sort === "default";

  return (
    <div className="flex flex-col gap-7">
      <p className="text-sm leading-6 text-slate-400" role="status">
        {status === "loading" ? "Checking public sources for updates… Reference values are available below."
          : status === "error" ? "Source updates are unavailable. Showing the dated reference values below."
          : `${liveIds.size} indicators updated from public sources. Other indicators retain their dated reference values.`}
        {" "}Observation dates differ by source; these are not real-time measurements.
      </p>
      <Toolbar
        domain={domain}
        sort={sort}
        onDomainChange={setDomain}
        onSortChange={setSort}
        count={visibleSigns.length}
      />

      {grouped ? (
        <div className="flex flex-col gap-12">
          {vitalSignDomains.map((group) => {
            const groupSigns = signs.filter((sign) => sign.domain === group.id);
            if (groupSigns.length === 0) return null;

            return (
              <section key={group.id} className="flex flex-col gap-5">
                <div
                  className="flex flex-col gap-1 border-l-2 pl-4"
                  style={{ borderColor: group.accent }}
                >
                  <h2
                    className="text-xl font-semibold tracking-normal sm:text-2xl"
                    style={{ color: group.accent }}
                  >
                    {group.name}
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-slate-400">{group.blurb}</p>
                </div>
                <CardGrid signs={groupSigns} />
              </section>
            );
          })}
        </div>
      ) : (
        <CardGrid signs={visibleSigns} />
      )}
    </div>
  );
}

function Toolbar({
  domain,
  sort,
  onDomainChange,
  onSortChange,
  count,
}: {
  domain: DomainFilter;
  sort: SortMode;
  onDomainChange: (next: DomainFilter) => void;
  onSortChange: (next: SortMode) => void;
  count: number;
}) {
  const chips: { id: DomainFilter; label: string; accent?: string }[] = [
    { id: "all", label: "All signs" },
    ...vitalSignDomains.map((group) => ({
      id: group.id as DomainFilter,
      label: group.name,
      accent: group.accent,
    })),
  ];

  return (
    <div className="flex min-w-0 flex-col gap-4 border-y border-white/10 py-5">
      <div className="flex flex-wrap items-center gap-2.5" role="group" aria-label="Filter by domain">
        {chips.map((chip) => {
          const active = domain === chip.id;
          const accent = chip.accent ?? "#94a3b8";

          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onDomainChange(chip.id)}
              aria-pressed={active}
              className="min-h-10 cursor-pointer border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors"
              style={{
                borderColor: active ? accent : "rgba(255,255,255,0.12)",
                backgroundColor: active ? withAlpha(accent, "1f") : "transparent",
                color: active ? accent : undefined,
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="font-mono text-xs text-slate-500">
          {count} {count === 1 ? "indicator" : "indicators"} shown
        </p>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono uppercase tracking-[0.12em] text-slate-500">Sort</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Sort indicators">
            {sortModes.map((mode) => {
              const active = sort === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onSortChange(mode.id)}
                  aria-pressed={active}
                  className={`min-h-10 cursor-pointer border px-2.5 py-1 font-medium transition-colors ${
                    active
                      ? "border-white/25 bg-white/[0.08] text-white"
                      : "border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CardGrid({ signs }: { signs: EarthVitalSign[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {signs.map((sign) => (
        <VitalSignCard key={sign.label} sign={sign} />
      ))}
    </div>
  );
}

function VitalSignCard({ sign }: { sign: EarthVitalSign }) {
  const trend = vitalSignTrend(sign);
  const unit = sign.historicalData?.unit ?? "";

  // Render a value with its unit attached, handling currency ($T → "$118T")
  // and dropping long descriptive units ("% used") that would crowd the caption.
  const withUnit = (value: number) => {
    if (!unit) return `${value}`;
    if (unit.startsWith("$")) return `$${value}${unit.slice(1)}`;
    if (unit.length <= 4) return `${value}${unit}`;
    return `${value}`;
  };

  return (
    <article
      className="flex min-w-0 flex-col gap-4 border border-white/10 bg-white/[0.025] p-5 shadow-[0_0_28px_rgba(15,23,42,0.22)] transition-colors hover:bg-white/[0.04]"
      style={{ color: undefined }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-100">{sign.label}</h3>
          <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-slate-500">
            {domainName.get(sign.domain)}
          </p>
        </div>
        {trend ? <TrendBadge direction={trend.direction} /> : null}
      </div>

      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-semibold tracking-tight" style={{ color: sign.accent }}>
          {sign.value}
        </p>
      </div>

      <VitalSignChart sign={sign} />

      {trend ? (
        <p className="font-mono text-[0.7rem] text-slate-500">
          Reference series: {withUnit(trend.first.value)} ({trend.first.year}) →{" "}
          <span className="text-slate-300">
            {withUnit(trend.last.value)} ({trend.last.year})
          </span>
          {trend.projectedTo ? (
            <>
              {" · "}
              <span style={{ color: withAlpha(sign.accent, "cc") }}>
                ~{withUnit(trend.projectedTo.value)} by {trend.projectedTo.year}
              </span>
            </>
          ) : null}
        </p>
      ) : null}

      <p className="text-xs leading-6 text-slate-400">{sign.note}</p>

      {sign.earthSystemLinks && sign.earthSystemLinks.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {sign.earthSystemLinks.slice(0, 4).map((label) => (
            <span
              key={label}
              className="border px-2 py-0.5 text-[0.7rem] leading-5 text-slate-300"
              style={{
                borderColor: withAlpha(sign.accent, "33"),
                backgroundColor: withAlpha(sign.accent, "0d"),
              }}
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <a
          href={sign.sourceHref}
          target="_blank"
          rel="noreferrer"
          className="text-[0.7rem] font-medium text-slate-400 transition-colors hover:text-white"
        >
          {sign.source} <span aria-hidden>↗</span>
        </a>
        <span className="text-right font-mono text-[0.7rem] text-slate-400">{sign.updated}</span>
      </div>
    </article>
  );
}

function TrendBadge({ direction }: { direction: "rising" | "falling" | "flat" }) {
  const config = {
    rising: { glyph: "▲", label: "Rising", color: "#fb7185" },
    falling: { glyph: "▼", label: "Falling", color: "#38bdf8" },
    flat: { glyph: "→", label: "Stable", color: "#94a3b8" },
  }[direction];

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1 border px-2 py-0.5 text-[0.7rem] font-medium"
      style={{
        borderColor: withAlpha(config.color, "40"),
        backgroundColor: withAlpha(config.color, "14"),
        color: config.color,
      }}
      title={`${config.label} over the historical record`}
    >
      <span aria-hidden>{config.glyph}</span>
      {config.label}
    </span>
  );
}
