"use client";

import { useState } from "react";
import type { EarthVitalSign } from "@/lib/vital-signs";

export function VitalSignChart({ sign }: { sign: EarthVitalSign }) {
  const [hoveredPoint, setHoveredPoint] = useState<{ year: number; value: number } | null>(null);
  const data = sign.historicalData;
  if (!data) return null;

  const points = data.points;
  const projection = data.projection || [];
  const livePoint = sign.liveChartPoint;
  const allPoints = [
    ...points,
    ...projection,
    ...(livePoint ? [livePoint] : []),
  ];
  if (allPoints.length === 0) return null;

  // Find mins and maxs
  const years = allPoints.map((p) => p.year);
  const values = allPoints.map((p) => p.value);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Buffer values slightly so the line doesn't clip at top/bottom
  const valRange = maxValue - minValue || 1;
  const yMin = minValue - valRange * 0.1;
  const yMax = maxValue + valRange * 0.1;
  const yearRange = maxYear - minYear || 1;

  // SVG dimensions
  const width = 280;
  const height = 110;
  const padding = { top: 15, right: 15, bottom: 20, left: 35 };

  // Map coordinates
  const getX = (year: number) => padding.left + ((year - minYear) / yearRange) * (width - padding.left - padding.right);
  const getY = (value: number) => height - padding.bottom - ((value - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom);

  // Generate path for historical data
  const histPoints = points.map((p) => `${getX(p.year)},${getY(p.value)}`);
  const histPath = `M ${histPoints.join(" L ")}`;

  // Generate path for area gradient fill
  const areaPath = points.length > 0 ? `${histPath} L ${getX(points[points.length - 1].year)},${height - padding.bottom} L ${getX(points[0].year)},${height - padding.bottom} Z` : "";

  // Generate path for projection data (dashed line)
  let projPath = "";
  if (projection.length > 0 && points.length > 0) {
    const lastHist = points[points.length - 1];
    const projPoints = [lastHist, ...projection].map((p) => `${getX(p.year)},${getY(p.value)}`);
    projPath = `M ${projPoints.join(" L ")}`;
  }

  // Interactive tooltip tracking state

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Find the closest point in x direction
    let closest = allPoints[0];
    let minDist = Math.abs(getX(allPoints[0].year) - x);

    for (let i = 1; i < allPoints.length; i++) {
      const dist = Math.abs(getX(allPoints[i].year) - x);
      if (dist < minDist) {
        minDist = dist;
        closest = allPoints[i];
      }
    }

    setHoveredPoint(closest);
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="mt-3 border border-white/5 bg-white/[0.015] p-2 rounded" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center text-[0.62rem] font-mono text-slate-400 mb-1">
        <span>Historical Trend & Projection</span>
        <span className="text-white font-semibold">
          {hoveredPoint
            ? `${hoveredPoint.year.toFixed(hoveredPoint.year % 1 === 0 ? 0 : 1)}: ${hoveredPoint.value}${data.unit}`
            : livePoint
              ? `Live: ${livePoint.value}${data.unit}`
              : "Hover for details"}
        </span>
      </div>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="overflow-visible select-none cursor-crosshair"
      >
        <defs>
          <linearGradient id={`grad-${sign.label.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sign.accent} stopOpacity={0.35} />
            <stop offset="100%" stopColor={sign.accent} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* X axis line */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#334155"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* Grid lines (min, max) */}
        <line
          x1={padding.left}
          y1={getY(minValue)}
          x2={width - padding.right}
          y2={getY(minValue)}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <line
          x1={padding.left}
          y1={getY(maxValue)}
          x2={width - padding.right}
          y2={getY(maxValue)}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* Y Axis Labels */}
        <text
          x={padding.left - 6}
          y={getY(minValue) + 3}
          textAnchor="end"
          fontSize="8"
          fill="#94a3b8"
          fontFamily="monospace"
        >
          {minValue.toFixed(minValue % 1 === 0 ? 0 : 1)}
        </text>
        <text
          x={padding.left - 6}
          y={getY(maxValue) + 3}
          textAnchor="end"
          fontSize="8"
          fill="#94a3b8"
          fontFamily="monospace"
        >
          {maxValue.toFixed(maxValue % 1 === 0 ? 0 : 1)}
        </text>

        {/* X Axis Labels */}
        <text
          x={getX(minYear)}
          y={height - padding.bottom + 12}
          textAnchor="middle"
          fontSize="8"
          fill="#94a3b8"
          fontFamily="monospace"
        >
          {minYear}
        </text>
        <text
          x={getX(maxYear)}
          y={height - padding.bottom + 12}
          textAnchor="middle"
          fontSize="8"
          fill="#94a3b8"
          fontFamily="monospace"
        >
          {maxYear}
        </text>

        {/* Area fill under historical line */}
        {areaPath && (
          <path
            d={areaPath}
            fill={`url(#grad-${sign.label.replace(/\s+/g, "-")})`}
          />
        )}

        {/* Historical line */}
        <path
          d={histPath}
          fill="none"
          stroke={sign.accent}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Projection line (dashed) */}
        {projPath && (
          <path
            d={projPath}
            fill="none"
            stroke={sign.accent}
            strokeWidth="1.75"
            strokeDasharray="3 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
        )}

        {/* Data points (circles) */}
        {points.map((p, idx) => (
          <circle
            key={`p-${idx}`}
            cx={getX(p.year)}
            cy={getY(p.value)}
            r={hoveredPoint?.year === p.year ? 4 : 2}
            fill="#0f172a"
            stroke={sign.accent}
            strokeWidth={1.5}
            className="transition-all duration-200"
          />
        ))}

        {/* Projection points (circles) */}
        {projection.map((p, idx) => (
          <circle
            key={`proj-${idx}`}
            cx={getX(p.year)}
            cy={getY(p.value)}
            r={hoveredPoint?.year === p.year ? 4 : 2}
            fill="#0f172a"
            stroke={sign.accent}
            strokeWidth={1.25}
            strokeDasharray="1 1"
            className="transition-all duration-200"
          />
        ))}

        {livePoint && (
          <g>
            <circle
              cx={getX(livePoint.year)}
              cy={getY(livePoint.value)}
              r={7}
              fill={sign.accent}
              fillOpacity={0.2}
              className="animate-pulse"
            />
            <circle
              cx={getX(livePoint.year)}
              cy={getY(livePoint.value)}
              r={4}
              fill={sign.accent}
              stroke="#0f172a"
              strokeWidth={1.5}
            />
          </g>
        )}

        {/* Vertical hover marker line */}
        {hoveredPoint && (
          <line
            x1={getX(hoveredPoint.year)}
            y1={padding.top}
            x2={getX(hoveredPoint.year)}
            y2={height - padding.bottom}
            stroke="#64748b"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            opacity="0.8"
          />
        )}
      </svg>
    </div>
  );
}
