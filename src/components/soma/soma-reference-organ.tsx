"use client";

import { Html, useGLTF } from "@react-three/drei";
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
import * as THREE from "three";
import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from "three-mesh-bvh";
import type { VectorTuple } from "@/components/soma/soma-scene-data";
import {
  hasSomaReferenceOrgan,
  type SomaReferenceModelStatus,
} from "@/lib/soma-models";

type ReferenceOrganConfig = {
  path: string;
  rotation: VectorTuple;
  targetSize: number;
  palette: readonly string[];
};

type ReferenceOrganProps = {
  fallback: ReactNode;
  onStatusChange?: (status: SomaReferenceModelStatus) => void;
  onStructureChange?: (structure: string | null) => void;
  systemId: string;
};

const materialDisposalTimers = new WeakMap<THREE.Object3D, ReturnType<typeof setTimeout>>();
const boundsTreeReferences = new WeakMap<
  THREE.BufferGeometry,
  { uses: number; timer: ReturnType<typeof setTimeout> | null }
>();
const ignoreRaycast: THREE.Mesh["raycast"] = () => {};

const REFERENCE_ORGANS: Record<string, ReferenceOrganConfig> = {
  nervous: {
    path: "/models/hra/brain.glb",
    rotation: [-0.06, 0.12, 0],
    targetSize: 2.78,
    palette: ["#b994d6", "#d3a3c1", "#8fa7df", "#a982c9", "#e3b1b5"],
  },
  cardiovascular: {
    path: "/models/hra/heart.glb",
    rotation: [0.08, -0.22, -0.12],
    targetSize: 2.82,
    palette: ["#d94e59", "#ee7880", "#a93648", "#bf5264", "#f0a29c"],
  },
  respiratory: {
    path: "/models/hra/lung.glb",
    rotation: [0.02, -0.06, 0],
    targetSize: 2.92,
    palette: ["#dc8d9a", "#efadb4", "#bd7185", "#d89fa8", "#a86d84"],
  },
  urinary: {
    path: "/models/hra/kidney.glb",
    rotation: [0.06, -0.42, -0.12],
    targetSize: 2.82,
    palette: ["#a97ad0", "#c896dd", "#8059ad", "#d7afdf", "#74508f"],
  },
};

class ReferenceModelBoundary extends Component<
  {
    children: ReactNode;
    fallback: ReactNode;
    onFailure: () => void;
  },
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

function ReferenceStatusReporter({
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

function stableIndex(value: string, length: number) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % length;
}

function semanticColor(systemId: string, objectName: string, config: ReferenceOrganConfig) {
  const name = objectName.toLowerCase();

  if (systemId === "cardiovascular") {
    if (name.includes("valve")) return "#f0c8ad";
    if (name.includes("septum")) return "#df7b73";
    if (name.includes("papillary")) return "#9d3447";
    if (name.includes("atrium")) return "#ee7880";
    if (name.includes("ventricle")) return name.includes("left") ? "#d94e59" : "#b44458";
  }

  if (systemId === "respiratory") {
    if (name.includes("cartilage")) return "#d8dfca";
    if (name.includes("bronch") || name.includes("trachea")) return "#83cbd1";
    if (name.includes("hilum")) return "#b78396";
  }

  if (systemId === "urinary") {
    if (name.includes("arter")) return "#e85d68";
    if (name.includes("vein")) return "#6e97d7";
    if (name.includes("calyx") || name.includes("pelvis")) return "#e8c4dc";
    if (name.includes("medulla") || name.includes("pyramid")) return "#8059ad";
    if (name.includes("cortex")) return "#b98ad2";
    if (name.includes("ureter")) return "#d8bce4";
  }

  if (systemId === "nervous") {
    if (name.includes("cerebell")) return "#d3a3c1";
    if (name.includes("brainstem") || name.includes("medulla") || name.includes("pons")) return "#8fa7df";
    if (name.includes("ventricle")) return "#6bc3d8";
    if (name.includes("hippocamp") || name.includes("amygdala")) return "#e3b1b5";
    if (name.includes("cortex")) return "#b994d6";
  }

  return config.palette[stableIndex(name, config.palette.length)];
}

function semanticOpacity(systemId: string, objectName: string) {
  if (systemId !== "urinary") return 1;
  const name = objectName.toLowerCase();
  if (name.includes("capsule")) return 0.18;
  if (name.includes("outer_cortex")) return 0.48;
  return 1;
}

function humanizeStructureName(value: string) {
  const side = value.endsWith("_L") ? " · left" : value.endsWith("_R") ? " · right" : "";
  const cleaned = value
    .replace(/^VH_[FM]_/, "")
    .replace(/^Allen_/, "")
    .replace(/_[LR]$/, "")
    .replace(/_antlat\b/g, " anterolateral")
    .replace(/_posmed\b/g, " posteromedial")
    .replace(/_ant\b/g, " anterior")
    .replace(/_pos\b/g, " posterior")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}${side}`;
}

function prepareMaterial(material: THREE.Material, color: string, opacity: number) {
  if (material instanceof THREE.MeshStandardMaterial) {
    const next = material.clone();
    next.color.set(color);
    next.vertexColors = false;
    next.transparent = opacity < 1;
    next.opacity = opacity;
    next.depthWrite = opacity >= 0.72;
    next.forceSinglePass = true;
    next.side = THREE.FrontSide;
    next.roughness = 0.56;
    next.metalness = 0.01;
    next.emissive.set(color);
    next.emissiveIntensity = 0.035;
    return next;
  }

  return new THREE.MeshStandardMaterial({
    color,
    depthWrite: opacity >= 0.72,
    emissive: color,
    emissiveIntensity: 0.035,
    metalness: 0.01,
    opacity,
    roughness: 0.56,
    transparent: opacity < 1,
  });
}

function LoadedReferenceOrgan({
  config,
  onStatusChange,
  onStructureChange,
  systemId,
}: {
  config: ReferenceOrganConfig;
  onStatusChange?: (status: SomaReferenceModelStatus) => void;
  onStructureChange?: (structure: string | null) => void;
  systemId: string;
}) {
  const { scene } = useGLTF(config.path, false, true);
  const [hoveredStructure, setHoveredStructure] = useState<string | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const activeCanvas = useRef<HTMLCanvasElement | null>(null);

  const prepared = useMemo(() => {
    const object = scene.clone(true);
    const geometries = new Set<THREE.BufferGeometry>();
    const materials: THREE.Material[] = [];
    object.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const color = semanticColor(systemId, child.name, config);
      const opacity = semanticOpacity(systemId, child.name);
      child.castShadow = false;
      child.receiveShadow = false;
      const nextMaterial = Array.isArray(child.material)
        ? child.material.map((material) => prepareMaterial(material, color, opacity))
        : prepareMaterial(child.material, color, opacity);
      child.material = nextMaterial;
      materials.push(...(Array.isArray(nextMaterial) ? nextMaterial : [nextMaterial]));
      if (opacity < 1) {
        child.raycast = ignoreRaycast;
      } else {
        geometries.add(child.geometry);
        if (!child.geometry.boundsTree) {
          computeBoundsTree.call(child.geometry, { maxLeafTris: 16 });
        }
        child.raycast = acceleratedRaycast;
      }
    });

    const bounds = new THREE.Box3().setFromObject(object);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const longestAxis = Math.max(size.x, size.y, size.z);

    return {
      geometries: [...geometries],
      materials,
      object,
      offset: center.multiplyScalar(-1),
      scale: longestAxis > 0 ? config.targetSize / longestAxis : 1,
    };
  }, [config, scene, systemId]);

  useEffect(() => {
    const pendingDisposal = materialDisposalTimers.get(prepared.object);
    if (pendingDisposal) {
      clearTimeout(pendingDisposal);
      materialDisposalTimers.delete(prepared.object);
    }

    return () => {
      const timer = setTimeout(() => {
        prepared.materials.forEach((material) => material.dispose());
        if (materialDisposalTimers.get(prepared.object) === timer) {
          materialDisposalTimers.delete(prepared.object);
        }
      }, 0);
      materialDisposalTimers.set(prepared.object, timer);
    };
  }, [prepared]);

  useEffect(() => {
    prepared.geometries.forEach((geometry) => {
      const reference = boundsTreeReferences.get(geometry) ?? { uses: 0, timer: null };
      if (reference.timer) clearTimeout(reference.timer);
      reference.timer = null;
      reference.uses += 1;
      boundsTreeReferences.set(geometry, reference);
    });

    return () => {
      prepared.geometries.forEach((geometry) => {
        const reference = boundsTreeReferences.get(geometry);
        if (!reference) return;
        reference.uses = Math.max(0, reference.uses - 1);
        if (reference.uses > 0) return;
        reference.timer = setTimeout(() => {
          const latestReference = boundsTreeReferences.get(geometry);
          if (latestReference !== reference || latestReference.uses > 0) return;
          disposeBoundsTree.call(geometry);
          boundsTreeReferences.delete(geometry);
        }, 0);
      });
    };
  }, [prepared]);

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
    const nextStructure = humanizeStructureName(event.object.name);
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
      <group
        rotation={config.rotation}
        scale={prepared.scale}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={() => {
          if (activeCanvas.current) activeCanvas.current.style.cursor = "default";
          setHoveredStructure(null);
          onStructureChange?.(selectedStructure);
        }}
      >
        <primitive object={prepared.object} position={prepared.offset} />
      </group>
      {identifiedStructure ? (
        <Html position={[0, 1.28, 1.08]} center pointerEvents="none">
          <div className="soma-canvas-label">
            {identifiedStructure}
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export function SomaReferenceOrgan({
  fallback,
  onStatusChange,
  onStructureChange,
  systemId,
}: ReferenceOrganProps) {
  const config = REFERENCE_ORGANS[systemId];
  const [retryState, setRetryState] = useState({ path: "", attempt: 0 });
  if (!config || !hasSomaReferenceOrgan(systemId)) return fallback;
  const retryAttempt = retryState.path === config.path ? retryState.attempt : 0;

  const handleModelFailure = () => {
    if (retryAttempt === 0) {
      onStatusChange?.("loading");
      useGLTF.clear(config.path);
      setRetryState({ path: config.path, attempt: 1 });
      return;
    }
    onStatusChange?.("failed");
  };

  return (
    <ReferenceModelBoundary
      key={`${systemId}:${retryAttempt}`}
      fallback={fallback}
      onFailure={handleModelFailure}
    >
      <Suspense
        fallback={(
          <>
            {fallback}
            <ReferenceStatusReporter status="loading" onStatusChange={onStatusChange} />
          </>
        )}
      >
        <LoadedReferenceOrgan
          config={config}
          systemId={systemId}
          onStatusChange={onStatusChange}
          onStructureChange={onStructureChange}
        />
      </Suspense>
    </ReferenceModelBoundary>
  );
}
