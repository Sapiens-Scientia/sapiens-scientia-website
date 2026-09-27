import type { Metadata } from "next";
import Link from "next/link";
import { SalusPopulationMap } from "@/components/salus-population-map";
import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { SiteFooter } from "@/components/site-footer";
import { PlatformCouplingLinks } from "@/components/platform-coupling-links";
import { ScaleRungLinks } from "@/components/scale-rung-links";

export const metadata: Metadata = {
  title: "Salus | Sapiens Scientia",
  description:
    "Sapiens Scientia Salus: the human health module inside Persona for biology, medicine, care, and lived experience.",
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

export default function SalusModulePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <BreadcrumbTrail path="/platforms/persona/salus" />

      <section id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-4xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-blue-400">
            Persona · Health Module
          </p>
          <h1 className="text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Salus
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            Salus studies health, care, welfare, flourishing, and preservation: the practices and
            states of keeping human bodies and populations in a state of well-being.
          </p>
        </header>

        <div className="flex flex-col gap-8">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Global Human Health
          </h2>

          <SalusPopulationMap />
          <div className="grid max-w-3xl gap-3 border-l border-sky-200/20 pl-5 text-sm leading-6 text-slate-300">
            <p>
              Salus begins with humanity as a planetary population: unevenly distributed,
              biologically connected, and embedded in local environments.
            </p>
            <p>
              This map shows where human life is concentrated before the module
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

          <div
            className="morbus-module-card mt-2 border p-6 rounded-xl flex flex-col gap-6 transition-all duration-300 relative overflow-hidden group"
            style={{
              backgroundImage: "var(--morbus-card-bg)",
              borderColor: "var(--morbus-card-border)",
              boxShadow: "var(--morbus-card-shadow)",
            }}
          >
            {/* Visual glow accent */}
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-all duration-500 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div className="max-w-xl">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                  Ontology Module
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-emerald-200 mt-3">
                  Morbus
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Explore the detailed human disease ontology: etiology, physiological failure modes, axis matrices, and classification crosswalks.
                </p>
              </div>
              <Link
                href="/platforms/persona/salus/soma/morbus"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition-all duration-300 hover:bg-emerald-500 hover:text-white hover:scale-[1.02] shadow-md hover:shadow-emerald-500/20"
              >
                Open Morbus Explorer
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-7 border-t border-sky-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Human Body
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Salus connects the study of pathology and care back to the healthy physical structure of the person — 
              tracing wellness and disease failures directly to the anatomical and physiological substrates of the organism.
            </p>
          </div>

          <div
            className="soma-module-card border p-6 rounded-xl flex flex-col gap-6 transition-all duration-300 relative overflow-hidden group"
            style={{
              backgroundImage: "var(--soma-card-bg)",
              borderColor: "var(--soma-card-border)",
              boxShadow: "var(--soma-card-shadow)",
            }}
          >
            {/* Visual glow accent */}
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-rose-500/5 blur-3xl group-hover:bg-rose-500/10 transition-all duration-500 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
              <div className="max-w-xl">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-rose-400 bg-rose-400/10 px-2.5 py-1 rounded-full">
                  Primary Module
                </span>
                <h3
                  className="text-2xl font-bold tracking-tight mt-3"
                  style={{ color: "var(--soma-title-color)" }}
                >
                  Soma
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Explore the physical substrate of human life. Soma models the healthy body as an integrated physiological machine across multiple scales of representation.
                </p>
              </div>
              <Link
                href="/platforms/persona/salus/soma"
                className="inline-flex items-center gap-2 rounded-lg bg-rose-500/15 px-5 py-2.5 text-sm font-semibold text-rose-300 transition-all duration-300 hover:bg-rose-500 hover:text-white hover:scale-[1.02] shadow-md hover:shadow-rose-500/20"
              >
                Open Soma Explorer
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Sub-features or scales grid */}
            <div className="grid gap-3 sm:grid-cols-3 border-t border-rose-500/10 pt-5 relative z-10">
              <div className="border border-white/5 bg-white/[0.01] p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Anatomy</h4>
                <p className="text-xs text-slate-400 mt-1">Bodily structures, form, and spatial relationships.</p>
              </div>
              <div className="border border-white/5 bg-white/[0.01] p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Physiology</h4>
                <p className="text-xs text-slate-400 mt-1">Functions, regulatory loops, and homeostatic mechanisms.</p>
              </div>
              <div className="border border-white/5 bg-white/[0.01] p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                <h4 className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Histology</h4>
                <p className="text-xs text-slate-400 mt-1">Tissue-level fabric and cellular architecture.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-sky-200/15 pt-10">
          <h2 className="text-2xl font-semibold text-white">Related Persona Modules</h2>
          <div className="grid gap-4 sm:grid-cols-1">
            <Link
              href="/platforms/persona/domus"
              className="border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.045]"
            >
              <h3 className="text-lg font-semibold text-blue-300">Domus (Home)</h3>
              <p className="mt-2 text-sm text-slate-400">
                Home, household, dwelling, domestic life, and intimate habitat.
              </p>
            </Link>
          </div>
        </section>

        <PlatformCouplingLinks platform="persona" />

        <ScaleRungLinks platform="persona" />
      </section>
      <SiteFooter />
    </main>
  );
}
