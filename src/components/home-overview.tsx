import Link from "next/link";
import {
  dataIndexCategories,
  dataIndexTotalEntries,
} from "@/lib/data-index";
import { platformCouplings, platformList } from "@/lib/platforms";
import { ORDERS_OF_MAGNITUDE, scaleTiers } from "@/lib/scales";

const systemSignals = [
  {
    label: "Ladder",
    value: `${ORDERS_OF_MAGNITUDE}`,
    unit: "orders",
    href: "/scales",
    detail: "A powers-of-ten map from elementary particles to the Sun.",
  },
  {
    label: "Platforms",
    value: `${platformList.length}`,
    unit: "active",
    href: "/platforms",
    detail: "Salus, Societas, and Terra as lenses on one coupled world.",
  },
  {
    label: "Data Index",
    value: `${dataIndexTotalEntries}`,
    unit: "sources",
    href: "/projects/sapiens-scientia-data-index",
    detail: "Public repositories, indexes, archives, and registries.",
  },
];

export function HomeOverview() {
  const featuredCouplings = platformCouplings.slice(0, 4);
  const featuredCategories = dataIndexCategories.slice(0, 6);

  return (
    <section className="relative z-20 bg-black px-6 py-16 text-white sm:px-10 sm:py-20">
      <div className="mx-auto flex max-w-7xl flex-col gap-16">
        <section className="grid gap-8 border-t border-white/15 pt-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200/80">
              Read The System
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
              A public atlas for human-scale science.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              The homepage globe is the entry point. Below it, the site turns
              into a working map: scale explains where a system lives,
              platforms explain which lens is useful, and the data index points
              toward the source material.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {systemSignals.map((signal) => (
              <Link
                key={signal.label}
                href={signal.href}
                aria-label={`Explore ${signal.label}: ${signal.detail}`}
                className="group border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-sky-200/35 hover:bg-white/[0.055] focus:outline-none focus-visible:border-sky-200"
              >
                <p className="text-sm font-medium text-slate-400">{signal.label}</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-mono text-4xl leading-none text-white">
                    {signal.value}
                  </span>
                  <span className="pb-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-200/70">
                    {signal.unit}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {signal.detail}
                </p>
                <span className="mt-5 inline-flex text-sm font-medium text-sky-200 transition-colors group-hover:text-sky-50">
                  Explore <span aria-hidden="true" className="ml-1">-&gt;</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Platform Couplings
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              The important questions rarely stay inside one platform. These
              couplings are the bridgework between health, society, and Earth
              systems.
            </p>
          </div>

          <div className="divide-y divide-white/10 border-y border-white/10">
            {featuredCouplings.map((coupling) => (
              <Link
                key={coupling.name}
                href="/platforms"
                aria-label={`Explore the ${coupling.name} platform coupling`}
                className="grid gap-3 py-5 transition-colors hover:text-sky-100 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]"
              >
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {coupling.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {coupling.links.map((id) => {
                      const platform = platformList.find((item) => item.id === id);
                      return platform ? (
                        <span
                          key={id}
                          className="border px-2.5 py-1 text-xs font-medium"
                          style={{
                            borderColor: `${platform.color}55`,
                            color: platform.color,
                          }}
                        >
                          {platform.shortName}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-400">
                  {coupling.detail}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-8 border-t border-white/10 pt-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
              Scale To Source
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
              Sapiens Scientia keeps the conceptual ladder close to the source
              material. The result is a site that can move from system level to
              evidence level without changing vocabulary.
            </p>
            <Link
              href="/projects"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-sky-200 transition-colors hover:text-sky-50"
            >
              View current projects
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>

          <div className="grid gap-6">
            <div className="grid gap-2">
              {scaleTiers.map((tier) => (
                <Link
                  key={tier.id}
                  href="/scales"
                  aria-label={`Explore ${tier.name} on the ladder of scale`}
                  className="grid gap-3 border border-white/10 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.045] sm:grid-cols-[10rem_minmax(0,1fr)]"
                  style={{ borderLeftColor: tier.color, borderLeftWidth: 2 }}
                >
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.18em]"
                      style={{ color: tier.color }}
                    >
                      {tier.ordinal}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      {tier.name}
                    </h3>
                  </div>
                  <p className="text-sm leading-6 text-slate-400">
                    {tier.rangeLabel}
                  </p>
                </Link>
              ))}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCategories.map((category) => (
                <Link
                  key={category.name}
                  href="/projects/sapiens-scientia-data-index"
                  aria-label={`Explore ${category.name} in the Sapiens Scientia Data Index`}
                  className="border border-white/10 bg-white/[0.025] p-4 transition-colors hover:bg-white/[0.05]"
                >
                  <span
                    className="block h-1 w-10"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="mt-3 text-base font-semibold text-white">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {category.entries.length} indexed sources
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
