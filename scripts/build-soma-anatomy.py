"""Build the web-ready Soma anatomy model from the Z-Anatomy Blender atlas.

Run with:
  blender -b /path/to/Z-Anatomy/Startup.blend \
    --python scripts/build-soma-anatomy.py

The source atlas is CC BY-SA 4.0:
https://github.com/Z-Anatomy/Models-of-human-anatomy
"""

from pathlib import Path

import bpy


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = PROJECT_ROOT / "public" / "models" / "soma-anatomy.glb"
FINAL_SIMPLIFY_RATIO = 0.3

SOURCE_COLLECTIONS = (
    "4: Muscular system",
    "5: Cardiovascular system",
    "8: Visceral systems",
    "Brain",
)

COLLECTION_CATEGORY = {
    "4: Muscular system": "muscle",
    "5: Cardiovascular system": "cardiovascular",
    "8: Visceral systems": "visceral",
    "Brain": "brain",
}

# Open the thoracic and abdominal wall so the organs remain legible from the
# front, matching the educational cutaway used as the Soma visual reference.
EXCLUDED_NAME_PARTS = (
    # Soma's overview figure is intentionally non-reproductive and suitable for
    # a general-audience systems overview.
    "genital",
    "penis",
    "glans",
    "cavernosum",
    "spongiosum",
    "scrot",
    "testis",
    "testicular",
    "epididym",
    "ductus deferens",
    "seminal",
    "prostate",
    "ejaculatory",
    "fascia",
    "peritone",
    "omentum",
    "mesocolon",
    "meso-appendix",
    "intercostal",
    "serratus anterior",
    "diaphragm",
    "thoracolumbar",
    "external abdominal oblique",
    "internal abdominal oblique",
    "transversus abdominis",
    "rectus abdominis",
    "pectoralis major",
    "pectoralis minor",
    "transversus thoracis",
)


def source_objects() -> set[bpy.types.Object]:
    objects: set[bpy.types.Object] = set()

    for collection_name in SOURCE_COLLECTIONS:
        collection = bpy.data.collections.get(collection_name)
        if collection:
            objects.update(collection.all_objects)

    return {
        obj
        for obj in objects
        if obj.type in {"MESH", "CURVE"}
        and not obj.name.lower().endswith((".g", ".j"))
        and not any(part in obj.name.lower() for part in EXCLUDED_NAME_PARTS)
    }


def make_material(name: str, color: str, roughness: float = 0.62):
    material = bpy.data.materials.new(name=name)
    material.diffuse_color = (
        int(color[1:3], 16) / 255,
        int(color[3:5], 16) / 255,
        int(color[5:7], 16) / 255,
        1,
    )
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = material.diffuse_color
    shader.inputs["Roughness"].default_value = roughness
    shader.inputs["Specular IOR Level"].default_value = 0.28
    return material


def material_palette():
    return {
        "muscle": make_material("Muscle", "#b95f58"),
        "tendon": make_material("Tendon and fascia", "#d6bea9", 0.72),
        "artery": make_material("Artery", "#a6383d", 0.5),
        "vein": make_material("Vein", "#3e628f", 0.5),
        "heart": make_material("Heart", "#9e4544", 0.54),
        "brain": make_material("Brain", "#d29a9d", 0.68),
        "lung": make_material("Lung", "#cb8585", 0.72),
        "liver": make_material("Liver", "#71382e", 0.68),
        "digestive": make_material("Digestive organs", "#bb7b6d", 0.7),
        "pancreas": make_material("Pancreas", "#c99a62", 0.72),
        "spleen": make_material("Spleen", "#633043", 0.68),
        "kidney": make_material("Kidney", "#86463f", 0.68),
        "airway": make_material("Airway", "#c9ad9b", 0.72),
        "organ": make_material("Other organs", "#9f625b", 0.7),
    }


def material_for(
    obj: bpy.types.Object,
    category: str,
    palette: dict[str, bpy.types.Material],
):
    name = obj.name.lower()

    if category == "muscle":
        if any(
            term in name
            for term in (
                "fascia",
                "tendon",
                "aponeurosis",
                "retinaculum",
                "ligament",
                "septum",
                "bursa",
                "sheath",
            )
        ):
            return palette["tendon"]
        return palette["muscle"]

    if category == "cardiovascular":
        if "vein" in name or "venous" in name or "sinus" in name:
            return palette["vein"]
        if "arter" in name or "aorta" in name:
            return palette["artery"]
        return palette["heart"]

    if category == "brain":
        return palette["brain"]

    if "lung" in name or "pleura" in name:
        return palette["lung"]
    if "liver" in name or "gallbladder" in name or "bile" in name:
        return palette["liver"]
    if any(
        term in name
        for term in (
            "stomach",
            "intestin",
            "colon",
            "duodenum",
            "jejunum",
            "rectum",
            "appendix",
            "oesophagus",
        )
    ):
        return palette["digestive"]
    if "pancrea" in name:
        return palette["pancreas"]
    if "spleen" in name:
        return palette["spleen"]
    if "kidney" in name or "renal" in name:
        return palette["kidney"]
    if any(term in name for term in ("trachea", "bronch", "larynx", "pharynx")):
        return palette["airway"]
    return palette["organ"]


def prepare_scene() -> list[bpy.types.Object]:
    keep = source_objects()
    palette = material_palette()
    category_by_object = {}

    for collection_name, category in COLLECTION_CATEGORY.items():
        collection = bpy.data.collections.get(collection_name)
        if collection:
            for obj in collection.all_objects:
                category_by_object.setdefault(obj, category)

    for obj in list(bpy.data.objects):
        if obj not in keep:
            bpy.data.objects.remove(obj, do_unlink=True)

    prepared: list[bpy.types.Object] = []
    for obj in keep:
        if obj.name not in bpy.data.objects:
            continue

        obj.hide_set(False)
        obj.hide_render = False
        obj.select_set(True)

        material = material_for(
            obj,
            category_by_object.get(obj, "visceral"),
            palette,
        )
        if hasattr(obj.data, "materials"):
            obj.data.materials.clear()
            obj.data.materials.append(material)

        if obj.type == "MESH" and len(obj.data.vertices) > 800:
            modifier = obj.modifiers.new(name="Web decimation", type="DECIMATE")
            modifier.ratio = 0.32

        prepared.append(obj)

    return prepared


def export(objects: list[bpy.types.Object]) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    bpy.context.view_layer.objects.active = next(
        (obj for obj in objects if obj.type == "MESH"),
        None,
    )

    bpy.ops.export_scene.gltf(
        filepath=str(OUTPUT_PATH),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_yup=True,
        export_use_gltfpack=True,
        export_gltfpack_si=FINAL_SIMPLIFY_RATIO,
        export_gltfpack_sa=True,
        export_gltfpack_kn=True,
    )

    print(f"Exported {len(objects)} anatomical objects to {OUTPUT_PATH}")


export(prepare_scene())
