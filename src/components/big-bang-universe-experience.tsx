"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { mountBigBangUniverse } from "@/lib/big-bang-universe-runtime";

type BigBangUniverseExperienceProps = {
  className?: string;
  embedded?: boolean;
  siteIntro?: boolean;
};

export function BigBangUniverseExperience({
  className = "",
  embedded = false,
  siteIntro = false,
}: BigBangUniverseExperienceProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    return mountBigBangUniverse(root, {
      embeddedMode: embedded,
      siteIntroMode: siteIntro,
      syncHash: !siteIntro,
      onEnterObservableUniverse: () => router.push("/observable-universe"),
    });
  }, [embedded, router, siteIntro]);

  return (
    <div
      ref={rootRef}
      className={[
        "big-bang-universe prestart relative h-full min-h-screen overflow-hidden",
        embedded ? "embedded" : "",
        siteIntro ? "site-intro" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div id="stage">
        <canvas id="c" />

        {siteIntro ? (
          <button id="skipAnimationBtn" type="button">
            Skip animation
          </button>
        ) : null}

        <div id="title">
          <h1>The History of the Universe</h1>
          <p>13.8 billion years · logarithmic time</p>
        </div>

        <div id="composition">
          <h2>Composition of the Universe</h2>
          <div id="comp-era">Radiation-dominated era</div>
          <div id="comp-bar">
            <span className="seg-rad" id="seg-rad" style={{ width: "100%" }} />
            <span className="seg-mat" id="seg-mat" style={{ width: "0%" }} />
            <span className="seg-de" id="seg-de" style={{ width: "0%" }} />
          </div>
          <div id="comp-legend">
            <div className="lg">
              <i style={{ background: "#ff9a5c" }} />
              Radiation <b id="v-rad">100%</b>
            </div>
            <div className="lg">
              <i style={{ background: "#7f8dff" }} />
              Matter <b id="v-mat">0%</b>
            </div>
            <div className="lg">
              <i style={{ background: "#84c8d8" }} />
              Dark energy <b id="v-de">0%</b>
            </div>
          </div>
        </div>

        <div id="cards" />

        <div id="controls">
          <button className="btn icon" id="playBtn" type="button" aria-label="Play or pause" />
          <button className="btn icon" id="restartBtn" type="button" aria-label="Restart" title="Restart">
            <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
              <path
                d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"
                fill="currentColor"
              />
            </svg>
          </button>
          <div id="age">-</div>
          <div id="temp">-</div>
          <div id="scrubwrap">
            <input type="range" id="scrub" min="0" max="1000" defaultValue="0" aria-label="Scrub through time" />
            <div id="scrubtip" />
          </div>
          <div className="speeds" id="speeds">
            <button className="btn" type="button" data-s="0.5">
              0.5x
            </button>
            <button className="btn active" type="button" data-s="1">
              1x
            </button>
            <button className="btn" type="button" data-s="2">
              2x
            </button>
          </div>
          <button
            className="btn icon"
            id="themeBtn"
            type="button"
            aria-label="Toggle light or dark void"
            title="Toggle void theme"
            style={{ fontSize: 14 }}
          >
            ☾
          </button>
        </div>
      </div>
    </div>
  );
}
