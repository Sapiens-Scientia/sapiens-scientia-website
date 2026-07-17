"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BetweenVerticalStart,
  ChevronDown,
  ChevronUp,
  Eye,
  Layers3,
  RotateCcw,
  RotateCw,
  ScanLine,
  Tags,
} from "lucide-react";
import {
  type CSSProperties,
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
import {
  hasSomaReferenceOrgan,
  somaReferenceMoleculeSource,
  somaReferenceNeuronSource,
  somaReferenceOrganSource,
  type SomaReferenceModelStatus,
} from "@/lib/soma-models";
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
const moleculeStructureColors = [
  "linear-gradient(90deg, #df5968 0 50%, #e7b66a 50%)",
  "#9a78d0",
  "#57c6d9",
  "#7099d2",
  "linear-gradient(90deg, #f5c95f, #ec806e, #6fe4e4)",
] as const;
const neuronStructureColors = ["#ec8d9d", "#ad8ee0", "#62c4d5", "#e9bd6c", "#77808f"] as const;

function reducer(state: SomaState, action: SomaAction): SomaState {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.state, hydrated: true };
    case "select-system":
      return { ...state, systemId: action.systemId };
    case "select-scale":
      return {
        ...state,
        scale: action.scale,
        mode: action.scale === "organism" || action.scale === "system" ? state.mode : "context",
      };
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

function scaleSubject(scale: SomaScaleId, system: SomaSystem) {
  const visual = somaSystemVisualById.get(system.id) ?? somaSystemVisuals[0];
  if (scale === "organism") return "Whole body";
  if (scale === "system") return visual.shortName;
  if (scale === "organ") return visual.organName;
  if (scale === "tissue") return visual.tissueName;
  if (scale === "cell") return visual.cellName;
  if (scale === "organelle") return "Mitochondrion";
  return "ATP synthase";
}

function ScaleRail({
  activeScale,
  system,
  onSelect,
}: {
  activeScale: SomaScaleId;
  system: SomaSystem;
  onSelect: (scale: SomaScaleId) => void;
}) {
  return (
    <nav className="soma-scale-rail" aria-label="Biological scale">
      <div className="soma-scale-rule" aria-hidden />
      {somaScaleStages.map((stage, index) => {
        const active = stage.id === activeScale;
        const subject = scaleSubject(stage.id, system);
        return (
          <button
            key={stage.id}
            type="button"
            className="soma-scale-step"
            aria-current={active ? "step" : undefined}
            aria-label={`${stage.name}: ${subject}, ${stage.scale}`}
            onClick={() => onSelect(stage.id)}
          >
            <span className="soma-scale-dot" aria-hidden />
            <span className="soma-scale-index" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
            <span className="soma-scale-copy">
              <span className="soma-scale-name">{stage.name}</span>
              <span className="soma-scale-subject">{subject}</span>
            </span>
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
  const selectedButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedButton.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedId]);

  return (
    <nav className="soma-system-rail" aria-label="Organ systems">
      {somaSystemVisuals.map((visual, index) => (
        <button
          key={visual.id}
          ref={selectedId === visual.id ? selectedButton : undefined}
          type="button"
          aria-pressed={selectedId === visual.id}
          onClick={() => onSelect(visual.id)}
          className="soma-system-option"
          style={{ "--system-color": visual.color } as CSSProperties}
        >
          <span className="soma-system-swatch" aria-hidden />
          <span className="soma-system-index" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
          <span className="soma-system-name">{visual.shortName}</span>
        </button>
      ))}
    </nav>
  );
}

function AtlasNavigator({
  state,
  system,
  onSelectScale,
  onSelectSystem,
}: {
  state: SomaState;
  system: SomaSystem;
  onSelectScale: (scale: SomaScaleId) => void;
  onSelectSystem: (systemId: string) => void;
}) {
  const activeIndex = scaleOrder.indexOf(state.scale);
  const activeStage = somaScaleStages[activeIndex];
  const previousScale = scaleOrder[activeIndex - 1];
  const nextScale = scaleOrder[activeIndex + 1];

  return (
    <aside className="soma-atlas-navigator" aria-label="Atlas navigator">
      <header className="soma-experience-title">
        <h1>Soma</h1>
        <p>The living body, across every scale.</p>
      </header>

      <section className="soma-nav-section soma-nav-scale">
        <div className="soma-nav-section-heading">
          <span>Scale</span>
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(scaleOrder.length).padStart(2, "0")}</span>
        </div>
        <div className="soma-scale-jump">
          <button
            type="button"
            aria-label="Previous scale"
            disabled={!previousScale}
            onClick={() => previousScale && onSelectScale(previousScale)}
          >
            <ChevronUp aria-hidden />
          </button>
          <div>
            <span>{activeStage?.name}</span>
            <strong>{scaleSubject(state.scale, system)}</strong>
            <small>{activeStage?.scale}</small>
          </div>
          <button
            type="button"
            aria-label="Next scale"
            disabled={!nextScale}
            onClick={() => nextScale && onSelectScale(nextScale)}
          >
            <ChevronDown aria-hidden />
          </button>
        </div>
        <ScaleRail activeScale={state.scale} system={system} onSelect={onSelectScale} />
      </section>

      <section className="soma-nav-section soma-nav-systems">
        <div className="soma-nav-section-heading">
          <span>{state.scale === "organism" ? "Highlight system" : "System focus"}</span>
          <span>10</span>
        </div>
        <SystemRail selectedId={state.systemId} onSelect={onSelectSystem} />
      </section>
    </aside>
  );
}

function MobileAtlasNavigator({
  state,
  system,
  onSelectScale,
  onSelectSystem,
}: {
  state: SomaState;
  system: SomaSystem;
  onSelectScale: (scale: SomaScaleId) => void;
  onSelectSystem: (systemId: string) => void;
}) {
  const visual = somaSystemVisualById.get(system.id) ?? somaSystemVisuals[0];
  return (
    <div className="soma-mobile-navigator" role="group" aria-label="Atlas navigator">
      <label>
        <span>Scale</span>
        <select
          data-testid="soma-scale-select"
          value={state.scale}
          disabled={!state.hydrated}
          onChange={(event) => onSelectScale(event.target.value as SomaScaleId)}
        >
          {somaScaleStages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name} · {scaleSubject(stage.id, system)}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>{state.scale === "organism" ? "Highlight system" : "System"}</span>
        <select
          data-testid="soma-system-select"
          value={state.systemId}
          disabled={!state.hydrated}
          onChange={(event) => onSelectSystem(event.target.value)}
        >
          {somaSystemVisuals.map((item) => (
            <option key={item.id} value={item.id}>{item.shortName}</option>
          ))}
        </select>
      </label>
      <p style={{ "--system-color": visual.color } as CSSProperties}>
        <span aria-hidden />
        {visual.shortName} <ArrowRight aria-hidden /> {scaleSubject(state.scale, system)}
      </p>
    </div>
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
      title: visual.tissueName,
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
      summary: state.lens === "anatomy" && state.systemId === "nervous"
        ? "An experimental 3D reconstruction of a human layer-3 pyramidal neuron reveals its complete dendritic arbor and the traced portion of its axon. Display radii are slightly amplified for legibility."
        : state.lens === "anatomy" ? visual.cellSummary : content.summary,
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
      "A chain-level view derived from the 2.53 Å human ATP synthase structure 8H9S. Proton flow turns its membrane rotor and central shaft, driving ATP production in the catalytic head.",
    label: "Resolved components",
    items: ["F₁ catalytic head", "central rotor shaft", "c-ring", "membrane stator", "ATP · ADP · magnesium"],
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
  const previousScale = scaleOrder[currentIndex - 1];
  const nextScale = scaleOrder[currentIndex + 1];
  const linkedDiseases = useMemo(
    () =>
      system.morbusLinks
        .map((id) => morbusDiseases.find((disease) => disease.id === id))
        .filter((disease): disease is NonNullable<typeof disease> => Boolean(disease)),
    [system],
  );

  return (
    <aside className="soma-inspector" aria-labelledby="soma-inspector-title">
      <div className="soma-inspector-path">
        <span>{state.scale === "organism" ? "Human" : system.name.replace(/ System| & Lymphatic System/, "")}</span>
        <span aria-hidden>/</span>
        <span>{somaScaleStages[currentIndex]?.name}</span>
      </div>
      <h2 id="soma-inspector-title">{heading.title}</h2>
      <p className="soma-inspector-latin">{heading.latin}</p>

      <div className="soma-lens-tabs" role="group" aria-label="Disciplinary lens">
        {somaLenses.map((lens) => (
          <button
            key={lens.id}
            type="button"
            aria-pressed={state.lens === lens.id}
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
          {heading.items.map((item, index) => (
            <li
              key={item}
              data-molecular={state.scale === "molecule" || undefined}
              data-neuronal={state.scale === "cell" && state.systemId === "nervous" || undefined}
              style={state.scale === "molecule"
                ? { "--structure-color": moleculeStructureColors[index] } as CSSProperties
                : state.scale === "cell" && state.systemId === "nervous"
                  ? { "--structure-color": neuronStructureColors[index] } as CSSProperties
                  : undefined}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="soma-scale-actions" role="group" aria-label="Move through biological scale">
        {previousScale ? (
          <button
            type="button"
            className="soma-scale-action"
            data-direction="out"
            onClick={() => onScaleChange(previousScale)}
          >
            <ArrowLeft aria-hidden />
            <span>Back to {somaScaleStages[currentIndex - 1]?.name.toLowerCase()}</span>
          </button>
        ) : <span aria-hidden />}
        {nextScale ? (
          <button
            type="button"
            className="soma-scale-action"
            data-direction="in"
            onClick={() => onScaleChange(nextScale)}
          >
            <span>Enter {somaScaleStages[currentIndex + 1]?.name.toLowerCase()}</span>
            <ArrowRight aria-hidden />
          </button>
        ) : null}
      </div>

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
          Brain, heart, lung, and kidney organ views use optimized Human Reference Atlas models. The nervous-system cell view uses an experimental human pyramidal-neuron reconstruction from NeuroMorpho.Org, and the molecule stage uses a chain-backbone derivative of human ATP synthase structure 8H9S. Other organ and microscopic worlds remain representative educational models, normalized between scale stages. Not diagnostic anatomy.
        </p>
        <div>
          <a href="https://openstax.org/books/anatomy-and-physiology-2e/pages/1-2-structural-organization-of-the-human-body" target="_blank" rel="noreferrer">
            OpenStax · Structural organization
          </a>
          <a href="https://humanatlas.io/3d-reference-library" target="_blank" rel="noreferrer">
            HuBMAP · Human Reference Atlas (CC BY 4.0)
          </a>
          <a href="/models/hra/manifest.json" target="_blank" rel="noreferrer">
            Organ model credits &amp; provenance
          </a>
          <a href={somaReferenceNeuronSource.url} target="_blank" rel="noreferrer">
            NeuroMorpho.Org NMO_86976 · Human pyramidal neuron (CC BY 4.0)
          </a>
          <a href="/models/neuromorpho/manifest.json" target="_blank" rel="noreferrer">
            Neuron model credits &amp; provenance
          </a>
          <a href="https://www.rcsb.org/structure/8H9S" target="_blank" rel="noreferrer">
            RCSB PDB 8H9S · Human ATP synthase (CC0)
          </a>
          <a href="/models/pdb/manifest.json" target="_blank" rel="noreferrer">
            Molecular model credits &amp; provenance
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
  active,
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
      aria-pressed={typeof active === "boolean" ? active : undefined}
      onClick={onClick}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

export function SomaExperience() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [referenceModelState, setReferenceModelState] = useState<{
    key: string;
    status: SomaReferenceModelStatus;
  }>({ key: "", status: "idle" });
  const [identifiedStructureState, setIdentifiedStructureState] = useState<{
    key: string;
    structure: string | null;
  }>({ key: "", structure: null });
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const system = somaSystems.find((item) => item.id === state.systemId) ?? somaSystems[1];
  const activeScaleIndex = scaleOrder.indexOf(state.scale);
  const bodyStage = state.scale === "organism" || state.scale === "system";
  const microscopicStage = activeScaleIndex >= scaleOrder.indexOf("tissue");
  const referenceOrganStage = state.scale === "organ" && hasSomaReferenceOrgan(state.systemId);
  const referenceNeuronStage = state.scale === "cell" && state.systemId === "nervous";
  const referenceMoleculeStage = state.scale === "molecule";
  const referenceModelStage = referenceOrganStage || referenceNeuronStage || referenceMoleculeStage;
  const referenceModelKey = referenceOrganStage
    ? `organ:${state.systemId}`
    : referenceNeuronStage ? "cell:nervous:nmo86976"
      : referenceMoleculeStage ? "molecule:8h9s" : null;
  const referenceModelStatus = referenceModelKey
    ? referenceModelState.key === referenceModelKey ? referenceModelState.status : "loading"
    : "idle";
  const identifiedStructure = referenceModelKey === identifiedStructureState.key
    ? identifiedStructureState.structure
    : null;

  useEffect(() => {
    const url = new URL(window.location.href);
    const legacyHash = url.hash.replace(/^#/, "");
    const requestedSystem = url.searchParams.get("system") ?? legacyHash;
    const requestedScale = url.searchParams.get("scale");
    const requestedLens = url.searchParams.get("lens");
    const requestedMode = url.searchParams.get("mode");
    const hydratedScale = requestedScale && scaleIds.has(requestedScale as SomaScaleId)
      ? requestedScale as SomaScaleId
      : initialState.scale;
    const hydratedBodyStage = hydratedScale === "organism" || hydratedScale === "system";
    dispatch({
      type: "hydrate",
      state: {
        systemId: requestedSystem && systemIds.has(requestedSystem) ? requestedSystem : initialState.systemId,
        scale: hydratedScale,
        lens: requestedLens && lensIds.has(requestedLens as SomaLensId)
          ? requestedLens as SomaLensId
          : initialState.lens,
        mode: hydratedBodyStage && requestedMode && modeIds.has(requestedMode as SomaViewMode)
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

  const handleReferenceStatusChange = useCallback((status: SomaReferenceModelStatus) => {
    if (!referenceModelKey) return;
    setReferenceModelState((current) =>
      current.key === referenceModelKey && current.status === status
        ? current
        : { key: referenceModelKey, status });
  }, [referenceModelKey]);

  const handleStructureChange = useCallback((structure: string | null) => {
    if (!referenceModelKey) return;
    setIdentifiedStructureState((current) =>
      current.key === referenceModelKey && current.structure === structure
        ? current
        : { key: referenceModelKey, structure });
  }, [referenceModelKey]);

  return (
    <section
      className="soma-experience"
      data-theme={theme}
      data-testid="soma-experience"
      aria-label="Soma multiscale human body explorer"
    >
      <AtlasNavigator
        state={state}
        system={system}
        onSelectScale={selectScale}
        onSelectSystem={selectSystem}
      />
      <MobileAtlasNavigator
        state={state}
        system={system}
        onSelectScale={selectScale}
        onSelectSystem={selectSystem}
      />

      <div className="soma-stage">
        <div className="soma-stage-grid" aria-hidden />
        {referenceModelStage && referenceModelStatus === "ready" ? (
          <a
            className="soma-reference-credit"
            href={referenceMoleculeStage
              ? somaReferenceMoleculeSource.url
              : referenceNeuronStage ? somaReferenceNeuronSource.url : somaReferenceOrganSource.url}
            target="_blank"
            rel="noreferrer"
          >
            {referenceMoleculeStage ? (
              <>RCSB PDB 8H9S <span aria-hidden>·</span> {somaReferenceMoleculeSource.license}</>
            ) : referenceNeuronStage ? (
              <>NeuroMorpho.Org NMO_86976 <span aria-hidden>·</span> {somaReferenceNeuronSource.license}</>
            ) : (
              <>HRA reference source <span aria-hidden>·</span> {somaReferenceOrganSource.license}</>
            )}
          </a>
        ) : referenceModelStage && referenceModelStatus === "loading" ? (
          <span className="soma-reference-credit" role="status">
            {referenceMoleculeStage
              ? "Loading experimental structure"
              : referenceNeuronStage ? "Loading experimental neuron morphology" : "Loading HRA reference anatomy"}
          </span>
        ) : referenceModelStage && referenceModelStatus === "failed" ? (
          <span className="soma-reference-credit" role="status">Reference unavailable <span aria-hidden>·</span> schematic shown</span>
        ) : null}
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
            onReferenceStatusChange={handleReferenceStatusChange}
            onStructureChange={handleStructureChange}
          />
        ) : (
          <div className="soma-canvas-loading" role="status">
            <span />
            Assembling the living atlas
          </div>
        )}

        <div className="soma-canvas-controls" role="group" aria-label="3D view controls">
          <ControlButton
            label="Rotate"
            active={state.autoRotate}
            onClick={() => dispatch({ type: "toggle-rotation" })}
          >
            <RotateCw aria-hidden />
          </ControlButton>
          {bodyStage ? (
            <>
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
            </>
          ) : null}
          {bodyStage || microscopicStage ? (
            <ControlButton
              label="Labels"
              active={state.labels}
              onClick={() => dispatch({ type: "toggle-labels" })}
            >
              <Tags aria-hidden />
            </ControlButton>
          ) : null}
          <ControlButton label="Reset" onClick={() => dispatch({ type: "reset-view" })}>
            <RotateCcw aria-hidden />
          </ControlButton>
        </div>

        <p className="soma-stage-instructions">
          {referenceModelStage && referenceModelStatus === "ready" ? (
            state.labels ? (
              <>Drag to rotate <span aria-hidden>·</span> Tap or hover structures</>
            ) : (
              <>Drag to rotate <span aria-hidden>·</span> Enable labels to identify structures</>
            )
          ) : (
            <>Drag to rotate <span aria-hidden>·</span> Choose a scale to zoom</>
          )}
        </p>
      </div>

      <Inspector
        state={state}
        system={system}
        onLensChange={(lens) => dispatch({ type: "select-lens", lens })}
        onScaleChange={selectScale}
      />

      <p className="sr-only" aria-live="polite">
        {identifiedStructure
          ? `Selected anatomy: ${identifiedStructure}.`
          : `${system.name}, ${somaScaleStages[activeScaleIndex]?.name} scale, ${state.lens} lens.`}
      </p>

      <div className="soma-list-fallback">
        <Eye aria-hidden />
        <span>Use the system and scale controls to explore without interacting with the 3D model.</span>
      </div>
    </section>
  );
}
