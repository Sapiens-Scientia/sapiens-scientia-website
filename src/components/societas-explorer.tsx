"use client";

import { useState } from "react";

const societasDomains = [
  {
    name: "Institutions and governance",
    detail: "States, law, bureaucracies, and the formal and informal rules that coordinate collective action.",
  },
  {
    name: "Economics and exchange",
    detail: "Production, markets, labor, finance, and the distribution of material resources across populations.",
  },
  {
    name: "Technology and tools",
    detail: "The accumulating stock of techniques and machines that extends human capability and reshapes society.",
  },
  {
    name: "Communication and media",
    detail: "Language, writing, networks, and platforms through which information and meaning circulate.",
  },
  {
    name: "Education and knowledge",
    detail: "The transmission of skills, norms, and understanding across generations and institutions.",
  },
  {
    name: "Cooperation and conflict",
    detail: "Alliances, trust, violence, and displacement — the dynamics that bind groups together or tear them apart.",
  },
];

const civilizationalSignals = [
  {
    value: "8.2B",
    label: "people alive",
    detail: "Humanity reached about 8.2 billion in 2024 and is projected to peak near 10.3 billion in the mid-2080s before slowly declining.",
    source: "UN",
  },
  {
    value: "$118T",
    label: "world output",
    detail: "Global GDP reached roughly $118 trillion in current dollars in 2024 — concentrated in a handful of economies and unevenly shared.",
    source: "IMF",
  },
  {
    value: "5.5B",
    label: "people online",
    detail: "About 5.5 billion people — 68% of humanity — used the internet in 2024, while 2.6 billion, mostly rural and low-income, remained offline.",
    source: "ITU",
  },
  {
    value: "817M",
    label: "in extreme poverty",
    detail: "Under the World Bank's updated $3.00-a-day line, about 817 million people lived in extreme poverty in 2024.",
    source: "World Bank",
  },
  {
    value: "72%",
    label: "live under autocratization",
    detail: "By 2024, 72% of the world population lived in autocratizing or autocratic states, and autocracies outnumbered democracies.",
    source: "V-Dem",
  },
  {
    value: "123M",
    label: "forcibly displaced",
    detail: "Forced displacement reached 123 million by the end of 2024 — about one in every 67 people — a twelfth consecutive annual increase.",
    source: "UNHCR",
  },
];

export function SocietasExplorer() {
  // Simulator inputs (scale 0-100)
  const [wealthDistribution, setWealthDistribution] = useState(30); // 30 = Concentrated (Default)
  const [civicSpace, setCivicSpace] = useState(40); // 40 = Restrictive (Default)
  const [digitalAccess, setDigitalAccess] = useState(68); // 68 = Current rate (Default)

  // Simulation calculations (dynamic outputs)
  // 1. Projected Extreme Poverty Rate (%)
  const poverty = Math.max(1.5, 20.0 - (wealthDistribution * 0.16) - (civicSpace * 0.04));
  // 2. Autocratization Risk Index (0-100)
  const autocratizationRisk = Math.max(5, Math.min(95, 92 - (civicSpace * 0.85) - (wealthDistribution * 0.08)));
  // 3. Population Online (%)
  const online = Math.min(100, Math.max(10, digitalAccess * 0.94 + (wealthDistribution * 0.06)));
  // 4. Projected Forced Displacement (Millions)
  const displacement = Math.max(15, 142 - (civicSpace * 0.75) - (wealthDistribution * 0.35));

  // baseline comparisons
  const baselinePoverty = 9.9; // World Bank 2025 estimate
  const baselineAutocracy = 72; // V-Dem %
  const baselineOnline = 68; // ITU %
  const baselineDisplacement = 123; // UNHCR M

  const getDeltaString = (simValue: number, baseline: number, unit = "") => {
    const delta = simValue - baseline;
    if (Math.abs(delta) < 0.1) return "No change from baseline";
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta.toFixed(1)}${unit} vs. baseline`;
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Dynamic System dynamics simulator */}
      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] border border-white/10 bg-white/[0.02] p-6 rounded">
        {/* Controls Column */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-[0.62rem] font-bold uppercase tracking-widest text-amber-400">
              Interactive Model
            </span>
            <h3 className="text-2xl font-bold mt-1 text-white">System Dynamics Simulator</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Adjust society's structural inputs below to simulate causal feedback loops. Watch how resource allocation, institutional strength, and connectivity shift civilizational outcomes.
            </p>
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-5 border-t border-white/5 pt-4">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Wealth & Resource Distribution</span>
                <span className="text-amber-400 font-bold">
                  {wealthDistribution < 35 ? "Concentrated" : wealthDistribution < 70 ? "Moderate" : "Distributed"} ({wealthDistribution}%)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={wealthDistribution}
                onChange={(e) => setWealthDistribution(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <p className="text-[0.68rem] text-slate-500 leading-normal">
                Determines how output and material resources are distributed. High values reduce economic concentration.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Civic Space & Institutions</span>
                <span className="text-amber-400 font-bold">
                  {civicSpace < 35 ? "Restrictive" : civicSpace < 70 ? "Hybrid" : "Robust"} ({civicSpace}%)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={civicSpace}
                onChange={(e) => setCivicSpace(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <p className="text-[0.68rem] text-slate-500 leading-normal">
                Measures democratic protection, law, and trust. Lower values trigger systemic autocratization.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Digital Access & Infrastructure</span>
                <span className="text-amber-400 font-bold">
                  {digitalAccess < 45 ? "Fragmented" : digitalAccess < 80 ? "Emergent" : "Universal"} ({digitalAccess}%)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="98"
                value={digitalAccess}
                onChange={(e) => setDigitalAccess(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <p className="text-[0.68rem] text-slate-500 leading-normal">
                Reflects global internet penetration and connection infrastructure.
              </p>
            </div>
          </div>
        </div>

        {/* Output Metrics Column */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Metric 1 */}
          <article className="border border-white/5 bg-white/[0.01] p-4 rounded flex flex-col gap-2 justify-between">
            <div>
              <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Projected Extreme Poverty</h4>
              <p className="text-3xl font-extrabold text-white mt-1">{poverty.toFixed(1)}%</p>
            </div>
            <div>
              {/* Custom SVG Bar */}
              <svg width="100%" height="8" className="overflow-visible rounded bg-slate-900 border border-white/5">
                <rect
                  x="0"
                  y="0"
                  width={`${poverty * 4}%`}
                  height="100%"
                  fill={poverty > 12 ? "#f87171" : poverty > 6 ? "#fbbf24" : "#34d399"}
                />
              </svg>
              <p className="text-[0.68rem] text-slate-400 mt-2 font-mono">
                {getDeltaString(poverty, baselinePoverty, "%")}
              </p>
            </div>
          </article>

          {/* Metric 2 */}
          <article className="border border-white/5 bg-white/[0.01] p-4 rounded flex flex-col gap-2 justify-between">
            <div>
              <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Autocratization Risk</h4>
              <p className="text-3xl font-extrabold text-white mt-1">{autocratizationRisk.toFixed(0)}/100</p>
            </div>
            <div>
              {/* Custom SVG Bar */}
              <svg width="100%" height="8" className="overflow-visible rounded bg-slate-900 border border-white/5">
                <rect
                  x="0"
                  y="0"
                  width={`${autocratizationRisk}%`}
                  height="100%"
                  fill={autocratizationRisk > 65 ? "#f87171" : autocratizationRisk > 35 ? "#fbbf24" : "#34d399"}
                />
              </svg>
              <p className="text-[0.68rem] text-slate-400 mt-2 font-mono">
                {getDeltaString(autocratizationRisk, baselineAutocracy, "%")}
              </p>
            </div>
          </article>

          {/* Metric 3 */}
          <article className="border border-white/5 bg-white/[0.01] p-4 rounded flex flex-col gap-2 justify-between">
            <div>
              <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Population Online</h4>
              <p className="text-3xl font-extrabold text-white mt-1">{online.toFixed(1)}%</p>
            </div>
            <div>
              {/* Custom SVG Bar */}
              <svg width="100%" height="8" className="overflow-visible rounded bg-slate-900 border border-white/5">
                <rect
                  x="0"
                  y="0"
                  width={`${online}%`}
                  height="100%"
                  fill={online < 50 ? "#f87171" : online < 80 ? "#fbbf24" : "#34d399"}
                />
              </svg>
              <p className="text-[0.68rem] text-slate-400 mt-2 font-mono">
                {getDeltaString(online, baselineOnline, "%")}
              </p>
            </div>
          </article>

          {/* Metric 4 */}
          <article className="border border-white/5 bg-white/[0.01] p-4 rounded flex flex-col gap-2 justify-between">
            <div>
              <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Forced Displacement</h4>
              <p className="text-3xl font-extrabold text-white mt-1">{displacement.toFixed(0)}M</p>
            </div>
            <div>
              {/* Custom SVG Bar */}
              <svg width="100%" height="8" className="overflow-visible rounded bg-slate-900 border border-white/5">
                <rect
                  x="0"
                  y="0"
                  width={`${Math.min(100, (displacement / 200) * 100)}%`}
                  height="100%"
                  fill={displacement > 100 ? "#f87171" : displacement > 50 ? "#fbbf24" : "#34d399"}
                />
              </svg>
              <p className="text-[0.68rem] text-slate-400 mt-2 font-mono">
                {getDeltaString(displacement, baselineDisplacement, "M")}
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Society as a Complex Adaptive System domains */}
      <section className="flex flex-col gap-7 pt-5">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Society as a Complex Adaptive System
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Societas treats human society as emergent, historical, symbolic, and materially constrained — not a machine to be optimized, but a system that adapts. Its structures arise from countless local interactions and feed back on the people who make them.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {societasDomains.map((domain) => (
            <article
              key={domain.name}
              className="flex flex-col gap-2 border border-amber-200/15 bg-white/[0.025] p-4 rounded"
            >
              <h3 className="text-base font-semibold text-slate-50">
                {domain.name}
              </h3>
              <p className="text-sm leading-6 text-slate-400">
                {domain.detail}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Civilizational Signals */}
      <section className="flex flex-col gap-7 border-t border-white/10 pt-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Civilizational Signals
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            A few population-scale indicators trace where human society stands: still growing and rapidly connecting, but with persistent poverty, eroding democratic governance, and record forced displacement.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {civilizationalSignals.map((signal) => (
            <article
              key={signal.label}
              className="border border-white/10 bg-white/[0.035] p-5 shadow-[0_0_28px_rgba(15,23,42,0.22)] rounded"
            >
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-4xl font-semibold tracking-normal text-white">
                  {signal.value}
                </p>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-200/70">
                  {signal.source}
                </p>
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-100">
                {signal.label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {signal.detail}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
