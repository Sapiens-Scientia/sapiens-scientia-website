import type { Metadata } from "next";
import { PlatformIntroduction } from "@/components/platform-introduction";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SocietasExplorer } from "@/components/societas-explorer";
import { PlatformCouplingLinks } from "@/components/platform-coupling-links";
import { ScaleRungLinks } from "@/components/scale-rung-links";

export const metadata: Metadata = {
  title: "Societas | Sapiens Scientia",
  description:
    "Sapiens Scientia Societas: the human society platform for culture, institutions, governance, economics, technology, and cooperation.",
};

const societasScope = [
  "Social systems",
  "Institutions",
  "Governance",
  "Economics",
  "Technology and tools",
  "Communication systems",
  "Education and knowledge transmission",
  "Human cooperation and conflict",
  "Infrastructure and digital systems",
];

export default function SocietasPage() {
  return (
    <main className="atlas-page min-h-screen px-6 py-8 sm:px-10">
      <SiteNav />

      <section id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-10">
        <PlatformIntroduction platform="societas" />

        <div id="societas-model" tabIndex={-1}><SocietasExplorer /></div>

        <PlatformCouplingLinks platform="societas" />

        <ScaleRungLinks platform="societas" />

        <section className="flex flex-col gap-6 border-t border-amber-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              What Societas studies
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Societas studies the systems through which humans cooperate, govern,
              produce, and pass knowledge between generations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {societasScope.map((item) => (
              <span
                key={item}
                className="border border-amber-200/15 bg-amber-200/[0.05] px-3 py-1.5 text-sm leading-5 text-slate-200"
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
