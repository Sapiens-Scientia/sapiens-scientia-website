"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type MeshRef = THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>;
type GroupRef = THREE.Group;

const rose = "#fda4af";
const brightRose = "#fb7185";
const ember = "#fecdd3";
const cyan = "#67e8f9";

function OrganMarker({
  position,
  color,
  scale = [1, 1, 1],
  phase = 0,
}: {
  position: [number, number, number];
  color: string;
  scale?: [number, number, number];
  phase?: number;
}) {
  const markerRef = useRef<MeshRef>(null);
  const haloRef = useRef<MeshRef>(null);

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.elapsedTime * 2.4 + phase) * 0.08;
    markerRef.current?.scale.set(scale[0] * pulse, scale[1] * pulse, scale[2] * pulse);
    haloRef.current?.scale.setScalar(1.15 + Math.sin(clock.elapsedTime * 2 + phase) * 0.12);
  });

  return (
    <group position={position}>
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.38} />
      </mesh>
    </group>
  );
}

function SomaBodyModel() {
  const bodyRef = useRef<GroupRef>(null);
  const spinePoints = useMemo(
    () =>
      [
        new THREE.Vector3(0, 1.42, 0.03),
        new THREE.Vector3(0, 1.08, 0.02),
        new THREE.Vector3(0, 0.7, 0.02),
        new THREE.Vector3(0, 0.3, 0.01),
        new THREE.Vector3(0, -0.12, 0),
        new THREE.Vector3(0, -0.46, 0),
      ],
    [],
  );

  useFrame(({ clock }) => {
    if (!bodyRef.current) {
      return;
    }

    bodyRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.08;
    bodyRef.current.position.y = Math.sin(clock.elapsedTime * 0.55) * 0.025;
  });

  return (
    <group ref={bodyRef} position={[0, -0.15, 0]} rotation={[0.02, 0, 0]}>
      <group>
        <mesh position={[0, 1.78, 0]}>
          <sphereGeometry args={[0.25, 48, 48]} />
          <meshPhysicalMaterial
            color={rose}
            transparent
            opacity={0.34}
            roughness={0.2}
            transmission={0.45}
            thickness={0.3}
          />
        </mesh>

        <mesh position={[0, 0.73, 0]} scale={[0.78, 1.25, 0.34]}>
          <capsuleGeometry args={[0.44, 1.25, 24, 48]} />
          <meshPhysicalMaterial
            color={rose}
            transparent
            opacity={0.26}
            roughness={0.24}
            transmission={0.5}
            thickness={0.75}
          />
        </mesh>

        <mesh position={[-0.58, 0.76, 0]} rotation={[0, 0, -0.42]} scale={[0.16, 1, 0.16]}>
          <capsuleGeometry args={[0.18, 1.2, 18, 32]} />
          <meshPhysicalMaterial color={rose} transparent opacity={0.22} roughness={0.3} />
        </mesh>
        <mesh position={[0.58, 0.76, 0]} rotation={[0, 0, 0.42]} scale={[0.16, 1, 0.16]}>
          <capsuleGeometry args={[0.18, 1.2, 18, 32]} />
          <meshPhysicalMaterial color={rose} transparent opacity={0.22} roughness={0.3} />
        </mesh>

        <mesh position={[-0.2, -0.88, 0]} rotation={[0, 0, 0.08]} scale={[0.18, 1.08, 0.18]}>
          <capsuleGeometry args={[0.18, 1.45, 18, 32]} />
          <meshPhysicalMaterial color={rose} transparent opacity={0.22} roughness={0.3} />
        </mesh>
        <mesh position={[0.2, -0.88, 0]} rotation={[0, 0, -0.08]} scale={[0.18, 1.08, 0.18]}>
          <capsuleGeometry args={[0.18, 1.45, 18, 32]} />
          <meshPhysicalMaterial color={rose} transparent opacity={0.22} roughness={0.3} />
        </mesh>
      </group>

      <Line
        points={[
          [-0.52, 1.2, 0.18],
          [-0.28, 1.34, 0.2],
          [0, 1.38, 0.21],
          [0.28, 1.34, 0.2],
          [0.52, 1.2, 0.18],
        ]}
        color={rose}
        lineWidth={1.4}
        transparent
        opacity={0.52}
      />
      <Line
        points={[
          [-0.38, -0.12, 0.18],
          [-0.18, -0.24, 0.2],
          [0, -0.28, 0.21],
          [0.18, -0.24, 0.2],
          [0.38, -0.12, 0.18],
        ]}
        color={rose}
        lineWidth={1.4}
        transparent
        opacity={0.45}
      />
      <Line points={spinePoints} color={ember} lineWidth={2} transparent opacity={0.65} dashed dashSize={0.06} gapSize={0.04} />

      <OrganMarker position={[0, 1.79, 0.09]} color={brightRose} scale={[1.1, 0.76, 0.82]} />
      <OrganMarker position={[-0.13, 0.88, 0.18]} color="#f43f5e" scale={[0.76, 1, 0.7]} phase={0.8} />
      <OrganMarker position={[0, 0.32, 0.16]} color="#fb923c" scale={[1.05, 0.8, 0.65]} phase={1.6} />

      <mesh position={[-0.22, 0.94, 0.1]} rotation={[0.18, 0.12, -0.22]} scale={[0.56, 0.84, 0.24]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial color={cyan} emissive={cyan} emissiveIntensity={0.25} transparent opacity={0.34} roughness={0.4} />
      </mesh>
      <mesh position={[0.22, 0.94, 0.1]} rotation={[0.18, -0.12, 0.22]} scale={[0.56, 0.84, 0.24]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial color={cyan} emissive={cyan} emissiveIntensity={0.25} transparent opacity={0.34} roughness={0.4} />
      </mesh>

      <mesh position={[0, -0.02, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.035, 16, 80]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.22} roughness={0.45} />
      </mesh>
    </group>
  );
}

export function SomaBodyFigure({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Interactive 3D anatomical figure with translucent body systems and highlighted brain, heart, lungs, and digestive structures"
      className={className}
    >
      <Canvas camera={{ position: [0, 0.28, 5.2], fov: 40 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={1.15} />
        <pointLight position={[2.4, 2.4, 2.2]} intensity={4.2} color="#fecdd3" />
        <pointLight position={[-2.4, -1.2, 2.4]} intensity={2.2} color="#67e8f9" />
        <SomaBodyModel />
        <OrbitControls
          enableDamping
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.32}
          maxPolarAngle={Math.PI * 0.68}
        />
      </Canvas>
    </div>
  );
}
