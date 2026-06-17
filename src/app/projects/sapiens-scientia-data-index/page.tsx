import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { DataIndexExplorer } from "@/components/data-index-explorer";
import { dataIndexEntryCount, dataIndexSections } from "@/lib/data-index";

export const metadata: Metadata = {
  title: "Sapiens Scientia Data Index | Sapiens Scientia",
  description:
    "A working index of public databases, scholarly indexes, archives, platforms, and registries relevant to Sapiens Scientia.",
};

export default function SapiensScientiaDataIndexPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav
        links={[
          { href: "/", label: "Home" },
          { href: "/projects", label: "Projects" },
          { href: "/platforms", label: "Platforms" },
        ]}
      />

      <section className="mx-auto flex max-w-6xl flex-col gap-14">
        <header className="max-w-4xl">
          <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-blue-400">
            Sapiens Scientia
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-normal sm:text-7xl">
            Sapiens Scientia Data Index
          </h1>
          <p className="mt-6 max-w-3xl text-2xl leading-tight text-slate-300 sm:text-3xl">
            A structured index of major databases behind human knowledge:
            repositories, scholarly indexes, metadata graphs, library catalogs,
            data portals, registries, and scientific archives.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-white/15 py-5 text-sm uppercase tracking-[0.2em] text-slate-400">
            <span>{dataIndexEntryCount} sources</span>
            <span>{dataIndexSections.length} categories</span>
            <span>Filterable · shareable category hashes</span>
          </div>
        </header>

        <DataIndexExplorer />
      </section>
      <SiteFooter />
    </main>
  );
}
