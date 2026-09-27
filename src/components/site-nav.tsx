"use client";

import Link from "next/link";
import { ChevronDown, Menu as MenuIcon, Moon, Sun, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
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

// The complete public route inventory, grouped so every page is reachable from
// the nav. Nested sections (the Persona body tree, Projects) collapse into
// dropdowns; everything else stays a top-level link. Keep in sync with the app
// directory and docs/ROUTES.md.
const primaryNav: SiteNavItem[] = [
  {
    href: "/meta-earth", label: "Atlas",
    children: [
      { href: "/meta-earth", label: "Meta Earth · Start exploring" },
      { href: "/ontology", label: "The Map · Concepts & relationships" },
      { href: "/", label: "The History of the Universe" },
      { href: "/projects", label: "All projects" },
      { href: "/projects/earthview", label: "EarthView 3D", indent: true },
      { href: "/projects/big-bang-universe", label: "Big Bang Universe", indent: true },
    ],
  },
  {
    href: "/platforms",
    label: "Platforms",
    children: [
      { href: "/platforms", label: "All platforms" },
      { href: "/platforms/persona", label: "Persona" },
      { href: "/platforms/persona/salus", label: "Salus · Health", indent: true },
      { href: "/platforms/persona/salus/soma", label: "Soma · Body", indent: true },
      { href: "/platforms/persona/salus/soma/morbus", label: "Morbus · Disease", indent: true },
      { href: "/platforms/persona/domus", label: "Domus · Home", indent: true },
      { href: "/platforms/societas", label: "Societas" },
      { href: "/platforms/terra", label: "Terra" },
    ],
  },
  { href: "/scales", label: "Scale" },
  { href: "/chronos", label: "Time" },
  {
    href: "/vitals", label: "Evidence",
    children: [
      { href: "/vitals", label: "Planetary Vital Signs" },
      { href: "/projects/sapiens-scientia-data-index", label: "Data Index · Public sources" },
    ],
  },
];

const linkBase =
  "relative flex min-h-11 items-center px-3 py-2 transition-colors lg:px-0";

function ActiveUnderline() {
  return (
    <span aria-hidden="true" className="absolute bottom-0 left-3 right-3 h-px bg-current lg:left-0 lg:right-0" />
  );
}

export function SiteNav() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const id = useId();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    if (!openMenu && !mobileOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (openMenu) {
        menuButtonRefs.current.get(openMenu)?.focus();
        setOpenMenu(null);
      } else {
        mobileButtonRef.current?.focus();
        setMobileOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu, mobileOpen]);

  const isWithin = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  // A route can sit under a broad group (Projects) and a more specific one
  // (Evidence). Highlight only the group with the closest matching destination.
  const activeGroup = primaryNav.map((item) => ({
    href: item.href,
    match: Math.max(-1, ...[item, ...(item.children ?? [])]
      .filter((link) => isWithin(link.href)).map((link) => link.href.length)),
  })).sort((a, b) => b.match - a.match)[0];

  const closeNavigation = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Primary navigation"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) closeNavigation();
      }}
      className="site-nav sticky top-0 z-50 mx-auto mb-8 max-w-[1376px] border-b border-white/15 py-3 text-sm font-normal text-slate-300 sm:mb-12 lg:flex lg:items-center lg:justify-between lg:gap-8"
    >
      <div className="flex items-center justify-between gap-3 lg:contents">
        <Link href="/meta-earth" onClick={closeNavigation} className="flex min-h-11 shrink-0 items-center gap-2.5 text-base tracking-tight text-slate-100 sm:text-lg lg:order-1">
          {/* Native image keeps this tiny vector identical to the browser icon. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/sapiens-scientia.svg" width="32" height="32" className="h-8 w-8 shrink-0" alt="" />
          Sapiens Scientia
        </Link>
        <div className="flex items-center gap-1 lg:order-3">
          <button type="button" onClick={toggleTheme}
            className="theme-toggle-btn flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>
            {theme === "dark" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
          </button>
          <button ref={mobileButtonRef} type="button" aria-expanded={mobileOpen} aria-controls={`${id}-links`}
            onClick={() => { setMobileOpen(!mobileOpen); setOpenMenu(null); }}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 text-xs text-slate-100 lg:hidden">
            <span className="sr-only">{mobileOpen ? "Close" : "Menu"}</span>
            {mobileOpen ? <X size={20} aria-hidden="true" /> : <MenuIcon size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div
        id={`${id}-links`}
        className={`${mobileOpen ? "flex" : "hidden"} max-h-[calc(100dvh-9rem)] flex-col gap-1 overflow-y-auto border-t border-white/10 pb-2 pt-3 lg:order-2 lg:flex lg:max-h-none lg:flex-row lg:items-center lg:gap-8 lg:overflow-visible lg:border-0 lg:p-0`}
      >
        {primaryNav.map((item, index) => {
          if (!item.children) {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeNavigation}
                aria-current={active ? "page" : undefined}
                className={`${linkBase} ${active ? "font-semibold text-white" : "text-slate-400 hover:bg-white/[0.04] hover:text-white lg:hover:bg-transparent"}`}
              >
                {item.label}
                {active ? <ActiveUnderline /> : null}
              </Link>
            );
          }

          const open = openMenu === item.href;
          const sectionActive = activeGroup?.match >= 0 && activeGroup.href === item.href;
          const childActiveHref = item.children
            .filter((child) => isWithin(child.href))
            .sort((a, b) => b.href.length - a.href.length)[0]?.href;
          const panelId = `${id}-section-${index}`;

          return (
            <div key={item.href} className="relative" onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget) && open) setOpenMenu(null);
            }}>
              <button
                ref={(button) => {
                  if (button) menuButtonRefs.current.set(item.href, button);
                  else menuButtonRefs.current.delete(item.href);
                }}
                type="button"
                onClick={() => setOpenMenu(open ? null : item.href)}
                aria-expanded={open}
                aria-controls={panelId}
                className={`${linkBase} w-full cursor-pointer justify-between gap-2 ${sectionActive ? "font-semibold text-white" : "text-slate-400 hover:text-white"}`}
              >
                {item.label}
                <ChevronDown aria-hidden="true" size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                {sectionActive ? <ActiveUnderline /> : null}
              </button>
              <div
                id={panelId}
                hidden={!open}
                className="site-nav-dropdown ml-3 border-l border-white/15 pl-2 lg:absolute lg:left-0 lg:top-full lg:mt-2 lg:ml-0 lg:min-w-72 lg:rounded-lg lg:border lg:p-2 lg:shadow-xl"
              >
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={closeNavigation}
                    aria-current={pathname === child.href ? "page" : undefined}
                    className={`flex min-h-11 items-center rounded-md px-3 py-2 transition-colors ${child.indent ? "pl-6" : ""} ${child.href === childActiveHref ? "bg-white/[0.06] font-semibold text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"}`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
