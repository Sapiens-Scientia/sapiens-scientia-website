import type { MetadataRoute } from "next";

const baseUrl = "https://www.sapiensscientia.com";

// All statically prerendered routes. Keep in sync with the app directory.
const routes = [
  "/",
  "/scales",
  "/chronos",
  "/vitals",
  "/platforms",
  "/platforms/salus",
  "/platforms/salus/morbus",
  "/platforms/societas",
  "/platforms/terra",
  "/projects",
  "/projects/sapiens-scientia-data-index",
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
