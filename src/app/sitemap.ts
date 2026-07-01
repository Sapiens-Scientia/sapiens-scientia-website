import type { MetadataRoute } from "next";

const baseUrl = "https://www.sapiensscientia.com";

// All statically prerendered routes. Keep in sync with the app directory.
const routes = [
  "/",
  "/observable-universe",
  "/history-of-planet-earth",
  "/meta-earth",
  "/ontology",
  "/scales",
  "/chronos",
  "/vitals",
  "/platforms",
  "/platforms/persona",
  "/platforms/persona/salus/soma",
  "/platforms/persona/salus",
  "/platforms/persona/salus/soma/morbus",
  "/platforms/persona/domus",
  "/platforms/societas",
  "/platforms/terra",
  "/projects",
  "/projects/sapiens-scientia-data-index",
  "/projects/earthview",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
