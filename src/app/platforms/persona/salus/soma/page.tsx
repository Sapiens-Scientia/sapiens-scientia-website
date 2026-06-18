import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { SomaExplorer } from "@/components/soma-explorer";
import { SomaBodyFigure } from "@/components/soma-body-figure";
import {
  somaLenses,
  somaLevels,
  somaSystemCount,
  somaTissues,
} from "@/lib/soma";

export const metadata: Metadata = {
  title: "Soma | Sapiens Scientia",
  description:
    "Sapiens Scientia Soma: the human body module inside Persona — anatomy, physiology, and histology of the body's organ systems.",
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
          { href: "/platforms/persona", label: "Persona" },
          { href: "/platforms/persona/salus", label: "Salus" },
          { href: "/platforms/persona/salus/soma", label: "Soma" },
        ]}
      />

      <section className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-4xl">
          <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-rose-300/90">
            Persona · Human Body Module
          </p>
          <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">
            Soma
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            Soma is the model of the healthy human body inside Persona. Where Morbus
            maps disease, Soma maps the living structure it acts on — examined
            through three disciplines at once: anatomy (form), physiology
            (function), and histology (tissue fabric).
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
            {somaSystemCount} organ systems · 3 disciplinary lenses · couples to Morbus
          </p>
        </header>

        <div className="relative flex justify-center overflow-hidden rounded-lg border border-rose-200/15 bg-gradient-to-b from-rose-500/[0.04] to-transparent p-4 sm:p-6">
          <SomaBodyFigure className="h-[clamp(20rem,42vw,32rem)] w-full max-w-[42rem]" />
        </div>

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
        <section className="flex flex-col gap-8 border-t border-rose-200/15 pt-10">
          <div className="max-w-4xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Human Disease
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              The healthy physical structures mapped by <strong>Soma</strong> break down under pathological states. 
              Rather than treating diseases as monolithic, single-cause entities, the <strong>Morbus</strong> ontology 
              analyzes them across a multiaxial system of 9 coupled dimensions of human failure.
            </p>
          </div>


          {/* Classification Groups Grid */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-slate-300">Classification Classes</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="border border-white/5 bg-emerald-500/[0.01] p-4 rounded-lg hover:bg-emerald-500/[0.02] transition-all">
                <h4 className="text-sm font-semibold text-emerald-300">Primary Etiologic</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Pathology organized around a relatively clear initiating cause, such as physical injury, genetic mutation, or infection.
                </p>
              </div>
              <div className="border border-white/5 bg-sky-500/[0.01] p-4 rounded-lg hover:bg-sky-500/[0.02] transition-all">
                <h4 className="text-sm font-semibold text-sky-300">Secondary Physiological</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Emergent failures of physiological systems, representing dysregulation of feedback loops, metabolism, or tissue integrity.
                </p>
              </div>
              <div className="border border-white/5 bg-purple-500/[0.01] p-4 rounded-lg hover:bg-purple-500/[0.02] transition-all">
                <h4 className="text-sm font-semibold text-purple-300">Hybrid / Multiaxial</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Complex, multi-system disorders (e.g. autoimmune, cancer, neurodegeneration) requiring simultaneous analysis of multiple axes.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-2 border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-black to-black p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.06)] relative overflow-hidden group">
            {/* Visual glow accent */}
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-all duration-500 pointer-events-none" />
            
            <div className="max-w-xl relative z-10">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                Ontology Explorer
              </span>
              <h3 className="text-xl font-bold tracking-tight text-emerald-200 mt-3">Morbus (Disease)</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Explore the detailed multiaxial disease database: etiology, failure modes, axis matrices, and classification crosswalks.
              </p>
            </div>
            <Link
              href="/platforms/persona/salus/soma/morbus"
              className="relative z-10 inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition-all duration-300 hover:bg-emerald-500 hover:text-white hover:scale-[1.02] shadow-md hover:shadow-emerald-500/20"
            >
              Open Morbus Explorer →
            </Link>
          </div>

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
