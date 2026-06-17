# Sapiens Scientia Docs

This directory is the local source of truth for durable Sapiens Scientia project memory.

Use these docs before changing platform names, ontology terms, major narrative language, brand voice, conceptual architecture, or route structure.

## What Lives Here

| File | Purpose |
|---|---|
| `ARCHITECTURE.md` | How the website is built: framework, source layout, rendering model, shared components, and operational notes. |
| `CONTENT_MODEL.md` | The project taxonomy: platforms, scale ladder, time arc, Morbus, data index, vital signs, and naming rules. |
| `ROUTES.md` | Current public route inventory and the primary source modules/components behind each route. |
| `DECISIONS.md` | Durable decisions that should survive across implementation sessions. |
| `AGENT_HANDOFF.md` | Practical handoff context, current constraints, and future-agent notes. |

## Editing Rules

- Keep durable conceptual memory in `docs/`.
- Keep website implementation in `src/`.
- Keep public assets in `public/`.
- If code changes alter taxonomy, naming, major copy, or route behavior, update the relevant doc in the same change.
- If a decision should guide future agents, record it in `DECISIONS.md`.
- If a constraint or unresolved issue should be visible to future agents, record it in `AGENT_HANDOFF.md`.
