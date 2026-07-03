"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CosmicObjectHierarchy } from "@/components/cosmic-object-hierarchy";

export function ObservableUniverseView() {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white"
      aria-label="Observable universe alternate view"
    >
      <CosmicObjectHierarchy />

      <div className="pointer-events-none absolute left-1/2 top-20 z-10 w-[min(34rem,calc(100vw-2.5rem))] -translate-x-1/2 text-center sm:top-5">
        <h1 className="text-balance text-2xl font-semibold leading-none tracking-normal text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.65)] sm:text-4xl">
          <span>Observable Universe</span>
          <br />
          <span className="mt-1 inline-block text-lg font-medium text-slate-400 sm:text-2xl">
            93 Billion Light Years Diameter
          </span>
        </h1>
      </div>

      <figure className="relative mt-12 flex h-[min(78vh,84vw)] w-[min(78vh,84vw)] items-center justify-center sm:mt-10">
        <Image
          src="/images/observable-universe-logarithmic-illustration.png"
          alt="Logarithmic illustration of the observable universe, centered on the Solar System and expanding outward through nearby stars, the Milky Way, galaxies, cosmic web, cosmic microwave background, and Big Bang plasma."
          width={1920}
          height={1920}
          priority
          onLoad={() => setImageLoaded(true)}
          className={`h-full w-full object-contain drop-shadow-[0_0_42px_rgba(186,230,253,0.2)] transition-opacity duration-[4000ms] ease-out ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        <div className="pointer-events-none absolute left-1/2 top-[13.1%] z-10 -translate-x-1/2 text-center text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/90 drop-shadow-[0_0_12px_rgba(56,189,248,0.75)] sm:text-sm">
          Milky Way Galaxy
        </div>
        <div className="pointer-events-none absolute left-1/2 top-[calc(50%-8.9rem)] z-10 -translate-x-1/2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-cyan-100/85 drop-shadow-[0_0_12px_rgba(56,189,248,0.7)] sm:text-[0.68rem]">
          Solar System
        </div>
        <Link
          href="/history-of-planet-earth"
          aria-label="Zoom into the History of Planet Earth in the Milky Way"
          title="Zoom into the History of Planet Earth"
          className="cosmic-hotspot left-1/2 top-1/2 z-10 h-28 w-28 -translate-x-1/2 -translate-y-1/2 sm:h-32 sm:w-32"
        >
          <span className="cosmic-hotspot__label">Solar System</span>
        </Link>
        <figcaption className="absolute -bottom-7 left-1/2 w-[min(36rem,calc(100vw-3rem))] -translate-x-1/2 text-center text-[0.62rem] font-medium leading-4 text-slate-500">
          Image by{" "}
          <a
            href="https://commons.wikimedia.org/wiki/File:Observable_universe_logarithmic_illustration.png"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 underline-offset-4 transition-colors hover:text-sky-200 hover:underline"
          >
            Pablo Carlos Budassi
          </a>
          , licensed{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 underline-offset-4 transition-colors hover:text-sky-200 hover:underline"
          >
            CC BY-SA 3.0
          </a>
          .
        </figcaption>
      </figure>
    </section>
  );
}
