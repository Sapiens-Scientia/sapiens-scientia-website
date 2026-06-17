import { NextResponse } from "next/server";
import { fetchLiveVitalSignUpdates } from "@/lib/vital-signs-live";

export const revalidate = 86_400;

export async function GET() {
  try {
    const updates = await fetchLiveVitalSignUpdates();

    return NextResponse.json(
      { updates, fetchedAt: new Date().toISOString() },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      },
    );
  } catch {
    return NextResponse.json({ updates: [], fetchedAt: null }, { status: 200 });
  }
}
