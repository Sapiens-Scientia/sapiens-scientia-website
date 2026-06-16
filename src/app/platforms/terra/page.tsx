import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { TerraExplorer } from "@/components/terra-explorer";

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

        <TerraExplorer />

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
