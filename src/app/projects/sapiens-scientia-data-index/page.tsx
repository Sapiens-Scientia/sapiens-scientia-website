import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import {
  dataIndexCategories as indexSections,
  dataIndexTotalEntries as totalEntries,
} from "@/lib/data-index";

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
            <span>{totalEntries} sources</span>
            <span>{indexSections.length} categories</span>
            <span>Database subset of the Digital Earth Catalog</span>
          </div>
        </header>

        <div className="grid gap-12">
          {indexSections.map((section) => (
            <section
              key={section.name}
              className="grid gap-6 border-t border-white/15 pt-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]"
            >
              <div>
                <h2 className="text-3xl font-semibold tracking-normal text-white">
                  {section.title}
                </h2>
                <p className="mt-3 max-w-xl text-lg leading-snug text-slate-400">
                  {section.description}
                </p>
              </div>

              <div className="divide-y divide-white/10 border-y border-white/10">
                {section.entries.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="grid gap-2 py-4 text-slate-100 transition-colors hover:text-blue-300 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] sm:items-center"
                  >
                    <span className="text-2xl font-medium leading-none">
                      {item.name}
                    </span>
                    <span className="text-lg leading-tight text-slate-400">
                      {item.role}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
