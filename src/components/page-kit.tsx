import type { CSSProperties, ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

// Shared layout + content primitives that capture the patterns repeated across
// the platform and project pages: the black page shell, the eyebrow/title/lede
// header, divider-led sections, the value/label/detail stat card, source rows,
// and scope pills. Per-platform accents are passed as hex colors so the same
// primitives can render Salus sky, Societas indigo, and Terra emerald surfaces.

type SiteNavLink = { href: string; label: string };

const DEFAULT_ACCENT = "#60a5fa"; // text-blue-400, the site default eyebrow tone

const maxWidthClass = {
  prose: "max-w-3xl",
  wide: "max-w-6xl",
  full: "max-w-7xl",
} as const;

type MaxWidth = keyof typeof maxWidthClass;

/** Hex with an alpha suffix, e.g. "#34d39926" — used for subtle accent borders. */
function withAlpha(hex: string, alpha: string) {
  return `${hex}${alpha}`;
}

export function PageShell({
  navLinks,
  maxWidth = "full",
  gap = "gap-10",
  children,
}: {
  navLinks?: SiteNavLink[];
  maxWidth?: MaxWidth;
  gap?: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav links={navLinks} />
      <section className={`mx-auto flex ${maxWidthClass[maxWidth]} flex-col ${gap}`}>
        {children}
      </section>
      <SiteFooter />
    </main>
  );
}

export function PageHeader({
  eyebrow,
  accent = DEFAULT_ACCENT,
  title,
  children,
}: {
  eyebrow: string;
  accent?: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="max-w-4xl">
      <p
        className="mb-3 text-xl font-medium uppercase tracking-[0.24em]"
        style={{ color: accent }}
      >
        {eyebrow}
      </p>
      <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">{title}</h1>
      {children ? (
        <div className="mt-8 max-w-2xl text-lg leading-8 text-slate-300">
          {children}
        </div>
      ) : null}
    </header>
  );
}

export function Section({
  title,
  intro,
  accent,
  divider = true,
  children,
}: {
  title: ReactNode;
  intro?: ReactNode;
  accent?: string;
  divider?: boolean;
  children?: ReactNode;
}) {
  const style: CSSProperties | undefined =
    divider && accent ? { borderColor: withAlpha(accent, "26") } : undefined;

  return (
    <section
      className={`flex flex-col gap-7 ${divider ? "border-t pt-10" : ""} ${
        divider && !accent ? "border-white/10" : ""
      }`}
      style={style}
    >
      <div className="max-w-3xl">
        <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">
          {title}
        </h2>
        {intro ? (
          <p className="mt-4 text-base leading-7 text-slate-300">{intro}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Responsive grid wrapper that matches the 1/2/3-column card grids site-wide. */
export function CardGrid({
  columns = 3,
  children,
}: {
  columns?: 2 | 3;
  children: ReactNode;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : "sm:grid-cols-2 lg:grid-cols-3";
  return <div className={`grid gap-3 ${cols}`}>{children}</div>;
}

export type Stat = {
  value: string;
  label: string;
  detail: string;
  source: string;
};

export function StatCard({ stat, accent }: { stat: Stat; accent?: string }) {
  return (
    <article className="border border-white/10 bg-white/[0.035] p-5 shadow-[0_0_28px_rgba(15,23,42,0.22)]">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-4xl font-semibold tracking-normal text-white">
          {stat.value}
        </p>
        <p
          className="text-xs font-medium uppercase tracking-[0.16em]"
          style={{ color: accent ? withAlpha(accent, "b3") : undefined }}
        >
          {stat.source}
        </p>
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-100">{stat.label}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{stat.detail}</p>
    </article>
  );
}

export type Source = { label: string; href: string };

export function SourceList({
  sources,
  hoverClass = "hover:text-sky-200",
}: {
  sources: Source[];
  hoverClass?: string;
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs leading-5 text-slate-500">
      {sources.map((source) => (
        <a
          key={source.href}
          href={source.href}
          target="_blank"
          rel="noreferrer"
          className={`transition-colors ${hoverClass}`}
        >
          {source.label}
        </a>
      ))}
    </div>
  );
}

export function TagList({
  items,
  accent = "#34d399",
}: {
  items: string[];
  accent?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {items.map((item) => (
        <span
          key={item}
          className="border px-3 py-1.5 text-sm leading-5 text-slate-200"
          style={{
            borderColor: withAlpha(accent, "26"),
            backgroundColor: withAlpha(accent, "0d"),
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
