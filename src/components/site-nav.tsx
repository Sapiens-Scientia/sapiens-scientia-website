import Link from "next/link";

type SiteNavLink = {
  href: string;
  label: string;
};

type SiteNavProps = {
  links?: SiteNavLink[];
};

const primaryLinks: SiteNavLink[] = [
  { href: "/", label: "Home" },
  { href: "/platforms", label: "Platforms" },
  { href: "/projects", label: "Projects" },
];

export function SiteNav({ links = primaryLinks }: SiteNavProps) {
  return (
    <nav
      aria-label="Primary navigation"
      className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-300 sm:mb-14"
    >
      {links.map((link) => (
        <Link
          key={`${link.href}-${link.label}`}
          href={link.href}
          className="transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
