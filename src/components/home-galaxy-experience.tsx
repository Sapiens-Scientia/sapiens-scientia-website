"use client";

import Link from "next/link";
import { HomeGalaxyView } from "@/components/home-galaxy-view";

export function HomeGalaxyExperience() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <HomeGalaxyView />
      </div>

      <div className="pointer-events-none absolute left-1/2 top-5 z-[125] w-[min(34rem,calc(100vw-22rem))] -translate-x-1/2 text-center max-lg:top-20 max-lg:w-[min(34rem,calc(100vw-2.5rem))]">
        <h1 className="text-balance text-2xl font-semibold leading-none tracking-normal text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.65)] sm:text-4xl">
          <span>History of Planet Earth</span>
          <br />
          <span className="mt-1 inline-block text-lg font-medium text-slate-400 sm:text-2xl">
            In the Milky Way Galaxy
          </span>
        </h1>
      </div>

      <div className="pointer-events-none absolute right-5 top-5 z-[130] flex max-w-[min(28rem,calc(100vw-2.5rem))] flex-col items-end gap-3 sm:right-6 sm:top-6">
        <Link
          href="/meta-earth"
          className="pointer-events-auto w-fit border border-sky-200/30 bg-black/58 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-100 shadow-[0_16px_36px_rgba(0,0,0,0.3)] backdrop-blur-md transition-colors hover:border-sky-100/60 hover:bg-black/72 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-200"
        >
          Enter Meta Earth
        </Link>
      </div>
    </section>
  );
}
