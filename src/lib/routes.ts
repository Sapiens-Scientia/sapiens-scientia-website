// Single source of truth for human-readable route labels and the breadcrumb
// trails derived from them. Keeping labels here (rather than hand-written in
// each deep page) means the breadcrumb shown in the nav and the BreadcrumbList
// structured data stay in sync with the route inventory. Keep aligned with the
// app directory, docs/ROUTES.md, and the nav in site-nav.tsx.

export const SITE_URL = "https://www.sapiensscientia.com";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Home",
  "/meta-earth": "Meta Earth",
  "/platforms": "Platforms",
  "/platforms/persona": "Persona",
  "/platforms/persona/salus": "Salus",
  "/platforms/persona/salus/soma": "Soma",
  "/platforms/persona/salus/soma/morbus": "Morbus",
  "/platforms/persona/domus": "Domus",
  "/platforms/societas": "Societas",
  "/platforms/terra": "Terra",
  "/ontology": "The Map",
  "/scales": "Scales",
  "/chronos": "Chronos",
  "/vitals": "Vitals",
  "/projects": "Projects",
  "/projects/sapiens-scientia-data-index": "Data Index",
  "/projects/earthview": "EarthView 3D",
};

export type Crumb = { href: string; label: string };

/**
 * Build the ancestor trail for a path: Home, then each cumulative path segment
 * that has a known label. e.g. "/platforms/persona/salus" →
 * Home › Platforms › Persona › Salus.
 */
export function breadcrumbTrail(path: string): Crumb[] {
  const trail: Crumb[] = [{ href: "/", label: ROUTE_LABELS["/"] }];
  let acc = "";
  for (const segment of path.split("/").filter(Boolean)) {
    acc += `/${segment}`;
    const label = ROUTE_LABELS[acc];
    if (label) {
      trail.push({ href: acc, label });
    }
  }
  return trail;
}
