"use client";

import { useEffect, useState } from "react";
import { EarthHero } from "@/components/earth-hero";
import { HomeOverview } from "@/components/home-overview";
import { SiteFooter } from "@/components/site-footer";

type Phase = "ready" | "animating" | "revealed";

export function HomeBigBangExperience() {
  const [phase, setPhase] = useState<Phase>("ready");

  useEffect(() => {
    if (phase !== "animating") {
      return;
    }

    const timer = window.setTimeout(() => setPhase("revealed"), 4300);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "revealed") {
      window.dispatchEvent(new Event("sapiens-home-revealed"));
    } else {
      window.dispatchEvent(new Event("sapiens-home-intro-start"));
    }
  }, [phase]);

  const begin = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setPhase(reduceMotion ? "revealed" : "animating");
  };
  const isRevealed = phase === "revealed";

  return (
    <main className="relative min-h-screen bg-black text-white">
      <div
        className={`transition-opacity duration-1000 ${
          isRevealed ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isRevealed}
      >
        <EarthHero />
        <HomeOverview />
        <div className="bg-black px-6 pb-24 text-white sm:px-10 sm:pb-28">
          <SiteFooter />
        </div>
      </div>

      {!isRevealed ? (
        <section
          className={`big-bang-gate fixed inset-0 z-[80] flex min-h-screen items-center justify-center overflow-hidden bg-black text-white ${
            phase === "animating" ? "big-bang-gate--active" : ""
          }`}
          aria-label="Big Bang introduction"
        >
          <div className="big-bang-stars" aria-hidden />
          <div className="big-bang-pulse" aria-hidden />
          <div className="big-bang-rings" aria-hidden />
          <div className="big-bang-present" aria-hidden />

          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            {phase === "ready" ? (
              <button
                type="button"
                onClick={begin}
                className="border border-sky-200/35 bg-white/[0.035] px-7 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-sky-100 shadow-[0_0_44px_rgba(56,189,248,0.16)] backdrop-blur-md transition-all hover:border-sky-100/70 hover:bg-sky-200/10 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-200"
              >
                Initiate Big Bang
              </button>
            ) : (
              <div className="big-bang-readout" aria-live="polite">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
                  Big Bang
                </p>
                <p className="mt-4 text-5xl font-semibold tracking-normal text-white sm:text-7xl">
                  13.8 billion years
                </p>
                <p className="mt-4 text-sm font-medium uppercase tracking-[0.22em] text-slate-300">
                  Cosmos. Earth. Life. Mind. Sapiens.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
