import Link from "next/link";
import type { Metadata } from "next";
import { MetaEarthExperience } from "@/components/meta-earth-experience";

export const metadata: Metadata = {
  title: "Meta Earth | Sapiens Scientia",
  description:
    "Meta Earth: the live sunlit Earth wrapped in its digital shell, with the Earth Systems, Digital Systems, and platform map.",
};

export default function MetaEarthPage() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <div className="fixed left-5 top-5 z-[160] flex flex-col items-start gap-2 sm:left-6 sm:top-6">
        <Link
          href="/"
          className="inline-flex h-9 items-center border border-cyan-200/30 bg-black/48 px-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-md transition-colors hover:border-cyan-100/60 hover:bg-black/60 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
        >
          The History of the Universe
        </Link>
        <Link
          href="/#end"
          className="inline-flex h-9 items-center border border-cyan-200/30 bg-black/48 px-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-md transition-colors hover:border-cyan-100/60 hover:bg-black/60 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
        >
          You Are Here
        </Link>
      </div>
      <MetaEarthExperience />
    </main>
  );
}
