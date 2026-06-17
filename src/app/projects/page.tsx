import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { projectLinks } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects | Sapiens Scientia",
  description:
    "Public Sapiens Scientia projects, including the data index and EarthView 3D.",
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav />

      <section className="mx-auto flex max-w-3xl flex-col gap-10">
        <div>
          <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-blue-400">
            Sapiens Scientia
          </p>
          <h1 className="text-5xl font-semibold tracking-normal sm:text-7xl">Projects</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Public tools and indexes that extend the homepage — curated knowledge infrastructure
            and immersive Earth exploration.
          </p>
        </div>

        <div className="divide-y divide-white/15 border-y border-white/15">
          {projectLinks.map((project) => (
            <Link
              key={project.href}
              href={project.href}
              className="flex flex-col gap-2 py-6 transition-colors hover:text-blue-300 sm:gap-3"
            >
              <div className="flex items-center justify-between gap-6">
                <span className="text-xl font-medium text-slate-100 sm:text-2xl">{project.label}</span>
                <span className="shrink-0 text-sm uppercase tracking-[0.2em] text-blue-400">View</span>
              </div>
              <p className="max-w-2xl text-base leading-7 text-slate-400">{project.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
