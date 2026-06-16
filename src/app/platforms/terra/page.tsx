import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PlanetaryBoundariesWheel } from "@/components/planetary-boundaries-wheel";

export const metadata: Metadata = {
  title: "Terra | Sapiens Scientia",
  description:
    "Sapiens Scientia Terra: the Earth systems platform for climate, ecology, energy, and planetary conditions.",
};

type PlanetaryBoundary = {
  name: string;
  control: string;
  status: "breached" | "safe";
};

const planetaryBoundaries: PlanetaryBoundary[] = [
  { name: "Climate change", control: "CO₂ concentration and radiative forcing", status: "breached" },
  { name: "Biosphere integrity", control: "Genetic and functional diversity loss", status: "breached" },
  { name: "Land-system change", control: "Forest and natural land converted", status: "breached" },
  { name: "Freshwater change", control: "Blue and green water disruption", status: "breached" },
  { name: "Biogeochemical flows", control: "Nitrogen and phosphorus loading", status: "breached" },
  { name: "Novel entities", control: "Synthetic chemicals, plastics, materials", status: "breached" },
  { name: "Ocean acidification", control: "Carbonate saturation of surface ocean", status: "breached" },
  { name: "Atmospheric aerosols", control: "Particulate loading of the atmosphere", status: "safe" },
  { name: "Ozone depletion", control: "Stratospheric ozone concentration", status: "safe" },
];

const planetarySignals = [
  {
    value: "1.55 °C",
    label: "above pre-industrial",
    detail:
      "2024 was the warmest year on record and the first calendar year to average more than 1.5 °C above the 1850–1900 baseline.",
    source: "WMO",
  },
  {
    value: "430 ppm",
    label: "atmospheric CO₂",
    detail:
      "Monthly CO₂ at Mauna Loa first passed 430 ppm in May 2025; the 3.75 ppm annual jump in 2024 was the largest on record.",
    source: "NOAA / Scripps",
  },
  {
    value: "4.5 mm/yr",
    label: "sea-level rise",
    detail:
      "The rate of global mean sea-level rise roughly doubled from 2.1 mm/yr in 1993 to 4.5 mm/yr in 2024, and continues to accelerate.",
    source: "NASA",
  },
  {
    value: "6.7M ha",
    label: "tropical primary forest lost",
    detail:
      "Tropical primary forest loss hit a record in 2024 — nearly double 2023 — with fire the leading driver for the first time.",
    source: "Global Forest Watch / WRI",
  },
  {
    value: "73%",
    label: "wildlife population decline",
    detail:
      "The average size of monitored vertebrate populations fell 73% between 1970 and 2020; freshwater systems fell 85%.",
    source: "WWF / ZSL",
  },
  {
    value: "86%",
    label: "primary energy from fossil fuels",
    detail:
      "Fossil fuels still supplied roughly 86% of global primary energy in 2024, even as wind and solar grew about 16% — nine times faster than total demand.",
    source: "Energy Institute",
  },
];

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

const terraSources = [
  {
    label: "Stockholm Resilience Centre — Planetary Boundaries",
    href: "https://www.stockholmresilience.org/research/planetary-boundaries.html",
  },
  {
    label: "WMO — State of the Global Climate 2024",
    href: "https://wmo.int/news/media-centre/wmo-confirms-2024-warmest-year-record-about-155degc-above-pre-industrial-level",
  },
  {
    label: "NOAA Global Monitoring Laboratory — Trends in CO₂",
    href: "https://gml.noaa.gov/ccgg/trends/",
  },
  {
    label: "NASA — Sea Level Change",
    href: "https://sealevel.nasa.gov/",
  },
  {
    label: "WWF — Living Planet Report 2024",
    href: "https://www.worldwildlife.org/publications/2024-living-planet-report/",
  },
  {
    label: "Energy Institute — Statistical Review of World Energy",
    href: "https://www.energyinst.org/statistical-review",
  },
];

const breachedCount = planetaryBoundaries.filter((b) => b.status === "breached").length;

export default function TerraPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav />

      <section className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-4xl">
          <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-blue-400">
            Environmental Platform
          </p>
          <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">
            Sapiens Scientia Terra
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            A platform for Earth systems, climate, ecology, energy, and the
            planetary conditions of human civilization — treating the
            environment not as a backdrop but as an active, coupled system that
            human life is embedded within.
          </p>
          <Link
            href="/scales"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-200 transition-colors hover:text-emerald-50"
          >
            Terra sits at the planetary scale — see the ladder
            <span aria-hidden>→</span>
          </Link>
        </header>

        <section className="flex flex-col gap-7">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Earth as a Coupled System
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Terra frames the planet through nine planetary boundaries — the
              Earth-system processes that keep the world in the stable state
              human civilization grew up in. As of the 2025 assessment,{" "}
              <span className="text-emerald-100">{breachedCount} of 9</span> have
              been crossed, with ocean acidification the most recent to be
              breached.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-4 sm:p-6">
            <PlanetaryBoundariesWheel boundaries={planetaryBoundaries} />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-emerald-300/60" />
                Within safe operating space
              </span>
              <span className="flex items-center gap-2">
                <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-amber-300/60" />
                Beyond the boundary — breached
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {planetaryBoundaries.map((boundary, index) => {
              const breached = boundary.status === "breached";

              return (
                <article
                  key={boundary.name}
                  className={`flex flex-col gap-2 border bg-white/[0.025] p-4 ${
                    breached ? "border-amber-300/25" : "border-emerald-300/25"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-baseline gap-2 text-base font-semibold text-slate-50">
                      <span
                        className={`font-mono text-xs ${
                          breached ? "text-amber-300/80" : "text-emerald-300/80"
                        }`}
                      >
                        {index + 1}
                      </span>
                      {boundary.name}
                    </h3>
                    <span
                      className={`shrink-0 text-[0.65rem] font-medium uppercase tracking-[0.16em] ${
                        breached ? "text-amber-300/90" : "text-emerald-300/90"
                      }`}
                    >
                      {breached ? "Breached" : "Safe zone"}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-400">
                    {boundary.control}
                  </p>
                  <span
                    aria-hidden
                    className={`mt-1 h-px w-full ${
                      breached ? "bg-amber-300/30" : "bg-emerald-300/30"
                    }`}
                  />
                </article>
              );
            })}
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Boundary status reflects the 2025 Planetary Health Check update from
            the Stockholm Resilience Centre and partners.
          </p>
        </section>

        <section className="flex flex-col gap-7 border-t border-emerald-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Planetary Signals
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              A small set of measured indicators sketches the direction of the
              coupled system: a warming atmosphere, a rising and acidifying
              ocean, thinning forests and wildlife, and an energy base still
              dominated by fossil fuels.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {planetarySignals.map((signal) => (
              <article
                key={signal.label}
                className="border border-white/10 bg-white/[0.035] p-5 shadow-[0_0_28px_rgba(15,23,42,0.22)]"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-4xl font-semibold tracking-normal text-white">
                    {signal.value}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-200/70">
                    {signal.source}
                  </p>
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-100">
                  {signal.label}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {signal.detail}
                </p>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs leading-5 text-slate-500">
            {terraSources.map((source) => (
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

        <section className="flex flex-col gap-6 border-t border-emerald-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Initial Scope
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Terra is a future platform. Its early scope spans the natural and
              human-shaped systems that together set the environmental terms of
              civilization.
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
