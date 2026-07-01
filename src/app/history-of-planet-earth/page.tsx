import Link from "next/link";
import type { Metadata } from "next";
import { HomeGalaxyExperience } from "@/components/home-galaxy-experience";

export const metadata: Metadata = {
  title: "History of Planet Earth | Sapiens Scientia",
  description:
    "A galaxy-scale view of Earth's history in the Milky Way, linking deep time into Meta Earth.",
};

export default function HistoryOfPlanetEarthPage() {
  return (
    <main className="relative min-h-screen bg-black">
      <Link
        href="/observable-universe"
        className="fixed left-5 top-5 z-[140] inline-flex h-9 items-center border border-cyan-200/30 bg-black/48 px-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-md transition-colors hover:border-cyan-100/60 hover:bg-black/60 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 sm:left-6 sm:top-6"
      >
        Observable Universe
      </Link>
      <HomeGalaxyExperience />
    </main>
  );
}
