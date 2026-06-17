"use client";

import Link from "next/link";

const links = [
  { href: "/scales", label: "Scales" },
  { href: "/platforms", label: "Platforms" },
  { href: "/platforms/salus/morbus", label: "Morbus" },
  { href: "/projects", label: "Projects" },
];

export function HomeNav() {
  return (
    <nav
      aria-label="Site navigation"
      className="pointer-events-auto absolute left-6 top-8 z-50 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 max-lg:left-4 max-lg:top-4"
    >
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="rounded border border-white/10 bg-black/40 px-2.5 py-1.5 backdrop-blur-sm transition-colors hover:border-white/25 hover:text-white"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
