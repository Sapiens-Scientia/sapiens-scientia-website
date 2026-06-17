import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { MorbusExplorer } from "@/components/morbus-explorer";
import { MorbusAxisMatrix } from "@/components/morbus-axis-matrix";
import { MorbusOverviewStats } from "@/components/morbus-overview-stats";
import {
  morbusCrosswalks,
  morbusDiseaseCount,
  morbusDiseaseGroups,
  morbusDistinctionSet,
} from "@/lib/morbus";

export const metadata: Metadata = {
  title: "Morbus | Sapiens Scientia",
  description:
    "Sapiens Scientia Morbus: the disease ontology inside Salus for plural classification of human disease.",
};

const morbusSources = [
  { label: "WHO ICD-11 MMS Browser", href: "https://icd.who.int/browse/2025-01/mms/en" },
  { label: "WHO ICD classification overview", href: "https://www.who.int/classifications/classification-of-diseases" },
  { label: "Monarch Initiative — MONDO Disease Ontology", href: "https://mondo.monarchinitiative.org/" },
  { label: "Human Phenotype Ontology", href: "https://hpo.jax.org/" },
];

export default function MorbusPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav
        links={[
          { href: "/", label: "Home" },
          { href: "/platforms", label: "Platforms" },
          { href: "/platforms/salus", label: "Salus" },
        ]}
      />

      <section className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-4xl">
          <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-emerald-300/90">
            Salus · Disease Ontology
          </p>
          <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">
            Sapiens Scientia Morbus
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            Morbus is the human disease ontology, taxonomy, and model inside
            Salus. It organizes disease knowledge without assuming that every
            inherited clinical category is a clean natural kind — working from
            the hypothesis that many diseases are better understood as
            intersecting processes than as single objects.
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
            {morbusDiseaseCount} interactive exemplars below · shareable via URL hash
          </p>
        </header>

        <MorbusOverviewStats />

        <section className="flex flex-col gap-7">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Native Top-Level Distinction
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Rather than starting from organ systems or specialty boundaries,
              Morbus organizes disease first by whether it is defined by a
              relatively identifiable cause, by emergent physiological
              dysregulation over time, or by both at once.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {morbusDiseaseGroups.map((group) => (
              <article
                key={group.kind}
                className="flex flex-col border border-white/10 bg-white/[0.03] p-5"
              >
                <h3 className="text-xl font-semibold leading-7 text-slate-50">
                  {group.kind}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {group.principle}
                </p>
                <div className="mt-6 grid gap-4">
                  {group.subtypes.map((subtype) => (
                    <div key={subtype.name} className="border-l border-emerald-200/20 pl-3">
                      <p className="text-sm font-semibold text-emerald-100">
                        {subtype.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {subtype.examples.map((example) => (
                          <span
                            key={example}
                            className="border border-sky-200/10 bg-sky-200/[0.055] px-2.5 py-1 text-xs leading-5 text-slate-300"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-7 border-t border-emerald-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Early Distinction Set
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Beneath the top-level frame, Morbus separates the layers that get
              collapsed when a disease is treated as one object. A single
              condition is built from several of these primitives at once.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {morbusDistinctionSet.map((item) => (
              <article
                key={item.term}
                className="flex flex-col gap-1.5 border border-white/10 bg-white/[0.025] p-4"
              >
                <h3 className="text-base font-semibold text-emerald-100">
                  {item.term}
                </h3>
                <p className="text-sm leading-6 text-slate-400">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-7 border-t border-emerald-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Plural Classification Explorer
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              The working hypothesis of Morbus is that one condition is simultaneously
              anatomical, molecular, immunological, developmental, ecological,
              environmental, and social. Explore how key human diseases decompose along
              each axis rather than being forced into a single legacy category.
            </p>
          </div>

          <MorbusAxisMatrix />

          <MorbusExplorer />
        </section>

        <section className="flex flex-col gap-7 border-t border-emerald-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Crosswalk Layers
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Existing nosologies are treated as reference mappings rather than
              the native Morbus hierarchy. ICD-11 in particular is a public
              reporting crosswalk — a way to translate out, not the structure to
              organize around.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {morbusCrosswalks.map((cw) => (
              <a
                key={cw.name}
                href={cw.href}
                target="_blank"
                rel="noreferrer"
                className="group flex flex-col gap-1.5 border border-emerald-200/15 bg-emerald-200/[0.035] p-4 transition-colors hover:border-emerald-200/40 hover:bg-emerald-200/[0.06]"
              >
                <h3 className="text-base font-semibold text-emerald-100 group-hover:text-emerald-50">
                  {cw.name}
                </h3>
                <p className="text-sm leading-6 text-slate-400">{cw.role}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-5 border-t border-emerald-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Working Hypothesis
            </h2>
          </div>
          <blockquote className="max-w-3xl border-l-2 border-emerald-300/40 pl-5 text-lg leading-8 text-slate-200">
            Many diseases are better understood as intersecting processes rather
            than single objects. Morbus supports plural classification: one
            condition may be simultaneously anatomical, molecular, immunological,
            developmental, ecological, environmental, and social.
          </blockquote>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs leading-5 text-slate-500">
            {morbusSources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-emerald-200"
              >
                {source.label}
              </a>
            ))}
          </div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
