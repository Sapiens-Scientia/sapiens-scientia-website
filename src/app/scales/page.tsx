import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader, PageShell, SourceList } from "@/components/page-kit";
import { ScaleLadder } from "@/components/scale-ladder";
import {
  ORDERS_OF_MAGNITUDE,
  platforms,
  scaleSources,
  scaleTiers,
} from "@/lib/scales";

export const metadata: Metadata = {
  title: "Scales | Sapiens Scientia",
  description:
    "The Ladder of Scale: the nested-systems hierarchy behind Sapiens Scientia, from elementary particles to the Sun — Microsystems, Mesosystems, Macrosystems, and Megasystems.",
};

export default function ScalesPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Sapiens Scientia · Structure of Reality" title="The Ladder of Scale">
        <p>
          Sapiens Scientia is built on a single idea: reality is a nested
          hierarchy of systems, each one assembled from the scale below it.
          This is that hierarchy made navigable — a powers-of-ten climb from
          elementary particles, through the human body, up to society, the
          planet, and the star that powers it.
        </p>
      </PageHeader>

      <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-white/15 py-5 text-sm uppercase tracking-[0.2em] text-slate-400">
        <span>{ORDERS_OF_MAGNITUDE} orders of magnitude</span>
        <span>{scaleTiers.length} tiers</span>
        <span>Particles → the Sun</span>
      </div>

      <section className="flex flex-col gap-7">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            One Ladder, Four Tiers
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            The same matter, organized at ever-larger scales, becomes physics,
            then biology, then society, then a planet. The ladder below plots
            characteristic sizes on a logarithmic axis; each rung is a kind of
            system the platforms study. Homo sapiens sits near the middle —
            the scale from which every other rung is read. Click a rung to pin it
            and share via URL hash (e.g. <code className="text-sky-200">/scales#homo-sapiens</code>).
          </p>
        </div>

        <ScaleLadder />
        <p className="text-xs leading-5 text-slate-500">
          Positions are order-of-magnitude characteristic sizes on a base-10
          log axis, not precise measurements.
        </p>
      </section>

      <section className="flex flex-col gap-7 border-t border-white/10 pt-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            The Tiers
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Each tier is a band of scale with its own kinds of systems — and its
            own Sapiens Scientia platform. Health lives at the smallest scales of
            the body, society at the collective scale, and Earth systems at the
            planetary scale.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {scaleTiers.map((tier) => (
            <article
              key={tier.id}
              className="border border-l-2 border-white/10 bg-white/[0.02] p-5 sm:p-6"
              style={{ borderLeftColor: tier.color }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: tier.color }}
                  >
                    {tier.ordinal}
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-50 sm:text-3xl">
                    {tier.name}
                  </h3>
                </div>
                <p className="font-mono text-xs text-slate-400 sm:text-sm">
                  {tier.rangeLabel}
                </p>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                {tier.principle}
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tier.groups.map((group) => (
                  <div
                    key={group.name}
                    className="border-l pl-3"
                    style={{ borderColor: `${tier.color}40` }}
                  >
                    <p className="text-sm font-semibold" style={{ color: tier.color }}>
                      {group.name}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.members.map((member) => (
                        <span
                          key={member}
                          className="border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs leading-5 text-slate-300"
                        >
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                  Studied by
                </span>
                {tier.platforms.map((id) => {
                  const platform = platforms[id];
                  return (
                    <Link
                      key={id}
                      href={platform.href}
                      className="inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-white/[0.06]"
                      style={{ borderColor: `${platform.color}55`, color: platform.color }}
                    >
                      {platform.name}
                      <span aria-hidden>→</span>
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5 border-t border-white/10 pt-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Why a Ladder
          </h2>
        </div>
        <blockquote className="max-w-3xl border-l-2 border-sky-300/40 pl-5 text-lg leading-8 text-slate-200">
          The platforms are not separate sciences stacked side by side. They are
          slices of one continuous ladder of scale — the same world, studied at
          the level where its behavior actually lives. Salus works near the
          bottom and middle, Societas in the collective band, Terra at the top.
        </blockquote>
        <Link
          href="/platforms"
          className="inline-flex items-center gap-2 text-sm font-medium text-sky-200 transition-colors hover:text-sky-50"
        >
          See how the platforms couple together
          <span aria-hidden>→</span>
        </Link>

        <SourceList sources={scaleSources} />
      </section>
    </PageShell>
  );
}
