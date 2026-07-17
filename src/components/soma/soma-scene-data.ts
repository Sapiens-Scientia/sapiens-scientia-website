import type { SomaScaleId } from "@/lib/soma";

export type VectorTuple = readonly [number, number, number];

export type SomaSystemVisual = {
  id: string;
  shortName: string;
  color: string;
  dimColor: string;
  organName: string;
  organLatin: string;
  organSize: string;
  focus: VectorTuple;
  camera: VectorTuple;
  explode: VectorTuple;
  cellName: string;
  cellLatin: string;
  cellSummary: string;
  cellStructures: string[];
};

export const somaSystemVisuals: SomaSystemVisual[] = [
  {
    id: "nervous",
    shortName: "Nervous",
    color: "#76a9ff",
    dimColor: "#26364f",
    organName: "Brain",
    organLatin: "encephalon",
    organSize: "14 cm",
    focus: [0, 0.64, 0.02],
    camera: [0.12, 0.62, 2.2],
    explode: [-0.34, 0.08, 0.12],
    cellName: "Neuron",
    cellLatin: "neuron",
    cellSummary: "An excitable cell specialized to receive, integrate, and transmit signals.",
    cellStructures: ["cell body", "dendrites", "axon", "myelin", "synapse"],
  },
  {
    id: "cardiovascular",
    shortName: "Cardiovascular",
    color: "#ff5c63",
    dimColor: "#4f252a",
    organName: "Heart",
    organLatin: "cor",
    organSize: "12 cm",
    focus: [0.08, 0.31, 0.16],
    camera: [0.16, 0.31, 2.25],
    explode: [0.38, 0.08, 0.22],
    cellName: "Cardiomyocyte",
    cellLatin: "cellula muscularis cardiaca",
    cellSummary: "A contractile heart cell built to sustain rhythmic work.",
    cellStructures: ["sarcolemma", "nucleus", "myofibrils", "mitochondria", "intercalated discs"],
  },
  {
    id: "respiratory",
    shortName: "Respiratory",
    color: "#52d0d2",
    dimColor: "#214346",
    organName: "Lungs",
    organLatin: "pulmones",
    organSize: "24 cm",
    focus: [0, 0.31, 0.08],
    camera: [0, 0.32, 2.3],
    explode: [-0.38, 0.02, 0.2],
    cellName: "Type I pneumocyte",
    cellLatin: "pneumocytus typus I",
    cellSummary: "An exceptionally thin alveolar cell across which respiratory gases diffuse.",
    cellStructures: ["apical surface", "nucleus", "basal lamina", "tight junctions", "capillary interface"],
  },
  {
    id: "digestive",
    shortName: "Digestive",
    color: "#58d49a",
    dimColor: "#244838",
    organName: "Small intestine",
    organLatin: "intestinum tenue",
    organSize: "5–7 m",
    focus: [0, 0.02, 0.13],
    camera: [0, 0.04, 2.3],
    explode: [0.34, -0.02, 0.2],
    cellName: "Enterocyte",
    cellLatin: "enterocytus",
    cellSummary: "An absorptive intestinal cell whose microvilli expand the exchange surface.",
    cellStructures: ["brush border", "nucleus", "tight junctions", "transporters", "basal membrane"],
  },
  {
    id: "endocrine",
    shortName: "Endocrine",
    color: "#c789ff",
    dimColor: "#432b54",
    organName: "Thyroid",
    organLatin: "glandula thyroidea",
    organSize: "5 cm",
    focus: [0, 0.49, 0.12],
    camera: [0, 0.48, 2.15],
    explode: [-0.26, 0.17, 0.28],
    cellName: "Endocrine secretory cell",
    cellLatin: "cellula endocrina",
    cellSummary: "A signaling cell that packages chemical messages for release into blood.",
    cellStructures: ["secretory vesicles", "nucleus", "Golgi apparatus", "rough ER", "receptors"],
  },
  {
    id: "immune",
    shortName: "Immune",
    color: "#e6d16a",
    dimColor: "#4b4529",
    organName: "Lymph node",
    organLatin: "nodus lymphoideus",
    organSize: "1 cm",
    focus: [-0.2, 0.12, 0.12],
    camera: [-0.12, 0.14, 2.25],
    explode: [0.28, 0.16, -0.05],
    cellName: "Lymphocyte",
    cellLatin: "lymphocytus",
    cellSummary: "A mobile immune cell that recognizes signals and coordinates targeted defense.",
    cellStructures: ["cell membrane", "nucleus", "receptors", "cytoplasm", "secretory vesicles"],
  },
  {
    id: "musculoskeletal",
    shortName: "Musculoskeletal",
    color: "#d8c3a9",
    dimColor: "#494139",
    organName: "Femur & muscle",
    organLatin: "femur et musculus",
    organSize: "48 cm",
    focus: [-0.11, -0.42, 0.04],
    camera: [-0.08, -0.35, 2.45],
    explode: [-0.24, -0.04, -0.25],
    cellName: "Skeletal muscle fiber",
    cellLatin: "myocytus striatus",
    cellSummary: "A long multinucleate cell that converts ATP into force and movement.",
    cellStructures: ["sarcolemma", "myofibrils", "nuclei", "sarcoplasmic reticulum", "mitochondria"],
  },
  {
    id: "integumentary",
    shortName: "Integumentary",
    color: "#e98c9a",
    dimColor: "#4d2e34",
    organName: "Skin",
    organLatin: "cutis",
    organSize: "1–4 mm",
    focus: [0.25, 0.22, 0.02],
    camera: [0.18, 0.22, 2.25],
    explode: [0.12, 0.02, -0.32],
    cellName: "Keratinocyte",
    cellLatin: "keratinocytus",
    cellSummary: "A barrier-forming epidermal cell that matures as it moves toward the surface.",
    cellStructures: ["keratin network", "nucleus", "desmosomes", "lamellar bodies", "cell membrane"],
  },
  {
    id: "urinary",
    shortName: "Urinary",
    color: "#718ddd",
    dimColor: "#29334f",
    organName: "Kidney",
    organLatin: "ren",
    organSize: "11 cm",
    focus: [0.15, 0.04, 0.06],
    camera: [0.12, 0.06, 2.2],
    explode: [0.26, -0.12, 0.22],
    cellName: "Podocyte",
    cellLatin: "podocytus",
    cellSummary: "A branching filtration cell wrapped around glomerular capillaries.",
    cellStructures: ["cell body", "primary processes", "foot processes", "slit diaphragm", "basement membrane"],
  },
  {
    id: "reproductive",
    shortName: "Reproductive",
    color: "#d5a6cf",
    dimColor: "#493747",
    organName: "Gonads & reproductive tract",
    organLatin: "organa genitalia",
    organSize: "variant anatomy",
    focus: [0, -0.2, 0.12],
    camera: [0, -0.18, 2.25],
    explode: [-0.28, -0.16, 0.18],
    cellName: "Germ cell",
    cellLatin: "cellula germinalis",
    cellSummary: "A lineage cell specialized to carry genetic information between generations.",
    cellStructures: ["cell membrane", "nucleus", "chromatin", "mitochondria", "cytoskeleton"],
  },
];

export const somaSystemVisualById = new Map(
  somaSystemVisuals.map((visual) => [visual.id, visual]),
);

export const scaleSceneLabels: Record<SomaScaleId, { title: string; latin: string }> = {
  organism: { title: "Human organism", latin: "Homo sapiens" },
  system: { title: "Organ system", latin: "systema organorum" },
  organ: { title: "Representative organ", latin: "organum" },
  tissue: { title: "Functional tissue unit", latin: "unitas textus" },
  cell: { title: "Representative cell", latin: "cellula" },
  organelle: { title: "Mitochondrion", latin: "mitochondrium" },
  molecule: { title: "ATP synthase", latin: "complexus ATP synthasis" },
};

export const scaleOrder: SomaScaleId[] = [
  "organism",
  "system",
  "organ",
  "tissue",
  "cell",
  "organelle",
  "molecule",
];
