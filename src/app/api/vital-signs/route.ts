import { NextResponse } from "next/server";
import { fetchLiveVitalSignUpdates } from "@/lib/vital-signs-live";

// GET remains dynamic; successful source fetches have their own daily cache.
// This prevents a complete source outage from being cached as a daily result.

export async function GET() {
  try {
    const updates = await fetchLiveVitalSignUpdates();

    return NextResponse.json(
      { updates, fetchedAt: updates.length > 0 ? new Date().toISOString() : null },
      {
        headers: {
          "Cache-Control": updates.length > 0
            ? "public, s-maxage=86400, stale-while-revalidate=3600"
            : "no-store",
        },
      },
    );
  } catch {
    return NextResponse.json({ updates: [], fetchedAt: null }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
