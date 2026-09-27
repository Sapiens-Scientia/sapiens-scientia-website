"use client";

import { useEffect, useMemo, useState } from "react";
import type { EarthVitalSign } from "@/lib/vital-signs";
import { earthVitalSigns } from "@/lib/vital-signs";
import type { LiveVitalSignUpdate } from "@/lib/vital-signs-live";

type VitalSignsApiResponse = {
  updates: LiveVitalSignUpdate[];
  fetchedAt: string | null;
};

export type LiveVitalSignsStatus = "loading" | "ready" | "error";

export function mergeLiveVitalSigns(
  signs: EarthVitalSign[],
  updates: LiveVitalSignUpdate[],
): EarthVitalSign[] {
  if (updates.length === 0) {
    return signs;
  }

  const byId = new Map(updates.map((update) => [update.id, update]));

  return signs.map((sign) => {
    const update = byId.get(sign.id);
    if (!update) {
      return sign;
    }

    return {
      ...sign,
      value: update.value,
      updated: update.updated,
      source: update.source,
      sourceHref: update.sourceHref,
      note: update.note,
      referenceSource: sign.referenceSource ?? { label: sign.source, href: sign.sourceHref },
      liveChartPoint: update.chartPoint,
    };
  });
}

export function useLiveVitalSigns() {
  const [updates, setUpdates] = useState<LiveVitalSignUpdate[]>([]);
  const [status, setStatus] = useState<LiveVitalSignsStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);

    fetch("/api/vital-signs", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Vital signs request failed");
        }
        return response.json() as Promise<VitalSignsApiResponse>;
      })
      .then((payload) => {
        if (cancelled) {
          return;
        }

        const received = Array.isArray(payload.updates) ? payload.updates : [];
        setUpdates(received);
        setStatus(received.length > 0 ? "ready" : "error");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const signs = useMemo(() => mergeLiveVitalSigns(earthVitalSigns, updates), [updates]);
  const liveIds = useMemo(() => new Set(updates.map((update) => update.id)), [updates]);

  return { signs, liveIds, status };
}
