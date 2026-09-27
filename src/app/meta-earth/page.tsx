import type { Metadata } from "next";
import { MetaEarthExperience } from "@/components/meta-earth-experience";

export const metadata: Metadata = {
  title: "Meta Earth | Sapiens Scientia",
  description:
    "Explore one connected world through Persona, Societas, and Terra. Follow questions across scale, time, and evidence, or open the interactive Meta Earth globe workspace.",
};

export default function MetaEarthPage() {
  return (
    <main className="atlas-page relative min-h-screen">
      <MetaEarthExperience />
    </main>
  );
}
