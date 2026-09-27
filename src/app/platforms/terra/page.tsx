import Link from "next/link";
import type { Metadata } from "next";
import { PlatformIntroduction } from "@/components/platform-introduction";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { TerraExplorer } from "@/components/terra-explorer";
import { PlatformCouplingLinks } from "@/components/platform-coupling-links";
import { ScaleRungLinks } from "@/components/scale-rung-links";

export const metadata: Metadata = {
  title: "Terra | Sapiens Scientia",
  description:
    "Sapiens Scientia Terra: the Earth systems platform for climate, ecology, energy, and planetary conditions.",
};

const terraScope = [
  "Earth systems",
  "Climate",
  "Ecology",
  "Energy",
  "Planetary boundaries",
  "Human geography",
  "Biosphere dynamics",
  "Food, water, and land systems",
  "Humans as a planetary force",
];

export default function TerraPage() {
  return (
    <main className="atlas-page min-h-screen px-6 py-8 sm:px-10">
      <SiteNav />

      <section id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-10">
        <PlatformIntroduction platform="terra" />

        <div id="terra-model" tabIndex={-1}><TerraExplorer /></div>

        <section className="flex flex-col gap-6 border-t border-emerald-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              The Earth&apos;s Vital Signs
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              A patient is read through their vital signs; so is a planet. Terra&apos;s
              dashboard brings together population, climate, ocean, land, and waste
              indicators. Explore dated reference series, illustrative projections,
              and available source updates, with links back to their providers.
            </p>
          </div>
          <Link
            href="/vitals"
            className="inline-flex w-fit items-center gap-2 border border-emerald-200/20 bg-emerald-200/[0.05] px-4 py-2.5 text-sm font-medium text-emerald-100 transition-colors hover:border-emerald-200/40 hover:text-emerald-50"
          >
            Open the planetary vital signs dashboard
            <span aria-hidden>→</span>
          </Link>
        </section>

        <PlatformCouplingLinks platform="terra" />

        <ScaleRungLinks platform="terra" />

        <section className="flex flex-col gap-6 border-t border-emerald-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              What Terra studies
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Terra studies the natural and human-shaped systems that together set
              the environmental conditions of civilization.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {terraScope.map((item) => (
              <span
                key={item}
                className="border border-emerald-200/15 bg-emerald-200/[0.05] px-3 py-1.5 text-sm leading-5 text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
