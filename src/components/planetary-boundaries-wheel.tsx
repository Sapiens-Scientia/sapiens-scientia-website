// A radial "safe operating space" diagram of the nine planetary boundaries, in
// the style of the Stockholm Resilience Centre wheel and matching the project's
// hand-built inline SVGs. Each boundary is a wedge: safe wedges stay inside the
// dashed boundary ring; breached wedges push past it. Numbers key into the
// boundary grid shown alongside on the Terra page.

type Boundary = {
  name: string;
  status: "breached" | "safe";
};

const SAFE = "#34d399";
const BREACHED = "#fbbf24";

const CX = 260;
const CY = 260;
const R_HOLE = 64; // inner hole
const R_BOUNDARY = 150; // the dashed "safe operating space" ring
const R_SAFE = 120; // outer edge of a safe wedge (inside the ring)
const R_BREACHED = 206; // outer edge of a breached wedge (past the ring)

function polar(radius: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)];
}

// Annular sector path from rIn to rOut spanning [a0, a1] degrees, clockwise.
function wedgePath(rIn: number, rOut: number, a0: number, a1: number) {
  const [x0o, y0o] = polar(rOut, a0);
  const [x1o, y1o] = polar(rOut, a1);
  const [x1i, y1i] = polar(rIn, a1);
  const [x0i, y0i] = polar(rIn, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return [
    `M ${x0o} ${y0o}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${x1o} ${y1o}`,
    `L ${x1i} ${y1i}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${x0i} ${y0i}`,
    "Z",
  ].join(" ");
}

export function PlanetaryBoundariesWheel({
  boundaries,
}: {
  boundaries: Boundary[];
}) {
  const step = 360 / boundaries.length;
  const gap = 2.5; // degrees of spacing between wedges

  return (
    <svg
      viewBox="0 0 520 520"
      className="mx-auto h-auto w-full max-w-md"
      role="img"
      aria-label="Radial diagram of the nine planetary boundaries. Wedges that push past the dashed ring are breached; wedges inside it remain in the safe operating space."
    >
      <title>Planetary boundaries — safe operating space</title>
      <desc>
        {boundaries.filter((b) => b.status === "breached").length} of{" "}
        {boundaries.length} planetary boundaries are breached, shown as wedges
        extending beyond the safe operating space.
      </desc>

      {/* Safe operating space disc + boundary ring */}
      <circle cx={CX} cy={CY} r={R_BOUNDARY} fill={SAFE} fillOpacity={0.05} />
      <circle
        cx={CX}
        cy={CY}
        r={R_BOUNDARY}
        fill="none"
        stroke={SAFE}
        strokeOpacity={0.55}
        strokeWidth={1.25}
        strokeDasharray="4 5"
      />

      {boundaries.map((boundary, index) => {
        const a0 = index * step + gap / 2;
        const a1 = (index + 1) * step - gap / 2;
        const mid = (a0 + a1) / 2;
        const breached = boundary.status === "breached";
        const rOut = breached ? R_BREACHED : R_SAFE;
        const color = breached ? BREACHED : SAFE;
        const [lx, ly] = polar((R_HOLE + rOut) / 2, mid);

        return (
          <g key={boundary.name}>
            <path
              d={wedgePath(R_HOLE, rOut, a0, a1)}
              fill={color}
              fillOpacity={breached ? 0.34 : 0.22}
              stroke={color}
              strokeOpacity={0.85}
              strokeWidth={1.25}
            />
            <text
              x={lx}
              y={ly + 4}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill="#f8fafc"
            >
              {index + 1}
            </text>
          </g>
        );
      })}

      {/* Center hub */}
      <circle cx={CX} cy={CY} r={R_HOLE} fill="#04060c" stroke="#1e293b" strokeWidth={1.25} />
      <text x={CX} y={CY - 6} textAnchor="middle" fontSize={10} letterSpacing={1.5} fill="#64748b">
        SAFE
      </text>
      <text x={CX} y={CY + 9} textAnchor="middle" fontSize={10} letterSpacing={1.5} fill="#64748b">
        OPERATING
      </text>
      <text x={CX} y={CY + 24} textAnchor="middle" fontSize={10} letterSpacing={1.5} fill="#64748b">
        SPACE
      </text>
    </svg>
  );
}
