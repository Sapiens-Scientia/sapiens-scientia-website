// Proportional bars reading the human population (~8.2B) along a few civilizational
// dimensions. Shares are expressed against the whole of humanity so the bars are
// directly comparable. Figures track the same bodies cited on the Societas page
// (ITU, World Bank, V-Dem, UNHCR).

type HumanityBar = {
  label: string;
  percent: number;
  detail: string;
  color: string;
};

const bars: HumanityBar[] = [
  {
    label: "Connected to the internet",
    percent: 68,
    detail: "About 5.5B people are online; 2.6B — mostly rural and low-income — remain offline.",
    color: "#818cf8",
  },
  {
    label: "Living in cities",
    percent: 57,
    detail: "More than half of humanity is now urban, and the share keeps rising.",
    color: "#38bdf8",
  },
  {
    label: "Under autocratizing rule",
    percent: 72,
    detail: "Share living in autocratizing or autocratic states — autocracies now outnumber democracies.",
    color: "#fbbf24",
  },
  {
    label: "In extreme poverty",
    percent: 10,
    detail: "Roughly 817M people live under the World Bank's $3.00-a-day line.",
    color: "#fb7185",
  },
  {
    label: "Forcibly displaced",
    percent: 1.5,
    detail: "123M people — about 1 in 67 — were displaced by conflict, persecution, or disaster.",
    color: "#f472b6",
  },
];

export function HumanityBars() {
  return (
    <div className="flex flex-col gap-5 border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300/80">
          Humanity at a glance
        </p>
        <p className="font-mono text-xs text-slate-500">share of ~8.2B people</p>
      </div>

      <ul className="flex flex-col gap-5">
        {bars.map((bar) => (
          <li key={bar.label}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-sm font-medium text-slate-100">{bar.label}</span>
              <span className="shrink-0 font-mono text-sm text-slate-300">
                {bar.percent}%
              </span>
            </div>
            <div
              className="mt-2 h-2.5 w-full overflow-hidden bg-white/[0.06]"
              role="img"
              aria-label={`${bar.label}: ${bar.percent} percent of the world population`}
            >
              <div
                className="h-full"
                style={{
                  width: `${Math.max(bar.percent, 0.8)}%`,
                  backgroundColor: bar.color,
                  opacity: 0.85,
                }}
              />
            </div>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">{bar.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
