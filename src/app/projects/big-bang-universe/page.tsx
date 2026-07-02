import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Big Bang Universe | Sapiens Scientia",
  description:
    "An animated Sapiens Scientia view of 13.8 billion years of cosmic history, from the Big Bang to the present universe.",
};

export default function BigBangUniversePage() {
  return (
    <main className="flex min-h-screen flex-col bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav
        links={[
          { href: "/", label: "Home" },
          { href: "/projects", label: "Projects" },
          { href: "/chronos", label: "Chronos" },
        ]}
      />

      <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
          <div>
            <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-blue-400">
              Sapiens Scientia
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-normal sm:text-7xl">
              Big Bang Universe
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              A cosmic-history instrument for moving from the Planck epoch through
              recombination, galaxy formation, dark-energy acceleration, and the
              present observable universe.
            </p>
          </div>

          <div className="grid grid-cols-3 border-y border-white/15 py-4 text-sm uppercase tracking-[0.16em] text-slate-400 lg:grid-cols-1 lg:gap-4 lg:border lg:bg-white/[0.025] lg:p-5">
            <div>
              <p className="text-2xl font-semibold tracking-normal text-white">13.8B</p>
              <p className="mt-1 text-[0.68rem] leading-4">years</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-normal text-white">15</p>
              <p className="mt-1 text-[0.68rem] leading-4">milestones</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-normal text-white">93B ly</p>
              <p className="mt-1 text-[0.68rem] leading-4">observable span</p>
            </div>
          </div>
        </header>

        <section
          aria-label="Interactive Big Bang Universe diagram"
          className="relative min-h-[680px] overflow-hidden border border-white/10 bg-black shadow-[0_0_44px_rgba(15,23,42,0.45)] lg:h-[min(76vh,900px)]"
        >
          <iframe
            src="/standalone/big-bang-universe/index.html?embedded=1"
            title="Interactive Big Bang Universe diagram"
            className="absolute inset-0 block h-full w-full border-0"
          />
        </section>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-5 text-sm leading-6 text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Timeline positions are displayed on a logarithmic deep-time axis with
            milestone spacing adjusted for readability.
          </p>
          <Link
            href="/observable-universe"
            className="shrink-0 text-sm font-medium uppercase tracking-[0.16em] text-blue-300 underline-offset-4 hover:text-white hover:underline"
          >
            Continue to Observable Universe
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
