"use client";

import { useMemo, useState } from "react";
import { morbusDiseases, morbusGroupKinds, type DiseaseData } from "@/lib/morbus";

const diseaseGroups = morbusGroupKinds;

function diseaseMatchesQuery(disease: DiseaseData, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    disease.name.toLowerCase().includes(normalized) ||
    disease.group.toLowerCase().includes(normalized) ||
    disease.axes.some(
      (axis) =>
        axis.axis.toLowerCase().includes(normalized) ||
        axis.value.toLowerCase().includes(normalized),
    )
  );
}

export function MorbusExplorer() {
  const [selectedId, setSelectedId] = useState(() => {
    if (typeof window === "undefined") {
      return morbusDiseases[0]?.id ?? "ibd";
    }

    const hashId = window.location.hash.replace(/^#/, "");
    return morbusDiseases.some((disease) => disease.id === hashId)
      ? hashId
      : morbusDiseases[0]?.id ?? "ibd";
  });
  const [selectedAxisIndex, setSelectedAxisIndex] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);

  const filteredDiseases = useMemo(
    () =>
      morbusDiseases.filter((disease) => {
        if (groupFilter && disease.group !== groupFilter) {
          return false;
        }

        return diseaseMatchesQuery(disease, query);
      }),
    [groupFilter, query],
  );

  const activeDisease =
    morbusDiseases.find((disease) => disease.id === selectedId) || morbusDiseases[0];

  const selectDisease = (id: string) => {
    setSelectedId(id);
    setSelectedAxisIndex(null);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  return (
    <div className="flex flex-col gap-8 border border-white/10 bg-white/[0.015] p-6 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
            {morbusDiseases.length} exemplar diseases · 9 axes each
          </p>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search diseases or axes…"
            aria-label="Search Morbus diseases"
            className="w-full max-w-sm border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-300/40 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGroupFilter(null)}
            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              groupFilter === null
                ? "bg-emerald-300/15 text-emerald-200"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            All groups
          </button>
          {diseaseGroups.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setGroupFilter(groupFilter === group ? null : group)}
              className={`cursor-pointer px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                groupFilter === group
                  ? "bg-emerald-300/15 text-emerald-200"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {group.replace(" Diseases", "")}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {filteredDiseases.map((disease) => (
            <button
              key={disease.id}
              type="button"
              onClick={() => selectDisease(disease.id)}
              className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${
                selectedId === disease.id
                  ? "border-b-2 border-emerald-300 text-emerald-100 bg-white/[0.04]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              {disease.name}
            </button>
          ))}
          {filteredDiseases.length === 0 && (
            <p className="text-sm text-slate-500">No diseases match this filter.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              {activeDisease.group}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-100">{activeDisease.name}</h3>
          <p className="text-base leading-7 text-slate-300">{activeDisease.description}</p>
        </div>

        <div className="rounded border border-white/10 bg-white/[0.025] p-5 flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Ontology Crosswalks</h4>
          <div className="grid gap-2">
            {activeDisease.crosswalks.map((cw) => (
              <div key={cw.name} className="flex justify-between gap-4 text-sm">
                <span className="font-semibold text-emerald-200">{cw.name}</span>
                <span className="text-slate-300 text-right">{cw.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-300/90">
          Decomposition Along Morbus Axes (Click to inspect)
        </h4>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeDisease.axes.map((axis, index) => {
            const isSelected = selectedAxisIndex === index;
            return (
              <button
                key={axis.axis}
                type="button"
                onClick={() => setSelectedAxisIndex(isSelected ? null : index)}
                className={`text-left p-4 border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? "border-emerald-300 bg-emerald-300/[0.06] shadow-[0_0_18px_rgba(52,211,153,0.15)]"
                    : "border-white/10 bg-white/[0.02] hover:border-emerald-200/30 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
                    {axis.axis}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {isSelected ? "▲ CLOSE" : "▼ INSPECT"}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-100">{axis.value}</p>
                {isSelected && (
                  <p className="text-sm leading-6 text-slate-400 border-t border-white/10 pt-2 mt-1">
                    {axis.explanation}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
