import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader, PageShell, Section } from "@/components/page-kit";
import { OntologyMap } from "@/components/ontology-map";
import { ontologyTiers } from "@/lib/ontology/earth-systems";
import { digitalSystemsDomain } from "@/lib/ontology/digital-systems";
import { platformList, platformDefinitions } from "@/lib/platform-couplings";

export const metadata: Metadata = {
  title: "The Map | Sapiens Scientia",
  description:
    "How it all fits together: reality as nested systems, read through three lenses — Persona, Societas, and Terra — with the great challenges of our time living in the couplings between them.",
};

const tierLensLabel: Record<string, string> = {
  persona: "Persona",
  societas: "Societas",
  terra: "Terra",
};

export default function OntologyPage() {
  return (
    <PageShell maxWidth="wide">
      <PageHeader
        eyebrow="Sapiens Scientia · The Map"
        title={
          <span className="bg-gradient-to-r from-sky-300 via-emerald-200 to-indigo-300 bg-clip-text text-transparent">
            How it all fits together
          </span>
        }
      >
        <p>
          Sapiens Scientia is one idea: the world is a single, nested system —
          from particles to the planet — and we understand it by reading it
          through a few complementary lenses. This page is the map of that idea,
          and of how its parts connect.
        </p>
      </PageHeader>

      <Section
        title="The three lenses"
        accent="#38bdf8"
        intro="Persona, Societas, and Terra are three ways of looking at the same world. The defining problems of our era are not contained by any single lens — they emerge in the couplings between them. Explore the diagram to see how."
      >
        <OntologyMap />
      </Section>

      <Section
        title="Reality is nested systems"
        accent="#34d399"
        intro="Zoom out from an atom and you find molecules, then cells, bodies, cities, nations, and finally the planet and the star that powers it — each system built from the ones below. Five tiers span twenty-nine orders of magnitude."
      >
        <ol className="flex flex-col gap-2">
          {ontologyTiers.map((tier) => (
            <li
              key={tier.id}
              className="grid items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-4 sm:grid-cols-[auto_10rem_1fr_auto]"
              style={{ borderLeft: `3px solid ${tier.color}` }}
            >
              <span
                className="font-mono text-xs uppercase tracking-[0.16em]"
                style={{ color: tier.color }}
              >
                {tier.ordinal}
              </span>
              <span className="text-base font-semibold text-white">
                {tier.name}
              </span>
              <span className="text-sm leading-6 text-slate-400">
                {tier.rangeLabel}
              </span>
              <span className="flex flex-wrap gap-1.5">
                {tier.platforms.map((id) => (
                  <span
                    key={id}
                    className="rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium"
                    style={{
                      color: platformDefinitions[id].color,
                      backgroundColor: `${platformDefinitions[id].color}1f`,
                    }}
                  >
                    {tierLensLabel[id]}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-slate-400">
          Climb every rung on{" "}
          <Link
            href="/scales"
            className="text-emerald-300 underline-offset-4 hover:underline"
          >
            the Ladder of Scale
          </Link>
          .
        </p>
      </Section>

      <Section
        title="Earth, lenses, and the digital halo"
        accent="#818cf8"
        intro="The lenses sit in the middle of a flow: they read the physical Earth, and they record what they learn into a growing halo of digital knowledge. Three domains, one continuous loop of understanding."
      >
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-stretch">
          <DomainColumn
            eyebrow="Physical Earth"
            accent="#34d399"
            title="The systems"
            items={ontologyTiers.map((tier) => tier.name)}
          />
          <Arrow />
          <DomainColumn
            eyebrow="The lenses"
            accent="#38bdf8"
            title="That read them"
            items={platformList.map((platform) => platform.shortName)}
          />
          <Arrow />
          <DomainColumn
            eyebrow="Digital Halo"
            accent="#a78bfa"
            title="Into knowledge"
            items={digitalSystemsDomain.map((node) => node.label)}
          />
        </div>
        <p className="text-sm text-slate-400">
          See the same bridge in motion on the{" "}
          <Link href="/" className="text-sky-300 underline-offset-4 hover:underline">
            homepage
          </Link>{" "}
          — a physical Earth linked to an orbiting digital halo.
        </p>
      </Section>
    </PageShell>
  );
}

function DomainColumn({
  eyebrow,
  accent,
  title,
  items,
}: {
  eyebrow: string;
  accent: string;
  title: string;
  items: string[];
}) {
  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-5"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <div>
        <p
          className="text-xs font-semibold uppercase tracking-[0.16em]"
          style={{ color: accent }}
        >
          {eyebrow}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-white">{title}</h3>
      </div>
      <ul className="flex flex-col gap-1.5 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span
              className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Arrow() {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center text-2xl text-slate-600 max-lg:rotate-90 max-lg:py-1"
    >
      →
    </div>
  );
}
