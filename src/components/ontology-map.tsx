"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  platformCouplings,
  platformDefinitions,
  platformList,
  type PlatformId,
} from "@/lib/platform-couplings";

// An interactive diagram of the Sapiens Scientia worldview: three interpretive
// lenses (Persona / Societas / Terra) arranged as a triangle, with the six
// named couplings sitting *between* them — the thesis being that the great
// challenges of our time live in the couplings, not inside any single lens.
//
// Hover (or focus) previews a relationship; click pins it. Selecting a lens
// lights up every coupling that touches it; selecting a coupling lights up the
// lenses it bridges and draws the connectors. The side panel narrates whatever
// is in focus.

type Focus =
  | { kind: "platform"; id: PlatformId }
  | { kind: "coupling"; slug: string };

type Point = { x: number; y: number };

const VIEW_W = 600;
const VIEW_H = 430;

const NODE_POS: Record<PlatformId, Point> = {
  persona: { x: 300, y: 78 },
  societas: { x: 96, y: 360 },
  terra: { x: 504, y: 360 },
};

const NODE_R = 52;

// Each coupling gets a fixed anchor: pairwise couplings sit on the triangle
// edge they span; the three-way couplings stack near the centroid.
const COUPLING_POS: Record<string, Point> = {
  "public-health": midpoint(NODE_POS.persona, NODE_POS.societas),
  "climate-medicine": midpoint(NODE_POS.persona, NODE_POS.terra),
  "energy-systems": midpoint(NODE_POS.societas, NODE_POS.terra),
  "food-systems": { x: 300, y: 232 },
  urbanization: { x: 300, y: 274 },
  "disease-ecology": { x: 300, y: 316 },
};

const EDGES: [PlatformId, PlatformId][] = [
  ["persona", "societas"],
  ["persona", "terra"],
  ["societas", "terra"],
];

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function OntologyMap() {
  const [pinned, setPinned] = useState<Focus | null>(null);
  const [hovered, setHovered] = useState<Focus | null>(null);
  const glowId = useId();

  const focus = hovered ?? pinned;

  const couplingActive = (slug: string) => {
    if (!focus) return false;
    if (focus.kind === "coupling") return focus.slug === slug;
    const coupling = platformCouplings.find((c) => c.slug === slug);
    return Boolean(coupling?.links.includes(focus.id));
  };

  const platformActive = (id: PlatformId) => {
    if (!focus) return false;
    if (focus.kind === "platform") return focus.id === id;
    const coupling = platformCouplings.find((c) => c.slug === focus.slug);
    return Boolean(coupling?.links.includes(id));
  };

  const dimPlatform = (id: PlatformId) => Boolean(focus) && !platformActive(id);
  const dimCoupling = (slug: string) => Boolean(focus) && !couplingActive(slug);

  const togglePin = (next: Focus) => {
    setPinned((current) =>
      current &&
      ((current.kind === "platform" &&
        next.kind === "platform" &&
        current.id === next.id) ||
        (current.kind === "coupling" &&
          next.kind === "coupling" &&
          current.slug === next.slug))
        ? null
        : next,
    );
  };

  // Connector lines are drawn only when a coupling is in focus, to keep the
  // resting diagram clean.
  const focusedCoupling =
    focus?.kind === "coupling"
      ? platformCouplings.find((c) => c.slug === focus.slug) ?? null
      : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
      <figure className="m-0 rounded-2xl border border-white/10 bg-white/[0.02] p-2 sm:p-4">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full"
          role="group"
          aria-label="Diagram of the three Sapiens Scientia lenses and the couplings between them"
        >
          <defs>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base triangle edges */}
          {EDGES.map(([a, b]) => {
            const slug = pairwiseSlug(a, b);
            const active = slug ? couplingActive(slug) : false;
            return (
              <line
                key={`${a}-${b}`}
                x1={NODE_POS[a].x}
                y1={NODE_POS[a].y}
                x2={NODE_POS[b].x}
                y2={NODE_POS[b].y}
                stroke={active ? "var(--text-primary)" : "var(--text-muted)"}
                strokeOpacity={active ? 0.55 : 0.18}
                strokeWidth={active ? 2.5 : 1}
              />
            );
          })}

          {/* Connectors for a focused three-way coupling */}
          {focusedCoupling &&
            focusedCoupling.links.length === 3 &&
            focusedCoupling.links.map((id) => (
              <line
                key={`conn-${id}`}
                x1={COUPLING_POS[focusedCoupling.slug].x}
                y1={COUPLING_POS[focusedCoupling.slug].y}
                x2={NODE_POS[id].x}
                y2={NODE_POS[id].y}
                stroke={platformDefinitions[id].color}
                strokeOpacity={0.6}
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            ))}

          {/* Coupling pills */}
          {platformCouplings.map((coupling) => {
            const pos = COUPLING_POS[coupling.slug];
            const active = couplingActive(coupling.slug);
            const dim = dimCoupling(coupling.slug);
            const w = coupling.name.length * 6.6 + 26;
            return (
              <g
                key={coupling.slug}
                transform={`translate(${pos.x} ${pos.y})`}
                role="button"
                tabIndex={0}
                aria-label={`Coupling: ${coupling.name}`}
                className="cursor-pointer outline-none"
                opacity={dim ? 0.3 : 1}
                onMouseEnter={() => setHovered({ kind: "coupling", slug: coupling.slug })}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered({ kind: "coupling", slug: coupling.slug })}
                onBlur={() => setHovered(null)}
                onClick={() => togglePin({ kind: "coupling", slug: coupling.slug })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    togglePin({ kind: "coupling", slug: coupling.slug });
                  }
                }}
              >
                <rect
                  x={-w / 2}
                  y={-13}
                  width={w}
                  height={26}
                  rx={13}
                  fill="var(--background)"
                  stroke={active ? "var(--text-primary)" : "var(--text-muted)"}
                  strokeOpacity={active ? 0.8 : 0.4}
                  strokeWidth={active ? 1.75 : 1}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontWeight={active ? 600 : 500}
                  fill={active ? "var(--text-primary)" : "var(--text-secondary)"}
                >
                  {coupling.name}
                </text>
              </g>
            );
          })}

          {/* Lens nodes */}
          {platformList.map((platform) => {
            const pos = NODE_POS[platform.id];
            const active = platformActive(platform.id);
            const dim = dimPlatform(platform.id);
            return (
              <g
                key={platform.id}
                transform={`translate(${pos.x} ${pos.y})`}
                role="button"
                tabIndex={0}
                aria-label={`Lens: ${platform.shortName} — ${platform.label}`}
                className="cursor-pointer outline-none"
                opacity={dim ? 0.32 : 1}
                onMouseEnter={() => setHovered({ kind: "platform", id: platform.id })}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered({ kind: "platform", id: platform.id })}
                onBlur={() => setHovered(null)}
                onClick={() => togglePin({ kind: "platform", id: platform.id })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    togglePin({ kind: "platform", id: platform.id });
                  }
                }}
              >
                <circle
                  r={NODE_R}
                  fill={`${platform.color}1f`}
                  stroke={platform.color}
                  strokeWidth={active ? 3 : 1.75}
                  filter={active ? `url(#${glowId})` : undefined}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  y={-6}
                  fontSize={18}
                  fontWeight={700}
                  fill="var(--text-primary)"
                >
                  {platform.shortName}
                </text>
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  y={15}
                  fontSize={9.5}
                  fontWeight={500}
                  fill={platform.color}
                  style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
                >
                  {platform.label.replace(" Platform", "")}
                </text>
              </g>
            );
          })}
        </svg>
      </figure>

      <DetailPanel
        focus={focus}
        onSelectCoupling={(slug) => togglePin({ kind: "coupling", slug })}
        onHoverCoupling={(slug) =>
          setHovered(slug ? { kind: "coupling", slug } : null)
        }
      />
    </div>
  );
}

function pairwiseSlug(a: PlatformId, b: PlatformId): string | null {
  const coupling = platformCouplings.find(
    (c) => c.links.length === 2 && c.links.includes(a) && c.links.includes(b),
  );
  return coupling?.slug ?? null;
}

function DetailPanel({
  focus,
  onSelectCoupling,
  onHoverCoupling,
}: {
  focus: Focus | null;
  onSelectCoupling: (slug: string) => void;
  onHoverCoupling: (slug: string | null) => void;
}) {
  return (
    <aside
      aria-live="polite"
      className="min-h-[18rem] rounded-2xl border border-white/10 bg-white/[0.035] p-6"
    >
      {!focus && <PanelIntro />}

      {focus?.kind === "platform" &&
        (() => {
          const platform = platformDefinitions[focus.id];
          const couplings = platformCouplings.filter((c) =>
            c.links.includes(focus.id),
          );
          return (
            <div className="flex flex-col gap-4">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ color: platform.color }}
                >
                  {platform.label}
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {platform.shortName}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {platform.domain}.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Couples into {couplings.length} challenges
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {couplings.map((coupling) => (
                    <button
                      key={coupling.slug}
                      type="button"
                      onClick={() => onSelectCoupling(coupling.slug)}
                      onMouseEnter={() => onHoverCoupling(coupling.slug)}
                      onMouseLeave={() => onHoverCoupling(null)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-200 transition-colors hover:border-white/30 hover:text-white cursor-pointer"
                    >
                      {coupling.name}
                    </button>
                  ))}
                </div>
              </div>
              <Link
                href={platform.href}
                className="text-sm font-medium underline-offset-4 hover:underline"
                style={{ color: platform.color }}
              >
                Explore {platform.shortName} →
              </Link>
            </div>
          );
        })()}

      {focus?.kind === "coupling" &&
        (() => {
          const coupling = platformCouplings.find((c) => c.slug === focus.slug);
          if (!coupling) return null;
          return (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Coupling
                </p>
                <h3 className="mt-1 text-2xl font-semibold text-white">
                  {coupling.name}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {coupling.links.map((id) => (
                    <span
                      key={id}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        color: platformDefinitions[id].color,
                        backgroundColor: `${platformDefinitions[id].color}1f`,
                        border: `1px solid ${platformDefinitions[id].color}55`,
                      }}
                    >
                      {platformDefinitions[id].shortName}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-200">{coupling.detail}</p>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  The feedback loop
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {coupling.feedbackLoop}
                </p>
              </div>
            </div>
          );
        })()}
    </aside>
  );
}

function PanelIntro() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 text-slate-300">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        Start here
      </p>
      <p className="text-lg font-medium text-white">
        One world, read through three lenses.
      </p>
      <p className="text-sm leading-6 text-slate-400">
        <span className="text-sky-300">Persona</span>{" "}
        sees the human body and home,{" "}
        <span className="text-indigo-300">Societas</span>{" "}
        sees society and its institutions,{" "}
        <span className="text-emerald-300">Terra</span>{" "}
        sees the Earth that holds them both. The hardest problems of our time —
        pandemics, climate, food, energy — don&rsquo;t live inside any one lens.
        They live in the{" "}
        <span className="text-white">couplings between them</span>.
      </p>
      <p className="text-sm leading-6 text-slate-400">
        Hover a lens or a coupling to see how. Click to pin it.
      </p>
    </div>
  );
}
