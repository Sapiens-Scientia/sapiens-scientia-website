"use client";

import {
  Center,
  Html,
  Line,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import {
  Canvas,
  type RootState,
  type ThreeEvent,
  useFrame,
  useThree,
} from "@react-three/fiber";
import {
  Component,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { SomaLensId, SomaScaleId } from "@/lib/soma";
import type { Theme } from "@/lib/use-theme";
import type { SomaReferenceModelStatus } from "@/lib/soma-models";
import {
  scaleOrder,
  somaSystemVisualById,
  somaSystemVisuals,
  type VectorTuple,
} from "@/components/soma/soma-scene-data";
import {
  CellWorld as DetailCellWorld,
  OrganWorld,
  TissueWorld as DetailTissueWorld,
} from "@/components/soma/soma-detail-worlds";
import { SomaReferenceMolecule } from "@/components/soma/soma-reference-molecule";

const anatomyModelPath = "/models/soma-anatomy.glb";
const SOMA_DPR: [number, number] = [0.9, 1.15];
const SOMA_CAMERA = { position: [0, 0.04, 7.2] as [number, number, number], fov: 29, near: 0.01, far: 100 };
const SOMA_GL = {
  antialias: true,
  alpha: false,
  stencil: false,
  powerPreference: "default" as const,
};

export type SomaViewMode = "context" | "isolate" | "explode" | "xray";

type SomaAtlasCanvasProps = {
  systemId: string;
  scale: SomaScaleId;
  lens: SomaLensId;
  mode: SomaViewMode;
  labels: boolean;
  autoRotate: boolean;
  reducedMotion: boolean;
  theme: Theme;
  onSelectSystem: (id: string) => void;
  onScaleChange: (scale: SomaScaleId) => void;
  onReferenceStatusChange?: (status: SomaReferenceModelStatus) => void;
  onStructureChange?: (structure: string | null) => void;
};

type WorldProps = Pick<
  SomaAtlasCanvasProps,
  "systemId" | "scale" | "lens" | "mode" | "labels" | "onSelectSystem" | "onScaleChange"
>;

type MaterialProps = {
  color: string;
  opacity: number;
  active?: boolean;
  wireframe?: boolean;
};

class SomaCanvasErrorBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
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
    return this.state.failed ? null : this.props.children;
  }
}

const CARDIO_LINES: VectorTuple[][] = [
  [[0.045, 0.32, 0.16], [0.02, 0.5, 0.12], [0, 0.66, 0.08]],
  [[0.045, 0.3, 0.15], [-0.16, 0.35, 0.08], [-0.38, 0.2, 0.03], [-0.49, -0.08, 0.01]],
  [[0.045, 0.3, 0.15], [0.16, 0.35, 0.08], [0.38, 0.2, 0.03], [0.49, -0.08, 0.01]],
  [[0.045, 0.29, 0.15], [0, 0.05, 0.1], [-0.11, -0.25, 0.03], [-0.16, -0.72, 0.01]],
  [[0.045, 0.29, 0.15], [0, 0.05, 0.1], [0.11, -0.25, 0.03], [0.16, -0.72, 0.01]],
];

const NERVE_LINES: VectorTuple[][] = [
  [[0, 0.59, 0.04], [0, 0.36, 0.02], [0, 0.05, 0], [0, -0.3, 0]],
  [[0, 0.36, 0], [-0.2, 0.25, 0], [-0.44, 0.05, 0]],
  [[0, 0.36, 0], [0.2, 0.25, 0], [0.44, 0.05, 0]],
  [[0, 0.03, 0], [-0.12, -0.3, 0], [-0.17, -0.68, 0]],
  [[0, 0.03, 0], [0.12, -0.3, 0], [0.17, -0.68, 0]],
];

const LYMPH_LINES: VectorTuple[][] = [
  [[0, 0.43, 0.03], [-0.18, 0.23, 0.02], [-0.3, 0.02, 0.02]],
  [[0, 0.43, 0.03], [0.18, 0.23, 0.02], [0.3, 0.02, 0.02]],
  [[0, 0.15, 0.03], [-0.1, -0.23, 0.02], [-0.14, -0.61, 0.02]],
  [[0, 0.15, 0.03], [0.1, -0.23, 0.02], [0.14, -0.61, 0.02]],
];

const SKELETON_SEGMENTS: Array<[VectorTuple, VectorTuple, number]> = [
  [[0, 0.56, 0], [0, 0.13, 0], 0.018],
  [[-0.18, 0.37, 0], [0.18, 0.37, 0], 0.018],
  [[-0.18, 0.36, 0], [-0.42, 0.04, 0], 0.025],
  [[0.18, 0.36, 0], [0.42, 0.04, 0], 0.025],
  [[-0.1, -0.08, 0], [-0.15, -0.69, 0], 0.035],
  [[0.1, -0.08, 0], [0.15, -0.69, 0], 0.035],
  [[-0.12, -0.12, 0], [0.12, -0.12, 0], 0.028],
];

function AtlasMaterial({ color, opacity, active = false, wireframe = false }: MaterialProps) {
  return (
    <meshStandardMaterial
      color={color}
      transparent
      opacity={opacity}
      depthWrite={opacity > 0.45}
      roughness={0.48}
      metalness={0.02}
      emissive={color}
      emissiveIntensity={active ? 0.17 : 0.015}
      wireframe={wireframe}
    />
  );
}

function Ellipsoid({
  position,
  scale,
  rotation,
  color,
  opacity,
  active,
}: MaterialProps & {
  position: VectorTuple;
  scale: VectorTuple;
  rotation?: VectorTuple;
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <sphereGeometry args={[1, 32, 24]} />
      <AtlasMaterial color={color} opacity={opacity} active={active} />
    </mesh>
  );
}

function Tube({
  points,
  radius,
  color,
  opacity,
  active,
}: MaterialProps & { points: VectorTuple[]; radius: number }) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))),
    [points],
  );

  return (
    <mesh>
      <tubeGeometry args={[curve, 32, radius, 8, false]} />
      <AtlasMaterial color={color} opacity={opacity} active={active} />
    </mesh>
  );
}

function BoneBetween({ start, end, radius, opacity }: {
  start: VectorTuple;
  end: VectorTuple;
  radius: number;
  opacity: number;
}) {
  const { midpoint, length, quaternion } = useMemo(() => {
    const from = new THREE.Vector3(...start);
    const to = new THREE.Vector3(...end);
    const direction = to.clone().sub(from);
    return {
      midpoint: from.clone().add(to).multiplyScalar(0.5),
      length: direction.length(),
      quaternion: new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize(),
      ),
    };
  }, [end, start]);

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius * 0.82, length, 12]} />
      <AtlasMaterial color="#e4d7c5" opacity={opacity} />
    </mesh>
  );
}

function ModelLabel({ systemId }: { systemId: string }) {
  const visual = somaSystemVisualById.get(systemId) ?? somaSystemVisuals[0];
  return (
    <Html position={[visual.focus[0] + 0.12, visual.focus[1] + 0.04, 0.34]} center>
      <div className="soma-canvas-label">
        <span>{visual.organName}</span>
        <span aria-hidden>·</span>
        <span>{visual.organSize}</span>
      </div>
    </Html>
  );
}

function MicroLabel({ scale, systemId }: { scale: SomaScaleId; systemId: string }) {
  const visual = somaSystemVisualById.get(systemId) ?? somaSystemVisuals[0];
  const content: Partial<Record<SomaScaleId, string>> = {
    tissue: `${visual.tissueName} · ${visual.tissueMeasure}`,
    cell: `${visual.cellName} · ${visual.cellMeasure}`,
    organelle: "Mitochondrion · 2 µm",
  };
  const label = content[scale];
  if (!label) return null;
  return (
    <Html position={[0.92, -1.42, 0.8]} center>
      <div className="soma-canvas-label">{label}</div>
    </Html>
  );
}

function ContextAnatomy({ opacity, selected }: { opacity: number; selected: boolean }) {
  const { scene } = useGLTF(anatomyModelPath, false, true);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = false;
      object.receiveShadow = false;
      const cloneMaterial = (source: THREE.Material) => {
        const material = source.clone();
        if (material instanceof THREE.MeshStandardMaterial) {
          material.transparent = true;
          material.depthWrite = false;
          material.side = THREE.FrontSide;
          material.forceSinglePass = true;
          material.roughness = 0.64;
          material.envMapIntensity = 0.1;
          material.userData.somaBaseColor = material.color.clone();
        }
        return material;
      };
      object.material = Array.isArray(object.material)
        ? object.material.map(cloneMaterial)
        : cloneMaterial(object.material);
    });
    return clone;
  }, [scene]);

  useEffect(() => {
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (material instanceof THREE.MeshStandardMaterial) {
          material.opacity = selected ? Math.max(opacity, 0.32) : opacity;
          const baseColor = material.userData.somaBaseColor;
          if (baseColor instanceof THREE.Color) material.color.copy(baseColor);
          material.color.lerp(new THREE.Color(selected ? "#f2b2b8" : "#b18586"), 0.42);
        }
      }
    });
  }, [model, opacity, selected]);

  useEffect(() => () => {
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) material.dispose();
      object.geometry.dispose();
    });
  }, [model]);

  return (
    <Center>
      <primitive object={model} />
    </Center>
  );
}

type SystemLayerProps = {
  id: string;
  selected: boolean;
  opacity: number;
  lens: SomaLensId;
};

function NervousLayer({ selected, opacity, lens }: SystemLayerProps) {
  const visual = somaSystemVisualById.get("nervous") ?? somaSystemVisuals[0];
  return (
    <>
      <Ellipsoid position={[-0.035, 0.695, 0.025]} scale={[0.045, 0.042, 0.05]} color={visual.color} opacity={opacity} active={selected} />
      <Ellipsoid position={[0.035, 0.695, 0.025]} scale={[0.045, 0.042, 0.05]} color={visual.color} opacity={opacity} active={selected} />
      <Ellipsoid position={[-0.038, 0.648, 0.025]} scale={[0.047, 0.044, 0.05]} color={visual.color} opacity={opacity} active={selected} />
      <Ellipsoid position={[0.038, 0.648, 0.025]} scale={[0.047, 0.044, 0.05]} color={visual.color} opacity={opacity} active={selected} />
      <Ellipsoid position={[0, 0.623, -0.025]} scale={[0.052, 0.03, 0.043]} color={visual.secondaryColor} opacity={opacity * 0.9} active={selected} />
      <Tube points={NERVE_LINES[0]} radius={0.012} color={visual.color} opacity={opacity} active={selected} />
      {NERVE_LINES.slice(1).map((points, index) => (
        <Line key={index} points={points} color={visual.color} transparent opacity={opacity * 0.86} lineWidth={selected ? 1.15 : 0.65} />
      ))}
      {selected && lens === "physiology" ? (
        <pointLight position={[0, 0.46, 0.2]} color={visual.color} intensity={0.45} distance={0.7} />
      ) : null}
    </>
  );
}

function CardiovascularLayer({ selected, opacity, lens }: SystemLayerProps) {
  const visual = somaSystemVisualById.get("cardiovascular") ?? somaSystemVisuals[1];
  const heartRef = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (heartRef.current && (lens !== "physiology" || !selected)) {
      heartRef.current.scale.setScalar(1);
    }
    invalidate();
  }, [invalidate, lens, selected]);

  useFrame(({ clock }) => {
    if (!heartRef.current || lens !== "physiology" || !selected) return;
    const beat = 1 + Math.max(0, Math.sin(clock.elapsedTime * 5.6)) * 0.045;
    heartRef.current.scale.setScalar(beat);
    invalidate();
  });

  return (
    <>
      <group ref={heartRef} position={[0.052, 0.305, 0.17]} rotation={[0, 0, -0.22]}>
        <Ellipsoid position={[-0.022, 0.012, 0]} scale={[0.048, 0.068, 0.043]} color={visual.color} opacity={opacity} active={selected} />
        <Ellipsoid position={[0.02, -0.005, 0.005]} scale={[0.043, 0.063, 0.041]} color={visual.color} opacity={opacity} active={selected} />
      </group>
      {CARDIO_LINES.map((points, index) => (
        <Line
          key={index}
          points={points}
          color={index % 2 === 0 ? visual.color : "#557fda"}
          transparent
          opacity={opacity * 0.92}
          lineWidth={selected ? 1.45 : 0.72}
        />
      ))}
    </>
  );
}

function RespiratoryLayer({ selected, opacity }: SystemLayerProps) {
  const visual = somaSystemVisualById.get("respiratory") ?? somaSystemVisuals[2];
  return (
    <>
      <Ellipsoid position={[-0.09, 0.34, 0.07]} scale={[0.09, 0.17, 0.065]} rotation={[0, 0.06, 0.08]} color={visual.color} opacity={opacity} active={selected} />
      <Ellipsoid position={[0.105, 0.34, 0.07]} scale={[0.09, 0.17, 0.065]} rotation={[0, -0.06, -0.08]} color={visual.color} opacity={opacity} active={selected} />
      <Tube points={[[0, 0.57, 0.1], [0, 0.45, 0.09], [-0.05, 0.37, 0.08]]} radius={0.016} color={visual.color} opacity={opacity} active={selected} />
      <Line points={[[0, 0.45, 0.09], [0.07, 0.37, 0.08], [0.12, 0.3, 0.07]]} color={visual.color} transparent opacity={opacity} lineWidth={selected ? 1.3 : 0.7} />
    </>
  );
}

function DigestiveLayer({ selected, opacity }: SystemLayerProps) {
  const visual = somaSystemVisualById.get("digestive") ?? somaSystemVisuals[3];
  return (
    <>
      <Tube points={[[0, 0.48, 0.04], [0, 0.24, 0.08], [-0.04, 0.15, 0.12]]} radius={0.012} color={visual.color} opacity={opacity} active={selected} />
      <Ellipsoid position={[0.085, 0.17, 0.08]} scale={[0.14, 0.065, 0.07]} rotation={[0.08, -0.08, -0.08]} color="#a25c45" opacity={opacity} active={selected} />
      <Ellipsoid position={[-0.055, 0.12, 0.12]} scale={[0.07, 0.1, 0.055]} rotation={[0.1, 0.1, -0.22]} color={visual.color} opacity={opacity} active={selected} />
      <Line
        points={[[0, 0.07, 0.13], [-0.09, 0.02, 0.14], [0.08, -0.02, 0.14], [-0.08, -0.07, 0.14], [0.07, -0.11, 0.14], [-0.04, -0.14, 0.14]]}
        color={visual.color}
        transparent
        opacity={opacity}
        lineWidth={selected ? 2.1 : 1.1}
      />
    </>
  );
}

function EndocrineLayer({ selected, opacity }: SystemLayerProps) {
  const visual = somaSystemVisualById.get("endocrine") ?? somaSystemVisuals[4];
  const glands: Array<[VectorTuple, VectorTuple]> = [
    [[0, 0.53, 0.13], [0.04, 0.025, 0.025]],
    [[0, 0.69, 0.01], [0.018, 0.018, 0.018]],
    [[-0.11, 0.08, 0.08], [0.025, 0.018, 0.02]],
    [[0.11, 0.08, 0.08], [0.025, 0.018, 0.02]],
    [[0, 0.1, 0.12], [0.12, 0.018, 0.024]],
  ];
  return glands.map(([position, scale], index) => (
    <Ellipsoid key={index} position={position} scale={scale} color={visual.color} opacity={opacity} active={selected} />
  ));
}

function ImmuneLayer({ selected, opacity }: SystemLayerProps) {
  const visual = somaSystemVisualById.get("immune") ?? somaSystemVisuals[5];
  const nodes: VectorTuple[] = [
    [-0.09, 0.49, 0.07], [0.09, 0.49, 0.07], [-0.18, 0.28, 0.04], [0.18, 0.28, 0.04],
    [-0.13, -0.12, 0.04], [0.13, -0.12, 0.04], [-0.14, -0.45, 0.03], [0.14, -0.45, 0.03],
  ];
  return (
    <>
      {LYMPH_LINES.map((points, index) => (
        <Line key={index} points={points} color={visual.color} transparent opacity={opacity * 0.75} lineWidth={selected ? 1.1 : 0.65} />
      ))}
      {nodes.map((position, index) => (
        <Ellipsoid key={index} position={position} scale={[0.018, 0.026, 0.016]} color={visual.color} opacity={opacity} active={selected} />
      ))}
      <Ellipsoid position={[-0.14, 0.13, 0.06]} scale={[0.045, 0.065, 0.035]} color={visual.color} opacity={opacity} active={selected} />
    </>
  );
}

function MusculoskeletalLayer({ selected, opacity }: SystemLayerProps) {
  return (
    <>
      <Ellipsoid position={[0, 0.67, -0.012]} scale={[0.112, 0.098, 0.09]} color="#e4d7c5" opacity={opacity} active={selected} wireframe />
      {SKELETON_SEGMENTS.map(([start, end, radius], index) => (
        <BoneBetween key={index} start={start} end={end} radius={radius} opacity={opacity} />
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          <Ellipsoid position={[0.22 * side, 0.16, -0.01]} scale={[0.07, 0.23, 0.055]} rotation={[0, 0, 0.17 * side]} color="#c66b64" opacity={opacity * 0.72} active={selected} />
          <Ellipsoid position={[0.12 * side, -0.4, -0.01]} scale={[0.085, 0.3, 0.065]} color="#c66b64" opacity={opacity * 0.72} active={selected} />
        </group>
      ))}
    </>
  );
}

function IntegumentaryLayer({ selected, opacity }: SystemLayerProps) {
  const visual = somaSystemVisualById.get("integumentary") ?? somaSystemVisuals[7];
  if (!selected) return null;
  return (
    <>
      <Ellipsoid position={[0, 0.66, -0.01]} scale={[0.132, 0.125, 0.11]} color={visual.color} opacity={opacity * 0.22} active />
      <Ellipsoid position={[0, 0.24, -0.02]} scale={[0.27, 0.38, 0.12]} color={visual.color} opacity={opacity * 0.14} active />
    </>
  );
}

function UrinaryLayer({ selected, opacity }: SystemLayerProps) {
  const visual = somaSystemVisualById.get("urinary") ?? somaSystemVisuals[8];
  return (
    <>
      <Ellipsoid position={[-0.11, 0.07, 0.055]} scale={[0.045, 0.07, 0.035]} rotation={[0, 0.2, -0.08]} color={visual.color} opacity={opacity} active={selected} />
      <Ellipsoid position={[0.11, 0.07, 0.055]} scale={[0.045, 0.07, 0.035]} rotation={[0, -0.2, 0.08]} color={visual.color} opacity={opacity} active={selected} />
      <Line points={[[-0.1, 0.02, 0.06], [-0.07, -0.11, 0.09], [0, -0.19, 0.12]]} color={visual.color} transparent opacity={opacity} lineWidth={selected ? 1.4 : 0.8} />
      <Line points={[[0.1, 0.02, 0.06], [0.07, -0.11, 0.09], [0, -0.19, 0.12]]} color={visual.color} transparent opacity={opacity} lineWidth={selected ? 1.4 : 0.8} />
      <Ellipsoid position={[0, -0.2, 0.12]} scale={[0.052, 0.06, 0.045]} color={visual.color} opacity={opacity} active={selected} />
    </>
  );
}

function ReproductiveLayer({ selected, opacity }: SystemLayerProps) {
  const visual = somaSystemVisualById.get("reproductive") ?? somaSystemVisuals[9];
  return (
    <>
      <Ellipsoid position={[0, -0.18, 0.14]} scale={[0.05, 0.065, 0.038]} color={visual.color} opacity={opacity} active={selected} />
      <Line points={[[0, -0.16, 0.14], [-0.08, -0.14, 0.13], [-0.12, -0.16, 0.12]]} color={visual.color} transparent opacity={opacity} lineWidth={selected ? 1.4 : 0.8} />
      <Line points={[[0, -0.16, 0.14], [0.08, -0.14, 0.13], [0.12, -0.16, 0.12]]} color={visual.color} transparent opacity={opacity} lineWidth={selected ? 1.4 : 0.8} />
      <Ellipsoid position={[-0.12, -0.16, 0.12]} scale={[0.025, 0.018, 0.018]} color={visual.color} opacity={opacity} active={selected} />
      <Ellipsoid position={[0.12, -0.16, 0.12]} scale={[0.025, 0.018, 0.018]} color={visual.color} opacity={opacity} active={selected} />
    </>
  );
}

const SYSTEM_LAYERS = {
  nervous: NervousLayer,
  cardiovascular: CardiovascularLayer,
  respiratory: RespiratoryLayer,
  digestive: DigestiveLayer,
  endocrine: EndocrineLayer,
  immune: ImmuneLayer,
  musculoskeletal: MusculoskeletalLayer,
  integumentary: IntegumentaryLayer,
  urinary: UrinaryLayer,
  reproductive: ReproductiveLayer,
} as const;

function SystemLayer({
  visualId,
  systemId,
  scale,
  lens,
  mode,
  onSelectSystem,
}: {
  visualId: keyof typeof SYSTEM_LAYERS;
  systemId: string;
  scale: SomaScaleId;
  lens: SomaLensId;
  mode: SomaViewMode;
  onSelectSystem: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);
  const selected = visualId === systemId;
  const visual = somaSystemVisualById.get(visualId) ?? somaSystemVisuals[0];
  const Layer = SYSTEM_LAYERS[visualId];
  const hidden = mode === "isolate" && !selected;
  const opacity = hidden
    ? 0
    : selected
      ? mode === "xray" ? 0.9 : 0.78
      : scale === "organism" ? 0.3 : mode === "context" ? 0.15 : 0.08;
  const targetPosition = useMemo(
    () => mode === "explode"
      ? new THREE.Vector3(...visual.explode).multiplyScalar(0.48)
      : new THREE.Vector3(),
    [mode, visual.explode],
  );

  useEffect(() => {
    invalidate();
  }, [invalidate, targetPosition]);

  useFrame(() => {
    if (!groupRef.current) return;
    if (groupRef.current.position.distanceToSquared(targetPosition) < 0.000001) {
      groupRef.current.position.copy(targetPosition);
      return;
    }
    groupRef.current.position.lerp(targetPosition, 0.12);
    invalidate();
  });

  const select = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelectSystem(visualId);
  };

  return (
    <group
      ref={groupRef}
      visible={!hidden}
      onClick={select}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <Layer id={visualId} selected={selected} opacity={opacity} lens={lens} />
    </group>
  );
}

function XrayBodyContext() {
  return (
    <group>
      <Ellipsoid position={[0, 0.66, -0.03]} scale={[0.125, 0.12, 0.105]} color="#9ba7b6" opacity={0.12} />
      <Ellipsoid position={[0, 0.28, -0.04]} scale={[0.235, 0.34, 0.12]} color="#8393a8" opacity={0.09} />
      <Ellipsoid position={[0, -0.09, -0.03]} scale={[0.18, 0.13, 0.11]} color="#8393a8" opacity={0.1} />
      <BoneBetween start={[-0.18, 0.38, -0.04]} end={[-0.43, 0.02, -0.04]} radius={0.052} opacity={0.11} />
      <BoneBetween start={[0.18, 0.38, -0.04]} end={[0.43, 0.02, -0.04]} radius={0.052} opacity={0.11} />
      <BoneBetween start={[-0.1, -0.12, -0.04]} end={[-0.15, -0.71, -0.04]} radius={0.072} opacity={0.11} />
      <BoneBetween start={[0.1, -0.12, -0.04]} end={[0.15, -0.71, -0.04]} radius={0.072} opacity={0.11} />
    </group>
  );
}

function BodyWorld(props: WorldProps) {
  const { systemId, scale, lens, mode, labels, onSelectSystem } = props;
  const shellOpacity = mode === "xray" ? 0.08 : 0.27;
  return (
    <group scale={1.75} rotation={[0, -0.075, 0]}>
      {mode === "xray" ? (
        <XrayBodyContext />
      ) : (
        <ContextAnatomy opacity={shellOpacity} selected={systemId === "integumentary"} />
      )}
      {(Object.keys(SYSTEM_LAYERS) as Array<keyof typeof SYSTEM_LAYERS>).map((visualId) => (
        <SystemLayer
          key={visualId}
          visualId={visualId}
          systemId={systemId}
          scale={scale}
          lens={lens}
          mode={mode}
          onSelectSystem={onSelectSystem}
        />
      ))}
      {labels && scale !== "organism" ? <ModelLabel systemId={systemId} /> : null}
    </group>
  );
}

function Mitochondrion({
  position,
  rotation,
  scale,
  active = false,
  onClick,
}: {
  position: VectorTuple;
  rotation: VectorTuple;
  scale: number;
  active?: boolean;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
}) {
  return (
    <group position={position} rotation={rotation} scale={scale} onClick={onClick}>
      <mesh scale={[1.35, 0.56, 0.62]}>
        <capsuleGeometry args={[0.55, 1.1, 8, 18]} />
        <meshPhysicalMaterial
          color={active ? "#ff655f" : "#a56c79"}
          transparent
          opacity={0.78}
          roughness={0.32}
          emissive={active ? "#ff493f" : "#2b0d14"}
          emissiveIntensity={active ? 0.24 : 0.06}
        />
      </mesh>
      {[-0.65, -0.3, 0.05, 0.4, 0.72].map((offset) => (
        <mesh key={offset} position={[offset, 0, 0.38]} rotation={[Math.PI / 2, 0, 0]} scale={[0.62, 0.36, 0.5]}>
          <torusGeometry args={[0.34, 0.055, 6, 16, Math.PI * 1.3]} />
          <meshStandardMaterial color="#ffd0bd" transparent opacity={active ? 0.92 : 0.5} emissive="#ff6e62" emissiveIntensity={0.08} />
        </mesh>
      ))}
    </group>
  );
}

function OrganelleWorld({ onScaleChange }: Pick<WorldProps, "onScaleChange">) {
  return (
    <group scale={1.35} onClick={(event) => { event.stopPropagation(); onScaleChange("molecule"); }}>
      <Mitochondrion position={[0, 0, 0]} rotation={[0.1, -0.18, -0.18]} scale={1.35} active />
      <Line points={[[-1.8, -0.95, -0.2], [-0.6, -0.5, 0], [0.45, -0.2, 0.2], [1.8, 0.7, 0.1]]} color="#57cee5" transparent opacity={0.46} lineWidth={1} />
    </group>
  );
}

function ProceduralMoleculeWorld() {
  const lipids = useMemo(
    () => Array.from({ length: 18 }, (_, index) => (index - 8.5) * 0.34),
    [],
  );
  return (
    <group rotation={[-0.18, 0.32, 0]}>
      {lipids.map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.62, 0]}>
            <sphereGeometry args={[0.11, 12, 9]} />
            <meshStandardMaterial color="#58cbe0" emissive="#164e61" emissiveIntensity={0.14} />
          </mesh>
          <mesh position={[0, -0.62, 0]}>
            <sphereGeometry args={[0.11, 12, 9]} />
            <meshStandardMaterial color="#58cbe0" emissive="#164e61" emissiveIntensity={0.14} />
          </mesh>
          <Line points={[[0, 0.52, 0], [0.03, 0.08, 0], [0, -0.52, 0]]} color="#8d7d93" transparent opacity={0.55} lineWidth={1} />
        </group>
      ))}
      <group>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.34, 1.8, 18, 1, true]} />
          <meshPhysicalMaterial color="#ff645e" transparent opacity={0.82} roughness={0.3} emissive="#8d2425" emissiveIntensity={0.15} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 1.08, 0]}>
          <sphereGeometry args={[0.48, 22, 16]} />
          <meshStandardMaterial color="#e9b489" emissive="#633527" emissiveIntensity={0.1} />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const angle = (index / 6) * Math.PI * 2;
          return (
            <mesh key={index} position={[Math.cos(angle) * 0.72, 1.1, Math.sin(angle) * 0.72]}>
              <sphereGeometry args={[0.17, 14, 10]} />
              <meshStandardMaterial color={index % 2 === 0 ? "#ff7a70" : "#e9c176"} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function MoleculeWorld({
  labels,
  onReferenceStatusChange,
  onStructureChange,
}: Pick<SomaAtlasCanvasProps, "labels" | "onReferenceStatusChange" | "onStructureChange">) {
  const fallback = <ProceduralMoleculeWorld />;
  return (
    <SomaReferenceMolecule
      fallback={fallback}
      labels={labels}
      onStatusChange={onReferenceStatusChange}
      onStructureChange={onStructureChange}
    />
  );
}

function CameraRig({
  controlsRef,
  systemId,
  scale,
  reducedMotion,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  systemId: string;
  scale: SomaScaleId;
  reducedMotion: boolean;
}) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const fromPosition = useRef(new THREE.Vector3());
  const fromTarget = useRef(new THREE.Vector3());
  const toPosition = useRef(new THREE.Vector3(0, 0, 5));
  const toTarget = useRef(new THREE.Vector3());
  const progress = useRef(1);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    fromPosition.current.copy(camera.position);
    fromTarget.current.copy(controls.target);

    if (scale === "organ") {
      toTarget.current.set(0, 0, 0);
      toPosition.current.set(0, 0, 7.3);
    } else if (scale === "organism") {
      toTarget.current.set(0, 0, 0);
      toPosition.current.set(0, 0.04, 7.2);
    } else if (scale === "system") {
      toTarget.current.set(0, 0, 0);
      toPosition.current.set(0, 0.06, 6.8);
    } else if (scale === "tissue") {
      toTarget.current.set(0, 0, 0);
      toPosition.current.set(0, 0, 7.5);
    } else if (scale === "cell") {
      toTarget.current.set(0, 0, 0);
      toPosition.current.set(0, 0, 9.4);
    } else if (scale === "organelle") {
      toTarget.current.set(0, 0, 0);
      toPosition.current.set(0, 0, 6.8);
    } else {
      toTarget.current.set(0, 0.28, 0);
      toPosition.current.set(0, 0.22, 7.4);
    }
    progress.current = reducedMotion ? 1 : 0;
    if (reducedMotion) {
      camera.position.copy(toPosition.current);
      controls.target.copy(toTarget.current);
      controls.update();
    }
    invalidate();
  }, [camera, controlsRef, invalidate, reducedMotion, scale, systemId]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || progress.current >= 1) return;
    progress.current = Math.min(1, progress.current + delta * 1.35);
    const t = 1 - Math.pow(1 - progress.current, 3);
    camera.position.lerpVectors(fromPosition.current, toPosition.current, t);
    controls.target.lerpVectors(fromTarget.current, toTarget.current, t);
    controls.update();
    if (progress.current < 1) invalidate();
  });

  return null;
}

function ContinuousRender({ active }: { active: boolean }) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);

  useFrame(() => {
    if (active) invalidate();
  });

  return null;
}

function AtlasWorld(props: SomaAtlasCanvasProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const micro = scaleOrder.indexOf(props.scale) >= scaleOrder.indexOf("tissue");
  return (
    <>
      <CameraRig controlsRef={controlsRef} systemId={props.systemId} scale={props.scale} reducedMotion={props.reducedMotion} />
      <ContinuousRender active={props.autoRotate && !props.reducedMotion} />
      <ambientLight intensity={micro ? 0.82 : 0.5} />
      <hemisphereLight args={["#dbeafe", "#2b0d14", micro ? 1.02 : 0.72]} />
      <directionalLight position={[4, 5, 6]} intensity={micro ? 1.95 : 1.65} color="#fff4ec" />
      <directionalLight position={[-4, 1, 2]} intensity={micro ? 1.05 : 0.72} color="#d97f93" />
      <pointLight position={[0, -2, 3]} intensity={0.38} color="#45c7df" />
      <group>
        {props.scale === "organism" || props.scale === "system" ? <BodyWorld {...props} /> : null}
        {props.scale === "organ" ? (
          <OrganWorld
            systemId={props.systemId}
            onScaleChange={props.onScaleChange}
            onReferenceStatusChange={props.onReferenceStatusChange}
            onStructureChange={props.onStructureChange}
          />
        ) : null}
        {props.scale === "tissue" ? <DetailTissueWorld systemId={props.systemId} onScaleChange={props.onScaleChange} /> : null}
        {props.scale === "cell" ? (
          <DetailCellWorld
            systemId={props.systemId}
            labels={props.labels}
            onScaleChange={props.onScaleChange}
            onReferenceStatusChange={props.onReferenceStatusChange}
            onStructureChange={props.onStructureChange}
          />
        ) : null}
        {props.scale === "organelle" ? <OrganelleWorld {...props} /> : null}
        {props.scale === "molecule" ? (
          <MoleculeWorld
            labels={props.labels}
            onReferenceStatusChange={props.onReferenceStatusChange}
            onStructureChange={props.onStructureChange}
          />
        ) : null}
        {props.labels && micro ? <MicroLabel scale={props.scale} systemId={props.systemId} /> : null}
      </group>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        enablePan={micro}
        enableZoom={false}
        autoRotate={props.autoRotate && !props.reducedMotion}
        autoRotateSpeed={0.45}
        rotateSpeed={0.46}
        panSpeed={0.45}
        minPolarAngle={Math.PI * 0.28}
        maxPolarAngle={Math.PI * 0.72}
      />
    </>
  );
}

export default function SomaAtlasCanvas(props: SomaAtlasCanvasProps) {
  const background = props.theme === "light" ? "#eee9e4" : "#000000";
  const detailWorld = props.scale !== "organism" && props.scale !== "system";
  const [canvasEpoch, setCanvasEpoch] = useState(0);
  const [canvasHealth, setCanvasHealth] = useState<"ready" | "recovering">("ready");
  const recoveryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detachCanvasListeners = useRef<() => void>(() => {});

  const clearRecoveryTimer = useCallback(() => {
    if (recoveryTimer.current === null) return;
    clearTimeout(recoveryTimer.current);
    recoveryTimer.current = null;
  }, []);

  const restartCanvas = useCallback(() => {
    clearRecoveryTimer();
    detachCanvasListeners.current();
    setCanvasEpoch((current) => current + 1);
  }, [clearRecoveryTimer]);

  const handleCanvasFailure = useCallback(() => {
    setCanvasHealth("recovering");
    clearRecoveryTimer();
    recoveryTimer.current = setTimeout(restartCanvas, 1200);
  }, [clearRecoveryTimer, restartCanvas]);

  const handleCreated = useCallback((state: RootState) => {
    detachCanvasListeners.current();
    const canvas = state.gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      setCanvasHealth("recovering");
      clearRecoveryTimer();
      recoveryTimer.current = setTimeout(restartCanvas, 1200);
    };
    const handleContextRestored = () => {
      clearRecoveryTimer();
      setCanvasHealth("ready");
      state.invalidate();
    };
    const handleContextCreationError = () => {
      setCanvasHealth("recovering");
      clearRecoveryTimer();
      recoveryTimer.current = setTimeout(restartCanvas, 1200);
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    canvas.addEventListener("webglcontextrestored", handleContextRestored);
    canvas.addEventListener("webglcontextcreationerror", handleContextCreationError);
    detachCanvasListeners.current = () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      canvas.removeEventListener("webglcontextcreationerror", handleContextCreationError);
    };

    setCanvasHealth("ready");
    state.invalidate();
  }, [clearRecoveryTimer, restartCanvas]);

  useEffect(() => () => {
    clearRecoveryTimer();
    detachCanvasListeners.current();
  }, [clearRecoveryTimer]);

  useEffect(() => {
    if (props.scale === "organism" || props.scale === "system") {
      useGLTF.preload(anatomyModelPath, false, true);
    }
  }, [props.scale]);

  return (
    <div className="soma-canvas" data-canvas-health={canvasHealth}>
      <div className="soma-canvas-webgl" aria-hidden="true">
        <SomaCanvasErrorBoundary key={canvasEpoch} onFailure={handleCanvasFailure}>
          <Canvas
            dpr={SOMA_DPR}
            frameloop="demand"
            camera={SOMA_CAMERA}
            gl={SOMA_GL}
            onCreated={handleCreated}
          >
            <color attach="background" args={[background]} />
            <fog attach="fog" args={[background, detailWorld ? 10 : 5.5, detailWorld ? 18 : 10]} />
            <AtlasWorld {...props} />
          </Canvas>
        </SomaCanvasErrorBoundary>
      </div>
      {canvasHealth === "recovering" ? (
        <div className="soma-canvas-recovery" role="status" aria-live="polite">
          <span aria-hidden />
          <p>Reconnecting the anatomical atlas</p>
          <button type="button" onClick={restartCanvas}>Restart 3D view</button>
        </div>
      ) : null}
    </div>
  );
}
