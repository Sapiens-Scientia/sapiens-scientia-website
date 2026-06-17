export const EARTHVIEW_EXTERNAL_URL = "https://earthview3d.vercel.app/";

export const EARTHVIEW_PAGE_PATH = "/projects/earthview";

export const projectLinks = [
  {
    href: "/projects/sapiens-scientia-data-index",
    label: "Sapiens Scientia Data Index",
    description: "Curated index of public databases, scholarly graphs, and knowledge infrastructure.",
    external: false as const,
  },
  {
    href: EARTHVIEW_PAGE_PATH,
    label: "EarthView 3D",
    description: "Detailed terrain and globe exploration — embedded from the Physical Earth on the homepage.",
    external: false as const,
  },
];
