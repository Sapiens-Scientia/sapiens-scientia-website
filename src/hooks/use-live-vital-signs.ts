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
      liveChartPoint: update.chartPoint,
    };
  });
}

export function useLiveVitalSigns() {
  const [updates, setUpdates] = useState<LiveVitalSignUpdate[]>([]);
  const [status, setStatus] = useState<LiveVitalSignsStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/vital-signs")
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

        setUpdates(payload.updates ?? []);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) {
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signs = useMemo(() => mergeLiveVitalSigns(earthVitalSigns, updates), [updates]);
  const liveIds = useMemo(() => new Set(updates.map((update) => update.id)), [updates]);

  return { signs, liveIds, status };
}
