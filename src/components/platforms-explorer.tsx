"use client";

import { useState } from "react";
import Link from "next/link";
import {
  platformCouplings,
  platformDefinitions,
  platformList,
  type PlatformId,
} from "@/lib/platforms";

function SystemsMap({
  selectedCoupling,
  onSelectCoupling,
}: {
  selectedCoupling: string | null;
  onSelectCoupling: (name: string | null) => void;
}) {
  const nodes: Record<PlatformId, { cx: number; cy: number }> = {
    salus: { cx: 410, cy: 120 },
    societas: { cx: 160, cy: 440 },
    terra: { cx: 660, cy: 440 },
  };
  const hub = { cx: 410, cy: 300 };

  const isHubActive = selectedCoupling === "Food systems" || selectedCoupling === "Urbanization" || selectedCoupling === "Disease ecology";

  return (
    <svg
      viewBox="0 0 820 560"
      className="h-auto w-full select-none"
      role="img"
      aria-label="Systems map of the three Sapiens Scientia platforms — Salus, Societas, and Terra — connected by cross-cutting couplings"
    >
      <title>Cross-platform systems map</title>
      <desc>
        Salus, Societas, and Terra are linked pairwise by public health, climate
        medicine, and energy systems, and jointly by food systems, urbanization,
        and disease ecology.
      </desc>

      {/* Dashed connectors from the all-three hub to each platform */}
      {(Object.keys(nodes) as PlatformId[]).map((id) => (
        <line
          key={`hub-${id}`}
          x1={hub.cx}
          y1={hub.cy}
          x2={nodes[id].cx}
          y2={nodes[id].cy}
          stroke="#475569"
          strokeWidth={isHubActive ? 2 : 1.25}
          strokeDasharray={isHubActive ? "5 5" : "3 5"}
          opacity={!selectedCoupling ? 0.7 : isHubActive ? 1 : 0.25}
          className="transition-all duration-300"
        />
      ))}

      {/* Pairwise coupling arcs, bowed outward to clear the hub */}
      <path
        d="M410 120 Q180 250 160 440"
        fill="none"
        stroke={selectedCoupling === "Public health" ? "#818cf8" : "#64748b"}
        strokeWidth={selectedCoupling === "Public health" ? 3.5 : 1.5}
        opacity={!selectedCoupling ? 0.55 : selectedCoupling === "Public health" ? 1 : 0.15}
        className="transition-all duration-300 cursor-pointer"
        onClick={() => onSelectCoupling(selectedCoupling === "Public health" ? null : "Public health")}
      />
      <path
        d="M410 120 Q640 250 660 440"
        fill="none"
        stroke={selectedCoupling === "Climate medicine" ? "#38bdf8" : "#64748b"}
        strokeWidth={selectedCoupling === "Climate medicine" ? 3.5 : 1.5}
        opacity={!selectedCoupling ? 0.55 : selectedCoupling === "Climate medicine" ? 1 : 0.15}
        className="transition-all duration-300 cursor-pointer"
        onClick={() => onSelectCoupling(selectedCoupling === "Climate medicine" ? null : "Climate medicine")}
      />
      <path
        d="M160 440 Q410 540 660 440"
        fill="none"
        stroke={selectedCoupling === "Energy systems" ? "#34d399" : "#64748b"}
        strokeWidth={selectedCoupling === "Energy systems" ? 3.5 : 1.5}
        opacity={!selectedCoupling ? 0.55 : selectedCoupling === "Energy systems" ? 1 : 0.15}
        className="transition-all duration-300 cursor-pointer"
        onClick={() => onSelectCoupling(selectedCoupling === "Energy systems" ? null : "Energy systems")}
      />

      {/* Pairwise coupling labels at the arc apexes */}
      {[
        { x: 205, y: 250, text: "Public health" },
        { x: 615, y: 250, text: "Climate medicine" },
        { x: 410, y: 506, text: "Energy systems" },
      ].map((l) => {
        const isActive = selectedCoupling === l.text;
        return (
          <g
            key={l.text}
            className="cursor-pointer group"
            onClick={() => onSelectCoupling(isActive ? null : l.text)}
          >
            <rect
              x={l.x - l.text.length * 3.6 - 8}
              y={l.y - 13}
              width={l.text.length * 7.2 + 16}
              height={20}
              rx={3}
              fill="#04060c"
              stroke={isActive ? "#38bdf8" : "#1e293b"}
              strokeWidth={isActive ? 1.5 : 1}
              className="transition-all duration-300 group-hover:stroke-sky-400"
            />
            <text
              x={l.x}
              y={l.y + 1}
              textAnchor="middle"
              fontSize={12.5}
              fill={isActive ? "#38bdf8" : "#cbd5e1"}
              className="transition-all duration-300 group-hover:fill-white"
            >
              {l.text}
            </text>
          </g>
        );
      })}

      {/* Platform nodes */}
      {(Object.keys(nodes) as PlatformId[]).map((id) => {
        const { cx, cy } = nodes[id];
        const platform = platformDefinitions[id];
        const color = platform.color;
        const activeCouplingData = platformCouplings.find((c) => c.name === selectedCoupling);
        const isLinkedToActive = !selectedCoupling || activeCouplingData?.links.includes(id);

        return (
          <g key={id} className="transition-all duration-300">
            <circle cx={cx} cy={cy} r={62} fill="#04060c" />
            <circle
              cx={cx}
              cy={cy}
              r={62}
              fill={color}
              fillOpacity={isLinkedToActive ? 0.12 : 0.02}
              stroke={color}
              strokeWidth={isLinkedToActive ? 2.25 : 1}
              opacity={isLinkedToActive ? 1 : 0.25}
              className="transition-all duration-300"
            />
            <text
              x={cx}
              y={cy - 2}
              textAnchor="middle"
              fontSize={20}
              fontWeight={600}
              fill="#f8fafc"
              opacity={isLinkedToActive ? 1 : 0.25}
              className="transition-all duration-300"
            >
              {platform.shortName}
            </text>
            <text
              x={cx}
              y={cy + 20}
              textAnchor="middle"
              fontSize={11}
              fill={color}
              opacity={isLinkedToActive ? 1 : 0.25}
              className="transition-all duration-300"
            >
              {platform.domain.split(",")[0]}
            </text>
          </g>
        );
      })}

      {/* All-three hub */}
      <g
        className="cursor-pointer group"
        onClick={() => {
          if (isHubActive) {
            onSelectCoupling(null);
          } else {
            onSelectCoupling("Food systems");
          }
        }}
      >
        <rect
          x={295}
          y={262}
          width={230}
          height={78}
          rx={6}
          fill="#04060c"
          stroke={isHubActive ? "#34d399" : "#334155"}
          strokeWidth={isHubActive ? 1.5 : 1}
          className="transition-all duration-300 group-hover:stroke-emerald-400"
        />
        <text
          x={hub.cx}
          y={287}
          textAnchor="middle"
          fontSize={10}
          letterSpacing={2}
          fill={isHubActive ? "#34d399" : "#64748b"}
          className="transition-all duration-300"
        >
          {isHubActive ? "ACTIVE COUPLINGS" : "COUPLES ALL THREE"}
        </text>
        <text
          x={hub.cx}
          y={307}
          textAnchor="middle"
          fontSize={12.5}
          fill={selectedCoupling === "Food systems" ? "#34d399" : "#e2e8f0"}
          className="transition-all duration-300 hover:fill-white"
          onClick={(e) => {
            e.stopPropagation();
            onSelectCoupling(selectedCoupling === "Food systems" ? null : "Food systems");
          }}
        >
          Food systems
        </text>
        <text
          x={hub.cx - 50}
          y={325}
          textAnchor="middle"
          fontSize={12.5}
          fill={selectedCoupling === "Urbanization" ? "#34d399" : "#cbd5e1"}
          className="transition-all duration-300 hover:fill-white"
          onClick={(e) => {
            e.stopPropagation();
            onSelectCoupling(selectedCoupling === "Urbanization" ? null : "Urbanization");
          }}
        >
          Urbanization
        </text>
        <text
          x={hub.cx + 50}
          y={325}
          textAnchor="middle"
          fontSize={12.5}
          fill={selectedCoupling === "Disease ecology" ? "#34d399" : "#cbd5e1"}
          className="transition-all duration-300 hover:fill-white"
          onClick={(e) => {
            e.stopPropagation();
            onSelectCoupling(selectedCoupling === "Disease ecology" ? null : "Disease ecology");
          }}
        >
          Disease ecology
        </text>
      </g>
    </svg>
  );
}

export function PlatformsExplorer() {
  const [selectedCoupling, setSelectedCoupling] = useState<string | null>(null);

  const activeCoupling = platformCouplings.find((c) => c.name === selectedCoupling) || null;

  return (
    <div className="flex flex-col gap-10">
      {/* Platform Triad Section */}
      <section className="flex flex-col gap-7">
        <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
          The Triad
        </h2>

        <div className="grid gap-4 lg:grid-cols-3">
          {platformList.map((platform) => (
            <Link
              key={platform.id}
              href={platform.href}
              className="group flex flex-col gap-2 border bg-white/[0.025] p-5 transition-colors hover:bg-white/[0.05]"
              style={{ borderColor: `${platform.color}33` }}
            >
              <span
                className="text-xs font-medium uppercase tracking-[0.18em]"
                style={{ color: platform.color }}
              >
                {platform.shortName}
              </span>
              <h3 className="text-xl font-semibold text-slate-50">
                {platform.name}
              </h3>
              <p className="text-sm leading-6 text-slate-400">{platform.domain}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
                Open platform <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Systems Map and Interaction Section */}
      <section className="flex flex-col gap-7 border-t border-white/10 pt-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Cross-Cutting Couplings Map
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Some couplings link two platforms; others run through all three at
            once. Click on the couplings in the interactive map or the cards below to expand
            the detailed feedback loop analysis.
          </p>
        </div>

        {/* SVG Systems Map */}
        <div className="border border-white/10 bg-white/[0.02] p-4 sm:p-6 rounded">
          <SystemsMap selectedCoupling={selectedCoupling} onSelectCoupling={setSelectedCoupling} />
        </div>

        {/* Detailed Feedback Loop Card (Targeted Expanded view) */}
        {activeCoupling && (
          <article className="border border-emerald-400/30 bg-emerald-400/[0.035] p-6 rounded shadow-[0_0_24px_rgba(52,211,153,0.12)] flex flex-col gap-4 animate-fadeIn">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">
                  Detailed Feedback Loop Analysis
                </span>
                <h3 className="text-2xl font-bold text-slate-50 mt-1">{activeCoupling.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCoupling(null)}
                className="cursor-pointer border border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/[0.08] hover:text-white text-xs px-2.5 py-1 transition-all"
              >
                ✕ CLOSE
              </button>
            </div>
            <p className="text-base leading-7 text-slate-200">{activeCoupling.feedbackLoop}</p>
            <div className="flex gap-2 pt-2">
              {activeCoupling.links.map((id) => (
                <span
                  key={id}
                  className="border px-2.5 py-1 text-xs leading-5 text-slate-200"
                  style={{
                    borderColor: `${platformDefinitions[id].color}55`,
                    color: platformDefinitions[id].color,
                  }}
                >
                  {platformDefinitions[id].shortName}
                </span>
              ))}
            </div>
          </article>
        )}

        {/* Grid of Coupling cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {platformCouplings.map((coupling) => {
            const isSelected = selectedCoupling === coupling.name;
            return (
              <article
                key={coupling.name}
                onClick={() => setSelectedCoupling(isSelected ? null : coupling.name)}
                className={`flex flex-col gap-3 border p-4 transition-all cursor-pointer select-none ${
                  isSelected
                    ? "border-emerald-300 bg-emerald-300/[0.04]"
                    : "border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-50">
                    {coupling.name}
                  </h3>
                  <span className="shrink-0 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-slate-500">
                    {coupling.links.length === 3 ? "All three" : "Pairwise"}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-400">{coupling.detail}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  {coupling.links.map((id) => (
                    <span
                      key={id}
                      className="border px-2.5 py-1 text-xs leading-5 text-slate-200"
                      style={{
                        borderColor: `${platformDefinitions[id].color}55`,
                        color: platformDefinitions[id].color,
                      }}
                    >
                      {platformDefinitions[id].shortName}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
