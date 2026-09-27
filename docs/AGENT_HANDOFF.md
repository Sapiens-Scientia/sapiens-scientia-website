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
- `/meta-earth` is the everyday atlas hub: three platform lenses, a connected
  Earth, Scale/Time/Evidence entries, and question-led paths. `#globe` opens the
  advanced workspace; `#meta-entities` retains the conceptual framework. The
  brand returns to the atlas, and the journey has an explicit atlas shortcut.
  See `docs/UX_REVIEW.md` for the redesign and verification record.
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

- `src/components/meta-earth-experience.tsx` owns atlas/workspace switching.
  The full `MetaEarthHero` uses `LabEarthView` with `connectivity`, not the old
  geodesic `digitalShell`. Only one globe is mounted at a time. The atlas and
  question-path copy live in `src/lib/exploration.ts`. The advanced hero and its
  overlay controls load dynamically when the workspace is opened.
- `src/app/page.tsx` renders `YouAreHereExperience`. Scroll owns all input
  during the journey (its raw-Three canvas is non-interactive); only the
  finale globe is drag-interactive, with the wheel left to page scroll.
- `src/components/lab/lab-earth-view.tsx` is a duplicate of the EarthView
  `UnifiedEarthView` tuned for the homepage finale (chart-continuation camera,
  home-marker projection for the webcam porthole). Scene models remain
  separate, but texture processing, sunlight shading, and canvas recovery are
  shared in `earthview/globe/earth-surface.tsx` and `resilient-earth-canvas.tsx`.
- `src/components/earthview/` contains the imported EarthView 3D React/Three
  project. `/projects/earthview` renders it directly rather than using an
  iframe. Keep the copied textures in `public/earth-blue-marble-5400x2700.jpg`
  and `public/assets/milky-way.jpg` available for the scene.
- `/projects/big-bang-universe` renders the React-owned
  `BigBangUniverseExperience` and its canvas runtime directly, not an iframe.
  Keep an explicit container height on mobile. Start, playback, speed, and
  milestone actions are native controls; keyboard shortcuts stay inside the
  timeline region. The old standalone HTML is only a compatibility artifact.
  The runtime pauses offscreen/in hidden tabs and cleans up generated milestone
  cards and tick marks on disposal, including React development remounts.
- `src/components/earth-overlay.tsx` owns Meta Earth overlays: the three system panels (Physical Systems, Meta Systems, Information Systems), Sapiens Platforms, vital signs popout, data index popout, connectivity legend, and clock. Those first and third labels are display names for the Earth Systems and Digital Systems ontology domains — see the naming note in `docs/CONTENT_MODEL.md` before renaming either.
  Panels use native overflow scrolling and stop propagation to the globe. Do not
  emulate scrolling with `preventDefault()` in React's passive wheel handlers.
- `src/lib/earth-systems.ts` is the Meta Earth taxonomy source for Earth Systems, Digital Systems, and platform bridge highlighting.
- `src/lib/vital-signs.ts` feeds both `/vitals` and Meta Earth vital-sign overlays.
- `src/lib/data-index.ts` feeds `/projects/sapiens-scientia-data-index` and the Digital Halo/data index surfaces.
- `src/lib/soma.ts` feeds `/platforms/persona/salus/soma` and the Soma section on `/platforms/persona/salus`.
- The Soma route is one stateful multiscale atlas owned by
  `src/components/soma/soma-experience.tsx`; its WebGL stage lives in
  `soma-atlas-canvas.tsx`, its semantic visual mapping in
  `soma-scene-data.ts`, and its responsive presentation in `src/app/soma.css`.
  Scale, system, lens, and scene mode are shareable URL parameters. Preserve a
  complete keyboard-operable DOM representation; the canvas is intentionally
  hidden from assistive technology.
- The atlas uses `public/models/soma-anatomy.glb`, a Meshopt-compressed
  derivative of the CC BY-SA Z-Anatomy atlas. Attribution and license details are
  in `public/models/README.md`. Regenerate it from a downloaded Z-Anatomy
  `Startup.blend` with `scripts/build-soma-anatomy.py`; Blender is required only
  for that asset-build step, not at website runtime. Its meshes are used as a
  detailed body context, while selectable system structures and most organ,
  tissue, cell, and organelle stages are lightweight procedural geometry. The
  dense GLB is intentionally loaded only at organism and system scales; direct
  links to deeper scales must not pay its GPU or network cost.
  `soma-detail-worlds.tsx` is the registry for system-specific organ, tissue,
  and cell morphology. Preserve that differentiation when adding systems, and
  prefer instanced repeated structures plus standard materials for microscopic
  scenes. Brain, heart, lung, and kidney organ stages now lazy-load optimized
  CC BY 4.0 Human Reference Atlas GLBs through `soma-reference-organ.tsx`, with
  the procedural registry retained as the Suspense/error fallback. The four
  assets total about 3.4 MB on disk, retain named anatomical meshes, and are not
  preloaded at body or microscopic scales. Provenance is pinned in
  `public/models/hra/manifest.json`. The molecule stage lazy-loads a 468 KB
  Meshopt GLB derived from the human mitochondrial ATP synthase structure RCSB
  PDB 8H9S. It retains 28 named chain nodes and deposited ligand groups in a
  74,310-triangle alpha-carbon backbone representation. Its exact version,
  CC0 provenance, checksum, and build transform are recorded in
  `public/models/pdb/manifest.json`; regenerate the raw derivative with
  `scripts/build-soma-atp-synthase.mjs`. The nervous-system cell stage also
  lazy-loads a 2.14 MB, 211,100-triangle GLB derived from NeuroMorpho.Org human
  pyramidal-neuron reconstruction NMO_86976. It retains four selectable
  compartment meshes and explicitly reports that dendrites are complete while
  the axonal trace is incomplete. Its CC BY 4.0 attribution, requested
  citations, checksums, and transform are pinned in
  `public/models/neuromorpho/manifest.json`; regenerate it with
  `scripts/build-soma-neuron.mjs`. Detail-scene fog distances are
  deliberately farther than body-scene fog because their cameras sit outside
  the body camera range.
  The current runtime LOD expands to roughly 482,000 triangles (down from an
  earlier 1.6-million-triangle export) and about 9.3 MB of mesh data on the GPU.
  Even this asset should not be continuously rendered as a double-sided
  transparent surface in embedded Chromium. Keep the
  current demand render loop, front-side/single-pass material override, capped
  DPR, material cleanup, and WebGL context recovery. Do not restore
  `preserveDrawingBuffer`; X-ray deliberately substitutes a procedural shell.
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
- The footer contains site navigation links, the project copyright line, and a
  small creator credit for bnpndk.
- The favicon is a “knowledge cosmos” mark: three colored nodes for Persona,
  Societas, and Terra orbit a central point across nested scale rings. Preserve
  that triadic, multiscale idea when evolving the project’s visual identity.
- Local docs are meant to be practical and short enough for future agents to actually read.

## Known Development Notes

- Run `npm install` before checks in fresh Codex worktrees; dependencies may not be present.
- Standard checks are `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build`.
- On the current local host, Next 16.2.7's default Turbopack production build
  can stall before emitting compiler output, including from an empty `.next`.
  `npx next build --webpack` completes successfully; Turbopack development mode
  remains healthy.
- The homepage and Meta Earth can fail visually even when lint/build pass,
  especially around Three canvases. Browser verification is important for hero
  changes.
- When serving the app locally through `127.0.0.1`, Next dev may need `allowedDevOrigins` in `next.config.ts`.
- **Git workflow rule**: Do not commit, merge, or push changes to remote until the user explicitly requests it.

## Good Next Improvements

- Consider a persistent browser regression suite for the atlas, journey, and
  core explorers. The recent task used external Playwright QA scripts without
  adding a browser dependency to this package.
- Keep `docs/ROUTES.md` current when adding or removing public pages.
- Consider adding tests around route metadata or data-module shape if the site continues to grow.

## Meta Earth Connectivity Layer And Meta-Entity Section

- The Meta Earth hero's geodesic digital shell was removed and replaced by
  `PlanetaryNetwork` (`src/components/lab/lab-earth-view.tsx`), which renders the
  fiber / submarine / wireless / node layer from `src/lib/planetary-network.ts`.
  `LabEarthView`'s `digitalShell` prop is gone; use `connectivity` instead.
- The layer is mounted inside `EarthBody`'s spin group so every route stays
  locked to its real geography as the planet turns. `EarthBody` passes it the
  world-space sun direction; the component carries that into its own spinning
  frame each tick for the night-side brightening.
- **react-three-fiber deep-copies a `uniforms` prop onto a ShaderMaterial.**
  Mutating the object you passed in JSX does nothing — the material holds a
  clone. `PlanetaryNetwork` therefore writes uniforms through material refs each
  frame. Any future custom-shader work in this file should do the same; the
  failure mode is silent (geometry present, nothing drawn).
- The new Meta-Entity section is `src/components/meta-entity-framework.tsx`,
  rendered by `MetaEarthExperience` after `HomeOverview`, with content from
  `src/lib/meta-entities.ts` and its animation keyframes (`me-orbit`,
  `me-turnover`, `.me-ring-label`) in `src/app/globals.css`.
- SVG coordinates computed with trigonometry must be rounded before rendering
  (`round()` in that component) or React reports a hydration mismatch on the
  differing float tails.
- EarthView's imported stylesheet previously overrode root theme tokens across
  the whole site. It is now scoped to `.earth-shell`; do not reintroduce global
  rules when syncing from the standalone app. `--background` now reflects the
  site theme correctly. The atlas uses its own semantic `--atlas-*` palette.

## Known Development Notes (browser verification)

- The in-app Browser pane's GPU process can wedge after repeated reloads of the
  Three-heavy pages: every canvas then renders black, including on unrelated
  routes, and new tabs inherit the wedged process. Restarting the dev server does
  not fix it.
- A working alternative that needs no extension: start
  `chrome-headless-shell` (Playwright's cache has one) with
  `--remote-debugging-port=9222 --enable-unsafe-swiftshader`, then drive
  `Page.navigate` / `Page.captureScreenshot` over CDP from a small Node 22 script
  using the global `WebSocket`. Give the page 10–15s before capturing so the
  5400×2700 Earth texture and the drei fonts have loaded.
- `THREE.WebGLRenderer: Context Lost.` appears on the Meta Earth hero under
  software rendering (SwiftShader) with or without the connectivity layer. It is
  a property of the scene's weight in software rasterization, not a regression
  from the network layer — verified by A/B with `connectivity={false}`.


## Experience And Reliability Pass (2026-09-26)

- Persona, Societas, and Terra share `PlatformIntroduction`, with plain-language
  purpose, sibling lenses, and a first action. Persona's two direct modules are
  Salus and Domus; Soma and Morbus remain nested below Salus.
- Scale and Time share `DimensionExplorer`. Selection is explicit (including
  keyboard), filtering is real, copying reports success/failure, and mobile
  details appear beside the selected entry. Preserve canonical data modules.
- Explorer fragment state uses `useUrlHash` to avoid hydration mismatch and
  support Back/Forward. Use its setter for same-page state links. Scenario
  sliders replace the URL entry; deliberate presets/selections create entries.
- The homepage offers chapters, direct atlas access, and a text reading mode.
  Reduced motion or unavailable graphics selects the reading mode. Short
  portrait and landscape finales use compact controls and fewer globe guides.
- Camera streams close on every exit path, including late permission responses
  and playback failures. No camera data is uploaded or recorded by this code.
- Both Earth renderers and Soma check WebGL2 before R3F's async configuration.
  Recovery attempts are bounded. Earth scenes pause offscreen/in hidden tabs;
  reduced-motion users get demand rendering. Texture derivatives are disposed
  without mutating or disposing the loader's cached source texture.
- NASA, NOAA, and World Bank ingestion now validates missing values and periods,
  isolates source failures, and reports the actual provider. Chart references,
  projections, and new observations remain separate. Do not relabel a historical
  series merely because a headline has a new provider. `VitalSignChart` is shared
  by the dashboard and globe and includes a native data table disclosure.
- Societas editorial data is in `src/lib/societas.ts`. Its statistics have direct
  dated source links; scenario presets describe hypothetical assumptions. The
  V-Dem reference distinguishes living in an autocracy from autocratization.
- Terra's reference view preserves the original qualifiers and dates in
  `planetary-boundaries.ts`. Safe limits are shown in full, separately from
  reference/scenario states; do not truncate compound limits on a slash.
  Inventory selection brings the details into view and focuses their heading.
- Real source verification on this host returned four updates (NOAA CO2/CH4,
  World Bank population/GDP). Node fetch to NASA returned `UND_ERR_SOCKET`;
  curl could read the CSV and the parser correctly selected the published 2025
  annual mean. The dated reference remains visible when that source fails.
- The large reference chart collection and illustrative scenario formulas were
  not independently validated as scientific models. Public copy now states this
  limitation, and future changes should retain it.
