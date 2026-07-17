"use client";

import { Html, useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import {
  Component,
  Suspense,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SomaReferenceModelStatus } from "@/lib/soma-models";

const neuronPath = "/models/neuromorpho/human-pyramidal-neuron-nmo-86976.glb";

type SomaReferenceNeuronProps = {
  fallback: ReactNode;
  labels: boolean;
  onStatusChange?: (status: SomaReferenceModelStatus) => void;
  onStructureChange?: (structure: string | null) => void;
};

class ReferenceNeuronBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ReferenceNeuronStatus({
  onStatusChange,
  status,
}: {
  onStatusChange?: (status: SomaReferenceModelStatus) => void;
  status: SomaReferenceModelStatus;
}) {
  useEffect(() => {
    onStatusChange?.(status);
  }, [onStatusChange, status]);
  return null;
}

function LoadedReferenceNeuron({
  labels,
  onStatusChange,
  onStructureChange,
}: Pick<SomaReferenceNeuronProps, "labels" | "onStatusChange" | "onStructureChange">) {
  const { scene } = useGLTF(neuronPath, false, true);
  const [hoveredStructure, setHoveredStructure] = useState<string | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const activeCanvas = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    onStatusChange?.("ready");
  }, [onStatusChange]);

  useEffect(() => {
    const clearOutsideCanvas = (event: PointerEvent) => {
      if (event.target instanceof HTMLCanvasElement) return;
      if (activeCanvas.current) activeCanvas.current.style.cursor = "default";
      setHoveredStructure(null);
      setSelectedStructure(null);
      onStructureChange?.(null);
    };
    window.addEventListener("pointermove", clearOutsideCanvas, true);
    window.addEventListener("pointerdown", clearOutsideCanvas, true);
    return () => {
      window.removeEventListener("pointermove", clearOutsideCanvas, true);
      window.removeEventListener("pointerdown", clearOutsideCanvas, true);
      if (activeCanvas.current) activeCanvas.current.style.cursor = "default";
      onStructureChange?.(null);
    };
  }, [onStructureChange]);

  const identifyStructure = (event: ThreeEvent<PointerEvent | MouseEvent>) => {
    event.stopPropagation();
    const eventTarget = event.nativeEvent.target;
    if (eventTarget instanceof HTMLCanvasElement) {
      activeCanvas.current = eventTarget;
      eventTarget.style.cursor = "crosshair";
    }
    let target = event.object;
    while (!target.name && target.parent) target = target.parent;
    const structure = target.name || "Human pyramidal neuron";
    onStructureChange?.(structure);
    return structure;
  };

  const identifiedStructure = hoveredStructure ?? selectedStructure;

  return (
    <group>
      <group
        rotation={[-0.02, -0.18, 0.02]}
        onClick={(event) => {
          const structure = identifyStructure(event);
          setSelectedStructure((current) => current === structure ? current : structure);
        }}
        onPointerMove={(event) => {
          const structure = identifyStructure(event);
          setHoveredStructure((current) => current === structure ? current : structure);
        }}
        onPointerOut={() => {
          if (activeCanvas.current) activeCanvas.current.style.cursor = "default";
          setHoveredStructure(null);
          onStructureChange?.(selectedStructure);
        }}
      >
        <primitive object={scene} />
      </group>
      {identifiedStructure && labels ? (
        <Html position={[0, 2.45, 0.72]} center pointerEvents="none">
          <div className="soma-canvas-label">{identifiedStructure}</div>
        </Html>
      ) : null}
    </group>
  );
}

export function SomaReferenceNeuron({
  fallback,
  labels,
  onStatusChange,
  onStructureChange,
}: SomaReferenceNeuronProps) {
  const [retryAttempt, setRetryAttempt] = useState(0);

  const handleFailure = () => {
    if (retryAttempt === 0) {
      onStatusChange?.("loading");
      useGLTF.clear(neuronPath);
      setRetryAttempt(1);
      return;
    }
    onStatusChange?.("failed");
  };

  return (
    <ReferenceNeuronBoundary key={retryAttempt} fallback={fallback} onFailure={handleFailure}>
      <Suspense
        fallback={(
          <>
            {fallback}
            <ReferenceNeuronStatus status="loading" onStatusChange={onStatusChange} />
          </>
        )}
      >
        <LoadedReferenceNeuron
          labels={labels}
          onStatusChange={onStatusChange}
          onStructureChange={onStructureChange}
        />
      </Suspense>
    </ReferenceNeuronBoundary>
  );
}
