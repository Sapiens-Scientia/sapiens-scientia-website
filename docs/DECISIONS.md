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

The first screen is the actual Sapiens Scientia experience, not a marketing landing page. The homepage should remain centered on the interactive Physical Earth / Digital Halo / Meta Earth model plus the Sapiens Platforms bridge.

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
