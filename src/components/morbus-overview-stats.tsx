import { morbusDiseaseCount, morbusDiseasesByGroup, morbusGroupKinds } from "@/lib/morbus";

export function MorbusOverviewStats() {
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-4 border-y border-white/15 py-5 text-sm uppercase tracking-[0.2em] text-slate-400">
      <span>{morbusDiseaseCount} interactive exemplars</span>
      <span>9 decomposition axes</span>
      {morbusGroupKinds.map((group) => (
        <span key={group}>
          {morbusDiseasesByGroup(group).length}{" "}
          {group.replace(" Diseases", "").toLowerCase()}
        </span>
      ))}
    </div>
  );
}
