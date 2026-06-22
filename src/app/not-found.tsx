import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageShell, Section } from "@/components/page-kit";

export const metadata: Metadata = {
  title: "Page not found · Sapiens Scientia",
  description:
    "This route isn't on the map. Jump back to the platforms, scales, time, and vital signs of the Sapiens Scientia knowledge project.",
};

// Key destinations to recover toward, spanning each interpretive lens so a
// lost visitor lands somewhere meaningful rather than just "go home".
const destinations: { href: string; label: string; detail: string; accent: string }[] = [
  {
    href: "/platforms",
    label: "Platforms",
    detail: "Persona, Societas, and Terra — the three lenses on a coupled world.",
    accent: "#60a5fa",
  },
  {
    href: "/scales",
    label: "The Ladder of Scale",
    detail: "Climb 29 orders of magnitude, from elementary particles to the Sun.",
    accent: "#34d399",
  },
  {
    href: "/chronos",
    label: "The Arc of Time",
    detail: "Deep time, from the first second to the far future.",
    accent: "#818cf8",
  },
  {
    href: "/vitals",
    label: "Planetary Vital Signs",
    detail: "Live readings on temperature, carbon, population, and economy.",
    accent: "#fbbf24",
  },
];

export default function NotFound() {
  return (
    <PageShell maxWidth="wide">
      <PageHeader
        eyebrow="Error 404 · Off the map"
        title={
          <span className="bg-gradient-to-r from-sky-300 via-emerald-200 to-indigo-300 bg-clip-text text-transparent">
            This page isn&rsquo;t on the map
          </span>
        }
      >
        <p>
          The route you followed doesn&rsquo;t correspond to anything in the
          Sapiens Scientia knowledge graph — it may have moved, or never
          existed. Every real destination is one step away below.
        </p>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
          Lost between cells and the cosmos
        </p>
      </PageHeader>

      <Section title="Find your way back" accent="#38bdf8">
        <div className="grid gap-3 sm:grid-cols-2">
          {destinations.map((destination) => (
            <Link
              key={destination.href}
              href={destination.href}
              className="group border border-white/10 bg-white/[0.035] p-5 shadow-[0_0_28px_rgba(15,23,42,0.22)] transition-colors hover:bg-white/[0.06]"
              style={{ borderColor: `${destination.accent}26` }}
            >
              <p
                className="text-lg font-semibold tracking-normal text-white"
                style={{ color: destination.accent }}
              >
                {destination.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                {destination.detail}
              </p>
            </Link>
          ))}
        </div>

        <p className="text-sm text-slate-400">
          Or return to the{" "}
          <Link href="/" className="text-sky-300 underline-offset-4 hover:underline">
            homepage
          </Link>
          .
        </p>
      </Section>
    </PageShell>
  );
}
