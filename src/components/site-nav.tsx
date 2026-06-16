"use client";

import Link from "next/link";
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

  useEffect(() => {
    // Check local storage or document class on mount
    const savedTheme = localStorage.getItem("sapiens-theme");
    const isLight = savedTheme === "light" || document.documentElement.classList.contains("light-theme");
    if (isLight) {
      document.documentElement.classList.add("light-theme");
      setTheme("light");
    } else {
      document.documentElement.classList.remove("light-theme");
      setTheme("dark");
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

  return (
    <nav
      aria-label="Primary navigation"
      className="mb-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm font-medium text-slate-300 sm:mb-14"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {links.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-300"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <button
        onClick={toggleTheme}
        className="theme-toggle-btn pointer-events-auto rounded border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold tracking-wide text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white cursor-pointer"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      >
        {theme === "dark" ? "☀ Light Mode" : "☾ Dark Mode"}
      </button>
    </nav>
  );
}

