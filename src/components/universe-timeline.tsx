"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const milestones = [
  { label: "Big Bang", age: "13.8 Gyr", color: "#f59e0b" },
  { label: "First Stars", age: "13.4 Gyr", color: "#fbbf24" },
  { label: "Earth Forms", age: "4.54 Gyr", color: "#22d3ee" },
  { label: "First Life", age: "3.7 Gyr", color: "#34d399" },
  { label: "Animals", age: "540 Myr", color: "#a78bfa" },
  { label: "Homo Sapiens", age: "300k yr", color: "#38bdf8" },
  { label: "Agriculture", age: "12k yr", color: "#818cf8" },
  { label: "Knowledge Age", age: "now", color: "#ec4899" },
];

export function UniverseTimeline() {
  const pathname = usePathname();
  const [hasHomeRevealed, setHasHomeRevealed] = useState(false);
  const isHomeIntroActive = pathname === "/" && !hasHomeRevealed;

  useEffect(() => {
    const onHomeIntroStart = () => setHasHomeRevealed(false);
    const onHomeReveal = () => setHasHomeRevealed(true);
    window.addEventListener("sapiens-home-intro-start", onHomeIntroStart);
    window.addEventListener("sapiens-home-revealed", onHomeReveal);
    return () => {
      window.removeEventListener("sapiens-home-intro-start", onHomeIntroStart);
      window.removeEventListener("sapiens-home-revealed", onHomeReveal);
    };
  }, []);

  return (
    <aside
      aria-label="Universe timeline"
      aria-hidden={isHomeIntroActive}
      className={`universe-timeline pointer-events-none fixed inset-x-0 bottom-0 z-[110] px-2 pb-2 transition-opacity duration-500 sm:px-4 sm:pb-3 ${
        isHomeIntroActive ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-auto mx-auto max-w-7xl border border-white/10 bg-black/58 p-1.5 text-white shadow-[0_-14px_42px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-2">
        <div className="mb-1 flex items-center justify-between gap-3 px-1">
          <Link
            href="/chronos"
            tabIndex={isHomeIntroActive ? -1 : undefined}
            className="text-[0.56rem] font-semibold uppercase tracking-[0.2em] text-sky-200 transition-colors hover:text-sky-50 sm:text-[0.62rem]"
          >
            Universe Timeline
          </Link>
          <span className="hidden text-[0.56rem] font-medium uppercase tracking-[0.16em] text-slate-500 sm:block">
            Big Bang to present
          </span>
        </div>

        <div className="scrollbar-hidden overflow-x-auto">
          <div className="min-w-[48rem]">
            <div className="grid grid-cols-8 overflow-hidden border border-white/10 bg-white/[0.025]">
              {milestones.map((milestone) => (
                <Link
                  key={milestone.label}
                  href="/chronos"
                  tabIndex={isHomeIntroActive ? -1 : undefined}
                  className="group min-h-8 border-r border-black/35 px-2 py-1.5 last:border-r-0 sm:min-h-9"
                  style={{
                    background: `linear-gradient(135deg, ${milestone.color}e6, ${milestone.color}82)`,
                  }}
                >
                  <span className="block truncate text-[0.56rem] font-bold uppercase tracking-[0.1em] text-black/85 group-hover:text-black sm:text-[0.62rem]">
                    {milestone.label}
                  </span>
                  <span className="block text-[0.54rem] font-medium text-black/62 sm:text-[0.58rem]">
                    {milestone.age}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
