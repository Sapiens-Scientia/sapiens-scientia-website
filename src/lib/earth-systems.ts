export type DataCenterSite = {
  name: string;
  lat: number;
  lon: number;
};

export type ConceptNode = {
  color?: string;
  href?: string;
  label: string;
  level: number;
};

export type ConceptHighlight = {
  color: string;
  labels: string[];
};

export type HumanPlatformBridge = {
  color: string;
  digitalHighlights: string[];
  earthHighlights: string[];
  href: string;
  id: "salus" | "societas" | "terra";
  subtitle: string;
  title: string;
};

export type DataIndexEntry = {
  name: string;
  href: string;
};

export type DataIndexCategory = {
  color: string;
  name: string;
  entries: DataIndexEntry[];
};

export const dataCenterSites: DataCenterSite[] = [
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

export const earthSystemNodes: ConceptNode[] = [
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

export const humanPlatformBridges: HumanPlatformBridge[] = [
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

export const digitalSystemNodes: ConceptNode[] = [
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
  { label: "Databases", level: 1, href: "/projects/sapiens-scientia-data-index" },
  { label: "General Knowledge", level: 2, color: "#2dd4bf", href: "/projects/sapiens-scientia-data-index#general-knowledge" },
  { label: "Scholarly Indexes", level: 2, color: "#7dd3fc", href: "/projects/sapiens-scientia-data-index#scholarly-indexes" },
  { label: "Life Sciences", level: 2, color: "#34d399", href: "/projects/sapiens-scientia-data-index#life-sciences" },
  { label: "Physical Sciences", level: 2, color: "#a78bfa", href: "/projects/sapiens-scientia-data-index#physical-sciences" },
  { label: "Books & Archives", level: 2, color: "#fbbf24", href: "/projects/sapiens-scientia-data-index#books-archives" },
  { label: "Law & Patents", level: 2, color: "#fb7185", href: "/projects/sapiens-scientia-data-index#law-patents" },
  { label: "Public Data", level: 2, color: "#22d3ee", href: "/projects/sapiens-scientia-data-index#public-data" },
  { label: "Platforms", level: 2, color: "#f472b6", href: "/projects/sapiens-scientia-data-index#platforms" },
  { label: "Registries", level: 2, color: "#c4b5fd", href: "/projects/sapiens-scientia-data-index#registries" },
  { label: "Data Pipelines", level: 1 },
  { label: "Digital Twins", level: 1 },
  { label: "Intelligence Systems", level: 0 },
  { label: "Machine Learning", level: 1 },
  { label: "Simulation Models", level: 1 },
  { label: "Decision Support", level: 1 },
  { label: "Autonomous Agents", level: 1 },
];

export const digitalDataIndexHighlights: ConceptHighlight[] = [
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

export function platformBridgeHighlights(
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
