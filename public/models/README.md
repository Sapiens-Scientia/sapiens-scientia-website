# Soma anatomy model

`soma-anatomy.glb` is a web-optimized level-of-detail derivative of the
Z-Anatomy human anatomy atlas. Its approximately 482,000 triangles retain the
full-body cutaway silhouette while reducing the runtime GPU footprint by about
70% from the original 1.6-million-triangle export.

Attribution:

- BodyParts3D — The Database Center for Life Science — CC BY-SA 2.1 Japan
- Z-Anatomy — The libre 3D atlas of anatomy — CC BY-SA 4.0

Source: https://github.com/Z-Anatomy/Models-of-human-anatomy

The derivative model is distributed under CC BY-SA 4.0.

Regenerate it with `scripts/build-soma-anatomy.py`. The build applies
per-object decimation, a final gltfpack simplification pass, quantization, and
Meshopt compression; Blender 5.1 or newer with gltfpack support is required.

## Human Reference Atlas organ models

`hra/brain.glb`, `hra/heart.glb`, `hra/lung.glb`, and `hra/kidney.glb` are
web-optimized derivatives of the HuBMAP Consortium's Human Reference Atlas 3D
Reference Object Library. They replace schematic geometry at the corresponding
organ stages while retaining named internal anatomical meshes for structure
labels and tap selection.

Attribution:

- Brain, Female v1.3 — Kristen Browne and Heidi Schlehlein —
  [HBM425.NDKM.969](https://doi.org/10.48539/HBM425.NDKM.969) — CC BY 4.0
- Heart, Female v1.2 — Kristen Browne and Heidi Schlehlein —
  [HBM384.VWVH.465](https://doi.org/10.48539/HBM384.VWVH.465) — CC BY 4.0
- Lung, Female v1.2 — Kristen Browne and Heidi Schlehlein —
  [HBM733.JCZJ.647](https://doi.org/10.48539/HBM733.JCZJ.647) — CC BY 4.0
- Kidney, Female, Left v1.2 — Kristen Browne and Heidi Schlehlein —
  [HBM898.QGVV.734](https://doi.org/10.48539/HBM898.QGVV.734) — CC BY 4.0

Source: https://humanatlas.io/3d-reference-library

The files are lazy-loaded by selected organ, have no textures, and use Meshopt
compression. The transform preserves the original scene hierarchy and mesh
names while simplifying geometry and quantizing attributes. Soma recolors the
models at runtime. These are modified derivatives; full titles, creators, DOIs,
per-asset source releases and commits, checksums, transformation settings,
triangle counts, and file sizes are recorded in `hra/manifest.json`.

## Human ATP synthase molecular model

`pdb/atp-synthase-8h9s.glb` is a web-optimized chain-backbone derivative of
RCSB PDB entry 8H9S, *Human ATP synthase state 1 (combined)*. The deposited
structure was determined by single-particle cryo-electron microscopy at 2.53 Å
resolution and contains 28 protein chains.

PDB archive data files are dedicated to the public domain under CC0 1.0. Cite:

- RCSB PDB entry 8H9S — [10.2210/pdb8H9S/pdb](https://doi.org/10.2210/pdb8H9S/pdb)
- Lai et al., *Structure of the human ATP synthase* —
  [10.1016/j.molcel.2023.04.029](https://doi.org/10.1016/j.molcel.2023.04.029)

The derived asset uses alpha-carbon chain tubes rather than an all-atom render,
while retaining named subunit-chain nodes and deposited ATP, ADP, magnesium,
cardiolipin, and 3PH ligand atoms. Regenerate the raw GLB with
`scripts/build-soma-atp-synthase.mjs`, then apply the pinned glTF Transform
operations recorded in `pdb/manifest.json`:

```sh
node scripts/build-soma-atp-synthase.mjs 8H9S.cif.gz atp-synthase.raw.glb
npx --yes @gltf-transform/cli@4.2.1 optimize atp-synthase.raw.glb atp-synthase-8h9s.glb --compress meshopt --flatten false --join false --instance false --palette false --simplify false --texture-compress false
```

## Human pyramidal-neuron morphology

`neuromorpho/human-pyramidal-neuron-nmo-86976.glb` is a web-optimized
derivative of NeuroMorpho.Org reconstruction NMO_86976, a biocytin-stained
human spiny pyramidal neuron from layer 3 of the right middle temporal gyrus.
The source contains a complete dendritic arbor and an incomplete axonal trace;
the experience calls out that limitation instead of presenting it as a complete
textbook neuron.

NeuroMorpho.Org distributes its data under CC BY 4.0 and requests attribution
to the original paper, the repository, and its current methods paper. Cite:

- NeuroMorpho.Org (RRID:SCR_002145), reconstruction NMO_86976
- Koch and Jones, *Big Science, Team Science, and Open Science for
  Neuroscience* — [10.1016/j.neuron.2016.10.019](https://doi.org/10.1016/j.neuron.2016.10.019)
- Tecuatl, Ljungquist, and Ascoli, *Accelerating the continuous community
  sharing of digital neuromorphology data* —
  [10.1096/fba.2024-00048](https://doi.org/10.1096/fba.2024-00048)

The derivative preserves four selectable semantic meshes—soma, axon, basal
dendrites, and apical dendrite—while converting the 10,531 SWC compartments to
tapered low-poly segments. Radii are minimally amplified so thin processes
remain legible at browser scale. Exact source URLs, checksums, completeness,
transform settings, and measurements are recorded in
`neuromorpho/manifest.json`.

Regenerate the asset with:

```sh
node scripts/build-soma-neuron.mjs H16-06-004-01-04-01_538906745_m.CNG.swc human-pyramidal-neuron.raw.glb
npx --yes @gltf-transform/cli@4.2.1 optimize human-pyramidal-neuron.raw.glb human-pyramidal-neuron-nmo-86976.glb --compress meshopt --flatten false --join false --instance false --palette false --simplify false --texture-compress false
```
