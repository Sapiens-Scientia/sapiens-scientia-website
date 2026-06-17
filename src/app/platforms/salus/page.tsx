import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SalusPopulationGlobe } from "@/components/salus-population-globe";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PlatformCouplingLinks } from "@/components/platform-coupling-links";
import { ScaleRungLinks } from "@/components/scale-rung-links";
import { morbusDiseaseGroups, morbusDiseases } from "@/lib/morbus";

export const metadata: Metadata = {
  title: "Salus | Sapiens Scientia",
  description:
    "Sapiens Scientia Salus: the human health platform for biology, medicine, disease, care, and lived experience.",
};

const diseaseBurdenStats = [
  {
    value: "43M",
    label: "NCD deaths",
    detail: "Noncommunicable diseases killed at least 43 million people in 2021.",
    source: "WHO",
  },
  {
    value: "18M",
    label: "premature NCD deaths",
    detail: "People died from NCDs before age 70 in 2021; most were in low- and middle-income countries.",
    source: "WHO",
  },
  {
    value: "282M",
    label: "malaria cases",
    detail: "Estimated malaria cases across 80 endemic countries and areas in 2024.",
    source: "WHO",
  },
  {
    value: "10.7M",
    label: "TB illness",
    detail: "People fell ill with tuberculosis globally in 2024.",
    source: "WHO",
  },
  {
    value: "1.41B",
    label: "NTD care need",
    detail: "People were reported to require treatment or care for neglected tropical diseases in 2024.",
    source: "WHO",
  },
  {
    value: "4.6B",
    label: "without essential services",
    detail: "People lacked access to essential health services in 2023.",
    source: "WHO / World Bank",
  },
];

const burdenSources = [
  {
    label: "WHO UHC Communicable and NCDs Dashboard",
    href: "https://data.who.int/dashboards/ucn/overview",
  },
  {
    label: "WHO SDG Target 3.3 Communicable Diseases",
    href: "https://www.who.int/data/gho/data/themes/topics/sdg-target-3_3-communicable-diseases",
  },
  {
    label: "WHO / World Bank Tracking Universal Health Coverage 2025",
    href: "https://cdn.who.int/media/docs/default-source/gho-documents/tracking-universal-health-coverage-global-report-2025.pdf?download=true&sfvrsn=f8cf10f6_11",
  },
];

const morbusSources = [
  {
    label: "WHO ICD-11 MMS Browser",
    href: "https://icd.who.int/browse/2025-01/mms/en",
  },
  {
    label: "WHO ICD classification overview",
    href: "https://www.who.int/classifications/classification-of-diseases",
  },
  {
    label: "ICD-11 Reference Guide",
    href: "https://icdcdn.who.int/icd11referenceguide/en/html/index.html",
  },
];

export default function SalusPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav />

      <section className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-4xl">
          <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-blue-400">
            Human Health Platform
          </p>
          <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">
            Sapiens Scientia Salus
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            A platform for human biology, medicine, physiology, disease, care,
            and the lived experience of health.
          </p>
          <Link
            href="/scales"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-sky-200 transition-colors hover:text-sky-50"
          >
            Salus spans cells to the whole body — see the ladder
            <span aria-hidden>→</span>
          </Link>
        </header>

        <div className="flex flex-col gap-8">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Global Human Health
          </h2>

          <SalusPopulationGlobe />

          <div className="grid max-w-3xl gap-3 border-l border-sky-200/20 pl-5 text-sm leading-6 text-slate-300">
            <p>
              Salus begins with humanity as a planetary population: unevenly distributed,
              biologically connected, and embedded in local environments.
            </p>
            <p>
              This first globe sketches where human life is concentrated before the platform
              descends into health systems, bodies, cells, microbes, bacteria, and viruses.
            </p>
          </div>
        </div>

        <section className="flex flex-col gap-7 border-t border-sky-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Global Disease Burden
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Salus treats global health as a layered field of chronic disease,
              infectious disease, care access, and population-scale vulnerability.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {diseaseBurdenStats.map((stat) => (
              <article
                key={stat.label}
                className="border border-white/10 bg-white/[0.035] p-5 shadow-[0_0_28px_rgba(15,23,42,0.22)]"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-4xl font-semibold tracking-normal text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-sky-200/70">
                    {stat.source}
                  </p>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-100">
                  {stat.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {stat.detail}
                </p>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs leading-5 text-slate-500">
            {burdenSources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-sky-200"
              >
                {source.label}
              </a>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-7 border-t border-sky-200/15 pt-10">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Sapiens Scientia Morbus
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              Morbus is the human disease ontology inside Salus: a structured map of
              disease entities, syndromes, mechanisms, risk states, complications,
              treatment effects, and lived experience. Its native frame begins with
              whether disease is organized by a primary cause, emergent physiological
              dysregulation, or both.
            </p>
            <Link
              href="/platforms/salus/morbus"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-200 transition-colors hover:text-emerald-50"
            >
              Explore the Morbus ontology
              <span aria-hidden>→</span>
            </Link>
            <div className="mt-4 flex flex-wrap gap-2">
              {(["ibd", "t2d", "covid19", "malaria", "hiv", "mdd"] as const).map((id) => {
                const disease = morbusDiseases.find((entry) => entry.id === id);
                if (!disease) {
                  return null;
                }

                return (
                  <Link
                    key={id}
                    href={`/platforms/salus/morbus#${id}`}
                    className="border border-emerald-200/15 bg-emerald-200/[0.05] px-2.5 py-1 text-xs leading-5 text-emerald-100 transition-colors hover:border-emerald-200/35 hover:text-emerald-50"
                  >
                    {disease.name.replace(/ \(.*\)/, "")}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="relative h-[min(68vw,40rem)] min-h-[24rem] overflow-hidden border border-white/10 bg-black">
            <Image
              src="/images/inside-body-parts-name.jpg"
              alt="Transparent human torso showing internal organs and vascular structures"
              fill
              sizes="(min-width: 1280px) 1216px, calc(100vw - 5rem)"
              className="object-cover object-center opacity-90"
            />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.36)_100%)]" />
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

          <div className="grid gap-4 border border-emerald-200/10 bg-emerald-200/[0.035] p-5 text-sm leading-6 text-slate-300 md:grid-cols-[0.85fr_1.45fr]">
            <div>
              <h3 className="text-base font-semibold text-emerald-100">
                Crosswalk layers
              </h3>
              <p className="mt-2 text-slate-400">
                ICD-11, SNOMED CT, MeSH, MONDO, DOID, and HPO can remain reference mappings.
              </p>
            </div>
            <p>
              A Morbus condition can be cross-indexed by body system, etiology,
              molecular mechanism, immune pattern, microbial ecology, tissue lesion,
              social exposure, complication, treatment effect, and lived experience
              without forcing it into a single inherited clinical category.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs leading-5 text-slate-500">
            {morbusSources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-sky-200"
              >
                {source.label}
              </a>
            ))}
          </div>
        </section>

        <PlatformCouplingLinks platform="salus" />

        <ScaleRungLinks platform="salus" />
      </section>
      <SiteFooter />
    </main>
  );
}
