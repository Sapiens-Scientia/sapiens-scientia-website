import { DimensionExplorer, type DimensionEntry } from "@/components/dimension-explorer";
import { CHRONOS_LOG_MAX, CHRONOS_LOG_MIN, chronosEvents, chronosEventSlug, chronosPlatforms, eons } from "@/lib/chronos";

const entries: DimensionEntry[] = chronosEvents.map((event, index) => ({
  slug: chronosEventSlug(event.name), name: event.name, value: event.sinceLabel,
  axis: String(index + 1).padStart(2, "0"),
  fraction: (CHRONOS_LOG_MAX - event.log) / (CHRONOS_LOG_MAX - CHRONOS_LOG_MIN),
  group: event.eon, note: event.note, here: event.here,
  links: (eons.find((eon) => eon.id === event.eon)?.platforms ?? []).map((id) => chronosPlatforms[id]),
}));

export function ChronosArc() {
  return <DimensionExplorer mode="time" entries={entries}
    groups={eons.map((eon) => ({ id: eon.id, name: eon.name, label: eon.name, color: eon.color }))}
    defaultSlug={entries.find((entry) => entry.here)?.slug ?? entries[0].slug} />;
}
