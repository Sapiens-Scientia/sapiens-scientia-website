import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SocietasExplorer } from "@/components/societas-explorer";

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
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav />

      <section className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-4xl">
          <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-blue-400">
            Human Society Platform
          </p>
          <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">
            Sapiens Scientia Societas
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            A platform for human society as a complex adaptive system: culture,
            institutions, governance, economics, technology, and the cooperation
            and conflict through which populations organize themselves at scale.
          </p>
          <Link
            href="/scales"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-indigo-200 transition-colors hover:text-indigo-50"
          >
            Societas sits at the collective scale — see the ladder
            <span aria-hidden>→</span>
          </Link>
        </header>

        <SocietasExplorer />

        <section className="flex flex-col gap-6 border-t border-amber-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Initial Scope
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Societas is a future platform. Its early scope spans the systems
              through which humans cooperate, govern, produce, and pass knowledge
              between generations.
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
