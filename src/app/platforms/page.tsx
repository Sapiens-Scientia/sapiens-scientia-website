import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PlatformsExplorer } from "@/components/platforms-explorer";
import { CrossPlatformSimulator } from "@/components/cross-platform-simulator";

export const metadata: Metadata = {
  title: "Platforms | Sapiens Scientia",
  description:
    "The Sapiens Scientia platform triad: Salus for health, Societas for society, and Terra for Earth systems.",
};

export default function PlatformsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav />

      <section className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-4xl">
          <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-blue-400">
            Sapiens Scientia · Architecture
          </p>
          <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">
            Cross-Platform Systems Map
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            Sapiens Scientia is organized as a triad of human-centered platforms —
            Salus, Societas, and Terra. The platforms are deliberately not silos:
            many of the most important questions are cross-cutting, living in the
            couplings between health, society, and Earth.
          </p>
        </header>

        <CrossPlatformSimulator />

        <PlatformsExplorer />

        <section className="flex flex-col gap-4 border-t border-white/10 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Bridge Model
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              On the homepage, the Human Platforms sit as the interpretive bridge
              between Earth Systems and Digital Systems. The platforms are not
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

