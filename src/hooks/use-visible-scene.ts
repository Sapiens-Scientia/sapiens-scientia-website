"use client";

import { useEffect, useState, type RefObject } from "react";

/** Pause expensive graphics when scrolled away or the browser tab is hidden. */
export function useVisibleScene(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let intersecting = true;
    const update = () => setActive(intersecting && document.visibilityState !== "hidden");
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return active;
}
