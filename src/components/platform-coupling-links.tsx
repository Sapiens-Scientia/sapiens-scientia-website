import Link from "next/link";
import { platformCouplings, type PlatformId } from "@/lib/platform-couplings";

export function PlatformCouplingLinks({ platform }: { platform: PlatformId }) {
  const related = platformCouplings.filter((coupling) => coupling.links.includes(platform));

  if (related.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4 border-t border-white/10 pt-8">
      <div className="max-w-3xl">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">Cross-platform couplings</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          This platform participates in shared feedback loops with the others. Explore the detailed
          analysis on the systems map.
        </p>
      </div>
      <ul className="flex flex-wrap gap-2">
        {related.map((coupling) => (
          <li key={coupling.slug}>
            <Link
              href={`/platforms#${coupling.slug}`}
              className="inline-flex border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-200 transition-colors hover:border-white/25 hover:text-white"
            >
              {coupling.name}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/platforms#coupled-scenario"
            className="inline-flex border border-emerald-400/25 bg-emerald-400/[0.05] px-3 py-1.5 text-sm text-emerald-200 transition-colors hover:border-emerald-400/45 hover:text-emerald-50"
          >
            Coupled scenario simulator
          </Link>
        </li>
      </ul>
    </section>
  );
}
