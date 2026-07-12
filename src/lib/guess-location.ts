// Where is the reader? Timezone → rough coordinates (no permission needed).
// Shared by the homepage You Are Here finale and the Meta Earth hero so both
// globes open aimed at the same estimated seat.

const TZ_COORDS: Record<string, [number, number]> = {
  "America/New_York": [40.7, -74.0], "America/Chicago": [41.9, -87.6],
  "America/Denver": [39.7, -105.0], "America/Phoenix": [33.4, -112.1],
  "America/Los_Angeles": [34.1, -118.2], "America/Anchorage": [61.2, -149.9],
  "America/Toronto": [43.7, -79.4], "America/Vancouver": [49.3, -123.1],
  "America/Mexico_City": [19.4, -99.1], "America/Bogota": [4.7, -74.1],
  "America/Lima": [-12.0, -77.0], "America/Santiago": [-33.4, -70.7],
  "America/Sao_Paulo": [-23.6, -46.6], "America/Argentina/Buenos_Aires": [-34.6, -58.4],
  "Europe/London": [51.5, -0.1], "Europe/Dublin": [53.3, -6.3],
  "Europe/Lisbon": [38.7, -9.1], "Europe/Madrid": [40.4, -3.7],
  "Europe/Paris": [48.9, 2.3], "Europe/Amsterdam": [52.4, 4.9],
  "Europe/Berlin": [52.5, 13.4], "Europe/Zurich": [47.4, 8.5],
  "Europe/Rome": [41.9, 12.5], "Europe/Vienna": [48.2, 16.4],
  "Europe/Prague": [50.1, 14.4], "Europe/Warsaw": [52.2, 21.0],
  "Europe/Stockholm": [59.3, 18.1], "Europe/Oslo": [59.9, 10.8],
  "Europe/Copenhagen": [55.7, 12.6], "Europe/Helsinki": [60.2, 24.9],
  "Europe/Athens": [38.0, 23.7], "Europe/Istanbul": [41.0, 29.0],
  "Europe/Kyiv": [50.5, 30.5], "Europe/Moscow": [55.8, 37.6],
  "Africa/Casablanca": [33.6, -7.6], "Africa/Cairo": [30.0, 31.2],
  "Africa/Lagos": [6.5, 3.4], "Africa/Nairobi": [-1.3, 36.8],
  "Africa/Johannesburg": [-26.2, 28.0], "Asia/Jerusalem": [31.8, 35.2],
  "Asia/Dubai": [25.2, 55.3], "Asia/Riyadh": [24.7, 46.7],
  "Asia/Tehran": [35.7, 51.4], "Asia/Karachi": [24.9, 67.0],
  "Asia/Kolkata": [22.6, 88.4], "Asia/Bangkok": [13.8, 100.5],
  "Asia/Jakarta": [-6.2, 106.8], "Asia/Singapore": [1.4, 103.8],
  "Asia/Hong_Kong": [22.3, 114.2], "Asia/Shanghai": [31.2, 121.5],
  "Asia/Taipei": [25.0, 121.6], "Asia/Manila": [14.6, 121.0],
  "Asia/Seoul": [37.6, 127.0], "Asia/Tokyo": [35.7, 139.7],
  "Australia/Perth": [-32.0, 115.9], "Australia/Brisbane": [-27.5, 153.0],
  "Australia/Sydney": [-33.9, 151.2], "Australia/Melbourne": [-37.8, 145.0],
  "Pacific/Auckland": [-36.8, 174.8], "Pacific/Honolulu": [21.3, -157.9],
};

export function guessLocation(): { lat: number; lon: number; precise: boolean } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hit = tz ? TZ_COORDS[tz] : undefined;
    if (hit) return { lat: hit[0], lon: hit[1], precise: false };
  } catch {
    // Intl can be restricted; fall through to the clock-offset estimate.
  }
  const lon = (-new Date().getTimezoneOffset() / 60) * 15;
  return { lat: 25, lon, precise: false };
}
