"use client";

import { useState } from "react";
import { planetaryBoundaries, planetarySignals } from "@/lib/planetary-boundaries";

export function TerraExplorer() {
  const [selectedName, setSelectedName] = useState<string | null>("Climate change");
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  // Policy input sliders (0-100)
  const [decarbonization, setDecarbonization] = useState(0); // 0 = Business as usual (Default)
  const [deforestationControl, setDeforestationControl] = useState(0); // 0 = Business as usual (Default)

  // Calculate dynamic boundaries based on policy values
  const simBoundaries = planetaryBoundaries.map((b) => {
    let val = b.radialValue;
    if (b.name === "Climate change") {
      val = Math.max(0.32, 0.82 - (decarbonization * 0.5) / 100);
    } else if (b.name === "Ocean acidification") {
      val = Math.max(0.30, 0.68 - (decarbonization * 0.38) / 100);
    } else if (b.name === "Biosphere integrity") {
      val = Math.max(0.38, 0.98 - (deforestationControl * 0.45 + decarbonization * 0.15) / 100);
    } else if (b.name === "Land-system change") {
      val = Math.max(0.32, 0.78 - (deforestationControl * 0.46) / 100);
    } else if (b.name === "Freshwater change") {
      val = Math.max(0.30, 0.74 - (deforestationControl * 0.32 + decarbonization * 0.12) / 100);
    } else if (b.name === "Biogeochemical flows") {
      val = Math.max(0.32, 0.92 - (deforestationControl * 0.35 + decarbonization * 0.20) / 100);
    } else if (b.name === "Novel entities") {
      val = Math.max(0.35, 0.95 - (deforestationControl * 0.15 + decarbonization * 0.35) / 100);
    }

    // A boundary is considered breached if its radial value is greater than the safe limit (0.5)
    const status = val > 0.5 ? "breached" : "safe";

    // Format current states dynamically
    let currentState = b.currentState;
    if (b.name === "Climate change") {
      const ppm = Math.round(430 - (decarbonization * 80) / 100);
      const forcing = (2.91 - (decarbonization * 1.91) / 100).toFixed(2);
      currentState = `${ppm} ppm / ${forcing} W/m²`;
    } else if (b.name === "Land-system change") {
      const remaining = Math.round(60 + (deforestationControl * 15) / 100);
      currentState = `~${remaining}% global forest remaining`;
    } else if (b.name === "Ocean acidification") {
      const ph = (2.80 + (decarbonization * 0.10) / 100).toFixed(2);
      currentState = `${ph} Ω`;
    }

    return { ...b, radialValue: val, status, currentState };
  });

  const activeName = hoveredName || selectedName;
  const activeBoundary = simBoundaries.find((b) => b.name === activeName) || simBoundaries[0];

  // SVG Radar setup
  const cx = 200;
  const cy = 200;
  const safeRadius = 90;
  const numSectors = 9;
  const anglePerSector = 360 / numSectors;

  const getCoordinatesForPercent = (angleInDegrees: number, radius: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Interactive Systems Coupling Radar Chart */}
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] border border-white/10 bg-white/[0.02] p-6 rounded-xl items-center">
        
        {/* Radar SVG and Policy Inputs Column */}
        <div className="flex flex-col gap-6 items-center justify-center relative select-none">
          <div className="w-full max-w-[320px] md:max-w-[350px]">
            <svg viewBox="0 0 400 400" className="w-full h-auto overflow-visible">
              {/* Polar Grid Circles */}
              <circle cx={cx} cy={cy} r={50} fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
              <circle cx={cx} cy={cy} r={safeRadius} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.8" />
              <circle cx={cx} cy={cy} r={130} fill="none" stroke="#334155" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
              <circle cx={cx} cy={cy} r={160} fill="none" stroke="#334155" strokeWidth="0.75" opacity="0.4" />

              {/* Grid Spokes */}
              {Array.from({ length: numSectors }).map((_, i) => {
                const angle = i * anglePerSector;
                const end = getCoordinatesForPercent(angle, 165);
                return (
                  <line
                    key={`spoke-${i}`}
                    x1={cx}
                    y1={cy}
                    x2={end.x}
                    y2={end.y}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Radial sector slices */}
              {simBoundaries.map((boundary, i) => {
                const angleStart = i * anglePerSector;
                const angleEnd = (i + 1) * anglePerSector;

                // Scale the visual radius: safe stays within safeRadius (90), breached goes up to 155
                const currentRadius = boundary.status === "breached"
                  ? safeRadius + (boundary.radialValue - 0.5) * 110
                  : safeRadius * boundary.radialValue * 1.25;

                const startCoordInner = getCoordinatesForPercent(angleStart, 15);
                const endCoordInner = getCoordinatesForPercent(angleEnd, 15);
                const startCoord = getCoordinatesForPercent(angleStart, currentRadius);
                const endCoord = getCoordinatesForPercent(angleEnd, currentRadius);

                const isSelected = selectedName === boundary.name;
                const isHovered = hoveredName === boundary.name;

                const color = boundary.status === "breached" ? "#fb923c" : "#34d399";
                const fillOpacity = isSelected || isHovered ? 0.35 : 0.16;
                const strokeWidth = isSelected || isHovered ? 2.5 : 1.25;

                // Wedge SVG path
                const wedgePath = [
                  `M ${startCoordInner.x} ${startCoordInner.y}`,
                  `L ${startCoord.x} ${startCoord.y}`,
                  `A ${currentRadius} ${currentRadius} 0 0 1 ${endCoord.x} ${endCoord.y}`,
                  `L ${endCoordInner.x} ${endCoordInner.y}`,
                  `A 15 15 0 0 0 ${startCoordInner.x} ${startCoordInner.y}`,
                  "Z"
                ].join(" ");

                return (
                  <g
                    key={boundary.name}
                    className="cursor-pointer transition-all duration-300"
                    onPointerEnter={() => setHoveredName(boundary.name)}
                    onPointerLeave={() => setHoveredName(null)}
                    onClick={() => setSelectedName(boundary.name)}
                  >
                    <path
                      d={wedgePath}
                      fill={color}
                      fillOpacity={fillOpacity}
                      stroke={color}
                      strokeWidth={strokeWidth}
                      className="transition-all duration-500"
                    />
                  </g>
                );
              })}

              {/* Central Core Overlay */}
              <circle cx={cx} cy={cy} r={28} fill="#04060c" stroke="#1e293b" strokeWidth="1.5" />
              <text x={cx} y={cy + 3} textAnchor="middle" fontSize="9" fill="#64748b" letterSpacing="1.5" fontWeight="600">
                PLANET
              </text>

              {/* Safe zone label marker */}
              <path
                id="safeZoneLabelPath"
                d={`M ${cx - safeRadius + 6} ${cy} A ${safeRadius - 6} ${safeRadius - 6} 0 0 1 ${cx + safeRadius - 6} ${cy}`}
                fill="none"
              />
              <text fontSize="7.5" fill="#10b981" fontWeight="600" letterSpacing="1.5" opacity="0.6">
                <textPath href="#safeZoneLabelPath" startOffset="50%" textAnchor="middle">
                  SAFE OPERATING LIMIT
                </textPath>
              </text>
            </svg>
          </div>

          {/* Quick HUD guide */}
          <div className="flex gap-4 text-[10px] justify-center font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Safe Zone
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-400" /> Breached Boundary
            </span>
          </div>

          {/* Policy sliders */}
          <div className="w-full flex flex-col gap-4 border-t border-white/5 pt-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Decarbonization Rate</span>
                <span className="text-emerald-400 font-bold">{decarbonization}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={decarbonization}
                onChange={(e) => setDecarbonization(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <p className="text-[9px] text-slate-500 leading-normal">
                Simulates transition to clean energy. Contracts climate, acidification, and aerosol boundaries.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Deforestation Control</span>
                <span className="text-emerald-400 font-bold">{deforestationControl}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={deforestationControl}
                onChange={(e) => setDeforestationControl(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <p className="text-[9px] text-slate-500 leading-normal">
                Simulates rewilding and zero deforestation. Contracts land-system, biosphere, and water boundaries.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Boundary Description Panel */}
        <article className="border border-white/5 bg-white/[0.015] p-5 rounded-lg flex flex-col gap-4 min-h-[360px]">
          <div>
            <span
              className={[
                "text-[0.68rem] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border inline-block",
                activeBoundary.status === "breached"
                  ? "border-orange-500/30 bg-orange-500/10 text-orange-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              ].join(" ")}
            >
              {activeBoundary.status.toUpperCase()}
            </span>
            <h3 className="text-2xl font-bold mt-2 text-white">{activeBoundary.name}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-3 text-xs leading-normal">
            <div>
              <p className="font-mono text-slate-500 uppercase tracking-wider">Control Variable</p>
              <p className="text-slate-200 mt-1 font-semibold">{activeBoundary.control}</p>
            </div>
            <div>
              <p className="font-mono text-slate-500 uppercase tracking-wider">Safe limit / Current State</p>
              <p className="text-slate-200 mt-1 font-semibold">
                <span className="text-emerald-400">{activeBoundary.safeLimit.split(" / ")[0]}</span>
                <span className="text-slate-500"> / </span>
                <span className={activeBoundary.status === "breached" ? "text-orange-400 font-bold" : "text-emerald-400"}>
                  {activeBoundary.safeLimit.split(" / ")[1] ? activeBoundary.currentState : activeBoundary.currentState}
                </span>
              </p>
            </div>
          </div>

          <div className="text-sm leading-6">
            <p className="text-slate-300">{activeBoundary.description}</p>
            <p className="text-slate-400 mt-2 italic">
              <span className="font-semibold text-slate-300">Consequences: </span>
              {activeBoundary.consequences}
            </p>
          </div>

          {activeBoundary.status === "breached" && (
            <div className="mt-auto border border-orange-500/20 bg-orange-500/[0.02] p-3 text-xs leading-relaxed text-orange-300/90 rounded-md">
              <span className="font-bold">WARNING:</span> This boundary has been breached. Ecosystem stability is actively compromised.
            </div>
          )}

          {activeBoundary.status === "safe" && (
            <div className="mt-auto border border-emerald-500/20 bg-emerald-500/[0.02] p-3 text-xs leading-relaxed text-emerald-300/90 rounded-md">
              <span className="font-bold">STABLE:</span> Boundary lies within safe margins. Sustainable operating envelope verified.
            </div>
          )}
        </article>
      </section>

      {/* Boundary cards list */}
      <section className="flex flex-col gap-6">
        <h3 className="text-xl font-semibold text-slate-100">Planetary Boundaries Inventory</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {simBoundaries.map((boundary) => {
            const isBreached = boundary.status === "breached";
            const isSelected = selectedName === boundary.name;

            return (
              <article
                key={boundary.name}
                onClick={() => setSelectedName(boundary.name)}
                className={[
                  "flex flex-col gap-3 border p-4 transition-all cursor-pointer select-none rounded-lg",
                  isSelected
                    ? isBreached
                      ? "border-orange-400 bg-orange-400/[0.03]"
                      : "border-emerald-400 bg-emerald-400/[0.03]"
                    : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-base font-semibold text-slate-50">{boundary.name}</h4>
                  <span
                    className={[
                      "shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.14em]",
                      isBreached ? "text-orange-400" : "text-emerald-400"
                    ].join(" ")}
                  >
                    {isBreached ? "Breached" : "Safe Zone"}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-400 font-mono text-[11px]">{boundary.currentState}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Planetary Signals */}
      <section className="flex flex-col gap-7 border-t border-white/10 pt-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">Planetary Signals</h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            A small set of measured indicators sketches the direction of the coupled system: a warming atmosphere, a rising and acidifying ocean, thinning forests and wildlife, and an energy base still dominated by fossil fuels.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {planetarySignals.map((signal) => (
            <article key={signal.label} className="border border-white/10 bg-white/[0.035] p-5 shadow-[0_0_28px_rgba(15,23,42,0.22)] rounded-lg">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-4xl font-semibold tracking-normal text-white">{signal.value}</p>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-200/70">{signal.source}</p>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-100">{signal.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{signal.detail}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
