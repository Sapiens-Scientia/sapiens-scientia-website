import Link from "next/link";

// Sitewide footer for content pages. The cinematic homepage keeps its own
// full-screen navigation model, so this is rendered on the content pages via
// PageShell and the platform/project pages directly.

type FooterLink = { href: string; label: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Platforms",
    links: [
      { href: "/platforms/salus", label: "Salus — Health" },
      { href: "/platforms/societas", label: "Societas — Society" },
      { href: "/platforms/terra", label: "Terra — Earth" },
      { href: "/platforms/salus/morbus", label: "Morbus — Disease" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/scales", label: "The Ladder of Scale" },
      { href: "/chronos", label: "The Arc of Time" },
      { href: "/vitals", label: "Planetary Vital Signs" },
      { href: "/platforms", label: "Cross-Platform Map" },
      { href: "/projects", label: "Projects" },
      { href: "/projects/sapiens-scientia-data-index", label: "Data Index" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: "https://github.com/Sapiens-Scientia/sapiens-scientia-docs", label: "Documentation", external: true },
      { href: "https://earthview3d.vercel.app/", label: "EarthView 3D", external: true },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-white/10 pt-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <p className="bg-gradient-to-r from-emerald-300/84 to-blue-300/88 bg-clip-text text-lg font-semibold uppercase tracking-[0.16em] text-transparent">
              Sapiens Scientia
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              A public knowledge project mapping human health, society, and Earth
              systems across every scale — from cells to the planet.
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {column.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-slate-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-slate-300 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Sapiens Scientia. A public knowledge project.</p>
          <p className="font-mono uppercase tracking-[0.16em]">
            Particles → the Sun
          </p>
        </div>
      </div>
    </footer>
  );
}
