"use client";

import { Canvas } from "@react-three/fiber";
import {
  Bounds,
  Center,
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useEffect } from "react";
import * as THREE from "three";
import { useTheme, type Theme } from "@/lib/use-theme";

const modelPath = "/models/soma-anatomy.glb";

function AnatomicalBody() {
  const { scene } = useGLTF(modelPath, false, true);

  useEffect(() => {
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) {
        return;
      }

      object.castShadow = true;
      object.receiveShadow = true;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];

      materials.forEach((material) => {
        if (
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshPhysicalMaterial
        ) {
          material.roughness = Math.max(material.roughness, 0.5);
          material.envMapIntensity = 0.42;
        }
      });
    });
  }, [scene]);

  return (
    <Bounds fit clip observe margin={1.08}>
      <Center>
        <primitive object={scene} />
      </Center>
    </Bounds>
  );
}

function LoadingFigure({ theme }: { theme: Theme }) {
  return (
    <Html center>
      <p
        className={`whitespace-nowrap font-mono text-[0.65rem] uppercase tracking-[0.22em] ${
          theme === "light" ? "text-rose-950/55" : "text-rose-200/65"
        }`}
      >
        Assembling anatomy
      </p>
    </Html>
  );
}

export function SomaBodyFigure({ className }: { className?: string }) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  return (
    <div
      role="img"
      aria-label="Rotatable 3D anatomical figure showing the muscular, cardiovascular, nervous, and internal organ systems"
      className={`relative ${className ?? ""}`}
    >
      <Canvas
        camera={{ position: [0, 0.15, 4], fov: 34 }}
        dpr={[1, 1.7]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows
      >
        <color attach="background" args={[isLight ? "#eee9e4" : "#050304"]} />
        <ambientLight intensity={isLight ? 0.58 : 0.48} />
        <directionalLight
          castShadow
          position={[3.5, 5, 5]}
          intensity={isLight ? 1.25 : 1.45}
          color={isLight ? "#fffaf3" : "#fff1e8"}
        />
        <directionalLight
          position={[-4, 1.5, 3]}
          intensity={isLight ? 0.48 : 0.7}
          color={isLight ? "#e7c3bd" : "#fecdd3"}
        />
        <pointLight
          position={[0, -2, 3]}
          intensity={isLight ? 0.12 : 0.45}
          color={isLight ? "#9ab8c7" : "#7dd3fc"}
        />

        <Suspense fallback={<LoadingFigure theme={theme} />}>
          <AnatomicalBody />
          <Environment
            preset="studio"
            environmentIntensity={isLight ? 0.08 : 0.12}
          />
          <ContactShadows
            position={[0, -2.2, 0]}
            opacity={isLight ? 0.22 : 0.32}
            scale={5}
            blur={isLight ? 2.8 : 2.4}
            far={4}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enableDamping
          enablePan
          enableZoom
          screenSpacePanning
          panSpeed={0.65}
          minDistance={1.7}
          maxDistance={4.5}
          minPolarAngle={Math.PI * 0.32}
          maxPolarAngle={Math.PI * 0.68}
          minAzimuthAngle={-Math.PI * 0.72}
          maxAzimuthAngle={Math.PI * 0.72}
          rotateSpeed={0.5}
        />
      </Canvas>

      <div
        className={`pointer-events-none absolute bottom-3 left-3 border px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] backdrop-blur-sm ${
          isLight
            ? "border-rose-950/10 bg-white/70 text-rose-950/55"
            : "border-rose-100/10 bg-black/55 text-rose-100/55"
        }`}
      >
        Drag to rotate · Right-drag to pan
      </div>
    </div>
  );
}

useGLTF.preload(modelPath, false, true);
