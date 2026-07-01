"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HomeGalaxyExperience } from "@/components/home-galaxy-experience";
import { ObservableUniverseView } from "@/components/observable-universe-view";

type Phase = "ready" | "animating" | "revealed";

const BIG_BANG_ANIMATION_MS = 8600;
const UNIVERSE_AGE_BILLIONS = 13.8;
const timelineMilestones = [
  "Big Bang",
  "First Stars",
  "Milky Way Galaxy Forms",
  "Earth Forms",
  "First Life",
  "Animals",
  "Homo Sapiens",
  "Agriculture",
  "Knowledge Age",
];

function formatUniverseAgeValue(ageInBillions: number) {
  return ageInBillions.toFixed(1);
}

type HomeBigBangExperienceProps = {
  skipIntro?: boolean;
};

export function HomeBigBangExperience({ skipIntro = false }: HomeBigBangExperienceProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(() => (skipIntro ? "revealed" : "ready"));
  const [ageInBillions, setAgeInBillions] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (!skipIntro) {
      return;
    }

    window.history.replaceState(null, "", "/");
  }, [skipIntro]);

  useEffect(() => {
    if (phase !== "animating") {
      return;
    }

    const timer = window.setTimeout(() => setPhase("revealed"), BIG_BANG_ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "animating") {
      return;
    }

    let animationFrame = 0;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / BIG_BANG_ANIMATION_MS, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(progress);
      setAgeInBillions(easedProgress * UNIVERSE_AGE_BILLIONS);

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [phase]);

  useEffect(() => {
    if (phase === "revealed") {
      window.dispatchEvent(new Event("sapiens-home-revealed"));
    } else {
      window.dispatchEvent(new Event("sapiens-home-intro-start"));
    }
  }, [phase]);

  useEffect(() => {
    if (skipIntro || phase !== "revealed") {
      return;
    }

    router.replace("/observable-universe");
  }, [phase, router, skipIntro]);

  const begin = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAgeInBillions(0);
    setAnimationProgress(0);
    setPhase(reduceMotion ? "revealed" : "animating");
  };
  const isRevealed = phase === "revealed";
  const activeMilestoneLabel =
    timelineMilestones[
      Math.min(
        Math.floor(animationProgress * timelineMilestones.length),
        timelineMilestones.length - 1,
      )
    ];

  return (
    <main className="relative min-h-screen bg-black text-white">
      <div
        className={`transition-opacity duration-1000 ${
          isRevealed ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden={!isRevealed}
      >
        {skipIntro ? <HomeGalaxyExperience /> : <ObservableUniverseView />}
      </div>

      {isRevealed && skipIntro ? (
        <div className="fixed left-5 top-5 z-[140] flex items-center gap-2 sm:left-6 sm:top-6">
          <Link
            href="/observable-universe"
            className="inline-flex h-9 items-center border border-cyan-200/30 bg-black/48 px-3.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-md transition-colors hover:border-cyan-100/60 hover:bg-black/60 hover:text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
          >
            Observable Universe
          </Link>
        </div>
      ) : null}

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
                aria-label="Initiate Big Bang"
                className="quiet-singularity"
              >
                <span className="quiet-singularity__core" aria-hidden />
              </button>
            ) : (
              <div className="big-bang-readout" aria-live="polite">
                <p className="text-center text-6xl font-semibold leading-none tracking-normal text-white sm:text-8xl">
                  {formatUniverseAgeValue(ageInBillions)}
                </p>
                <p className="mt-3 text-center text-sm font-semibold uppercase tracking-[0.24em] text-slate-300 sm:text-base">
                  Billion Years
                </p>
                <p
                  key={activeMilestoneLabel}
                  className="big-bang-milestone mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-sky-100 sm:text-base"
                >
                  {activeMilestoneLabel}
                </p>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </main>
  );
}
