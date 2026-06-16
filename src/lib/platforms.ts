export type PlatformId = "salus" | "societas" | "terra";

export type PlatformDefinition = {
  id: PlatformId;
  name: string;
  shortName: string;
  label: string;
  domain: string;
  href: string;
  color: string;
};

export const platformDefinitions: Record<PlatformId, PlatformDefinition> = {
  salus: {
    id: "salus",
    name: "Sapiens Scientia Salus",
    shortName: "Salus",
    label: "Human Health Platform",
    domain: "Health, biology, medicine",
    href: "/platforms/salus",
    color: "#38bdf8",
  },
  societas: {
    id: "societas",
    name: "Sapiens Scientia Societas",
    shortName: "Societas",
    label: "Human Society Platform",
    domain: "Society, culture, institutions",
    href: "/platforms/societas",
    color: "#818cf8",
  },
  terra: {
    id: "terra",
    name: "Sapiens Scientia Terra",
    shortName: "Terra",
    label: "Environmental Platform",
    domain: "Earth systems, ecology, environment",
    href: "/platforms/terra",
    color: "#34d399",
  },
};

export const platformList = [
  platformDefinitions.salus,
  platformDefinitions.societas,
  platformDefinitions.terra,
];

export type PlatformCoupling = {
  name: string;
  links: PlatformId[];
  detail: string;
  feedbackLoop: string;
};

export const platformCouplings: PlatformCoupling[] = [
  {
    name: "Public health",
    links: ["salus", "societas"],
    detail: "Disease spread, care access, and population health sit between bodies and institutions.",
    feedbackLoop:
      "A bidirectional loop where social structures (income, sanitation, urban density, housing conditions) determine exposure to pathogens and access to medical care (Societas). Concurrently, population-scale disease outbreaks (Salus) stress economic activity, destabilize governance, and force institutional adaptations (e.g., quarantine laws, public vaccine policies).",
  },
  {
    name: "Climate medicine",
    links: ["salus", "terra"],
    detail: "Heat, air quality, and shifting disease ranges tie human health to Earth systems.",
    feedbackLoop:
      "Planetary-scale energy imbalance and atmospheric warming (Terra) directly affect human cellular biology. Heat stress damages cardiovascular systems, shifting temperature ranges alter vector-borne pathogen habitats, and wildfire smoke/pollutants exacerbate lung/immune dysregulation (Salus). Downstream, human disease increases vulnerabilities to climate disasters.",
  },
  {
    name: "Energy systems",
    links: ["terra", "societas"],
    detail: "How societies power themselves drives both economies and planetary boundaries.",
    feedbackLoop:
      "Societal metabolism requires power (Societas). Harnessing fossil fuels or transitioning to renewable infrastructure drives carbon cycle changes, habitat fragmentation, and thermodynamic flows (Terra). Conversely, resource scarcity, climate feedback damage, and geographical energy distributions dictate national geopolitics, macroeconomic stability, and technical innovation (Societas).",
  },
  {
    name: "Food systems",
    links: ["salus", "societas", "terra"],
    detail: "Nutrition, agriculture, and land use couple health, society, and environment at once.",
    feedbackLoop:
      "A central three-way coupling. Agricultural practices and land conversion (Terra) drive global supply chains, economic subsidies, and cultural dietary patterns (Societas). In turn, these processed or natural foods determine metabolic disease incidence, microbiome health, and human physiological capacity (Salus). Finally, population metabolic demands feed back to demand more intensive land and water use, accelerating ecological degradation (Terra).",
  },
  {
    name: "Urbanization",
    links: ["salus", "societas", "terra"],
    detail: "Cities concentrate people, reshape institutions, and transform local ecosystems.",
    feedbackLoop:
      "Cities concentrate populations (Societas), generating dense micro-climates, urban heat islands, and massive waste streams that alter local ecological and hydrological cycles (Terra). These modified environments shape human health (Salus) through concentrated air pollution, mechanical noise stress, sedentary layouts, and rapid disease transmission networks. Yet, cities also concentrate the financial, healthcare, and educational capital (Societas) needed to develop systemic solutions.",
  },
  {
    name: "Disease ecology",
    links: ["salus", "societas", "terra"],
    detail: "Pathogens move through human, social, and environmental systems together.",
    feedbackLoop:
      "Pathogens cross species barriers at the interfaces of ecological degradation, deforestation, and climate shifts (Terra). These spillover events are accelerated or suppressed by global trade networks, food production systems, and institutional preparedness (Societas). Once in the human population, the pathogen's molecular biology interacts with host physiology to determine clinical disease courses (Salus), leading back to social shutdowns, regulatory responses, and altered environmental practices.",
  },
];
