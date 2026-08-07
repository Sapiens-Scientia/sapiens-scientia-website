"use client";

import { MetaEarthHero } from "@/components/meta-earth-hero";
import { HomeOverview } from "@/components/home-overview";
import { MetaEntityFramework } from "@/components/meta-entity-framework";
import { SiteFooter } from "@/components/site-footer";

// Meta Earth reads top to bottom as one argument: the globe carries the
// infrastructure layer humanity built, the overview turns the site into a
// working map, and the Meta-Entity framework names the kind of structure that
// builds and maintains a layer no individual could.
export function MetaEarthExperience() {
  return (
    <>
      <MetaEarthHero />
      <HomeOverview />
      <MetaEntityFramework />
      <div className="bg-black px-6 pb-24 text-white sm:px-10 sm:pb-28">
        <SiteFooter />
      </div>
    </>
  );
}
