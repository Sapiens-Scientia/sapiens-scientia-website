"use client";

import { useMemo, useState } from "react";
import { dataIndexSections, dataIndexTitleForSlug } from "@/lib/data-index";

export function DataIndexExplorer() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const slug = window.location.hash.replace(/^#/, "");
    return slug ? dataIndexTitleForSlug(slug) : null;
  });

  const selectCategory = (title: string | null) => {
    setActiveCategory(title);

    if (typeof window === "undefined") {
      return;
    }

    if (title) {
      const section = dataIndexSections.find((entry) => entry.title === title);
      if (section) {
        window.history.replaceState(null, "", `#${section.slug}`);
      }
    } else {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const normalizedQuery = query.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    return dataIndexSections
      .filter((section) => !activeCategory || section.title === activeCategory)
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!normalizedQuery) {
            return true;
          }

          const haystack = `${item.name} ${item.role} ${section.title} ${section.description}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        }),
      }))
      .filter((section) => section.items.length > 0);
  }, [activeCategory, normalizedQuery]);

  const visibleCount = filteredSections.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex flex-1 flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Search the index
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by name, role, or category…"
              className="border border-white/15 bg-black/40 px-3 py-2 text-base text-slate-100 placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none"
            />
          </label>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
            {visibleCount} source{visibleCount === 1 ? "" : "s"} shown
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => selectCategory(null)}
            className={[
              "border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors",
              activeCategory === null
                ? "border-sky-400/50 bg-sky-400/10 text-sky-200"
                : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200",
            ].join(" ")}
          >
            All categories
          </button>
          {dataIndexSections.map((section) => (
            <button
              key={section.title}
              type="button"
              onClick={() =>
                selectCategory(activeCategory === section.title ? null : section.title)
              }
              className={[
                "border px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] transition-colors",
                activeCategory === section.title
                  ? "border-sky-400/50 bg-sky-400/10 text-sky-200"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200",
              ].join(" ")}
            >
              {section.title.replace(/ Databases$/, "").replace(/ And /g, " & ")}
            </button>
          ))}
        </div>
      </div>

      {filteredSections.length === 0 ? (
        <p className="border border-white/10 bg-white/[0.02] p-6 text-center text-slate-400">
          No databases match your search. Try a broader term or clear the category filter.
        </p>
      ) : (
        <div className="grid gap-12">
          {filteredSections.map((section) => (
            <section
              key={section.title}
              id={section.slug}
              className="grid gap-6 border-t border-white/15 pt-8 scroll-mt-24 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]"
            >
              <div>
                <h2 className="text-3xl font-semibold tracking-normal text-white">
                  {section.title}
                </h2>
                <p className="mt-3 max-w-xl text-lg leading-snug text-slate-400">
                  {section.description}
                </p>
              </div>

              <div className="divide-y divide-white/10 border-y border-white/10">
                {section.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="grid gap-2 py-4 text-slate-100 transition-colors hover:text-blue-300 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] sm:items-center"
                  >
                    <span className="text-2xl font-medium leading-none">{item.name}</span>
                    <span className="text-lg leading-tight text-slate-400">{item.role}</span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
