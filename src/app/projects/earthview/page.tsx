import Link from "next/link";
import type { Metadata } from "next";
import { EarthView3DApp } from "@/components/earthview/earthview-3d-app";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

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
              A detailed terrain and globe layer for the Physical Earth, now rendered directly
              inside Sapiens Scientia.
            </p>
          </div>
        </header>
      </div>

      <div className="relative mx-auto w-full max-w-7xl flex-1 px-4 pb-4 sm:px-6">
        <section className="h-[min(76vh,860px)] min-h-[560px] overflow-hidden border border-white/10 bg-black">
          <EarthView3DApp />
        </section>
        <p className="mt-3 text-center text-xs text-slate-500">
          Return to the{" "}
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
