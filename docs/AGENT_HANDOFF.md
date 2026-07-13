# Agent Handoff

This file records practical handoff context for future agents working on the Sapiens Scientia website.

## Current State

- The site is a Next.js App Router application using React, Tailwind CSS, and React Three Fiber.
- Project memory is local to this repository under `docs/`.
- The homepage is `src/components/lab/you-are-here.tsx` ("The History of the
  Universe — a scroll through everything"; formerly "You Are Here", and the
  file and export keep that original slug): one scroll-driven journey from the
  Big Bang through cosmic and geologic time, then down the reader's cosmic
  address to a live sunlit globe (`src/components/lab/lab-earth-view.tsx`),
  ending with an "enter meta earth" handoff button. Landing on `/#end` opens
  directly on the finale. See "Homepage Structure" in `docs/ARCHITECTURE.md`
  before touching it. `/lab/you-are-here` (where it was incubated) redirects
  to `/`.
- The former flow pages (`/observable-universe`, `/history-of-planet-earth`,
  `/earth-orbit`, `/current-earth-sunlight`) and the previous `CosmicJourney`
  landing experience were removed when the You Are Here journey replaced them.
- `/meta-earth` continues the journey's globe: the Current Sunlight earth
  model (`LabEarthView` with `digitalShell`) wrapped in a geodesic digital-web
  shell, under the Meta Earth overlay panels, clock, theme toggle, and
  platform bridge interactions. Reached from the end of the homepage journey,
  opening from the same camera so only the overlays and shell change. Its
  top-left link goes back to the journey's start ("The History of the
  Universe" → `/`); the journey's `/#end` finale deep-link still works but is
  no longer linked from here.
- The main platform model is `Persona`, `Societas`, `Terra`, with `Salus` and `Domus` nested inside Persona, `Soma` nested inside Salus, and `Morbus` nested inside Soma.
- Public project routes include the Data Index, EarthView 3D, and Big Bang
  Universe.

## Read Before Conceptual Changes

Before changing platform names, ontology terms, major narrative language, brand voice, or conceptual architecture, read:

- `docs/CONTENT_MODEL.md`
- `docs/DECISIONS.md`
- `docs/ROUTES.md`
- `AGENTS.md`

If the implementation reveals a conceptual mismatch or durable constraint, update `docs/AGENT_HANDOFF.md` or `docs/DECISIONS.md` in the same change.

## Current Implementation Notes

- `src/components/meta-earth-hero.tsx` owns the Meta Earth hero shell: the
  `LabEarthView` globe canvas (with the `digitalShell` prop), theme toggle,
  the central wheel-zoom zone, and the panel-hover zoom interlock. The former
  `earth-hero.tsx` / `earth-scene.tsx` (Physical Earth, Digital Halo,
  connectors, solar orbit model) were removed when the shell replaced the
  halo.
- `src/app/page.tsx` renders `YouAreHereExperience`. Scroll owns all input
  during the journey (its raw-Three canvas is non-interactive); only the
  finale globe is drag-interactive, with the wheel left to page scroll.
- `src/components/lab/lab-earth-view.tsx` is a duplicate of the EarthView
  `UnifiedEarthView` tuned for the homepage finale (chart-continuation camera,
  home-marker projection for the webcam porthole). Changes to one do not
  affect the other; `/projects/earthview` still uses the original.
- `src/components/earthview/` contains the imported EarthView 3D React/Three
  project. `/projects/earthview` renders it directly rather than using an
  iframe. Keep the copied textures in `public/earth-blue-marble-5400x2700.jpg`
  and `public/assets/milky-way.jpg` available for the scene.
- `/projects/big-bang-universe` wraps the standalone, dependency-free
  BigBangUniverse HTML app copied to
  `public/standalone/big-bang-universe/index.html`. The sitewide Universe
  Timeline is hidden on that route so the standalone app's controls are not
  covered.
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

- Add a lightweight visual regression check for the History of Planet Earth
  Galaxy view and Meta Earth hero.
- Keep `docs/ROUTES.md` current when adding or removing public pages.
- Consider adding tests around route metadata or data-module shape if the site continues to grow.
