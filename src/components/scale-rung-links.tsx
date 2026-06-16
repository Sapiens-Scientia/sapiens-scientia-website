import Link from "next/link";
import { platforms, rungSlug, scaleRungs, scaleTiers, type ScalePlatform } from "@/lib/scales";

const tierPlatformMap = Object.fromEntries(
  scaleTiers.map((tier) => [tier.id, tier.platforms]),
) as Record<string, ScalePlatform["id"][]>;

function rungsForPlatform(platformId: ScalePlatform["id"]) {
  return scaleRungs.filter((rung) => {
    const affinity = rung.platforms ?? tierPlatformMap[rung.tier];
    return affinity.includes(platformId);
  });
}

export function ScaleRungLinks({ platform }: { platform: ScalePlatform["id"] }) {
  const rungs = rungsForPlatform(platform);
  const accent = platforms[platform].color;

  return (
    <section className="flex flex-col gap-4 border-t border-white/10 pt-8">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">On the ladder of scale</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {platforms[platform].name} spans multiple rungs — from the smallest relevant structures
          to the largest systems it interprets.
        </p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {rungs.map((rung) => (
          <li key={rung.name}>
            <Link
              href={`/scales#${rungSlug(rung.name)}`}
              className="inline-flex border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-white/25 hover:text-white"
              style={{ borderColor: `${accent}33` }}
            >
              {rung.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
