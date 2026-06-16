"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Billboard, Line, OrbitControls, Stars, Text } from "@react-three/drei";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

const physicalCenter = new THREE.Vector3(-1.9, -0.08, 0);
const digitalCenter = new THREE.Vector3(1.9, -0.08, 0);
const metaCenter = new THREE.Vector3(0, -0.08, 0);
const digitalNetworkRadius = 1.16;
const maxPanTargetRadius = 0.9;
const labelFont = "/fonts/geist-regular.ttf";
const earthLabelFont = "/fonts/geist-semibold.ttf";
const earthViewUrl = "https://earthview3d.vercel.app/";
const defaultOrbitTuning = {
  tilt: 0.2,
  yOffset: -1.64,
};

type ArcPath = {
  curve: THREE.CatmullRomCurve3;
  points: THREE.Vector3[];
  color: string;
};

type DataCenterSite = {
  name: string;
  lat: number;
  lon: number;
};

type ConceptNode = {
  color?: string;
  href?: string;
  label: string;
  level: number;
};

type ConceptHighlight = {
  color: string;
  labels: string[];
};

type HumanPlatformBridge = {
  color: string;
  digitalHighlights: string[];
  earthHighlights: string[];
  href: string;
  id: "salus" | "societas" | "terra";
  subtitle: string;
  title: string;
};

type PopoutSide = "left" | "right";

type BridgeConnectorAnchor = {
  color: string;
  id: HumanPlatformBridge["id"];
  leftX: number;
  leftSourceX: number;
  leftSourceY: number;
  rightX: number;
  rightSourceX: number;
  rightSourceY: number;
  y: number;
};

type DataIndexEntry = {
  name: string;
  href: string;
};

type DataIndexCategory = {
  color: string;
  name: string;
  entries: DataIndexEntry[];
};

type TimeZoneOption = {
  label: string;
  value: string;
};

type EarthVitalSign = {
  accent: string;
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
  historicalData?: {
    points: { year: number; value: number }[];
    projection?: { year: number; value: number }[];
    unit: string;
  };
};

const timeZoneOptions: TimeZoneOption[] = [
  { label: "New York", value: "America/New_York" },
  { label: "Los Angeles", value: "America/Los_Angeles" },
  { label: "UTC", value: "UTC" },
  { label: "London", value: "Europe/London" },
  { label: "Paris", value: "Europe/Paris" },
  { label: "Sao Paulo", value: "America/Sao_Paulo" },
  { label: "Singapore", value: "Asia/Singapore" },
  { label: "Tokyo", value: "Asia/Tokyo" },
  { label: "Sydney", value: "Australia/Sydney" },
];

function formatClockTime(date: Date | null, timeZone: string) {
  if (!date) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone,
    timeZoneName: "short",
  }).format(date);
}

function formatClockDate(date: Date | null, timeZone: string) {
  if (!date) {
    return "---, -- ---";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    timeZone,
    weekday: "short",
  }).format(date);
}

const dataCenterSites: DataCenterSite[] = [
  { name: "Northern Virginia", lat: 39.04, lon: -77.49 },
  { name: "Dallas", lat: 32.78, lon: -96.8 },
  { name: "Silicon Valley", lat: 37.39, lon: -122.08 },
  { name: "Sao Paulo", lat: -23.55, lon: -46.63 },
  { name: "Dublin", lat: 53.35, lon: -6.26 },
  { name: "Frankfurt", lat: 50.11, lon: 8.68 },
  { name: "Mumbai", lat: 19.07, lon: 72.88 },
  { name: "Singapore", lat: 1.35, lon: 103.82 },
  { name: "Tokyo", lat: 35.68, lon: 139.76 },
  { name: "Sydney", lat: -33.87, lon: 151.21 },
];

const earthSystemNodes: ConceptNode[] = [
  { label: "Microsystems", level: 0 },
  { label: "Nanosystems", level: 1 },
  { label: "Elementary Particles", level: 2 },
  { label: "Atoms", level: 2 },
  { label: "Molecules", level: 2 },
  { label: "Microsystems", level: 1 },
  { label: "Cells", level: 2 },
  { label: "Microbes", level: 2 },
  { label: "Bacteria", level: 2 },
  { label: "Viruses", level: 2 },
  { label: "Mesosystems", level: 0 },
  { label: "Multicellular Life Forms", level: 1 },
  { label: "Mammals", level: 2 },
  { label: "Homo sapiens", level: 3 },
  { label: "Macrosystems", level: 0 },
  { label: "Nations", level: 1 },
  { label: "Legal System", level: 1 },
  { label: "Economic System", level: 1 },
  { label: "Healthcare System", level: 1 },
  { label: "People", level: 1 },
  { label: "Technology", level: 1 },
  { label: "Information Systems", level: 1 },
  { label: "Data Centers", level: 2, color: "#57a6ff" },
  { label: "Buildings", level: 1 },
  { label: "Transportation, Pipes, & Cables", level: 1 },
  { label: "Business & Industrial System", level: 1 },
  { label: "Financial System", level: 1 },
  { label: "Agricultural Systems", level: 1 },
  { label: "Energy Generation System", level: 1 },
  { label: "Waste Management System", level: 1 },
  { label: "Megasystems", level: 0 },
  { label: "The Sun", level: 1 },
  { label: "Atmosphere", level: 1 },
  { label: "Climate System", level: 1 },
  { label: "Freshwater", level: 1 },
  { label: "Fossil Fuels", level: 1 },
  { label: "Anthropogenic Waste", level: 1 },
  { label: "Soil System", level: 1 },
  { label: "Ecosystems", level: 1 },
  { label: "Biosphere", level: 1 },
  { label: "Hydrosphere", level: 1 },
  { label: "Geosphere", level: 1 },
];

const earthVitalSigns: EarthVitalSign[] = [
  {
    accent: "#facc15",
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
    accent: "#fb923c",
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
    accent: "#86efac",
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
    accent: "#fbbf24",
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
    accent: "#06b6d4",
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
    accent: "#c084fc",
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
    accent: "#fb7185",
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
    accent: "#a3e635",
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
    accent: "#f97316",
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
    accent: "#38bdf8",
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
    accent: "#a78bfa",
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
    accent: "#22d3ee",
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
    accent: "#60a5fa",
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
    accent: "#93c5fd",
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
    accent: "#34d399",
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
    accent: "#bef264",
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

const humanPlatformBridges: HumanPlatformBridge[] = [
  {
    id: "salus",
    title: "Sapiens Scientia Salus",
    subtitle: "Human Health Platform",
    href: "/platforms/salus",
    color: "#38bdf8",
    earthHighlights: ["Cells", "Microbes", "Bacteria", "Viruses", "Healthcare System", "People", "Homo sapiens"],
    digitalHighlights: ["Life Sciences", "Databases", "Knowledge Graphs", "Decision Support"],
  },
  {
    id: "societas",
    title: "Sapiens Scientia Societas",
    subtitle: "Human Society Platform",
    href: "/platforms/societas",
    color: "#818cf8",
    earthHighlights: [
      "Nations",
      "Legal System",
      "Economic System",
      "Healthcare System",
      "People",
      "Technology",
      "Information Systems",
      "Data Centers",
      "Buildings",
      "Transportation, Pipes, & Cables",
      "Business & Industrial System",
      "Financial System",
      "Agricultural Systems",
      "Energy Generation System",
      "Waste Management System",
    ],
    digitalHighlights: ["Public Data", "Platforms", "Law & Patents", "General Knowledge"],
  },
  {
    id: "terra",
    title: "Sapiens Scientia Terra",
    subtitle: "Environmental Platform",
    href: "/platforms/terra",
    color: "#34d399",
    earthHighlights: [
      "The Sun",
      "Atmosphere",
      "Climate System",
      "Freshwater",
      "Fossil Fuels",
      "Anthropogenic Waste",
      "Soil System",
      "Ecosystems",
      "Biosphere",
      "Hydrosphere",
      "Geosphere",
    ],
    digitalHighlights: ["Public Data", "Digital Twins", "Simulation Models", "Sensor Networks"],
  },
];

const digitalSystemNodes: ConceptNode[] = [
  { label: "Computational Systems", level: 0 },
  { label: "Cloud Infrastructure", level: 1 },
  { label: "Data Centers", level: 1, color: "#57a6ff" },
  { label: "Edge Computing", level: 1 },
  { label: "Device Networks", level: 1 },
  { label: "Communication Systems", level: 0 },
  { label: "Internet Backbone", level: 1 },
  { label: "Wireless Networks", level: 1 },
  { label: "Satellite Networks", level: 1 },
  { label: "Sensor Networks", level: 1 },
  { label: "Data Systems", level: 0 },
  { label: "Knowledge Graphs", level: 1 },
  { label: "Databases", level: 1, href: "https://www.sapiensscientia.com/projects/sapiens-scientia-data-index" },
  { label: "General Knowledge", level: 2, color: "#2dd4bf" },
  { label: "Scholarly Indexes", level: 2, color: "#7dd3fc" },
  { label: "Life Sciences", level: 2, color: "#34d399" },
  { label: "Physical Sciences", level: 2, color: "#a78bfa" },
  { label: "Books & Archives", level: 2, color: "#fbbf24" },
  { label: "Law & Patents", level: 2, color: "#fb7185" },
  { label: "Public Data", level: 2, color: "#22d3ee" },
  { label: "Platforms", level: 2, color: "#f472b6" },
  { label: "Registries", level: 2, color: "#c4b5fd" },
  { label: "Data Pipelines", level: 1 },
  { label: "Digital Twins", level: 1 },
  { label: "Intelligence Systems", level: 0 },
  { label: "Machine Learning", level: 1 },
  { label: "Simulation Models", level: 1 },
  { label: "Decision Support", level: 1 },
  { label: "Autonomous Agents", level: 1 },
];

const dataIndexCategories: DataIndexCategory[] = [
  {
    name: "General Knowledge",
    color: "#2dd4bf",
    entries: [
      { name: "Wikipedia", href: "https://www.wikipedia.org/" },
      { name: "Wikidata", href: "https://www.wikidata.org/" },
      { name: "Internet Archive", href: "https://archive.org/" },
      { name: "Common Crawl", href: "https://commoncrawl.org/" },
      { name: "Library of Congress", href: "https://www.loc.gov/" },
    ],
  },
  {
    name: "Scholarly Indexes",
    color: "#7dd3fc",
    entries: [
      { name: "Google Scholar", href: "https://scholar.google.com/" },
      { name: "OpenAlex", href: "https://openalex.org/" },
      { name: "Semantic Scholar", href: "https://www.semanticscholar.org/" },
      { name: "Crossref", href: "https://www.crossref.org/" },
      { name: "Scopus", href: "https://www.scopus.com/" },
      { name: "Web of Science", href: "https://www.webofscience.com/" },
      { name: "Dimensions", href: "https://www.dimensions.ai/" },
      { name: "The Lens", href: "https://www.lens.org/" },
    ],
  },
  {
    name: "Life Sciences",
    color: "#34d399",
    entries: [
      { name: "PubMed", href: "https://pubmed.ncbi.nlm.nih.gov/" },
      { name: "PubMed Central", href: "https://pmc.ncbi.nlm.nih.gov/" },
      { name: "Europe PMC", href: "https://europepmc.org/" },
      { name: "ClinicalTrials.gov", href: "https://clinicaltrials.gov/" },
      { name: "GenBank", href: "https://www.ncbi.nlm.nih.gov/genbank/" },
      { name: "UniProt", href: "https://www.uniprot.org/" },
      { name: "RCSB PDB", href: "https://www.rcsb.org/" },
      { name: "Ensembl", href: "https://www.ensembl.org/" },
    ],
  },
  {
    name: "Physical Sciences",
    color: "#a78bfa",
    entries: [
      { name: "arXiv", href: "https://arxiv.org/" },
      { name: "INSPIRE HEP", href: "https://inspirehep.net/" },
      { name: "NASA ADS", href: "https://ui.adsabs.harvard.edu/" },
    ],
  },
  {
    name: "Books & Archives",
    color: "#fbbf24",
    entries: [
      { name: "WorldCat", href: "https://www.worldcat.org/" },
      { name: "Google Books", href: "https://books.google.com/" },
      { name: "HathiTrust", href: "https://www.hathitrust.org/" },
      { name: "JSTOR", href: "https://www.jstor.org/" },
      { name: "ProQuest", href: "https://www.proquest.com/" },
      { name: "EBSCOhost", href: "https://www.ebsco.com/products/ebscohost-platform" },
    ],
  },
  {
    name: "Law & Patents",
    color: "#fb7185",
    entries: [
      { name: "LexisNexis", href: "https://www.lexisnexis.com/" },
      { name: "Westlaw", href: "https://legal.thomsonreuters.com/en/products/westlaw" },
      { name: "GovInfo", href: "https://www.govinfo.gov/" },
      { name: "EUR-Lex", href: "https://eur-lex.europa.eu/" },
      { name: "CourtListener", href: "https://www.courtlistener.com/" },
      { name: "Espacenet", href: "https://worldwide.espacenet.com/" },
      { name: "Google Patents", href: "https://patents.google.com/" },
      { name: "Derwent Innovation", href: "https://clarivate.com/products/derwent/" },
    ],
  },
  {
    name: "Public Data",
    color: "#22d3ee",
    entries: [
      { name: "World Bank Data", href: "https://data.worldbank.org/" },
      { name: "OECD Data", href: "https://data.oecd.org/" },
      { name: "FRED", href: "https://fred.stlouisfed.org/" },
      { name: "Data.gov", href: "https://data.gov/" },
      { name: "Kaggle Datasets", href: "https://www.kaggle.com/datasets" },
      { name: "GDELT", href: "https://www.gdeltproject.org/" },
    ],
  },
  {
    name: "Platforms",
    color: "#f472b6",
    entries: [
      { name: "YouTube", href: "https://www.youtube.com/" },
      { name: "X", href: "https://x.com/" },
      { name: "Reddit", href: "https://www.reddit.com/" },
      { name: "Stack Exchange", href: "https://stackexchange.com/" },
    ],
  },
  {
    name: "Registries",
    color: "#c4b5fd",
    entries: [
      { name: "re3data", href: "https://www.re3data.org/" },
      { name: "OpenDOAR", href: "https://opendoar.ac.uk/" },
      { name: "FAIRsharing", href: "https://fairsharing.org/" },
      { name: "DataCite Repository Finder", href: "https://support.datacite.org/docs/repository-finder" },
    ],
  },
];

const dataIndexEntries = dataIndexCategories.flatMap((category) =>
  category.entries.map((entry, entryIndex) => ({
    ...entry,
    category: category.name,
    color: category.color,
    entryIndex,
    entryTotal: category.entries.length,
  })),
);

const earthVitalSignHighlights = earthVitalSigns.flatMap((sign) =>
  (sign.earthSystemLinks ?? []).map((label) => ({
    color: sign.accent,
    label,
  })),
);

const digitalDataIndexHighlights: ConceptHighlight[] = [
  { color: "#22d3ee", labels: ["Databases", "Public Data"] },
  { color: "#2dd4bf", labels: ["General Knowledge"] },
  { color: "#7dd3fc", labels: ["Scholarly Indexes"] },
  { color: "#34d399", labels: ["Life Sciences"] },
  { color: "#a78bfa", labels: ["Physical Sciences"] },
  { color: "#fbbf24", labels: ["Books & Archives"] },
  { color: "#fb7185", labels: ["Law & Patents"] },
  { color: "#f472b6", labels: ["Platforms"] },
  { color: "#c4b5fd", labels: ["Registries"] },
];

function platformBridgeHighlights(
  activeBridge: HumanPlatformBridge | null,
  side: "earth" | "digital",
): ConceptHighlight[] {
  if (!activeBridge) {
    return [];
  }

  return [
    {
      color: activeBridge.color,
      labels: side === "earth" ? activeBridge.earthHighlights : activeBridge.digitalHighlights,
    },
  ];
}

function stopPanelScrollPropagation(event: React.WheelEvent<HTMLElement> | React.TouchEvent<HTMLElement>) {
  event.stopPropagation();
}

function useManualPanelWheel<TElement extends HTMLElement>() {
  const panelRef = useRef<TElement>(null);

  const handlePanelWheel = (event: React.WheelEvent<TElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const deltaScale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? panel.clientHeight : 1;
    panel.scrollTop += event.deltaY * deltaScale;
  };

  return { handlePanelWheel, panelRef };
}

function seededRandom(seed: number) {
  let value = seed;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function spherePoint(index: number, count: number, radius: number) {
  const phi = Math.acos(1 - (2 * index + 1) / count);
  const theta = Math.PI * (1 + Math.sqrt(5)) * index;

  return new THREE.Vector3(
    Math.cos(theta) * Math.sin(phi) * radius,
    Math.cos(phi) * radius,
    Math.sin(theta) * Math.sin(phi) * radius,
  );
}

function clusteredSpherePoint({
  categoryIndex,
  categoryTotal,
  entryIndex,
  entryTotal,
  radius,
}: {
  categoryIndex: number;
  categoryTotal: number;
  entryIndex: number;
  entryTotal: number;
  radius: number;
}) {
  const categoryAngle = (Math.PI * 2 * categoryIndex) / categoryTotal + 0.28;
  const latitudeBand = [-0.42, 0.18, -0.18][categoryIndex % 3];
  const clusterCenter = new THREE.Vector3(
    Math.cos(categoryAngle) * Math.sqrt(1 - latitudeBand * latitudeBand),
    latitudeBand,
    Math.sin(categoryAngle) * Math.sqrt(1 - latitudeBand * latitudeBand),
  ).normalize();
  const up = Math.abs(clusterCenter.y) > 0.86 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const tangentA = new THREE.Vector3().crossVectors(up, clusterCenter).normalize();
  const tangentB = new THREE.Vector3().crossVectors(clusterCenter, tangentA).normalize();
  const angle = (Math.PI * 2 * entryIndex) / entryTotal + categoryIndex * 0.42;
  const ring = entryTotal > 5 && entryIndex % 2 === 0 ? 0.31 : 0.22;
  const offset = tangentA
    .clone()
    .multiplyScalar(Math.cos(angle) * ring)
    .add(tangentB.clone().multiplyScalar(Math.sin(angle) * ring));
  const point = clusterCenter.add(offset).normalize();

  point.y = THREE.MathUtils.clamp(point.y, -0.68, 0.68);

  return point.normalize().multiplyScalar(radius);
}

function latLonToSpherePoint(lat: number, lon: number, radius: number) {
  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon + 90);
  const horizontalRadius = Math.cos(latRad) * radius;

  return new THREE.Vector3(
    Math.sin(lonRad) * horizontalRadius,
    Math.sin(latRad) * radius,
    Math.cos(lonRad) * horizontalRadius,
  );
}

function DataCenterMarker({
  site,
}: {
  site: DataCenterSite;
}) {
  const markerRef = useRef<THREE.Mesh>(null);
  const surfacePoint = useMemo(() => latLonToSpherePoint(site.lat, site.lon, 1.105), [site.lat, site.lon]);

  useFrame(({ clock }) => {
    if (!markerRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(clock.getElapsedTime() * 3.2 + site.lon * 0.04) * 0.22;
    markerRef.current.scale.setScalar(pulse);
  });

  return (
    <mesh ref={markerRef} position={surfacePoint}>
      <sphereGeometry args={[0.032, 18, 18]} />
      <meshBasicMaterial color="#57a6ff" transparent opacity={0.95} />
    </mesh>
  );
}

function DataCenterMarkers() {
  return (
    <group>
      {dataCenterSites.map((site) => (
        <DataCenterMarker key={site.name} site={site} />
      ))}
    </group>
  );
}

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const seasonLabels = [
  { label: "Winter", monthIndex: 0 },
  { label: "Spring", monthIndex: 3 },
  { label: "Summer", monthIndex: 6 },
  { label: "Autumn", monthIndex: 9 },
];

const solarEventMarkers = [
  { label: "Mar Equinox", progress: (2 + 19 / 31) / 12 },
  { label: "Jun Solstice", progress: (5 + 20 / 30) / 12 },
  { label: "Sep Equinox", progress: (8 + 22 / 30) / 12 },
  { label: "Dec Solstice", progress: (11 + 20 / 31) / 12 },
];

function orbitPosition(progress: number, radius: number, yOffset = 0) {
  const angle = -progress * Math.PI * 2;

  return new THREE.Vector3(
    Math.sin(angle) * radius,
    yOffset,
    -Math.cos(angle) * radius,
  );
}

function yearProgress(date: Date) {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();

  return (date.getTime() - start) / (end - start);
}

function EarthSunOrbitModel({
  position = [0, -1.2, 0.18],
  tilt = defaultOrbitTuning.tilt,
  theme = "dark",
}: {
  position?: [number, number, number];
  tilt?: number;
  theme?: "dark" | "light";
}) {
  const [now, setNow] = useState(() => new Date());
  const orbitRadius = 0.76;
  const orbitPoints = useMemo(
    () =>
      Array.from({ length: 97 }, (_, index) => {
        const point = orbitPosition(index / 96, orbitRadius);

        return [point.x, point.y, point.z] as [number, number, number];
      }),
    [],
  );
  const earthPosition = useMemo(
    () => orbitPosition(yearProgress(now), orbitRadius, 0.006),
    [now],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 60 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <group position={position}>
      <group rotation={[tilt, 0, 0]}>
        <Line points={orbitPoints} color="#9cc8ff" lineWidth={1.85} transparent opacity={0.5} />
        <mesh>
          <sphereGeometry args={[0.045, 24, 24]} />
          <meshBasicMaterial color="#facc15" transparent opacity={0.95} />
        </mesh>
        <Billboard position={[0, -0.13, 0.01]} follow lockX={false} lockY={false} lockZ={false}>
          <Text
            anchorX="center"
            anchorY="middle"
            color={theme === "light" ? "#b45309" : "#fde68a"}
            font={labelFont}
            fontSize={0.06}
            fontWeight={300}
            outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
            outlineWidth={0.008}
            renderOrder={40}
          >
            Sun
          </Text>
        </Billboard>
        {monthLabels.map((label, index) => {
          const innerPoint = orbitPosition(index / 12, orbitRadius - 0.046, 0.012);
          const outerPoint = orbitPosition(index / 12, orbitRadius + 0.046, 0.012);
          const labelPoint = orbitPosition(index / 12, orbitRadius + 0.13, 0.018);

          return (
            <group key={label}>
              <Line
                points={[
                  [innerPoint.x, innerPoint.y, innerPoint.z],
                  [outerPoint.x, outerPoint.y, outerPoint.z],
                ]}
                color="#d8eeff"
                lineWidth={1.25}
                transparent
                opacity={0.76}
              />
              <Billboard position={labelPoint} follow lockX={false} lockY={false} lockZ={false}>
                <Text
                  anchorX="center"
                  anchorY="middle"
                  color={theme === "light" ? "#1c1917" : "#d8eeff"}
                  font={labelFont}
                  fontSize={0.052}
                  fontWeight={300}
                  outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
                  outlineWidth={0.007}
                  renderOrder={42}
                >
                  {label}
                </Text>
              </Billboard>
            </group>
          );
        })}
        {seasonLabels.map((season) => {
          const point = orbitPosition((season.monthIndex + 0.5) / 12, orbitRadius + 0.3, 0.02);

          return (
            <Billboard key={season.label} position={point} follow lockX={false} lockY={false} lockZ={false}>
              <Text
                anchorX="center"
                anchorY="middle"
                color={theme === "light" ? "#0284c7" : "#93c5fd"}
                font={labelFont}
                fontSize={0.058}
                fontWeight={300}
                outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
                outlineWidth={0.008}
                renderOrder={43}
              >
                {season.label}
              </Text>
            </Billboard>
          );
        })}
        {solarEventMarkers.map((marker) => {
          const point = orbitPosition(marker.progress, orbitRadius, 0.026);
          const labelPoint = orbitPosition(marker.progress, orbitRadius + 0.2, 0.034);

          return (
            <group key={marker.label}>
              <mesh position={point} renderOrder={44}>
                <sphereGeometry args={[0.019, 14, 14]} />
                <meshBasicMaterial color="#fef3c7" transparent opacity={0.92} depthWrite={false} />
              </mesh>
              <Billboard position={labelPoint} follow lockX={false} lockY={false} lockZ={false}>
                <Text
                  anchorX="center"
                  anchorY="middle"
                  color={theme === "light" ? "#b45309" : "#fef3c7"}
                  font={labelFont}
                  fontSize={0.052}
                  fontWeight={300}
                  outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
                  outlineWidth={0.008}
                  renderOrder={44}
                >
                  {marker.label}
                </Text>
              </Billboard>
            </group>
          );
        })}
        <mesh position={earthPosition} renderOrder={44}>
          <sphereGeometry args={[0.038, 22, 22]} />
          <meshBasicMaterial color="#57a6ff" transparent opacity={0.98} depthWrite={false} />
        </mesh>
        <Billboard
          position={[earthPosition.x, earthPosition.y + 0.105, earthPosition.z + 0.012]}
          follow
          lockX={false}
          lockY={false}
          lockZ={false}
        >
          <Text
            anchorX="center"
            anchorY="middle"
            color={theme === "light" ? "#0284c7" : "#ffffff"}
            font={labelFont}
            fontSize={0.062}
            fontWeight={300}
            outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
            outlineWidth={0.008}
            renderOrder={45}
          >
            Earth now
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

function PhysicalEarth({
  isInteractive,
  targetPosition,
}: {
  isInteractive: boolean;
  targetPosition: THREE.Vector3;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const earthRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const hasPositionedRef = useRef(false);
  const loadedTexture = useLoader(THREE.TextureLoader, "/textures/earth-blue-marble.jpg");
  const texture = useMemo(() => {
    const clonedTexture = loadedTexture.clone();
    clonedTexture.colorSpace = THREE.SRGBColorSpace;
    clonedTexture.anisotropy = 8;
    clonedTexture.needsUpdate = true;

    return clonedTexture;
  }, [loadedTexture]);

  const openEarthView = () => {
    window.open(earthViewUrl, "_blank", "noopener,noreferrer");
  };

  useFrame((_, delta) => {
    if (groupRef.current) {
      if (!hasPositionedRef.current) {
        groupRef.current.position.copy(targetPosition);
        hasPositionedRef.current = true;
      }

      groupRef.current.position.lerp(targetPosition, 1 - Math.pow(0.0008, delta));
    }

    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.12;
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y -= delta * 0.04;
    }
  });

  return (
    <group
      ref={groupRef}
      onClick={isInteractive ? (event) => {
        event.stopPropagation();
        openEarthView();
      } : undefined}
      onPointerOver={() => {
        if (isInteractive) {
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <group ref={earthRef}>
        <mesh>
          <sphereGeometry args={[1.08, 96, 96]} />
          <meshStandardMaterial map={texture} roughness={0.85} metalness={0.02} />
        </mesh>
        <DataCenterMarkers />
      </group>
      <mesh ref={atmosphereRef} scale={1.04}>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshBasicMaterial color="#77b9ff" transparent opacity={0.12} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

function DigitalEarth({
  isInteractive,
  targetPosition,
  theme = "dark",
}: {
  isInteractive: boolean;
  targetPosition: THREE.Vector3;
  theme?: "dark" | "light";
}) {
  const groupRef = useRef<THREE.Group>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const networkRef = useRef<THREE.Group>(null);
  const hasPositionedRef = useRef(false);

  const { nodePositions, linkPositions } = useMemo(() => {
    const nodes: number[] = [];
    const links: number[] = [];
    const count = 190;
    const nodeVectors = Array.from({ length: count }, (_, index) =>
      spherePoint(index, count, digitalNetworkRadius),
    );

    nodeVectors.forEach((point) => nodes.push(point.x, point.y, point.z));

    nodeVectors.forEach((point, index) => {
      const next = nodeVectors[(index + 9) % count];
      const near = nodeVectors[(index + 21) % count];

      if (index % 3 !== 0) {
        links.push(point.x, point.y, point.z, next.x, next.y, next.z);
      }

      if (index % 8 === 0) {
        links.push(point.x, point.y, point.z, near.x, near.y, near.z);
      }
    });

    return {
      nodePositions: new Float32Array(nodes),
      linkPositions: new Float32Array(links),
    };
  }, []);

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      if (!hasPositionedRef.current) {
        groupRef.current.position.copy(targetPosition);
        hasPositionedRef.current = true;
      }

      groupRef.current.position.lerp(targetPosition, 1 - Math.pow(0.0008, delta));
    }

    if (shellRef.current) {
      shellRef.current.rotation.y += delta * 0.08;
      shellRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.35) * 0.04;
    }

    if (networkRef.current) {
      networkRef.current.rotation.y -= delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={shellRef}>
        <sphereGeometry args={[1.12, 96, 96]} />
        <meshPhysicalMaterial
          color={theme === "light" ? "#93c5fd" : "#1d76ff"}
          roughness={0.28}
          metalness={0.12}
          transmission={0.25}
          thickness={0.9}
          transparent
          opacity={theme === "light" ? 0.42 : 0.22}
          side={THREE.DoubleSide}
          depthTest
          depthWrite
        />
      </mesh>
      <mesh scale={1.045}>
        <sphereGeometry args={[1.12, 32, 32]} />
        <meshBasicMaterial color={theme === "light" ? "#38bdf8" : "#62c7ff"} wireframe transparent opacity={0.16} depthTest depthWrite={false} />
      </mesh>
      <group ref={networkRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[nodePositions, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color={theme === "light" ? "#0284c7" : "#b8ecff"}
            size={0.074}
            sizeAttenuation
            transparent
            opacity={1}
            depthTest
            depthWrite={false}
          />
        </points>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linkPositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={theme === "light" ? "#0ea5e9" : "#2fe3ff"} transparent opacity={0.38} depthTest depthWrite={false} />
        </lineSegments>
        <DataIndexSurfaceNodes isInteractive={isInteractive} theme={theme} />
        <FeaturedDigitalNode isInteractive={isInteractive} />
      </group>
    </group>
  );
}

function DataIndexSurfaceNodes({ 
  isInteractive, 
  theme = "dark" 
}: { 
  isInteractive: boolean; 
  theme?: "dark" | "light"; 
}) {
  const surfaceNodes = useMemo(
    () => {
      const categoryIndexLookup = new Map(
        dataIndexCategories.map((category, categoryIndex) => [category.name, categoryIndex]),
      );

      return dataIndexEntries.map((entry) => {
        const categoryIndex = categoryIndexLookup.get(entry.category) ?? 0;
        const position = clusteredSpherePoint({
          categoryIndex,
          categoryTotal: dataIndexCategories.length,
          entryIndex: entry.entryIndex,
          entryTotal: entry.entryTotal,
          radius: 1.21,
        });

        return {
          ...entry,
          position: [position.x, position.y, position.z] as [number, number, number],
        };
      });
    },
    [],
  );

  return (
    <group>
      {surfaceNodes.map((entry) => (
        <DataIndexSurfaceNode
          key={`${entry.category}-${entry.name}`}
          color={entry.color}
          href={entry.href}
          isInteractive={isInteractive}
          name={entry.name}
          position={entry.position}
          theme={theme}
        />
      ))}
    </group>
  );
}

function DataIndexSurfaceNode({
  color,
  href,
  isInteractive,
  name,
  position,
  theme = "dark",
}: {
  color: string;
  href: string;
  isInteractive: boolean;
  name: string;
  position: [number, number, number];
  theme?: "dark" | "light";
}) {
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Mesh>(null);
  const labelFrame = useMemo(() => {
    const normal = new THREE.Vector3(...position).normalize();
    const worldUp = new THREE.Vector3(0, 1, 0);
    const fallbackTangent = new THREE.Vector3(1, 0, 0);
    const tangentX = new THREE.Vector3().crossVectors(worldUp, normal);

    if (tangentX.lengthSq() < 0.0001) {
      tangentX.copy(fallbackTangent);
    } else {
      tangentX.normalize();
    }

    const tangentY = new THREE.Vector3().crossVectors(normal, tangentX).normalize();
    const matrix = new THREE.Matrix4().makeBasis(tangentX, tangentY, normal);
    const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);
    const labelPosition = normal.multiplyScalar(0.17).add(tangentY.multiplyScalar(0.1));

    return {
      position: [labelPosition.x, labelPosition.y, labelPosition.z] as [number, number, number],
      quaternion,
    };
  }, [position]);

  useFrame(({ clock }) => {
    if (nodeRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 2.8 + position[0] * 2.1) * 0.12;
      nodeRef.current.scale.setScalar(isHovered ? pulse * 1.65 : pulse);
    }

    const material = labelRef.current?.material;

    if (material && !Array.isArray(material)) {
      material.depthTest = true;
      material.depthWrite = false;
      material.needsUpdate = true;
    }
  });

  const openSource = (event: { stopPropagation: () => void }) => {
    if (!isInteractive) {
      return;
    }

    event.stopPropagation();
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <group
      position={position}
      onClick={isInteractive ? openSource : undefined}
      onPointerDown={isInteractive ? openSource : undefined}
      onPointerOver={(event) => {
        if (!isInteractive) {
          return;
        }

        event.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setIsHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <mesh>
        <sphereGeometry args={[0.075, 18, 18]} />
        <meshBasicMaterial transparent opacity={0} depthTest depthWrite={false} />
      </mesh>
      <mesh ref={nodeRef} renderOrder={22}>
        <sphereGeometry args={[0.034, 22, 22]} />
        <meshBasicMaterial color={color} transparent opacity={0.96} depthTest depthWrite={false} />
      </mesh>
      <mesh renderOrder={21}>
        <sphereGeometry args={[0.062, 22, 22]} />
        <meshBasicMaterial color={color} transparent opacity={isHovered ? 0.3 : 0.13} depthTest depthWrite={false} />
      </mesh>
      <group position={labelFrame.position} quaternion={labelFrame.quaternion}>
        <Text
          ref={labelRef}
          anchorX="center"
          anchorY="middle"
          color={theme === "light" ? "#1c1917" : "#ffffff"}
          font={labelFont}
          fontSize={isHovered ? 0.086 : 0.069}
          fontWeight={300}
          outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
          outlineWidth={0.008}
          renderOrder={55}
        >
          {name}
        </Text>
      </group>
    </group>
  );
}

function FeaturedDigitalNode({ isInteractive }: { isInteractive: boolean }) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<THREE.Mesh>(null);
  const labelRef = useRef<THREE.Mesh>(null);
  const position: [number, number, number] = [0, 1.21, 0];

  useFrame(({ clock }) => {
    if (!nodeRef.current) {
      return;
    }

    const pulse = 1 + Math.sin(clock.getElapsedTime() * 3.4) * 0.16;
    nodeRef.current.scale.setScalar(isHovered ? pulse * 1.65 : pulse);

    const material = labelRef.current?.material;

    if (material && !Array.isArray(material)) {
      material.depthTest = true;
      material.depthWrite = false;
      material.needsUpdate = true;
    }
  });

  const openProjects = () => {
    router.push("/projects");
  };

  const handleActivate = (event: { stopPropagation: () => void }) => {
    if (!isInteractive) {
      return;
    }

    event.stopPropagation();
    openProjects();
  };

  return (
    <group
      position={position}
      onClick={isInteractive ? handleActivate : undefined}
      onPointerDown={isInteractive ? handleActivate : undefined}
      onPointerOver={(event) => {
        if (!isInteractive) {
          return;
        }

        event.stopPropagation();
        setIsHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setIsHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <mesh>
        <sphereGeometry args={[0.12, 24, 24]} />
        <meshBasicMaterial transparent opacity={0} depthTest depthWrite={false} />
      </mesh>
      <mesh ref={nodeRef} renderOrder={20}>
        <sphereGeometry args={[0.082, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.98} depthTest depthWrite={false} />
      </mesh>
      <mesh renderOrder={19}>
        <sphereGeometry args={[0.14, 32, 32]} />
        <meshBasicMaterial
          color="#58d7ff"
          transparent
          opacity={isHovered ? 0.3 : 0.18}
          depthTest
          depthWrite={false}
        />
      </mesh>
      <Billboard position={[0, 0.28, 0.08]} follow lockX={false} lockY={false} lockZ={false}>
        <Text
          ref={labelRef}
          anchorX="center"
          anchorY="middle"
          color="#ffffff"
          font={labelFont}
          fontSize={isHovered ? 0.14 : 0.12}
          fontWeight={300}
          renderOrder={50}
          onClick={isInteractive ? handleActivate : undefined}
          onPointerDown={isInteractive ? handleActivate : undefined}
        >
          Sapiens Scientia
        </Text>
      </Billboard>
    </group>
  );
}

function DataConnectors() {
  const pulsesRef = useRef<THREE.Group>(null);

  const arcs = useMemo<ArcPath[]>(() => {
    const random = seededRandom(42);
    const paths: ArcPath[] = [];

    for (let index = 0; index < 18; index += 1) {
      const yOffset = (random() - 0.5) * 1.45;
      const zOffset = (random() - 0.5) * 0.75;
      const start = new THREE.Vector3(
        physicalCenter.x + 1.0,
        physicalCenter.y + yOffset,
        physicalCenter.z + zOffset,
      );
      const end = new THREE.Vector3(
        digitalCenter.x - 1.0,
        digitalCenter.y + yOffset * 0.72,
        digitalCenter.z - zOffset * 0.6,
      );
      const lift = 0.5 + random() * 0.6;
      const middle = new THREE.Vector3(0, yOffset * 0.35 + lift, zOffset * 0.2);
      const curve = new THREE.CatmullRomCurve3([start, middle, end]);

      paths.push({
        curve,
        points: curve.getPoints(64),
        color: index % 3 === 0 ? "#84f3ff" : "#2c8dff",
      });
    }

    return paths;
  }, []);

  useFrame(({ clock }) => {
    if (!pulsesRef.current) {
      return;
    }

    const elapsed = clock.getElapsedTime();

    pulsesRef.current.children.forEach((pulse, index) => {
      const arc = arcs[index % arcs.length];
      const baseProgress = (elapsed * 0.18 + index * 0.075) % 1;
      const progress = index % 2 === 0 ? baseProgress : 1 - baseProgress;
      pulse.position.copy(arc.curve.getPoint(progress));
    });
  });

  return (
    <group>
      {arcs.map((arc, index) => (
        <Line
          key={index}
          points={arc.points}
          color={arc.color}
          lineWidth={index % 4 === 0 ? 1.9 : 1.05}
          transparent
          opacity={index % 4 === 0 ? 0.58 : 0.28}
        />
      ))}
      <group ref={pulsesRef}>
        {arcs.map((arc, index) => (
          <mesh key={index} position={arc.points[0]}>
            <sphereGeometry args={[0.018 + (index % 3) * 0.003, 16, 16]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? "#d8fbff" : "#57a6ff"}
              transparent
              opacity={0.95}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function GlobeLabel({
  children,
  onClick,
  position,
  theme = "dark",
}: {
  children: string;
  onClick?: () => void;
  position: [number, number, number];
  theme?: "dark" | "light";
}) {
  return (
    <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
      <group
        onClick={(event) => {
          if (!onClick) {
            return;
          }

          event.stopPropagation();
          onClick();
        }}
        onPointerOver={() => {
          if (onClick) {
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          if (onClick) {
            document.body.style.cursor = "";
          }
        }}
      >
        <mesh>
          <planeGeometry args={[0.9, 0.22]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <Text
          anchorX="center"
          anchorY="middle"
          color={theme === "light" ? "#1c1917" : "#ffffff"}
          font={earthLabelFont}
          fontSize={0.18}
          fontWeight={700}
          outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
          outlineWidth={0.012}
          renderOrder={10}
        >
          {children}
        </Text>
      </group>
    </Billboard>
  );
}

function MetaEarthLabel({
  isMerged,
  onToggle,
  theme = "dark",
}: {
  isMerged: boolean;
  onToggle: () => void;
  theme?: "dark" | "light";
}) {
  return (
    <Billboard position={[0, metaCenter.y + 1.72, 0.16]} follow lockX={false} lockY={false} lockZ={false}>
      <group
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <mesh>
          <planeGeometry args={[0.75, 0.22]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <Text
          anchorX="center"
          anchorY="middle"
          color={isMerged ? (theme === "light" ? "#0284c7" : "#b8ecff") : (theme === "light" ? "#1c1917" : "#ffffff")}
          font={earthLabelFont}
          fontSize={0.17}
          fontWeight={700}
          outlineColor={theme === "light" ? "#faf8f5" : "#000000"}
          outlineWidth={0.012}
          renderOrder={12}
        >
          Meta Earth
        </Text>
      </group>
    </Billboard>
  );
}

function ConstrainedOrbitControls({ enableZoom }: { enableZoom: boolean }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const panCenter = useMemo(() => metaCenter.clone(), []);
  const panOffsetRef = useRef(new THREE.Vector3());
  const clampedTargetRef = useRef(new THREE.Vector3());
  const excessPanRef = useRef(new THREE.Vector3());

  useFrame(() => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    const panOffset = panOffsetRef.current.copy(controls.target).sub(panCenter);

    if (panOffset.length() <= maxPanTargetRadius) {
      return;
    }

    const clampedTarget = clampedTargetRef.current
      .copy(panOffset)
      .setLength(maxPanTargetRadius)
      .add(panCenter);
    const excessPan = excessPanRef.current.copy(controls.target).sub(clampedTarget);

    controls.target.copy(clampedTarget);
    controls.object.position.sub(excessPan);
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom={enableZoom}
      minDistance={3.4}
      maxDistance={10}
      minPolarAngle={Math.PI / 2.7}
      maxPolarAngle={Math.PI / 1.75}
      panSpeed={0.55}
      rotateSpeed={0.22}
    />
  );
}

function Scene({
  enableZoom,
  isMerged,
  onToggleMerged,
  theme = "dark",
}: {
  enableZoom: boolean;
  isMerged: boolean;
  onToggleMerged: () => void;
  theme?: "dark" | "light";
}) {
  const physicalTarget = isMerged ? metaCenter : physicalCenter;
  const digitalTarget = isMerged ? metaCenter : digitalCenter;

  return (
    <>
      <color attach="background" args={[theme === "light" ? "#faf8f5" : "#000000"]} />
      <ambientLight intensity={theme === "light" ? 1.45 : 0.9} />
      <directionalLight 
        position={[-3, 2.6, 4]} 
        intensity={theme === "light" ? 2.5 : 2.1} 
        color={theme === "light" ? "#ffffff" : "#fff4df"} 
      />
      <pointLight 
        position={[2.9, 1.6, 2.2]} 
        intensity={theme === "light" ? 2.4 : 3.2} 
        color={theme === "light" ? "#0284c7" : "#278aff"} 
      />
      <pointLight 
        position={[0, 1.4, 2.8]} 
        intensity={theme === "light" ? 0.9 : 1.3} 
        color={theme === "light" ? "#0ea5e9" : "#8ff2ff"} 
      />
      {theme === "dark" && (
        <Stars radius={16} depth={24} count={900} factor={2.4} saturation={0} fade speed={0.18} />
      )}
      <PhysicalEarth isInteractive={!isMerged} targetPosition={physicalTarget} />
      <DigitalEarth isInteractive={!isMerged} targetPosition={digitalTarget} theme={theme} />
      {!isMerged && <DataConnectors />}
      <EarthSunOrbitModel
        position={[0, metaCenter.y + defaultOrbitTuning.yOffset, metaCenter.z + 0.18]}
        tilt={defaultOrbitTuning.tilt}
        theme={theme}
      />
      {!isMerged && (
        <>
          <GlobeLabel
            onClick={() => {
              window.open(earthViewUrl, "_blank", "noopener,noreferrer");
            }}
            position={[physicalCenter.x, physicalCenter.y + 1.72, physicalCenter.z + 0.08]}
            theme={theme}
          >
            Physical Earth
          </GlobeLabel>
          <GlobeLabel 
            position={[digitalCenter.x, digitalCenter.y + 1.72, digitalCenter.z + 0.08]}
            theme={theme}
          >
            Digital Earth
          </GlobeLabel>
        </>
      )}
      <MetaEarthLabel isMerged={isMerged} onToggle={onToggleMerged} theme={theme} />
      <ConstrainedOrbitControls enableZoom={enableZoom} />
    </>
  );
}

function ConceptColumn({
  align,
  highlights,
  nodes,
  headerAction,
  headerActionPosition = "after",
  noWrapTitle = false,
  onPanelPointerEnter,
  onPanelPointerLeave,
  panelRef,
  size = "large",
  title,
}: {
  align: "left" | "center" | "right";
  headerAction?: React.ReactNode;
  headerActionPosition?: "before" | "after";
  highlights?: ConceptHighlight[];
  noWrapTitle?: boolean;
  nodes: ConceptNode[];
  onPanelPointerEnter?: () => void;
  onPanelPointerLeave?: () => void;
  panelRef?: RefObject<HTMLElement | null>;
  size?: "large" | "compact";
  title: string;
}) {
  const isRightAligned = align === "right";
  const isCenterAligned = align === "center";
  const highlightLookup = useMemo(() => {
    const lookup = new Map<string, string>();

    highlights?.forEach((highlight) => {
      highlight.labels.forEach((label) => {
        if (!lookup.has(label)) {
          lookup.set(label, highlight.color);
        }
      });
    });

    return lookup;
  }, [highlights]);

  return (
    <aside
      ref={panelRef}
      className={[
        "scrollbar-hidden pointer-events-auto overflow-y-auto overscroll-contain py-4",
        "border border-white/15 bg-black/42 text-white shadow-[0_0_28px_rgba(59,130,246,0.16)] backdrop-blur-sm",
        size === "large" ? "w-64" : "w-72",
        size === "large" ? "h-[72vh] max-lg:h-auto max-lg:max-h-[34vh]" : "max-h-[24vh]",
        "max-lg:w-full max-lg:px-4 max-lg:py-3",
        align === "left" ? "pl-6 pr-4 text-left" : "",
        isRightAligned ? "pl-4 pr-6 text-right max-lg:text-left" : "",
        isCenterAligned ? "px-6 text-center" : "",
      ].join(" ")}
      aria-label={title}
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheelCapture={stopPanelScrollPropagation}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div
        className={[
          "mb-3 flex items-center gap-2",
          isRightAligned ? "justify-end max-lg:justify-start" : "",
          isCenterAligned ? "justify-center" : "",
        ].join(" ")}
      >
        {headerActionPosition === "before" ? headerAction : null}
        <h2
          className={[
            "text-2xl font-semibold leading-none text-white max-lg:text-xl",
            noWrapTitle ? "whitespace-nowrap" : "",
          ].join(" ")}
        >
          {title}
        </h2>
        {headerActionPosition === "after" ? headerAction : null}
      </div>
      <ol className="space-y-1.5">
        {nodes.map((node) => (
          <ConceptColumnNode
            key={`${node.level}-${node.label}`}
            align={align}
            highlightColor={highlightLookup.get(node.label)}
            isCenterAligned={isCenterAligned}
            isRightAligned={isRightAligned}
            node={node}
            size={size}
          />
        ))}
      </ol>
    </aside>
  );
}

function ConceptColumnNode({
  align,
  highlightColor,
  isCenterAligned,
  isRightAligned,
  node,
  size,
}: {
  align: "left" | "center" | "right";
  highlightColor?: string;
  isCenterAligned: boolean;
  isRightAligned: boolean;
  node: ConceptNode;
  size: "large" | "compact";
}) {
  const displayColor = highlightColor ?? node.color;

  return (
    <li
      className={[
        "flex items-baseline gap-2 leading-tight text-slate-100/88 transition-all duration-300",
        size === "compact" && node.level === 0 ? "text-base" : "text-sm",
        highlightColor ? "translate-x-1 text-white" : "",
        isRightAligned ? "justify-end max-lg:justify-start" : "",
        isCenterAligned ? "justify-center" : "",
      ].join(" ")}
      style={{
        paddingLeft: align === "left" ? `${node.level * 0.72}rem` : undefined,
        paddingRight: align === "right" ? `${node.level * 0.72}rem` : undefined,
      }}
    >
      <span
        aria-hidden={!highlightColor}
        className={[
          "mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full transition-opacity duration-300",
          highlightColor ? "opacity-100" : "opacity-0",
        ].join(" ")}
        style={{ backgroundColor: highlightColor, boxShadow: highlightColor ? `0 0 12px ${highlightColor}` : undefined }}
      />
      <span
        className={node.level === 0 ? "font-semibold text-sky-100" : "font-normal"}
        style={{
          color: displayColor,
          textShadow: highlightColor ? `0 0 12px ${highlightColor}` : undefined,
        }}
      >
        {node.href ? (
          <Link
            href={node.href}
            className="text-current underline-offset-4 transition-colors hover:text-white hover:underline focus:outline-none focus-visible:text-white focus-visible:underline"
          >
            {node.label}
          </Link>
        ) : (
          <span>{node.label}</span>
        )}
      </span>
    </li>
  );
}

function PopoutToggleButton({
  controlsId,
  isOpen,
  label,
  side = "right",
  onClick,
}: {
  controlsId: string;
  isOpen: boolean;
  label: string;
  side?: PopoutSide;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={isOpen ? `Hide ${label}` : `Show ${label}`}
      aria-expanded={isOpen}
      aria-controls={controlsId}
      className="grid h-7 w-7 shrink-0 place-items-center border border-blue-300/24 bg-black/54 text-blue-200 shadow-[0_0_18px_rgba(59,130,246,0.16)] transition hover:border-blue-300/50 hover:text-white focus:outline-none focus-visible:border-blue-300/75"
      onClick={onClick}
    >
      <span
        aria-hidden="true"
        className={[
          "text-base leading-none transition-transform duration-200",
          side === "left" ? "rotate-180" : "",
          isOpen ? (side === "left" ? "rotate-0" : "rotate-180") : "",
        ].join(" ")}
      >
        ›
      </span>
    </button>
  );
}

function VitalSignChart({ sign }: { sign: EarthVitalSign }) {
  const data = sign.historicalData;
  if (!data) return null;

  const points = data.points;
  const projection = data.projection || [];
  const allPoints = [...points, ...projection];
  if (allPoints.length === 0) return null;

  // Find mins and maxs
  const years = allPoints.map((p) => p.year);
  const values = allPoints.map((p) => p.value);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Buffer values slightly so the line doesn't clip at top/bottom
  const valRange = maxValue - minValue || 1;
  const yMin = minValue - valRange * 0.1;
  const yMax = maxValue + valRange * 0.1;
  const yearRange = maxYear - minYear || 1;

  // SVG dimensions
  const width = 280;
  const height = 110;
  const padding = { top: 15, right: 15, bottom: 20, left: 35 };

  // Map coordinates
  const getX = (year: number) => padding.left + ((year - minYear) / yearRange) * (width - padding.left - padding.right);
  const getY = (value: number) => height - padding.bottom - ((value - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom);

  // Generate path for historical data
  const histPoints = points.map((p) => `${getX(p.year)},${getY(p.value)}`);
  const histPath = `M ${histPoints.join(" L ")}`;

  // Generate path for area gradient fill
  const areaPath = points.length > 0 ? `${histPath} L ${getX(points[points.length - 1].year)},${height - padding.bottom} L ${getX(points[0].year)},${height - padding.bottom} Z` : "";

  // Generate path for projection data (dashed line)
  let projPath = "";
  if (projection.length > 0 && points.length > 0) {
    const lastHist = points[points.length - 1];
    const projPoints = [lastHist, ...projection].map((p) => `${getX(p.year)},${getY(p.value)}`);
    projPath = `M ${projPoints.join(" L ")}`;
  }

  // Interactive tooltip tracking state
  const [hoveredPoint, setHoveredPoint] = useState<{ year: number; value: number } | null>(null);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Find the closest point in x direction
    let closest = allPoints[0];
    let minDist = Math.abs(getX(allPoints[0].year) - x);

    for (let i = 1; i < allPoints.length; i++) {
      const dist = Math.abs(getX(allPoints[i].year) - x);
      if (dist < minDist) {
        minDist = dist;
        closest = allPoints[i];
      }
    }

    setHoveredPoint(closest);
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="mt-3 border border-white/5 bg-white/[0.015] p-2 rounded" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center text-[0.62rem] font-mono text-slate-400 mb-1">
        <span>Historical Trend & Projection</span>
        <span className="text-white font-semibold">
          {hoveredPoint ? `${hoveredPoint.year}: ${hoveredPoint.value}${data.unit}` : `Hover for details`}
        </span>
      </div>

      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="overflow-visible select-none cursor-crosshair"
      >
        <defs>
          <linearGradient id={`grad-${sign.label.replace(/\s+/g, "-")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sign.accent} stopOpacity={0.35} />
            <stop offset="100%" stopColor={sign.accent} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* X axis line */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#334155"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* Grid lines (min, max) */}
        <line
          x1={padding.left}
          y1={getY(minValue)}
          x2={width - padding.right}
          y2={getY(minValue)}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <line
          x1={padding.left}
          y1={getY(maxValue)}
          x2={width - padding.right}
          y2={getY(maxValue)}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="2 3"
        />

        {/* Y Axis Labels */}
        <text
          x={padding.left - 6}
          y={getY(minValue) + 3}
          textAnchor="end"
          fontSize="8"
          fill="#94a3b8"
          fontFamily="monospace"
        >
          {minValue.toFixed(minValue % 1 === 0 ? 0 : 1)}
        </text>
        <text
          x={padding.left - 6}
          y={getY(maxValue) + 3}
          textAnchor="end"
          fontSize="8"
          fill="#94a3b8"
          fontFamily="monospace"
        >
          {maxValue.toFixed(maxValue % 1 === 0 ? 0 : 1)}
        </text>

        {/* X Axis Labels */}
        <text
          x={getX(minYear)}
          y={height - padding.bottom + 12}
          textAnchor="middle"
          fontSize="8"
          fill="#94a3b8"
          fontFamily="monospace"
        >
          {minYear}
        </text>
        <text
          x={getX(maxYear)}
          y={height - padding.bottom + 12}
          textAnchor="middle"
          fontSize="8"
          fill="#94a3b8"
          fontFamily="monospace"
        >
          {maxYear}
        </text>

        {/* Area fill under historical line */}
        {areaPath && (
          <path
            d={areaPath}
            fill={`url(#grad-${sign.label.replace(/\s+/g, "-")})`}
          />
        )}

        {/* Historical line */}
        <path
          d={histPath}
          fill="none"
          stroke={sign.accent}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Projection line (dashed) */}
        {projPath && (
          <path
            d={projPath}
            fill="none"
            stroke={sign.accent}
            strokeWidth="1.75"
            strokeDasharray="3 3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
        )}

        {/* Data points (circles) */}
        {points.map((p, idx) => (
          <circle
            key={`p-${idx}`}
            cx={getX(p.year)}
            cy={getY(p.value)}
            r={hoveredPoint?.year === p.year ? 4 : 2}
            fill="#0f172a"
            stroke={sign.accent}
            strokeWidth={1.5}
            className="transition-all duration-200"
          />
        ))}

        {/* Projection points (circles) */}
        {projection.map((p, idx) => (
          <circle
            key={`proj-${idx}`}
            cx={getX(p.year)}
            cy={getY(p.value)}
            r={hoveredPoint?.year === p.year ? 4 : 2}
            fill="#0f172a"
            stroke={sign.accent}
            strokeWidth={1.25}
            strokeDasharray="1 1"
            className="transition-all duration-200"
          />
        ))}

        {/* Vertical hover marker line */}
        {hoveredPoint && (
          <line
            x1={getX(hoveredPoint.year)}
            y1={padding.top}
            x2={getX(hoveredPoint.year)}
            y2={height - padding.bottom}
            stroke="#64748b"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            opacity="0.8"
          />
        )}
      </svg>
    </div>
  );
}

function EarthVitalSignsPanel({
  isOpen,
  onPanelPointerEnter,
  onPanelPointerLeave,
}: {
  isOpen: boolean;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
}) {
  const { handlePanelWheel, panelRef } = useManualPanelWheel<HTMLElement>();
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null);

  return (
    <aside
      ref={panelRef}
      className={[
        "pointer-events-auto relative z-30 border border-blue-300/24 bg-black/58 text-white shadow-[0_0_34px_rgba(59,130,246,0.18)] backdrop-blur-md",
        "w-full p-4 lg:absolute lg:left-[calc(100%+0.75rem)] lg:top-0 lg:w-80",
        "scrollbar-hidden max-h-[46vh] overflow-y-auto overscroll-contain lg:max-h-[72vh]",
        isOpen ? "block" : "hidden",
      ].join(" ")}
      aria-label="Earth Vital Signs"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheel={handlePanelWheel}
      onWheelCapture={handlePanelWheel}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
            Open Sources
          </p>
          <h2 className="mt-1 text-2xl font-semibold leading-none text-white max-lg:text-xl">Earth Vital Signs</h2>
        </div>
        <p className="shrink-0 pt-1 text-right font-mono text-[0.62rem] uppercase leading-tight tracking-[0.14em] text-slate-400">
          Value
        </p>
      </div>
      <dl className="mt-4 space-y-2">
        {earthVitalSigns.map((sign) => {
          const isExpanded = expandedLabel === sign.label;
          return (
            <div
              key={sign.label}
              onClick={() => setExpandedLabel(isExpanded ? null : sign.label)}
              className={[
                "border-t border-white/10 pt-2.5 first:border-t-0 first:pt-0 cursor-pointer select-none rounded p-1.5 -mx-1.5 transition-all duration-300",
                isExpanded ? "bg-white/[0.04] border-l-2 border-l-sky-500 pl-2.5" : "hover:bg-white/[0.02]"
              ].join(" ")}
            >
              <dt className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-100">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: sign.accent, boxShadow: `0 0 12px ${sign.accent}` }}
                  />
                  <span className="truncate">{sign.label}</span>
                </span>
                <span className="shrink-0 font-mono text-xs text-sky-200">
                  {sign.value}
                </span>
              </dt>
              <dd
                className={[
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isExpanded ? "max-h-[380px] opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                ].join(" ")}
              >
                <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-slate-400">
                  Last updated: {sign.updated}
                </p>
                {sign.statusBar && (
                  <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
                    <div
                      className="flex h-2 overflow-hidden border border-white/10 bg-white/8"
                      aria-label={`${sign.label}: ${sign.statusBar.usedLabel}; ${sign.statusBar.remainingLabel}`}
                    >
                      <span
                        className="h-full bg-orange-400"
                        style={{ width: `${sign.statusBar.usedPercent}%` }}
                      />
                      <span
                        className="h-full bg-sky-300/70"
                        style={{ width: `${sign.statusBar.remainingPercent}%` }}
                      />
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-2 font-mono text-[0.62rem] uppercase leading-tight tracking-[0.1em] text-slate-400">
                      <span>{sign.statusBar.usedLabel}</span>
                      <span className="text-right">{sign.statusBar.remainingLabel}</span>
                    </div>
                  </div>
                )}
                <p className="mt-2 text-xs leading-snug text-slate-300/84">{sign.note}</p>
                
                <VitalSignChart sign={sign} />

                <div className="mt-2">
                  <a
                    href={sign.sourceHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-blue-300/85 underline-offset-4 transition-colors hover:text-white hover:underline focus:outline-none focus-visible:text-white focus-visible:underline"
                  >
                    Source: {sign.source}
                  </a>
                </div>
              </dd>
            </div>
          );
        })}
      </dl>
    </aside>
  );
}

function DataIndexPanel({
  isOpen,
  onPanelPointerEnter,
  onPanelPointerLeave,
}: {
  isOpen: boolean;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
}) {
  const { handlePanelWheel, panelRef } = useManualPanelWheel<HTMLElement>();

  return (
    <aside
      ref={panelRef}
      className={[
        "pointer-events-auto relative z-30 border border-blue-300/24 bg-black/58 text-white shadow-[0_0_34px_rgba(59,130,246,0.18)] backdrop-blur-md",
        "w-full p-4 lg:absolute lg:right-[calc(100%+0.75rem)] lg:top-0 lg:w-80",
        "scrollbar-hidden max-h-[46vh] overflow-y-auto overscroll-contain lg:max-h-[72vh]",
        isOpen ? "block" : "hidden",
      ].join(" ")}
      aria-label="Global Data Index"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheel={handlePanelWheel}
      onWheelCapture={handlePanelWheel}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
            Digital Sources
          </p>
          <h2 className="mt-1 text-2xl font-semibold leading-none text-white max-lg:text-xl">
            Global Data Index
          </h2>
        </div>
        <Link
          href="/projects/sapiens-scientia-data-index"
          className="shrink-0 pt-1 text-right font-mono text-[0.62rem] uppercase leading-tight tracking-[0.14em] text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline focus:outline-none focus-visible:text-white focus-visible:underline"
        >
          Full
          <br />
          Index
        </Link>
      </div>
      <div className="mt-4 space-y-4">
        {dataIndexCategories.map((category) => (
          <section key={category.name} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: category.color, boxShadow: `0 0 12px ${category.color}` }}
              />
              <h3 className="text-sm font-semibold text-slate-100">{category.name}</h3>
              <span className="ml-auto font-mono text-[0.62rem] uppercase tracking-[0.12em] text-slate-500">
                {category.entries.length}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {category.entries.map((entry) => (
                <a
                  key={`${category.name}-${entry.name}`}
                  href={entry.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 border border-white/8 bg-white/[0.035] px-2.5 py-2 text-xs leading-tight text-slate-200/88 transition-colors hover:border-sky-200/35 hover:bg-sky-200/10 hover:text-white focus:outline-none focus-visible:border-sky-200/70"
                >
                  {entry.name}
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

function EarthSystemsColumn({
  activeBridge,
  panelRef,
  onPanelPointerEnter,
  onPanelPointerLeave,
}: {
  activeBridge: HumanPlatformBridge | null;
  panelRef: RefObject<HTMLElement | null>;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
}) {
  const [isVitalSignsOpen, setIsVitalSignsOpen] = useState(false);
  const earthSystemHighlights = useMemo<ConceptHighlight[]>(
    () =>
      earthVitalSignHighlights.map((highlight) => ({
        color: highlight.color,
        labels: [highlight.label],
      })),
    [],
  );
  const activeHighlights = [
    ...(isVitalSignsOpen ? earthSystemHighlights : []),
    ...platformBridgeHighlights(activeBridge, "earth"),
  ];

  return (
    <div
      className="pointer-events-auto relative flex flex-col gap-3 lg:block"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheelCapture={stopPanelScrollPropagation}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div className="relative">
        <ConceptColumn
          align="left"
          highlights={activeHighlights}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
          panelRef={panelRef}
          headerAction={(
            <PopoutToggleButton
              controlsId="earth-vital-signs-panel"
              isOpen={isVitalSignsOpen}
              label="Earth Vital Signs"
              onClick={() => setIsVitalSignsOpen((value) => !value)}
            />
          )}
          title="Earth Systems"
          nodes={earthSystemNodes}
        />
      </div>
      <div id="earth-vital-signs-panel">
        <EarthVitalSignsPanel
          isOpen={isVitalSignsOpen}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
        />
      </div>
    </div>
  );
}

function DigitalSystemsColumn({
  activeBridge,
  panelRef,
  onPanelPointerEnter,
  onPanelPointerLeave,
}: {
  activeBridge: HumanPlatformBridge | null;
  panelRef: RefObject<HTMLElement | null>;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
}) {
  const [isDataIndexOpen, setIsDataIndexOpen] = useState(false);
  const activeHighlights = [
    ...(isDataIndexOpen ? digitalDataIndexHighlights : []),
    ...platformBridgeHighlights(activeBridge, "digital"),
  ];

  return (
    <div
      className="pointer-events-auto relative flex flex-col gap-3 lg:block"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheelCapture={stopPanelScrollPropagation}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div className="relative">
        <ConceptColumn
          align="left"
          highlights={activeHighlights}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
          panelRef={panelRef}
          headerActionPosition="before"
          noWrapTitle
          headerAction={(
            <PopoutToggleButton
              controlsId="digital-data-index-panel"
              isOpen={isDataIndexOpen}
              label="Global Data Index"
              side="left"
              onClick={() => setIsDataIndexOpen((value) => !value)}
            />
          )}
          title="Digital Systems"
          nodes={digitalSystemNodes}
        />
      </div>
      <div id="digital-data-index-panel">
        <DataIndexPanel
          isOpen={isDataIndexOpen}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
        />
      </div>
    </div>
  );
}

function BridgeConnectorLayer({
  activeBridgeId,
  bridgeItemRefs,
  digitalPanelRef,
  earthPanelRef,
  panelRef,
}: {
  activeBridgeId: HumanPlatformBridge["id"] | null;
  bridgeItemRefs: RefObject<Map<HumanPlatformBridge["id"], HTMLLIElement>>;
  digitalPanelRef: RefObject<HTMLElement | null>;
  earthPanelRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [anchors, setAnchors] = useState<BridgeConnectorAnchor[]>([]);

  useEffect(() => {
    let frameId = 0;

    const measureAnchors = () => {
      frameId = 0;

      const svg = svgRef.current;
      const panel = panelRef.current;
      const earthPanel = earthPanelRef.current;
      const digitalPanel = digitalPanelRef.current;

      if (!svg || !panel || !earthPanel || !digitalPanel) {
        return;
      }

      const svgRect = svg.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const earthPanelRect = earthPanel.getBoundingClientRect();
      const digitalPanelRect = digitalPanel.getBoundingClientRect();
      const fallbackStep = panelRect.height / (humanPlatformBridges.length + 1);
      const panelTop = panelRect.top - svgRect.top;
      const panelBottom = panelRect.bottom - svgRect.top;
      const earthBottomY = earthPanelRect.bottom - svgRect.top;
      const digitalBottomY = digitalPanelRect.bottom - svgRect.top;

      setAnchors(
        humanPlatformBridges.map((bridge, index) => {
          const itemRect = bridgeItemRefs.current.get(bridge.id)?.getBoundingClientRect();
          const rawY = itemRect
            ? itemRect.top + itemRect.height / 2 - svgRect.top
            : panelTop + fallbackStep * (index + 1);
          const y = Math.min(Math.max(rawY, panelTop + 12), panelBottom - 12);

          return {
            color: bridge.color,
            id: bridge.id,
            leftX: panelRect.left - svgRect.left,
            leftSourceX: earthPanelRect.left + earthPanelRect.width / 2 - svgRect.left,
            leftSourceY: earthBottomY,
            rightX: panelRect.right - svgRect.left,
            rightSourceX: digitalPanelRect.left + digitalPanelRect.width / 2 - svgRect.left,
            rightSourceY: digitalBottomY,
            y,
          };
        }),
      );
    };

    const scheduleMeasure = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(measureAnchors);
    };

    scheduleMeasure();

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    const panel = panelRef.current;
    const svg = svgRef.current;

    if (panel) {
      resizeObserver.observe(panel);
      panel.addEventListener("scroll", scheduleMeasure, { passive: true });
    }

    const earthPanel = earthPanelRef.current;
    const digitalPanel = digitalPanelRef.current;

    if (earthPanel) {
      resizeObserver.observe(earthPanel);
      earthPanel.addEventListener("scroll", scheduleMeasure, { passive: true });
    }

    if (digitalPanel) {
      resizeObserver.observe(digitalPanel);
      digitalPanel.addEventListener("scroll", scheduleMeasure, { passive: true });
    }

    if (svg) {
      resizeObserver.observe(svg);
    }

    window.addEventListener("resize", scheduleMeasure);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      resizeObserver.disconnect();
      panel?.removeEventListener("scroll", scheduleMeasure);
      earthPanel?.removeEventListener("scroll", scheduleMeasure);
      digitalPanel?.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [activeBridgeId, bridgeItemRefs, digitalPanelRef, earthPanelRef, panelRef]);

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 z-[9] hidden h-full w-full overflow-visible lg:block"
      aria-hidden="true"
    >
      <defs>
        <filter id="bridge-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="0.7" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {anchors.map((anchor) => {
        const isActive = activeBridgeId === anchor.id;
        const opacity = activeBridgeId ? (isActive ? 0.88 : 0.11) : 0.24;
        const strokeWidth = isActive ? 3.4 : 1.8;
        const leftPath = [
          `M ${anchor.leftSourceX} ${anchor.leftSourceY}`,
          `C ${anchor.leftSourceX + 130} ${anchor.leftSourceY + 16}, ${anchor.leftX - 44} ${anchor.y}, ${anchor.leftX} ${anchor.y}`,
        ].join(" ");
        const rightPath = [
          `M ${anchor.rightSourceX} ${anchor.rightSourceY}`,
          `C ${anchor.rightSourceX - 130} ${anchor.rightSourceY + 16}, ${anchor.rightX + 44} ${anchor.y}, ${anchor.rightX} ${anchor.y}`,
        ].join(" ");

        return (
          <g key={anchor.id} filter={isActive ? "url(#bridge-glow)" : undefined}>
            <path
              d={leftPath}
              fill="none"
              stroke={anchor.color}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            <path
              d={rightPath}
              fill="none"
              stroke={anchor.color}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
            <circle
              cx={anchor.leftSourceX}
              cy={anchor.leftSourceY}
              r={isActive ? 4.2 : 2.8}
              fill={anchor.color}
              opacity={opacity}
            />
            <circle
              cx={anchor.rightSourceX}
              cy={anchor.rightSourceY}
              r={isActive ? 4.2 : 2.8}
              fill={anchor.color}
              opacity={opacity}
            />
            <circle cx={anchor.leftX} cy={anchor.y} r={isActive ? 5 : 3.4} fill={anchor.color} opacity={opacity} />
            <circle cx={anchor.rightX} cy={anchor.y} r={isActive ? 5 : 3.4} fill={anchor.color} opacity={opacity} />
          </g>
        );
      })}
    </svg>
  );
}

function HumanPlatformsBridgePanel({
  activeBridgeId,
  onBridgeEnter,
  onBridgeLeave,
  onPanelPointerEnter,
  onPanelPointerLeave,
  panelRef,
  registerBridgeItem,
}: {
  activeBridgeId: HumanPlatformBridge["id"] | null;
  onBridgeEnter: (bridge: HumanPlatformBridge) => void;
  onBridgeLeave: () => void;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
  panelRef: RefObject<HTMLElement | null>;
  registerBridgeItem: (id: HumanPlatformBridge["id"]) => (node: HTMLLIElement | null) => void;
}) {
  return (
    <aside
      ref={panelRef}
      className="scrollbar-hidden pointer-events-auto max-h-[24vh] w-72 overflow-y-auto overscroll-contain border border-white/15 bg-black/42 px-6 py-4 text-center text-white shadow-[0_0_28px_rgba(59,130,246,0.16)] backdrop-blur-sm max-lg:w-full max-lg:px-4 max-lg:py-3"
      aria-label="Human Platforms"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={() => {
        onBridgeLeave();
        onPanelPointerLeave();
      }}
      onWheelCapture={stopPanelScrollPropagation}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <h2 className="mb-3 text-2xl font-semibold leading-none text-white max-lg:text-xl">Human Platforms</h2>
      <ol className="space-y-1.5">
        {humanPlatformBridges.map((bridge) => {
          const isActive = activeBridgeId === bridge.id;

          return (
            <li
              ref={registerBridgeItem(bridge.id)}
              key={bridge.id}
              className={[
                "grid justify-items-center gap-1 py-0.5 transition-all duration-300",
                isActive ? "scale-[1.02]" : "",
              ].join(" ")}
              onPointerEnter={() => onBridgeEnter(bridge)}
            >
              <Link
                href={bridge.href}
                className="inline-flex items-center justify-center gap-2 text-base font-semibold text-sky-100 underline-offset-4 transition-colors hover:text-white hover:underline focus:outline-none focus-visible:text-white focus-visible:underline"
                style={{
                  color: isActive ? bridge.color : undefined,
                  textShadow: isActive ? `0 0 14px ${bridge.color}` : undefined,
                }}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "h-1.5 w-1.5 rounded-full transition-opacity duration-300",
                    isActive ? "opacity-100" : "opacity-45",
                  ].join(" ")}
                  style={{ backgroundColor: bridge.color, boxShadow: `0 0 12px ${bridge.color}` }}
                />
                {bridge.title}
              </Link>
              <p className="text-sm leading-tight text-slate-100/88">{bridge.subtitle}</p>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function TimeOverlay({
  onPanelPointerEnter,
  onPanelPointerLeave,
}: {
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
}) {
  const [selectedTimeZone, setSelectedTimeZone] = useState("America/New_York");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => {
      setNow(new Date());
    };

    const timeoutId = window.setTimeout(tick, 0);
    const intervalId = window.setInterval(tick, 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

  const selectedOption = timeZoneOptions.find((option) => option.value === selectedTimeZone);
  const selectedLabel = selectedOption?.label ?? selectedTimeZone.replaceAll("_", " ");

  return (
    <aside
      className="pointer-events-auto w-[min(34rem,calc(100vw-2rem))] border border-white/15 bg-black/48 px-4 py-3 text-center text-white shadow-[0_0_28px_rgba(59,130,246,0.16)] backdrop-blur-sm"
      onPointerEnter={onPanelPointerEnter}
      onPointerLeave={onPanelPointerLeave}
      onWheelCapture={stopPanelScrollPropagation}
      onTouchMoveCapture={stopPanelScrollPropagation}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-3">
        <div className="grid min-w-0 grid-rows-[2.35rem_auto_auto]">
          <p className="flex items-center justify-center text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-blue-300/80">
            UTC Time
          </p>
          <p className="font-mono text-2xl leading-none text-sky-100">{formatClockTime(now, "UTC")}</p>
          <p className="mt-1 text-xs text-slate-300/80">{formatClockDate(now, "UTC")}</p>
        </div>
        <div className="h-14 w-px bg-white/12 max-sm:h-px max-sm:w-full" />
        <div className="grid min-w-0 grid-rows-[2.35rem_auto_auto]">
          <div className="flex items-center justify-center gap-3">
            <label
              className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-blue-300/80"
              htmlFor="timezone-clock-select"
            >
              Timezone
            </label>
            <select
              id="timezone-clock-select"
              value={selectedTimeZone}
              className="max-w-32 border border-white/12 bg-black/55 px-2 py-1 text-xs text-slate-100 outline-none transition focus:border-sky-300/70"
              onChange={(event) => setSelectedTimeZone(event.target.value)}
            >
              {selectedOption ? null : <option value={selectedTimeZone}>{selectedLabel}</option>}
              {timeZoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <p className="font-mono text-2xl leading-none text-white">{formatClockTime(now, selectedTimeZone)}</p>
          <p className="mt-1 text-xs text-slate-300/80">{formatClockDate(now, selectedTimeZone)}</p>
        </div>
      </div>
    </aside>
  );
}

function ConceptOverlay({
  isMetaEarthMerged,
  onMetaEarthToggle,
  onPanelPointerEnter,
  onPanelPointerLeave,
}: {
  isMetaEarthMerged: boolean;
  onMetaEarthToggle: () => void;
  onPanelPointerEnter: () => void;
  onPanelPointerLeave: () => void;
}) {
  const [activeBridge, setActiveBridge] = useState<HumanPlatformBridge | null>(null);
  const bridgeItemRefs = useRef(new Map<HumanPlatformBridge["id"], HTMLLIElement>());
  const earthSystemsPanelRef = useRef<HTMLElement | null>(null);
  const digitalSystemsPanelRef = useRef<HTMLElement | null>(null);
  const humanPlatformsPanelRef = useRef<HTMLElement | null>(null);
  const registerBridgeItem = useCallback(
    (id: HumanPlatformBridge["id"]) => (node: HTMLLIElement | null) => {
      if (node) {
        bridgeItemRefs.current.set(id, node);
        return;
      }

      bridgeItemRefs.current.delete(id);
    },
    [],
  );

  return (
    <>
      <BridgeConnectorLayer
        activeBridgeId={activeBridge?.id ?? null}
        bridgeItemRefs={bridgeItemRefs}
        digitalPanelRef={digitalSystemsPanelRef}
        earthPanelRef={earthSystemsPanelRef}
        panelRef={humanPlatformsPanelRef}
      />
      <header className="pointer-events-none absolute inset-x-4 top-8 z-10 flex flex-col items-center gap-4 max-lg:top-4">
        <p className="bg-gradient-to-r from-emerald-300/84 to-blue-300/88 bg-clip-text text-2xl font-semibold uppercase tracking-[0.18em] text-transparent drop-shadow-[0_0_18px_rgba(96,165,250,0.42)] sm:text-4xl">
          Sapiens Scientia
        </p>
        <TimeOverlay
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
        />
      </header>
      {isMetaEarthMerged ? (
        <button
          type="button"
          aria-label="Separate Meta Earth"
          className="pointer-events-auto absolute left-1/2 top-[calc(50%-9.25rem)] z-40 h-10 w-36 -translate-x-1/2 bg-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/80"
          onClick={onMetaEarthToggle}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 items-center justify-between gap-6 px-8 max-lg:inset-x-4 max-lg:bottom-36 max-lg:top-auto max-lg:grid max-lg:translate-y-0 max-lg:grid-cols-2 max-lg:px-0 max-md:grid-cols-1">
        <EarthSystemsColumn
          activeBridge={activeBridge}
          panelRef={earthSystemsPanelRef}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
        />
        <DigitalSystemsColumn
          activeBridge={activeBridge}
          panelRef={digitalSystemsPanelRef}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-16 z-10 flex justify-center px-8 max-lg:inset-x-4 max-lg:bottom-6 max-lg:px-0">
        <HumanPlatformsBridgePanel
          activeBridgeId={activeBridge?.id ?? null}
          onBridgeEnter={setActiveBridge}
          onBridgeLeave={() => setActiveBridge(null)}
          onPanelPointerEnter={onPanelPointerEnter}
          onPanelPointerLeave={onPanelPointerLeave}
          panelRef={humanPlatformsPanelRef}
          registerBridgeItem={registerBridgeItem}
        />
      </div>
    </>
  );
}

export function EarthHero() {
  const [isPanelPointerActive, setIsPanelPointerActive] = useState(false);
  const [isMetaEarthMerged, setIsMetaEarthMerged] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const toggleMetaEarth = () => setIsMetaEarthMerged((value) => !value);

  useEffect(() => {
    const savedTheme = localStorage.getItem("sapiens-theme");
    const isLight = savedTheme === "light" || document.documentElement.classList.contains("light-theme");
    if (isLight) {
      document.documentElement.classList.add("light-theme");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light-theme");
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light-theme");
      localStorage.setItem("sapiens-theme", "light");
    } else {
      document.documentElement.classList.remove("light-theme");
      localStorage.setItem("sapiens-theme", "dark");
    }
  };

  return (
    <section className="relative min-h-screen bg-black">
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0.28, 9.99], fov: 45 }}
          dpr={[1, 1.8]}
          gl={{ antialias: true, alpha: false }}
          className="!h-full !w-full"
          style={{ height: "100%", width: "100%" }}
        >
          <Suspense fallback={null}>
            <Scene
              enableZoom={!isPanelPointerActive}
              isMerged={isMetaEarthMerged}
              onToggleMerged={toggleMetaEarth}
              theme={theme}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Floating Theme Switcher */}
      <div className="pointer-events-auto absolute right-6 top-8 z-50 max-lg:top-4">
        <button
          onClick={toggleTheme}
          className="theme-toggle-btn pointer-events-auto rounded border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-300 transition-all hover:bg-black/60 hover:text-white cursor-pointer backdrop-blur-sm"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? "☀ Light" : "☾ Dark"}
        </button>
      </div>

      <ConceptOverlay
        isMetaEarthMerged={isMetaEarthMerged}
        onMetaEarthToggle={toggleMetaEarth}
        onPanelPointerEnter={() => setIsPanelPointerActive(true)}
        onPanelPointerLeave={() => setIsPanelPointerActive(false)}
      />
    </section>
  );
}
