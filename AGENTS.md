# Agent Instructions

This repository is the public website implementation for Sapiens Scientia.

Agents working here should preserve the separation between implementation code and project doctrine. Build and refactor the website in this repo, and treat the local `docs/` directory as the source of truth for platform taxonomy, naming, ontology, conceptual framing, brand voice, and durable handoffs.

## Local project memory

- `docs/README.md` explains the local documentation model.
- `docs/ARCHITECTURE.md` explains how the website is built.
- `docs/CONTENT_MODEL.md` records taxonomy, naming, and narrative architecture.
- `docs/ROUTES.md` records the current public route inventory.
- `docs/DECISIONS.md` records durable product, taxonomy, naming, and architecture decisions.
- `docs/AGENT_HANDOFF.md` records implementation handoffs, constraints, and context future agents should see.

## Working rules

- Check the local `docs/` directory before changing platform names, ontology terms, major narrative language, route structure, or conceptual architecture.
- Keep website-specific implementation details in this repo.
- Record durable conceptual changes in `docs/DECISIONS.md`, `docs/CONTENT_MODEL.md`, or `docs/AGENT_HANDOFF.md`.
- Preserve the current naming model unless the local docs are intentionally updated: `Persona`, `Societas`, and `Terra`.
- Do not copy large sections of internal docs into public website copy unless the content is meant to be public.
- If implementation reveals a constraint or mismatch, update the local handoff so future agents can see it.

## Current documentation model

`sapiensscientia.com` now carries its own project memory in `docs/`. The documentation relationship is local and explicit; there are no submodules, generated docs imports, or build-time documentation dependencies.
