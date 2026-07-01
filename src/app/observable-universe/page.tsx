import Link from "next/link";
import type { Metadata } from "next";
import { ObservableUniverseView } from "@/components/observable-universe-view";

export const metadata: Metadata = {
  title: "Observable Universe | Sapiens Scientia",
  description:
    "A compact graphic view of the observable universe, from Earth and the Milky Way to the cosmic horizon.",
};

export default function ObservableUniversePage() {
  return (
    <main className="relative min-h-screen bg-black">
      <Link
        href="/"
        className="fixed left-5 top-5 z-[140] inline-flex h-9 items-center border border-white/10 bg-black/48 px-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-md transition-colors hover:border-sky-200/35 hover:bg-black/60 hover:text-sky-100 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-200 sm:left-6 sm:top-6"
        aria-label="Return to the start of the Big Bang animation"
      >
        Big Bang
      </Link>
      <ObservableUniverseView />
    </main>
  );
}
