import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader, PageShell, SourceList } from "@/components/page-kit";
import { ChronosArc } from "@/components/chronos-arc";
import {
  ORDERS_OF_TIME,
  chronosPlatforms,
  chronosSources,
  eons,
} from "@/lib/chronos";

export const metadata: Metadata = {
  title: "Chronos | Sapiens Scientia",
  description:
    "The Arc of Time: the Sapiens Scientia nested-systems project read across deep time — a logarithmic Big-History timeline from the Big Bang to the present, through four eons: Cosmos, Living Earth, Life & Mind, and Sapiens.",
};

export default function ChronosPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Sapiens Scientia · Structure of Time"
        accent="#f59e0b"
        title="The Arc of Time"
      >
        <p>
          The Ladder of Scale climbs through space; this is its twin in time.
          Reality is not only a nested hierarchy of systems — it is a sequence,
          each scale switched on at a moment in cosmic history. This is that
          history made navigable: a powers-of-ten arc from the Big Bang, through
          the origin of life and mind, to the human present.
        </p>
      </PageHeader>

      <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-white/15 py-5 text-sm uppercase tracking-[0.2em] text-slate-400">
        <span>{ORDERS_OF_TIME} orders of magnitude</span>
        <span>{eons.length} eons</span>
        <span>Big Bang → now</span>
      </div>

      <section className="flex flex-col gap-7">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            One Arc, Four Eons
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Plotted on a logarithmic time axis, the whole of recorded history is
            the thin bright tail of the arc: the last twelve thousand years of
            farming, writing, and science take up as much room as billions of
            years of cosmic and geological time. Deep time is compressed; the
            human present is stretched wide. Hover any moment to read it.
          </p>
        </div>

        <ChronosArc />
        <p className="text-xs leading-5 text-slate-500">
          Positions are order-of-magnitude ages in years before present on a
          base-10 log axis, not precise dates.
        </p>
      </section>

      <section className="flex flex-col gap-7 border-t border-white/10 pt-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            The Eons
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Each eon switches on a new layer of the system. The cosmos forges
            matter and a planet; the living Earth fills with cells and bodies;
            animals evolve minds; and a single species turns knowledge into a
            method. The same platforms that study the ladder of scale also have a
            place on the arc of time.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {eons.map((eon) => (
            <article
              key={eon.id}
              className="border border-l-2 border-white/10 bg-white/[0.02] p-5 sm:p-6"
              style={{ borderLeftColor: eon.color }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: eon.color }}
                  >
                    {eon.ordinal}
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-50 sm:text-3xl">
                    {eon.name}
                  </h3>
                </div>
                <p className="font-mono text-xs text-slate-400 sm:text-sm">
                  {eon.rangeLabel}
                </p>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                {eon.principle}
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {eon.groups.map((group) => (
                  <div
                    key={group.name}
                    className="border-l pl-3"
                    style={{ borderColor: `${eon.color}40` }}
                  >
                    <p className="text-sm font-semibold" style={{ color: eon.color }}>
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
                {eon.platforms.map((id) => {
                  const platform = chronosPlatforms[id];
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
            Space and Time, One Object
          </h2>
        </div>
        <blockquote className="max-w-3xl border-l-2 border-amber-300/40 pl-5 text-lg leading-8 text-slate-200">
          The Ladder of Scale and the Arc of Time are two readings of the same
          structure. A thing&apos;s place in the hierarchy of scale is also a
          moment in the history of the universe — a cell is both ten microns wide
          and 3.7 billion years deep. Sapiens Scientia studies the world along
          both axes at once.
        </blockquote>
        <Link
          href="/scales"
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-200 transition-colors hover:text-amber-50"
        >
          Climb the Ladder of Scale
          <span aria-hidden>→</span>
        </Link>

        <SourceList sources={chronosSources} hoverClass="hover:text-amber-200" />
      </section>
    </PageShell>
  );
}
