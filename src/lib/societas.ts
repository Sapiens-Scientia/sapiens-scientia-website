// Societas editorial references and explicitly illustrative scenario assumptions.
export type Scenario = {
  name: string;
  description: string;
  wealth: number;
  civic: number;
  digital: number;
};

export const scenarios: Scenario[] = [
  {
    name: "Contemporary Baseline",
    description: "Reference assumptions for comparison: concentrated resources, constrained civic space, and uneven digital access. These slider settings are illustrative, not measured global indices.",
    wealth: 30,
    civic: 40,
    digital: 68,
  },
  {
    name: "Market Oligarchy",
    description: "A hypothetical combination of concentrated resources, limited civic protections, and extensive digital access. Explore what the model assumes about these relationships.",
    wealth: 10,
    civic: 20,
    digital: 75,
  },
  {
    name: "Social Democracy",
    description: "A hypothetical combination of broadly distributed resources, strong civic protections, and high digital access. The resulting outcomes reflect the model’s chosen assumptions.",
    wealth: 75,
    civic: 85,
    digital: 90,
  },
  {
    name: "Authoritarian Technocracy",
    description: "A hypothetical combination of high digital access, restricted civic space, and intermediate resource distribution.",
    wealth: 45,
    civic: 10,
    digital: 95,
  },
  {
    name: "Digital Commons",
    description: "A hypothetical combination of shared resources, participatory institutions, and near-universal digital access.",
    wealth: 85,
    civic: 90,
    digital: 98,
  },
];

export const societasDomains = [
  {
    name: "Institutions and governance",
    detail: "States, law, bureaucracies, and the formal and informal rules that coordinate collective action.",
  },
  {
    name: "Economics and exchange",
    detail: "Production, markets, labor, finance, and the distribution of material resources across populations.",
  },
  {
    name: "Technology and tools",
    detail: "The accumulating stock of techniques and machines that extends human capability and reshapes society.",
  },
  {
    name: "Communication and media",
    detail: "Language, writing, networks, and platforms through which information and meaning circulate.",
  },
  {
    name: "Education and knowledge",
    detail: "The transmission of skills, norms, and understanding across generations and institutions.",
  },
  {
    name: "Cooperation and conflict",
    detail: "Alliances, trust, violence, and displacement — the dynamics that bind groups together or tear them apart.",
  },
];

export const civilizationalSignals = [
  {
    value: "8.2B",
    label: "world population in 2024",
    detail: "Humanity reached about 8.2 billion in 2024 and is projected to peak near 10.3 billion in the mid-2080s before slowly declining.",
    source: "UN · 2024",
    href: "https://www.un.org/en/node/219445",
  },
  {
    value: "$118T",
    label: "world output",
    detail: "World GDP was about $118.4 trillion in current US dollars in 2025 in the World Bank series. This measure does not adjust for inflation or purchasing power.",
    source: "World Bank · 2025",
    href: "https://data.worldbank.org/indicator/NY.GDP.MKTP.CD?locations=1W",
  },
  {
    value: "5.5B",
    label: "people online",
    detail: "About 5.5 billion people — 68% of humanity — used the internet in 2024, while 2.6 billion, mostly rural and low-income, remained offline.",
    source: "ITU · 2024",
    href: "https://www.itu.int/itu-d/reports/statistics/2024/11/10/ff24-internet-use/",
  },
  {
    value: "824M",
    label: "in extreme poverty",
    detail: "The World Bank’s September 2026 revision estimates 824.3 million people lived below $3.00 a day in 2024, measured at 2021 purchasing power parity.",
    source: "World Bank · 2024",
    href: "https://blogs.worldbank.org/en/opendata/september-2026-global-poverty-update-from-the-world-bank--one-in",
  },
  {
    value: "72%",
    label: "living in autocracies",
    detail: "V-Dem classified the countries home to 72% of the world’s population as autocracies in 2024. This differs from the share living in countries undergoing autocratization.",
    source: "V-Dem · 2024",
    href: "https://www.v-dem.net/documents/60/V-dem-dr__2025_lowres.pdf",
  },
  {
    value: "123M",
    label: "forcibly displaced",
    detail: "Forced displacement reached 123 million by the end of 2024 — about one in every 67 people — a twelfth consecutive annual increase.",
    source: "UNHCR · 2024",
    href: "https://www.unhcr.org/publications/global-trends-2024",
  },
];

