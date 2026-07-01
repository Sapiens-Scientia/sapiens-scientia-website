# Agent Handoff

This file records practical handoff context for future agents working on the Sapiens Scientia website.

## Current State

- The site is a Next.js App Router application using React, Tailwind CSS, and React Three Fiber.
- Project memory is local to this repository under `docs/`.
- The homepage starts with the Big Bang intro, which resolves into the
  Observable Universe view. From there the central target ring links to the
  homepage-only Galaxy view / History of Planet Earth via `/?intro=skip`, which
  then links onward to Meta Earth.
- `/meta-earth` is the former homepage: a full-screen 3D experience with overlay
  panels, time controls, theme support, and platform bridge interactions.
- The main platform model is `Persona`, `Societas`, `Terra`, with `Salus` and `Domus` nested inside Persona, `Soma` nested inside Salus, and `Morbus` nested inside Soma.
- Public project routes include the Data Index and EarthView 3D.

## Read Before Conceptual Changes

Before changing platform names, ontology terms, major narrative language, brand voice, or conceptual architecture, read:

- `docs/CONTENT_MODEL.md`
- `docs/DECISIONS.md`
- `docs/ROUTES.md`
- `AGENTS.md`

If the implementation reveals a conceptual mismatch or durable constraint, update `docs/AGENT_HANDOFF.md` or `docs/DECISIONS.md` in the same change.

## Current Implementation Notes

- `src/components/earth-hero.tsx` owns the Meta Earth hero shell, React Three Fiber canvas, theme toggle, and timeline state.
- `src/components/home-big-bang-experience.tsx` wraps the homepage in the
  "Initiate Big Bang" landing gate and reveals the homepage Galaxy view after
  the intro animation.
- `src/components/home-galaxy-view.tsx` is the homepage-only duplicated Galaxy
  scene. It uses the lower-level EarthView `UnifiedEarthView` but does not
  change `/projects/earthview` or its standalone EarthView app wrapper.
- `src/components/universe-timeline.tsx` is rendered from `src/app/layout.tsx`
  as the sitewide fixed bottom Universe Timeline. It intentionally floats above
  most routes, links to `/chronos`, and uses a horizontally scrollable milestone
  rail on narrow screens. It is hidden on `/projects/earthview` so EarthView's
  own bottom mode controls remain usable.
- `src/components/earthview/` contains the imported EarthView 3D React/Three
  project. `/projects/earthview` renders it directly rather than using an
  iframe. Keep the copied textures in `public/earth-blue-marble-5400x2700.jpg`
  and `public/assets/milky-way.jpg` available for the scene.
- `src/components/earth-scene.tsx` owns the 3D scene: Physical Earth, Digital Halo, Meta Earth label, data connectors, solar orbit model, and orbit controls.
- `src/components/earth-overlay.tsx` owns Meta Earth overlays: Earth Systems, Digital Systems, Sapiens Platforms, vital signs popout, data index popout, and clock.
- `src/lib/earth-systems.ts` is the Meta Earth taxonomy source for Earth Systems, Digital Systems, and platform bridge highlighting.
- `src/lib/vital-signs.ts` feeds both `/vitals` and Meta Earth vital-sign overlays.
- `src/lib/data-index.ts` feeds `/projects/sapiens-scientia-data-index` and the Digital Halo/data index surfaces.
- `src/lib/soma.ts` feeds `/platforms/persona/salus/soma` and the Soma section on `/platforms/persona/salus`.
- The Soma hero uses `public/models/soma-anatomy.glb`, a Meshopt-compressed
  derivative of the CC BY-SA Z-Anatomy atlas. Attribution and license details are
  in `public/models/README.md`. Regenerate it from a downloaded Z-Anatomy
  `Startup.blend` with `scripts/build-soma-anatomy.py`; Blender is required only
  for that asset-build step, not at website runtime.
- The Salus global-health section uses the WorldPop Global 2 graphic at
  `public/images/salus/worldpop-population-2025.webp`. It depicts estimated 2025
  residential population in 100 × 100 metre cells; keep the visible source link
  in `src/components/salus-population-map.tsx` if the presentation changes.
- Light mode is an independent warm-paper editorial theme. Shared canvas,
  surface, ink, border, diagram, and accent tokens live in
  `src/app/globals.css`; extend those semantic tokens rather than adding
  component-specific inverse colors.

## Recent Context To Preserve

- Project memory is local to this repository.
- The footer contains only site navigation links.
- Local docs are meant to be practical and short enough for future agents to actually read.

## Known Development Notes

- Run `npm install` before checks in fresh Codex worktrees; dependencies may not be present.
- Standard checks are `npm run lint` and `npm run build`.
- The homepage and Meta Earth can fail visually even when lint/build pass,
  especially around Three canvases. Browser verification is important for hero
  changes.
- When serving the app locally through `127.0.0.1`, Next dev may need `allowedDevOrigins` in `next.config.ts`.
- **Git workflow rule**: Do not commit, merge, or push changes to remote until the user explicitly requests it.

## Good Next Improvements

- Add a lightweight visual regression check for the homepage Galaxy view and
  Meta Earth hero.
- Keep `docs/ROUTES.md` current when adding or removing public pages.
- Consider adding tests around route metadata or data-module shape if the site continues to grow.
