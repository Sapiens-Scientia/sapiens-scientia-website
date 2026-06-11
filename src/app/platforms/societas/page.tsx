import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Societas | Sapiens Scientia",
  description:
    "Sapiens Scientia Societas: the human society platform for culture, institutions, governance, economics, technology, and cooperation.",
};

const civilizationalSignals = [
  {
    value: "8.2B",
    label: "people alive",
    detail:
      "Humanity reached about 8.2 billion in 2024 and is projected to peak near 10.3 billion in the mid-2080s before slowly declining.",
    source: "UN",
  },
  {
    value: "$118T",
    label: "world output",
    detail:
      "Global GDP reached roughly $118 trillion in current dollars in 2024 — concentrated in a handful of economies and unevenly shared.",
    source: "IMF",
  },
  {
    value: "5.5B",
    label: "people online",
    detail:
      "About 5.5 billion people — 68% of humanity — used the internet in 2024, while 2.6 billion, mostly rural and low-income, remained offline.",
    source: "ITU",
  },
  {
    value: "817M",
    label: "in extreme poverty",
    detail:
      "Under the World Bank's updated $3.00-a-day line, about 817 million people lived in extreme poverty in 2024; the share is projected near 9.9% in 2025.",
    source: "World Bank",
  },
  {
    value: "72%",
    label: "live under autocratization",
    detail:
      "By 2024, 72% of the world population lived in autocratizing or autocratic states, and autocracies outnumbered democracies for the first time in over two decades.",
    source: "V-Dem",
  },
  {
    value: "123M",
    label: "forcibly displaced",
    detail:
      "Forced displacement reached 123 million by the end of 2024 — about one in every 67 people — a twelfth consecutive annual increase.",
    source: "UNHCR",
  },
];

const societasDomains = [
  {
    name: "Institutions and governance",
    detail:
      "States, law, bureaucracies, and the formal and informal rules that coordinate collective action.",
  },
  {
    name: "Economics and exchange",
    detail:
      "Production, markets, labor, finance, and the distribution of material resources across populations.",
  },
  {
    name: "Technology and tools",
    detail:
      "The accumulating stock of techniques and machines that extends human capability and reshapes society.",
  },
  {
    name: "Communication and media",
    detail:
      "Language, writing, networks, and platforms through which information and meaning circulate.",
  },
  {
    name: "Education and knowledge",
    detail:
      "The transmission of skills, norms, and understanding across generations and institutions.",
  },
  {
    name: "Cooperation and conflict",
    detail:
      "Alliances, trust, violence, and displacement — the dynamics that bind groups together or tear them apart.",
  },
];

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

const societasSources = [
  {
    label: "UN — World Population Prospects 2024",
    href: "https://population.un.org/wpp/",
  },
  {
    label: "IMF — World Economic Outlook",
    href: "https://www.imf.org/en/publications/weo",
  },
  {
    label: "ITU — Facts and Figures 2024",
    href: "https://www.itu.int/itu-d/reports/statistics/2024/11/10/ff24-internet-use/",
  },
  {
    label: "World Bank — Poverty and Inequality",
    href: "https://www.worldbank.org/en/topic/poverty",
  },
  {
    label: "V-Dem — Democracy Report 2025",
    href: "https://www.v-dem.net/publications/democracy-reports/",
  },
  {
    label: "UNHCR — Global Trends 2024",
    href: "https://www.unhcr.org/global-trends-report-2024",
  },
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
        </header>

        <section className="flex flex-col gap-7">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Society as a Complex Adaptive System
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Societas treats human society as emergent, historical, symbolic,
              and materially constrained — not a machine to be optimized, but a
              system that adapts. Its structures arise from countless local
              interactions and feed back on the people who make them.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {societasDomains.map((domain) => (
              <article
                key={domain.name}
                className="flex flex-col gap-2 border border-amber-200/15 bg-white/[0.025] p-4"
              >
                <h3 className="text-base font-semibold text-slate-50">
                  {domain.name}
                </h3>
                <p className="text-sm leading-6 text-slate-400">
                  {domain.detail}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-7 border-t border-amber-200/15 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Civilizational Signals
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              A few population-scale indicators trace where human society stands:
              still growing and rapidly connecting, but with persistent poverty,
              eroding democratic governance, and record forced displacement.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {civilizationalSignals.map((signal) => (
              <article
                key={signal.label}
                className="border border-white/10 bg-white/[0.035] p-5 shadow-[0_0_28px_rgba(15,23,42,0.22)]"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-4xl font-semibold tracking-normal text-white">
                    {signal.value}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-amber-200/70">
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
            {societasSources.map((source) => (
              <a
                key={source.href}
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-amber-200"
              >
                {source.label}
              </a>
            ))}
          </div>
        </section>

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
    </main>
  );
}
