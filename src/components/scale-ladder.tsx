import { DimensionExplorer, type DimensionEntry } from "@/components/dimension-explorer";
import { LADDER_LOG_MAX, LADDER_LOG_MIN, platforms, rungSlug, scaleRungs, scaleTiers } from "@/lib/scales";

const SUPERSCRIPT: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
const entries: DimensionEntry[] = scaleRungs.map((rung) => ({
  slug: rungSlug(rung.name), name: rung.name, value: rung.sizeLabel,
  axis: `10${String(Math.round(rung.log)).split("").map((character) => SUPERSCRIPT[character] ?? character).join("")}`,
  fraction: (rung.log - LADDER_LOG_MIN) / (LADDER_LOG_MAX - LADDER_LOG_MIN),
  group: rung.tier, note: rung.note, here: rung.here,
  links: (rung.platforms ?? scaleTiers.find((tier) => tier.id === rung.tier)?.platforms ?? []).map((id) => platforms[id]),
}));

export function ScaleLadder() {
  return <DimensionExplorer mode="scale" entries={entries}
    groups={scaleTiers.map((tier) => ({ id: tier.id, name: tier.name, label: tier.name.replace("systems", ""), color: tier.color }))}
    defaultSlug={entries.find((entry) => entry.here)?.slug ?? entries[0].slug} />;
}
