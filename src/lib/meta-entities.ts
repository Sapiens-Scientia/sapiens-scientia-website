// Meta-Entities: one of the core conceptual building blocks of Sapiens
// Scientia, alongside the Ladder of Scale and the Arc of Time.
//
// A Meta-Entity is an emergent, persistent structure composed of people,
// technologies, rules, and information that maintains its identity despite
// continual turnover of its individual components. Individuals are born and
// die; employees come and go; governments change leadership; corporations
// replace entire workforces. The larger structure persists.
//
// This module is the source of truth for the Meta Earth page's Meta-Entity
// section. Keep it aligned with `docs/CONTENT_MODEL.md`.

/** The working definition, stated once and reused. */
export const metaEntityDefinition =
  "A Meta-Entity is an emergent, persistent structure composed of people, technologies, rules, and information that maintains its identity despite continual turnover of its individual components.";

// ---------------------------------------------------------------------------
// The Meta Systems panel on the Meta Earth hero: the Meta-Entities it lists,
// beside the Physical Systems and Information Systems trees. A deliberately
// short opening set — extend it here as the taxonomy fills in.
// ---------------------------------------------------------------------------

export const metaSystemsEntities = ["Nations", "Corporations", "Markets"];

/** The turnover argument, in the order it should be read. */
export const metaEntityTurnover = [
  "Individuals are born and die.",
  "Employees come and go.",
  "Governments change leadership.",
  "Corporations replace entire workforces.",
];

export const metaEntityTurnoverConclusion = "Yet the larger structure persists.";

// ---------------------------------------------------------------------------
// Levels of organization
// ---------------------------------------------------------------------------

export type OrganizationLevel = {
  id: string;
  name: string;
  /** One-line gloss shown next to the ring label. */
  kind: string;
  /** What this level is made of. */
  composedOf: string;
  /** The components that turn over while the level holds. */
  turnsOver: string;
  /** What survives that turnover. */
  persists: string;
  /** Concrete instances. */
  examples: string[];
  /** Ring accent. */
  color: string;
  /** True once the structure outlives every one of its components. */
  metaEntity: boolean;
};

/**
 * The nested ladder the section visualizes, from the smallest living component
 * to the planetary system. Emergence runs outward: each level is composed of
 * the one inside it, and none of them reduces to it.
 */
export const organizationLevels: OrganizationLevel[] = [
  {
    id: "cell",
    name: "Cell",
    kind: "Biological component",
    composedOf: "Molecules, organelles, and membranes holding a chemical gradient against equilibrium.",
    turnsOver: "Proteins, lipids, and nearly every molecule in the cell, on timescales of minutes to weeks.",
    persists: "The pattern — the cell's structure and metabolism outlast the specific matter passing through them.",
    examples: ["Neuron", "Cardiomyocyte", "Gut epithelial cell"],
    color: "#5eead4",
    metaEntity: false,
  },
  {
    id: "individual",
    name: "Individual",
    kind: "Biological organism",
    composedOf: "Roughly 37 trillion cells organized into tissues, organs, and organ systems.",
    turnsOver: "Cells, continuously — the gut lining every few days, red blood cells every four months.",
    persists: "A single continuous identity: one body, one memory, one lifespan with a beginning and an end.",
    examples: ["A person", "A named human life", "The reader of this page"],
    color: "#7dd3fc",
    metaEntity: false,
  },
  {
    id: "household",
    name: "Household",
    kind: "Smallest persistent social structure",
    composedOf: "People, a dwelling, shared resources, routines, and obligations to one another.",
    turnsOver: "Its members — children are born, elders die, people join and leave.",
    persists: "The household itself: its name, its home, its accumulated property, its way of doing things.",
    examples: ["A family", "A lineage", "A shared dwelling across generations"],
    color: "#a78bfa",
    metaEntity: true,
  },
  {
    id: "organization",
    name: "Organization",
    kind: "Coordinated group",
    composedOf: "Employees, tools, capital, contracts, and an internal division of labor.",
    turnsOver: "Staff, leadership, technology, premises — often the entire workforce within a decade.",
    persists: "Legal identity, brand, balance sheet, procedures, and institutional memory.",
    examples: ["Corporations", "Nonprofit organizations", "Research labs", "Digital platforms"],
    color: "#f472b6",
    metaEntity: true,
  },
  {
    id: "institution",
    name: "Institution",
    kind: "Rule-carrying system",
    composedOf: "Organizations, formal rules, credentials, archives, and shared norms.",
    turnsOver: "Every member organization and every individual who ever administered it.",
    persists: "The rules themselves — standards, methods, currencies, and the authority to certify.",
    examples: ["Universities", "Markets", "Scientific institutions", "Religions", "Financial systems"],
    color: "#fbbf24",
    metaEntity: true,
  },
  {
    id: "nation",
    name: "Nation State",
    kind: "Territorial polity",
    composedOf: "A population, a territory, institutions, infrastructure, and a monopoly on legitimate force.",
    turnsOver: "Its entire population within a century; its governments within years.",
    persists: "Borders, law, treaties, debt, currency, and continuity of state across every change of leadership.",
    examples: ["Governments", "Nation states", "Supranational unions"],
    color: "#fb923c",
    metaEntity: true,
  },
  {
    id: "civilization",
    name: "Global Civilization",
    kind: "Planetary system",
    composedOf: "Nation states, markets, and the physical and digital infrastructure that couples them.",
    turnsOver: "Empires, currencies, technologies, and the whole of the species every few generations.",
    persists: "Accumulated knowledge, the built environment, and the planetary networks that carry both.",
    examples: ["The Internet", "The world economy", "The scientific record", "The planetary infrastructure layer"],
    color: "#f87171",
    metaEntity: true,
  },
];

/** Index of the first level that qualifies as a Meta-Entity. */
export const metaEntityThresholdIndex = organizationLevels.findIndex((level) => level.metaEntity);

// ---------------------------------------------------------------------------
// What every Meta-Entity possesses
// ---------------------------------------------------------------------------

export type MetaEntityProperty = {
  id: string;
  name: string;
  detail: string;
};

export const metaEntityProperties: MetaEntityProperty[] = [
  {
    id: "identity",
    name: "Persistent identity",
    detail:
      "A name, a legal person, or a recognized continuity that survives the replacement of every constituent.",
  },
  {
    id: "rules",
    name: "Internal rules",
    detail:
      "Charters, laws, protocols, and norms that constrain what the structure and its members may do.",
  },
  {
    id: "memory",
    name: "Memory",
    detail:
      "Archives, ledgers, records, and databases — knowledge held by the structure rather than by any member.",
  },
  {
    id: "decision",
    name: "Decision-making processes",
    detail:
      "Boards, elections, committees, and increasingly algorithms: procedures for acting as one agent.",
  },
  {
    id: "resources",
    name: "Resource flows",
    detail:
      "Energy, capital, materials, attention, and data drawn in, transformed, and passed on.",
  },
  {
    id: "adaptation",
    name: "Adaptation over time",
    detail:
      "Restructuring in response to pressure, so the structure outlasts the conditions it was built for.",
  },
];

/** Canonical examples, as listed in the project's conceptual framing. */
export const metaEntityExamples = [
  "Governments",
  "Nation states",
  "Corporations",
  "Universities",
  "Markets",
  "Scientific institutions",
  "Religions",
  "Nonprofit organizations",
  "Digital platforms",
  "Financial systems",
  "The Internet",
];
