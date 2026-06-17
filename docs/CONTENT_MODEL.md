# Content Model

This document describes the current Sapiens Scientia taxonomy, naming model, and public narrative architecture.

## Core Idea

Sapiens Scientia presents reality as nested systems across scale, time, Earth, human platforms, and digital knowledge.

The homepage visualizes this as:

- Physical Earth: the material planet and Earth systems.
- Digital Halo: orbiting digital knowledge infrastructure, data systems, models, and networks.
- Meta Earth: the bridge between planetary reality and digital representation.
- Human Platforms: Salus, Societas, and Terra as interpretive bridges.

## Platform Naming

Preserve these names unless a deliberate taxonomy change updates docs, source modules, and public copy together.

| Name | Role | Route |
|---|---|---|
| `Sapiens Scientia Salus` | Human health platform. | `/platforms/salus` |
| `Sapiens Scientia Societas` | Human society platform. | `/platforms/societas` |
| `Sapiens Scientia Terra` | Environmental / Earth systems platform. | `/platforms/terra` |
| `Sapiens Scientia Soma` | Human body module inside Salus. | `/platforms/salus/soma` |
| `Sapiens Scientia Morbus` | Disease ontology inside Salus. | `/platforms/salus/morbus` |

Short names are `Salus`, `Societas`, `Terra`, `Soma`, and `Morbus`.

## Scale Model

The Ladder of Scale has four tiers:

| Tier | Public Name | Meaning |
|---|---|---|
| I | Microsystems | Particles, atoms, molecules, cells, microbes, bacteria, viruses. |
| II | Mesosystems | Multicellular life, mammals, Homo sapiens. |
| III | Macrosystems | Humans coordinated through nations, institutions, infrastructure, healthcare, technology, energy, finance, and other collective systems. |
| IV | Megasystems | The Sun, atmosphere, climate, freshwater, fossil fuels, waste, soils, ecosystems, biosphere, hydrosphere, and geosphere. |

The source of truth is `src/lib/scales.ts`.

## Time Model

The Arc of Time is the temporal companion to the Ladder of Scale. It reads nested systems through deep time, from the Big Bang to the human present.

The source of truth is `src/lib/chronos.ts`.

## Earth And Digital Systems

The homepage side panels are not arbitrary navigation lists. They are conceptual maps:

- Earth Systems: nested physical, biological, social, and planetary systems.
- Digital Systems: compute, communication, data systems, and intelligence systems, visualized as the Digital Halo rather than as a second Earth.
- Human Platforms: Salus, Societas, and Terra connect the Earth side to the Digital side.

The source of truth is `src/lib/earth-systems.ts`.

## Morbus Model

Morbus is the disease ontology inside Salus. It organizes disease knowledge using:

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
- Treating Salus, Societas, and Terra as unrelated silos.
- Presenting projections as formal forecasts when they are trend extensions.
- Copying internal docs into public pages without adapting them.
