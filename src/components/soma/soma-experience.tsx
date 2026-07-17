"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  BetweenVerticalStart,
  Eye,
  Layers3,
  RotateCcw,
  RotateCw,
  ScanLine,
  Tags,
} from "lucide-react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type WheelEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { morbusDiseases } from "@/lib/morbus";
import {
  somaLenses,
  somaScaleStages,
  somaSystems,
  type SomaLensId,
  type SomaScaleId,
  type SomaSystem,
} from "@/lib/soma";
import { useTheme } from "@/lib/use-theme";
import {
  scaleOrder,
  somaSystemVisualById,
  somaSystemVisuals,
} from "@/components/soma/soma-scene-data";
import type { SomaViewMode } from "@/components/soma/soma-atlas-canvas";

const SomaAtlasCanvas = dynamic(
  () => import("@/components/soma/soma-atlas-canvas"),
  {
    ssr: false,
    loading: () => (
      <div className="soma-canvas-loading" role="status">
        <span />
        Assembling the living atlas
      </div>
    ),
  },
);

type SomaState = {
  systemId: string;
  scale: SomaScaleId;
  lens: SomaLensId;
  mode: SomaViewMode;
  labels: boolean;
  autoRotate: boolean;
  hydrated: boolean;
};

type SomaAction =
  | { type: "hydrate"; state: Partial<SomaState> }
  | { type: "select-system"; systemId: string }
  | { type: "select-scale"; scale: SomaScaleId }
  | { type: "select-lens"; lens: SomaLensId }
  | { type: "toggle-mode"; mode: Exclude<SomaViewMode, "context"> }
  | { type: "toggle-labels" }
  | { type: "toggle-rotation" }
  | { type: "reset-view" };

const initialState: SomaState = {
  systemId: "cardiovascular",
  scale: "system",
  lens: "anatomy",
  mode: "context",
  labels: true,
  autoRotate: false,
  hydrated: false,
};

const systemIds = new Set(somaSystems.map((system) => system.id));
const scaleIds = new Set<SomaScaleId>(scaleOrder);
const lensIds = new Set<SomaLensId>(somaLenses.map((lens) => lens.id));
const modeIds = new Set<SomaViewMode>(["context", "isolate", "explode", "xray"]);

function reducer(state: SomaState, action: SomaAction): SomaState {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.state, hydrated: true };
    case "select-system":
      return { ...state, systemId: action.systemId };
    case "select-scale":
      return { ...state, scale: action.scale };
    case "select-lens":
      return { ...state, lens: action.lens };
    case "toggle-mode":
      return { ...state, mode: state.mode === action.mode ? "context" : action.mode };
    case "toggle-labels":
      return { ...state, labels: !state.labels };
    case "toggle-rotation":
      return { ...state, autoRotate: !state.autoRotate };
    case "reset-view":
      return {
        ...state,
        scale: "system",
        lens: "anatomy",
        mode: "context",
        labels: true,
        autoRotate: false,
      };
  }
}

function lensContent(system: SomaSystem, lens: SomaLensId) {
  if (lens === "anatomy") {
    return {
      summary: system.anatomy.summary,
      items: system.anatomy.structures,
      label: "Key structures",
    };
  }
  if (lens === "physiology") {
    return {
      summary: system.physiology.summary,
      items: system.physiology.processes,
      label: "Core processes",
    };
  }
  return {
    summary: system.histology.summary,
    items: system.histology.tissues,
    label: "Characteristic tissues",
  };
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

function ScaleRail({
  activeScale,
  onSelect,
}: {
  activeScale: SomaScaleId;
  onSelect: (scale: SomaScaleId) => void;
}) {
  return (
    <nav className="soma-scale-rail" aria-label="Biological scale">
      <div className="soma-scale-rule" aria-hidden />
      {somaScaleStages.map((stage) => {
        const active = stage.id === activeScale;
        return (
          <button
            key={stage.id}
            type="button"
            className="soma-scale-step"
            aria-current={active ? "step" : undefined}
            onClick={() => onSelect(stage.id)}
          >
            <span className="soma-scale-dot" aria-hidden />
            <span className="soma-scale-name">{stage.name}</span>
            <span className="soma-scale-value">{stage.scale}</span>
          </button>
        );
      })}
    </nav>
  );
}

function SystemRail({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (systemId: string) => void;
}) {
  return (
    <nav className="soma-system-rail" aria-label="Organ systems">
      {somaSystemVisuals.map((visual) => (
        <button
          key={visual.id}
          type="button"
          aria-pressed={selectedId === visual.id}
          onClick={() => onSelect(visual.id)}
          className="soma-system-option"
          style={{ "--system-color": visual.color } as CSSProperties}
        >
          <span aria-hidden />
          {visual.shortName}
        </button>
      ))}
    </nav>
  );
}

function StageHeading({ state, system }: { state: SomaState; system: SomaSystem }) {
  const visual = somaSystemVisualById.get(system.id) ?? somaSystemVisuals[0];
  if (state.scale === "organism") {
    return {
      title: "Human organism",
      latin: "Homo sapiens",
      summary: "Ten integrated system groups coordinate trillions of cells as one living body.",
      label: "Integrated systems",
      items: somaSystemVisuals.map((item) => item.shortName),
    };
  }

  const content = lensContent(system, state.lens);
  if (state.scale === "system") {
    return {
      title: system.name,
      latin: system.latin,
      summary: state.lens === "anatomy" ? system.summary : content.summary,
      label: content.label,
      items: content.items,
    };
  }

  if (state.scale === "organ") {
    return {
      title: visual.organName,
      latin: visual.organLatin,
      summary:
        state.lens === "anatomy"
          ? `${visual.organName} is the representative structure for this system view. Organs can belong to more than one functional system.`
          : content.summary,
      label: content.label,
      items: content.items,
    };
  }

  if (state.scale === "tissue") {
    return {
      title: system.histology.tissues[0] ?? "Functional tissue unit",
      latin: "microarchitectura repraesentativa",
      summary:
        state.lens === "histology"
          ? system.histology.summary
          : "A representative tissue world reveals the repeated cellular neighborhoods where organ function happens.",
      label: "Tissue context",
      items: system.histology.tissues,
    };
  }

  if (state.scale === "cell") {
    return {
      title: visual.cellName,
      latin: visual.cellLatin,
      summary: state.lens === "anatomy" ? visual.cellSummary : content.summary,
      label: state.lens === "anatomy" ? "Cell structures" : content.label,
      items: state.lens === "anatomy" ? visual.cellStructures : content.items,
    };
  }

  if (state.scale === "organelle") {
    return {
      title: "Mitochondrion",
      latin: "mitochondrium",
      summary:
        "A double-membrane organelle that couples a proton gradient to ATP production. Its form and abundance vary by cell type and energetic demand.",
      label: "Structural features",
      items: ["outer membrane", "inner membrane", "cristae", "matrix", "mitochondrial DNA"],
    };
  }

  return {
    title: "ATP synthase",
    latin: "complexus ATP synthasis",
    summary:
      "A rotary molecular machine in the inner mitochondrial membrane that uses proton flow to make ATP, the cell's immediate energy currency.",
    label: "Molecular context",
    items: ["proton gradient", "membrane rotor", "catalytic head", "ADP", "ATP"],
  };
}

function Inspector({
  state,
  system,
  onLensChange,
  onScaleChange,
}: {
  state: SomaState;
  system: SomaSystem;
  onLensChange: (lens: SomaLensId) => void;
  onScaleChange: (scale: SomaScaleId) => void;
}) {
  const heading = StageHeading({ state, system });
  const currentIndex = scaleOrder.indexOf(state.scale);
  const nextScale = scaleOrder[currentIndex + 1];
  const linkedDiseases = useMemo(
    () =>
      system.morbusLinks
        .map((id) => morbusDiseases.find((disease) => disease.id === id))
        .filter((disease): disease is NonNullable<typeof disease> => Boolean(disease)),
    [system],
  );

  return (
    <aside className="soma-inspector" aria-live="polite">
      <div className="soma-inspector-path">
        <span>{system.name.replace(/ System| & Lymphatic System/, "")}</span>
        <span aria-hidden>/</span>
        <span>{somaScaleStages[currentIndex]?.name}</span>
      </div>
      <h2>{heading.title}</h2>
      <p className="soma-inspector-latin">{heading.latin}</p>

      <div className="soma-lens-tabs" role="tablist" aria-label="Disciplinary lens">
        {somaLenses.map((lens) => (
          <button
            key={lens.id}
            type="button"
            role="tab"
            aria-selected={state.lens === lens.id}
            onClick={() => onLensChange(lens.id)}
          >
            {lens.name}
          </button>
        ))}
      </div>

      <p className="soma-inspector-summary">{heading.summary}</p>

      <div className="soma-inspector-structures">
        <p>{heading.label}</p>
        <ul>
          {heading.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      {nextScale ? (
        <button
          type="button"
          className="soma-enter-scale"
          onClick={() => onScaleChange(nextScale)}
        >
          Enter {somaScaleStages[currentIndex + 1]?.name.toLowerCase()}
          <span aria-hidden>→</span>
        </button>
      ) : null}

      <div className="soma-morbus-link">
        <Link href="/platforms/persona/salus/soma/morbus">
          See related conditions in Morbus <span aria-hidden>→</span>
        </Link>
        {linkedDiseases.length > 0 ? (
          <div>
            {linkedDiseases.slice(0, 4).map((disease) => (
              <Link
                key={disease.id}
                href={`/platforms/persona/salus/soma/morbus#${disease.id}`}
              >
                {disease.name.replace(/ \(.*\)/, "")}
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <details className="soma-sources">
        <summary>Model notes &amp; sources</summary>
        <p>
          A schematic educational model, not diagnostic anatomy. Microscopic worlds are representative and normalized between scale stages.
        </p>
        <div>
          <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/1-2-structural-organization-of-the-human-body" target="_blank" rel="noreferrer">
            OpenStax · Structural organization
          </a>
          <a href="https://humanatlas.io/3d-reference-library" target="_blank" rel="noreferrer">
            HuBMAP · Human Reference Atlas
          </a>
          <a href="https://github.com/Z-Anatomy/Models-of-human-anatomy" target="_blank" rel="noreferrer">
            Z-Anatomy · body context (CC BY-SA 4.0)
          </a>
        </div>
      </details>
    </aside>
  );
}

function ControlButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="soma-canvas-control"
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

export function SomaExperience() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const wheelLock = useRef(0);
  const system = somaSystems.find((item) => item.id === state.systemId) ?? somaSystems[1];
  const activeScaleIndex = scaleOrder.indexOf(state.scale);

  useEffect(() => {
    const url = new URL(window.location.href);
    const legacyHash = url.hash.replace(/^#/, "");
    const requestedSystem = url.searchParams.get("system") ?? legacyHash;
    const requestedScale = url.searchParams.get("scale");
    const requestedLens = url.searchParams.get("lens");
    const requestedMode = url.searchParams.get("mode");
    dispatch({
      type: "hydrate",
      state: {
        systemId: requestedSystem && systemIds.has(requestedSystem) ? requestedSystem : initialState.systemId,
        scale: requestedScale && scaleIds.has(requestedScale as SomaScaleId)
          ? requestedScale as SomaScaleId
          : initialState.scale,
        lens: requestedLens && lensIds.has(requestedLens as SomaLensId)
          ? requestedLens as SomaLensId
          : initialState.lens,
        mode: requestedMode && modeIds.has(requestedMode as SomaViewMode)
          ? requestedMode as SomaViewMode
          : initialState.mode,
      },
    });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const url = new URL(window.location.href);
    url.searchParams.set("system", state.systemId);
    url.searchParams.set("scale", state.scale);
    url.searchParams.set("lens", state.lens);
    if (state.mode === "context") url.searchParams.delete("mode");
    else url.searchParams.set("mode", state.mode);
    if (systemIds.has(url.hash.replace(/^#/, ""))) url.hash = "";
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [state.hydrated, state.lens, state.mode, state.scale, state.systemId]);

  const selectSystem = useCallback((systemId: string) => {
    dispatch({ type: "select-system", systemId });
  }, []);

  const selectScale = useCallback((scale: SomaScaleId) => {
    dispatch({ type: "select-scale", scale });
  }, []);

  const moveScale = useCallback((direction: -1 | 1) => {
    const nextIndex = Math.min(scaleOrder.length - 1, Math.max(0, activeScaleIndex + direction));
    const nextScale = scaleOrder[nextIndex];
    if (nextScale && nextScale !== state.scale) {
      dispatch({ type: "select-scale", scale: nextScale });
    }
  }, [activeScaleIndex, state.scale]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (
      window.innerWidth <= 760 ||
      window.matchMedia("(pointer: coarse)").matches ||
      Math.abs(event.deltaY) < 24
    ) return;
    const now = Date.now();
    if (now < wheelLock.current) return;
    wheelLock.current = now + 560;
    moveScale(event.deltaY > 0 ? 1 : -1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowDown" || event.key === "+" || event.key === "=") {
      event.preventDefault();
      moveScale(1);
    } else if (event.key === "ArrowUp" || event.key === "-") {
      event.preventDefault();
      moveScale(-1);
    } else if (event.key === "Escape") {
      dispatch({ type: "reset-view" });
    }
  };

  return (
    <section
      className="soma-experience"
      data-theme={theme}
      data-testid="soma-experience"
      aria-label="Soma multiscale human body explorer"
      onKeyDown={handleKeyDown}
    >
      <header className="soma-experience-title">
        <h1>Soma</h1>
        <p>The living body, across every scale.</p>
      </header>

      <ScaleRail activeScale={state.scale} onSelect={selectScale} />

      <div className="soma-stage" onWheel={handleWheel}>
        <div className="soma-stage-grid" aria-hidden />
        {state.hydrated ? (
          <SomaAtlasCanvas
            systemId={state.systemId}
            scale={state.scale}
            lens={state.lens}
            mode={state.mode}
            labels={state.labels}
            autoRotate={state.autoRotate}
            reducedMotion={reducedMotion}
            theme={theme}
            onSelectSystem={selectSystem}
            onScaleChange={selectScale}
          />
        ) : (
          <div className="soma-canvas-loading" role="status">
            <span />
            Assembling the living atlas
          </div>
        )}

        <div className="soma-canvas-controls" aria-label="3D view controls">
          <ControlButton
            label="Rotate"
            active={state.autoRotate}
            onClick={() => dispatch({ type: "toggle-rotation" })}
          >
            <RotateCw aria-hidden />
          </ControlButton>
          <ControlButton
            label="Isolate"
            active={state.mode === "isolate"}
            onClick={() => dispatch({ type: "toggle-mode", mode: "isolate" })}
          >
            <BetweenVerticalStart aria-hidden />
          </ControlButton>
          <ControlButton
            label="Explode"
            active={state.mode === "explode"}
            onClick={() => dispatch({ type: "toggle-mode", mode: "explode" })}
          >
            <Layers3 aria-hidden />
          </ControlButton>
          <ControlButton
            label="X-ray"
            active={state.mode === "xray"}
            onClick={() => dispatch({ type: "toggle-mode", mode: "xray" })}
          >
            <ScanLine aria-hidden />
          </ControlButton>
          <ControlButton
            label="Labels"
            active={state.labels}
            onClick={() => dispatch({ type: "toggle-labels" })}
          >
            <Tags aria-hidden />
          </ControlButton>
          <ControlButton label="Reset" onClick={() => dispatch({ type: "reset-view" })}>
            <RotateCcw aria-hidden />
          </ControlButton>
        </div>

        <p className="soma-stage-instructions">
          Drag to rotate <span aria-hidden>·</span> Scroll to travel through scale
        </p>
      </div>

      <SystemRail selectedId={state.systemId} onSelect={selectSystem} />

      <Inspector
        state={state}
        system={system}
        onLensChange={(lens) => dispatch({ type: "select-lens", lens })}
        onScaleChange={selectScale}
      />

      <p className="sr-only" aria-live="polite">
        {system.name}, {somaScaleStages[activeScaleIndex]?.name} scale, {state.lens} lens.
      </p>

      <div className="soma-list-fallback">
        <Eye aria-hidden />
        <span>Use the system and scale controls to explore without interacting with the 3D model.</span>
      </div>
    </section>
  );
}
