"use client";

import { Canvas, type CanvasProps, type RootState } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { SceneErrorBoundary } from "@/components/scene-error-boundary";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useWebGLSupport } from "@/hooks/use-webgl-support";

type Props = Pick<CanvasProps, "camera" | "children"> & { backgroundColor: string; paused?: boolean };

/** Shared capability fallback and bounded context recovery for both Earth renderers. */
export function ResilientEarthCanvas({ camera, children, backgroundColor, paused = false }: Props) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const supported = useWebGLSupport(epoch);
  const attempts = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const removeListener = useRef<(() => void) | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    removeListener.current?.();
  }, []);

  const onCreated = useCallback((state: RootState) => {
    state.gl.setClearColor(backgroundColor, 1);
    const canvas = state.gl.domElement;
    const onLost = (event: Event) => {
      event.preventDefault();
      setReady(false);
      if (attempts.current >= 2) {
        setFailed(true);
        return;
      }
      attempts.current += 1;
      timer.current = setTimeout(() => setEpoch((current) => current + 1), 80);
    };
    removeListener.current?.();
    canvas.addEventListener("webglcontextlost", onLost, { once: true });
    removeListener.current = () => canvas.removeEventListener("webglcontextlost", onLost);
    setReady(true);
  }, [backgroundColor]);

  const fallback = (
    <div className="flex h-full w-full items-center justify-center p-6 text-center text-slate-300">
      <div className="max-w-xs rounded border border-white/15 bg-black/80 p-5" role="status">
        <p className="text-sm leading-6">The 3D view is unavailable. You can continue exploring the page.</p>
        <button type="button" className="mt-3 min-h-11 cursor-pointer rounded border border-white/25 px-4 text-sm text-white" onClick={() => {
          if (timer.current) clearTimeout(timer.current);
          attempts.current = 0;
          setFailed(false);
          setReady(false);
          setEpoch((current) => current + 1);
        }}>Try 3D again</button>
      </div>
    </div>
  );

  if (supported === null) return <div className="flex h-full items-center justify-center text-sm text-slate-400" role="status">Preparing the globe…</div>;

  return failed || !supported ? fallback : (
    <SceneErrorBoundary key={epoch} fallback={fallback}>
      <Canvas aria-hidden="true" camera={camera} onCreated={onCreated}
        gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}
        frameloop={paused ? "never" : reducedMotion ? "demand" : "always"}
        style={{ background: backgroundColor, opacity: ready ? 1 : 0, transition: "opacity 0.3s ease" }}>
        {children}
      </Canvas>
    </SceneErrorBoundary>
  );
}
