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
