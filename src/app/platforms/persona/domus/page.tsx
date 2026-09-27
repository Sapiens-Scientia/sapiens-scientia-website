import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { SiteFooter } from "@/components/site-footer";
import { PlatformCouplingLinks } from "@/components/platform-coupling-links";
import { ScaleRungLinks } from "@/components/scale-rung-links";

export const metadata: Metadata = {
  title: "Domus | Sapiens Scientia",
  description:
    "Sapiens Scientia Domus: the Persona module for home, household, dwelling, and domestic life.",
};

const domusFields = [
  { category: "Habitat & Structure", items: ["Dwelling structure", "Indoor air quality", "Heating & cooling", "Indoor ecology"] },
  { category: "Life & Care", items: ["Sleep & rest", "Hygiene & water use", "Food preparation & nutrition", "Privacy & safety"] },
  { category: "Social & Caregiving", items: ["Household structure", "Family & cohabitants", "Caregiving & domestic labor", "Childhood development"] },
  { category: "Vulnerability & Adaptation", items: ["Illness management", "Disability accommodation", "Aging in place", "Digital devices & connectivity"] },
  { category: "Economic Burden", items: ["Rent & mortgage", "Utility burden", "Housing affordability", "Domestic infrastructure"] },
];

const domusBridges = [
  {
    bridge: "Domus ↔ Persona",
    color: "text-rose-300 border-rose-300/20 bg-rose-300/[0.02]",
    description: "The intimate biological connection between domestic life and the individual body's states.",
    examples: ["Sleep quality and duration", "Nutritional intake and food preparation", "Hygiene practices", "Caregiving and illness management", "Mental health and domestic shelter"],
  },
  {
    bridge: "Domus ↔ Societas",
    color: "text-indigo-300 border-indigo-300/20 bg-indigo-300/[0.02]",
    description: "How households and dwellings connect to structural laws, labor markets, and institutions.",
    examples: ["Family structures & legal definitions", "Property rights & housing markets", "Domestic division of labor", "Social inequality & housing burden", "Zoning regulations"],
  },
  {
    bridge: "Domus ↔ Terra",
    color: "text-emerald-300 border-emerald-300/20 bg-emerald-300/[0.02]",
    description: "The physical inputs, outputs, and ecological constraints of the home habitat.",
    examples: ["Household energy consumption", "Water use & conservation", "Land use & structural materials", "Waste generation & recycling", "Climate resilience & local ecosystems"],
  },
];

export default function DomusModulePage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <BreadcrumbTrail path="/platforms/persona/domus" />

      <section id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-12">
        <header className="max-w-4xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-blue-400">
            Persona · Home Module
          </p>
          <h1 className="text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Domus
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
            Domus is the Persona module for home, household, dwelling, and domestic life:
            the intimate human habitat where bodies are sheltered, cared for, reproduced, repaired, and
            connected to wider social, technological, and Earth systems.
          </p>
          <blockquote className="mt-6 border-l-2 border-blue-400/40 pl-5 font-mono text-sm italic text-slate-400">
            Domus studies the home as a human habitat: biological, social, technological, economic, and ecological.
          </blockquote>
        </header>

        <section className="border-t border-white/10 pt-10">
          <div className="max-w-3xl mb-8">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Scope of Study
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Domus models the direct, local interfaces where systemic, planetary-scale systems become lived human experience.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {domusFields.map((group) => (
              <article key={group.category} className="border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-lg font-semibold text-blue-300/90 border-b border-white/10 pb-2 mb-4">
                  {group.category}
                </h3>
                <ul className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400/50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10 pt-10">
          <div className="max-w-3xl mb-8">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Domus Bridges
            </h2>
            <p className="mt-3 text-base text-slate-400">
              Though nested under Persona, Domus acts as a physical and social conduit bridging all three platforms.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {domusBridges.map((bridge) => (
              <article key={bridge.bridge} className={`border p-6 flex flex-col justify-between ${bridge.color}`}>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{bridge.bridge}</h3>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {bridge.description}
                  </p>
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {bridge.examples.map((example) => (
                      <li key={example} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="mt-1 text-slate-500">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-white/10 pt-10">
          <h2 className="text-2xl font-semibold text-white">Related Persona Modules</h2>
          <div className="grid gap-4 sm:grid-cols-1">
            <Link
              href="/platforms/persona/salus"
              className="border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.045]"
            >
              <h3 className="text-lg font-semibold text-blue-400">Salus (Health)</h3>
              <p className="mt-2 text-sm text-slate-400">
                Health, care, welfare, flourishing, and preservation.
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
