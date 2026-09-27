import assert from "node:assert/strict";
import test from "node:test";
import { buildScenarioHash, parseScenarioHash, scenarioBaselines } from "../src/lib/cross-platform-simulator";
import { fetchLiveVitalSignUpdates, parseGistempAnomaly, parseNoaaGreenhouseGas, parseWorldBankIndicator } from "../src/lib/vital-signs-live";

const nasaHeader = "Year,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec,J-D,D-N,DJF,MAM,JJA,SON";
const completeYear = "2025,1.38,1.26,1.37,1.25,1.08,1.07,1.02,1.18,1.25,1.19,1.21,1.06,1.19,1.21,1.30,1.23,1.09,1.22";
const partialYear = "2026,1.09,1.25,1.32,1.17,1.13,1.18,1.25,1.40,***,***,***,***,***,***,1.13,1.21,1.28,***";

test("NASA annual values use the published J-D column and skip incomplete years", () => {
  assert.deepEqual(parseGistempAnomaly(["Land-Ocean: Global Means", nasaHeader, completeYear, partialYear].join("\n")), { year: 2025, value: 1.19 });
  assert.equal(parseGistempAnomaly([nasaHeader, partialYear].join("\n")), null);
  assert.equal(parseGistempAnomaly(completeYear), null);
});

test("NOAA skips missing concentrations and invalid months, retaining the newest valid observation", () => {
  const text = "# monthly averages\n2026 2 2026.1 428.5\n2026 3 2026.2 -99.99\n2026 13 2026.9 440\n2026 4 2026.3 NaN\n2025 12 2025.9 426";
  assert.deepEqual(parseNoaaGreenhouseGas(text), { year: 2026, month: 2, value: 428.5 });
  assert.equal(parseNoaaGreenhouseGas("2026 1 2026.0 -999.99"), null);
});

test("World Bank nulls, blanks, booleans and infinities never become zero observations", () => {
  const rows = [{date:"2026",value:null},{date:"2025",value:""},{date:"2024",value:8_000_000_000},{date:"2027",value:false},{date:"2028",value:Infinity}];
  assert.deepEqual(parseWorldBankIndicator([{},rows]),{year:2024,value:8_000_000_000});
  assert.equal(parseWorldBankIndicator([{},[{date:"2025",value:null}]]),null);
  assert.deepEqual(parseWorldBankIndicator([{},[{date:"2025",value:0}]]),{year:2025,value:0});
  assert.deepEqual(parseWorldBankIndicator([{},[{date:"2024",value:3},{date:"2025",value:4}]]),{year:2025,value:4});
});

test("scenario links round trip, clamp finite values, and reject incomplete or invalid input", () => {
  assert.deepEqual(parseScenarioHash(buildScenarioHash(scenarioBaselines)), scenarioBaselines);
  assert.deepEqual(parseScenarioHash("#coupled-scenario?fw=-8&cv=105&hc=65.7"), {freshwaterStress:0,civicSpace:100,healthcareAccess:66});
  for (const hash of ["#coupled-scenario?fw=20", "#coupled-scenario?fw=&cv=20&hc=30", "#coupled-scenario?fw=Infinity&cv=20&hc=30", "#coupled-scenario-other?fw=20&cv=30&hc=40", "#coupled-scenario?fw=no&cv=20&hc=30"]) {
    assert.equal(parseScenarioHash(hash),null,hash);
  }
});

test("one malformed live source does not discard healthy sources, and attribution follows the fetched value", async () => {
  const fetcher: typeof fetch = async (input, options) => {
    const url = String(input);
    assert.ok(options?.signal, "each source has a timeout signal");
    if (url.includes("giss.nasa")) return new Response([nasaHeader, completeYear, partialYear].join("\n"));
    if (url.includes("co2_mm")) return new Response("2026 8 2026.6 424.5");
    if (url.includes("ch4_mm")) return new Response("unavailable", {status:503});
    if (url.includes("SP.POP.TOTL")) return new Response("malformed JSON");
    return Response.json([{},[{date:"2025",value:null},{date:"2024",value:110_000_000_000_000}]]);
  };
  const updates = await fetchLiveVitalSignUpdates(fetcher);
  assert.deepEqual(updates.map((update)=>update.id), ["global-temperature","atmospheric-co2","global-gdp"]);
  const gdp=updates.find((update)=>update.id==="global-gdp")!;
  assert.equal(gdp.source,"World Bank");
  assert.equal(gdp.chartPoint.value,110);
  assert.equal(gdp.updated,"2024 annual");
});

test("all live source failures return an empty set for the reference-data fallback", async () => {
  const fetcher: typeof fetch = async () => { throw new Error("offline"); };
  assert.deepEqual(await fetchLiveVitalSignUpdates(fetcher), []);
});

test("live headline updates retain the historical series and its original provider", async () => {
  const { mergeLiveVitalSigns } = await import("../src/hooks/use-live-vital-signs");
  const { earthVitalSigns } = await import("../src/lib/vital-signs");
  const original = earthVitalSigns.find((sign) => sign.id === "global-gdp")!;
  const update = { id: original.id, value: "$120T", updated: "2026 annual", live: true as const,
    source: "World Bank", sourceHref: "https://data.worldbank.org/", note: "Annual current-dollar observation.", chartPoint: { year: 2026, value: 120 } };
  const merged = mergeLiveVitalSigns([original], [update])[0];
  assert.equal(merged.value, "$120T");
  assert.equal(merged.source, "World Bank");
  assert.equal(merged.historicalData, original.historicalData);
  assert.deepEqual(merged.referenceSource, { label: original.source, href: original.sourceHref });
  assert.equal(original.referenceSource, undefined);
  assert.notEqual(original.value, "$120T");
  const refreshed = mergeLiveVitalSigns([merged], [{ ...update, value: "$121T" }])[0];
  assert.deepEqual(refreshed.referenceSource, merged.referenceSource);
});
