"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { AtlasOverview } from "@/components/atlas-overview";
import { HomeOverview } from "@/components/home-overview";
import { MetaEntityFramework } from "@/components/meta-entity-framework";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { useUrlHash } from "@/hooks/use-url-hash";

// The overview does not need the workspace's overlays, source panels, or camera
// controls. Download those only when the reader enters the advanced view.
const MetaEarthHero = dynamic(
  () => import("@/components/meta-earth-hero").then((module) => module.MetaEarthHero),
  { loading: () => <div className="flex min-h-[48rem] items-center justify-center text-sm text-slate-400" role="status">Opening the globe workspace…</div> },
);

export function MetaEarthExperience() {
  const [hash, setHash] = useUrlHash();
  const workspace = hash === "globe";
  const contentRef = useRef<HTMLDivElement>(null);
  const changeView = (open: boolean) => {
    setHash(open ? "globe" : "");
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => contentRef.current?.focus({ preventScroll: true }));
  };

  return (
    <>
      <div className="atlas-navigation atlas-frame"><SiteNav /></div>
      <div id="main-content" tabIndex={-1} ref={contentRef}>
        {workspace ? (
          <>
            <div className="atlas-frame atlas-workspace-heading">
              <button type="button" onClick={() => changeView(false)} className="atlas-text-link"><ArrowLeft size={18} aria-hidden="true" />Back to the atlas</button>
              <h1>Meta Earth · Globe workspace</h1>
            </div>
            <MetaEarthHero />
          </>
        ) : (
          <div className="atlas-frame"><AtlasOverview onOpenGlobe={() => changeView(true)} /></div>
        )}
        <HomeOverview />
        <MetaEntityFramework />
      </div>
      <div className="atlas-frame pb-12"><SiteFooter /></div>
    </>
  );
}
