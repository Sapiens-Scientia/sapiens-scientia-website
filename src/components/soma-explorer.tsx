"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  somaLenses,
  somaSystems,
  type SomaLensId,
  type SomaSystem,
} from "@/lib/soma";
import { morbusDiseases } from "@/lib/morbus";

function lensContent(system: SomaSystem, lens: SomaLensId) {
  if (lens === "anatomy") {
    return { summary: system.anatomy.summary, items: system.anatomy.structures, itemsLabel: "Key structures" };
  }
  if (lens === "physiology") {
    return { summary: system.physiology.summary, items: system.physiology.processes, itemsLabel: "Core processes" };
  }
  return { summary: system.histology.summary, items: system.histology.tissues, itemsLabel: "Characteristic tissues" };
}

export function SomaExplorer() {
  const [selectedId, setSelectedId] = useState(() => somaSystems[0]?.id ?? "nervous");
  const [lens, setLens] = useState<SomaLensId>("anatomy");

  useEffect(() => {
    const syncSelectionFromHash = () => {
      const hashId = window.location.hash.replace(/^#/, "");
      if (somaSystems.some((system) => system.id === hashId)) {
        setSelectedId(hashId);
      }
    };

    syncSelectionFromHash();
    window.addEventListener("hashchange", syncSelectionFromHash);
    return () => window.removeEventListener("hashchange", syncSelectionFromHash);
  }, []);

  const activeSystem =
    somaSystems.find((system) => system.id === selectedId) ?? somaSystems[0];

  const selectSystem = (id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  const content = useMemo(() => lensContent(activeSystem, lens), [activeSystem, lens]);

  const linkedDiseases = useMemo(
    () =>
      activeSystem.morbusLinks
        .map((id) => morbusDiseases.find((disease) => disease.id === id))
        .filter((disease): disease is NonNullable<typeof disease> => Boolean(disease)),
    [activeSystem],
  );

  return (
    <div className="flex flex-col gap-8 rounded-lg border border-white/10 bg-white/[0.015] p-6 sm:p-8">
      {/* System selector */}
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
          {somaSystems.length} organ systems · 3 lenses each · shareable via URL hash
        </p>
        <div className="flex flex-wrap gap-2">
          {somaSystems.map((system) => (
            <button
              key={system.id}
              type="button"
              onClick={() => selectSystem(system.id)}
              className={`cursor-pointer px-3.5 py-2 text-sm font-medium transition-all ${
                selectedId === system.id
                  ? "border-b-2 border-rose-300 bg-white/[0.04] text-rose-100"
                  : "text-slate-400 hover:bg-white/[0.02] hover:text-slate-200"
              }`}
            >
              {system.name.replace(/ System| & Lymphatic System/, "")}
            </button>
          ))}
        </div>
      </div>

      {/* Active system header */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.18em] text-rose-300/80">
          {activeSystem.latin}
        </span>
        <h3 className="text-2xl font-bold text-slate-100">{activeSystem.name}</h3>
        <p className="max-w-3xl text-base leading-7 text-slate-300">{activeSystem.summary}</p>
      </div>

      {/* Lens toggle */}
      <div className="flex flex-wrap gap-2">
        {somaLenses.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setLens(option.id)}
            className={`cursor-pointer rounded border px-4 py-2 text-sm font-semibold transition-all ${
              lens === option.id
                ? "border-rose-300/50 bg-rose-300/10 text-rose-100 shadow-[0_0_14px_rgba(251,113,133,0.12)]"
                : "border-white/10 text-slate-400 hover:border-rose-200/30 hover:text-slate-200"
            }`}
          >
            {option.name}
            <span className="ml-2 font-mono text-[0.65rem] font-normal uppercase tracking-wider text-slate-500">
              {option.latin}
            </span>
          </button>
        ))}
      </div>

      {/* Lens panel */}
      <div className="grid gap-6 rounded-lg border border-white/5 bg-white/[0.01] p-5 md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-300/90">
            {somaLenses.find((option) => option.id === lens)?.name} — {activeSystem.name.replace(/ System| & Lymphatic System/, "")}
          </p>
          <p className="text-base leading-7 text-slate-200">{content.summary}</p>
        </div>
        <div className="flex flex-col gap-3 rounded border border-white/10 bg-white/[0.025] p-5">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {content.itemsLabel}
          </h4>
          <div className="flex flex-wrap gap-2">
            {content.items.map((item) => (
              <span
                key={item}
                className="border border-rose-200/15 bg-rose-200/[0.05] px-2.5 py-1 text-xs leading-5 text-rose-50"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Morbus cross-link */}
      <div className="flex flex-col gap-3 border-t border-white/10 pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-300/90">
            Where this system fails — Morbus
          </h4>
          <Link
            href="/platforms/salus/morbus"
            className="font-mono text-[0.7rem] uppercase tracking-wider text-emerald-200/70 transition-colors hover:text-emerald-100"
          >
            Open Morbus →
          </Link>
        </div>
        {linkedDiseases.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {linkedDiseases.map((disease) => (
              <Link
                key={disease.id}
                href={`/platforms/salus/morbus#${disease.id}`}
                className="border border-emerald-200/15 bg-emerald-200/[0.05] px-3 py-1.5 text-sm leading-5 text-emerald-100 transition-colors hover:border-emerald-200/40 hover:text-emerald-50"
              >
                {disease.name.replace(/ \(.*\)/, "")}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-slate-500">
            No Morbus exemplars are mapped to this system yet — its disorders are a future extension of the ontology.
          </p>
        )}
      </div>
    </div>
  );
}
