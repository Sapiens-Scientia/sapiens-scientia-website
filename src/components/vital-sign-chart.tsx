"use client";

import { useId, useState } from "react";
import type { EarthVitalSign } from "@/lib/vital-signs";

type ChartPoint = { year: number; value: number; kind: "Reference" | "Projection" | "Source update"; period: string };
const WIDTH = 320;
const HEIGHT = 132;
const PAD = { top: 14, right: 12, bottom: 22, left: 38 };
const number = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 3 });

function formatValue(value: number, unit: string) {
  return unit.startsWith("$") ? `$${number(value)}${unit.slice(1)}` : `${number(value)} ${unit}`.trim();
}

/** Shared by the dashboard and globe, with a native disclosure for non-pointer access. */
export function VitalSignChart({ sign }: { sign: EarthVitalSign }) {
  const gradientId = useId();
  const [selected, setSelected] = useState<ChartPoint | null>(null);
  const data = sign.historicalData;
  if (!data) return null;
  const points: ChartPoint[] = data.points.map((point) => ({ ...point, kind: "Reference", period: String(point.year) }));
  const projection: ChartPoint[] = (data.projection ?? []).map((point) => ({ ...point, kind: "Projection", period: String(point.year) }));
  const latest: ChartPoint | null = sign.liveChartPoint
    ? { ...sign.liveChartPoint, kind: "Source update", period: sign.updated }
    : null;
  const all = [...points, ...projection, ...(latest ? [latest] : [])];
  if (!all.length) return null;

  const minYear = Math.min(...all.map((point) => point.year));
  const maxYear = Math.max(...all.map((point) => point.year));
  const minValue = Math.min(...all.map((point) => point.value));
  const maxValue = Math.max(...all.map((point) => point.value));
  const buffer = (maxValue - minValue || 1) * 0.1;
  const baseline = HEIGHT - PAD.bottom;
  const x = (year: number) => PAD.left + (year - minYear) / (maxYear - minYear || 1) * (WIDTH - PAD.left - PAD.right);
  const y = (value: number) => baseline - (value - minValue + buffer) / (maxValue - minValue + 2 * buffer) * (baseline - PAD.top);
  const path = (series: ChartPoint[]) => series.length ? `M ${series.map((point) => `${x(point.year)},${y(point.value)}`).join(" L ")}` : "";
  const historyPath = path(points);
  const last = points.at(-1);
  const area = last ? `${historyPath} L ${x(last.year)},${baseline} L ${x(points[0].year)},${baseline} Z` : "";
  const source = sign.referenceSource ?? { label: sign.source, href: sign.sourceHref };

  const selectPoint = (event: React.PointerEvent<SVGSVGElement>) => {
    // Use the actual SVG transform, including viewBox scaling and letterboxing.
    const matrix = event.currentTarget.getScreenCTM();
    if (!matrix) return;
    const cursor = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const closest = all.reduce((best, point) =>
      Math.hypot(x(point.year) - cursor.x, y(point.value) - cursor.y) < Math.hypot(x(best.year) - cursor.x, y(best.value) - cursor.y) ? point : best,
    );
    setSelected(closest);
  };

  return (
    <div className="min-w-0 text-slate-400">
      {data.label && <p className="mb-2 text-xs leading-5 text-slate-300">Chart: {data.label}</p>}
      <div className="min-h-9 font-mono text-[0.65rem] leading-4">
        {selected
          ? `${selected.kind} · ${selected.period}: ${formatValue(selected.value, data.unit)}`
          : "Explore the chart or open its data below"}
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="vital-sparkline w-full cursor-crosshair select-none overflow-visible"
        role="img"
        aria-label={`${sign.label}. ${data.label ?? data.unit}. Reference series from ${points[0]?.year ?? minYear} to ${last?.year ?? maxYear}${projection.length ? ", with a dashed illustrative projection" : ""}${latest ? " and a separate source update" : ""}. All values are available in View chart data.`}
        onPointerMove={selectPoint}
        onPointerDown={selectPoint}
        onPointerLeave={(event) => { if (event.pointerType === "mouse") setSelected(null); }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sign.accent} stopOpacity={0.3} />
            <stop offset="100%" stopColor={sign.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[minValue, maxValue].map((value, index) => (
          <g key={index}>
            <line x1={PAD.left} y1={y(value)} x2={WIDTH - PAD.right} y2={y(value)} stroke="currentColor" strokeOpacity={0.2} strokeDasharray="2 3" />
            <text x={PAD.left - 6} y={y(value) + 3} textAnchor="end" fontSize={9} fill="currentColor" fontFamily="monospace">{number(value)}</text>
          </g>
        ))}
        <line x1={PAD.left} y1={baseline} x2={WIDTH - PAD.right} y2={baseline} stroke="currentColor" strokeOpacity={0.3} />
        {[minYear, maxYear].map((year, index) => (
          <text key={index} x={x(year)} y={baseline + 14} textAnchor="middle" fontSize={9} fill="currentColor" fontFamily="monospace">{Math.floor(year)}</text>
        ))}
        {area && <path d={area} fill={`url(#${gradientId})`} />}
        {historyPath && <path d={historyPath} fill="none" stroke={sign.accent} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />}
        {projection.length > 0 && <path d={path(last ? [last, ...projection] : projection)} fill="none" stroke={sign.accent} strokeWidth={1.7} strokeDasharray="3 3" strokeLinecap="round" />}
        {last && <circle cx={x(last.year)} cy={y(last.value)} r={2.6} fill={sign.accent} />}
        {latest && <circle cx={x(latest.year)} cy={y(latest.value)} r={4} fill="var(--chart-point-bg, #0f172a)" stroke={sign.accent} strokeWidth={2} />}
        {selected && (
          <g>
            <line x1={x(selected.year)} y1={PAD.top} x2={x(selected.year)} y2={baseline} stroke="currentColor" strokeOpacity={0.5} strokeDasharray="2 2" />
            <circle cx={x(selected.year)} cy={y(selected.value)} r={3.5} fill={sign.accent} />
          </g>
        )}
      </svg>
      <details className="border-t border-white/10 text-xs">
        <summary className="min-h-10 cursor-pointer py-3 text-slate-300">View chart data<span className="sr-only"> for {sign.label}</span></summary>
        <p className="mb-3 leading-5">
          Solid line: curated reference series. Dashed line: illustrative projection, not a forecast.
          {latest && " The outlined point is a separately fetched source observation; it does not revise the reference series or projection."}
        </p>
        <div className="max-h-64 overflow-auto" tabIndex={0} role="region" aria-label={`${sign.label} chart data`}>
          <table className="w-full text-left text-[0.65rem] leading-5">
            <caption className="sr-only">{sign.label}{data.label ? `: ${data.label}` : ""} — reference, projection and source values</caption>
            <thead><tr className="border-b border-white/10"><th scope="col" className="pr-2 py-1">Period</th><th scope="col" className="pr-2">Value</th><th scope="col">Series</th></tr></thead>
            <tbody>{all.sort((a, b) => a.year - b.year).map((point, index) => (
              <tr key={`${point.kind}-${index}`} className="border-b border-white/5">
                <th scope="row" className="pr-2 py-1.5 font-normal">{point.period}</th>
                <td className="pr-2">{formatValue(point.value, data.unit)}</td><td>{point.kind}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="mt-3 leading-5">Reference source: <a href={source.href} target="_blank" rel="noreferrer" className="underline underline-offset-2">{source.label}</a>. Values are curated, rounded reference points rather than a complete source dataset.</p>
      </details>
    </div>
  );
}
