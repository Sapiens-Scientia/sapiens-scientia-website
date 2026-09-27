/** Public wayfinding copy. Platform names and hierarchy remain canonical. */
export const atlasLenses = [
  {
    id: "persona", name: "Persona", scope: "The human", color: "var(--atlas-persona)",
    title: "Start with the human.",
    description: "The body, health, and home — connected to the systems around us.",
    href: "/platforms/persona",
  },
  {
    id: "societas", name: "Societas", scope: "The collective", color: "var(--atlas-societas)",
    title: "See what we build together.",
    description: "Institutions, economies, and knowledge — the structures that connect individual lives.",
    href: "/platforms/societas",
  },
  {
    id: "terra", name: "Terra", scope: "The planet", color: "var(--atlas-terra)",
    title: "Read the planet we share.",
    description: "Climate, water, land, and life — the Earth systems that sustain every human story.",
    href: "/platforms/terra",
  },
] as const;

export const atlasDimensions = [
  { title: "Across scale", description: "From particles to planets.", label: "Ladder of Scale", href: "/scales" },
  { title: "Through time", description: "From the Big Bang to now.", label: "Arc of Time", href: "/chronos" },
  { title: "Back to the evidence", description: "Vital signs and public sources.", label: "Explore the evidence", href: "/vitals" },
] as const;

export const explorationPaths = [
  {
    id: "body", question: "What keeps a body alive?", description: "Move from living structure to health and disease.", color: "var(--atlas-persona)",
    steps: [
      { name: "Soma", action: "Explore the body", href: "/platforms/persona/salus/soma" },
      { name: "Salus", action: "Understand health", href: "/platforms/persona/salus" },
      { name: "Morbus", action: "Study disease", href: "/platforms/persona/salus/soma/morbus" },
    ],
  },
  {
    id: "society", question: "How do societies hold together?", description: "Follow the structures that outlive their members.", color: "var(--atlas-societas)",
    steps: [
      { name: "Meta-Entities", action: "See emergence", href: "/meta-earth#meta-entities" },
      { name: "Societas", action: "Explore society", href: "/platforms/societas" },
      { name: "Platforms", action: "Trace connections", href: "/platforms" },
    ],
  },
  {
    id: "planet", question: "What is changing on Earth?", description: "Read the planet, then follow the evidence.", color: "var(--atlas-terra)",
    steps: [
      { name: "Terra", action: "Earth systems", href: "/platforms/terra" },
      { name: "Vital Signs", action: "Read the indicators", href: "/vitals" },
      { name: "Data Index", action: "Find the sources", href: "/projects/sapiens-scientia-data-index" },
    ],
  },
] as const;
