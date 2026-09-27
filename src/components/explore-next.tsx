"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { explorationPaths } from "@/lib/exploration";

/** A contextual continuation shared by all content routes. No tracking or saved progress. */
export function ExploreNext() {
  const pathname = usePathname();
  if (pathname === "/meta-earth" || pathname === "/") return null;
  const path = pathname.startsWith("/platforms/persona") ? explorationPaths[0]
    : pathname === "/platforms/societas" || pathname === "/platforms" ? explorationPaths[1]
    : pathname === "/platforms/terra" || pathname === "/vitals" || pathname.includes("data-index") ? explorationPaths[2]
    : null;
  const steps = path
    ? [...path.steps.filter((step) => step.href !== pathname).slice(0, 2), { name: "Meta Earth", action: "Return to the atlas", href: "/meta-earth" }]
    : [
      { name: pathname === "/scales" ? "Arc of Time" : "Ladder of Scale", action: pathname === "/scales" ? "Add the time dimension" : "Change your perspective", href: pathname === "/scales" ? "/chronos" : "/scales" },
      { name: "Data Index", action: "Follow the evidence", href: "/projects/sapiens-scientia-data-index" },
      { name: "Meta Earth", action: "Return to the atlas", href: "/meta-earth" },
    ];

  return (
    <nav className="explore-next" aria-label="Continue exploring" style={{ "--path-color": path?.color ?? "var(--atlas-persona)" } as React.CSSProperties}>
      <div><p>Keep exploring</p><h2>{path?.question ?? "Another way into the same world."}</h2></div>
      <ol className="atlas-path-steps">
        {steps.map((step, index) => (
          <li key={step.href}><Link href={step.href}><span className="atlas-step-dot" aria-hidden="true">{index + 1}</span><strong>{step.name}</strong><span>{step.action}<ArrowRight size={14} aria-hidden="true" /></span></Link></li>
        ))}
      </ol>
    </nav>
  );
}
