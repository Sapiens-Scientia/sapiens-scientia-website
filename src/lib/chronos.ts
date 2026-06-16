// The temporal twin of the Ladder of Scale (`src/lib/scales.ts`). Where the
// scale ladder plots the nested-systems hierarchy across powers of ten in
// *space* (metres), this plots the same project's reach across powers of ten in
// *time* (years before present) — a logarithmic Big-History arc from the Big
// Bang to the present moment.
//
// The key insight a log-time axis makes visible: the few thousand years of human
// civilization occupy as much of the arc as billions of years of cosmic history.
// Recent time is stretched, deep time is compressed.
//
// Positions are log10 of representative ages in years before present (BP),
// order-of-magnitude anchors rather than precise dates. Ages follow NASA/Planck
// (age of the universe), USGS (age of the Earth), the Smithsonian Human Origins
// program, and standard geologic-timescale reference values.

export type EonId = "cosmos" | "gaia" | "mind" | "sapiens";

export type ChronosPlatform = {
  id: "salus" | "societas" | "terra";
  name: string;
  href: string;
  color: string;
};

export const chronosPlatforms: Record<ChronosPlatform["id"], ChronosPlatform> = {
  salus: { id: "salus", name: "Salus", href: "/platforms/salus", color: "#38bdf8" },
  societas: { id: "societas", name: "Societas", href: "/platforms/societas", color: "#818cf8" },
  terra: { id: "terra", name: "Terra", href: "/platforms/terra", color: "#34d399" },
};

export type Eon = {
  id: EonId;
  name: string;
  ordinal: string;
  color: string;
  rangeLabel: string;
  principle: string;
  groups: { name: string; members: string[] }[];
  platforms: ChronosPlatform["id"][];
};

// Four eons, warm-to-cool from the fire of the early universe to the present —
// the temporal counterpart to the four tiers of scale.
export const eons: Eon[] = [
  {
    id: "cosmos",
    name: "Cosmos",
    ordinal: "Eon I",
    color: "#f59e0b",
    rangeLabel: "Big Bang to a young Earth · 10¹⁰·¹–10⁹·⁷ yr",
    principle:
      "The origin scale of time. Matter, the elements, the first stars, and finally a planet condense out of an expanding universe. Everything later on the arc is assembled from atoms forged here.",
    groups: [
      { name: "First light", members: ["Big Bang", "First Stars & Galaxies"] },
      { name: "A world forms", members: ["The Sun", "The Earth", "The Moon"] },
    ],
    platforms: ["terra"],
  },
  {
    id: "gaia",
    name: "Living Earth",
    ordinal: "Eon II",
    color: "#34d399",
    rangeLabel: "Origin of life to animals · 10⁹·⁶–10⁸·⁷ yr",
    principle:
      "The biogenic scale. Life begins, learns to breathe sunlight, invents the complex cell, and finally assembles itself into many-celled bodies. Earth becomes a planet that its own life has remade.",
    groups: [
      { name: "Single cells", members: ["First Life", "Photosynthesis", "Oxygenation", "Complex Cells"] },
      { name: "Bodies", members: ["Multicellular Life", "The Biosphere"] },
    ],
    platforms: ["terra", "salus"],
  },
  {
    id: "mind",
    name: "Life & Mind",
    ordinal: "Eon III",
    color: "#a78bfa",
    rangeLabel: "Cambrian to the first hominins · 10⁸·⁷–10⁶·⁴ yr",
    principle:
      "The animal scale. Nervous systems, skeletons, vertebrates, and warm-blooded mammals; mass extinctions clear the stage and the first upright apes step onto it. The lineage that becomes human takes shape here.",
    groups: [
      { name: "Animal life", members: ["Cambrian Explosion", "Life on Land", "Mammals"] },
      { name: "Turning points", members: ["Mass Extinctions", "First Hominins"] },
    ],
    platforms: ["salus"],
  },
  {
    id: "sapiens",
    name: "Sapiens",
    ordinal: "Eon IV",
    color: "#38bdf8",
    rangeLabel: "Our species to the present · 10⁶·⁴–10¹·⁴ yr",
    principle:
      "The human scale of time. A single species learns language, farms, writes, reasons systematically, industrializes, and connects itself into a planetary information system. The whole of recorded history is the thin bright tail of the arc.",
    groups: [
      { name: "Becoming human", members: ["Genus Homo", "Homo sapiens", "Language"] },
      {
        name: "Civilization",
        members: ["Agriculture", "Writing", "Science", "Industry", "The Knowledge Age"],
      },
    ],
    platforms: ["societas", "salus"],
  },
];

export type ChronosEvent = {
  name: string;
  /** log10 of representative age in years before present. */
  log: number;
  /** Human-readable age, e.g. "13.8 Gyr" or "12,000 yr". */
  ageLabel: string;
  eon: EonId;
  note: string;
  /** Marks the present-moment reference rung. */
  here?: boolean;
};

// Representative moments plotted by log age before present — the rungs of the
// arc. Ordered oldest (Big Bang) to newest (now), so reading downward follows
// the arrow of time.
export const chronosEvents: ChronosEvent[] = [
  { name: "Big Bang", log: 10.14, ageLabel: "13.8 Gyr", eon: "cosmos", note: "Time, space, and matter begin. Within minutes the lightest elements — hydrogen and helium — exist." },
  { name: "First stars & galaxies", log: 10.13, ageLabel: "13.4 Gyr", eon: "cosmos", note: "Gravity gathers gas into the first stars, whose cores forge the heavier elements that everything else is made from." },
  { name: "Earth & Sun form", log: 9.66, ageLabel: "4.54 Gyr", eon: "cosmos", note: "A cloud of star-dust collapses into the Sun and its planets. The young Earth is molten and airless." },
  { name: "First life", log: 9.57, ageLabel: "3.7 Gyr", eon: "gaia", note: "Single-celled microbes appear in the early oceans — the deepest common ancestor of everything alive." },
  { name: "Photosynthesis", log: 9.45, ageLabel: "2.8 Gyr", eon: "gaia", note: "Cyanobacteria learn to run on sunlight, releasing oxygen as waste and beginning to rewrite the atmosphere." },
  { name: "The Great Oxygenation", log: 9.38, ageLabel: "2.4 Gyr", eon: "gaia", note: "Oxygen floods the air for the first time — a planetary catastrophe for old life, and the fuel for what follows." },
  { name: "Complex cells", log: 9.26, ageLabel: "1.8 Gyr", eon: "gaia", note: "Eukaryotes — cells with a nucleus and energy-making mitochondria — make large, intricate life possible." },
  { name: "Multicellular life", log: 8.78, ageLabel: "600 Myr", eon: "gaia", note: "Cells begin living as coordinated bodies. The biosphere gains its first large organisms." },
  { name: "Cambrian explosion", log: 8.73, ageLabel: "540 Myr", eon: "mind", note: "In a geological blink, almost every major animal body-plan appears — eyes, shells, nervous systems, predators." },
  { name: "Life moves to land", log: 8.57, ageLabel: "375 Myr", eon: "mind", note: "Plants, then four-limbed animals, leave the water and colonize the continents." },
  { name: "First mammals", log: 8.36, ageLabel: "230 Myr", eon: "mind", note: "Small, warm-blooded mammals appear alongside the first dinosaurs, living in their shadow for over 150 million years." },
  { name: "Dinosaur extinction", log: 7.82, ageLabel: "66 Myr", eon: "mind", note: "An asteroid impact ends the age of dinosaurs, opening the world for mammals to diversify and grow." },
  { name: "First hominins", log: 6.85, ageLabel: "7 Myr", eon: "mind", note: "The lineage leading to humans splits from that of chimpanzees; later hominins begin to walk upright." },
  { name: "Genus Homo", log: 6.45, ageLabel: "2.8 Myr", eon: "sapiens", note: "Toolmaking humans appear in Africa, with growing brains and the first stone technologies." },
  { name: "Homo sapiens", log: 5.48, ageLabel: "300,000 yr", eon: "sapiens", note: "Our own species emerges in Africa — anatomically modern humans, the readers of this arc." },
  { name: "Language & symbolism", log: 4.85, ageLabel: "70,000 yr", eon: "sapiens", note: "Fully modern behavior flowers: complex language, art, and trade. Humans begin to spread across every continent." },
  { name: "Agriculture", log: 4.08, ageLabel: "12,000 yr", eon: "sapiens", note: "Farming replaces foraging. Settled life, surpluses, cities, and the first dense human societies follow." },
  { name: "Writing", log: 3.72, ageLabel: "5,200 yr", eon: "sapiens", note: "Knowledge becomes storable outside the body. History — the recorded past — begins." },
  { name: "The scientific age", log: 2.68, ageLabel: "~480 yr", eon: "sapiens", note: "Systematic observation and mathematics turn knowledge into a self-correcting method — the engine Sapiens Scientia is built on." },
  { name: "Industry", log: 2.41, ageLabel: "~260 yr", eon: "sapiens", note: "Fossil energy multiplies human power thousandsfold, remaking economies, populations, and the planet's own systems." },
  { name: "The Knowledge Age", log: 1.4, ageLabel: "~ now", eon: "sapiens", note: "You are here. Computing and global networks bind humanity into a single information system — the present moment this project maps from.", here: true },
];

export const CHRONOS_LOG_MAX = 10.14;
export const CHRONOS_LOG_MIN = 1.4;
/** Orders of magnitude in time spanned from the present to the Big Bang. */
export const ORDERS_OF_TIME = Math.round(CHRONOS_LOG_MAX - CHRONOS_LOG_MIN);

export const chronosSources = [
  { label: "NASA / Planck — Age of the Universe", href: "https://science.nasa.gov/universe/the-big-bang/" },
  { label: "USGS — Age of the Earth", href: "https://www.usgs.gov/faqs/how-old-earth" },
  { label: "Smithsonian — Human Origins", href: "https://humanorigins.si.edu/" },
  { label: "International Commission on Stratigraphy — Geologic Time Scale", href: "https://stratigraphy.org/chart" },
];
