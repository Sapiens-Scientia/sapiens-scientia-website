export type LiveVitalSignUpdate = {
  id: string;
  value: string;
  updated: string;
  live: true;
  source: string;
  sourceHref: string;
  note: string;
  chartPoint: { year: number; value: number };
};

const GISTEMP_URL = "https://data.giss.nasa.gov/gistemp/tabledata_v4/GLB.Ts+dSST.csv";
const CO2_URL = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_mm_mlo.txt";
const CH4_URL = "https://gml.noaa.gov/webdata/ccgg/trends/ch4/ch4_mm_gl.txt";
// MRNEV asks for recent non-empty observations, without a date range that
// silently expires as the site ages. The parser still validates every row.
const WORLD_POPULATION_URL =
  "https://api.worldbank.org/v2/country/WLD/indicator/SP.POP.TOTL?format=json&mrnev=5&per_page=5";
const WORLD_GDP_URL =
  "https://api.worldbank.org/v2/country/WLD/indicator/NY.GDP.MKTP.CD?format=json&mrnev=5&per_page=5";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type AnnualReading = { value: number; year: number };
type MonthlyReading = AnnualReading & { month: number };

function finiteNumber(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** Use NASA's published January–December mean, never a partial-year average. */
export function parseGistempAnomaly(csv: string): AnnualReading | null {
  const lines = csv.split(/\r?\n/).map((line) => line.trim());
  const header = lines.find((line) => line.startsWith("Year,"))?.split(",");
  const annualColumn = header?.findIndex((column) => column.trim() === "J-D") ?? -1;
  if (annualColumn < 0) return null;

  let latest: AnnualReading | null = null;
  for (const line of lines) {
    if (!/^\d{4},/.test(line)) continue;
    const columns = line.split(",");
    const year = Number(columns[0]);
    const value = finiteNumber(columns[annualColumn]);
    if (value !== null && (!latest || year > latest.year)) latest = { year, value };
  }
  return latest;
}

/** Both NOAA monthly formats put concentration in the fourth column. */
export function parseNoaaGreenhouseGas(text: string): MonthlyReading | null {
  let latest: MonthlyReading | null = null;
  for (const line of text.split(/\r?\n/)) {
    const columns = line.trim().split(/\s+/);
    if (!/^\d{4}$/.test(columns[0])) continue;
    const year = Number(columns[0]);
    const month = Number(columns[1]);
    const value = finiteNumber(columns[3]);
    // Negative sentinel values are missing readings, not concentrations.
    if (!Number.isInteger(month) || month < 1 || month > 12 || value === null || value <= 0) continue;
    if (!latest || year * 12 + month > latest.year * 12 + latest.month) {
      latest = { year, month, value };
    }
  }
  return latest;
}

export function parseWorldBankIndicator(json: unknown): AnnualReading | null {
  if (!Array.isArray(json) || !Array.isArray(json[1])) return null;
  let latest: AnnualReading | null = null;
  for (const row of json[1]) {
    if (!row || typeof row !== "object" || !/^\d{4}$/.test(String(row.date))) continue;
    const year = Number(row.date);
    const value = finiteNumber(row.value);
    // Number(null) is zero; absent observations must remain absent.
    if (value !== null && (!latest || year > latest.year)) latest = { year, value };
  }
  return latest;
}

export async function fetchLiveVitalSignUpdates(fetcher: typeof fetch = fetch): Promise<LiveVitalSignUpdate[]> {
  const read = async (url: string) => {
    const response = await fetcher(url, {
      next: { revalidate: 86_400 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
    return response;
  };

  const temperature = async (): Promise<LiveVitalSignUpdate | null> => {
    const response = await read(GISTEMP_URL);
    const reading = parseGistempAnomaly(await response.text());
    if (!reading) return null;
    return {
      id: "global-temperature",
      value: `${reading.value >= 0 ? "+" : ""}${reading.value.toFixed(2)} °C`,
      updated: `${reading.year} annual`,
      live: true,
      source: "NASA GISS",
      sourceHref: "https://data.giss.nasa.gov/gistemp/",
      note: `${reading.year} published annual land–ocean temperature anomaly relative to NASA's 1951–1980 baseline.`,
      chartPoint: reading,
    };
  };

  const greenhouseGas = async (url: string, id: string, unit: string): Promise<LiveVitalSignUpdate | null> => {
    const response = await read(url);
    const reading = parseNoaaGreenhouseGas(await response.text());
    if (!reading) return null;
    return {
      id,
      value: `${Math.round(reading.value).toLocaleString("en-US")} ${unit}`,
      updated: `${monthNames[reading.month - 1]} ${reading.year} monthly`,
      live: true,
      source: "NOAA GML",
      sourceHref: url,
      note: id === "atmospheric-co2"
        ? "Monthly mean carbon dioxide at Mauna Loa; seasonal variation is included."
        : "Globally averaged monthly mean atmospheric methane.",
      chartPoint: { year: reading.year + (reading.month - 1) / 12, value: reading.value },
    };
  };

  const worldBank = async (url: string, id: string): Promise<LiveVitalSignUpdate | null> => {
    const response = await read(url);
    const reading = parseWorldBankIndicator(await response.json());
    if (!reading || reading.value <= 0) return null;
    const population = id === "human-population";
    return {
      id,
      value: population ? `${(reading.value / 1e9).toFixed(2)}B` : `$${(reading.value / 1e12).toFixed(1)}T`,
      updated: `${reading.year} annual`,
      live: true,
      source: "World Bank",
      sourceHref: population
        ? "https://data.worldbank.org/indicator/SP.POP.TOTL?locations=1W"
        : "https://data.worldbank.org/indicator/NY.GDP.MKTP.CD?locations=1W",
      note: population
        ? "Annual world population estimate from the World Bank; this is not a real-time population count."
        : "Annual world GDP in current US dollars from the World Bank; not adjusted for purchasing power or inflation.",
      chartPoint: { year: reading.year, value: reading.value / (population ? 1e9 : 1e12) },
    };
  };

  // Isolate the whole fetch/decode/parse operation. One malformed response must
  // not discard readings successfully obtained from the other sources.
  const results = await Promise.allSettled([
    temperature(),
    greenhouseGas(CO2_URL, "atmospheric-co2", "ppm"),
    greenhouseGas(CH4_URL, "atmospheric-methane", "ppb"),
    worldBank(WORLD_POPULATION_URL, "human-population"),
    worldBank(WORLD_GDP_URL, "global-gdp"),
  ]);
  return results.flatMap((result) => result.status === "fulfilled" && result.value ? [result.value] : []);
}
