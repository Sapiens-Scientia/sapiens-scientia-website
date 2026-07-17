import type { Metadata } from "next";
import { BreadcrumbTrail } from "@/components/breadcrumb-trail";
import { SiteFooter } from "@/components/site-footer";
import { SomaExperience } from "@/components/soma/soma-experience";

export const metadata: Metadata = {
  title: "Soma | Sapiens Scientia",
  description:
    "Explore the healthy human body across organ systems, organs, tissues, cells, organelles, and molecules in the interactive Sapiens Scientia Soma atlas.",
};

export default function SomaPage() {
  return (
    <main className="soma-page min-h-screen px-4 pb-8 pt-4 text-white sm:px-6">
      <BreadcrumbTrail path="/platforms/persona/salus/soma" />
      <SomaExperience />
      <div className="soma-footer-shell">
        <SiteFooter />
      </div>
    </main>
  );
}
