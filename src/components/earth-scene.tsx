"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { Billboard, Line, OrbitControls, Stars, Text } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { dataIndexCategories, dataIndexEntries } from "@/lib/data-index";
import { dataCenterSites, type DataCenterSite } from "@/lib/earth-systems";
import { EARTHVIEW_PAGE_PATH } from "@/lib/projects";

const physicalCenter = new THREE.Vector3(-1.9, 0.28, 0);
const haloCenter = new THREE.Vector3(1.9, 0.28, 0);
const metaCenter = new THREE.Vector3(0, 0.28, 0);
const haloMajorRadius = 1.36;
const physicalEarthTilt: [number, number, number] = [0.26, -0.04, -0.08];
const haloRingTilt: [number, number, number] = [0.6 + Math.PI / 2, 0, 0];
const maxPanTargetRadius = 0.9;
const labelFont = "/fonts/geist-regular.ttf";
const earthLabelFont = "/fonts/geist-semibold.ttf";
const defaultOrbitTuning = {
  tilt: 0.2,
  yOffset: -1.64,
};

type ArcPath = {
  curve: THREE.CatmullRomCurve3;
  points: THREE.Vector3[];
  color: string;
};

type HaloOrbitPoint = {
  angle: number;
  lane: number;
  laneOffset: number;
  radius: number;
};

function seededRandom(seed: number) {
  let value = seed;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function writeHaloVector(target: Float32Array, offset: number, descriptor: HaloOrbitPoint, phase = 0) {
  const activeAngle = descriptor.angle - phase;

  target[offset] = Math.cos(activeAngle) * descriptor.radius;
  target[offset + 1] = Math.sin(activeAngle) * descriptor.radius;
  target[offset + 2] = descriptor.laneOffset + Math.sin(activeAngle * 2 + descriptor.lane) * 0.035;
}

function clusteredHaloPoint({
  categoryIndex,
  categoryTotal,
  entryIndex,
  entryTotal,
  radius,
}: {
  categoryIndex: number;
  categoryTotal: number;
  entryIndex: number;
  entryTotal: number;
  radius: number;
}) {
  const categoryAngle = (Math.PI * 2 * categoryIndex) / categoryTotal + 0.34;
  const angle = (Math.PI * 2 * entryIndex) / entryTotal + categoryIndex * 0.42;
  const ringRadius = radius + [-0.16, 0, 0.16][categoryIndex % 3];
  const clusterSpread = entryTotal > 5 ? 0.22 : 0.16;
  const orbitAngle = categoryAngle + Math.cos(angle) * clusterSpread;
  const laneOffset = (categoryIndex % 3 - 1) * 0.14 + Math.sin(angle) * 0.035;

  return new THREE.Vector3(
    Math.cos(orbitAngle) * ringRadius,
    Math.sin(orbitAngle) * ringRadius,
    laneOffset,
  );
}

function latLonToSpherePoint(lat: number, lon: number, radius: number) {
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon + 90);
  const horizontalRadius = Math.cos(latRad) * radius;

  return new THREE.Vector3(
    Math.sin(lonRad) * horizontalRadius,
    Math.sin(latRad) * radius,
    Math.cos(lonRad) * horizontalRadius,
  );
}

function DataCenterMarker({
  site,
}: {
  site: DataCenterSite;
}) {
  const markerRef = useRef<THREE.Mesh>(null);
  const surfacePoint = useMemo(() => latLonToSpherePoint(site.lat, site.lon, 1.105), [site.lat, site.lon]);

  useFrame(({ clock }) => {
    if (!markerRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(clock.getElapsedTime() * 3.2 + site.lon * 0.04) * 0.22;
    markerRef.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={markerRef} position={surfacePoint}>
      <sphereGeometry args={[0.032, 18, 18]} />
      <meshBasicMaterial color="#57a6ff" transparent opacity={0.95} />
    </mesh>
  );
}

function DataCenterMarkers() {
  return (
    <group>
      {dataCenterSites.map((site) => (
        <DataCenterMarker key={site.name} site={site} />
      ))}
    </group>
  );
}

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const seasonLabels = [
  { label: "Winter", monthIndex: 0 },
  { label: "Spring", monthIndex: 3 },
  { label: "Summer", monthIndex: 6 },
  { label: "Autumn", monthIndex: 9 },
];

const solarEventMarkers = [
  { label: "Mar Equinox", progress: (2 + 19 / 31) / 12 },
  { label: "Jun Solstice", progress: (5 + 20 / 30) / 12 },
  { label: "Sep Equinox", progress: (8 + 22 / 30) / 12 },
  { label: "Dec Solstice", progress: (11 + 20 / 31) / 12 },
];

function orbitPosition(progress: number, radius: number, yOffset = 0) {
  const angle = -progress * Math.PI * 2;

  return new THREE.Vector3(
    Math.sin(angle) * radius,
    yOffset,
    -Math.cos(angle) * radius,
  );
}

function yearProgress(date: Date) {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();

  return (date.getTime() - start) / (end - start);
}

function EarthSunOrbitModel({
  position = [0, -1.2, 0.18],
  tilt = defaultOrbitTuning.tilt,
  theme = "dark",
}: {
  position?: [number, number, number];
  tilt?: number;
  theme?: "dark" | "light";
}) {
  const [now, setNow] = useState(() => new Date());
  const orbitRadius = 0.96;
  const orbitPoints = useMemo(
    () =>
      Array.from({ length: 97 }, (_, index) => {
        const point = orbitPosition(index / 96, orbitRadius);

        return [point.x, point.y, point.z] as [number, number, number];
      }),
    [],
  );
  const earthPosition = useMemo(
    () => orbitPosition(yearProgress(now), orbitRadius, 0.006),
    [now],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <group position={position}>
      <group rotation={[tilt, 0, 0]}>
        <Line points={orbitPoints} color="#9cc8ff" lineWidth={1.85} transparent opacity={0.5} />
        <mesh>
          <sphereGeometry args={[0.045, 24, 24]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.95} />
        </mesh>
        <Billboard position={[0, -0.13, 0.01]} follow lockX={false} lockY={false} lockZ={false}>
          <Text
            anchorX="center"
            anchorY="middle"
            color={theme === "light" ? "#b45309" : "#fde68a"}
            font={labelFont}
            fontSize={0.09}
            fontWeight={300}
            outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
            outlineWidth={0.008}
            renderOrder={40}
          >
            Sun
          </Text>
        </Billboard>
        {monthLabels.map((label, index) => {
          const innerPoint = orbitPosition(index / 12, orbitRadius - 0.046, 0.012);
          const outerPoint = orbitPosition(index / 12, orbitRadius + 0.046, 0.012);
          const labelPoint = orbitPosition(index / 12, orbitRadius + 0.13, 0.018);

          return (
            <group key={label}>
              <Line
                points={[
                  [innerPoint.x, innerPoint.y, innerPoint.z],
                  [outerPoint.x, outerPoint.y, outerPoint.z],
                ]}
                color="#d8eeff"
                lineWidth={1.25}
                transparent
                opacity={0.76}
              />
              <Billboard position={labelPoint} follow lockX={false} lockY={false} lockZ={false}>
                <Text
                  anchorX="center"
                  anchorY="middle"
                  color={theme === "light" ? "#1c1917" : "#d8eeff"}
                  font={labelFont}
                  fontSize={0.08}
                  fontWeight={300}
                  outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
                  outlineWidth={0.007}
                  renderOrder={42}
                >
                  {label}
                </Text>
              </Billboard>
            </group>
          );
        })}
        {seasonLabels.map((season) => {
          const point = orbitPosition((season.monthIndex + 0.5) / 12, orbitRadius + 0.3, 0.02);

          return (
            <Billboard key={season.label} position={point} follow lockX={false} lockY={false} lockZ={false}>
              <Text
                anchorX="center"
                anchorY="middle"
                color={theme === "light" ? "#0284c7" : "#93c5fd"}
                font={labelFont}
                fontSize={0.09}
                fontWeight={300}
                outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
                outlineWidth={0.008}
                renderOrder={43}
              >
                {season.label}
              </Text>
            </Billboard>
          );
        })}
        {solarEventMarkers.map((marker) => {
          const point = orbitPosition(marker.progress, orbitRadius, 0.026);
          const labelPoint = orbitPosition(marker.progress, orbitRadius + 0.34, 0.034);

          return (
            <group key={marker.label}>
              <mesh position={point} renderOrder={44}>
                <sphereGeometry args={[0.019, 14, 14]} />
                <meshBasicMaterial color="#fef3c7" transparent opacity={0.92} depthWrite={false} />
              </mesh>
              <Billboard position={labelPoint} follow lockX={false} lockY={false} lockZ={false}>
                <Text
                  anchorX="center"
                  anchorY="middle"
                  color={theme === "light" ? "#b45309" : "#fef3c7"}
                  font={labelFont}
                  fontSize={0.08}
                  fontWeight={300}
                  outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
                  outlineWidth={0.008}
                  renderOrder={44}
                >
                  {marker.label}
                </Text>
              </Billboard>
            </group>
          );
        })}
        <mesh position={earthPosition} renderOrder={44}>
          <sphereGeometry args={[0.038, 22, 22]} />
          <meshBasicMaterial color="#57a6ff" transparent opacity={0.98} depthWrite={false} />
        </mesh>
        <Billboard
          position={[earthPosition.x, earthPosition.y + 0.105, earthPosition.z + 0.012]}
          follow
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <Text
            anchorX="center"
            anchorY="middle"
            color={theme === "light" ? "#0284c7" : "#ffffff"}
            font={labelFont}
            fontSize={0.094}
            fontWeight={300}
            outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
            outlineWidth={0.008}
            renderOrder={45}
          >
            Earth
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

function PhysicalEarth({
  isInteractive,
  targetPosition,
}: {
  isInteractive: boolean;
  targetPosition: THREE.Vector3;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const hasPositionedRef = useRef(false);
  const loadedTexture = useLoader(THREE.TextureLoader, "/textures/earth-blue-marble.jpg");
  const texture = useMemo(() => {
    const clonedTexture = loadedTexture.clone();
    clonedTexture.colorSpace = THREE.SRGBColorSpace;
    clonedTexture.anisotropy = 8;
    clonedTexture.needsUpdate = true;

    return clonedTexture;
  }, [loadedTexture]);

  const router = useRouter();

  const openEarthView = () => {
    router.push(EARTHVIEW_PAGE_PATH);
  };

  useFrame((_, delta) => {
    if (groupRef.current) {
      if (!hasPositionedRef.current) {
        groupRef.current.position.copy(targetPosition);
        hasPositionedRef.current = true;
      }

      groupRef.current.position.lerp(targetPosition, 1 - Math.pow(0.0008, delta));
    }

    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.12;
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.04;
    }
  });

  return (
    <group
      ref={groupRef}
      rotation={physicalEarthTilt}
      onClick={isInteractive ? (event) => {
        event.stopPropagation();
        openEarthView();
      } : undefined}
      onPointerOver={() => {
        if (isInteractive) {
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <group ref={earthRef}>
        <mesh>
          <sphereGeometry args={[1.08, 96, 96]} />
          <meshStandardMaterial map={texture} roughness={0.85} metalness={0.02} />
        </mesh>
        <DataCenterMarkers />
      </group>
      <mesh ref={atmosphereRef} scale={1.04}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshBasicMaterial color="#77b9ff" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function DigitalHalo({
  isInteractive,
  targetPosition,
  theme = "dark",
}: {
  isInteractive: boolean;
  targetPosition: THREE.Vector3;
  theme?: "dark" | "light";
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const orbitGroupRef = useRef<THREE.Group>(null);
  const hasPositionedRef = useRef(false);
  const dataPhaseRef = useRef(0);

  const { linkPairs, linkPositions, nodeDescriptors, nodePositions } = useMemo(() => {
    const count = 190;
    const descriptors: HaloOrbitPoint[] = Array.from({ length: count }, (_, index) => {
      const lane = index % 3;

      return {
        angle: (Math.PI * 2 * index) / count + lane * 0.23,
        lane,
        laneOffset: (lane - 1) * 0.12,
        radius: haloMajorRadius + (lane - 1) * 0.18,
      };
    });
    const nodes = new Float32Array(descriptors.length * 3);
    const pairs: [number, number][] = [];

    descriptors.forEach((descriptor, index) => {
      writeHaloVector(nodes, index * 3, descriptor);
    });

    descriptors.forEach((_, index) => {
      const nextIndex = (index + 9) % count;
      const nearIndex = (index + 21) % count;

      if (index % 3 !== 0) {
        pairs.push([index, nextIndex]);
      }

      if (index % 8 === 0) {
        pairs.push([index, nearIndex]);
      }
    });

    const links = new Float32Array(pairs.length * 6);

    pairs.forEach(([from, to], pairIndex) => {
      const offset = pairIndex * 6;

      writeHaloVector(links, offset, descriptors[from]);
      writeHaloVector(links, offset + 3, descriptors[to]);
    });

    return {
      linkPairs: pairs,
      linkPositions: links,
      nodeDescriptors: descriptors,
      nodePositions: nodes,
    };
  }, []);

  useFrame((_, delta) => {
    if (groupRef.current) {
      if (!hasPositionedRef.current) {
        groupRef.current.position.copy(targetPosition);
        hasPositionedRef.current = true;
      }

      groupRef.current.position.lerp(targetPosition, 1 - Math.pow(0.0008, delta));
    }

    const activeCount = nodeDescriptors.length;
    dataPhaseRef.current += delta * 0.12;

    if (orbitGroupRef.current) {
      // Orbit the labeled nodes around the ring normal (local Z) in lockstep
      // with the particle points, which advance by `-phase` in writeHaloVector.
      orbitGroupRef.current.rotation.z = -dataPhaseRef.current;
    }

    if (pointsRef.current) {
      const pointAttribute = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const pointArray = pointAttribute.array as Float32Array;

      nodeDescriptors.forEach((descriptor, index) => {
        writeHaloVector(pointArray, index * 3, descriptor, dataPhaseRef.current);
      });
      pointAttribute.needsUpdate = true;
      pointsRef.current.geometry.setDrawRange(0, activeCount);
      const mat = pointsRef.current.material as THREE.PointsMaterial;
      if (mat) {
        mat.size = 0.074;
        mat.opacity = 1;
      }
    }

    if (linesRef.current) {
      const lineAttribute = linesRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const lineArray = lineAttribute.array as Float32Array;

      linkPairs.forEach(([from, to], pairIndex) => {
        const offset = pairIndex * 6;

        writeHaloVector(lineArray, offset, nodeDescriptors[from], dataPhaseRef.current);
        writeHaloVector(lineArray, offset + 3, nodeDescriptors[to], dataPhaseRef.current);
      });
      lineAttribute.needsUpdate = true;
      linesRef.current.geometry.setDrawRange(0, activeCount * 4);
      const mat = linesRef.current.material as THREE.LineBasicMaterial;
      if (mat) {
        mat.opacity = 0.34;
      }
    }
  });

  return (
    <group ref={groupRef} rotation={haloRingTilt}>
      {[1.18, 1.36, 1.54].map((radius, index) => (
        <mesh key={radius} renderOrder={12 + index}>
          <torusGeometry args={[radius, index === 1 ? 0.012 : 0.008, 12, 192]} />
          <meshBasicMaterial
            color={theme === "light" ? "#38bdf8" : "#62c7ff"}
            transparent
            opacity={index === 1 ? 0.42 : 0.26}
            depthTest
            depthWrite={false}
          />
        </mesh>
      ))}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={theme === "light" ? "#0284c7" : "#b8ecff"}
          size={0.074}
          sizeAttenuation
          transparent
          opacity={1}
          depthTest
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linkPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={theme === "light" ? "#0ea5e9" : "#2fe3ff"} transparent opacity={0.38} depthTest depthWrite={false} />
      </lineSegments>
      <group ref={orbitGroupRef}>
        <DataIndexHaloNodes isInteractive={isInteractive} theme={theme} />
        <FeaturedDigitalNode isInteractive={isInteractive} />
      </group>
    </group>
  );
}

function DataIndexHaloNodes({
  isInteractive, 
  theme = "dark" 
}: { 
  isInteractive: boolean; 
  theme?: "dark" | "light"; 
}) {
  const surfaceNodes = useMemo(
    () => {
      const categoryIndexLookup = new Map(
        dataIndexCategories.map((category, categoryIndex) => [category.name, categoryIndex]),
      );

      return dataIndexEntries.map((entry) => {
        const categoryIndex = categoryIndexLookup.get(entry.category) ?? 0;
        const position = clusteredHaloPoint({
          categoryIndex,
          categoryTotal: dataIndexCategories.length,
          entryIndex: entry.entryIndex,
          entryTotal: entry.entryTotal,
          radius: haloMajorRadius,
        });

        return {
          ...entry,
          position: [position.x, position.y, position.z] as [number, number, number],
        };
      });
    },
    [],
  );

  return (
    <group>
      {surfaceNodes.map((entry) => (
        <DataIndexHaloNode
          key={`${entry.category}-${entry.name}`}
          color={entry.color}
          href={entry.href}
          isInteractive={isInteractive}
          name={entry.name}
          position={entry.position}
          theme={theme}
        />
      ))}
    </group>
  );
}

function DataIndexHaloNode({
  color,
  href,
  isInteractive,
  name,
  position,
  theme = "dark",
}: {
  color: string;
  href: string;
  isInteractive: boolean;
  name: string;
  position: [number, number, number];
  theme?: "dark" | "light";
}) {
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (nodeRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 2.8 + position[0] * 2.1) * 0.12;
      nodeRef.current.scale.setScalar(isHovered ? pulse * 1.65 : pulse);
    }

    const material = labelRef.current?.material;

    if (material && !Array.isArray(material)) {
      material.depthTest = true;
      material.depthWrite = false;
      material.needsUpdate = true;
    }
  });

  const openSource = (event: { stopPropagation: () => void }) => {
    if (!isInteractive) {
      return;
    }

    event.stopPropagation();
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <group
      position={position}
      onClick={isInteractive ? openSource : undefined}
      onPointerDown={isInteractive ? openSource : undefined}
      onPointerOver={(event) => {
        if (!isInteractive) {
          return;
        }

        event.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setIsHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <mesh>
        <sphereGeometry args={[0.075, 18, 18]} />
        <meshBasicMaterial transparent opacity={0} depthTest depthWrite={false} />
      </mesh>
      <mesh ref={nodeRef} renderOrder={22}>
        <sphereGeometry args={[0.034, 22, 22]} />
        <meshBasicMaterial color={color} transparent opacity={0.96} depthTest depthWrite={false} />
      </mesh>
      <mesh renderOrder={21}>
        <sphereGeometry args={[0.062, 22, 22]} />
        <meshBasicMaterial color={color} transparent opacity={isHovered ? 0.3 : 0.13} depthTest depthWrite={false} />
      </mesh>
      <Billboard position={[0, 0.13, 0.04]} follow lockX={false} lockY={false} lockZ={false}>
        <Text
          ref={labelRef}
          anchorX="center"
          anchorY="middle"
          color={theme === "light" ? "#1c1917" : "#ffffff"}
          font={labelFont}
          fontSize={isHovered ? 0.072 : 0.055}
          fontWeight={300}
          outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
          outlineWidth={0.008}
          renderOrder={55}
        >
          {name}
        </Text>
      </Billboard>
    </group>
  );
}

function FeaturedDigitalNode({ isInteractive }: { isInteractive: boolean }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Mesh>(null);
  const position: [number, number, number] = [0, haloMajorRadius, 0.04];

  useFrame(({ clock }) => {
    if (!nodeRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(clock.getElapsedTime() * 3.4) * 0.16;
    nodeRef.current.scale.setScalar(isHovered ? pulse * 1.65 : pulse);

    const material = labelRef.current?.material;

    if (material && !Array.isArray(material)) {
      material.depthTest = true;
      material.depthWrite = false;
      material.needsUpdate = true;
    }
  });

  const openProjects = () => {
    router.push("/projects");
  };

  const handleActivate = (event: { stopPropagation: () => void }) => {
    if (!isInteractive) {
      return;
    }

    event.stopPropagation();
    openProjects();
  };

  return (
    <group
      position={position}
      onClick={isInteractive ? handleActivate : undefined}
      onPointerDown={isInteractive ? handleActivate : undefined}
      onPointerOver={(event) => {
        if (!isInteractive) {
          return;
        }

        event.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setIsHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <mesh>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshBasicMaterial transparent opacity={0} depthTest depthWrite={false} />
      </mesh>
      <mesh ref={nodeRef} renderOrder={20}>
        <sphereGeometry args={[0.082, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.98} depthTest depthWrite={false} />
      </mesh>
      <mesh renderOrder={19}>
        <sphereGeometry args={[0.14, 32, 32]} />
        <meshBasicMaterial
          color="#58d7ff"
          transparent
          opacity={isHovered ? 0.3 : 0.18}
          depthTest
          depthWrite={false}
        />
      </mesh>
      <Billboard position={[0, 0.22, 0.08]} follow lockX={false} lockY={false} lockZ={false}>
        <Text
          ref={labelRef}
          anchorX="center"
          anchorY="middle"
          color="#ffffff"
          font={labelFont}
          fontSize={isHovered ? 0.11 : 0.095}
          fontWeight={300}
          renderOrder={50}
          onClick={isInteractive ? handleActivate : undefined}
          onPointerDown={isInteractive ? handleActivate : undefined}
        >
          Sapiens Scientia
        </Text>
      </Billboard>
    </group>
  );
}

function DataConnectors() {
  const pulsesRef = useRef<THREE.Group>(null);

  const arcs = useMemo<ArcPath[]>(() => {
    const random = seededRandom(42);
    const paths: ArcPath[] = [];

    for (let index = 0; index < 18; index += 1) {
      const yOffset = (random() - 0.5) * 1.45;
      const zOffset = (random() - 0.5) * 0.75;
      const start = new THREE.Vector3(
        physicalCenter.x + 1.0,
        physicalCenter.y + yOffset,
        physicalCenter.z + zOffset,
      );
      const end = new THREE.Vector3(
        haloCenter.x - 1.0,
        haloCenter.y + yOffset * 0.72,
        haloCenter.z - zOffset * 0.6,
      );
      const lift = 0.5 + random() * 0.6;
      const middle = new THREE.Vector3(0, yOffset * 0.35 + lift, zOffset * 0.2);
      const curve = new THREE.CatmullRomCurve3([start, middle, end]);

      paths.push({
        curve,
        points: curve.getPoints(64),
        color: index % 3 === 0 ? "#84f3ff" : "#2c8dff",
      });
    }

    return paths;
  }, []);

  useFrame(({ clock }) => {
    if (!pulsesRef.current) {
      return;
    }

    const elapsed = clock.getElapsedTime();

    pulsesRef.current.children.forEach((pulse, index) => {
      const arc = arcs[index % arcs.length];
      const baseProgress = (elapsed * 0.18 + index * 0.075) % 1;
      const progress = index % 2 === 0 ? baseProgress : 1 - baseProgress;
      pulse.position.copy(arc.curve.getPoint(progress));
    });
  });

  return (
    <group>
      {arcs.map((arc, index) => (
        <Line
          key={index}
          points={arc.points}
          color={arc.color}
          lineWidth={index % 4 === 0 ? 1.9 : 1.05}
          transparent
          opacity={index % 4 === 0 ? 0.58 : 0.28}
        />
      ))}
      <group ref={pulsesRef}>
        {arcs.map((arc, index) => (
          <mesh key={index} position={arc.points[0]}>
            <sphereGeometry args={[0.018 + (index % 3) * 0.003, 16, 16]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? "#d8fbff" : "#57a6ff"}
              transparent
              opacity={0.95}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GlobeLabel({
  children,
  onClick,
  position,
  theme = "dark",
}: {
  children: string;
  onClick?: () => void;
  position: [number, number, number];
  theme?: "dark" | "light";
}) {
  return (
    <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
      <group
        onClick={(event) => {
          if (!onClick) {
            return;
          }

          event.stopPropagation();
          onClick();
        }}
        onPointerOver={() => {
          if (onClick) {
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          if (onClick) {
            document.body.style.cursor = "";
          }
        }}
      >
        <mesh>
          <planeGeometry args={[0.9, 0.22]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <Text
          anchorX="center"
          anchorY="middle"
          color={theme === "light" ? "#1c1917" : "#ffffff"}
          font={earthLabelFont}
          fontSize={0.18}
          fontWeight={700}
          outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
          outlineWidth={0.012}
          renderOrder={10}
        >
          {children}
        </Text>
      </group>
    </Billboard>
  );
}

function MetaEarthLabel({
  isMerged,
  onToggle,
  theme = "dark",
}: {
  isMerged: boolean;
  onToggle: () => void;
  theme?: "dark" | "light";
}) {
  return (
    <Billboard position={[0, metaCenter.y + 1.72, 0.16]} follow lockX={false} lockY={false} lockZ={false}>
      <group
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <mesh>
          <planeGeometry args={[0.75, 0.22]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <Text
          anchorX="center"
          anchorY="middle"
          color={isMerged ? (theme === "light" ? "#0284c7" : "#b8ecff") : (theme === "light" ? "#1c1917" : "#ffffff")}
          font={earthLabelFont}
          fontSize={0.17}
          fontWeight={700}
          outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
          outlineWidth={0.012}
          renderOrder={12}
        >
          Meta Earth
        </Text>
      </group>
    </Billboard>
  );
}

function ConstrainedOrbitControls({ enableZoom }: { enableZoom: boolean }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const panCenter = useMemo(() => metaCenter.clone(), []);
  const panOffsetRef = useRef(new THREE.Vector3());
  const clampedTargetRef = useRef(new THREE.Vector3());
  const excessPanRef = useRef(new THREE.Vector3());

  useFrame(() => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    const panOffset = panOffsetRef.current.copy(controls.target).sub(panCenter);

    if (panOffset.length() <= maxPanTargetRadius) {
      return;
    }

    const clampedTarget = clampedTargetRef.current
      .copy(panOffset)
      .setLength(maxPanTargetRadius)
      .add(panCenter);
    const excessPan = excessPanRef.current.copy(controls.target).sub(clampedTarget);

    controls.target.copy(clampedTarget);
    controls.object.position.sub(excessPan);
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom={enableZoom}
      minDistance={3.4}
      maxDistance={18}
      minPolarAngle={Math.PI / 2.7}
      maxPolarAngle={Math.PI / 1.75}
      panSpeed={0.55}
      rotateSpeed={0.22}
    />
  );
}

export function EarthScene({
  enableZoom,
  isMerged,
  onToggleMerged,
  theme = "dark",
}: {
  enableZoom: boolean;
  isMerged: boolean;
  onToggleMerged: () => void;
  theme?: "dark" | "light";
}) {
  const router = useRouter();
  const physicalTarget = isMerged ? metaCenter : physicalCenter;
  const haloTarget = isMerged ? metaCenter : haloCenter;

  return (
    <>
      <color attach="background" args={[theme === "light" ? "#faf8f5" : "#000000"]} />
      <ambientLight intensity={theme === "light" ? 1.45 : 0.9} />
      <directionalLight 
        position={[-3, 2.6, 4]} 
        intensity={theme === "light" ? 2.5 : 2.1} 
        color={theme === "light" ? "#ffffff" : "#fff4df"} 
      />
      <pointLight 
        position={[2.9, 1.6, 2.2]} 
        intensity={theme === "light" ? 2.4 : 3.2} 
        color={theme === "light" ? "#0284c7" : "#278aff"} 
      />
      <pointLight 
        position={[0, 1.4, 2.8]} 
        intensity={theme === "light" ? 0.9 : 1.3} 
        color={theme === "light" ? "#0ea5e9" : "#8ff2ff"} 
      />
      {theme === "dark" && (
        <Stars radius={16} depth={24} count={900} factor={2.4} saturation={0} fade speed={0.18} />
      )}
      <PhysicalEarth isInteractive={!isMerged} targetPosition={physicalTarget} />
      <DigitalHalo isInteractive={!isMerged} targetPosition={haloTarget} theme={theme} />
      {!isMerged && <DataConnectors />}
      <EarthSunOrbitModel
        position={[0, metaCenter.y + defaultOrbitTuning.yOffset, metaCenter.z + 0.18]}
        tilt={defaultOrbitTuning.tilt}
        theme={theme}
      />
      {!isMerged && (
        <>
          <GlobeLabel
            onClick={() => {
              router.push(EARTHVIEW_PAGE_PATH);
            }}
            position={[physicalCenter.x, physicalCenter.y + 1.72, physicalCenter.z + 0.08]}
            theme={theme}
          >
            Physical Earth
          </GlobeLabel>
          <GlobeLabel 
            position={[haloCenter.x, haloCenter.y + 1.72, haloCenter.z + 0.08]}
            theme={theme}
          >
            Digital Halo
          </GlobeLabel>
        </>
      )}
      <MetaEarthLabel isMerged={isMerged} onToggle={onToggleMerged} theme={theme} />
      <ConstrainedOrbitControls enableZoom={enableZoom} />
    </>
  );
}
