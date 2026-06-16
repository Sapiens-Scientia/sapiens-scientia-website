"use client";

import { useState } from "react";

type Scenario = {
  name: string;
  description: string;
  wealth: number;
  civic: number;
  digital: number;
};

const scenarios: Scenario[] = [
  {
    name: "Contemporary Baseline",
    description: "Reflects the current state of global systems: high concentration of capital, under-pressure civic institutions, and uneven but expanding digital networks.",
    wealth: 30,
    civic: 40,
    digital: 68,
  },
  {
    name: "Market Oligarchy",
    description: "Characterized by unchecked wealth concentration, weakened civic guardrails, and commercialized digital monopolies. Drives severe wealth inequality and displacement.",
    wealth: 10,
    civic: 20,
    digital: 75,
  },
  {
    name: "Social Democracy",
    description: "Focuses on equitable resource distribution, robust civic protections, and high public investments. Drastically reduces poverty and displacement risk.",
    wealth: 75,
    civic: 85,
    digital: 90,
  },
  {
    name: "Authoritarian Technocracy",
    description: "Universal digital tracking and high connectivity paired with highly restricted civic space. Maintains moderate economic control but with high liberties risk.",
    wealth: 45,
    civic: 10,
    digital: 95,
  },
  {
    name: "Digital Commons",
    description: "A cooperative system built on open-source digital infrastructure, decentralized resource allocation, and participatory democratic institutions.",
    wealth: 85,
    civic: 90,
    digital: 98,
  },
];

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

function CircularGauge({
  value,
  max = 100,
  color,
  label,
  deltaText,
}: {
  value: number;
  max?: number;
  color: string;
  label: string;
  deltaText: string;
}) {
  const radius = 34;
  const strokeWidth = 5.5;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-between border border-white/5 bg-white/[0.01] p-5 rounded-lg select-none">
      <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center min-h-[20px] flex items-center justify-center">
        {label}
      </h4>

      <div className="relative my-4 flex items-center justify-center w-28 h-28">
        <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 80 80">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth={strokeWidth}
          />
          {/* Active progress arc */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Absolute Value Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-white tracking-tighter">
            {max === 100 ? `${value.toFixed(1)}%` : `${value.toFixed(0)}M`}
          </span>
        </div>
      </div>

      <span className="text-[10px] font-mono text-slate-500 text-center leading-normal">
        {deltaText}
      </span>
    </div>
  );
}

export function SocietasExplorer() {
  const [selectedScenario, setSelectedScenario] = useState("Contemporary Baseline");
  const [wealthDistribution, setWealthDistribution] = useState(30);
  const [civicSpace, setCivicSpace] = useState(40);
  const [digitalAccess, setDigitalAccess] = useState(68);

  const applyScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario.name);
    setWealthDistribution(scenario.wealth);
    setCivicSpace(scenario.civic);
    setDigitalAccess(scenario.digital);
  };

  // Causal simulation calculations
  const poverty = Math.max(1.2, 22.0 - (wealthDistribution * 0.18) - (civicSpace * 0.04));
  const autocratizationRisk = Math.max(5, Math.min(95, 94 - (civicSpace * 0.88) - (wealthDistribution * 0.08)));
  const online = Math.min(100, Math.max(10, digitalAccess * 0.94 + (wealthDistribution * 0.06)));
  const displacement = Math.max(12, 148 - (civicSpace * 0.78) - (wealthDistribution * 0.38));

  // baseline comparisons
  const baselinePoverty = 9.9;
  const baselineAutocracy = 72;
  const baselineOnline = 68;
  const baselineDisplacement = 123;

  const getDeltaString = (simValue: number, baseline: number, unit = "") => {
    const delta = simValue - baseline;
    if (Math.abs(delta) < 0.1) return "Baseline state";
    const sign = delta > 0 ? "+" : "";
    return `${sign}${delta.toFixed(1)}${unit} vs baseline`;
  };

  return (
    <div className="flex flex-col gap-10">
      {/* Causal Feedback Loop Simulator */}
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] border border-white/10 bg-white/[0.015] p-6 sm:p-8 rounded-xl">
        
        {/* Controls Panel */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-[0.62rem] font-bold uppercase tracking-widest text-amber-400">
              Causal Feedback Loop Model
            </span>
            <h3 className="text-2xl font-bold mt-1 text-white">System Dynamics Simulator</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Societal institutions are coupled loops. Adjust structural inputs or select a civilizational preset below to simulate how resource allocations and civic trust steer human outcomes.
            </p>
          </div>

          {/* Scenario Selector Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Civilizational Scenario Preset
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => {
                const target = scenarios.find((s) => s.name === e.target.value);
                if (target) applyScenario(target);
              }}
              className="w-full bg-slate-900 border border-white/10 px-3.5 py-2.5 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {scenarios.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 italic mt-1.5 leading-relaxed">
              {scenarios.find((s) => s.name === selectedScenario)?.description}
            </p>
          </div>

          {/* Input Sliders */}
          <div className="flex flex-col gap-5 border-t border-white/5 pt-5">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Resource Distribution</span>
                <span className="text-amber-300 font-bold">
                  {wealthDistribution < 35 ? "Concentrated" : wealthDistribution < 70 ? "Moderate" : "Distributed"} ({wealthDistribution}%)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={wealthDistribution}
                onChange={(e) => {
                  setWealthDistribution(Number(e.target.value));
                  setSelectedScenario("Custom Adjustments");
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-300"
              />
              <p className="text-[10px] text-slate-500 leading-normal">
                Higher values indicate broad wealth participation; lower values represent capital concentration.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Civic Space & Protections</span>
                <span className="text-amber-300 font-bold">
                  {civicSpace < 35 ? "Restrictive" : civicSpace < 70 ? "Hybrid" : "Robust"} ({civicSpace}%)
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={civicSpace}
                onChange={(e) => {
                  setCivicSpace(Number(e.target.value));
                  setSelectedScenario("Custom Adjustments");
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-300"
              />
              <p className="text-[10px] text-slate-500 leading-normal">
                Measures democratic health, legal protections, press freedom, and civic institutional trust.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-semibold">Digital Infrastructure</span>
                <span className="text-amber-300 font-bold">
                  {digitalAccess < 45 ? "Fragmented" : digitalAccess < 80 ? "Emergent" : "Universal"} ({digitalAccess}%)
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="98"
                value={digitalAccess}
                onChange={(e) => {
                  setDigitalAccess(Number(e.target.value));
                  setSelectedScenario("Custom Adjustments");
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-300"
              />
              <p className="text-[10px] text-slate-500 leading-normal">
                Reflects global internet penetration and connection quality.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic HUD Circular Gauges */}
        <div className="grid gap-4 sm:grid-cols-2">
          <CircularGauge
            label="Projected Extreme Poverty"
            value={poverty}
            color={poverty > 12 ? "#f87171" : poverty > 6 ? "#fbbf24" : "#34d399"}
            deltaText={getDeltaString(poverty, baselinePoverty, "%")}
          />
          <CircularGauge
            label="Autocratization Risk"
            value={autocratizationRisk}
            color={autocratizationRisk > 65 ? "#f87171" : autocratizationRisk > 35 ? "#fbbf24" : "#34d399"}
            deltaText={getDeltaString(autocratizationRisk, baselineAutocracy, "%")}
          />
          <CircularGauge
            label="Population Online"
            value={online}
            color={online < 55 ? "#f87171" : online < 80 ? "#fbbf24" : "#34d399"}
            deltaText={getDeltaString(online, baselineOnline, "%")}
          />
          <CircularGauge
            label="Forced Displacement"
            value={displacement}
            max={200}
            color={displacement > 110 ? "#f87171" : displacement > 60 ? "#fbbf24" : "#34d399"}
            deltaText={getDeltaString(displacement, baselineDisplacement, "M")}
          />
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
              className="flex flex-col gap-2 border border-amber-200/15 bg-white/[0.025] p-4 rounded-lg"
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
              className="border border-white/10 bg-white/[0.035] p-5 shadow-[0_0_28px_rgba(15,23,42,0.22)] rounded-lg"
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
