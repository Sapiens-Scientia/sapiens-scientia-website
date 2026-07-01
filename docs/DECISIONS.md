# Decisions

This file records durable project decisions for Sapiens Scientia. Add entries when a choice changes how future agents should reason about the site, taxonomy, architecture, or public narrative.

## Documentation Lives In This Repository

Sapiens Scientia project memory lives in this website repository under `docs/`.

The documentation model is:

- `AGENTS.md` for repository-level agent instructions.
- `docs/README.md` for the documentation map.
- `docs/ARCHITECTURE.md` for implementation structure.
- `docs/CONTENT_MODEL.md` for taxonomy, naming, and narrative model.
- `docs/ROUTES.md` for the public route inventory.
- `docs/AGENT_HANDOFF.md` for current handoff context.
- `docs/DECISIONS.md` for durable decisions.

There is no submodule, generated docs import, or build-time docs dependency.

## Transition from Salus to Persona as the Top-Level Platform

The core platform model has been transitioned from `Salus` to `Persona` at the top level to better represent the intimate human scale. The platform architecture is now:

- `Persona`: human persona platform, containing the modules Soma (body), Salus (health), Morbus (disease), and Domus (home).
- `Societas`: human society platform.
- `Terra`: environmental / Earth systems platform.

Do not rename these or introduce replacements unless the change intentionally updates `docs/CONTENT_MODEL.md`, relevant source modules, and public copy together.

## Keep The Homepage As A Real Product Surface

The first screen is the actual Sapiens Scientia experience, not a marketing landing page. The homepage begins with the Big Bang intro, then leads into the Observable Universe view before zooming into the Galaxy 3D History of Planet Earth route and onward to Meta Earth.

## Route The Opening Sequence Through Cosmic Scale

The opening sequence is now structured as `/` Big Bang intro -> `/observable-universe` -> `/history-of-planet-earth` -> `/meta-earth`.

Treat the History of Planet Earth Galaxy view as its own public route at `/history-of-planet-earth`, not as a query-string variant of the homepage. The Observable Universe view is the immediate post-Big-Bang destination, and its central target ring zooms into the History of Planet Earth page.

## Move The Original Homepage To Meta Earth

The original interactive Physical Earth / Digital Halo / Meta Earth model plus the Sapiens Platforms bridge now lives at `/meta-earth`. Treat Meta Earth as the home for that product surface, its overview, and its Earth/Digital side-panel maps.

## Treat Light Mode As A Distinct Editorial Theme

Light mode is a first-class visual system, not a direct inversion of dark mode.
It uses a warm paper canvas, raised white surfaces, ink-based text hierarchy,
stronger warm-gray borders, and darker platform accents chosen for contrast on
paper. Keep the semantic light-theme tokens in `src/app/globals.css` as the
central mapping for shared surfaces and controls; avoid adding page-local
hard-coded white or near-black substitutions when a theme token can express the
same role.

## Treat Data Modules As Editorial Sources Of Truth

The most important public concepts are expressed in TypeScript data modules:

- `src/lib/platforms.ts`
- `src/lib/scales.ts`
- `src/lib/chronos.ts`
- `src/lib/earth-systems.ts`
- `src/lib/data-index.ts`
- `src/lib/vital-signs.ts`
- `src/lib/morbus.ts`
- `src/lib/platform-couplings.ts`

When updating copy that reflects these concepts, prefer editing the source module and shared renderers rather than duplicating one-off text in pages.

## Keep Internal Memory Separate From Public Copy

Docs in this directory are internal project memory. Do not expose long internal notes directly on public pages unless they have been intentionally adapted into public website copy.

## Move Morbus under Salus

The disease ontology module (`Morbus`) has been nested under the health module (`Salus`) rather than sitting directly under the `Persona` platform. The new path is `/platforms/persona/salus/morbus` (residing in `src/app/platforms/persona/salus/morbus/page.tsx`).

This establishes a cleaner hierarchy: `Persona` directly models standard human reality through the body (`Soma`), health preservation (`Salus`), and the home habitat (`Domus`), while pathological states (`Morbus`) are organized as a submodule of health systems and preservation.

## Move Soma under Salus

Following the relocation of Morbus under Salus, the healthy body ontology module (`Soma`) has also been nested under the health module (`Salus`) rather than sitting directly under the `Persona` platform. The new path is `/platforms/persona/salus/soma` (residing in `src/app/platforms/persona/salus/soma/page.tsx`).

This leaves `Persona` with two direct modules: `Salus` (Health) and `Domus` (Home), with the healthy physical body (`Soma`) and its pathological states (`Morbus`) nested as submodules of the health platform.

## Move Morbus under Soma

The disease ontology module (`Morbus`) has been nested under the body module (`Soma`), which resides under the health module (`Salus`). The new path is `/platforms/persona/salus/soma/morbus` (residing in `src/app/platforms/persona/salus/soma/morbus/page.tsx`).

This establishes a nested hierarchy: `Persona` -> `Salus` (Health) -> `Soma` (Body) -> `Morbus` (Disease). Organisms are understood first through their healthy physiological substrate (`Soma`), while pathological states (`Morbus`) are modeled directly as failures of specific body systems.
