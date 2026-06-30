import { ChevronLeft } from "lucide-react";
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
        href="/?intro=skip"
        aria-label="Back to galaxy homepage"
        title="Back to galaxy homepage"
        className="fixed left-5 top-5 z-20 grid h-10 w-10 place-items-center rounded-full border border-white/12 bg-black/48 text-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-md transition-colors hover:border-cyan-200/45 hover:bg-black/64 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 sm:left-6 sm:top-6"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </Link>
      <ObservableUniverseView />
    </main>
  );
}
