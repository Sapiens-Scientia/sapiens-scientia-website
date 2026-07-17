export const somaReferenceOrganSystemIds = [
  "nervous",
  "cardiovascular",
  "respiratory",
  "urinary",
] as const;

export type SomaReferenceModelStatus = "idle" | "loading" | "ready" | "failed";

const somaReferenceOrganSystemSet = new Set<string>(somaReferenceOrganSystemIds);

export function hasSomaReferenceOrgan(systemId: string) {
  return somaReferenceOrganSystemSet.has(systemId);
}

export const somaReferenceOrganSource = {
  name: "Human Reference Atlas",
  organization: "HuBMAP Consortium",
  url: "https://humanatlas.io/3d-reference-library",
  license: "CC BY 4.0",
} as const;

export const somaReferenceMoleculeSource = {
  name: "Human ATP synthase state 1",
  organization: "RCSB Protein Data Bank",
  entryId: "8H9S",
  url: "https://www.rcsb.org/structure/8H9S",
  license: "CC0 1.0",
} as const;

export const somaReferenceNeuronSource = {
  name: "Human layer-3 pyramidal neuron",
  organization: "NeuroMorpho.Org",
  entryId: "NMO_86976",
  url: "https://neuromorpho.org/neuron_info.jsp?neuron_name=H16-06-004-01-04-01_538906745_m",
  license: "CC BY 4.0",
} as const;
