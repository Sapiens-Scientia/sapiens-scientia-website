"use client";

import { Html, Instance, Instances, useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import {
  Component,
  Suspense,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SomaReferenceModelStatus } from "@/lib/soma-models";

const atpSynthasePath = "/models/pdb/atp-synthase-8h9s.glb";

type SomaReferenceMoleculeProps = {
  fallback: ReactNode;
  labels: boolean;
  onStatusChange?: (status: SomaReferenceModelStatus) => void;
  onStructureChange?: (structure: string | null) => void;
};

class ReferenceMoleculeBoundary extends Component<
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

function ReferenceMoleculeStatus({
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

function humanizeMoleculeStructure(value: string) {
  if (!value) return "Human ATP synthase";
  if (value.endsWith(" ligands")) return value.replace(" ligands", " ligand group");
  return value
    .replace("ATP synthase F(0) complex ", "F₀ ")
    .replace("ATP synthase ", "")
    .replace(", mitochondrial", "")
    .replace("ATPase inhibitor", "ATPase inhibitor protein");
}

function MolecularMembrane() {
  const lipidPositions = useMemo(
    () => Array.from({ length: 45 }, (_, index) => {
      const column = index % 9;
      const row = Math.floor(index / 9);
      return [(column - 4) * 0.46, (row - 2) * 0.54] as const;
    }),
    [],
  );

  return (
    <group>
      <mesh position={[0, -1.48, 0]} scale={[2.15, 0.16, 1.3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshPhysicalMaterial
          color="#4cbfd5"
          depthWrite={false}
          emissive="#165b70"
          emissiveIntensity={0.15}
          opacity={0.055}
          roughness={0.7}
          transparent
        />
      </mesh>
      <Instances limit={90} range={90}>
        <sphereGeometry args={[0.052, 8, 6]} />
        <meshStandardMaterial
          color="#58cbe0"
          depthWrite={false}
          emissive="#164e61"
          emissiveIntensity={0.16}
          opacity={0.3}
          transparent
        />
        {lipidPositions.flatMap(([x, z]) => [
          <Instance key={`${x}:${z}:top`} position={[x, -1.31, z]} />,
          <Instance key={`${x}:${z}:bottom`} position={[x, -1.65, z]} />,
        ])}
      </Instances>
    </group>
  );
}

function LoadedReferenceMolecule({
  labels,
  onStatusChange,
  onStructureChange,
}: Pick<SomaReferenceMoleculeProps, "labels" | "onStatusChange" | "onStructureChange">) {
  const { scene } = useGLTF(atpSynthasePath, false, true);
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
    const nextStructure = humanizeMoleculeStructure(target.name);
    onStructureChange?.(nextStructure);
    return nextStructure;
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    const nextStructure = identifyStructure(event);
    setHoveredStructure((current) => current === nextStructure ? current : nextStructure);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    const nextStructure = identifyStructure(event);
    setSelectedStructure((current) => current === nextStructure ? current : nextStructure);
  };

  const identifiedStructure = hoveredStructure ?? selectedStructure;

  return (
    <group>
      <group position={[0, 0.22, 0]} scale={0.66}>
        <MolecularMembrane />
        <group
          rotation={[0.02, -0.2, -0.035]}
          onClick={handleClick}
          onPointerMove={handlePointerMove}
          onPointerOut={() => {
            if (activeCanvas.current) activeCanvas.current.style.cursor = "default";
            setHoveredStructure(null);
            onStructureChange?.(selectedStructure);
          }}
        >
          <primitive object={scene} />
        </group>
      </group>
      {identifiedStructure && labels ? (
        <Html position={[0, 1.95, 0.96]} center pointerEvents="none">
          <div className="soma-canvas-label">{identifiedStructure}</div>
        </Html>
      ) : null}
    </group>
  );
}

export function SomaReferenceMolecule({
  fallback,
  labels,
  onStatusChange,
  onStructureChange,
}: SomaReferenceMoleculeProps) {
  const [retryAttempt, setRetryAttempt] = useState(0);

  const handleFailure = () => {
    if (retryAttempt === 0) {
      onStatusChange?.("loading");
      useGLTF.clear(atpSynthasePath);
      setRetryAttempt(1);
      return;
    }
    onStatusChange?.("failed");
  };

  return (
    <ReferenceMoleculeBoundary
      key={retryAttempt}
      fallback={fallback}
      onFailure={handleFailure}
    >
      <Suspense
        fallback={(
          <>
            {fallback}
            <ReferenceMoleculeStatus status="loading" onStatusChange={onStatusChange} />
          </>
        )}
      >
        <LoadedReferenceMolecule
          labels={labels}
          onStatusChange={onStatusChange}
          onStructureChange={onStructureChange}
        />
      </Suspense>
    </ReferenceMoleculeBoundary>
  );
}
