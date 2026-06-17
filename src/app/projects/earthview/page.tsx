import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { EARTHVIEW_EXTERNAL_URL } from "@/lib/projects";

export const metadata: Metadata = {
  title: "EarthView 3D | Sapiens Scientia",
  description:
    "Explore detailed terrain and globe visualization — the zoom lens for the Physical Earth on the Sapiens Scientia homepage.",
};

export default function EarthViewPage() {
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      <div className="px-6 py-8 sm:px-10">
        <SiteNav
          links={[
            { href: "/", label: "Home" },
            { href: "/projects", label: "Projects" },
            { href: "/platforms/terra", label: "Terra" },
          ]}
        />

        <header className="mx-auto mb-6 flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.24em] text-blue-400">
              Physical Earth
            </p>
            <h1 className="text-4xl font-semibold tracking-normal sm:text-5xl">EarthView 3D</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
              A detailed terrain and globe layer for the Physical Earth. Click the homepage globe or
              open the full experience in a new tab.
            </p>
          </div>
          <a
            href={EARTHVIEW_EXTERNAL_URL}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 border border-white/15 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-blue-300/40 hover:text-white"
          >
            Open full screen ↗
          </a>
        </header>
      </div>

      <div className="relative mx-auto w-full max-w-7xl flex-1 px-4 pb-4 sm:px-6">
        <iframe
          title="EarthView 3D"
          src={EARTHVIEW_EXTERNAL_URL}
          className="h-[min(72vh,820px)] w-full border border-white/10 bg-black"
          allow="fullscreen"
          loading="lazy"
        />
        <p className="mt-3 text-center text-xs text-slate-500">
          Powered by{" "}
          <Link
            href={EARTHVIEW_EXTERNAL_URL}
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 underline-offset-2 hover:text-blue-300 hover:underline"
          >
            EarthView 3D
          </Link>
          . Return to the{" "}
          <Link href="/" className="text-slate-400 underline-offset-2 hover:text-blue-300 hover:underline">
            homepage globe
          </Link>
          .
        </p>
      </div>

      <div className="px-6 pb-8 sm:px-10">
        <div className="mx-auto max-w-7xl">
          <SiteFooter />
        </div>
      </div>
    </main>
  );
}
