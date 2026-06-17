export type ScenarioInputs = {
  /** Terra — freshwater boundary stress (0 = safe, 100 = severely breached). */
  freshwaterStress: number;
  /** Societas — civic space and institutional openness (0 = closed, 100 = open). */
  civicSpace: number;
  /** Salus — population with adequate healthcare access (0–100%). */
  healthcareAccess: number;
};

export type ScenarioOutputs = {
  vectorDiseaseRisk: number;
  extremePovertyRate: number;
  displacementMillions: number;
  heatMortalityIndex: number;
  couplingStress: number;
  dominantCoupling: string;
  narrative: string;
};

export const scenarioBaselines: ScenarioInputs = {
  freshwaterStress: 74,
  civicSpace: 40,
  healthcareAccess: 65,
};

export const scenarioPresets: { id: string; label: string; inputs: ScenarioInputs }[] = [
  { id: "baseline", label: "Current baseline", inputs: scenarioBaselines },
  {
    id: "freshwater-crisis",
    label: "Freshwater crisis",
    inputs: { freshwaterStress: 92, civicSpace: 38, healthcareAccess: 58 },
  },
  {
    id: "open-society",
    label: "Open society",
    inputs: { freshwaterStress: 55, civicSpace: 78, healthcareAccess: 82 },
  },
  {
    id: "compound-shock",
    label: "Compound shock",
    inputs: { freshwaterStress: 88, civicSpace: 22, healthcareAccess: 45 },
  },
];

export const scenarioHashId = "coupled-scenario";

function clampScenarioValue(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function parseScenarioHash(hash: string): ScenarioInputs | null {
  const raw = hash.replace(/^#/, "");
  if (!raw.startsWith(scenarioHashId)) {
    return null;
  }

  const queryStart = raw.indexOf("?");
  if (queryStart === -1) {
    return null;
  }

  const params = new URLSearchParams(raw.slice(queryStart + 1));
  const freshwaterStress = Number(params.get("fw"));
  const civicSpace = Number(params.get("cv"));
  const healthcareAccess = Number(params.get("hc"));

  if ([freshwaterStress, civicSpace, healthcareAccess].some((value) => Number.isNaN(value))) {
    return null;
  }

  return {
    freshwaterStress: clampScenarioValue(freshwaterStress),
    civicSpace: clampScenarioValue(civicSpace),
    healthcareAccess: clampScenarioValue(healthcareAccess),
  };
}

export function buildScenarioHash(inputs: ScenarioInputs): string {
  return `${scenarioHashId}?fw=${inputs.freshwaterStress}&cv=${inputs.civicSpace}&hc=${inputs.healthcareAccess}`;
}

export function scenarioInputsFromLocation(): ScenarioInputs {
  if (typeof window === "undefined") {
    return scenarioBaselines;
  }

  return parseScenarioHash(window.location.hash) ?? scenarioBaselines;
}

export function computeCrossPlatformScenario(inputs: ScenarioInputs): ScenarioOutputs {
  const { freshwaterStress, civicSpace, healthcareAccess } = inputs;

  const vectorDiseaseRisk = Math.min(
    98,
    Math.max(
      8,
      18 + freshwaterStress * 0.38 + (100 - healthcareAccess) * 0.22 + (100 - civicSpace) * 0.08,
    ),
  );

  const extremePovertyRate = Math.max(
    1.5,
    22 - civicSpace * 0.14 - healthcareAccess * 0.09 - freshwaterStress * 0.03,
  );

  const displacementMillions = Math.max(
    18,
    148 - civicSpace * 0.72 + freshwaterStress * 0.35 - healthcareAccess * 0.08,
  );

  const heatMortalityIndex = Math.min(
    95,
    Math.max(5, 12 + freshwaterStress * 0.1 + (100 - healthcareAccess) * 0.14),
  );

  const couplingStress = Math.round(
    (vectorDiseaseRisk + heatMortalityIndex + (100 - civicSpace) + freshwaterStress) / 4,
  );

  const couplingScores = [
    { name: "Disease ecology", score: vectorDiseaseRisk + freshwaterStress * 0.2 },
    { name: "Climate medicine", score: heatMortalityIndex + freshwaterStress * 0.3 },
    { name: "Public health", score: (100 - healthcareAccess) + (100 - civicSpace) * 0.4 },
    { name: "Food systems", score: freshwaterStress * 0.6 + (100 - healthcareAccess) * 0.3 },
  ].sort((a, b) => b.score - a.score);

  const dominantCoupling = couplingScores[0]?.name ?? "Food systems";

  let narrative =
    "The three platforms remain loosely coupled — adjustments stay within the range of recent historical variation.";

  if (couplingStress >= 75) {
    narrative = `Stress concentrates in ${dominantCoupling.toLowerCase()}: ecological pressure, institutional strain, and care gaps reinforce each other across Salus, Societas, and Terra.`;
  } else if (couplingStress >= 55) {
    narrative = `${dominantCoupling} shows the strongest cross-platform feedback. Freshwater stress and health access jointly shape vector-borne risk and displacement.`;
  } else if (civicSpace > 60 && healthcareAccess > 70) {
    narrative =
      "Stronger institutions and care access dampen the cascade — ecological stress still matters, but societies retain more adaptive capacity.";
  }

  return {
    vectorDiseaseRisk,
    extremePovertyRate,
    displacementMillions,
    heatMortalityIndex,
    couplingStress,
    dominantCoupling,
    narrative,
  };
}
