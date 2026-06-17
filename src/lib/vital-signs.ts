// The planetary "vital signs" — a small set of fully-sourced indicators that
// read the state of the Earth system the way a chart reads a patient: a value
// now, the trend that brought it here, and where the line is heading. The data
// is shared between the homepage 3D hero (where each sign annotates the Earth
// model) and the dedicated /vitals dashboard page, so it lives here as the
// single source of truth.
//
// Every figure cites an authoritative body (NASA, NOAA, IMF, UNEP, OECD, …) via
// `source`/`sourceHref`. `earthSystemLinks` key into the nested-systems taxonomy
// (see `earthSystemNodes` in the hero and `/scales`); `domain` is an editorial
// grouping that maps onto the existing megasystem/macrosystem tiers, not new
// ontology.

export type VitalSignDomainId =
  | "human"
  | "atmosphere"
  | "ocean"
  | "land"
  | "waste";

export type VitalSignDomain = {
  id: VitalSignDomainId;
  name: string;
  accent: string;
  blurb: string;
};

// Ordered roughly from the human/collective scale up through the planetary
// spheres — the same direction the Ladder of Scale climbs.
export const vitalSignDomains: VitalSignDomain[] = [
  {
    id: "human",
    name: "Human & Economy",
    accent: "#818cf8",
    blurb:
      "Macrosystems — the people, economy, and energy that together drive every other line on this page.",
  },
  {
    id: "atmosphere",
    name: "Atmosphere & Climate",
    accent: "#f97316",
    blurb:
      "Megasystems — the composition of the air and the climate it forces.",
  },
  {
    id: "ocean",
    name: "Ocean & Ice",
    accent: "#22d3ee",
    blurb:
      "Megasystems — the hydrosphere, from deep-ocean heat to vanishing polar ice.",
  },
  {
    id: "land",
    name: "Land, Water & Life",
    accent: "#34d399",
    blurb:
      "Megasystems — soils, freshwater, forests, and the living biosphere.",
  },
  {
    id: "waste",
    name: "Waste & Pollution",
    accent: "#c084fc",
    blurb:
      "Anthropogenic waste flowing back into the Earth systems that absorb it.",
  },
];

export type EarthVitalSign = {
  id: string;
  accent: string;
  domain: VitalSignDomainId;
  earthSystemLinks?: string[];
  label: string;
  note: string;
  source: string;
  sourceHref: string;
  statusBar?: {
    remainingLabel: string;
    remainingPercent: number;
    usedLabel: string;
    usedPercent: number;
  };
  updated: string;
  value: string;
  liveChartPoint?: { year: number; value: number };
  historicalData?: {
    points: { year: number; value: number }[];
    projection?: { year: number; value: number }[];
    unit: string;
  };
};

export const earthVitalSigns: EarthVitalSign[] = [
  {
    id: "human-population",
    accent: "#facc15",
    domain: "human",
    earthSystemLinks: ["People", "Homo sapiens"],
    label: "Human Population",
    value: "8.19B est.",
    note: "Modeled world population estimate from the U.S. Census population clock.",
    updated: "Jun 2026",
    source: "U.S. Census Bureau",
    sourceHref: "https://www.census.gov/popclock/",
    historicalData: {
      points: [
        { year: 1970, value: 3.7 },
        { year: 1980, value: 4.4 },
        { year: 1990, value: 5.3 },
        { year: 2000, value: 6.1 },
        { year: 2010, value: 6.9 },
        { year: 2020, value: 7.8 },
        { year: 2026, value: 8.19 },
      ],
      projection: [
        { year: 2030, value: 8.5 },
        { year: 2040, value: 9.2 },
        { year: 2050, value: 9.7 },
      ],
      unit: "B",
    },
  },
  {
    id: "global-oil-stock",
    accent: "#fb923c",
    domain: "human",
    earthSystemLinks: ["Fossil Fuels", "Energy Generation System", "Transportation, Pipes, & Cables"],
    label: "Global Oil Stock",
    value: "49% used",
    note: "Approximate cumulative oil consumed vs. proved reserves remaining; excludes unproved resources.",
    updated: "2025 est.",
    source: "Worldometer / OilPrice",
    sourceHref: "https://www.worldometers.info/oil/",
    statusBar: {
      usedLabel: "1.7T bbl used",
      usedPercent: 49,
      remainingLabel: "1.8T bbl proved remaining",
      remainingPercent: 51,
    },
    historicalData: {
      points: [
        { year: 1970, value: 10 },
        { year: 1980, value: 18 },
        { year: 1990, value: 25 },
        { year: 2000, value: 32 },
        { year: 2010, value: 39 },
        { year: 2020, value: 46 },
        { year: 2025, value: 49 },
      ],
      projection: [
        { year: 2030, value: 52 },
        { year: 2040, value: 58 },
        { year: 2050, value: 64 },
      ],
      unit: "% used",
    },
  },
  {
    id: "global-gdp",
    accent: "#86efac",
    domain: "human",
    earthSystemLinks: ["Economic System", "Financial System", "Business & Industrial System"],
    label: "Global GDP",
    value: "$118T",
    note: "Nominal world GDP at current prices; not adjusted for purchasing power or inflation.",
    updated: "2025 est.",
    source: "IMF WEO",
    sourceHref: "https://www.imf.org/external/datamapper/",
    historicalData: {
      points: [
        { year: 1970, value: 3.4 },
        { year: 1980, value: 11.2 },
        { year: 1990, value: 22.8 },
        { year: 2000, value: 33.8 },
        { year: 2010, value: 66.1 },
        { year: 2020, value: 85.2 },
        { year: 2025, value: 118 },
      ],
      projection: [
        { year: 2030, value: 140 },
        { year: 2040, value: 190 },
        { year: 2050, value: 250 },
      ],
      unit: "$T",
    },
  },
  {
    id: "primary-energy-use",
    accent: "#fbbf24",
    domain: "human",
    earthSystemLinks: ["Energy Generation System", "Fossil Fuels", "Economic System", "Technology"],
    label: "Primary Energy Use",
    value: "592 EJ",
    note: "Global primary energy consumption; fossil fuels account for nearly 87% of the total.",
    updated: "2024",
    source: "Energy Institute",
    sourceHref: "https://www.energyinst.org/statistical-review",
    historicalData: {
      points: [
        { year: 1970, value: 230 },
        { year: 1980, value: 290 },
        { year: 1990, value: 360 },
        { year: 2000, value: 420 },
        { year: 2010, value: 520 },
        { year: 2020, value: 560 },
        { year: 2024, value: 592 },
      ],
      projection: [
        { year: 2030, value: 630 },
        { year: 2040, value: 680 },
        { year: 2050, value: 720 },
      ],
      unit: "EJ",
    },
  },
  {
    id: "freshwater-withdrawals",
    accent: "#06b6d4",
    domain: "land",
    earthSystemLinks: ["Freshwater", "Agricultural Systems", "People", "Ecosystems"],
    label: "Freshwater Withdrawals",
    value: "72% ag.",
    note: "Share of global freshwater withdrawals used by agriculture.",
    updated: "2024 report",
    source: "UN-Water",
    sourceHref: "https://www.unwater.org/water-facts/water-food-and-energy/",
    historicalData: {
      points: [
        { year: 1970, value: 78 },
        { year: 1980, value: 76 },
        { year: 1990, value: 74 },
        { year: 2000, value: 73 },
        { year: 2010, value: 72 },
        { year: 2020, value: 72 },
        { year: 2024, value: 72 },
      ],
      projection: [
        { year: 2030, value: 71 },
        { year: 2040, value: 69 },
        { year: 2050, value: 67 },
      ],
      unit: "% ag",
    },
  },
  {
    id: "municipal-waste",
    accent: "#c084fc",
    domain: "waste",
    earthSystemLinks: ["Anthropogenic Waste", "Waste Management System", "People", "Economic System"],
    label: "Municipal Waste",
    value: "2.1B t/yr",
    note: "Global municipal solid waste generation, projected to rise to 3.8B tonnes by 2050.",
    updated: "2023",
    source: "UNEP",
    sourceHref: "https://www.unep.org/resources/global-waste-management-outlook-2024",
    historicalData: {
      points: [
        { year: 2000, value: 1.2 },
        { year: 2010, value: 1.6 },
        { year: 2020, value: 2.0 },
        { year: 2023, value: 2.1 },
      ],
      projection: [
        { year: 2030, value: 2.5 },
        { year: 2040, value: 3.1 },
        { year: 2050, value: 3.8 },
      ],
      unit: "B t/yr",
    },
  },
  {
    id: "plastic-waste",
    accent: "#fb7185",
    domain: "waste",
    earthSystemLinks: ["Anthropogenic Waste", "Waste Management System", "Business & Industrial System"],
    label: "Plastic Waste",
    value: "353M t/yr",
    note: "Global plastic waste generated in 2019; plastics production reached 460M tonnes.",
    updated: "2019",
    source: "OECD",
    sourceHref: "https://www.oecd.org/en/publications/global-plastics-outlook_de747aef-en.html",
    historicalData: {
      points: [
        { year: 1970, value: 30 },
        { year: 1980, value: 60 },
        { year: 1990, value: 110 },
        { year: 2000, value: 190 },
        { year: 2010, value: 290 },
        { year: 2019, value: 353 },
      ],
      projection: [
        { year: 2030, value: 460 },
        { year: 2040, value: 620 },
        { year: 2050, value: 800 },
      ],
      unit: "M t/yr",
    },
  },
  {
    id: "land-degradation",
    accent: "#a3e635",
    domain: "land",
    earthSystemLinks: ["Soil System", "Agricultural Systems", "Ecosystems", "Biosphere"],
    label: "Land Degradation",
    value: "up to 40%",
    note: "Estimated share of the world's land surface degraded by human activity.",
    updated: "UN estimate",
    source: "United Nations",
    sourceHref: "https://www.un.org/en/climatechange/science/climate-issues/land",
    historicalData: {
      points: [
        { year: 2000, value: 20 },
        { year: 2010, value: 28 },
        { year: 2020, value: 36 },
        { year: 2025, value: 40 },
      ],
      projection: [
        { year: 2030, value: 45 },
        { year: 2040, value: 52 },
        { year: 2050, value: 60 },
      ],
      unit: "% deg.",
    },
  },
  {
    id: "global-temperature",
    accent: "#f97316",
    domain: "atmosphere",
    earthSystemLinks: ["Atmosphere", "Climate System"],
    label: "Global Temperature",
    value: "+1.19 C",
    note: "2025 annual anomaly vs. NASA's 1951-1980 baseline.",
    updated: "2025 annual",
    source: "NASA GISS",
    sourceHref: "https://science.nasa.gov/earth/explore/earth-indicators/global-temperature/",
    historicalData: {
      points: [
        { year: 1970, value: 0.03 },
        { year: 1980, value: 0.26 },
        { year: 1990, value: 0.45 },
        { year: 2000, value: 0.40 },
        { year: 2010, value: 0.72 },
        { year: 2020, value: 1.02 },
        { year: 2025, value: 1.19 },
      ],
      projection: [
        { year: 2030, value: 1.35 },
        { year: 2040, value: 1.60 },
        { year: 2050, value: 1.85 },
      ],
      unit: "°C",
    },
  },
  {
    id: "atmospheric-co2",
    accent: "#38bdf8",
    domain: "atmosphere",
    earthSystemLinks: ["Atmosphere", "Climate System", "Fossil Fuels"],
    label: "Atmospheric CO2",
    value: "431 ppm",
    note: "Latest monthly Mauna Loa measurement shown by NASA.",
    updated: "Apr 2026",
    source: "NASA / NOAA",
    sourceHref: "https://science.nasa.gov/earth/explore/earth-indicators/carbon-dioxide/",
    historicalData: {
      points: [
        { year: 1970, value: 325 },
        { year: 1980, value: 338 },
        { year: 1990, value: 354 },
        { year: 2000, value: 369 },
        { year: 2010, value: 389 },
        { year: 2020, value: 414 },
        { year: 2026, value: 431 },
      ],
      projection: [
        { year: 2030, value: 442 },
        { year: 2040, value: 470 },
        { year: 2050, value: 495 },
      ],
      unit: "ppm",
    },
  },
  {
    id: "atmospheric-methane",
    accent: "#a78bfa",
    domain: "atmosphere",
    earthSystemLinks: ["Atmosphere", "Climate System", "Agricultural Systems"],
    label: "Atmospheric Methane",
    value: "1,940 ppb",
    note: "Heat-trapping gas measured from NOAA's global network.",
    updated: "Jan 2026",
    source: "NASA / NOAA",
    sourceHref: "https://science.nasa.gov/earth/explore/earth-indicators/methane/",
    historicalData: {
      points: [
        { year: 1980, value: 1580 },
        { year: 1990, value: 1720 },
        { year: 2000, value: 1775 },
        { year: 2010, value: 1800 },
        { year: 2020, value: 1880 },
        { year: 2026, value: 1940 },
      ],
      projection: [
        { year: 2030, value: 1980 },
        { year: 2040, value: 2050 },
        { year: 2050, value: 2100 },
      ],
      unit: "ppb",
    },
  },
  {
    id: "ocean-heat",
    accent: "#22d3ee",
    domain: "ocean",
    earthSystemLinks: ["Hydrosphere", "Climate System"],
    label: "Ocean Heat",
    value: "372 +/- 2 ZJ",
    note: "Upper-ocean heat content change since 1955.",
    updated: "Dec 2024",
    source: "NASA / NOAA",
    sourceHref: "https://science.nasa.gov/earth/explore/earth-indicators/ocean-warming/",
    historicalData: {
      points: [
        { year: 1970, value: 20 },
        { year: 1980, value: 60 },
        { year: 1990, value: 110 },
        { year: 2000, value: 180 },
        { year: 2010, value: 260 },
        { year: 2020, value: 340 },
        { year: 2024, value: 372 },
      ],
      projection: [
        { year: 2030, value: 420 },
        { year: 2040, value: 510 },
        { year: 2050, value: 600 },
      ],
      unit: "ZJ",
    },
  },
  {
    id: "sea-level",
    accent: "#60a5fa",
    domain: "ocean",
    earthSystemLinks: ["Hydrosphere", "Climate System"],
    label: "Sea Level",
    value: "+0.08 cm",
    note: "Global mean sea level rise during 2025.",
    updated: "2025",
    source: "NASA JPL",
    sourceHref: "https://www.nasa.gov/earth/nasa-analysis-shows-la-nina-limited-sea-level-rise-in-2025/",
    historicalData: {
      points: [
        { year: 1993, value: 0.0 },
        { year: 2000, value: 2.2 },
        { year: 2010, value: 5.5 },
        { year: 2020, value: 9.3 },
        { year: 2025, value: 11.2 },
      ],
      projection: [
        { year: 2030, value: 14.0 },
        { year: 2040, value: 20.0 },
        { year: 2050, value: 27.0 },
      ],
      unit: "cm",
    },
  },
  {
    id: "arctic-sea-ice",
    accent: "#93c5fd",
    domain: "ocean",
    earthSystemLinks: ["Hydrosphere", "Climate System"],
    label: "Arctic Sea Ice",
    value: "-12.2% / decade",
    note: "September minimum extent trend vs. the 1981-2010 average.",
    updated: "Annual series",
    source: "NASA / NSIDC",
    sourceHref: "https://science.nasa.gov/earth/explore/earth-indicators/arctic-sea-ice-minimum-extent/",
    historicalData: {
      points: [
        { year: 1980, value: 7.8 },
        { year: 1990, value: 6.2 },
        { year: 2000, value: 6.3 },
        { year: 2010, value: 4.9 },
        { year: 2020, value: 3.9 },
        { year: 2024, value: 4.2 },
      ],
      projection: [
        { year: 2030, value: 3.2 },
        { year: 2040, value: 2.0 },
        { year: 2050, value: 1.0 },
      ],
      unit: "M km²",
    },
  },
  {
    id: "tropical-primary-forest",
    accent: "#34d399",
    domain: "land",
    earthSystemLinks: ["Ecosystems", "Biosphere", "Agricultural Systems"],
    label: "Tropical Primary Forest",
    value: "6.7M ha lost",
    note: "Record tropical primary rainforest loss in 2024.",
    updated: "2024",
    source: "Global Forest Watch / WRI",
    sourceHref: "https://gfr.wri.org/global-tree-cover-loss-data-2024",
    historicalData: {
      points: [
        { year: 2015, value: 3.5 },
        { year: 2016, value: 4.8 },
        { year: 2017, value: 4.6 },
        { year: 2018, value: 3.6 },
        { year: 2019, value: 3.8 },
        { year: 2020, value: 4.2 },
        { year: 2021, value: 3.75 },
        { year: 2022, value: 4.1 },
        { year: 2023, value: 3.7 },
        { year: 2024, value: 6.7 },
      ],
      projection: [
        { year: 2025, value: 6.2 },
        { year: 2030, value: 5.0 },
        { year: 2040, value: 3.5 },
        { year: 2050, value: 2.0 },
      ],
      unit: "M ha",
    },
  },
  {
    id: "wildlife-populations",
    accent: "#bef264",
    domain: "land",
    earthSystemLinks: ["Ecosystems", "Biosphere", "Multicellular Life Forms", "Mammals"],
    label: "Wildlife Populations",
    value: "-73%",
    note: "Average change in monitored vertebrate populations, 1970-2020.",
    updated: "2024 report",
    source: "WWF / ZSL",
    sourceHref: "https://www.worldwildlife.org/publications/2024-living-planet-report",
    historicalData: {
      points: [
        { year: 1970, value: 0 },
        { year: 1980, value: -15 },
        { year: 1990, value: -35 },
        { year: 2000, value: -50 },
        { year: 2010, value: -62 },
        { year: 2020, value: -73 },
      ],
      projection: [
        { year: 2030, value: -78 },
        { year: 2040, value: -82 },
        { year: 2050, value: -85 },
      ],
      unit: "%",
    },
  },
];

export type VitalSignTrend = {
  direction: "rising" | "falling" | "flat";
  first: { year: number; value: number };
  last: { year: number; value: number };
  /** Last projected point, if a projection exists. */
  projectedTo?: { year: number; value: number };
  /**
   * How far the indicator has moved across its record, as a share of the
   * indicator's own scale (|last − first| ÷ largest absolute value). This is
   * unit-free, so it ranks change comparably across ppm, dollars, and hectares;
   * a value near 1 means it moved by roughly its whole magnitude.
   */
  changeMagnitude: number;
};

/** Derive a simple, honest trend from a sign's historical series. */
export function vitalSignTrend(sign: EarthVitalSign): VitalSignTrend | null {
  const points = sign.historicalData?.points;
  if (!points || points.length < 2) {
    return null;
  }

  const first = points[0];
  const last = points[points.length - 1];
  const values = points.map((point) => point.value);
  const span = Math.max(...values) - Math.min(...values) || 1;
  const scale = Math.max(...values.map((value) => Math.abs(value)), 1e-9);
  const delta = last.value - first.value;
  const direction: VitalSignTrend["direction"] =
    Math.abs(delta) < span * 0.02 ? "flat" : delta > 0 ? "rising" : "falling";

  const projection = sign.historicalData?.projection;

  return {
    direction,
    first,
    last,
    projectedTo: projection?.[projection.length - 1],
    changeMagnitude: Math.abs(delta) / scale,
  };
}

/** All distinct sources cited across the vital signs, for a footer credit row. */
export const vitalSignSources = Array.from(
  new Map(
    earthVitalSigns.map((sign) => [sign.sourceHref, { label: sign.source, href: sign.sourceHref }]),
  ).values(),
);

/** Full historical + projected year span covered by the dataset. */
export const vitalSignYearSpan = (() => {
  const years = earthVitalSigns.flatMap((sign) => [
    ...(sign.historicalData?.points ?? []),
    ...(sign.historicalData?.projection ?? []),
  ].map((point) => point.year));

  return { min: Math.min(...years), max: Math.max(...years) };
})();

export const earthVitalSignHighlights = earthVitalSigns.flatMap((sign) =>
  (sign.earthSystemLinks ?? []).map((label) => ({
    color: sign.accent,
    label,
  })),
);
