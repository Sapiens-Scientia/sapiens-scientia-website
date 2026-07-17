import { readFile, writeFile } from "node:fs/promises";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  throw new Error("Usage: node scripts/build-soma-neuron.mjs input.swc output.glb");
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
      this.result = `data:${blob.type};base64,${Buffer.from(result).toString("base64")}`;
      this.onloadend?.();
    });
  }
}

globalThis.FileReader = NodeFileReader;

const semanticTypes = {
  1: { name: "Soma", color: "#ec8d9d" },
  2: { name: "Axon", color: "#e9bd6c" },
  3: { name: "Basal dendrites", color: "#ad8ee0" },
  4: { name: "Apical dendrite", color: "#62c4d5" },
};

function parseSwc(source) {
  const nodes = new Map();
  for (const sourceLine of source.split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (!line || line.startsWith("#")) continue;
    const [id, type, x, y, z, radius, parent] = line.split(/\s+/).map(Number);
    if (![id, type, x, y, z, radius, parent].every(Number.isFinite)) continue;
    nodes.set(id, { id, type, point: new THREE.Vector3(x, y, z), radius, parent });
  }
  return nodes;
}

function rodGeometry(start, end, startRadius, endRadius) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  if (length < 1e-5) return null;
  const geometry = new THREE.CylinderGeometry(endRadius, startRadius, length, 5, 1, false);
  geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  ));
  geometry.translate(...new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5).toArray());
  return geometry;
}

const source = await readFile(inputPath, "utf8");
const nodes = parseSwc(source);
const points = [...nodes.values()].map((node) => node.point);
if (points.length === 0) throw new Error("No SWC compartments found");

const bounds = new THREE.Box3().setFromPoints(points);
const center = bounds.getCenter(new THREE.Vector3());
const size = bounds.getSize(new THREE.Vector3());
const scale = 5.35 / Math.max(size.x, size.y, size.z);
const transformPoint = (point) => new THREE.Vector3(
  (point.x - center.x) * scale,
  (point.y - center.y) * scale,
  (point.z - center.z) * scale,
);
const displayRadius = (radius, type) => {
  if (type === 1) return Math.max(radius * scale, 0.075);
  return THREE.MathUtils.clamp(0.0065 + Math.sqrt(Math.max(radius * scale, 0)) * 0.045, 0.007, 0.026);
};

const scene = new THREE.Scene();
scene.name = "Human layer-3 pyramidal neuron · NeuroMorpho.Org NMO_86976";
const counts = {};
let triangles = 0;

for (const [typeValue, style] of Object.entries(semanticTypes)) {
  const type = Number(typeValue);
  const geometries = [];
  for (const node of nodes.values()) {
    if (node.type !== type) continue;
    counts[type] = (counts[type] ?? 0) + 1;
    if (type === 1) {
      const geometry = new THREE.IcosahedronGeometry(displayRadius(node.radius, type), 2);
      geometry.translate(...transformPoint(node.point).toArray());
      geometries.push(geometry);
      continue;
    }
    const parent = nodes.get(node.parent);
    if (!parent) continue;
    const geometry = rodGeometry(
      transformPoint(parent.point),
      transformPoint(node.point),
      displayRadius(parent.radius, node.type),
      displayRadius(node.radius, node.type),
    );
    if (geometry) geometries.push(geometry);
  }
  if (geometries.length === 0) continue;
  for (const geometry of geometries) {
    triangles += geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;
  }
  const geometry = mergeGeometries(geometries, false);
  geometries.forEach((item) => item.dispose());
  if (!geometry) continue;
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: style.color,
    emissive: style.color,
    emissiveIntensity: 0.12,
    metalness: 0.01,
    roughness: 0.48,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = style.name;
  mesh.userData = {
    compartmentType: type,
    source: "NeuroMorpho.Org NMO_86976",
  };
  scene.add(mesh);
}

const exporter = new GLTFExporter();
const result = await exporter.parseAsync(scene, { binary: true, onlyVisible: true });
await writeFile(outputPath, Buffer.from(result));

console.log(JSON.stringify({
  nodes: nodes.size,
  compartmentCounts: counts,
  triangles,
  sourceBoundsMicrometers: size.toArray(),
  outputPath,
}, null, 2));
