"use client";

import { Instance, Instances, Line, RoundedBox } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import {
  somaSystemVisualById,
  somaSystemVisuals,
  type SomaSystemVisual,
  type VectorTuple,
} from "@/components/soma/soma-scene-data";
import type { SomaScaleId } from "@/lib/soma";

type DetailWorldProps = {
  systemId: string;
  onScaleChange: (scale: SomaScaleId) => void;
};

type VisualProps = { visual: SomaSystemVisual };

type CloudItem = {
  position: VectorTuple;
  scale?: number | VectorTuple;
  rotation?: VectorTuple;
};

function SurfaceMaterial({
  color,
  opacity = 0.9,
  emissive = color,
  emissiveIntensity = 0.2,
  roughness = 0.46,
}: {
  color: string;
  opacity?: number;
  emissive?: string;
  emissiveIntensity?: number;
  roughness?: number;
}) {
  return (
    <meshStandardMaterial
      color={color}
      transparent={opacity < 1}
      opacity={opacity}
      depthWrite={opacity > 0.48}
      roughness={roughness}
      metalness={0.01}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  );
}

function Orb({
  position,
  scale,
  rotation,
  color,
  opacity = 0.9,
  emissiveIntensity,
}: {
  position: VectorTuple;
  scale: VectorTuple;
  rotation?: VectorTuple;
  color: string;
  opacity?: number;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <sphereGeometry args={[1, 32, 24]} />
      <SurfaceMaterial color={color} opacity={opacity} emissiveIntensity={emissiveIntensity} />
    </mesh>
  );
}

function TaperedOrb({
  position,
  scale,
  rotation,
  color,
  opacity = 0.94,
  taper = 0.42,
}: {
  position: VectorTuple;
  scale: VectorTuple;
  rotation?: VectorTuple;
  color: string;
  opacity?: number;
  taper?: number;
}) {
  const geometry = useMemo(() => {
    const nextGeometry = new THREE.SphereGeometry(1, 36, 26);
    const positions = nextGeometry.attributes.position;
    for (let index = 0; index < positions.count; index += 1) {
      const y = positions.getY(index);
      const normalizedHeight = THREE.MathUtils.clamp((y + 1) * 0.5, 0, 1);
      const width = taper + (1 - taper) * Math.pow(normalizedHeight, 0.62);
      positions.setX(index, positions.getX(index) * width);
      positions.setZ(index, positions.getZ(index) * (0.72 + width * 0.28));
    }
    positions.needsUpdate = true;
    nextGeometry.computeVertexNormals();
    return nextGeometry;
  }, [taper]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh position={position} scale={scale} rotation={rotation} geometry={geometry}>
      <SurfaceMaterial color={color} opacity={opacity} />
    </mesh>
  );
}

function Capsule({
  position,
  scale,
  rotation,
  color,
  opacity = 0.9,
}: {
  position: VectorTuple;
  scale: VectorTuple;
  rotation?: VectorTuple;
  color: string;
  opacity?: number;
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <capsuleGeometry args={[0.42, 1, 7, 18]} />
      <SurfaceMaterial color={color} opacity={opacity} />
    </mesh>
  );
}

function CurvedTube({
  points,
  radius,
  color,
  opacity = 0.9,
  tubularSegments = 32,
}: {
  points: readonly VectorTuple[];
  radius: number;
  color: string;
  opacity?: number;
  tubularSegments?: number;
}) {
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point))),
    [points],
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, tubularSegments, radius, 8, false]} />
      <SurfaceMaterial color={color} opacity={opacity} />
    </mesh>
  );
}

function RodBetween({
  start,
  end,
  radius,
  color,
  opacity = 0.9,
}: {
  start: VectorTuple;
  end: VectorTuple;
  radius: number;
  color: string;
  opacity?: number;
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
      <cylinderGeometry args={[radius, radius * 0.92, length, 12]} />
      <SurfaceMaterial color={color} opacity={opacity} />
    </mesh>
  );
}

function SphereCloud({
  items,
  radius,
  color,
  opacity = 0.9,
  detail = 16,
}: {
  items: readonly CloudItem[];
  radius: number;
  color: string;
  opacity?: number;
  detail?: number;
}) {
  return (
    <Instances limit={items.length} range={items.length}>
      <sphereGeometry args={[radius, detail, Math.max(8, Math.round(detail * 0.7))]} />
      <meshStandardMaterial
        color={color}
        transparent={opacity < 1}
        opacity={opacity}
        roughness={0.48}
        emissive={color}
        emissiveIntensity={0.16}
      />
      {items.map((item, index) => (
        <Instance
          key={index}
          position={item.position}
          scale={item.scale ?? 1}
          rotation={item.rotation}
        />
      ))}
    </Instances>
  );
}

const BRAIN_LOBES: CloudItem[] = [
  { position: [-0.47, 0.36, 0.05], scale: [0.78, 0.74, 0.66] },
  { position: [0.47, 0.36, 0.05], scale: [0.78, 0.74, 0.66] },
  { position: [-0.52, -0.22, 0.08], scale: [0.72, 0.65, 0.62] },
  { position: [0.52, -0.22, 0.08], scale: [0.72, 0.65, 0.62] },
  { position: [-0.25, 0.73, -0.08], scale: [0.62, 0.54, 0.58] },
  { position: [0.25, 0.73, -0.08], scale: [0.62, 0.54, 0.58] },
];

const BRAIN_FISSURES: VectorTuple[][] = [
  [[0, 1.03, 0.62], [-0.03, 0.56, 0.7], [0.02, 0.08, 0.68], [0, -0.63, 0.55]],
  [[-0.85, 0.38, 0.55], [-0.43, 0.18, 0.69], [-0.12, 0.24, 0.72]],
  [[0.85, 0.38, 0.55], [0.43, 0.18, 0.69], [0.12, 0.24, 0.72]],
];

function BrainOrgan({ visual }: VisualProps) {
  return (
    <group rotation={[-0.08, 0.22, 0]} scale={1.05}>
      {BRAIN_LOBES.map((lobe, index) => (
        <Orb
          key={index}
          position={lobe.position}
          scale={lobe.scale as VectorTuple}
          color={visual.color}
          opacity={0.92}
          emissiveIntensity={0.055}
        />
      ))}
      <Orb position={[0, -0.67, -0.22]} scale={[0.58, 0.34, 0.44]} color={visual.secondaryColor} opacity={0.82} />
      <Capsule position={[0, -1.03, -0.08]} scale={[0.22, 0.5, 0.22]} color="#8e9ed8" opacity={0.84} />
      {BRAIN_FISSURES.map((points, index) => (
        <Line key={index} points={points} color="#0b1730" transparent opacity={0.6} lineWidth={0.8} />
      ))}
    </group>
  );
}

const HEART_AORTA: VectorTuple[] = [
  [0.15, 0.54, 0.02], [0.1, 1.08, 0.02], [0.52, 1.26, 0.01], [0.76, 0.94, -0.02],
];
const HEART_VENA: VectorTuple[] = [[-0.42, 1.08, -0.08], [-0.4, 0.44, 0], [-0.2, 0.08, 0.08]];
const HEART_PULMONARY: VectorTuple[] = [[0.02, 0.52, 0.22], [-0.5, 0.72, 0.24], [-0.92, 0.55, 0.14]];

function HeartOrgan({ visual }: VisualProps) {
  return (
    <group rotation={[0.08, -0.24, -0.18]} scale={0.96}>
      <TaperedOrb position={[-0.18, -0.12, 0.06]} scale={[0.78, 1.2, 0.58]} rotation={[0, 0, -0.16]} color="#d94c56" opacity={0.98} taper={0.28} />
      <TaperedOrb position={[0.3, -0.02, -0.02]} scale={[0.66, 1.02, 0.54]} rotation={[0, 0, 0.13]} color={visual.color} opacity={0.96} taper={0.36} />
      <Orb position={[-0.38, 0.72, -0.04]} scale={[0.38, 0.34, 0.34]} color="#ba4050" opacity={0.95} />
      <Orb position={[0.28, 0.76, 0]} scale={[0.36, 0.32, 0.34]} color="#e56068" opacity={0.95} />
      <CurvedTube points={HEART_AORTA} radius={0.13} color="#f16b70" opacity={0.95} />
      <CurvedTube points={HEART_VENA} radius={0.11} color={visual.secondaryColor} opacity={0.9} />
      <CurvedTube points={HEART_PULMONARY} radius={0.08} color="#7ca8ff" opacity={0.9} />
    </group>
  );
}

const LEFT_BRONCHUS: VectorTuple[] = [[0, 0.95, 0.2], [0, 0.38, 0.18], [-0.35, 0.08, 0.18], [-0.64, -0.2, 0.13]];
const RIGHT_BRONCHUS: VectorTuple[] = [[0, 0.38, 0.18], [0.38, 0.08, 0.18], [0.7, -0.18, 0.13]];
const LUNG_ALVEOLI: CloudItem[] = [
  { position: [-0.95, -0.78, 0.18], scale: 0.9 }, { position: [-0.65, -0.94, 0.12], scale: 0.7 },
  { position: [-1.06, -0.4, 0.08], scale: 0.64 }, { position: [0.95, -0.78, 0.18], scale: 0.9 },
  { position: [0.65, -0.94, 0.12], scale: 0.7 }, { position: [1.06, -0.4, 0.08], scale: 0.64 },
];

function LungOrgan({ visual }: VisualProps) {
  return (
    <group rotation={[0.02, -0.12, 0]} scale={0.95}>
      <Orb position={[-0.63, 0.15, -0.02]} scale={[0.7, 1.25, 0.55]} rotation={[0, 0.08, 0.08]} color={visual.color} opacity={0.82} />
      <Orb position={[0.63, 0.15, -0.02]} scale={[0.7, 1.25, 0.55]} rotation={[0, -0.08, -0.08]} color={visual.color} opacity={0.82} />
      <Orb position={[-0.57, -0.54, 0.08]} scale={[0.62, 0.7, 0.48]} color={visual.secondaryColor} opacity={0.68} />
      <Orb position={[0.57, -0.54, 0.08]} scale={[0.62, 0.7, 0.48]} color={visual.secondaryColor} opacity={0.68} />
      <CurvedTube points={LEFT_BRONCHUS} radius={0.09} color="#a9e6e5" opacity={0.94} />
      <CurvedTube points={RIGHT_BRONCHUS} radius={0.09} color="#a9e6e5" opacity={0.94} />
      <SphereCloud items={LUNG_ALVEOLI} radius={0.16} color={visual.secondaryColor} opacity={0.8} />
    </group>
  );
}

function IntestineOrgan({ visual }: VisualProps) {
  const bowel = useMemo(() => {
    const points: VectorTuple[] = [];
    for (let row = 0; row < 7; row += 1) {
      const y = 1.0 - row * 0.34;
      const direction = row % 2 === 0 ? 1 : -1;
      for (let step = 0; step < 7; step += 1) {
        const normalized = step / 6;
        points.push([(direction * (normalized * 2 - 1)) * 1.05, y, Math.sin(step * 0.9 + row) * 0.12]);
      }
    }
    return points;
  }, []);
  return (
    <group rotation={[-0.08, 0.16, 0]} scale={0.9}>
      <Orb position={[0, 0, -0.26]} scale={[1.38, 1.32, 0.22]} color="#173d2d" opacity={0.25} />
      <CurvedTube points={bowel} radius={0.115} color={visual.color} opacity={0.94} tubularSegments={92} />
      <CurvedTube points={[[1.02, 1.0, 0.02], [1.2, 0.55, 0], [1.25, -0.4, 0], [0.98, -1.02, 0]]} radius={0.16} color="#4a9d73" opacity={0.74} />
      <Orb position={[-0.55, 1.18, 0]} scale={[0.62, 0.3, 0.28]} color={visual.secondaryColor} opacity={0.68} />
    </group>
  );
}

const THYROID_FOLLICLES: CloudItem[] = [
  { position: [-0.62, 0.55, 0.44], scale: 0.7 }, { position: [-0.73, 0.03, 0.48], scale: 0.9 },
  { position: [-0.54, -0.55, 0.4], scale: 0.62 }, { position: [0.62, 0.55, 0.44], scale: 0.7 },
  { position: [0.73, 0.03, 0.48], scale: 0.9 }, { position: [0.54, -0.55, 0.4], scale: 0.62 },
];

function ThyroidOrgan({ visual }: VisualProps) {
  return (
    <group rotation={[-0.02, 0.2, 0]}>
      <Capsule position={[-0.58, 0, 0]} scale={[0.7, 1.18, 0.6]} rotation={[0, 0, -0.08]} color={visual.color} opacity={0.9} />
      <Capsule position={[0.58, 0, 0]} scale={[0.7, 1.18, 0.6]} rotation={[0, 0, 0.08]} color={visual.color} opacity={0.9} />
      <RoundedBox args={[1.1, 0.34, 0.5]} radius={0.14} smoothness={3} position={[0, -0.03, 0]}>
        <SurfaceMaterial color={visual.secondaryColor} opacity={0.86} />
      </RoundedBox>
      <SphereCloud items={THYROID_FOLLICLES} radius={0.13} color={visual.secondaryColor} opacity={0.94} />
    </group>
  );
}

const LYMPH_FOLLICLES: CloudItem[] = [
  { position: [-0.45, 0.65, 0.48], scale: 1.1 }, { position: [0.16, 0.78, 0.52], scale: 0.82 },
  { position: [0.55, 0.28, 0.5], scale: 1 }, { position: [-0.52, -0.14, 0.52], scale: 0.8 },
  { position: [0.18, -0.37, 0.54], scale: 1.15 }, { position: [-0.18, -0.86, 0.44], scale: 0.74 },
];

function LymphNodeOrgan({ visual }: VisualProps) {
  return (
    <group rotation={[-0.05, 0.26, -0.2]}>
      <Orb position={[0, 0, 0]} scale={[1.02, 1.38, 0.62]} color={visual.color} opacity={0.36} />
      <Orb position={[-0.05, 0, 0.12]} scale={[0.75, 1.03, 0.43]} color="#5c5126" opacity={0.78} />
      <SphereCloud items={LYMPH_FOLLICLES} radius={0.23} color={visual.secondaryColor} opacity={0.9} />
      <CurvedTube points={[[-1.35, 0.72, 0], [-0.82, 0.48, 0.08], [-0.34, 0.22, 0.12]]} radius={0.07} color="#d7c65c" opacity={0.82} />
      <CurvedTube points={[[0.25, -0.2, 0.12], [0.85, -0.6, 0.06], [1.4, -0.78, 0]]} radius={0.09} color={visual.color} opacity={0.9} />
    </group>
  );
}

const FEMUR_START: VectorTuple = [-0.42, 1.25, 0];
const FEMUR_END: VectorTuple = [0.18, -1.2, 0];

function MuscleBoneOrgan({ visual }: VisualProps) {
  return (
    <group rotation={[0.04, -0.18, -0.14]} scale={0.92}>
      <RodBetween start={FEMUR_START} end={FEMUR_END} radius={0.17} color="#e7dac7" opacity={0.96} />
      <Orb position={[-0.52, 1.34, 0]} scale={[0.34, 0.34, 0.34]} color="#eee4d7" opacity={0.98} />
      <Orb position={[0.18, -1.25, 0]} scale={[0.42, 0.28, 0.34]} color="#e7dac7" opacity={0.96} />
      <Capsule position={[0.54, 0.08, -0.06]} scale={[0.52, 1.35, 0.5]} rotation={[0, 0, -0.12]} color={visual.secondaryColor} opacity={0.72} />
      <Capsule position={[-0.58, -0.1, 0.12]} scale={[0.44, 1.12, 0.44]} rotation={[0, 0, 0.18]} color="#a94e4e" opacity={0.76} />
      {[-0.75, -0.25, 0.25, 0.75].map((offset) => (
        <Line key={offset} points={[[0.28 + offset * 0.09, 0.94, 0.48], [0.66 + offset * 0.09, -0.85, 0.48]]} color="#f0a099" transparent opacity={0.6} lineWidth={0.7} />
      ))}
    </group>
  );
}

const HAIR_PATH: VectorTuple[] = [[-0.55, 1.1, 0.45], [-0.48, 0.42, 0.2], [-0.28, -0.58, -0.12]];
const SWEAT_PATH: VectorTuple[] = [[0.55, -0.72, 0.25], [0.83, -0.88, 0.2], [0.92, -0.62, 0.18], [0.68, -0.48, 0.2], [0.5, -0.68, 0.22]];

function SkinOrgan({ visual }: VisualProps) {
  return (
    <group rotation={[-0.42, 0.2, 0]} scale={0.95}>
      <RoundedBox args={[2.8, 0.34, 1.7]} radius={0.12} smoothness={3} position={[0, 0.72, 0]}>
        <SurfaceMaterial color={visual.color} opacity={0.92} />
      </RoundedBox>
      <RoundedBox args={[2.8, 0.68, 1.7]} radius={0.12} smoothness={3} position={[0, 0.2, 0]}>
        <SurfaceMaterial color={visual.secondaryColor} opacity={0.78} />
      </RoundedBox>
      <RoundedBox args={[2.8, 0.72, 1.7]} radius={0.12} smoothness={3} position={[0, -0.5, 0]}>
        <SurfaceMaterial color="#c58d61" opacity={0.66} />
      </RoundedBox>
      <CurvedTube points={HAIR_PATH} radius={0.065} color="#5d3938" opacity={0.95} />
      <CurvedTube points={SWEAT_PATH} radius={0.055} color="#65b9c9" opacity={0.86} />
    </group>
  );
}

const RENAL_CALYX: VectorTuple[][] = [
  [[0.15, 0.12, 0.38], [-0.28, 0.62, 0.42], [-0.54, 0.86, 0.38]],
  [[0.15, 0.12, 0.38], [-0.4, 0.12, 0.44], [-0.72, -0.08, 0.4]],
  [[0.15, 0.12, 0.38], [-0.22, -0.52, 0.42], [-0.42, -0.88, 0.38]],
];

function KidneyOrgan({ visual }: VisualProps) {
  return (
    <group rotation={[0.05, -0.42, -0.18]} scale={1.03}>
      <mesh scale={[1.15, 1.38, 0.62]} rotation={[0, 0, -0.26]}>
        <torusGeometry args={[0.72, 0.38, 18, 48, Math.PI * 1.72]} />
        <SurfaceMaterial color={visual.color} opacity={0.92} />
      </mesh>
      <Orb position={[0.18, 0.04, 0.14]} scale={[0.42, 0.7, 0.3]} color="#d8c8ff" opacity={0.64} />
      {RENAL_CALYX.map((points, index) => (
        <CurvedTube key={index} points={points} radius={0.055} color={visual.secondaryColor} opacity={0.9} />
      ))}
      <CurvedTube points={[[0.35, -0.18, 0.22], [0.72, -0.66, 0.08], [0.78, -1.48, 0]]} radius={0.075} color="#a7b9ee" opacity={0.84} />
    </group>
  );
}

const GONAD_FOLLICLES: CloudItem[] = [
  { position: [-0.5, 0.52, 0.48], scale: 0.8 }, { position: [0.12, 0.62, 0.5], scale: 1.1 },
  { position: [0.55, 0.12, 0.52], scale: 0.65 }, { position: [-0.55, -0.18, 0.5], scale: 1.18 },
  { position: [0.2, -0.56, 0.48], scale: 0.72 }, { position: [0.68, -0.5, 0.42], scale: 0.48 },
];

function GonadOrgan({ visual }: VisualProps) {
  return (
    <group rotation={[-0.04, 0.3, -0.12]}>
      <Orb position={[0, 0, 0]} scale={[1.2, 1.05, 0.64]} color={visual.color} opacity={0.44} />
      <Orb position={[0, 0, 0.06]} scale={[0.94, 0.8, 0.46]} color="#5e3b58" opacity={0.75} />
      <SphereCloud items={GONAD_FOLLICLES} radius={0.21} color={visual.secondaryColor} opacity={0.92} />
      <CurvedTube points={[[0.82, 0.48, 0.1], [1.3, 0.66, 0], [1.55, 0.25, -0.05], [1.42, -0.38, -0.08]]} radius={0.08} color={visual.color} opacity={0.86} />
    </group>
  );
}

const ORGAN_MODELS: Record<string, (props: VisualProps) => React.ReactNode> = {
  nervous: BrainOrgan,
  cardiovascular: HeartOrgan,
  respiratory: LungOrgan,
  digestive: IntestineOrgan,
  endocrine: ThyroidOrgan,
  immune: LymphNodeOrgan,
  musculoskeletal: MuscleBoneOrgan,
  integumentary: SkinOrgan,
  urinary: KidneyOrgan,
  reproductive: GonadOrgan,
};

export function OrganWorld({ systemId }: DetailWorldProps) {
  const visual = somaSystemVisualById.get(systemId) ?? somaSystemVisuals[0];
  const Organ = ORGAN_MODELS[systemId] ?? BrainOrgan;
  return (
    <group scale={0.92}>
      <Organ visual={visual} />
    </group>
  );
}

function TissueDrillTarget({ onSelect }: { onSelect: () => void }) {
  return (
    <mesh
      position={[0, 0, 1.1]}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <sphereGeometry args={[0.42, 12, 8]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

const NEURAL_SOMATA: CloudItem[] = [
  { position: [-1.2, 0.7, 0.05], scale: 1.1 }, { position: [0, 0.78, 0.08], scale: 0.78 },
  { position: [1.2, 0.55, 0], scale: 0.95 }, { position: [-0.68, -0.55, 0.1], scale: 0.72 },
  { position: [0.42, -0.38, 0.18], scale: 1.2 }, { position: [1.3, -0.72, 0.06], scale: 0.7 },
];
const NEURAL_AXONS: VectorTuple[][] = [
  [[-1.2, 0.7, 0.05], [-0.55, 0.4, 0.18], [0, 0.78, 0.08], [0.55, 0.3, 0.12], [1.2, 0.55, 0]],
  [[-1.2, 0.7, 0.05], [-1, 0.05, 0.1], [-0.68, -0.55, 0.1], [0.05, -0.62, 0.2], [0.42, -0.38, 0.18]],
  [[0.42, -0.38, 0.18], [0.9, -0.22, 0.1], [1.3, -0.72, 0.06]],
];

function NeuralTissue({ visual }: VisualProps) {
  return (
    <group rotation={[-0.16, 0.12, 0]}>
      {NEURAL_AXONS.map((points, index) => (
        <CurvedTube key={index} points={points} radius={0.026} color={visual.secondaryColor} opacity={0.82} />
      ))}
      <SphereCloud items={NEURAL_SOMATA} radius={0.24} color={visual.color} opacity={0.9} />
      <SphereCloud
        items={NEURAL_SOMATA.map((item) => ({ position: [item.position[0] + 0.1, item.position[1] - 0.08, 0.28] as VectorTuple, scale: 0.38 }))}
        radius={0.2}
        color="#e8d7ff"
        opacity={0.78}
      />
    </group>
  );
}

const CARDIAC_FIBERS = [-1.05, -0.52, 0, 0.52, 1.05];
const CARDIAC_DISCS: CloudItem[] = CARDIAC_FIBERS.flatMap((y) =>
  [-1.25, -0.62, 0, 0.62, 1.25].map((x) => ({ position: [x, y, 0.38] as VectorTuple, scale: [0.7, 0.7, 1] as VectorTuple })),
);

function CardiacTissue({ visual }: VisualProps) {
  return (
    <group rotation={[-0.15, 0.1, -0.08]} scale={0.9}>
      {CARDIAC_FIBERS.map((y, index) => (
        <Capsule key={y} position={[0, y, 0]} scale={[0.36, 1.7, 0.3]} rotation={[0, 0, Math.PI / 2]} color={index === 2 ? visual.color : "#a83d4c"} opacity={0.84} />
      ))}
      <Instances limit={CARDIAC_DISCS.length} range={CARDIAC_DISCS.length}>
        <torusGeometry args={[0.26, 0.035, 6, 14]} />
        <meshStandardMaterial color={visual.secondaryColor} transparent opacity={0.66} />
        {CARDIAC_DISCS.map((item, index) => (
          <Instance key={index} position={item.position} scale={item.scale} rotation={[0, Math.PI / 2, 0]} />
        ))}
      </Instances>
    </group>
  );
}

const ALVEOLI: CloudItem[] = Array.from({ length: 18 }, (_, index) => {
  const row = Math.floor(index / 6);
  const column = index % 6;
  return { position: [(column - 2.5) * 0.5 + (row % 2) * 0.24, (row - 1) * 0.56, Math.sin(index) * 0.08] as VectorTuple, scale: 0.85 + (index % 3) * 0.08 };
});

function AlveolarTissue({ visual }: VisualProps) {
  return (
    <group rotation={[-0.18, 0.12, 0]}>
      <Instances limit={ALVEOLI.length} range={ALVEOLI.length}>
        <torusGeometry args={[0.22, 0.055, 8, 18]} />
        <meshStandardMaterial color={visual.color} transparent opacity={0.78} roughness={0.4} />
        {ALVEOLI.map((item, index) => <Instance key={index} position={item.position} scale={item.scale} />)}
      </Instances>
      <CurvedTube points={[[-1.55, -0.76, 0.3], [-0.65, -0.25, 0.42], [0.1, -0.55, 0.45], [0.9, 0.08, 0.42], [1.5, 0.7, 0.34]]} radius={0.045} color="#ff6c75" opacity={0.82} tubularSegments={44} />
    </group>
  );
}

const VILLUS_X = [-1.35, -0.9, -0.45, 0, 0.45, 0.9, 1.35];

function IntestinalTissue({ visual }: VisualProps) {
  return (
    <group rotation={[-0.2, 0.08, 0]} scale={0.92}>
      <RoundedBox args={[3.4, 0.38, 1.15]} radius={0.14} smoothness={3} position={[0, -0.94, -0.08]}>
        <SurfaceMaterial color="#335f45" opacity={0.72} />
      </RoundedBox>
      {VILLUS_X.map((x, index) => (
        <group key={x} position={[x, -0.12, 0]}>
          <Capsule position={[0, 0, 0]} scale={[0.33, 0.85 + (index % 2) * 0.12, 0.28]} color={index === 3 ? visual.color : "#77bf8f"} opacity={0.86} />
          <Line points={[[0, -0.55, 0.28], [0, 0.58, 0.28]]} color={visual.secondaryColor} transparent opacity={0.66} lineWidth={0.8} />
        </group>
      ))}
    </group>
  );
}

const FOLLICLE_POSITIONS: CloudItem[] = [
  { position: [-1.15, 0.62, 0], scale: 1.05 }, { position: [0, 0.72, 0.06], scale: 0.8 },
  { position: [1.12, 0.55, 0], scale: 1 }, { position: [-0.65, -0.58, 0.08], scale: 0.86 },
  { position: [0.55, -0.48, 0.12], scale: 1.18 },
];

function EndocrineTissue({ visual }: VisualProps) {
  return (
    <group rotation={[-0.15, 0.08, 0]}>
      <Instances limit={FOLLICLE_POSITIONS.length} range={FOLLICLE_POSITIONS.length}>
        <torusGeometry args={[0.42, 0.12, 10, 24]} />
        <meshStandardMaterial color={visual.color} transparent opacity={0.86} roughness={0.42} />
        {FOLLICLE_POSITIONS.map((item, index) => <Instance key={index} position={item.position} scale={item.scale} />)}
      </Instances>
      <SphereCloud items={FOLLICLE_POSITIONS} radius={0.28} color={visual.secondaryColor} opacity={0.72} />
    </group>
  );
}

const LYMPHOCYTES: CloudItem[] = Array.from({ length: 38 }, (_, index) => {
  const angle = index * 2.399;
  const radius = 0.2 + (index % 8) * 0.18;
  return { position: [Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, Math.sin(index * 1.4) * 0.14] as VectorTuple, scale: index % 7 === 0 ? 1.35 : 0.78 };
});

function ImmuneTissue({ visual }: VisualProps) {
  return (
    <group rotation={[-0.16, 0.1, 0]}>
      <Orb position={[0, 0, -0.2]} scale={[1.65, 1.2, 0.25]} color="#4d4826" opacity={0.3} />
      <SphereCloud items={LYMPHOCYTES} radius={0.13} color={visual.color} opacity={0.9} detail={10} />
      <Orb position={[0.15, 0.08, 0.12]} scale={[0.62, 0.5, 0.26]} color={visual.secondaryColor} opacity={0.46} />
      <Line points={[[-1.5, -0.8, 0.22], [-0.7, 0.2, 0.28], [0.1, -0.1, 0.3], [0.82, 0.72, 0.22], [1.48, 0.2, 0.18]]} color="#d8c766" transparent opacity={0.4} lineWidth={0.7} />
    </group>
  );
}

const MUSCLE_FIBERS = [-1.2, -0.72, -0.24, 0.24, 0.72, 1.2];
const MUSCLE_STRIATIONS: CloudItem[] = MUSCLE_FIBERS.flatMap((y) =>
  [-1.35, -0.9, -0.45, 0, 0.45, 0.9, 1.35].map((x) => ({ position: [x, y, 0.34] as VectorTuple })),
);

function MuscleTissue({ visual }: VisualProps) {
  return (
    <group rotation={[-0.14, 0.12, -0.04]} scale={0.88}>
      {MUSCLE_FIBERS.map((y, index) => (
        <Capsule key={y} position={[0, y, 0]} scale={[0.28, 1.85, 0.28]} rotation={[0, 0, Math.PI / 2]} color={index === 2 ? visual.secondaryColor : "#9f4b4b"} opacity={0.9} />
      ))}
      <Instances limit={MUSCLE_STRIATIONS.length} range={MUSCLE_STRIATIONS.length}>
        <torusGeometry args={[0.22, 0.025, 5, 12]} />
        <meshStandardMaterial color="#f0b09f" transparent opacity={0.62} />
        {MUSCLE_STRIATIONS.map((item, index) => <Instance key={index} position={item.position} rotation={[0, Math.PI / 2, 0]} />)}
      </Instances>
    </group>
  );
}

const SKIN_LAYER_CELLS: CloudItem[] = Array.from({ length: 18 }, (_, index) => {
  const row = Math.floor(index / 6);
  const column = index % 6;
  return { position: [(column - 2.5) * 0.52 + (row % 2) * 0.2, 0.78 - row * 0.56, Math.sin(index) * 0.06] as VectorTuple, scale: [1, 0.48 + row * 0.12, 0.55] as VectorTuple };
});

function SkinTissue({ visual }: VisualProps) {
  return (
    <group rotation={[-0.2, 0.12, 0]}>
      <SphereCloud items={SKIN_LAYER_CELLS.slice(0, 6)} radius={0.26} color={visual.color} opacity={0.9} />
      <SphereCloud items={SKIN_LAYER_CELLS.slice(6, 12)} radius={0.28} color={visual.secondaryColor} opacity={0.82} />
      <SphereCloud items={SKIN_LAYER_CELLS.slice(12)} radius={0.3} color="#a86955" opacity={0.72} />
      <Line points={[[-1.55, -1.05, 0.2], [-0.7, -0.8, 0.24], [0.1, -1.05, 0.26], [0.82, -0.72, 0.2], [1.52, -0.95, 0.18]]} color="#64b7c6" transparent opacity={0.7} lineWidth={1.1} />
    </group>
  );
}

function RenalTissue({ visual }: VisualProps) {
  const tuft = useMemo(() => Array.from({ length: 28 }, (_, index) => {
    const angle = index * 0.72;
    const radius = 0.42 + Math.sin(index * 1.7) * 0.2;
    return [Math.cos(angle) * radius - 0.62, Math.sin(angle) * radius, Math.sin(index) * 0.18] as VectorTuple;
  }), []);
  return (
    <group rotation={[-0.16, 0.12, 0]}>
      <Orb position={[-0.62, 0, -0.08]} scale={[0.92, 0.92, 0.36]} color={visual.color} opacity={0.2} />
      <CurvedTube points={tuft} radius={0.065} color="#ff6d76" opacity={0.9} tubularSegments={72} />
      <CurvedTube points={[[0.05, 0.12, 0], [0.48, 0.62, 0.06], [1.1, 0.4, 0.04], [0.8, -0.3, 0.08], [1.4, -0.7, 0]]} radius={0.14} color={visual.secondaryColor} opacity={0.82} tubularSegments={44} />
    </group>
  );
}

const GERMINAL_CELLS: CloudItem[] = Array.from({ length: 26 }, (_, index) => {
  const ring = index < 10 ? 0.72 : index < 20 ? 1.15 : 0.3;
  const angle = (index / (index < 10 ? 10 : index < 20 ? 10 : 6)) * Math.PI * 2;
  return { position: [Math.cos(angle) * ring, Math.sin(angle) * ring * 0.78, Math.sin(index) * 0.08] as VectorTuple, scale: index >= 20 ? 1.25 : 0.72 };
});

function GerminalTissue({ visual }: VisualProps) {
  return (
    <group rotation={[-0.15, 0.1, 0]}>
      <mesh scale={[1.35, 1.05, 0.42]}>
        <torusGeometry args={[0.78, 0.24, 12, 32]} />
        <SurfaceMaterial color={visual.color} opacity={0.5} />
      </mesh>
      <SphereCloud items={GERMINAL_CELLS} radius={0.16} color={visual.secondaryColor} opacity={0.88} />
      <Orb position={[0, 0, 0.08]} scale={[0.36, 0.32, 0.22]} color="#7b4f76" opacity={0.82} />
    </group>
  );
}

const TISSUE_MODELS: Record<string, (props: VisualProps) => React.ReactNode> = {
  nervous: NeuralTissue,
  cardiovascular: CardiacTissue,
  respiratory: AlveolarTissue,
  digestive: IntestinalTissue,
  endocrine: EndocrineTissue,
  immune: ImmuneTissue,
  musculoskeletal: MuscleTissue,
  integumentary: SkinTissue,
  urinary: RenalTissue,
  reproductive: GerminalTissue,
};

export function TissueWorld({ systemId, onScaleChange }: DetailWorldProps) {
  const visual = somaSystemVisualById.get(systemId) ?? somaSystemVisuals[0];
  const Tissue = TISSUE_MODELS[systemId] ?? NeuralTissue;
  return (
    <group scale={0.92}>
      <Tissue visual={visual} />
      <TissueDrillTarget onSelect={() => onScaleChange("cell")} />
    </group>
  );
}

function CellNucleus({ position, scale = [0.42, 0.42, 0.36], color = "#d8c9ef" }: {
  position: VectorTuple;
  scale?: VectorTuple;
  color?: string;
}) {
  return <Orb position={position} scale={scale} color={color} opacity={0.88} />;
}

function CellMitochondrion({ onSelect }: { onSelect: () => void }) {
  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect();
  };
  return (
    <group position={[1.28, -0.9, 0.48]} rotation={[0.35, -0.24, -0.55]} scale={0.48} onClick={handleClick}>
      <mesh scale={[1.45, 0.6, 0.65]}>
        <capsuleGeometry args={[0.5, 1.05, 7, 18]} />
        <meshStandardMaterial color="#ff625d" roughness={0.34} emissive="#7a2024" emissiveIntensity={0.14} />
      </mesh>
      {[-0.5, 0, 0.5].map((offset) => (
        <mesh key={offset} position={[offset, 0, 0.38]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.045, 6, 14, Math.PI * 1.3]} />
          <meshStandardMaterial color="#ffd0bd" emissive="#ff6e62" emissiveIntensity={0.08} />
        </mesh>
      ))}
    </group>
  );
}

const NEURON_DENDRITES: VectorTuple[][] = [
  [[-0.25, 0.1, 0], [-0.8, 0.58, 0.04], [-1.45, 0.72, 0]],
  [[-0.24, -0.05, 0], [-0.88, -0.42, 0.06], [-1.48, -0.26, 0]],
  [[0, 0.3, 0], [0.18, 0.94, 0.02], [-0.15, 1.45, 0]],
  [[0.18, -0.24, 0], [0.48, -0.85, 0.03], [0.22, -1.38, 0]],
];
const NEURON_BOUTONS: CloudItem[] = [
  { position: [-1.45, 0.72, 0], scale: 0.8 },
  { position: [-1.48, -0.26, 0], scale: 0.8 },
  { position: [-0.15, 1.45, 0], scale: 0.8 },
  { position: [0.22, -1.38, 0], scale: 0.8 },
  { position: [2.15, 0.15, 0], scale: 1.05 },
];

function NeuronCell({ visual }: VisualProps) {
  return (
    <group rotation={[-0.05, 0.12, 0]}>
      <Orb position={[-0.18, 0, 0]} scale={[0.62, 0.56, 0.5]} color={visual.color} opacity={0.9} />
      <CellNucleus position={[-0.2, 0, 0.42]} scale={[0.24, 0.24, 0.2]} />
      {NEURON_DENDRITES.map((points, index) => <CurvedTube key={index} points={points} radius={0.065} color={visual.color} opacity={0.9} />)}
      <CurvedTube points={[[0.3, 0.05, 0], [0.9, 0.18, 0], [1.55, 0.02, 0], [2.15, 0.15, 0]]} radius={0.07} color={visual.secondaryColor} opacity={0.92} tubularSegments={44} />
      <SphereCloud items={NEURON_BOUTONS} radius={0.11} color={visual.secondaryColor} opacity={0.94} />
      {[0.88, 1.22, 1.56, 1.9].map((x) => (
        <Capsule key={x} position={[x, 0.12, 0]} scale={[0.18, 0.26, 0.16]} rotation={[0, 0, Math.PI / 2]} color="#dbe5ff" opacity={0.84} />
      ))}
    </group>
  );
}

const CARDIOMYOCYTE_STRIPES = [-1.25, -0.9, -0.55, -0.2, 0.15, 0.5, 0.85, 1.2];

function CardiomyocyteCell({ visual }: VisualProps) {
  return (
    <group rotation={[-0.05, 0.16, -0.06]}>
      <Capsule position={[0, 0, 0]} scale={[0.62, 1.75, 0.5]} rotation={[0, 0, Math.PI / 2]} color={visual.color} opacity={0.92} />
      <CellNucleus position={[0, 0, 0.52]} scale={[0.34, 0.24, 0.18]} />
      <Instances limit={CARDIOMYOCYTE_STRIPES.length} range={CARDIOMYOCYTE_STRIPES.length}>
        <torusGeometry args={[0.42, 0.035, 6, 16]} />
        <meshStandardMaterial color={visual.secondaryColor} transparent opacity={0.72} />
        {CARDIOMYOCYTE_STRIPES.map((x) => <Instance key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} />)}
      </Instances>
      <RodBetween start={[-1.48, -0.44, 0]} end={[-1.48, 0.44, 0]} radius={0.045} color="#f6c0b7" opacity={0.9} />
      <RodBetween start={[1.48, -0.44, 0]} end={[1.48, 0.44, 0]} radius={0.045} color="#f6c0b7" opacity={0.9} />
    </group>
  );
}

function PneumocyteCell({ visual }: VisualProps) {
  return (
    <group rotation={[-0.45, 0.2, 0]}>
      <Orb position={[0, 0, 0]} scale={[1.8, 1.1, 0.11]} color={visual.color} opacity={0.9} emissiveIntensity={0.28} />
      <Orb position={[-0.12, 0.06, 0.17]} scale={[0.46, 0.34, 0.24]} color={visual.secondaryColor} opacity={0.92} />
      <CellNucleus position={[-0.12, 0.06, 0.36]} scale={[0.28, 0.22, 0.16]} color="#c8eff0" />
      <Line points={[[-1.55, -0.25, 0.15], [-0.8, -0.5, 0.2], [0, -0.42, 0.2], [0.85, -0.58, 0.17], [1.55, -0.22, 0.14]]} color="#e4ffff" transparent opacity={0.74} lineWidth={1} />
      <CurvedTube points={[[-1.4, -0.82, -0.06], [-0.4, -0.7, -0.03], [0.55, -0.84, 0], [1.42, -0.68, -0.04]]} radius={0.12} color="#ff6770" opacity={0.72} tubularSegments={40} />
    </group>
  );
}

const MICROVILLI: CloudItem[] = Array.from({ length: 22 }, (_, index) => ({
  position: [-0.88 + index * 0.084, 1.14 + Math.sin(index) * 0.02, 0.02] as VectorTuple,
  scale: [0.35, 1, 0.35] as VectorTuple,
}));

function EnterocyteCell({ visual }: VisualProps) {
  return (
    <group rotation={[-0.04, 0.18, 0]}>
      <RoundedBox args={[1.7, 2.4, 0.9]} radius={0.34} smoothness={4} position={[0, -0.08, 0]}>
        <SurfaceMaterial color={visual.color} opacity={0.88} />
      </RoundedBox>
      <CellNucleus position={[0, -0.72, 0.52]} scale={[0.38, 0.46, 0.22]} color="#bbd8bb" />
      <Instances limit={MICROVILLI.length} range={MICROVILLI.length}>
        <capsuleGeometry args={[0.045, 0.28, 5, 8]} />
        <meshStandardMaterial color={visual.secondaryColor} roughness={0.42} />
        {MICROVILLI.map((item, index) => <Instance key={index} position={item.position} scale={item.scale} />)}
      </Instances>
      <Line points={[[-0.85, 0.72, 0.52], [0.85, 0.72, 0.52]]} color="#eaffd0" transparent opacity={0.74} lineWidth={1.2} />
    </group>
  );
}

const SECRETORY_VESICLES: CloudItem[] = Array.from({ length: 20 }, (_, index) => {
  const angle = index * 2.399;
  const radius = 0.55 + (index % 5) * 0.16;
  return { position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0.38 + (index % 3) * 0.1] as VectorTuple, scale: 0.65 + (index % 4) * 0.1 };
});

function EndocrineCell({ visual }: VisualProps) {
  return (
    <group rotation={[-0.08, 0.16, 0]}>
      <Orb position={[0, 0, 0]} scale={[1.15, 1.05, 0.84]} color={visual.color} opacity={0.78} />
      <CellNucleus position={[-0.28, 0.05, 0.62]} scale={[0.4, 0.4, 0.25]} />
      <SphereCloud items={SECRETORY_VESICLES} radius={0.09} color={visual.secondaryColor} opacity={0.96} detail={9} />
      {[0, 1, 2].map((index) => (
        <mesh key={index} position={[0.42 + index * 0.08, 0.15 - index * 0.06, 0.64]} rotation={[0.2, 0.2, -0.45]}>
          <torusGeometry args={[0.43, 0.04, 6, 18, Math.PI * 1.28]} />
          <meshStandardMaterial color="#efa8d8" emissive="#6d2d66" emissiveIntensity={0.08} />
        </mesh>
      ))}
    </group>
  );
}

const RECEPTORS: Array<[VectorTuple, VectorTuple]> = Array.from({ length: 12 }, (_, index) => {
  const angle = (index / 12) * Math.PI * 2;
  return [
    [Math.cos(angle) * 0.93, Math.sin(angle) * 0.93, 0] as VectorTuple,
    [Math.cos(angle) * 1.18, Math.sin(angle) * 1.18, 0] as VectorTuple,
  ];
});

function LymphocyteCell({ visual }: VisualProps) {
  return (
    <group rotation={[-0.04, 0.18, 0]}>
      <Orb position={[0, 0, 0]} scale={[1.08, 1.08, 0.82]} color={visual.color} opacity={0.56} />
      <CellNucleus position={[-0.06, 0.04, 0.38]} scale={[0.82, 0.82, 0.58]} color="#776b42" />
      {RECEPTORS.map(([start, end], index) => (
        <RodBetween key={index} start={start} end={end} radius={0.025} color={visual.secondaryColor} opacity={0.9} />
      ))}
    </group>
  );
}

const MUSCLE_CELL_STRIPES = [-1.45, -1.1, -0.75, -0.4, -0.05, 0.3, 0.65, 1, 1.35];
const MUSCLE_NUCLEI: CloudItem[] = [
  { position: [-1.1, 0.42, 0.42], scale: [1.25, 0.55, 0.7] },
  { position: [-0.1, -0.42, 0.4], scale: [1.25, 0.55, 0.7] },
  { position: [1.05, 0.42, 0.42], scale: [1.25, 0.55, 0.7] },
];

function MuscleFiberCell({ visual }: VisualProps) {
  return (
    <group rotation={[-0.05, 0.14, 0]}>
      <Capsule position={[0, 0, 0]} scale={[0.7, 2.05, 0.55]} rotation={[0, 0, Math.PI / 2]} color={visual.secondaryColor} opacity={0.92} />
      <Instances limit={MUSCLE_CELL_STRIPES.length} range={MUSCLE_CELL_STRIPES.length}>
        <torusGeometry args={[0.5, 0.035, 6, 16]} />
        <meshStandardMaterial color="#f4c7b2" transparent opacity={0.7} />
        {MUSCLE_CELL_STRIPES.map((x) => <Instance key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]} />)}
      </Instances>
      <SphereCloud items={MUSCLE_NUCLEI} radius={0.22} color="#d9c6f1" opacity={0.92} />
    </group>
  );
}

const KERATIN_LINES: VectorTuple[][] = [
  [[-1.1, -0.45, 0.4], [-0.3, 0.4, 0.48], [0.7, -0.2, 0.46], [1.1, 0.52, 0.4]],
  [[-0.95, 0.52, 0.44], [-0.2, -0.34, 0.5], [0.45, 0.48, 0.48], [1.05, -0.48, 0.42]],
  [[-1.2, 0.05, 0.42], [-0.25, 0.02, 0.52], [0.8, 0.06, 0.46]],
];
const KERATIN_DESMOSOMES: CloudItem[] = [
  { position: [-1.34, 0, 0.12] },
  { position: [1.34, 0, 0.12] },
  { position: [0, -1.06, 0.1] },
];

function KeratinocyteCell({ visual }: VisualProps) {
  return (
    <group rotation={[-0.35, 0.18, 0]}>
      <Orb position={[-0.52, 0.25, 0]} scale={[1.05, 0.82, 0.18]} color={visual.color} opacity={0.82} />
      <Orb position={[0.56, 0.28, 0]} scale={[1.05, 0.78, 0.18]} color={visual.color} opacity={0.82} />
      <Orb position={[0, -0.45, 0]} scale={[1.25, 0.72, 0.18]} color={visual.secondaryColor} opacity={0.78} />
      <CellNucleus position={[0, 0.02, 0.28]} scale={[0.34, 0.28, 0.14]} />
      {KERATIN_LINES.map((points, index) => <Line key={index} points={points} color="#ffe1d2" transparent opacity={0.7} lineWidth={0.9} />)}
      <SphereCloud items={KERATIN_DESMOSOMES} radius={0.11} color="#ffe2c7" opacity={0.95} />
    </group>
  );
}

const PODOCYTE_PROCESSES: VectorTuple[][] = [
  [[0, 0, 0.2], [-0.65, 0.55, 0.12], [-1.2, 0.42, 0]],
  [[0, 0, 0.2], [0.62, 0.62, 0.12], [1.25, 0.52, 0]],
  [[0, 0, 0.2], [-0.72, -0.48, 0.12], [-1.3, -0.42, 0]],
  [[0, 0, 0.2], [0.68, -0.5, 0.12], [1.28, -0.5, 0]],
];

function PodocyteCell({ visual }: VisualProps) {
  return (
    <group rotation={[-0.12, 0.18, 0]}>
      <CurvedTube points={[[-1.65, -0.2, -0.2], [-0.55, -0.42, -0.12], [0.4, -0.28, -0.1], [1.65, -0.38, -0.18]]} radius={0.24} color="#ff6670" opacity={0.7} tubularSegments={48} />
      <Orb position={[0, 0.3, 0.18]} scale={[0.55, 0.5, 0.42]} color={visual.color} opacity={0.9} />
      <CellNucleus position={[0, 0.3, 0.55]} scale={[0.24, 0.22, 0.18]} />
      {PODOCYTE_PROCESSES.map((points, index) => (
        <CurvedTube key={index} points={points} radius={0.075} color={visual.secondaryColor} opacity={0.9} />
      ))}
      {[-1.1, -0.72, -0.34, 0.22, 0.64, 1.04].map((x) => (
        <RodBetween key={x} start={[x, -0.05, 0.02]} end={[x + 0.08, -0.48, -0.12]} radius={0.035} color={visual.secondaryColor} opacity={0.92} />
      ))}
    </group>
  );
}

const CHROMOSOMES: Array<[VectorTuple, VectorTuple]> = [
  [[-0.34, -0.28, 0.52], [-0.08, 0.26, 0.52]], [[-0.08, -0.28, 0.52], [-0.34, 0.26, 0.52]],
  [[0.12, -0.32, 0.52], [0.38, 0.28, 0.52]], [[0.38, -0.32, 0.52], [0.12, 0.28, 0.52]],
];

function GermCell({ visual }: VisualProps) {
  return (
    <group rotation={[-0.08, 0.16, 0]}>
      <Orb position={[0, 0, 0]} scale={[1.18, 1.18, 0.88]} color={visual.color} opacity={0.62} />
      <CellNucleus position={[0, 0, 0.48]} scale={[0.62, 0.62, 0.38]} color="#9d7198" />
      {CHROMOSOMES.map(([start, end], index) => (
        <RodBetween key={index} start={start} end={end} radius={0.035} color={visual.secondaryColor} opacity={0.95} />
      ))}
      <Orb position={[-0.86, 0.76, 0.35]} scale={[0.2, 0.2, 0.15]} color="#f1c1dd" opacity={0.92} />
      <Orb position={[0.86, -0.76, 0.35]} scale={[0.2, 0.2, 0.15]} color="#f1c1dd" opacity={0.92} />
      <Line points={[[-0.82, 0.72, 0.36], [0, 0, 0.5], [0.82, -0.72, 0.36]]} color="#f7d6e8" transparent opacity={0.52} lineWidth={0.7} />
    </group>
  );
}

const CELL_MODELS: Record<string, (props: VisualProps) => React.ReactNode> = {
  nervous: NeuronCell,
  cardiovascular: CardiomyocyteCell,
  respiratory: PneumocyteCell,
  digestive: EnterocyteCell,
  endocrine: EndocrineCell,
  immune: LymphocyteCell,
  musculoskeletal: MuscleFiberCell,
  integumentary: KeratinocyteCell,
  urinary: PodocyteCell,
  reproductive: GermCell,
};

export function CellWorld({ systemId, onScaleChange }: DetailWorldProps) {
  const visual = somaSystemVisualById.get(systemId) ?? somaSystemVisuals[0];
  const Cell = CELL_MODELS[systemId] ?? NeuronCell;
  return (
    <group scale={0.82}>
      <Cell visual={visual} />
      <CellMitochondrion onSelect={() => onScaleChange("organelle")} />
    </group>
  );
}
