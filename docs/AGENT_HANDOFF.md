# Agent Handoff

This file records practical handoff context for future agents working on the Sapiens Scientia website.

## Current State

- The site is a Next.js App Router application using React, Tailwind CSS, and React Three Fiber.
- Project memory is local to this repository under `docs/`.
- The homepage is a full-screen 3D experience with overlay panels, time controls, theme support, and platform bridge interactions.
- The main platform model is `Persona`, `Societas`, `Terra`, with `Soma`, `Salus`, `Morbus`, and `Domus` nested inside Persona.
- Public project routes include the Data Index and EarthView 3D.

## Read Before Conceptual Changes

Before changing platform names, ontology terms, major narrative language, brand voice, or conceptual architecture, read:

- `docs/CONTENT_MODEL.md`
- `docs/DECISIONS.md`
- `docs/ROUTES.md`
- `AGENTS.md`

If the implementation reveals a conceptual mismatch or durable constraint, update `docs/AGENT_HANDOFF.md` or `docs/DECISIONS.md` in the same change.

## Current Implementation Notes

- `src/components/earth-hero.tsx` owns the homepage hero shell, React Three Fiber canvas, theme toggle, and timeline state.
- `src/components/earth-scene.tsx` owns the 3D scene: Physical Earth, Digital Halo, Meta Earth label, data connectors, solar orbit model, and orbit controls.
- `src/components/earth-overlay.tsx` owns homepage overlays: Earth Systems, Digital Systems, Sapiens Platforms, vital signs popout, data index popout, and clock.
- `src/lib/earth-systems.ts` is the homepage taxonomy source for Earth Systems, Digital Systems, and platform bridge highlighting.
- `src/lib/vital-signs.ts` feeds both `/vitals` and homepage vital-sign overlays.
- `src/lib/data-index.ts` feeds `/projects/sapiens-scientia-data-index` and the Digital Halo/data index surfaces.
- `src/lib/soma.ts` feeds `/platforms/persona/soma` and the Soma section on `/platforms/persona`.

## Recent Context To Preserve

- Project memory is local to this repository.
- The footer contains only site navigation links.
- Local docs are meant to be practical and short enough for future agents to actually read.

## Known Development Notes

- Run `npm install` before checks in fresh Codex worktrees; dependencies may not be present.
- Standard checks are `npm run lint` and `npm run build`.
- The homepage can fail visually even when lint/build pass, especially around the Three canvas. Browser verification is important for hero changes.
- When serving the app locally through `127.0.0.1`, Next dev may need `allowedDevOrigins` in `next.config.ts`.
- **Git workflow rule**: Do not commit, merge, or push changes to remote until the user explicitly requests it.

## Good Next Improvements

- Add a lightweight visual regression check for the homepage hero.
- Keep `docs/ROUTES.md` current when adding or removing public pages.
- Consider adding tests around route metadata or data-module shape if the site continues to grow.
