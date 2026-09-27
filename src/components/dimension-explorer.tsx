"use client";

import Link from "next/link";
import { ArrowRight, Link2 } from "lucide-react";
import { useId, useState } from "react";
import { useUrlHash } from "@/hooks/use-url-hash";

export type DimensionEntry = {
  slug: string;
  name: string;
  value: string;
  axis: string;
  fraction: number;
  group: string;
  note: string;
  here?: boolean;
  links: readonly { name: string; href: string; color: string }[];
};
export type DimensionGroup = { id: string; name: string; label: string; color: string };

export function DimensionExplorer({ mode, entries, groups, defaultSlug }: {
  mode: "scale" | "time";
  entries: readonly DimensionEntry[];
  groups: readonly DimensionGroup[];
  defaultSlug: string;
}) {
  const [hash, setHash] = useUrlHash();
  const id = useId();
  const [filter, setFilter] = useState<{ hash: string; group: string | null } | null>(null);
  const [share, setShare] = useState<{ hash: string; message: string } | null>(null);
  const selected = entries.find((entry) => entry.slug === hash)
    ?? entries.find((entry) => entry.slug === defaultSlug) ?? entries[0];
  const focusedGroup = filter?.hash === hash ? filter.group : null;
  const visible = focusedGroup ? entries.filter((entry) => entry.group === focusedGroup) : entries;
  const group = groups.find((item) => item.id === selected.group);

  const choose = (entry: DimensionEntry) => {
    setFilter({ hash: entry.slug, group: focusedGroup });
    setHash(entry.slug);
    // On phones, reveal the explanation adjacent to the selected entry.
    if (window.matchMedia("(max-width: 767px)").matches) {
      requestAnimationFrame(() => document.getElementById(`${id}-${entry.slug}`)?.scrollIntoView({ block: "start", behavior: "instant" }));
    }
  };
  const focusGroup = (next: string | null) => {
    const entry = next && selected.group !== next ? entries.find((item) => item.group === next)! : selected;
    setFilter({ hash: entry.slug, group: next });
    setHash(entry.slug);
  };
  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.hash = selected.slug;
    setFilter({ hash: selected.slug, group: focusedGroup });
    setHash(selected.slug, { replace: true });
    try {
      await navigator.clipboard.writeText(url.href);
      setShare({ hash: selected.slug, message: "Link copied." });
    } catch {
      setShare({ hash: selected.slug, message: "Copy is unavailable. Use the selected entry’s link in the address bar." });
    }
  };

  const detail = (mobile: boolean) => (
    <div className={mobile ? "dimension-detail-mobile" : "dimension-detail-desktop"} id={`${id}-detail-${mobile ? "mobile" : "desktop"}`}>
      <div className="dimension-detail" aria-live="polite">
        <p className="dimension-detail-label">Selected {mode === "scale" ? "scale" : "moment"} · {group?.name}</p>
        <h3>{selected.name}</h3>
        <p className="dimension-detail-value">{selected.value}</p>
        {mode === "time" && <p className="dimension-metric-label">Since the Big Bang</p>}
        <p className="dimension-detail-note">{selected.note}</p>
        {selected.links.length > 0 && <div className="dimension-related">
          <p>Connected platforms</p>
          <div>{selected.links.map((link) => <Link key={link.href} href={link.href} style={{ color: link.color }}>{link.name}<ArrowRight size={17} aria-hidden="true" /></Link>)}</div>
        </div>}
      </div>
      <button type="button" onClick={copyLink} className="dimension-share"><Link2 size={17} aria-hidden="true" />Copy link</button>
      <p className="dimension-share-message" role="status">{share?.hash === hash ? share.message : ""}</p>
      <p className="dimension-detail-hint">Choose another {mode === "scale" ? "scale" : "moment"} to change perspective.</p>
    </div>
  );

  return (
    <div className="dimension-explorer">
      <div className="dimension-heading">
        <nav aria-label="Explore by dimension"><span>Explore by</span><Link href="/scales" aria-current={mode === "scale" ? "page" : undefined}>Scale</Link><Link href="/chronos" aria-current={mode === "time" ? "page" : undefined}>Time</Link></nav>
        <p>Select an entry to explore its connections.</p>
      </div>
      <div className="dimension-filters" role="group" aria-label={mode === "scale" ? "Scale tiers" : "Time eons"}>
        <button type="button" aria-pressed={!focusedGroup} onClick={() => focusGroup(null)}>All {mode === "scale" ? "scales" : "time"}</button>
        {groups.map((item) => <button key={item.id} type="button" aria-label={`Focus ${item.name}`} aria-pressed={focusedGroup === item.id} onClick={() => focusGroup(focusedGroup === item.id ? null : item.id)}>{item.label}</button>)}
      </div>
      <p className="sr-only" role="status">{visible.length} entries shown{focusedGroup ? ` in ${group?.name}` : ""}.</p>
      <div className="dimension-layout">
        <ol className="dimension-entries" aria-label={mode === "scale" ? "Scales from smallest to largest" : "Moments from the Big Bang to the present"}>
          {visible.map((entry) => {
            const active = entry.slug === selected.slug;
            return <li key={entry.slug} id={`${id}-${entry.slug}`}>
              <button type="button" className="dimension-entry" aria-pressed={active}
                aria-controls={active ? `${id}-detail-mobile ${id}-detail-desktop` : undefined}
                onClick={() => choose(entry)}>
                <span className="dimension-axis">{entry.axis}</span>
                <span className="dimension-rail" aria-hidden="true"><span style={{ width: `${Math.max(.04, Math.min(1, entry.fraction)) * 100}%` }} /></span>
                <span className="dimension-entry-name">{entry.name}{entry.here && <span className="sr-only"> — You are here</span>}</span>
                <span className="dimension-entry-value">{entry.value}</span>
              </button>
              {active && detail(true)}
            </li>;
          })}
        </ol>
        {detail(false)}
      </div>
      <p className="dimension-footnote">{mode === "scale" ? "Characteristic sizes, shown on a logarithmic axis." : "Labels show elapsed time since the Big Bang. Rail length uses logarithmic age before the present, stretching recent history."}</p>
    </div>
  );
}
