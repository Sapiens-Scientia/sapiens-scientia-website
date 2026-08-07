"use client";

import Link from "next/link";
import { useState } from "react";
import {
  metaEntityDefinition,
  metaEntityExamples,
  metaEntityProperties,
  metaEntityThresholdIndex,
  metaEntityTurnover,
  metaEntityTurnoverConclusion,
  organizationLevels,
} from "@/lib/meta-entities";

// The Meta-Entity framework: the second half of the Meta Earth page's argument.
// The globe above shows the infrastructure humanity built; this section names
// the kind of thing that built it — structures that persist while every part of
// them is replaced.
//
// The visualization is a nested-shells diagram. Emergence runs outward: each
// ring is composed of the one inside it. Components drift around each ring and
// fade out to be replaced; the ring itself never moves. That is the whole idea
// of a Meta-Entity, drawn.

const VIEW = 560;
const CENTER = VIEW / 2;
const INNER_RADIUS = 40;
const RING_STEP = 37;

const ringRadius = (index: number) => INNER_RADIUS + index * RING_STEP;

/** Fixed precision, so the server and client emit byte-identical coordinates. */
const round = (value: number) => Number(value.toFixed(3));

/** Radius of the dashed circle marking where Meta-Entities begin. */
const THRESHOLD_RADIUS =
  ringRadius(metaEntityThresholdIndex - 1) + RING_STEP / 2;

function LevelDiagram({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      className="h-auto w-full max-w-xl"
      aria-hidden="true"
    >
      {/* the threshold: below it, structures die with their components */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={THRESHOLD_RADIUS}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1}
        strokeDasharray="3 6"
        opacity={0.5}
      />

      {organizationLevels.map((level, index) => {
        const radius = ringRadius(index);
        const isActive = level.id === activeId;
        const dotCount = 6 + index * 2;

        return (
          <g key={level.id}>
            <circle
              cx={CENTER}
              cy={CENTER}
              r={radius}
              fill="none"
              stroke={level.color}
              strokeWidth={isActive ? 2.2 : 1.1}
              opacity={isActive ? 0.95 : 0.34}
              style={{ transition: "opacity 300ms, stroke-width 300ms" }}
            />

            {/* the components: they drift, they turn over, they are replaced */}
            <g
              className="me-orbit"
              style={{ animationDuration: `${52 + index * 9}s` }}
            >
              {Array.from({ length: dotCount }, (_, dot) => {
                const angle = (dot / dotCount) * Math.PI * 2;
                return (
                  <circle
                    key={dot}
                    className="me-dot"
                    cx={round(CENTER + Math.cos(angle) * radius)}
                    cy={round(CENTER + Math.sin(angle) * radius)}
                    r={isActive ? 3 : 2.1}
                    fill={level.color}
                    style={{
                      animationDelay: `-${round((dot * 6.4) / dotCount + index * 1.3)}s`,
                      transition: "r 300ms",
                    }}
                  />
                );
              })}
            </g>

            {/* the ring's name, knocked out of the ring line it sits on */}
            <text
              x={CENTER}
              y={CENTER - radius}
              textAnchor="middle"
              dominantBaseline="middle"
              className="me-ring-label"
              fill={isActive ? level.color : "currentColor"}
              opacity={isActive ? 1 : 0.72}
              fontSize={13}
              fontWeight={isActive ? 600 : 500}
            >
              {level.name}
            </text>

            {/* a generous, invisible band so the ring itself is clickable */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r={radius}
              fill="none"
              stroke="transparent"
              strokeWidth={RING_STEP - 6}
              className="cursor-pointer"
              onClick={() => onSelect(level.id)}
            />
          </g>
        );
      })}

      {/* the threshold reads at the bottom, where the ring names read at the top */}
      <text
        x={CENTER}
        y={CENTER + THRESHOLD_RADIUS}
        textAnchor="middle"
        dominantBaseline="middle"
        className="me-ring-label"
        fill="currentColor"
        opacity={0.55}
        fontSize={9}
        letterSpacing={1.1}
        wordSpacing={5}
      >
        META-ENTITY THRESHOLD
      </text>
    </svg>
  );
}

export function MetaEntityFramework() {
  const [activeId, setActiveId] = useState(organizationLevels[3].id);
  const active =
    organizationLevels.find((level) => level.id === activeId) ?? organizationLevels[3];

  return (
    <section
      id="meta-entities"
      className="relative z-20 bg-black px-6 pb-16 text-white sm:px-10 sm:pb-20"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-16">
        <section className="grid gap-8 border-t border-white/15 pt-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-300">
              A Core Concept
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
              Meta-Entities
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The layer wrapped around the globe above was not built by any
              person. It was built by structures that outlive people — and that
              is a category of thing worth naming.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <blockquote className="border-l-2 border-indigo-300/50 bg-white/[0.03] p-5 sm:p-6">
              <p className="text-base leading-7 text-slate-100 sm:text-lg sm:leading-8">
                {metaEntityDefinition}
              </p>
            </blockquote>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <ul className="space-y-1.5">
                {metaEntityTurnover.map((line) => (
                  <li
                    key={line}
                    className="flex items-baseline gap-3 text-sm leading-6 text-slate-400"
                  >
                    <span
                      aria-hidden
                      className="h-1 w-1 shrink-0 translate-y-[-0.15rem] rounded-full bg-slate-600"
                    />
                    {line}
                  </li>
                ))}
              </ul>
              <p className="text-base font-medium leading-7 text-white sm:max-w-[16rem] sm:border-l sm:border-white/10 sm:pl-6">
                {metaEntityTurnoverConclusion}
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-10 border-t border-white/10 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                Levels Of Organization
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Each ring is composed of the one inside it and reduces to none of
                them. The dots are components — they drift, they are replaced,
                they disappear. The rings do not move.
              </p>
            </div>
            <div className="flex justify-center text-slate-300">
              <LevelDiagram activeId={activeId} onSelect={setActiveId} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <ol className="grid gap-1.5">
              {organizationLevels.map((level, index) => {
                const isActive = level.id === activeId;

                return (
                  <li key={level.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(level.id)}
                      aria-pressed={isActive}
                      className={[
                        "flex w-full cursor-pointer items-baseline gap-3 border px-4 py-2.5 text-left transition-colors",
                        isActive
                          ? "border-white/25 bg-white/[0.07]"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.045]",
                      ].join(" ")}
                      style={{ borderLeftColor: level.color, borderLeftWidth: 2 }}
                    >
                      <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: isActive ? level.color : undefined }}
                        >
                          {level.name}
                        </span>
                        <span className="ml-2 text-xs text-slate-500">
                          {level.kind}
                        </span>
                      </span>
                      {level.metaEntity ? (
                        <span className="shrink-0 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-indigo-300">
                          meta-entity
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>

            <article
              className="border border-white/10 bg-white/[0.035] p-5"
              style={{ borderTopColor: active.color, borderTopWidth: 2 }}
            >
              <h4 className="text-lg font-semibold text-white">{active.name}</h4>
              <dl className="mt-4 space-y-3.5">
                {[
                  { term: "Composed of", detail: active.composedOf },
                  { term: "Turns over", detail: active.turnsOver },
                  { term: "Persists", detail: active.persists },
                ].map((row) => (
                  <div key={row.term} className="grid gap-1">
                    <dt className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-slate-500">
                      {row.term}
                    </dt>
                    <dd className="text-sm leading-6 text-slate-300">
                      {row.detail}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.examples.map((example) => (
                  <span
                    key={example}
                    className="border px-2.5 py-1 text-xs leading-5 text-slate-200"
                    style={{
                      borderColor: `${active.color}33`,
                      backgroundColor: `${active.color}12`,
                    }}
                  >
                    {example}
                  </span>
                ))}
              </div>
            </article>
          </div>
        </section>

        <section className="grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <h3 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              What Each One Possesses
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Meta-Entities behave as coherent systems while remaining
              fundamentally composed of continually changing humans and
              technologies. Six properties recur across every one of them.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {metaEntityExamples.map((example) => (
                <span
                  key={example}
                  className="border border-indigo-300/25 bg-indigo-300/[0.07] px-3 py-1.5 text-sm leading-5 text-slate-200"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {metaEntityProperties.map((property) => (
              <article
                key={property.id}
                className="border border-white/10 bg-white/[0.025] p-4"
              >
                <h4 className="text-base font-semibold text-white">
                  {property.name}
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {property.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <h3 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Two Levels, Not Two Theories
            </h3>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Sapiens Scientia studies humans not only as biological organisms
              but also as participants in larger emergent systems. Understanding
              civilization requires both — individuals and Meta-Entities are
              complementary levels of organization, not competing explanations.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href="/platforms/persona"
              className="group border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-sky-200/35 hover:bg-white/[0.055] focus:outline-none focus-visible:border-sky-200"
            >
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-sky-200/70">
                The individual
              </p>
              <h4 className="mt-3 text-lg font-semibold text-white">Persona</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The human as organism — body, health, home, and the lived scale
                of a single life.
              </p>
              <span className="mt-4 inline-flex text-sm font-medium text-sky-200 transition-colors group-hover:text-sky-50">
                Explore <span aria-hidden="true" className="ml-1">→</span>
              </span>
            </Link>

            <Link
              href="/platforms/societas"
              className="group border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-indigo-300/40 hover:bg-white/[0.055] focus:outline-none focus-visible:border-indigo-300"
            >
              <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-indigo-300">
                The Meta-Entity
              </p>
              <h4 className="mt-3 text-lg font-semibold text-white">Societas</h4>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                The structures humans compose — institutions, markets, states,
                and the networks that outlive their members.
              </p>
              <span className="mt-4 inline-flex text-sm font-medium text-indigo-300 transition-colors group-hover:text-white">
                Explore <span aria-hidden="true" className="ml-1">→</span>
              </span>
            </Link>

            <p className="border border-white/10 bg-white/[0.015] p-5 text-sm leading-6 text-slate-400 sm:col-span-2">
              The connectivity layer on the globe above is one Meta-Entity&apos;s
              body: no person owns the Internet, no company built it, and every
              engineer who laid its first cables has been replaced. It routes
              traffic anyway.{" "}
              <Link
                href="/scales"
                className="text-slate-200 underline-offset-4 transition-colors hover:text-white hover:underline"
              >
                See where each level sits on the Ladder of Scale
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}
