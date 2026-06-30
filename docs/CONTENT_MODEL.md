# Content Model

This document describes the current Sapiens Scientia taxonomy, naming model, and public narrative architecture.

## Core Idea

Sapiens Scientia presents reality as nested systems across scale, time, Earth, Sapiens platforms, and digital knowledge.

The full Sapiens Scientia Ontology lives in `src/lib/ontology/` and spans three domains plus the relationships between them:

- **Earth Systems** (Physical Earth) — the five-tier nested-systems taxonomy (Nanosystems / Microsystems / Mesosystems / Macrosystems / Megasystems). `ontology/earth-systems.ts`.
- **Sapiens Platforms** — Persona / Societas / Terra, each with its modules (Persona contains Salus and Domus, with Soma nested inside Salus, and Morbus nested inside Soma) and its scope: the Earth and Digital entities it studies. `ontology/platforms.ts`.
- **Digital Systems** (Digital Halo) — computation, communication, data, and intelligence systems. `ontology/digital-systems.ts`.
- **Relationships** — platform→entity "studies" edges and platform↔platform couplings. `ontology/relationships.ts`.

This is the single source of truth: the Ladder of Scale (`src/lib/scales.ts`), the homepage Earth/Digital trees and platform bridges (`src/lib/earth-systems.ts`) all project from it, so every entity label lives in exactly one place. A human-readable rendering is generated to `docs/ONTOLOGY.md` via `npm run gen:ontology` — do not edit that file by hand.

The homepage visualizes this as:

- Physical Earth: the material planet and Earth systems.
- Digital Halo: orbiting digital knowledge infrastructure, data systems, models, and networks.
- Meta Earth: the bridge between planetary reality and digital representation.
- Sapiens Platforms: Persona, Societas, and Terra as interpretive bridges.

## Platform Naming

Preserve these names unless a deliberate taxonomy change updates docs, source modules, and public copy together.

| Name | Role | Route |
|---|---|---|
| `Sapiens Scientia Persona` | Human persona platform. | `/platforms/persona` |
| `Sapiens Scientia Societas` | Human society platform. | `/platforms/societas` |
| `Sapiens Scientia Terra` | Environmental / Earth systems platform. | `/platforms/terra` |
| `Sapiens Scientia Soma` | Human body module inside Salus. | `/platforms/persona/salus/soma` |
| `Sapiens Scientia Salus` | Human health module inside Persona. | `/platforms/persona/salus` |
| `Sapiens Scientia Morbus` | Disease ontology module inside Soma. | `/platforms/persona/salus/soma/morbus` |
| `Sapiens Scientia Domus` | Home/domestic life module inside Persona. | `/platforms/persona/domus` |

Short names are `Persona`, `Societas`, `Terra`, `Soma`, `Salus`, `Morbus`, and `Domus`.

## Scale Model

The Ladder of Scale has five tiers:

| Tier | Public Name | Meaning |
|---|---|---|
| I | Nanosystems | Elementary particles, atoms, molecules. |
| II | Microsystems | Cells, microbes, bacteria, viruses. |
| III | Mesosystems | Multicellular life, mammals, Homo sapiens. |
| IV | Macrosystems | Humans coordinated through nations, institutions, infrastructure, healthcare, technology, energy, finance, and other collective systems. |
| V | Megasystems | The Sun, atmosphere, climate, freshwater, fossil fuels, waste, soils, ecosystems, biosphere, hydrosphere, and geosphere. |

Tiers, groups, and members come from `src/lib/ontology/`; `src/lib/scales.ts` projects them onto length scales (and owns the separate length-anchored `scaleRungs`).

## Time Model

The Arc of Time is the temporal companion to the Ladder of Scale. It reads nested systems through deep time, from the Big Bang to the human present.

The source of truth is `src/lib/chronos.ts`.

Chronos displays time as elapsed years since the Big Bang, with the Big Bang as
year 0 and the present as roughly 13.8 billion years.

## Earth And Digital Systems

The homepage side panels are not arbitrary navigation lists. They are conceptual maps:

- Earth Systems: nested physical, biological, social, and planetary systems.
- Digital Systems: compute, communication, data systems, and intelligence systems, visualized as the Digital Halo rather than as a second Earth.
- Sapiens Platforms: Persona, Societas, and Terra connect the Earth side to the Digital side.

Both the Earth Systems and Digital Systems trees are projected from `src/lib/ontology/` (the Earth tree is a curated projection with its own order/nesting/inclusion — e.g. it omits Data Centers). The platform bridges derive their highlights from each platform's `studies` scope in the ontology. `src/lib/earth-systems.ts` holds only the projection logic.

## Morbus Model

Morbus is the disease ontology module inside Salus. It organizes disease knowledge using:

- Primary Etiologic Diseases.
- Secondary Physiological Diseases.
- Hybrid / Multiaxial Diseases.
- A multiaxial disease matrix: anatomical, etiologic, molecular, immunological, barrier, ecological, developmental, social, and experiential.
- Crosswalks to external disease vocabularies such as ICD-11, SNOMED CT, MeSH, MONDO, DOID, and HPO.

The source of truth is `src/lib/morbus.ts`.

## Soma Model

Soma is the human body module inside Salus. It models the healthy body across:

- Anatomy: bodily structures and spatial relationships.
- Physiology: functions, mechanisms, flows, and regulatory loops.
- Histology: tissue-level fabric and microscopic organization.

Its native frame is the organ system, with a nested structural ladder from chemical scale to the whole organism. Soma stands independently from Morbus, but organ systems cross-link to Morbus disease exemplars where failure modes are represented.

The source of truth is `src/lib/soma.ts`.

## Domus Model

Domus is the home/domestic life module inside Persona. It models:
- Dwelling structure and intimate human habitat.
- Household, family, cohabitants, and caregiving.
- Domestic labor, sleep, hygiene, food preparation, and privacy.
- Energy, water, waste, and indoor ecology.
- Financial burdens (rent, mortgage, utilities, and housing burden).

## Planetary Vital Signs

Vital signs are sourced Earth-system indicators shared by the homepage and `/vitals`.

Domains:

- Human & Economy.
- Atmosphere & Climate.
- Ocean & Ice.
- Land, Water & Life.
- Waste & Pollution.

The source of truth is `src/lib/vital-signs.ts`.

## Data Index

The Data Index maps major public knowledge infrastructure:

- General Knowledge.
- Scholarly Indexes.
- Life Sciences.
- Physical Sciences.
- Books & Archives.
- Law & Patents.
- Public Data.
- Platforms.
- Registries.

The source of truth is `src/lib/data-index.ts`.

## Voice And Copy

Sapiens Scientia copy should feel:

- Conceptual but concrete.
- Systems-oriented.
- Public-facing, not private-note-heavy.
- Precise about whether a thing is a platform, ontology, route, project, scale tier, or data source.

Avoid:

- Renaming core platforms casually.
- Treating Persona, Societas, and Terra as unrelated silos.
- Presenting projections as formal forecasts when they are trend extensions.
- Copying internal docs into public pages without adapting them.
