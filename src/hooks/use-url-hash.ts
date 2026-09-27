"use client";

import { useSyncExternalStore } from "react";

const HASH_CHANGE_EVENT = "sapiens:hash-change";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  window.addEventListener(HASH_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(HASH_CHANGE_EVENT, onChange);
  };
}

function getHash() {
  const hash = window.location.hash.slice(1);
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

function getServerHash() {
  return "";
}

function setHash(hash: string, options: { replace?: boolean } = {}) {
  const url = new URL(window.location.href);
  url.hash = hash;
  if (url.href === window.location.href) return;

  // Preserve Next's history state and the query string. Deliberate selections
  // are history entries, so Back/Forward can retrace an exploration without
  // triggering the browser's automatic anchor scroll.
  if (options.replace) window.history.replaceState(window.history.state, "", url);
  else window.history.pushState(window.history.state, "", url);
  window.dispatchEvent(new Event(HASH_CHANGE_EVENT));
}

/** Hydration-safe fragment state, including same-page links and Back/Forward. */
export function useUrlHash() {
  const hash = useSyncExternalStore(subscribe, getHash, getServerHash);
  return [hash, setHash] as const;
}
