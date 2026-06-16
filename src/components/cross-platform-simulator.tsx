"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { platformCouplingBySlug } from "@/lib/platform-couplings";
import {
  computeCrossPlatformScenario,
  scenarioBaselines,
  type ScenarioInputs,
} from "@/lib/cross-platform-simulator";

function SliderControl({
  label,
  platform,
  color,
  value,
  minLabel,
  maxLabel,
  onChange,
}: {
  label: string;
  platform: string;
  color: string;
  value: number;
  minLabel: string;
  maxLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between gap-4 text-xs font-mono">
        <span className="font-semibold text-slate-300">{label}</span>
        <span style={{ color }}>{platform}</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-sky-400"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      />
      <div className="flex justify-between text-[0.65rem] text-slate-500">
        <span>{minLabel}</span>
        <span className="font-mono text-slate-400">{value}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  unit,
  platform,
  color,
  delta,
}: {
  label: string;
  value: string;
  unit: string;
  platform: string;
  color: string;
  delta?: string;
}) {
  return (
    <article className="border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[0.62rem] font-bold uppercase tracking-widest" style={{ color }}>
        {platform}
      </p>
      <p className="mt-2 text-3xl font-semibold text-white">
        {value}
        <span className="ml-1 text-base font-normal text-slate-400">{unit}</span>
      </p>
      <p className="mt-2 text-sm text-slate-300">{label}</p>
      {delta ? <p className="mt-1 font-mono text-[0.65rem] text-slate-500">{delta}</p> : null}
    </article>
  );
}

export function CrossPlatformSimulator() {
  const [inputs, setInputs] = useState<ScenarioInputs>(scenarioBaselines);

  const outputs = useMemo(() => computeCrossPlatformScenario(inputs), [inputs]);

  const couplingSlug = Object.values(platformCouplingBySlug).find(
    (coupling) => coupling.name === outputs.dominantCoupling,
  )?.slug;

  const reset = () => setInputs(scenarioBaselines);

  const patch = (key: keyof ScenarioInputs, value: number) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const baselineOutputs = useMemo(() => computeCrossPlatformScenario(scenarioBaselines), []);

  const delta = (value: number, baseline: number, unit: string, invert = false) => {
    const diff = value - baseline;
    if (Math.abs(diff) < 0.15) {
      return "Near baseline";
    }
    const sign = invert ? (diff > 0 ? "−" : "+") : diff > 0 ? "+" : "";
    return `${sign}${Math.abs(diff).toFixed(1)}${unit} vs. baseline`;
  };

  return (
    <section
      id="coupled-scenario"
      className="grid gap-8 border border-white/10 bg-white/[0.02] p-6 lg:grid-cols-[0.95fr_1.05fr] scroll-mt-24"
    >
      <div className="flex flex-col gap-6">
        <div>
          <span className="text-[0.62rem] font-bold uppercase tracking-widest text-emerald-400">
            Cross-Platform Model
          </span>
          <h2 className="mt-1 text-2xl font-bold text-white">Coupled Scenario Simulator</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Adjust Terra, Societas, and Salus together. Outputs are heuristic projections of how
            ecological stress, institutions, and care access interact — not forecasts.
          </p>
        </div>

        <div className="flex flex-col gap-5 border-t border-white/5 pt-4">
          <SliderControl
            label="Freshwater boundary stress"
            platform="Terra"
            color="#34d399"
            value={inputs.freshwaterStress}
            minLabel="Safe"
            maxLabel="Breached"
            onChange={(value) => patch("freshwaterStress", value)}
          />
          <SliderControl
            label="Civic space & institutional openness"
            platform="Societas"
            color="#818cf8"
            value={inputs.civicSpace}
            minLabel="Closed"
            maxLabel="Open"
            onChange={(value) => patch("civicSpace", value)}
          />
          <SliderControl
            label="Healthcare access"
            platform="Salus"
            color="#38bdf8"
            value={inputs.healthcareAccess}
            minLabel="Limited"
            maxLabel="Universal"
            onChange={(value) => patch("healthcareAccess", value)}
          />
        </div>

        <button
          type="button"
          onClick={reset}
          className="w-fit cursor-pointer border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:border-white/25 hover:text-white"
        >
          Reset to baseline
        </button>
      </div>

      <div className="flex flex-col gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard
            platform="Salus"
            color="#38bdf8"
            label="Vector-borne disease pressure index"
            value={outputs.vectorDiseaseRisk.toFixed(0)}
            unit="/ 100"
            delta={delta(outputs.vectorDiseaseRisk, baselineOutputs.vectorDiseaseRisk, "")}
          />
          <MetricCard
            platform="Salus"
            color="#38bdf8"
            label="Heat-related mortality stress index"
            value={outputs.heatMortalityIndex.toFixed(0)}
            unit="/ 100"
            delta={delta(outputs.heatMortalityIndex, baselineOutputs.heatMortalityIndex, "")}
          />
          <MetricCard
            platform="Societas"
            color="#818cf8"
            label="Extreme poverty rate (simulated)"
            value={outputs.extremePovertyRate.toFixed(1)}
            unit="%"
            delta={delta(outputs.extremePovertyRate, baselineOutputs.extremePovertyRate, "%")}
          />
          <MetricCard
            platform="Societas"
            color="#818cf8"
            label="Forcibly displaced population"
            value={outputs.displacementMillions.toFixed(0)}
            unit="M"
            delta={delta(outputs.displacementMillions, baselineOutputs.displacementMillions, "M")}
          />
        </div>

        <article className="border border-emerald-400/25 bg-emerald-400/[0.04] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
              Coupling stress · {outputs.couplingStress}/100
            </span>
            {couplingSlug ? (
              <Link
                href={`/platforms#${couplingSlug}`}
                className="text-xs font-semibold text-emerald-200 underline-offset-2 hover:underline"
              >
                {outputs.dominantCoupling} →
              </Link>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-200">{outputs.narrative}</p>
        </article>
      </div>
    </section>
  );
}
