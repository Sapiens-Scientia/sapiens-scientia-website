"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type SiteNavLink = {
  href: string;
  label: string;
};

type SiteNavProps = {
  links?: SiteNavLink[];
};

const primaryLinks: SiteNavLink[] = [
  { href: "/", label: "Home" },
  { href: "/scales", label: "Scales" },
  { href: "/platforms", label: "Platforms" },
  { href: "/projects", label: "Projects" },
];

export function SiteNav({ links = primaryLinks }: SiteNavProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage or document class on mount
    const savedTheme = localStorage.getItem("sapiens-theme");
    const isLight = savedTheme === "light" || document.documentElement.classList.contains("light-theme");
    if (isLight) {
      document.documentElement.classList.add("light-theme");
      setTimeout(() => setTheme("light"), 0);
    } else {
      document.documentElement.classList.remove("light-theme");
      setTimeout(() => setTheme("dark"), 0);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light-theme");
      localStorage.setItem("sapiens-theme", "light");
    } else {
      document.documentElement.classList.remove("light-theme");
      localStorage.setItem("sapiens-theme", "dark");
    }
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="sticky top-4 z-50 mb-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border border-white/10 bg-black/60 px-6 py-3 text-sm font-medium text-slate-300 backdrop-blur-md shadow-lg sm:mb-14 pointer-events-auto"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={`${link.href}-${link.label}`}
              href={link.href}
              className={`relative py-1 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300 ${
                active
                  ? "text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {link.label}
              {active && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-400 to-emerald-400 animate-pulse rounded-full" />
              )}
            </Link>
          );
        })}
      </div>

      <button
        onClick={toggleTheme}
        className="theme-toggle-btn pointer-events-auto rounded border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white cursor-pointer"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      >
        {theme === "dark" ? "☀ Light Mode" : "☾ Dark Mode"}
      </button>
    </nav>
  );
}

