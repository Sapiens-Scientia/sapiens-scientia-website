const distanceRings = [
  { label: "Solar system", radius: 7, color: "#facc15", dash: "0.7 1.1" },
  { label: "Milky Way", radius: 15, color: "#38bdf8", dash: "0.8 1.2" },
  { label: "Local Group", radius: 25, color: "#a78bfa", dash: "0.9 1.3" },
  { label: "Virgo Supercluster", radius: 37, color: "#22d3ee", dash: "1.1 1.5" },
  { label: "Laniakea", radius: 51, color: "#67e8f9", dash: "1.3 1.7" },
  { label: "Observable universe limit", radius: 72, color: "#f8fafc", dash: "" },
];

const cosmicWebSegments = [
  ["18", "20", "23", "17"],
  ["23", "17", "31", "20"],
  ["31", "20", "37", "16"],
  ["63", "18", "70", "16"],
  ["70", "16", "78", "22"],
  ["79", "35", "87", "38"],
  ["87", "38", "83", "47"],
  ["70", "58", "78", "63"],
  ["78", "63", "85", "59"],
  ["55", "76", "64", "80"],
  ["64", "80", "71", "75"],
  ["31", "72", "38", "78"],
  ["38", "78", "45", "74"],
  ["15", "55", "23", "61"],
  ["23", "61", "31", "58"],
  ["16", "37", "25", "34"],
  ["25", "34", "32", "39"],
  ["48", "18", "53", "25"],
  ["53", "25", "61", "22"],
  ["49", "83", "54", "75"],
  ["54", "75", "61", "78"],
  ["12", "46", "18", "50"],
  ["82", "48", "89", "51"],
] as const;

const galaxyDots = [
  [18, 20, 0.65],
  [23, 17, 0.45],
  [31, 20, 0.5],
  [37, 16, 0.38],
  [63, 18, 0.42],
  [70, 16, 0.58],
  [78, 22, 0.5],
  [79, 35, 0.45],
  [87, 38, 0.6],
  [83, 47, 0.38],
  [70, 58, 0.5],
  [78, 63, 0.44],
  [85, 59, 0.52],
  [55, 76, 0.48],
  [64, 80, 0.56],
  [71, 75, 0.4],
  [31, 72, 0.5],
  [38, 78, 0.42],
  [45, 74, 0.54],
  [15, 55, 0.45],
  [23, 61, 0.58],
  [31, 58, 0.42],
  [16, 37, 0.48],
  [25, 34, 0.54],
  [32, 39, 0.46],
  [48, 18, 0.44],
  [53, 25, 0.52],
  [61, 22, 0.5],
  [49, 83, 0.46],
  [54, 75, 0.55],
  [61, 78, 0.42],
] as const;

export function ObservableUniverseView() {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black text-white"
      aria-label="Observable universe alternate view"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.16),rgba(3,7,18,0.42)_34%,rgba(0,0,0,0.96)_76%)]" />

      <div className="pointer-events-none absolute left-1/2 top-5 z-10 w-[min(34rem,calc(100vw-2.5rem))] -translate-x-1/2 text-center">
        <h1 className="text-balance text-2xl font-semibold leading-none tracking-normal text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.65)] sm:text-4xl">
          <span>Observable Universe</span>
          <br />
          <span className="mt-1 inline-block text-lg font-medium text-slate-400 sm:text-2xl">
            93 Billion Light Years Diameter
          </span>
        </h1>
      </div>

      <svg
        viewBox="-24 -24 148 148"
        role="img"
        aria-labelledby="observable-universe-title observable-universe-desc"
        className="relative mt-12 h-[min(78vh,84vw)] w-[min(78vh,84vw)] overflow-visible sm:mt-10"
      >
        <title id="observable-universe-title">Observable universe scale view</title>
        <desc id="observable-universe-desc">
          Concentric distance rings centered on Earth, ending at the observable universe limit.
        </desc>
        <defs>
          <radialGradient id="observable-universe-depth" cx="50%" cy="50%" r="52%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8" />
            <stop offset="12%" stopColor="#0ea5e9" stopOpacity="0.24" />
            <stop offset="58%" stopColor="#020617" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <filter id="observable-universe-soft-glow">
            <feGaussianBlur stdDeviation="0.75" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="50" cy="50" r="72" fill="url(#observable-universe-depth)" />
        <circle
          cx="50"
          cy="50"
          r="72"
          fill="none"
          stroke="#f8fafc"
          strokeOpacity="0.88"
          strokeWidth="0.58"
          filter="url(#observable-universe-soft-glow)"
        />
        <circle
          cx="50"
          cy="50"
          r="69"
          fill="none"
          stroke="#f97316"
          strokeOpacity="0.34"
          strokeWidth="1.15"
        />
        <circle
          cx="50"
          cy="50"
          r="66.5"
          fill="none"
          stroke="#f8fafc"
          strokeOpacity="0.18"
          strokeWidth="1.2"
        />

        <g opacity="0.58">
          {cosmicWebSegments.map(([x1, y1, x2, y2], index) => (
            <line
              key={`${x1}-${y1}-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#e2e8f0"
              strokeOpacity="0.46"
              strokeWidth="0.18"
            />
          ))}
          {galaxyDots.map(([cx, cy, opacity], index) => (
            <circle
              key={`${cx}-${cy}-${index}`}
              cx={cx}
              cy={cy}
              r="0.55"
              fill="#f8fafc"
              opacity={opacity}
              filter="url(#observable-universe-soft-glow)"
            />
          ))}
        </g>

        <line x1="13" y1="50" x2="87" y2="50" stroke="#38bdf8" strokeWidth="0.34" />
        <line x1="50" y1="13" x2="50" y2="87" stroke="#38bdf8" strokeWidth="0.34" />
        {Array.from({ length: 31 }, (_, index) => {
          const x = 20 + index * 2;
          const isMajor = index % 5 === 0;
          return (
            <line
              key={x}
              x1={x}
              y1={isMajor ? 46.8 : 48}
              x2={x}
              y2={isMajor ? 53.2 : 52}
              stroke="#f8fafc"
              strokeOpacity={isMajor ? 0.72 : 0.42}
              strokeWidth={isMajor ? 0.26 : 0.16}
            />
          );
        })}

        {distanceRings.map((ring) => (
          <circle
            key={ring.label}
            cx="50"
            cy="50"
            r={ring.radius}
            fill="none"
            stroke={ring.color}
            strokeOpacity={ring.radius === 72 ? 0.78 : 0.42}
            strokeWidth={ring.radius === 72 ? 0.44 : 0.26}
            strokeDasharray={ring.dash}
          />
        ))}

        <circle cx="50" cy="50" r="2.4" fill="#38bdf8" opacity="0.82" />
        <circle cx="50" cy="50" r="0.75" fill="#f8fafc" />

        <text x="50" y="45.8" textAnchor="middle" className="fill-emerald-300 text-[2.2px] font-semibold">
          Earth
        </text>
        <text x="50" y="89.5" textAnchor="middle" className="fill-slate-300 text-[2.2px] font-medium">
          observable universe limit
        </text>
        <text x="18" y="46" className="fill-emerald-300 text-[2.1px] font-semibold">
          distance radius rings
        </text>
        <text x="74" y="53.8" textAnchor="middle" className="fill-cyan-200 text-[1.95px] font-medium">
          Virgo Supercluster
        </text>
        <text x="50" y="16.2" textAnchor="middle" className="fill-slate-300 text-[1.85px] font-medium">
          180°
        </text>
        <text x="50" y="85" textAnchor="middle" className="fill-slate-300 text-[1.85px] font-medium">
          0°
        </text>
      </svg>
    </section>
  );
}
