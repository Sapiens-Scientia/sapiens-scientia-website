export type LiveVitalSignUpdate = {
  id: string;
  value: string;
  updated: string;
  live: true;
  chartPoint?: { year: number; value: number };
};

const GISTEMP_URL = "https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv";
const CO2_URL = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt";
const CH4_URL = "https://gml.noaa.gov/webdata/ccgg/trends/ch4/ch4_mm_gl.txt";
const WORLD_POPULATION_URL =
  "https://api.worldbank.org/v2/country/WLD/indicator/SP.POP.TOTL?format=json&date=2024:2026&per_page=5";
const WORLD_GDP_URL =
  "https://api.worldbank.org/v2/country/WLD/indicator/NY.GDP.MKTP.CD?format=json&date=2023:2025&per_page=5";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function parseGistempAnomaly(csv: string): { value: number; year: number } | null {
  const rows = csv
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d{4},/.test(line));

  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const parts = rows[index].split(",");
    const year = Number(parts[0]);
    if (!Number.isFinite(year)) {
      continue;
    }

    const monthly = parts.slice(1, 13).map((value) => {
      const trimmed = value.trim();
      if (!trimmed || trimmed === "***") {
        return null;
      }
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : null;
    });

    const valid = monthly.filter((value): value is number => value !== null);
    if (valid.length < 6) {
      continue;
    }

    const average = valid.reduce((sum, value) => sum + value, 0) / valid.length;
    return { value: average, year };
  }

  return null;
}

function parseNoaaCo2(text: string): { value: number; year: number; month: number } | null {
  return parseNoaaGreenhouseGas(text);
}

function parseNoaaCh4(text: string): { value: number; year: number; month: number } | null {
  return parseNoaaGreenhouseGas(text);
}

function parseNoaaGreenhouseGas(text: string): { value: number; year: number; month: number } | null {
  const rows = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^\d{4}\s+\d{1,2}\s+/.test(line));

  if (rows.length === 0) {
    return null;
  }

  const parts = rows[rows.length - 1].split(/\s+/);
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const ppm = Number(parts[3]);

  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(ppm)) {
    return null;
  }

  return { value: ppm, year, month };
}

function formatTemperature(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} C`;
}

function formatCo2(value: number): string {
  return `${Math.round(value)} ppm`;
}

function formatCh4(value: number): string {
  return `${Math.round(value).toLocaleString("en-US")} ppb`;
}

function formatPopulation(value: number): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }

  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(1)}M`;
  }

  return value.toLocaleString("en-US");
}

function formatGdp(value: number): string {
  return `$${Math.round(value / 1e12)}T`;
}

function parseWorldBankIndicator(json: unknown): { value: number; year: number } | null {
  if (!Array.isArray(json) || json.length < 2) {
    return null;
  }

  const rows = json[1];
  if (!Array.isArray(rows)) {
    return null;
  }

  for (const row of rows) {
    if (!row || typeof row !== "object") {
      continue;
    }

    const year = Number((row as { date?: string }).date);
    const value = Number((row as { value?: number | null }).value);

    if (Number.isFinite(year) && Number.isFinite(value)) {
      return { value, year };
    }
  }

  return null;
}

function formatMonthYear(year: number, month: number): string {
  const label = monthNames[month - 1] ?? "—";
  return `${label} ${year}`;
}

export async function fetchLiveVitalSignUpdates(): Promise<LiveVitalSignUpdate[]> {
  const updates: LiveVitalSignUpdate[] = [];

  const [gistempResult, co2Result, ch4Result, populationResult, gdpResult] = await Promise.allSettled([
    fetch(GISTEMP_URL, { next: { revalidate: 86_400 } }),
    fetch(CO2_URL, { next: { revalidate: 86_400 } }),
    fetch(CH4_URL, { next: { revalidate: 86_400 } }),
    fetch(WORLD_POPULATION_URL, { next: { revalidate: 86_400 } }),
    fetch(WORLD_GDP_URL, { next: { revalidate: 86_400 } }),
  ]);

  if (gistempResult.status === "fulfilled" && gistempResult.value.ok) {
    const csv = await gistempResult.value.text();
    const parsed = parseGistempAnomaly(csv);
    if (parsed) {
      updates.push({
        id: "global-temperature",
        value: formatTemperature(parsed.value),
        updated: `${parsed.year} annual (live)`,
        live: true,
        chartPoint: { year: parsed.year, value: parsed.value },
      });
    }
  }

  if (co2Result.status === "fulfilled" && co2Result.value.ok) {
    const text = await co2Result.value.text();
    const parsed = parseNoaaCo2(text);
    if (parsed) {
      updates.push({
        id: "atmospheric-co2",
        value: formatCo2(parsed.value),
        updated: `${formatMonthYear(parsed.year, parsed.month)} (live)`,
        live: true,
        chartPoint: { year: parsed.year + (parsed.month - 1) / 12, value: parsed.value },
      });
    }
  }

  if (ch4Result.status === "fulfilled" && ch4Result.value.ok) {
    const text = await ch4Result.value.text();
    const parsed = parseNoaaCh4(text);
    if (parsed) {
      updates.push({
        id: "atmospheric-methane",
        value: formatCh4(parsed.value),
        updated: `${formatMonthYear(parsed.year, parsed.month)} (live)`,
        live: true,
        chartPoint: { year: parsed.year + (parsed.month - 1) / 12, value: parsed.value },
      });
    }
  }

  if (populationResult.status === "fulfilled" && populationResult.value.ok) {
    const json = (await populationResult.value.json()) as unknown;
    const parsed = parseWorldBankIndicator(json);
    if (parsed) {
      updates.push({
        id: "human-population",
        value: formatPopulation(parsed.value),
        updated: `${parsed.year} (live)`,
        live: true,
        chartPoint: { year: parsed.year, value: parsed.value / 1e9 },
      });
    }
  }

  if (gdpResult.status === "fulfilled" && gdpResult.value.ok) {
    const json = (await gdpResult.value.json()) as unknown;
    const parsed = parseWorldBankIndicator(json);
    if (parsed) {
      updates.push({
        id: "global-gdp",
        value: formatGdp(parsed.value),
        updated: `${parsed.year} (live)`,
        live: true,
        chartPoint: { year: parsed.year, value: parsed.value / 1e12 },
      });
    }
  }

  return updates;
}
