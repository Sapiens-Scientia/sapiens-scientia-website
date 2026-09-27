"use client";

import Link from "next/link";
import { morbusAxisNames, morbusDiseases } from "@/lib/morbus";
import { useUrlHash } from "@/hooks/use-url-hash";

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
  const [, setHash] = useUrlHash();

  return (
    <div className="min-w-0 overflow-x-auto border border-white/10 bg-white/[0.015]" role="region" aria-label="Disease axes comparison; scroll horizontally to see all axes" tabIndex={0}>
      <table className="relative w-full min-w-[52rem] border-collapse text-left text-xs">
        <caption className="sr-only">Select a disease to explore its nine axes below.</caption>
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            <th scope="col" className="sticky left-0 z-10 bg-[#0a0a0a] px-3 py-2 font-semibold uppercase tracking-wider text-slate-400">
              Disease
            </th>
            {morbusAxisNames.map((axis) => (
              <th
                key={axis}
                scope="col"
                className="px-2 py-2 text-center font-semibold uppercase tracking-wider text-emerald-300/80"
                title={axis}
              >
                <abbr title={axis} className="cursor-help no-underline">{axisAbbrev[axis] ?? axis.slice(0, 4)}</abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {morbusDiseases.map((disease) => (
            <tr key={disease.id} className="border-b border-white/5 hover:bg-white/[0.02]">
              <th scope="row" className="sticky left-0 z-10 bg-[#0a0a0a] px-3 py-2">
                <Link
                  href={`/platforms/persona/salus/soma/morbus#${disease.id}`}
                  onClick={(event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    setHash(disease.id);
                    requestAnimationFrame(() => {
                      document.getElementById("morbus-detail-title")?.focus({ preventScroll: true });
                      document.getElementById("morbus-explorer")?.scrollIntoView({
                        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
                        block: "start",
                      });
                    });
                  }}
                  className="font-medium text-slate-200 underline-offset-2 hover:text-emerald-200 hover:underline"
                >
                  {disease.name.replace(/ \(.*\)$/, "")}
                </Link>
              </th>
              {morbusAxisNames.map((axisName) => {
                const axis = disease.axes.find((entry) => entry.axis === axisName);
                return (
                  <td key={axisName} className="px-2 py-2 text-center">
                    {axis ? (
                      <span
                        className="inline-block size-2 rounded-full bg-emerald-400/80"
                        title={`${axisName}: ${axis.value}`}
                      ><span className="sr-only">{axis.value}</span></span>
                    ) : (
                      <span className="inline-block size-2 rounded-full bg-white/10" title="No axis entry"><span className="sr-only">No axis entry</span></span>
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
