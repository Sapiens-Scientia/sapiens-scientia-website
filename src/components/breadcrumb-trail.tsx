import { SiteNav } from "@/components/site-nav";
import Link from "next/link";
import { breadcrumbTrail, SITE_URL } from "@/lib/routes";

// Renders shared navigation and a separate breadcrumb trail, and emits the
// matching schema.org BreadcrumbList so the hierarchy is machine-readable.
// Deep pages pass their own path; the labels come from the shared route map.
export function BreadcrumbTrail({ path }: { path: string }) {
  const trail = breadcrumbTrail(path);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: `${SITE_URL}${crumb.href}`,
    })),
  };

  return (
    <>
      <SiteNav />
      <nav aria-label="Breadcrumb" className="mx-auto mb-7 max-w-7xl text-xs text-slate-400">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {trail.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true" className="text-slate-500">/</span> : null}
              {index === trail.length - 1 ? (
                <span aria-current="page" className="py-2 font-medium text-slate-200">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="inline-block py-2 hover:text-white">{crumb.label}</Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
