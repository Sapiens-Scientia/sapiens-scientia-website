import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { explorationPaths } from "@/lib/exploration";

export function HomeOverview() {
  return (
    <section className="atlas-paths atlas-frame" aria-labelledby="atlas-questions">
      <div className="atlas-section-heading">
        <h2 id="atlas-questions">Follow a question.</h2>
        <p>Start with what interests you. Follow a path through connected systems.</p>
      </div>
      <div>
        {explorationPaths.map((path, index) => (
          <article key={path.id} className="atlas-path" style={{ "--path-color": path.color } as React.CSSProperties}>
            <div className="atlas-path-question">
              <span className="atlas-index">0{index + 1}</span>
              <div><h3>{path.question}</h3><p>{path.description}</p></div>
            </div>
            <ol className="atlas-path-steps" aria-label={path.question}>
              {path.steps.map((step, stepIndex) => (
                <li key={step.href}>
                  <Link href={step.href}>
                    <span className="atlas-step-dot" aria-hidden="true">{stepIndex + 1}</span>
                    <strong>{step.name}</strong><span>{step.action}<ArrowRight aria-hidden="true" size={14} /></span>
                  </Link>
                </li>
              ))}
            </ol>
          </article>
        ))}
      </div>
      <div className="atlas-whole-picture">
        <div><h3>The whole picture</h3><p>The concepts and relationships behind the atlas.</p></div>
        <Link href="/ontology" className="atlas-text-link">Explore the system map<ArrowRight size={18} aria-hidden="true" /></Link>
      </div>
    </section>
  );
}
