import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PlatformsExplorer } from "@/components/platforms-explorer";
import { CrossPlatformSimulator } from "@/components/cross-platform-simulator";

export const metadata: Metadata = {
  title: "Platforms | Sapiens Scientia",
  description:
    "The Sapiens Platforms: Persona for human embodiment and health, Societas for society and cooperation, and Terra for Earth systems — with a coupled scenario simulator and cross-cutting coupling map.",
};

const platformsList = [
  {
    id: "persona",
    title: "Persona",
    subtitle: "Human & Intimate Scale",
    color: "text-sky-400 border-sky-400/20 bg-sky-400/[0.02] hover:bg-sky-400/[0.05] hover:border-sky-400/35",
    description: "Studies the human person as an embodied, vulnerable, home-dwelling, health-seeking, and disease-susceptible organism.",
    modules: ["Salus (Health)", "Domus (Home)"],
    href: "/platforms/persona",
  },
  {
    id: "societas",
    title: "Societas",
    subtitle: "Collective & Institutional Scale",
    color: "text-indigo-400 border-indigo-400/20 bg-indigo-400/[0.02] hover:bg-indigo-400/[0.05] hover:border-indigo-400/35",
    description: "Studies human society as a complex system: culture, governance, economics, technology, and cooperation.",
    modules: ["Institutions", "Governance", "Economics", "Social Systems"],
    href: "/platforms/societas",
  },
  {
    id: "terra",
    title: "Terra",
    subtitle: "Planetary & Ecological Scale",
    color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/[0.02] hover:bg-emerald-400/[0.05] hover:border-emerald-400/35",
    description: "Studies Earth systems: climate, oceans, atmosphere, biosphere, energy flows, and planetary boundaries.",
    modules: ["Planetary Boundaries", "Climate System", "Ecosystems", "Energy Systems"],
    href: "/platforms/terra",
  },
];

export default function PlatformsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav />

      <section id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-14">
        <header className="max-w-4xl">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.16em] text-blue-400">
            Sapiens Scientia · Architecture
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl sm:whitespace-nowrap">
            Platforms
          </h1>

          <p className="mt-8 max-w-3xl text-lg leading-8 text-slate-300">
            Sapiens Scientia is organized around three interpretive platforms that read the physical Earth and Digital systems.
            Rather than separate disciplines, they act as coupled lenses on one interconnected world — mapping human life
            from cells, to households, to global economies, and finally to the planet itself.
          </p>
        </header>

        {/* Platforms Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          {platformsList.map((platform) => (
            <Link
              key={platform.id}
              href={platform.href}
              className={`border p-6 flex flex-col justify-between transition-all duration-300 ${platform.color}`}
            >
              <div>
                <p className="text-xs font-mono uppercase tracking-wider opacity-60">{platform.subtitle}</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">{platform.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  {platform.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {platform.modules.map((m) => (
                    <span
                      key={m}
                      className="border border-white/5 bg-white/[0.03] px-2 py-0.5 text-[0.68rem] font-mono text-slate-400"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-8 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider">
                <span>Explore {platform.title}</span>
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </section>

        {/* Cross-Platform Dynamics */}
        <section className="flex flex-col gap-8 border-t border-white/10 pt-12">
          <div>
            <span className="text-[0.62rem] font-bold uppercase tracking-widest text-blue-400">
              Systemic Feedbacks
            </span>
            <h2 className="mt-1 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Cross-Platform Dynamics
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
              The platforms are deliberately not silos. The most critical challenges of our time
              do not reside within a single domain, but in the feedbacks between them: how climate change (Terra)
              affects public health (Persona) and triggers institutional changes (Societas).
            </p>
          </div>

          <CrossPlatformSimulator />

          <PlatformsExplorer />
        </section>

        {/* Bridge Model */}
        <section className="flex flex-col gap-4 border-t border-white/10 pt-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              The Bridge Model
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              On the homepage, the Sapiens Platforms sit as the interpretive bridge
              between Earth Systems (Physical Earth) and Digital Systems (Digital Halo). The platforms are not
              separate from the planet they study or the digital knowledge that
              represents it — they mediate between lived planetary reality and
              organized understanding.
            </p>
            <Link
              href="/scales"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-sky-200 transition-colors hover:text-sky-50"
            >
              Climb the full ladder of scale
              <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
