import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SomaExplorer } from "@/components/soma-explorer";
import {
  somaLenses,
  somaLevels,
  somaSystemCount,
  somaTissues,
} from "@/lib/soma";

export const metadata: Metadata = {
  title: "Soma | Sapiens Scientia",
  description:
    "Sapiens Scientia Soma: the human body module inside Salus — anatomy, physiology, and histology of the body's organ systems.",
};

const somaSources = [
  { label: "NCBI Bookshelf — Anatomy, Physiology & Histology", href: "https://www.ncbi.nlm.nih.gov/books/NBK279394/" },
  { label: "Gray's Anatomy reference (Elsevier)", href: "https://www.elsevier.com/books/grays-anatomy/standring/978-0-7020-7705-0" },
  { label: "Foundational Model of Anatomy ontology", href: "http://si.washington.edu/projects/fma" },
  { label: "OpenStax Anatomy & Physiology", href: "https://openstax.org/details/books/anatomy-and-physiology-2e" },
];

export default function SomaPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav
        links={[
          { href: "/", label: "Home" },
          { href: "/platforms", label: "Platforms" },
          { href: "/platforms/salus", label: "Salus" },
        ]}
      />

      <section className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-4xl">
          <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-rose-300/90">
            Salus · Human Body Module
          </p>
          <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">
            Sapiens Scientia Soma
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            Soma is the model of the healthy human body inside Salus. Where Morbus
            maps disease, Soma maps the living structure it acts on — examined
            through three disciplines at once: anatomy (form), physiology
            (function), and histology (tissue fabric).
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
            {somaSystemCount} organ systems · 3 disciplinary lenses · couples to Morbus
          </p>
        </header>

        {/* Overview stats */}
        <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-white/15 py-5 text-sm uppercase tracking-[0.2em] text-slate-400">
          <span>{somaSystemCount} organ systems</span>
          <span>3 disciplinary lenses</span>
          <span>4 primary tissues</span>
          <span>6 levels of organization</span>
        </div>

        {/* Three disciplines */}
        <section className="flex flex-col gap-7">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Three Lenses on One Body
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Soma refuses to treat structure, function, and tissue as separate
              subjects. Every organ system is described through all three at once —
              the same way a body actually has to be understood.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {somaLenses.map((lens) => (
              <article
                key={lens.id}
                className="flex flex-col border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xl font-semibold leading-7 text-rose-100">
                    {lens.name}
                  </h3>
                  <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
                    {lens.latin}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-200">{lens.tagline}</p>
                <p className="mt-3 text-sm leading-6 text-slate-400">{lens.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Levels of organization */}
        <section className="flex flex-col gap-7 border-t border-rose-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Levels of Organization
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              The body is a nested hierarchy. Soma reads it from chemistry up to the
              whole organism — the same ladder of scale that threads through the rest
              of Sapiens Scientia.
            </p>
          </div>

          <ol className="grid gap-3">
            {somaLevels.map((level, index) => (
              <li
                key={level.level}
                className="flex flex-col gap-1 border-l-2 border-rose-300/30 bg-white/[0.02] py-3 pl-5 sm:flex-row sm:items-baseline sm:gap-5"
              >
                <span className="font-mono text-xs text-rose-300/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-[9rem] text-base font-semibold text-slate-100">
                  {level.level}
                </span>
                <span className="min-w-[12rem] font-mono text-xs uppercase tracking-wider text-slate-500">
                  {level.scale}
                </span>
                <span className="text-sm leading-6 text-slate-400">{level.detail}</span>
              </li>
            ))}
          </ol>
          <Link
            href="/scales"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-rose-200 transition-colors hover:text-rose-50"
          >
            See the full ladder of scale
            <span aria-hidden>→</span>
          </Link>
        </section>

        {/* Organ system explorer */}
        <section className="flex flex-col gap-7 border-t border-rose-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Organ System Explorer
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Pick a system, then switch lenses to see the same organs as structure,
              as function, and as tissue. Each system links out to the Morbus diseases
              that arise when it fails.
            </p>
          </div>

          <SomaExplorer />
        </section>

        {/* Four primary tissues */}
        <section className="flex flex-col gap-7 border-t border-rose-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              The Four Primary Tissues
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Histology resolves every organ into combinations of just four tissue
              types. They are the alphabet from which the whole body is spelled.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {somaTissues.map((tissue) => (
              <article
                key={tissue.id}
                className="flex flex-col border border-white/10 bg-white/[0.03] p-5"
              >
                <h3 className="text-xl font-semibold leading-7 text-rose-100">
                  {tissue.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{tissue.role}</p>
                <p className="mt-3 text-xs leading-6 text-slate-500">{tissue.marker}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tissue.examples.map((example) => (
                    <span
                      key={example}
                      className="border border-rose-200/10 bg-rose-200/[0.05] px-2.5 py-1 text-xs leading-5 text-slate-300"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Relationship to Morbus */}
        <section className="flex flex-col gap-5 border-t border-rose-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Soma and Morbus
            </h2>
          </div>
          <div className="grid gap-4 border border-emerald-200/10 bg-emerald-200/[0.035] p-5 text-sm leading-6 text-slate-300 md:grid-cols-[0.85fr_1.45fr]">
            <div>
              <h3 className="text-base font-semibold text-emerald-100">
                Independent, but coupled
              </h3>
              <p className="mt-2 text-slate-400">
                Soma is the healthy body; Morbus is its pathology. Each stands alone,
                and each links to the other.
              </p>
            </div>
            <p>
              A Morbus disease names a process by which a Soma system breaks down —
              heart failure against the cardiovascular system, IBD against the
              digestive tract, Alzheimer&apos;s against the nervous system. Reading
              the body and reading its diseases are two views of the same anatomy,
              physiology, and histology, kept as separate modules so neither has to
              inherit the other&apos;s structure.
            </p>
          </div>
          <Link
            href="/platforms/salus/morbus"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-emerald-200 transition-colors hover:text-emerald-50"
          >
            Explore the Morbus ontology
            <span aria-hidden>→</span>
          </Link>

          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs leading-5 text-slate-500">
            {somaSources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-rose-200"
              >
                {source.label}
              </a>
            ))}
          </div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
