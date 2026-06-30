"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/use-theme";

type SiteNavLink = {
  href: string;
  label: string;
};

type SiteNavChild = SiteNavLink & {
  /** Indents the item inside the dropdown to show it sits under the item above. */
  indent?: boolean;
};

type SiteNavItem = SiteNavLink & {
  children?: SiteNavChild[];
};

type SiteNavProps = {
  /**
   * Flat link list. When provided, the nav renders these as a simple row —
   * used by deep pages that pass a breadcrumb trail. When omitted, the full
   * grouped site navigation (with dropdowns) is rendered instead.
   */
  links?: SiteNavLink[];
};

// The complete public route inventory, grouped so every page is reachable from
// the nav. Nested sections (the Persona body tree, Projects) collapse into
// dropdowns; everything else stays a top-level link. Keep in sync with the app
// directory and docs/ROUTES.md.
const primaryNav: SiteNavItem[] = [
  { href: "/", label: "Home" },
  {
    href: "/platforms",
    label: "Platforms",
    children: [
      { href: "/platforms", label: "All platforms" },
      { href: "/platforms/persona", label: "Persona" },
      { href: "/platforms/persona/salus", label: "Salus", indent: true },
      { href: "/platforms/persona/salus/soma", label: "Soma", indent: true },
      { href: "/platforms/persona/salus/soma/morbus", label: "Morbus", indent: true },
      { href: "/platforms/persona/domus", label: "Domus", indent: true },
      { href: "/platforms/societas", label: "Societas" },
      { href: "/platforms/terra", label: "Terra" },
    ],
  },
  { href: "/ontology", label: "The Map" },
  { href: "/scales", label: "Scales" },
  { href: "/chronos", label: "Chronos" },
  { href: "/vitals", label: "Vitals" },
  {
    href: "/projects",
    label: "Projects",
    children: [
      { href: "/projects", label: "All projects" },
      { href: "/projects/sapiens-scientia-data-index", label: "Data Index" },
      { href: "/projects/earthview", label: "EarthView 3D" },
    ],
  },
];

const linkBase =
  "relative py-1 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300";

const navHref = (href: string) => (href === "/" ? "/?intro=skip" : href);

function ActiveUnderline() {
  return (
    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-emerald-400 animate-pulse rounded-full" />
  );
}

export function SiteNav({ links }: SiteNavProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close any open dropdown on outside click or Escape. (Navigation closes it
  // via the link onClick handlers below, since the nav stays mounted across
  // client-side route changes.)
  useEffect(() => {
    if (!openMenu) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  const isExactActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href;

  const isWithin = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname?.startsWith(`${href}/`);

  // Within a dropdown, only the deepest matching child is highlighted so that,
  // e.g., on /platforms/persona/salus/soma only "Soma" lights up — not every
  // ancestor that is also a path prefix.
  const activeChildHref = (children: SiteNavChild[]) => {
    let best: string | null = null;
    for (const child of children) {
      if (isWithin(child.href) && (!best || child.href.length > best.length)) {
        best = child.href;
      }
    }
    return best;
  };

  const themeToggle = (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn pointer-events-auto rounded border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white cursor-pointer"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? "☀ Light Mode" : "☾ Dark Mode"}
    </button>
  );

  // Flat breadcrumb mode: deep pages pass their trail explicitly.
  if (links) {
    return (
      <nav
        aria-label="Primary navigation"
        className="sticky top-4 z-50 mb-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-white/10 bg-black/60 px-6 py-3 text-sm font-medium text-slate-300 backdrop-blur-md shadow-lg sm:mb-14 pointer-events-auto"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {links.map((link) => {
            const active = isWithin(link.href);
            return (
              <Link
                key={`${link.href}-${link.label}`}
                href={navHref(link.href)}
                className={`${linkBase} ${
                  active ? "text-white font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                {link.label}
                {active && <ActiveUnderline />}
              </Link>
            );
          })}
        </div>
        {themeToggle}
      </nav>
    );
  }

  return (
    <nav
      ref={navRef}
      aria-label="Primary navigation"
      className="sticky top-4 z-50 mb-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-white/10 bg-black/60 px-6 py-3 text-sm font-medium text-slate-300 backdrop-blur-md shadow-lg sm:mb-14 pointer-events-auto"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {primaryNav.map((item) => {
          if (!item.children) {
            const active = isExactActive(item.href);
            return (
              <Link
                key={item.href}
                href={navHref(item.href)}
                className={`${linkBase} ${
                  active ? "text-white font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                {item.label}
                {active && <ActiveUnderline />}
              </Link>
            );
          }

          const open = openMenu === item.href;
          const sectionActive = isWithin(item.href);
          const childActiveHref = activeChildHref(item.children);

          return (
            <div key={item.href} className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(open ? null : item.href)}
                aria-haspopup="menu"
                aria-expanded={open}
                className={`${linkBase} inline-flex items-center gap-1 cursor-pointer ${
                  sectionActive ? "text-white font-semibold" : "text-slate-400 hover:text-white"
                }`}
              >
                {item.label}
                <span
                  aria-hidden
                  className={`text-[0.6rem] leading-none transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
                {sectionActive && <ActiveUnderline />}
              </button>

              {open && (
                <div
                  role="menu"
                  aria-label={item.label}
                  className="absolute left-0 top-full mt-3 min-w-[12rem] flex flex-col gap-0.5 rounded-xl border border-white/10 bg-black/60 p-2 text-sm backdrop-blur-md shadow-xl"
                >
                  {item.children.map((child) => {
                    const active = child.href === childActiveHref;
                    return (
                      <Link
                        key={child.href}
                        href={navHref(child.href)}
                        role="menuitem"
                        onClick={() => setOpenMenu(null)}
                        className={`rounded-md px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${
                          child.indent ? "pl-6" : ""
                        } ${
                          active
                            ? "bg-white/[0.06] text-white font-semibold"
                            : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {themeToggle}
    </nav>
  );
}
