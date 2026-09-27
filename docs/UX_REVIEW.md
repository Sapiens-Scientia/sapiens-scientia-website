# Experience review — 2026-09-26

## Purpose and direction

Sapiens Scientia connects the human, the collective, and the planet across scale
and time. The redesign makes that purpose usable: visitors can enter through a
question, inspect a system, and follow a connection to another perspective or its
evidence. It treats the website as a living atlas, while retaining the cosmic
journey as its immersive introduction.

The original experience had rich individual tools but inconsistent wayfinding,
dense introductions, and few obvious next steps. The review also reproduced URL
hydration errors, mobile overflow, misleading missing-data handling, and graphics
lifecycle problems. Reliability work preceded the broader visual changes.

## Implemented experience

- **Everyday entry:** `/meta-earth` opens with Persona, Societas, and Terra lenses,
  an interactive connected Earth, and Scale, Time, and Evidence destinations.
  The advanced globe workspace opens explicitly at `#globe`; its overlay and
  camera controls load on demand.
- **Questions as routes into the project:** “What keeps a body alive?”, “How do
  societies hold together?”, and “What is changing on Earth?” introduce three
  connected reading paths. They are suggestions, not a new ontology or a claim
  that the reader must follow a fixed sequence.
- **A shared platform family:** Persona, Societas, and Terra have sibling links,
  a plain-language purpose, and an immediate action. Persona correctly shows
  Salus and Domus as its direct modules. Soma and Morbus remain nested within
  the Salus branch; Morbus remains below Soma.
- **Scale and Time as sibling tools:** both use the same selectable list and
  detail panel, real category filters, shareable selection, and Back/Forward
  behavior. On phones, the explanation opens directly below its selected row.
- **Continuity:** grouped navigation reaches the complete public inventory;
  contextual “Keep exploring” links connect content pages. The brand returns to
  the atlas. The journey has chapter jumps, a direct atlas shortcut, and a text
  reading mode for reduced motion or unavailable graphics.
- **Evidence clarity:** charts distinguish rounded reference history,
  illustrative projections, and new source observations. The underlying values
  and providers are accessible through a native table disclosure.

## Reliability and accessibility

Shared fragment state avoids hydration mismatches and preserves Next history and
query parameters. Scenario URLs reject missing/non-finite values; filters and
custom scenarios report their state, and reset/share controls give useful results.
Search includes source aliases. Navigation supports keyboard, Escape, and mobile
accordions. Pages have a skip target, a primary heading, named controls, visible
focus, and accessible empty states. The Morbus matrix and mobile detail panels no
longer force the document wider than its viewport.

Camera streams stop on close, navigation, failed playback, and late permission
responses after exit. Earth scenes and the Big Bang runtime pause offscreen or in
hidden tabs. WebGL capability checks, bounded context recovery, and a manual retry
keep graphics failures from replacing surrounding content. Shared Earth texture
processing avoids mutating cached textures and disposes derived textures. The
Big Bang controls and generated milestones are native keyboard-operable controls;
its runtime cleans up generated DOM, observers, and animation frames.

NASA ingestion uses the published annual J–D value, NOAA ignores missing-value
sentinels, and World Bank nulls never become zero. Each source has a timeout and
isolated decoding/parsing. A complete outage returns an uncached empty response,
and the UI retains its dated references. A headline update preserves the original
historical-series attribution.

## Concept-to-browser fidelity review

Four generated layout concepts guided the atlas, question paths, Scale/Time, and
platform family. They were compared with actual browser renders. No generated
layout bitmap or invented scientific dataset is shipped in the website.

| Checkpoint | Browser result and intentional differences |
|---|---|
| Atlas composition | Large two-line heading at left, working Earth at right, open space and fine rules retained. The existing geographic texture, sunlight model, and illustrative network replace the concept's painted globe. |
| Visual identity | Geist type, near-black surface, off-white text, and cyan/lavender/sage lens accents recur across the new surfaces. The navigation uses the triadic mark without adding another brand subtitle. |
| Lens selection | Underline and lens color identify selection. Real tabs support arrow keys, Home/End, deep links, and reload. |
| Question paths | Three editorial rows with linked numbered steps match the composition. Each path has one accent color rather than alternating colors that could imply a change of platform at every step. |
| Scale/Time | Shared horizontal dimension navigation, category filters, list, and adjacent inspector match the concept. Canonical scientific entries and values replace illustrative concept rows; the time rail explicitly explains its logarithmic age-before-present mapping. |
| Platform family | Three-lens strip, large platform title, purpose line, first action, and open module rows preserve the concept. Live text wraps naturally rather than reproducing the image's exact line breaks. |
| Light theme | Warm-paper surfaces and dark text are an intentional extension beyond the dark concepts, with semantic accent colors. |
| Mobile and short screens | Content stacks; selected dimension details move inline; menus collapse. The compact journey uses fewer globe guides and explicit control placement. These are responsive adaptations, not scaled-down desktop screenshots. |

### Copy changes

- The atlas introduces “One world. Many ways in.” and explains the three lenses
  before exposing the full workspace.
- “Follow a question” leads into actual destinations. The concept's claim that
  every path connects all three lenses was replaced with “Start with what
  interests you. Follow a path through connected systems.”
- Persona's “four direct modules” framing was replaced with two direct modules
  and visible nested body/disease links, matching the documented hierarchy.
- Platform introductions describe what visitors can explore now. Scenario
  descriptions state that their slider settings and outputs are illustrative.
- Chart copy distinguishes reference series from current source updates instead
  of implying that all chart points form a fetched live dataset.

## Verification record

Verification used local Chromium/Playwright, including the production build.
Browser QA scripts and screenshots were kept outside the repository; no browser
dependency was added. The repository test configuration uses the existing `tsx`
dependency and Node's test runner.

| Area | Result |
|---|---|
| Static checks | ESLint and TypeScript pass. |
| Production | `npx next build --webpack` passes, with 26 generated pages/assets and a dynamic vital-signs API. |
| Data and state regression tests | 7 tests pass: NASA annual selection, NOAA sentinels/months, World Bank missing values, scenario URL validation, partial-source failure, complete outage, and historical-provider preservation. |
| Responsive route audit | 42 route/width combinations (14 pages at 320, 768, and 1024 px) have no horizontal document overflow, missing primary heading/skip target, unnamed controls, broken images, or page errors in that audit. |
| Atlas and navigation | Lens keyboard selection, hash/reload/history, question links, workspace entry/return, mobile menus, Escape, and dark/light themes pass. All 21 unique internal route destinations collected from 17 pages resolve. |
| Connected phone journeys | Reading journey → atlas → Soma → Salus → Morbus → atlas, and atlas → Terra → Vital Signs → Data Index → RCSB search both pass with reduced motion enabled. |
| Explorers | Data Index search/filter/reset/history; Morbus filters/matrix/details; simulator presets/sliders/reset/history; Societas custom state; Terra baseline reset and keyboard selection pass. |
| Dimensions | Scale and Time filters, selection, share feedback, reload/history, and inline phone explanations pass. |
| Recovery and chart interaction | Clipboard rejection retains usable selected URLs and query strings in Scale, Morbus, and the coupled simulator. Outlined source observations select correctly at 320 and 1280 px. |
| Terra reference integrity | Full compound safe limits and reference qualifiers survive initial display and scenario reset, including regional forest values and the acidification date. Inventory selection reveals and focuses the detail heading. Verified at 320 px. |
| Graphics | Globe and Soma recover from two forced WebGL context losses, offer manual retry after the third, and restart successfully. Unavailable-WebGL fallbacks preserve surrounding navigation and controls. |
| Journey | Chapters, reading mode, restart, reduced motion, and compact 320×568/844×390 finales checked. Four mocked camera lifecycle cases pass; no actual camera capture was needed. |
| Timeline | Start/focus transfer, pause/play, keyboard scrub, speed state, 15 milestone controls, mobile height, and offscreen pause/resume pass. |
| Workspace scrolling | Evidence and Meta Systems panels use native overflow scrolling. The passive-listener warning from manually cancelling wheel input is removed. |
| Final visual review | Production screenshots reviewed for atlas, paths, Persona, Scale, Time, dark/light themes, and compact journey. No page errors were recorded during the final capture. |

The deferred workspace check confirmed its dedicated chunk is requested only on
entry, and both direct `#globe` entry and return to the atlas work with one mounted
canvas. The atlas page-specific JavaScript changed from 72,504 to 32,671 decoded
bytes in the compared webpack builds. Shared Three.js and framework code are
additional; this is not a total-transfer or loading-speed benchmark. Open menus
were also checked at 320, 768, 1024, and 1280 px without overflow.

## Source corrections and remaining limits

Societas now shows dated direct references. Its 72% statistic describes the
population living in autocracies, rather than the different measure of ongoing
autocratization ([V-Dem Democracy Report 2025](https://www.v-dem.net/documents/60/V-dem-dr__2025_lowres.pdf)).
The poverty reference uses the World Bank's revised 2024 estimate and $3/day
2021-PPP definition ([September 2026 update](https://blogs.worldbank.org/en/opendata/september-2026-global-poverty-update-from-the-world-bank--one-in)).
Other reference links are attached to their visible statistics in
`src/lib/societas.ts`.

Real local API verification returned NOAA CO2/methane and World Bank
population/GDP updates. NASA failed through Node fetch on this host with
`UND_ERR_SOCKET`; curl retrieved its CSV and the parser selected the published
2025 annual value. The site gracefully keeps its reference value for that source.
This is an environment/provider connectivity limitation, not a reason to disable
TLS checks or fabricate an update.

The large reference chart collection, scientific narrative dates, and scenario
formulas were not comprehensively revalidated in this pass. The models remain
illustrative. This was a local implementation and verification pass; it does not
include deployment, real-device Safari testing, a screen-reader session, or a
claim of measured performance improvement. A persistent browser regression suite
would make the interaction checks repeatable in CI.
