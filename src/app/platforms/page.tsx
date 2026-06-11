import Link from "next/link";

type PlatformId = "salus" | "societas" | "terra";

const platforms: {
  id: PlatformId;
  name: string;
  short: string;
  domain: string;
  href: string;
  color: string;
}[] = [
  {
    id: "salus",
    name: "Sapiens Scientia Salus",
    short: "Salus",
    domain: "Health, biology, medicine",
    href: "/platforms/salus",
    color: "#38bdf8",
  },
  {
    id: "societas",
    name: "Sapiens Scientia Societas",
    short: "Societas",
    domain: "Society, culture, institutions",
    href: "/platforms/societas",
    color: "#818cf8",
  },
  {
    id: "terra",
    name: "Sapiens Scientia Terra",
    short: "Terra",
    domain: "Earth systems, ecology, environment",
    href: "/platforms/terra",
    color: "#34d399",
  },
];

// Cross-cutting couplings from docs/PLATFORM_ARCHITECTURE.md — the questions that
// refuse to stay inside a single platform.
const couplings: { name: string; links: PlatformId[]; detail: string }[] = [
  {
    name: "Public health",
    links: ["salus", "societas"],
    detail:
      "Disease spread, care access, and population health sit between bodies and institutions.",
  },
  {
    name: "Climate medicine",
    links: ["salus", "terra"],
    detail:
      "Heat, air quality, and shifting disease ranges tie human health to Earth systems.",
  },
  {
    name: "Energy systems",
    links: ["terra", "societas"],
    detail:
      "How societies power themselves drives both economies and planetary boundaries.",
  },
  {
    name: "Food systems",
    links: ["salus", "societas", "terra"],
    detail:
      "Nutrition, agriculture, and land use couple health, society, and environment at once.",
  },
  {
    name: "Urbanization",
    links: ["salus", "societas", "terra"],
    detail:
      "Cities concentrate people, reshape institutions, and transform local ecosystems.",
  },
  {
    name: "Disease ecology",
    links: ["salus", "societas", "terra"],
    detail:
      "Pathogens move through human, social, and environmental systems together.",
  },
];

const colorOf: Record<PlatformId, string> = {
  salus: "#38bdf8",
  societas: "#818cf8",
  terra: "#34d399",
};

const shortOf: Record<PlatformId, string> = {
  salus: "Salus",
  societas: "Societas",
  terra: "Terra",
};

function SystemsMap() {
  // Triangle layout: Salus top, Societas lower-left, Terra lower-right; a central
  // hub holds the couplings that touch all three platforms.
  const nodes: Record<PlatformId, { cx: number; cy: number }> = {
    salus: { cx: 410, cy: 120 },
    societas: { cx: 160, cy: 440 },
    terra: { cx: 660, cy: 440 },
  };
  const hub = { cx: 410, cy: 300 };

  return (
    <svg
      viewBox="0 0 820 560"
      className="h-auto w-full"
      role="img"
      aria-label="Systems map of the three Sapiens Scientia platforms — Salus, Societas, and Terra — connected by cross-cutting couplings"
    >
      <title>Cross-platform systems map</title>
      <desc>
        Salus, Societas, and Terra are linked pairwise by public health, climate
        medicine, and energy systems, and jointly by food systems, urbanization,
        and disease ecology.
      </desc>

      {/* Dashed connectors from the all-three hub to each platform */}
      {(Object.keys(nodes) as PlatformId[]).map((id) => (
        <line
          key={`hub-${id}`}
          x1={hub.cx}
          y1={hub.cy}
          x2={nodes[id].cx}
          y2={nodes[id].cy}
          stroke="#475569"
          strokeWidth={1.25}
          strokeDasharray="3 5"
          opacity={0.7}
        />
      ))}

      {/* Pairwise coupling arcs, bowed outward to clear the hub */}
      <path d="M410 120 Q180 250 160 440" fill="none" stroke="#64748b" strokeWidth={1.5} opacity={0.55} />
      <path d="M410 120 Q640 250 660 440" fill="none" stroke="#64748b" strokeWidth={1.5} opacity={0.55} />
      <path d="M160 440 Q410 540 660 440" fill="none" stroke="#64748b" strokeWidth={1.5} opacity={0.55} />

      {/* Pairwise coupling labels at the arc apexes */}
      {[
        { x: 205, y: 250, text: "Public health" },
        { x: 615, y: 250, text: "Climate medicine" },
        { x: 410, y: 506, text: "Energy systems" },
      ].map((l) => (
        <g key={l.text}>
          <rect
            x={l.x - l.text.length * 3.6 - 8}
            y={l.y - 13}
            width={l.text.length * 7.2 + 16}
            height={20}
            rx={3}
            fill="#04060c"
            stroke="#1e293b"
            strokeWidth={1}
          />
          <text x={l.x} y={l.y + 1} textAnchor="middle" fontSize={12.5} fill="#cbd5e1">
            {l.text}
          </text>
        </g>
      ))}

      {/* Platform nodes */}
      {(Object.keys(nodes) as PlatformId[]).map((id) => {
        const { cx, cy } = nodes[id];
        const color = colorOf[id];
        const p = platforms.find((pl) => pl.id === id)!;
        return (
          <g key={id}>
            <circle cx={cx} cy={cy} r={62} fill="#04060c" />
            <circle cx={cx} cy={cy} r={62} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={1.5} />
            <text x={cx} y={cy - 2} textAnchor="middle" fontSize={20} fontWeight={600} fill="#f8fafc">
              {p.short}
            </text>
            <text x={cx} y={cy + 20} textAnchor="middle" fontSize={11} fill={color}>
              {p.domain.split(",")[0]}
            </text>
          </g>
        );
      })}

      {/* All-three hub */}
      <rect x={295} y={262} width={230} height={78} rx={6} fill="#04060c" stroke="#334155" strokeWidth={1.25} />
      <text x={hub.cx} y={287} textAnchor="middle" fontSize={10} letterSpacing={2} fill="#64748b">
        COUPLES ALL THREE
      </text>
      <text x={hub.cx} y={307} textAnchor="middle" fontSize={12.5} fill="#e2e8f0">
        Food systems · Urbanization
      </text>
      <text x={hub.cx} y={325} textAnchor="middle" fontSize={12.5} fill="#e2e8f0">
        Disease ecology
      </text>
    </svg>
  );
}

export default function PlatformsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <nav className="mb-10 flex gap-6">
        <Link
          href="/"
          className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
        >
          Back to home
        </Link>
      </nav>

      <section className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="max-w-4xl">
          <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-blue-400">
            Sapiens Scientia · Architecture
          </p>
          <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">
            Cross-Platform Systems Map
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            Sapiens Scientia is organized as a triad of human-centered platforms —
            Salus, Societas, and Terra. The platforms are deliberately not silos:
            many of the most important questions are cross-cutting, living in the
            couplings between health, society, and Earth.
          </p>
        </header>

        <section className="flex flex-col gap-7">
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            The Triad
          </h2>

          <div className="grid gap-4 lg:grid-cols-3">
            {platforms.map((platform) => (
              <Link
                key={platform.id}
                href={platform.href}
                className="group flex flex-col gap-2 border bg-white/[0.025] p-5 transition-colors"
                style={{ borderColor: `${platform.color}33` }}
              >
                <span
                  className="text-xs font-medium uppercase tracking-[0.18em]"
                  style={{ color: platform.color }}
                >
                  {platform.short}
                </span>
                <h3 className="text-xl font-semibold text-slate-50">
                  {platform.name}
                </h3>
                <p className="text-sm leading-6 text-slate-400">{platform.domain}</p>
                <span className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
                  Open platform <span aria-hidden>→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-7 border-t border-white/10 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Cross-Cutting Couplings
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              Some couplings link two platforms; others run through all three at
              once. The map traces where the platforms meet — the shared ground
              where real questions of human science actually sit.
            </p>
          </div>

          <div className="border border-white/10 bg-white/[0.02] p-4 sm:p-6">
            <SystemsMap />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {couplings.map((coupling) => (
              <article
                key={coupling.name}
                className="flex flex-col gap-3 border border-white/10 bg-white/[0.025] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-50">
                    {coupling.name}
                  </h3>
                  <span className="shrink-0 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-slate-500">
                    {coupling.links.length === 3 ? "All three" : "Pairwise"}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-400">{coupling.detail}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  {coupling.links.map((id) => (
                    <span
                      key={id}
                      className="border px-2.5 py-1 text-xs leading-5 text-slate-200"
                      style={{ borderColor: `${colorOf[id]}55`, color: colorOf[id] }}
                    >
                      {shortOf[id]}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-white/10 pt-10">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Bridge Model
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-300">
              On the homepage, the Human Platforms sit as the interpretive bridge
              between Earth Systems and Digital Systems. The platforms are not
              separate from the planet they study or the digital knowledge that
              represents it — they mediate between lived planetary reality and
              organized understanding.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}
