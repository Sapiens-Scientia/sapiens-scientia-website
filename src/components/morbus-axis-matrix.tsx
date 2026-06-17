"use client";

import Link from "next/link";
import { morbusAxisNames, morbusDiseases } from "@/lib/morbus";

const axisAbbrev: Record<string, string> = {
  Anatomical: "Anat",
  Etiologic: "Etiol",
  Molecular: "Mol",
  Immunological: "Imm",
  Barrier: "Barr",
  Ecological: "Eco",
  Developmental: "Dev",
  Social: "Soc",
  Experiential: "Exp",
};

export function MorbusAxisMatrix() {
  return (
    <div className="overflow-x-auto border border-white/10 bg-white/[0.015]">
      <table className="w-full min-w-[52rem] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            <th className="sticky left-0 z-10 bg-[#0a0a0a] px-3 py-2 font-semibold uppercase tracking-wider text-slate-400">
              Disease
            </th>
            {morbusAxisNames.map((axis) => (
              <th
                key={axis}
                className="px-2 py-2 text-center font-semibold uppercase tracking-wider text-emerald-300/80"
                title={axis}
              >
                {axisAbbrev[axis] ?? axis.slice(0, 4)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {morbusDiseases.map((disease) => (
            <tr key={disease.id} className="border-b border-white/5 hover:bg-white/[0.02]">
              <td className="sticky left-0 z-10 bg-[#0a0a0a] px-3 py-2">
                <Link
                  href={`/platforms/salus/morbus#${disease.id}`}
                  className="font-medium text-slate-200 underline-offset-2 hover:text-emerald-200 hover:underline"
                >
                  {disease.name.replace(/ \(.*\)$/, "")}
                </Link>
              </td>
              {morbusAxisNames.map((axisName) => {
                const axis = disease.axes.find((entry) => entry.axis === axisName);
                return (
                  <td key={axisName} className="px-2 py-2 text-center">
                    {axis ? (
                      <span
                        className="inline-block size-2 rounded-full bg-emerald-400/80"
                        title={`${axisName}: ${axis.value}`}
                      />
                    ) : (
                      <span className="inline-block size-2 rounded-full bg-white/10" title="No axis entry" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
