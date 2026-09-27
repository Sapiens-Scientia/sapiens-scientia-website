import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { atlasLenses } from "@/lib/exploration";

const introductions = {
  persona: {
    title: "A person is a living system.",
    description: "Explore the body, health, and home — and how the world around us shapes each of them.",
    action: "Explore the modules", target: "#persona-modules",
  },
  societas: {
    title: "We build systems that outlive us.",
    description: "Explore institutions, economies, and knowledge — the ways individual lives become a society.",
    action: "Explore the model", target: "#societas-model",
  },
  terra: {
    title: "A planet of connected systems.",
    description: "Explore climate, water, land, and life — and the planetary conditions we depend on and change.",
    action: "Explore Earth systems", target: "#terra-model",
  },
} as const;

export function PlatformIntroduction({ platform }: { platform: keyof typeof introductions }) {
  const lens = atlasLenses.find((item) => item.id === platform)!;
  const content = introductions[platform];
  return (
    <header className="platform-introduction">
      <nav className="platform-lenses" aria-label="Platform lenses">
        <p>Three lenses. One world.</p>
        {atlasLenses.map((item) => <Link key={item.id} href={item.href} aria-current={item.id === platform ? "page" : undefined} style={{ color: item.color }}>
          <strong>{item.name}</strong><span>{item.scope}</span>
        </Link>)}
      </nav>
      <div className="platform-introduction-body">
        <div><p className="platform-introduction-eyebrow">{lens.scope}</p><h1>{lens.name}</h1><p className="platform-introduction-title">{content.title}</p></div>
        <div className="platform-introduction-action">
          <p>{content.description}</p>
          <a href={content.target} className="atlas-action" style={{ color: lens.color, borderColor: lens.color }}>{content.action}<ArrowRight size={18} aria-hidden="true" /></a>
          <Link href="/platforms" className="atlas-text-link">See how the platforms connect<ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
      </div>
    </header>
  );
}
