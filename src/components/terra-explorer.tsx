"use client";

import { useState } from "react";

type PlanetaryBoundary = {
  name: string;
  control: string;
  status: "breached" | "safe";
  safeLimit: string;
  currentState: string;
  radialValue: number; // 0 to 1 scale for radar chart visualization
  description: string;
  consequences: string;
};

const planetaryBoundaries: PlanetaryBoundary[] = [
  {
    name: "Climate change",
    control: "Atmospheric CO₂ concentration & Radiative forcing",
    status: "breached",
    safeLimit: "350 ppm / 1.0 W/m²",
    currentState: "430 ppm / 2.91 W/m²",
    radialValue: 0.82,
    description: "Elevated carbon dioxide and other greenhouse gases trap excess heat in the Earth system, warming the planet and disrupting global meteorological equilibria.",
    consequences: "Accelerates glacier and ice sheet melt, raises sea levels, intensifies droughts, wildfires, and floods, and triggers climate tipping points.",
  },
  {
    name: "Biosphere integrity",
    control: "Extinction rate (E/MSY) & Biodiversity Intactness Index",
    status: "breached",
    safeLimit: "< 10 E/MSY / > 90% BII",
    currentState: "> 100 E/MSY / < 84% BII",
    radialValue: 0.98,
    description: "The accelerating loss of species diversity and functional traits degrades ecosystem networks and reduces biosphere stability.",
    consequences: "Erodes crop pollination, soils, water filtration, pest control, and food security, making ecosystems vulnerable to collapse.",
  },
  {
    name: "Land-system change",
    control: "Forest cover remaining (% of original)",
    status: "breached",
    safeLimit: "75% global / 85% tropical",
    currentState: "~60% global / ~50% tropical",
    radialValue: 0.78,
    description: "Clearing forests and woodlands for agriculture, pastures, and cities reduces the planet's primary organic carbon storage systems.",
    consequences: "Reduces land-based carbon sinks, degrades regional hydrology, accelerates habitat fragmentation, and drives local temperature spikes.",
  },
  {
    name: "Freshwater change",
    control: "Streamflow deviation (blue) & Soil moisture deviation (green)",
    status: "breached",
    safeLimit: "< 10.2% global deviation",
    currentState: "> 18.2% global deviation",
    radialValue: 0.74,
    description: "Human extraction, dams, deforestation, and climate warming alter river flows (blue water) and soil moisture distribution (green water).",
    consequences: "Exacerbates agricultural crop failures, river desiccation, wetlands collapse, and drinking water scarcity.",
  },
  {
    name: "Biogeochemical flows",
    control: "Industrial Nitrogen & Phosphorus inputs (Tg/yr)",
    status: "breached",
    safeLimit: "62 Tg N / 11 Tg P",
    currentState: "150 Tg N / 22 Tg P",
    radialValue: 0.92,
    description: "Excessive application of chemical fertilizers overloading natural nitrogen and phosphorus cycles, leading to environmental saturation.",
    consequences: "Fertilizer runoff triggers massive aquatic eutrophication, generating toxic algae blooms and hypoxic 'dead zones' in oceans and lakes.",
  },
  {
    name: "Novel entities",
    control: "Release of un-assessed synthetic substances & pollutants",
    status: "breached",
    safeLimit: "Zero un-screened releases",
    currentState: "Hundreds of millions of tonnes of plastics/PFAS annually",
    radialValue: 0.95,
    description: "The release of synthetic chemicals, plastics, heavy metals, and nuclear materials that can accumulate and persist in global food webs.",
    consequences: "Causes endocrine disruption in wildlife, soil contamination, bioaccumulation of forever chemicals (PFAS), and marine microplastic loading.",
  },
  {
    name: "Ocean acidification",
    control: "Aragonite saturation state of surface seawater (Ω)",
    status: "breached",
    safeLimit: "2.90 Ω",
    currentState: "2.80 Ω (breached in 2025)",
    radialValue: 0.68,
    description: "Oceans absorb roughly 30% of human carbon emissions, driving chemical reactions that lower seawater pH and carbonate availability.",
    consequences: "Hinders calcification in shell-forming marine life (corals, shellfish, plankton), threatening the marine food web from its base.",
  },
  {
    name: "Atmospheric aerosols",
    control: "Global & regional Aerosol Optical Depth (AOD) deviations",
    status: "safe",
    safeLimit: "AOD deviation < 0.25",
    currentState: "Global average safe; regional breaches (South Asia)",
    radialValue: 0.45,
    description: "Particulate air pollution (soot, dust, sulfates) reflecting solar energy and altering regional monsoon patterns and precipitation cycles.",
    consequences: "Exacerbates cardiovascular disease, damages crops, and shifts regional monsoons, though remains within safe global thresholds.",
  },
  {
    name: "Ozone depletion",
    control: "Stratospheric Ozone concentration (Dobson Units, DU)",
    status: "safe",
    safeLimit: "< 5% reduction from pre-industrial (290 DU)",
    currentState: "~2% global reduction (steady recovery)",
    radialValue: 0.35,
    description: "The thinning of the stratospheric ozone layer caused by synthetic chlorofluorocarbons (CFCs) and halons.",
    consequences: "Ban on CFCs under the Montreal Protocol has allowed the ozone layer to heal, successfully protecting surface life from lethal solar UV.",
  },
];

const planetarySignals = [
  {
    value: "1.55 °C",
    label: "above pre-industrial",
    detail: "2024 was the warmest year on record and the first calendar year to average more than 1.5 °C above the 1850–1900 baseline.",
    source: "WMO",
  },
  {
    value: "430 ppm",
    label: "atmospheric CO₂",
    detail: "Monthly CO₂ at Mauna Loa first passed 430 ppm in May 2025; the 3.75 ppm annual jump in 2024 was the largest on record.",
    source: "NOAA / Scripps",
  },
  {
    value: "4.5 mm/yr",
    label: "sea-level rise",
    detail: "The rate of global mean sea-level rise roughly doubled from 2.1 mm/yr in 1993 to 4.5 mm/yr in 2024, and continues to accelerate.",
    source: "NASA",
  },
  {
    value: "6.7M ha",
    label: "tropical primary forest lost",
    detail: "Tropical primary forest loss hit a record in 2024 — nearly double 2023 — with fire the leading driver for the first time.",
    source: "Global Forest Watch / WRI",
  },
  {
    value: "73%",
    label: "wildlife population decline",
    detail: "The average size of monitored vertebrate populations fell 73% between 1970 and 2020; freshwater systems fell 85%.",
    source: "WWF / ZSL",
  },
  {
    value: "86%",
    label: "primary energy from fossil fuels",
    detail: "Fossil fuels still supplied roughly 86% of global primary energy in 2024, even as wind and solar grew about 16%.",
    source: "Energy Institute",
  },
];

export function TerraExplorer() {
  const [selectedName, setSelectedName] = useState<string | null>("Climate change");
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const activeName = hoveredName || selectedName;
  const activeBoundary = planetaryBoundaries.find((b) => b.name === activeName) || planetaryBoundaries[0];

  // SVG Radar setup
  const cx = 200;
  const cy = 200;
  const safeRadius = 90;
  const numSectors = 9;
  const anglePerSector = 360 / numSectors;

  // Polar helper coordinates
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
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] border border-white/10 bg-white/[0.02] p-6 rounded items-center">
        {/* Radar SVG */}
        <div className="flex flex-col items-center justify-center relative select-none">
          <div className="w-full max-w-[340px] md:max-w-[380px]">
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
              {planetaryBoundaries.map((boundary, i) => {
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
                      className="transition-all duration-300"
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
          <div className="mt-4 flex gap-4 text-xs justify-center font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Safe Threshold
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-400" /> Breached Boundary
            </span>
          </div>
        </div>

        {/* Selected Boundary Description Panel */}
        <article className="border border-white/5 bg-white/[0.015] p-5 rounded flex flex-col gap-4 min-h-[320px]">
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
                <span className={activeBoundary.status === "breached" ? "text-orange-400" : "text-emerald-400"}>
                  {activeBoundary.safeLimit.split(" / ")[1] || activeBoundary.currentState}
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
            <div className="mt-auto border border-orange-500/20 bg-orange-500/[0.02] p-3 text-xs leading-relaxed text-orange-300/90 rounded">
              <span className="font-bold">WARNING:</span> This boundary has been breached. Ecosystem stability is actively compromised.
            </div>
          )}
        </article>
      </section>

      {/* Boundary cards list */}
      <section className="flex flex-col gap-6">
        <h3 className="text-xl font-semibold text-slate-100">Planetary Boundaries Inventory</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {planetaryBoundaries.map((boundary) => {
            const isBreached = boundary.status === "breached";
            const isSelected = selectedName === boundary.name;

            return (
              <article
                key={boundary.name}
                onClick={() => setSelectedName(boundary.name)}
                className={[
                  "flex flex-col gap-3 border p-4 transition-all cursor-pointer select-none rounded",
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
                <p className="text-sm leading-6 text-slate-400">{boundary.control}</p>
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
            <article key={signal.label} className="border border-white/10 bg-white/[0.035] p-5 shadow-[0_0_28px_rgba(15,23,42,0.22)] rounded">
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
