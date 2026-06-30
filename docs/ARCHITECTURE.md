# Architecture

This document describes how the Sapiens Scientia website is built and where future agents should look before changing implementation structure.

## Stack

- Framework: Next.js App Router.
- Language: TypeScript.
- UI: React and Tailwind CSS.
- 3D: React Three Fiber, Drei, and Three.js.
- Fonts: Geist via `geist/font`.
- Package manager: npm with `package-lock.json`.

Useful commands:

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Source Layout

| Path | Role |
|---|---|
| `src/app/` | App Router pages, metadata, API routes, robots, and sitemap. |
| `src/components/` | Shared page sections, interactive components, 3D scene components, and navigation/footer. |
| `src/lib/` | Editorial data models, taxonomy, route constants, simulations, and shared domain helpers. |
| `src/hooks/` | Client hooks for live data and UI state. |
| `public/` | Static fonts, images, and textures. |
| `docs/` | Durable internal project memory. |

## Rendering Model

The site is mostly static pages with client-side interactive islands.

- `src/app/page.tsx` renders the homepage shell and imports `EarthHero`.
- `src/app/layout.tsx` renders the sitewide `UniverseTimeline`, a fixed
  bottom rail of colored universe-history milestones that floats over all
  routes and links into `/chronos`.
- `src/app/page.tsx` renders `HomeBigBangExperience`, a client-side landing
  gate with the "Initiate Big Bang" sequence before revealing the current
  homepage experience.
- `EarthHero` is a client component because it owns the 3D canvas, theme state, timeline state, and pointer interlock between overlays and orbit controls.
- `src/app/projects/earthview/page.tsx` renders the imported EarthView 3D
  React/Three experience directly from `src/components/earthview/`; it is not
  an iframe wrapper.
- Content pages use server components where possible, with client components for interactive visualizations.
- `src/app/api/vital-signs/route.ts` provides a route for vital-sign data.

## Homepage Structure

The homepage is the most sensitive surface.

- `src/components/earth-hero.tsx`: full-screen hero shell and React Three Fiber canvas.
- `src/components/home-big-bang-experience.tsx`: landing initiation gate and
  reveal choreography around the existing homepage hero and overview.
- `src/components/universe-timeline.tsx`: sitewide fixed universe-history
  timeline rendered from the root layout.
- `src/components/earth-scene.tsx`: Three.js objects and animation.
- `src/components/earth-overlay.tsx`: panels, clock, timeline, popouts, and bridge connectors.
- `src/components/home-nav.tsx`: compact nav shown over the hero.
- `src/components/home-overview.tsx`: content below the hero.

When editing the homepage, verify in a browser. Build and lint can pass even if the canvas is visually blank or incorrectly sized.

## EarthView 3D

The `/projects/earthview` route imports the standalone EarthView 3D codebase
into this website rather than embedding the separate app in an iframe.

- Source lives under `src/components/earthview/`.
- Global EarthView-specific class styles live in `src/app/earthview.css`, which
  is imported by the root layout.
- Runtime textures are copied into `public/earth-blue-marble-5400x2700.jpg` and
  `public/assets/milky-way.jpg`.
- The sitewide `UniverseTimeline` is hidden on `/projects/earthview` so it does
  not cover EarthView's own bottom mode controls.

## Shared Page System

`src/components/page-kit.tsx` provides shared pieces for content-heavy pages:

- `PageShell`
- `PageHeader`
- `SourceList`

Pages using this shell include `/scales`, `/chronos`, and `/vitals`.

## Data And Content Sources

Most durable content lives in `src/lib/` modules instead of page-local arrays.

| Module | Feeds |
|---|---|
| `ontology/` | The full Sapiens Scientia Ontology across three domains (`earth-systems`, `platforms`, `digital-systems`) plus `relationships`, with a shared label registry in `index.ts`. Single source of truth for `scales.ts` and `earth-systems.ts`; rendered to `docs/ONTOLOGY.md` by `npm run gen:ontology`. |
| `platforms.ts` | Platform names, labels, colors, and cross-platform couplings. |
| `scales.ts` | Ladder of Scale tiers (projected from `ontology.ts`), length-anchored rungs, and sources. |
| `chronos.ts` | Arc of Time eons, moments, platforms, and sources. |
| `earth-systems.ts` | Projection logic for the homepage Earth/Digital system trees and platform bridge highlights (all derived from `ontology/`). |
| `data-index.ts` | Data Index categories, entries, slugs, and counts. |
| `vital-signs.ts` | Planetary vital-sign domains, indicator values, history, projection, and sources. |
| `morbus.ts` | Morbus disease groups, exemplars, axes, crosswalks, and counts. |
| `projects.ts` | Public project links and EarthView route/external URL. |

Prefer updating these modules over duplicating content in individual pages.

## Theme Model

Theme state is driven by:

- `src/app/layout.tsx`: pre-paint script applies `.light-theme` to `<html>`.
- `src/lib/use-theme.ts`: client hook reads and toggles the current theme.
- `src/app/globals.css`: dark defaults plus `.light-theme` overrides.

The 3D scene receives the active theme and changes background, lights, labels, and digital sphere colors.

## Local Development Notes

- Fresh Codex worktrees may not have `node_modules`; run `npm install` before checks.
- Use `npm run dev -- -p <port>` when the default port is busy.
- If using `127.0.0.1` with Next dev, keep `allowedDevOrigins` in `next.config.ts` current.
- Browser verification matters for Three.js surfaces and responsive overlay layout.
