"use client";

import { useEffect, useState } from "react";

/** Check before R3F's asynchronous renderer setup, which React cannot catch. */
export function useWebGLSupport(retryKey = 0) {
  const [result, setResult] = useState<{ key: number; supported: boolean } | null>(null);
  useEffect(() => {
    let supported = false;
    try {
      const context = document.createElement("canvas").getContext("webgl2");
      supported = Boolean(context);
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { /* A disabled or exhausted context is a capability failure. */ }
    // This external capability can only be checked after the browser mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult({ key: retryKey, supported });
  }, [retryKey]);
  return result?.key === retryKey ? result.supported : null;
}
