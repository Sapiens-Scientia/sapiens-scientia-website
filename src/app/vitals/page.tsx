import Link from "next/link";
import type { Metadata } from "next";
import { PageHeader, PageShell, SourceList } from "@/components/page-kit";
import { VitalSignsDashboard } from "@/components/vital-signs-dashboard";
import {
  earthVitalSigns,
  vitalSignDomains,
  vitalSignSources,
  vitalSignYearSpan,
} from "@/lib/vital-signs";

export const metadata: Metadata = {
  title: "Vital Signs | Sapiens Scientia",
  description:
    "The Earth's vital signs: a sourced dashboard of planetary indicators — population, climate, ocean, land, and waste — with dated reference series and illustrative projections to 2050.",
  openGraph: {
    title: "The Earth's Vital Signs | Sapiens Scientia",
    description:
      "A sourced dashboard of planetary indicators — population, climate, ocean, land, and waste — with reference series and illustrative projections to 2050.",
    url: "/vitals",
    type: "website",
  },
};

export default function VitalsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Sapiens Scientia · Planetary Vital Signs"
        accent="#34d399"
        title="The Earth's Vital Signs"
      >
        <p>
          A patient is read through their vital signs; so is a planet. These are
          indicators of the one Earth system human civilization is
          embedded in — shown through dated reference values, historical series,
          and illustrative projections toward 2050.
        </p>
      </PageHeader>

      <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-white/15 py-5 text-sm uppercase tracking-[0.2em] text-slate-400">
        <span>{earthVitalSigns.length} indicators</span>
        <span>{vitalSignDomains.length} domains</span>
        <span>
          {vitalSignYearSpan.min}–{vitalSignYearSpan.max}
        </span>
        <span>People → the planet</span>
      </div>

      <section className="flex max-w-3xl flex-col gap-4">
        <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
          Reading the chart
        </h2>
        <p className="text-base leading-7 text-slate-300">
          Each card shows a dated reference value or a fetched source update. The solid
          line connects curated historical reference points; the dashed line
          shows an illustrative projection. An outlined point marks a fetched
          observation, which may use a different period or source from the
          reference series. Open “View chart data” to read every plotted value.
          Filter by domain, or compare changes within each reference series.
        </p>
        <p className="text-sm leading-6 text-slate-500">
          Projections are for orientation, not formal forecasts. Source updates
          do not recalculate them. The same dataset annotates the Earth model in{" "}
          <Link href="/meta-earth" className="text-emerald-200 transition-colors hover:text-emerald-50">
            Meta Earth
          </Link>
          .
        </p>
      </section>

      <VitalSignsDashboard />

      <section className="flex flex-col gap-5 border-t border-white/10 pt-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Every line sits on the ladder
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            These indicators are not free-floating statistics. Each one reads a
            specific rung of the nested-systems hierarchy — the atmosphere, the
            hydrosphere, the biosphere, the human economy — that Sapiens Scientia
            is built around.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/scales"
            className="inline-flex items-center gap-2 border border-emerald-300/40 px-4 py-2 text-sm font-medium text-emerald-200 transition-colors hover:bg-white/[0.06]"
          >
            See the Ladder of Scale
            <span aria-hidden>→</span>
          </Link>
          <Link
            href="/platforms/terra"
            className="inline-flex items-center gap-2 border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/[0.06]"
          >
            Explore Terra — the Earth platform
            <span aria-hidden>→</span>
          </Link>
        </div>

        <SourceList sources={vitalSignSources} hoverClass="hover:text-emerald-200" />
      </section>
    </PageShell>
  );
}
