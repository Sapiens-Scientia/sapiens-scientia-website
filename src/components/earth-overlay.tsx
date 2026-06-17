"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { dataIndexCategories, dataIndexCategoryHref } from "@/lib/data-index";
import {
  digitalDataIndexHighlights,
  digitalSystemNodes,
  earthSystemNodes,
  humanPlatformBridges,
  platformBridgeHighlights,
  type ConceptHighlight,
  type ConceptNode,
  type HumanPlatformBridge,
} from "@/lib/earth-systems";
import { earthVitalSignHighlights, type EarthVitalSign } from "@/lib/vital-signs";
import { useLiveVitalSigns, type LiveVitalSignsStatus } from "@/hooks/use-live-vital-signs";
import { VitalSignChart } from "@/components/vital-sign-chart";

type PopoutSide = "left" | "right";

type BridgeConnectorAnchor = {
  color: string;
  id: HumanPlatformBridge["id"];
  leftX: number;
  leftSourceX: number;
  leftSourceY: number;
  rightX: number;
  rightSourceX: number;
  rightSourceY: number;
  y: number;
};

type TimeZoneOption = {
  label: string;
  value: string;
};

const timeZoneOptions: TimeZoneOption[] = [
  { label: "New York", value: "America/New_York" },
  { label: "Los Angeles", value: "America/Los_Angeles" },
  { label: "UTC", value: "UTC" },
  { label: "London", value: "Europe/London" },
  { label: "Paris", value: "Europe/Paris" },
  { label: "Sao Paulo", value: "America/Sao_Paulo" },
  { label: "Singapore", value: "Asia/Singapore" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Sydney", value: "Australia/Sydney" },
];

function formatClockTime(date: Date | null, timeZone: string) {
  if (!date) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(date);
}

function formatClockDate(date: Date | null, timeZone: string) {
  if (!date) {
    return "---, -- ---";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone,
    weekday: "short",
  }).format(date);
}

function stopPanelScrollPropagation(event: React.WheelEvent<HTMLElement> | React.TouchEvent<HTMLElement>) {
  event.stopPropagation();
}

function useManualPanelWheel<TElement extends HTMLElement>() {
  const panelRef = useRef<TElement>(null);

  const handlePanelWheel = (event: React.WheelEvent<TElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const deltaScale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panel.clientHeight : 1;
    panel.scrollTop += event.deltaY * deltaScale;
  };

  return { handlePanelWheel, panelRef };
}

function ConceptColumn({
  align,
  highlights,
  nodes,
  headerAction,
  headerActionPosition = "after",
  noWrapTitle = false,
  onPanelPointerEnter,
  onPanelPointerLeave,
  panelRef,
  size = "large",
  title,
}: {
  align: "left" | "center" | "right";
  headerAction?: React.ReactNode;
  headerActionPosition?: "before" | "after";
  highlights?: ConceptHighlight[];
  noWrapTitle?: boolean;
  nodes: ConceptNode[];
  onPanelPointerEnter?: () => void;
  onPanelPointerLeave?: () => void;
  panelRef?: RefObject<HTMLElement | null>;
  size?: "large" | "compact";
  title: string;
}) {
  const isRightAligned = align === "right";
  const isCenterAligned = align === "center";
  const highlightLookup = useMemo(() => {
    const lookup = new Map<string, string>();

    highlights?.forEach((highlight) => {
      highlight.labels.forEach((label) => {
        if (!lookup.has(label)) {
          lookup.set(label, highlight.color);
        }
      });
    });

    return lookup;
  }, [highlights]);

  return (
    <aside
      ref={panelRef}
      className={[
        "scrollbar-hidden pointer-events-auto overflow-y-auto overscroll-contain py-4",
        "bg-black/42 text-white shadow-[0_0_28px_rgba(59,130,246,0.16)] backdrop-blur-sm",
        size === "large" ? "w-64" : "w-72",
        size === "large" ? "h-[72vh] max-lg:h-auto max-lg:max-h-[34vh]" : "max-h-[24vh]",
        "max-lg:w-full max-lg:px-4 max-lg:py-3",
        align === "left" ? "pl-6 pr-4 text-left" : "",
        isRightAligned ? "pl-4 pr-6 text-right max-lg:text-left" : "",
        isCenterAligned ? "px-6 text-center" : "",
      ].join(" ")}
      aria-label={title}
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheelCapture={stopPanelScrollPropagation}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div
        className={[
          "mb-3 flex items-center gap-2",
          isRightAligned ? "justify-end max-lg:justify-start" : "",
          isCenterAligned ? "justify-center" : "",
        ].join(" ")}
      >
        {headerActionPosition === "before" ? headerAction : null}
        <h2
          className={[
            "text-2xl font-semibold leading-none text-white max-lg:text-xl",
            noWrapTitle ? "whitespace-nowrap" : "",
          ].join(" ")}
        >
          {title}
        </h2>
        {headerActionPosition === "after" ? headerAction : null}
      </div>
      <ol className="space-y-1.5">
        {nodes.map((node) => (
          <ConceptColumnNode
            key={`${node.level}-${node.label}`}
            align={align}
            highlightColor={highlightLookup.get(node.label)}
            isCenterAligned={isCenterAligned}
            isRightAligned={isRightAligned}
            node={node}
            size={size}
          />
        ))}
      </ol>
    </aside>
  );
}

function ConceptColumnNode({
  align,
  highlightColor,
  isCenterAligned,
  isRightAligned,
  node,
  size,
}: {
  align: "left" | "center" | "right";
  highlightColor?: string;
  isCenterAligned: boolean;
  isRightAligned: boolean;
  node: ConceptNode;
  size: "large" | "compact";
}) {
  const displayColor = highlightColor ?? node.color;

  return (
    <li
      className={[
        "flex items-baseline gap-2 leading-tight text-slate-100/88 transition-all duration-300",
        size === "compact" && node.level === 0 ? "text-base" : "text-sm",
        highlightColor ? "translate-x-1 text-white" : "",
        isRightAligned ? "justify-end max-lg:justify-start" : "",
        isCenterAligned ? "justify-center" : "",
      ].join(" ")}
      style={{
        paddingLeft: align === "left" ? `${node.level * 0.72}rem` : undefined,
        paddingRight: align === "right" ? `${node.level * 0.72}rem` : undefined,
      }}
    >
      <span
        aria-hidden={!highlightColor}
        className={[
          "mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full transition-opacity duration-300",
          highlightColor ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{ backgroundColor: highlightColor, boxShadow: highlightColor ? `0 0 12px ${highlightColor}` : undefined }}
      />
      <span
        className={node.level === 0 ? "font-semibold text-sky-100" : "font-normal"}
        style={{
          color: displayColor,
          textShadow: highlightColor ? `0 0 12px ${highlightColor}` : undefined,
        }}
      >
        {node.href ? (
          <Link
            href={node.href}
            className="text-current underline-offset-4 transition-colors hover:text-white hover:underline focus:outline-none focus-visible:text-white focus-visible:underline"
          >
            {node.label}
          </Link>
        ) : (
          <span>{node.label}</span>
        )}
      </span>
    </li>
  );
}

function PopoutToggleButton({
  controlsId,
  isOpen,
  label,
  side = "right",
  onClick,
}: {
  controlsId: string;
  isOpen: boolean;
  label: string;
  side?: PopoutSide;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={isOpen ? `Hide ${label}` : `Show ${label}`}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      className="grid h-7 w-7 shrink-0 place-items-center border border-blue-300/24 bg-black/54 text-blue-200 shadow-[0_0_18px_rgba(59,130,246,0.16)] transition hover:border-blue-300/50 hover:text-white focus:outline-none focus-visible:border-blue-300/75"
      onClick={onClick}
    >
      <span
        aria-hidden="true"
        className={[
          "text-base leading-none transition-transform duration-200",
          side === "left" ? "rotate-180" : "",
          isOpen ? (side === "left" ? "rotate-0" : "rotate-180") : "",
        ].join(" ")}
      >
        ›
      </span>
    </button>
  );
}

function EarthVitalSignsPanel({
  isOpen,
  liveIds,
  onPanelPointerEnter,
  onPanelPointerLeave,
  signs,
  status,
}: {
  isOpen: boolean;
  liveIds: Set<string>;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
  signs: EarthVitalSign[];
  status: LiveVitalSignsStatus;
}) {
  const { handlePanelWheel, panelRef } = useManualPanelWheel<HTMLElement>();
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);

  return (
    <aside
      ref={panelRef}
      className={[
        "pointer-events-auto relative z-30 bg-black/58 text-white shadow-[0_0_34px_rgba(59,130,246,0.18)] backdrop-blur-md",
        "w-full p-4 lg:absolute lg:left-[calc(100%+0.75rem)] lg:top-0 lg:w-80",
        "scrollbar-hidden max-h-[46vh] overflow-y-auto overscroll-contain lg:max-h-[72vh]",
        isOpen ? "block" : "hidden",
      ].join(" ")}
      aria-label="Earth Vital Signs"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheel={handlePanelWheel}
      onWheelCapture={handlePanelWheel}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
            Open Sources
          </p>
          <h2 className="mt-1 text-2xl font-semibold leading-none text-white max-lg:text-xl">Earth Vital Signs</h2>
          {status === "loading" ? (
            <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-slate-500">
              Syncing live readings…
            </p>
          ) : status === "error" ? (
            <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-amber-400/80">
              Live sync unavailable — showing cached values
            </p>
          ) : liveIds.size > 0 ? (
            <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-emerald-400/80">
              {liveIds.size} live reading{liveIds.size === 1 ? "" : "s"}
            </p>
          ) : null}
        </div>
        <p className="shrink-0 pt-1 text-right font-mono text-[0.62rem] uppercase leading-tight tracking-[0.14em] text-slate-400">
          Value
        </p>
      </div>
      <dl className="mt-4 space-y-2">
        {signs.map((sign) => {
          const isExpanded = expandedLabel === sign.label;
          const dynamicStatusBar = sign.statusBar;

          return (
            <div
              key={sign.label}
              onClick={() => setExpandedLabel(isExpanded ? null : sign.label)}
              className={[
                "border-t border-white/10 pt-2.5 first:border-t-0 first:pt-0 cursor-pointer select-none rounded p-1.5 -mx-1.5 transition-all duration-300",
                isExpanded ? "bg-white/[0.04] border-l-2 border-l-sky-500 pl-2.5" : "hover:bg-white/[0.02]"
              ].join(" ")}
            >
              <dt className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-100">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: sign.accent, boxShadow: `0 0 12px ${sign.accent}` }}
                  />
                  <span className="truncate">{sign.label}</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-sky-200 font-bold">
                  {liveIds.has(sign.id) ? (
                    <span
                      className="rounded border border-emerald-400/35 bg-emerald-400/10 px-1 py-px text-[0.5rem] font-bold uppercase tracking-[0.12em] text-emerald-300"
                      title="Live reading from public data source"
                    >
                      live
                    </span>
                  ) : null}
                  {sign.value}
                </span>
              </dt>
              <dd
                className={[
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isExpanded ? "max-h-[380px] opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                ].join(" ")}
              >
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-slate-400">
                  Last updated: {sign.updated}
                </p>
                {dynamicStatusBar && (
                  <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
                    <div
                      className="flex h-2 overflow-hidden border border-white/10 bg-white/8"
                      aria-label={`${sign.label}: ${dynamicStatusBar.usedLabel}; ${dynamicStatusBar.remainingLabel}`}
                    >
                      <span
                        className="h-full bg-orange-400"
                        style={{ width: `${dynamicStatusBar.usedPercent}%` }}
                      />
                      <span
                        className="h-full bg-sky-300/70"
                        style={{ width: `${dynamicStatusBar.remainingPercent}%` }}
                      />
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-2 font-mono text-[0.62rem] uppercase leading-tight tracking-[0.1em] text-slate-400">
                      <span>{dynamicStatusBar.usedLabel}</span>
                      <span className="text-right">{dynamicStatusBar.remainingLabel}</span>
                    </div>
                  </div>
                )}
                <p className="mt-2 text-xs leading-snug text-slate-300/84">{sign.note}</p>
                
                <VitalSignChart sign={sign} />

                <div className="mt-2">
                  <a
                    href={sign.sourceHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-blue-300/85 underline-offset-4 transition-colors hover:text-white hover:underline focus:outline-none focus-visible:text-white focus-visible:underline"
                  >
                    Source: {sign.source}
                  </a>
                </div>
              </dd>
            </div>
          );
        })}
      </dl>
    </aside>
  );
}

function DataIndexPanel({
  isOpen,
  onPanelPointerEnter,
  onPanelPointerLeave,
}: {
  isOpen: boolean;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
}) {
  const { handlePanelWheel, panelRef } = useManualPanelWheel<HTMLElement>();

  return (
    <aside
      ref={panelRef}
      className={[
        "pointer-events-auto relative z-30 bg-black/58 text-white shadow-[0_0_34px_rgba(59,130,246,0.18)] backdrop-blur-md",
        "w-full p-4 lg:absolute lg:right-[calc(100%+0.75rem)] lg:top-0 lg:w-80",
        "scrollbar-hidden max-h-[46vh] overflow-y-auto overscroll-contain lg:max-h-[72vh]",
        isOpen ? "block" : "hidden",
      ].join(" ")}
      aria-label="Global Data Index"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheel={handlePanelWheel}
      onWheelCapture={handlePanelWheel}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
            Digital Sources
          </p>
          <h2 className="mt-1 text-2xl font-semibold leading-none text-white max-lg:text-xl">
            Global Data Index
          </h2>
        </div>
        <Link
          href="/projects/sapiens-scientia-data-index"
          className="shrink-0 pt-1 text-right font-mono text-[0.62rem] uppercase leading-tight tracking-[0.14em] text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline focus:outline-none focus-visible:text-white focus-visible:underline"
        >
          Full
          <br />
          Index
        </Link>
      </div>
      <div className="mt-4 space-y-4">
        {dataIndexCategories.map((category) => (
          <section key={category.name} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: category.color, boxShadow: `0 0 12px ${category.color}` }}
              />
              <Link
                href={dataIndexCategoryHref(category.name)}
                className="text-sm font-semibold text-slate-100 transition-colors hover:text-sky-200"
              >
                {category.name}
              </Link>
              <span className="ml-auto font-mono text-[0.62rem] uppercase tracking-[0.12em] text-slate-500">
                {category.entries.length}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {category.entries.map((entry) => (
                <a
                  key={`${category.name}-${entry.name}`}
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 border border-white/8 bg-white/[0.035] px-2.5 py-2 text-xs leading-tight text-slate-200/88 transition-colors hover:border-sky-200/35 hover:bg-sky-200/10 hover:text-white focus:outline-none focus-visible:border-sky-200/70"
                >
                  {entry.name}
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function EarthSystemsColumn({
  activeBridge,
  panelRef,
  onPanelPointerEnter,
  onPanelPointerLeave,
}: {
  activeBridge: HumanPlatformBridge | null;
  panelRef: RefObject<HTMLElement | null>;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
}) {
  const { signs, liveIds, status } = useLiveVitalSigns();
  const [isVitalSignsOpen, setIsVitalSignsOpen] = useState(false);
  const earthSystemHighlights = useMemo<ConceptHighlight[]>(
    () =>
      earthVitalSignHighlights.map((highlight) => ({
        color: highlight.color,
        labels: [highlight.label],
      })),
    [],
  );
  const activeHighlights = [
    ...(isVitalSignsOpen ? earthSystemHighlights : []),
    ...platformBridgeHighlights(activeBridge, "earth"),
  ];

  return (
    <div
      className="pointer-events-auto relative flex flex-col gap-3 lg:block"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheelCapture={stopPanelScrollPropagation}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div className="relative">
        <ConceptColumn
          align="left"
          highlights={activeHighlights}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
          panelRef={panelRef}
          headerAction={(
            <PopoutToggleButton
              controlsId="earth-vital-signs-panel"
              isOpen={isVitalSignsOpen}
              label="Earth Vital Signs"
              onClick={() => setIsVitalSignsOpen((value) => !value)}
            />
          )}
          title="Earth Systems"
          nodes={earthSystemNodes}
        />
      </div>
      <div id="earth-vital-signs-panel">
        <EarthVitalSignsPanel
          isOpen={isVitalSignsOpen}
          liveIds={liveIds}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
          signs={signs}
          status={status}
        />
      </div>
    </div>
  );
}

function DigitalSystemsColumn({
  activeBridge,
  panelRef,
  onPanelPointerEnter,
  onPanelPointerLeave,
}: {
  activeBridge: HumanPlatformBridge | null;
  panelRef: RefObject<HTMLElement | null>;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
}) {
  const [isDataIndexOpen, setIsDataIndexOpen] = useState(false);
  const activeHighlights = [
    ...(isDataIndexOpen ? digitalDataIndexHighlights : []),
    ...platformBridgeHighlights(activeBridge, "digital"),
  ];

  return (
    <div
      className="pointer-events-auto relative flex flex-col gap-3 lg:block"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheelCapture={stopPanelScrollPropagation}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div className="relative">
        <ConceptColumn
          align="left"
          highlights={activeHighlights}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
          panelRef={panelRef}
          headerActionPosition="before"
          noWrapTitle
          headerAction={(
            <PopoutToggleButton
              controlsId="digital-data-index-panel"
              isOpen={isDataIndexOpen}
              label="Global Data Index"
              side="left"
              onClick={() => setIsDataIndexOpen((value) => !value)}
            />
          )}
          title="Digital Systems"
          nodes={digitalSystemNodes}
        />
      </div>
      <div id="digital-data-index-panel">
        <DataIndexPanel
          isOpen={isDataIndexOpen}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
        />
      </div>
    </div>
  );
}

function BridgeConnectorLayer({
  activeBridgeId,
  bridgeItemRefs,
  digitalPanelRef,
  earthPanelRef,
  panelRef,
}: {
  activeBridgeId: HumanPlatformBridge["id"] | null;
  bridgeItemRefs: RefObject<Map<HumanPlatformBridge["id"], HTMLLIElement>>;
  digitalPanelRef: RefObject<HTMLElement | null>;
  earthPanelRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [anchors, setAnchors] = useState<BridgeConnectorAnchor[]>([]);

  useEffect(() => {
    let frameId = 0;

    const measureAnchors = () => {
      frameId = 0;

      const svg = svgRef.current;
      const panel = panelRef.current;
      const earthPanel = earthPanelRef.current;
      const digitalPanel = digitalPanelRef.current;

      if (!svg || !panel || !earthPanel || !digitalPanel) {
        return;
      }

      const svgRect = svg.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const earthPanelRect = earthPanel.getBoundingClientRect();
      const digitalPanelRect = digitalPanel.getBoundingClientRect();
      const fallbackStep = panelRect.height / (humanPlatformBridges.length + 1);
      const panelTop = panelRect.top - svgRect.top;
      const panelBottom = panelRect.bottom - svgRect.top;
      const earthBottomY = earthPanelRect.bottom - svgRect.top;
      const digitalBottomY = digitalPanelRect.bottom - svgRect.top;

      setAnchors(
        humanPlatformBridges.map((bridge, index) => {
          const itemRect = bridgeItemRefs.current.get(bridge.id)?.getBoundingClientRect();
          const rawY = itemRect
            ? itemRect.top + itemRect.height / 2 - svgRect.top
            : panelTop + fallbackStep * (index + 1);
          const y = Math.min(Math.max(rawY, panelTop + 12), panelBottom - 12);

          return {
            color: bridge.color,
            id: bridge.id,
            leftX: panelRect.left - svgRect.left,
            leftSourceX: earthPanelRect.left + earthPanelRect.width / 2 - svgRect.left,
            leftSourceY: earthBottomY,
            rightX: panelRect.right - svgRect.left,
            rightSourceX: digitalPanelRect.left + digitalPanelRect.width / 2 - svgRect.left,
            rightSourceY: digitalBottomY,
            y,
          };
        }),
      );
    };

    const scheduleMeasure = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(measureAnchors);
    };

    scheduleMeasure();

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    const panel = panelRef.current;
    const svg = svgRef.current;

    if (panel) {
      resizeObserver.observe(panel);
      panel.addEventListener("scroll", scheduleMeasure, { passive: true });
    }

    const earthPanel = earthPanelRef.current;
    const digitalPanel = digitalPanelRef.current;

    if (earthPanel) {
      resizeObserver.observe(earthPanel);
      earthPanel.addEventListener("scroll", scheduleMeasure, { passive: true });
    }

    if (digitalPanel) {
      resizeObserver.observe(digitalPanel);
      digitalPanel.addEventListener("scroll", scheduleMeasure, { passive: true });
    }

    if (svg) {
      resizeObserver.observe(svg);
    }

    window.addEventListener("resize", scheduleMeasure);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver.disconnect();
      panel?.removeEventListener("scroll", scheduleMeasure);
      earthPanel?.removeEventListener("scroll", scheduleMeasure);
      digitalPanel?.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [activeBridgeId, bridgeItemRefs, digitalPanelRef, earthPanelRef, panelRef]);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-[9] hidden h-full w-full overflow-visible lg:block"
      aria-hidden="true"
    >
      <defs>
        <filter id="bridge-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {anchors.map((anchor) => {
        const isActive = activeBridgeId === anchor.id;
        const opacity = activeBridgeId ? (isActive ? 0.88 : 0.11) : 0.24;
        const strokeWidth = isActive ? 3.4 : 1.8;
        const leftPath = [
          `M ${anchor.leftSourceX} ${anchor.leftSourceY}`,
          `C ${anchor.leftSourceX + 130} ${anchor.leftSourceY + 16}, ${anchor.leftX - 44} ${anchor.y}, ${anchor.leftX} ${anchor.y}`,
        ].join(" ");
        const rightPath = [
          `M ${anchor.rightSourceX} ${anchor.rightSourceY}`,
          `C ${anchor.rightSourceX - 130} ${anchor.rightSourceY + 16}, ${anchor.rightX + 44} ${anchor.y}, ${anchor.rightX} ${anchor.y}`,
        ].join(" ");

        return (
          <g key={anchor.id} filter={isActive ? "url(#bridge-glow)" : undefined}>
            <path
              d={leftPath}
              fill="none"
              stroke={anchor.color}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            <path
              d={rightPath}
              fill="none"
              stroke={anchor.color}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            <circle
              cx={anchor.leftSourceX}
              cy={anchor.leftSourceY}
              r={isActive ? 4.2 : 2.8}
              fill={anchor.color}
              opacity={opacity}
            />
            <circle
              cx={anchor.rightSourceX}
              cy={anchor.rightSourceY}
              r={isActive ? 4.2 : 2.8}
              fill={anchor.color}
              opacity={opacity}
            />
            <circle cx={anchor.leftX} cy={anchor.y} r={isActive ? 5 : 3.4} fill={anchor.color} opacity={opacity} />
            <circle cx={anchor.rightX} cy={anchor.y} r={isActive ? 5 : 3.4} fill={anchor.color} opacity={opacity} />
          </g>
        );
      })}
    </svg>
  );
}

function HumanPlatformsBridgePanel({
  activeBridgeId,
  onBridgeEnter,
  onBridgeLeave,
  onPanelPointerEnter,
  onPanelPointerLeave,
  panelRef,
  registerBridgeItem,
}: {
  activeBridgeId: HumanPlatformBridge["id"] | null;
  onBridgeEnter: (bridge: HumanPlatformBridge) => void;
  onBridgeLeave: () => void;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
  panelRef: RefObject<HTMLElement | null>;
  registerBridgeItem: (id: HumanPlatformBridge["id"]) => (node: HTMLLIElement | null) => void;
}) {
  return (
    <aside
      ref={panelRef}
      className="scrollbar-hidden pointer-events-auto max-h-[24vh] w-72 overflow-y-auto overscroll-contain bg-black/42 px-6 py-4 text-center text-white shadow-[0_0_28px_rgba(59,130,246,0.16)] backdrop-blur-sm max-lg:w-full max-lg:px-4 max-lg:py-3"
      aria-label="Sapiens Platforms"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={() => {
        onBridgeLeave();
        onPanelPointerLeave();
      }}
      onWheelCapture={stopPanelScrollPropagation}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <h2 className="mb-3 text-2xl font-semibold leading-none text-white max-lg:text-xl">
        <Link
          href="/platforms"
          className="rounded-sm transition-colors hover:text-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          Sapiens Platforms
        </Link>
      </h2>
      <ol className="space-y-1.5">
        {humanPlatformBridges.map((bridge) => {
          const isActive = activeBridgeId === bridge.id;

          return (
            <li
              ref={registerBridgeItem(bridge.id)}
              key={bridge.id}
              className={[
                "grid justify-items-center gap-1 py-0.5 transition-all duration-300",
                isActive ? "scale-[1.02]" : "",
              ].join(" ")}
              onPointerEnter={() => onBridgeEnter(bridge)}
            >
              <Link
                href={bridge.href}
                className="inline-flex items-center justify-center gap-2 text-base font-semibold text-sky-100 underline-offset-4 transition-colors hover:text-white hover:underline focus:outline-none focus-visible:text-white focus-visible:underline"
                style={{
                  color: isActive ? bridge.color : undefined,
                  textShadow: isActive ? `0 0 14px ${bridge.color}` : undefined,
                }}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "h-1.5 w-1.5 rounded-full transition-opacity duration-300",
                    isActive ? "opacity-100" : "opacity-45",
                  ].join(" ")}
                  style={{ backgroundColor: bridge.color, boxShadow: `0 0 12px ${bridge.color}` }}
                />
                {bridge.title}
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function TimeOverlay({
  onPanelPointerEnter,
  onPanelPointerLeave,
}: {
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
}) {
  const [selectedTimeZone, setSelectedTimeZone] = useState("America/New_York");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const tick = () => {
      setNow(new Date());
    };

    const timeoutId = window.setTimeout(tick, 0);
    const intervalId = window.setInterval(tick, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  const selectedOption = timeZoneOptions.find((option) => option.value === selectedTimeZone);
  const selectedLabel = selectedOption?.label ?? selectedTimeZone.replaceAll("_", " ");

  return (
    <aside
      className="pointer-events-auto w-[min(34rem,calc(100vw-2rem))] bg-black/48 px-4 py-3 text-center text-white shadow-[0_0_28px_rgba(59,130,246,0.16)] backdrop-blur-sm"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheelCapture={stopPanelScrollPropagation}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-3">
        <div className="grid min-w-0 grid-rows-[2.35rem_auto_auto]">
          <p className="flex items-center justify-center text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
            UTC Time
          </p>
          <p className="font-mono text-2xl leading-none text-sky-100">{formatClockTime(now, "UTC")}</p>
          <p className="mt-1 text-xs text-slate-300/80">{formatClockDate(now, "UTC")}</p>
        </div>
        <div className="h-14 w-px bg-white/12 max-sm:h-px max-sm:w-full" />
        <div className="grid min-w-0 grid-rows-[2.35rem_auto_auto]">
          <div className="flex items-center justify-center gap-3">
            <label
              className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-blue-300/80"
              htmlFor="timezone-clock-select"
            >
              Timezone
            </label>
            <select
              id="timezone-clock-select"
              value={selectedTimeZone}
              className="max-w-32 border border-white/12 bg-black/55 px-2 py-1 text-xs text-slate-100 outline-none transition focus:border-sky-300/70"
              onChange={(event) => setSelectedTimeZone(event.target.value)}
            >
              {selectedOption ? null : <option value={selectedTimeZone}>{selectedLabel}</option>}
              {timeZoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <p className="font-mono text-2xl leading-none text-white">{formatClockTime(now, selectedTimeZone)}</p>
          <p className="mt-1 text-xs text-slate-300/80">{formatClockDate(now, selectedTimeZone)}</p>
        </div>
      </div>
    </aside>
  );
}

export function EarthOverlay({
  isMetaEarthMerged,
  onMetaEarthToggle,
  onPanelPointerEnter,
  onPanelPointerLeave,
}: {
  isMetaEarthMerged: boolean;
  onMetaEarthToggle: () => void;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
}) {
  const [activeBridge, setActiveBridge] = useState<HumanPlatformBridge | null>(null);
  const bridgeItemRefs = useRef(new Map<HumanPlatformBridge["id"], HTMLLIElement>());
  const earthSystemsPanelRef = useRef<HTMLElement | null>(null);
  const digitalSystemsPanelRef = useRef<HTMLElement | null>(null);
  const humanPlatformsPanelRef = useRef<HTMLElement | null>(null);
  const registerBridgeItem = useCallback(
    (id: HumanPlatformBridge["id"]) => (node: HTMLLIElement | null) => {
      if (node) {
        bridgeItemRefs.current.set(id, node);
        return;
      }

      bridgeItemRefs.current.delete(id);
    },
    [],
  );

  return (
    <>
      <BridgeConnectorLayer
        activeBridgeId={activeBridge?.id ?? null}
        bridgeItemRefs={bridgeItemRefs}
        digitalPanelRef={digitalSystemsPanelRef}
        earthPanelRef={earthSystemsPanelRef}
        panelRef={humanPlatformsPanelRef}
      />
      <header className="pointer-events-none absolute inset-x-4 top-8 z-10 flex flex-col items-center gap-4 max-lg:top-4">
        <p className="bg-gradient-to-r from-emerald-300/84 to-blue-300/88 bg-clip-text text-2xl font-semibold uppercase tracking-[0.35em] text-transparent drop-shadow-[0_0_18px_rgba(96,165,250,0.42)] sm:text-4xl">
          Sapiens Scientia
        </p>
        <TimeOverlay
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
        />
      </header>
      {isMetaEarthMerged ? (
        <button
          type="button"
          aria-label="Separate Meta Earth"
          className="pointer-events-auto absolute left-1/2 top-[calc(50%-9.25rem)] z-40 h-10 w-36 -translate-x-1/2 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/80"
          onClick={onMetaEarthToggle}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-between gap-6 px-8 max-lg:inset-x-4 max-lg:bottom-36 max-lg:top-auto max-lg:grid max-lg:translate-y-0 max-lg:grid-cols-2 max-lg:px-0 max-md:grid-cols-1">
        <EarthSystemsColumn
          activeBridge={activeBridge}
          panelRef={earthSystemsPanelRef}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
        />
        <DigitalSystemsColumn
          activeBridge={activeBridge}
          panelRef={digitalSystemsPanelRef}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex flex-col items-center gap-4 px-8 max-lg:inset-x-4 max-lg:bottom-6 max-lg:px-0">
        <HumanPlatformsBridgePanel
          activeBridgeId={activeBridge?.id ?? null}
          onBridgeEnter={setActiveBridge}
          onBridgeLeave={() => setActiveBridge(null)}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
          panelRef={humanPlatformsPanelRef}
          registerBridgeItem={registerBridgeItem}
        />
      </div>
    </>
  );
}
