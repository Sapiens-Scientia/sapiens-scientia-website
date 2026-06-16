// The nested-systems hierarchy that the whole Sapiens Scientia project is built
// on, expressed as a ladder of physical scale. The four tiers and their member
// systems mirror the `earthSystemNodes` taxonomy rendered in the homepage hero
// (Microsystems / Mesosystems / Macrosystems / Megasystems); here they are
// anchored to characteristic length scales so the hierarchy can be read as a
// powers-of-ten journey from elementary particles to the Sun.
//
// Length scales are order-of-magnitude characteristic sizes (log10 of metres),
// not precise measurements. Physical anchors follow NIST/CODATA, NASA planetary
// fact sheets, and standard cell-biology reference values.

import { platformDefinitions, type PlatformId } from "@/lib/platforms";

export type ScaleTierId = "micro" | "meso" | "macro" | "mega";

export type ScalePlatform = {
  id: PlatformId;
  name: string;
  href: string;
  color: string;
};

export const platforms: Record<ScalePlatform["id"], ScalePlatform> = {
  salus: {
    id: "salus",
    name: platformDefinitions.salus.shortName,
    href: platformDefinitions.salus.href,
    color: platformDefinitions.salus.color,
  },
  societas: {
    id: "societas",
    name: platformDefinitions.societas.shortName,
    href: platformDefinitions.societas.href,
    color: platformDefinitions.societas.color,
  },
  terra: {
    id: "terra",
    name: platformDefinitions.terra.shortName,
    href: platformDefinitions.terra.href,
    color: platformDefinitions.terra.color,
  },
};

export type ScaleTier = {
  id: ScaleTierId;
  name: string;
  ordinal: string;
  color: string;
  rangeLabel: string;
  principle: string;
  groups: { name: string; members: string[] }[];
  platforms: ScalePlatform["id"][];
};

export const scaleTiers: ScaleTier[] = [
  {
    id: "micro",
    name: "Microsystems",
    ordinal: "Tier I",
    color: "#38bdf8",
    rangeLabel: "Quarks to cells · 10⁻¹⁸–10⁻⁵ m",
    principle:
      "The constituent scale. Matter resolves into particles, atoms, and molecules; life resolves into cells and the microbes, bacteria, and viruses that share the body. Everything larger on the ladder is assembled from here.",
    groups: [
      { name: "Nanosystems", members: ["Elementary Particles", "Atoms", "Molecules"] },
      { name: "Microsystems", members: ["Cells", "Microbes", "Bacteria", "Viruses"] },
    ],
    platforms: ["salus"],
  },
  {
    id: "meso",
    name: "Mesosystems",
    ordinal: "Tier II",
    color: "#a78bfa",
    rangeLabel: "Organisms · 10⁻⁴–10¹ m",
    principle:
      "The organismal scale — the scale of a single living body. Multicellular life, mammals, and Homo sapiens itself. This is the scale a human directly inhabits, and the reference point the entire ladder is read from.",
    groups: [
      {
        name: "Multicellular life",
        members: ["Multicellular Life Forms", "Mammals", "Homo sapiens"],
      },
    ],
    platforms: ["salus"],
  },
  {
    id: "macro",
    name: "Macrosystems",
    ordinal: "Tier III",
    color: "#818cf8",
    rangeLabel: "Cities & systems · 10¹–10⁶ m",
    principle:
      "The collective scale. Many humans, coordinated by institutions and infrastructure: nations, legal and economic systems, healthcare, technology, energy, transport, and the built and digital environment. Society as a system.",
    groups: [
      {
        name: "People & institutions",
        members: [
          "Nations",
          "People",
          "Legal System",
          "Economic System",
          "Financial System",
          "Business & Industrial System",
        ],
      },
      {
        name: "Provisioning systems",
        members: [
          "Healthcare System",
          "Agricultural Systems",
          "Energy Generation System",
          "Waste Management System",
        ],
      },
      {
        name: "Built & digital fabric",
        members: [
          "Buildings",
          "Transportation, Pipes, & Cables",
          "Technology",
          "Information Systems",
          "Data Centers",
        ],
      },
    ],
    platforms: ["societas", "salus"],
  },
  {
    id: "mega",
    name: "Megasystems",
    ordinal: "Tier IV",
    color: "#34d399",
    rangeLabel: "Planet & star · 10⁷–10¹¹ m",
    principle:
      "The planetary scale. The Earth systems that contain everything below them — atmosphere, hydrosphere, geosphere, biosphere, soils, and climate — and the Sun that powers them. The boundary conditions of all human life.",
    groups: [
      {
        name: "Planetary spheres",
        members: ["Atmosphere", "Hydrosphere", "Geosphere", "Biosphere", "Soil System", "Ecosystems"],
      },
      {
        name: "Flows & forcings",
        members: ["The Sun", "Climate System", "Freshwater", "Fossil Fuels", "Anthropogenic Waste"],
      },
    ],
    platforms: ["terra"],
  },
];

export type ScaleRung = {
  name: string;
  /** log10 of characteristic size in metres. */
  log: number;
  sizeLabel: string;
  tier: ScaleTierId;
  note: string;
  /** Marks the human reference rung. */
  here?: boolean;
};

// Representative entities plotted by characteristic physical size — the rungs of
// the ladder. Ordered small to large.
export const scaleRungs: ScaleRung[] = [
  { name: "Elementary particles", log: -18, sizeLabel: "< 10⁻¹⁸ m", tier: "micro", note: "Quarks and electrons carry no measured size — point-like, the floor of the ladder." },
  { name: "Atoms", log: -10, sizeLabel: "~0.1 nm", tier: "micro", note: "A nucleus wrapped in an electron cloud; the smallest unit of a chemical element." },
  { name: "Molecules", log: -9, sizeLabel: "~1 nm", tier: "micro", note: "Bonded atoms — water, proteins, the DNA double helix two nanometres wide." },
  { name: "Viruses", log: -7, sizeLabel: "~100 nm", tier: "micro", note: "Genetic packages that borrow living cells to replicate; smaller than the cells they infect." },
  { name: "Bacteria", log: -6, sizeLabel: "~1 µm", tier: "micro", note: "Single-celled microbes; trillions live within and upon the human body." },
  { name: "Human cells", log: -5, sizeLabel: "~10 µm", tier: "micro", note: "The basic unit of the body — roughly thirty trillion of them per person." },
  { name: "Mammals", log: 0, sizeLabel: "~1 m", tier: "meso", note: "Multicellular animals; the lineage Homo sapiens belongs to." },
  { name: "Homo sapiens", log: 0.23, sizeLabel: "~1.7 m", tier: "meso", note: "You are here. The scale that reads every other rung on the ladder.", here: true },
  { name: "Buildings", log: 2, sizeLabel: "~100 m", tier: "macro", note: "The built environment — where most human life is now spent." },
  { name: "Cities", log: 4, sizeLabel: "~10 km", tier: "macro", note: "Dense concentrations of people, institutions, and infrastructure." },
  { name: "Nations", log: 6, sizeLabel: "~1,000 km", tier: "macro", note: "Legal, economic, and political systems spanning continents." },
  { name: "The Earth", log: 7.1, sizeLabel: "~12,700 km", tier: "mega", note: "The planet and its coupled spheres — atmosphere, ocean, crust, biosphere." },
  { name: "The Sun", log: 9.1, sizeLabel: "~1.4M km", tier: "mega", note: "The star that supplies almost all the energy driving Earth's systems." },
  { name: "Earth–Sun distance", log: 11.2, sizeLabel: "~150M km (1 AU)", tier: "mega", note: "One astronomical unit — the orbital radius that sets Earth's climate." },
];

export const LADDER_LOG_MIN = -18;
export const LADDER_LOG_MAX = 11.2;
/** Orders of magnitude spanned from the smallest to the largest rung. */
export const ORDERS_OF_MAGNITUDE = Math.round(LADDER_LOG_MAX - LADDER_LOG_MIN);

export const scaleSources = [
  { label: "NIST — CODATA Fundamental Physical Constants", href: "https://physics.nist.gov/cuu/Constants/" },
  { label: "NASA — Earth Fact Sheet", href: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html" },
  { label: "NASA — Sun Fact Sheet", href: "https://nssdc.gsfc.nasa.gov/planetary/factsheet/sunfact.html" },
  { label: "BioNumbers — Cell Biology by the Numbers", href: "https://bionumbers.hms.harvard.edu/" },
];
