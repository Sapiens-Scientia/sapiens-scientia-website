import { gunzipSync } from "node:zlib";
import { readFile, writeFile } from "node:fs/promises";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/build-soma-atp-synthase.mjs input.cif.gz output.glb");
}

class NodeFileReader {
  result = null;
  onloadend = null;

  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((result) => {
      this.result = result;
      this.onloadend?.();
    });
  }

  readAsDataURL(blob) {
    blob.arrayBuffer().then((result) => {
      const base64 = Buffer.from(result).toString("base64");
      this.result = `data:${blob.type};base64,${base64}`;
      this.onloadend?.();
    });
  }
}

globalThis.FileReader = NodeFileReader;

function tokenizeCifRow(row) {
  const tokens = [];
  let index = 0;
  while (index < row.length) {
    while (/\s/.test(row[index] ?? "")) index += 1;
    if (index >= row.length) break;
    const quote = row[index] === "'" || row[index] === '"' ? row[index] : null;
    if (quote) {
      const end = row.indexOf(quote, index + 1);
      if (end === -1) throw new Error(`Unterminated CIF value: ${row}`);
      tokens.push(row.slice(index + 1, end));
      index = end + 1;
      continue;
    }
    let end = index + 1;
    while (end < row.length && !/\s/.test(row[end])) end += 1;
    tokens.push(row.slice(index, end));
    index = end;
  }
  return tokens;
}

function parseCif(text) {
  const entities = new Map();
  const chains = new Map();
  const ligands = new Map();
  let headers = [];
  let inLoop = false;

  for (const sourceLine of text.split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (!line || line === "#") {
      if (line === "#") {
        headers = [];
        inLoop = false;
      }
      continue;
    }
    if (line === "loop_") {
      headers = [];
      inLoop = true;
      continue;
    }
    if (inLoop && line.startsWith("_")) {
      headers.push(line.split(/\s+/, 1)[0]);
      continue;
    }
    if (!inLoop || headers.length === 0) continue;

    const values = tokenizeCifRow(line);
    if (values.length !== headers.length) continue;
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));

    if (headers[0].startsWith("_entity.")) {
      const id = row["_entity.id"];
      const description = row["_entity.pdbx_description"];
      if (id && description) entities.set(id, description);
      continue;
    }

    if (!headers[0].startsWith("_atom_site.")) continue;
    const group = row["_atom_site.group_PDB"];
    const atom = row["_atom_site.label_atom_id"];
    const alternate = row["_atom_site.label_alt_id"];
    if (alternate !== "." && alternate !== "A") continue;

    const point = new THREE.Vector3(
      Number(row["_atom_site.Cartn_x"]),
      Number(row["_atom_site.Cartn_y"]),
      Number(row["_atom_site.Cartn_z"]),
    );
    if (![point.x, point.y, point.z].every(Number.isFinite)) continue;

    if (group === "ATOM" && atom === "CA") {
      const chainId = row["_atom_site.label_asym_id"];
      const entityId = row["_atom_site.label_entity_id"];
      const residueId = row["_atom_site.label_seq_id"];
      if (!chainId || !entityId || !residueId) continue;
      const chain = chains.get(chainId) ?? {
        entityId,
        points: [],
        residues: new Set(),
      };
      if (!chain.residues.has(residueId)) {
        chain.residues.add(residueId);
        chain.points.push({ point, residue: Number(residueId) });
      }
      chains.set(chainId, chain);
      continue;
    }

    if (group === "HETATM") {
      const component = row["_atom_site.label_comp_id"];
      if (!["ATP", "ADP", "MG", "CDL", "3PH"].includes(component)) continue;
      const points = ligands.get(component) ?? [];
      points.push(point);
      ligands.set(component, points);
    }
  }

  return { chains, entities, ligands };
}

function splitBackbone(points) {
  const segments = [];
  let current = [];
  for (const item of points) {
    const previous = current.at(-1);
    const broken = previous && (
      item.residue - previous.residue > 1 || item.point.distanceTo(previous.point) > 5
    );
    if (broken) {
      if (current.length >= 3) segments.push(current);
      current = [];
    }
    current.push(item);
  }
  if (current.length >= 3) segments.push(current);
  return segments;
}

function stableColor(entityId) {
  const semantic = {
    "4": "#df5968",
    "5": "#e7b66a",
    "6": "#9a78d0",
    "8": "#7099d2",
    "9": "#57c6d9",
    "10": "#ba84c8",
  };
  if (semantic[entityId]) return semantic[entityId];
  const palette = ["#d9829a", "#7eb5c6", "#c18bd2", "#e0936f", "#819cda", "#b5a26f"];
  return palette[(Number(entityId) * 7) % palette.length];
}

const compressed = await readFile(inputPath);
const source = gunzipSync(compressed).toString("utf8");
const { chains, entities, ligands } = parseCif(source);
const allPoints = [...chains.values()].flatMap((chain) => chain.points.map(({ point }) => point));

if (allPoints.length === 0) throw new Error("No alpha-carbon backbone atoms found");

const bounds = new THREE.Box3().setFromPoints(allPoints);
const center = bounds.getCenter(new THREE.Vector3());
const size = bounds.getSize(new THREE.Vector3());
const scale = 4.85 / size.z;
const transformPoint = (point) => new THREE.Vector3(
  (point.x - center.x) * scale,
  (center.z - point.z) * scale,
  (point.y - center.y) * scale,
);

const scene = new THREE.Scene();
scene.name = "Human mitochondrial ATP synthase · RCSB PDB 8H9S";

let backboneTriangles = 0;
for (const [chainId, chain] of chains) {
  const geometries = splitBackbone(chain.points).map((segment) => {
    const curve = new THREE.CatmullRomCurve3(
      segment.map(({ point }) => transformPoint(point)),
      false,
      "centripetal",
    );
    const geometry = new THREE.TubeGeometry(
      curve,
      Math.max(8, segment.length - 1),
      0.026,
      5,
      false,
    );
    backboneTriangles += geometry.index ? geometry.index.count / 3 : 0;
    return geometry;
  });
  if (geometries.length === 0) continue;
  const geometry = mergeGeometries(geometries, false);
  geometries.forEach((item) => item.dispose());
  if (!geometry) continue;

  const description = entities.get(chain.entityId) ?? `ATP synthase entity ${chain.entityId}`;
  const color = stableColor(chain.entityId);
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.045,
    metalness: 0.01,
    roughness: 0.54,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `${description} · chain ${chainId}`;
  mesh.userData = {
    chainId,
    entityId: chain.entityId,
    source: "RCSB PDB 8H9S",
  };
  scene.add(mesh);
}

const ligandStyles = {
  ATP: { color: "#f5c95f", radius: 0.043 },
  ADP: { color: "#ec806e", radius: 0.043 },
  MG: { color: "#6fe4e4", radius: 0.07 },
  CDL: { color: "#ba7fd3", radius: 0.038 },
  "3PH": { color: "#e9d5a9", radius: 0.04 },
};

let ligandTriangles = 0;
for (const [component, points] of ligands) {
  const style = ligandStyles[component];
  const geometries = points.map((point) => {
    const geometry = new THREE.IcosahedronGeometry(style.radius, 1);
    geometry.translate(...transformPoint(point).toArray());
    ligandTriangles += geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;
    return geometry;
  });
  const geometry = mergeGeometries(geometries, false);
  geometries.forEach((item) => item.dispose());
  if (!geometry) continue;
  const material = new THREE.MeshStandardMaterial({
    color: style.color,
    emissive: style.color,
    emissiveIntensity: 0.18,
    roughness: 0.36,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = `${component} ligands`;
  mesh.userData = { component, source: "RCSB PDB 8H9S" };
  scene.add(mesh);
}

const exporter = new GLTFExporter();
const result = await exporter.parseAsync(scene, {
  binary: true,
  onlyVisible: true,
});
await writeFile(outputPath, Buffer.from(result));

console.log(JSON.stringify({
  chains: scene.children.filter((child) => child.userData.chainId).length,
  residues: allPoints.length,
  ligandAtoms: [...ligands.values()].reduce((sum, points) => sum + points.length, 0),
  triangles: backboneTriangles + ligandTriangles,
  sourceBoundsAngstrom: size.toArray(),
  outputPath,
}, null, 2));
