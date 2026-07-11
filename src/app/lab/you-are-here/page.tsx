import type { Metadata } from "next";
import { YouAreHereExperience } from "@/components/lab/you-are-here";

// Lab experiment: a from-scratch remix of the homepage's spacetime journey.
// Deliberately unlisted — not in the sitemap, nav, or docs route inventory.
export const metadata: Metadata = {
  title: "You Are Here — Lab",
  description: "A scroll through everything, ending at you.",
  robots: { index: false, follow: false },
};

export default function YouAreHereLabPage() {
  return (
    <main className="min-h-screen bg-[#050308]">
      <YouAreHereExperience />
    </main>
  );
}
