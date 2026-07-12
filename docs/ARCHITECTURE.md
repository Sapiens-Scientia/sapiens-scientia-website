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

- `src/app/page.tsx` renders `YouAreHereExperience`
  (`src/components/lab/you-are-here.tsx`), the scroll-driven homepage journey:
  one unbroken shot from the Big Bang through cosmic and geologic time, then a
  descent down the reader's cosmic address to a live sunlit globe, ending with
  an "enter meta earth" handoff button. See "Homepage Structure" below. The
  former flow pages (`/observable-universe`, `/history-of-planet-earth`,
  `/earth-orbit`, `/current-earth-sunlight`) and the `CosmicJourney` landing
  component were removed when this journey replaced them;
  `/lab/you-are-here` (its birthplace) redirects to `/`.
- `src/app/projects/big-bang-universe/page.tsx` renders the integrated
  `BigBangUniverseExperience` inside a React/Next project page shell in embedded
  mode, so the public project route keeps the site navigation, page rhythm, and
  footer without using an iframe.
- `src/app/meta-earth/page.tsx` renders `MetaEarthExperience`, the former
  homepage Physical Earth / Digital Halo / Meta Earth product surface.
- `EarthHero` is a client component because it owns the Meta Earth 3D canvas, theme state, timeline state, and pointer interlock between overlays and orbit controls.
- `src/app/projects/earthview/page.tsx` renders the imported EarthView 3D
  React/Three experience directly from `src/components/earthview/`; it is not
  an iframe wrapper.
- Content pages use server components where possible, with client components for interactive visualizations.
- `src/app/api/vital-signs/route.ts` provides a route for vital-sign data.

## Homepage Structure

The homepage is the most sensitive surface.

- `src/components/lab/you-are-here.tsx`: the whole landing experience. A tall
  scroll container (~2100vh) drives a sticky full-viewport stage with a single
  raw-Three canvas: scroll fraction `p` maps piecewise to log-seconds since
  the Big Bang, then millions-of-years-ago for Earth history, then log-metres
  for the space descent, driven imperatively via refs. A nested-scale "zoom
  stack" of pinned sets carries the descent; the finale mounts
  `src/components/lab/lab-earth-view.tsx` (a duplicate of `UnifiedEarthView`
  tuned for this UX) from the orbit chart's own continuation camera
  (`src/components/lab/earth-geometry.ts`). Persistent chrome — spacetime
  altimeter, cosmic address, big readout — fades in after the first scroll;
  the end shows "begin again" and the "enter meta earth" handoff link.
- `src/components/big-bang-universe-experience.tsx`: React-owned DOM shell for
  the Big Bang Universe canvas runtime. The public project route uses
  `embedded`, which hides the runtime's duplicate internal title; the runtime's
  end-of-timeline click-through now lands on `/`.
- `src/lib/big-bang-universe-runtime.ts`: mechanically ported imperative canvas
  runtime from the former standalone HTML file. It mounts into the React shell
  and owns canvas drawing, card generation, controls, and animation state. It
  returns a controller `{ dispose, setProgress, getTodayRimRect, getReadout }`;
  `journeyMode` hands progress ownership to an external scroll driver.
- `src/app/big-bang-universe.css`: scoped CSS for the integrated Big Bang
  Universe runtime. It is imported by the root layout with the other global CSS.
- `public/standalone/big-bang-universe/index.html`: legacy standalone copy kept
  as a static compatibility artifact; it is no longer used by the homepage or
  the public Big Bang project page.
- `src/hooks/use-sunlight-preview.ts`: the Earth sunlight preview animation
  state machine driving the homepage finale's One Day / One Year controls.
- `src/components/earth-hero.tsx`: full-screen Meta Earth hero shell and React Three Fiber canvas.
- `src/components/earth-scene.tsx`: Three.js objects and animation.
- `src/components/earth-overlay.tsx`: panels, clock, timeline, popouts, and bridge connectors.
- `src/components/home-nav.tsx`: compact nav shown over the hero.
- `src/components/home-overview.tsx`: content below the hero.

When editing the homepage or Meta Earth, verify in a browser. Build and lint can pass even if a Three canvas is visually blank or incorrectly sized.

## EarthView 3D

The `/projects/earthview` route imports the standalone EarthView 3D codebase
into this website rather than embedding the separate app in an iframe.

- Source lives under `src/components/earthview/`.
- Global EarthView-specific class styles live in `src/app/earthview.css`, which
  is imported by the root layout.
- Runtime textures are copied into `public/earth-blue-marble-5400x2700.jpg` and
  `public/assets/milky-way.jpg`.

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
| `earth-systems.ts` | Projection logic for the Meta Earth system trees and platform bridge highlights (all derived from `ontology/`). |
| `data-index.ts` | Data Index categories, entries, slugs, and counts. |
| `vital-signs.ts` | Planetary vital-sign domains, indicator values, history, projection, and sources. |
| `morbus.ts` | Morbus disease groups, exemplars, axes, crosswalks, and counts. |
| `projects.ts` | Public project links and EarthView route path. |

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
