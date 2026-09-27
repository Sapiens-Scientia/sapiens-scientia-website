"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Globe2 } from "lucide-react";
import { useRef } from "react";
import { AppProvider } from "@/components/earthview/contexts";
import { atlasDimensions, atlasLenses } from "@/lib/exploration";
import { useTheme } from "@/lib/use-theme";
import { useUrlHash } from "@/hooks/use-url-hash";
import { getChartContinuationCamera } from "@/components/lab/earth-geometry";
import { useVisibleScene } from "@/hooks/use-visible-scene";

const OVERVIEW_CAMERA = getChartContinuationCamera(0.95, 2.8);

const Globe = dynamic(() => import("@/components/lab/lab-earth-view").then((m) => m.LabEarthView), {
  ssr: false,
  loading: () => <div className="atlas-globe-loading" role="status">Loading the connected Earth…</div>,
});

export function AtlasOverview({ onOpenGlobe }: { onOpenGlobe: () => void }) {
  const [hash, setHash] = useUrlHash();
  const { theme } = useTheme();
  const sceneRef = useRef<HTMLDivElement>(null);
  const active = useVisibleScene(sceneRef);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = Math.max(0, atlasLenses.findIndex((lens) => hash === `lens-${lens.id}`));
  const lens = atlasLenses[selected];

  const selectLens = (index: number, focus = false) => {
    setHash(`lens-${atlasLenses[index].id}`);
    if (focus) tabRefs.current[index]?.focus();
  };

  return (
    <>
      <section className="atlas-introduction" aria-labelledby="atlas-title">
        <div className="atlas-introduction-copy">
          <h1 id="atlas-title">One world.<br />Many ways in.</h1>
          <p className="atlas-introduction-lede">Explore the human, the societies we build, and the planet we share.</p>
          <div className="atlas-lens-tabs" role="tablist" aria-label="Choose a lens">
            {atlasLenses.map((item, index) => (
              <button
                key={item.id} type="button" role="tab" id={`lens-tab-${item.id}`}
                ref={(element) => { tabRefs.current[index] = element; }}
                aria-selected={selected === index} aria-controls="atlas-lens-panel" tabIndex={selected === index ? 0 : -1}
                style={{ color: item.color }} onClick={() => selectLens(index)}
                onKeyDown={(event) => {
                  let next: number | null = null;
                  if (event.key === "ArrowRight") next = (selected + 1) % atlasLenses.length;
                  if (event.key === "ArrowLeft") next = (selected + atlasLenses.length - 1) % atlasLenses.length;
                  if (event.key === "Home") next = 0;
                  if (event.key === "End") next = atlasLenses.length - 1;
                  if (next !== null) { event.preventDefault(); selectLens(next, true); }
                }}
              >{item.name}</button>
            ))}
          </div>
          <div id="atlas-lens-panel" role="tabpanel" aria-labelledby={`lens-tab-${lens.id}`} className="atlas-lens-panel" tabIndex={0}>
            <h2>{lens.title}</h2>
            <p>{lens.description}</p>
            <Link href={lens.href} className="atlas-action" style={{ borderColor: lens.color }}>
              Explore {lens.name}<ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <Link href="/platforms" className="atlas-text-link">See how the platforms connect<ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
        <div className="atlas-globe" ref={sceneRef}>
          <div className="atlas-globe-scene">
            <AppProvider>
              <Globe className="h-full w-full" mode="globe" connectivity showGuides={false}
                isDarkOverride={theme === "dark"} backgroundColor={theme === "dark" ? "#080b0e" : "#f3f0ea"}
                cameraOverride={OVERVIEW_CAMERA} paused={!active} enableWheelZoom={false} />
            </AppProvider>
          </div>
          <p className="atlas-globe-caption">A connected planet<span>Illustrative network · drag to turn</span></p>
          <button type="button" className="atlas-globe-button" onClick={onOpenGlobe}><Globe2 size={17} aria-hidden="true" />Open globe workspace</button>
        </div>
      </section>
      <nav className="atlas-dimensions" aria-label="Ways to explore">
        {atlasDimensions.map((dimension, index) => (
          <Link key={dimension.href} href={dimension.href} className="atlas-dimension">
            <span className="atlas-index">0{index + 1}</span>
            <h2>{dimension.title}</h2><p>{dimension.description}</p>
            <span className="atlas-dimension-link"><ArrowRight size={18} aria-hidden="true" />{dimension.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
