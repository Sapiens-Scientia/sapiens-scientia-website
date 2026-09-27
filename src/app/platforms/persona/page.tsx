import type { Metadata } from "next";
import Link from "next/link";
import { PlatformIntroduction } from "@/components/platform-introduction";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PlatformCouplingLinks } from "@/components/platform-coupling-links";
import { ScaleRungLinks } from "@/components/scale-rung-links";

export const metadata: Metadata = {
  title: "Persona | Sapiens Scientia",
  description:
    "Sapiens Scientia Persona: the platform for the human person as an embodied, vulnerable, home-dwelling, health-seeking, disease-susceptible, socially embedded organism.",
};

export default function PersonaPlatformPage() {
  return (
    <main className="atlas-page min-h-screen px-6 py-8 sm:px-10">
      <SiteNav />

      <section id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-12">
        <PlatformIntroduction platform="persona" />

        <section id="persona-modules" className="persona-modules" tabIndex={-1}>
          <h2>Start close to home.</h2>
          <p>Two modules connect the body and its immediate world. Soma and Morbus sit within Salus.</p>
          <div className="persona-module">
            <span className="atlas-index">01</span>
            <div><Link href="/platforms/persona/salus"><h3>Salus</h3></Link><p>Health &amp; care</p></div>
            <p>Understand health through the body, disease, and systems of care.</p>
            <nav aria-label="Explore Salus"><Link href="/platforms/persona/salus/soma">Soma · Body <span aria-hidden="true">→</span></Link><Link href="/platforms/persona/salus/soma/morbus">Morbus · Disease <span aria-hidden="true">→</span></Link></nav>
          </div>
          <div className="persona-module">
            <span className="atlas-index">02</span>
            <div><Link href="/platforms/persona/domus"><h3>Domus</h3></Link><p>Home &amp; daily life</p></div>
            <p>Explore the household as a physical, social, and ecological system.</p>
            <nav aria-label="Explore Domus"><Link href="/platforms/persona/domus">Explore Domus <span aria-hidden="true">→</span></Link></nav>
          </div>
        </section>

        <PlatformCouplingLinks platform="persona" />

        <ScaleRungLinks platform="persona" />
      </section>
      <SiteFooter />
    </main>
  );
}
