"use client";

import { useState } from "react";

type DiseaseAxis = {
  axis: string;
  value: string;
  explanation: string;
};

type DiseaseCrosswalk = {
  name: string;
  value: string;
};

type DiseaseData = {
  id: string;
  name: string;
  group: "Primary Etiologic Diseases" | "Secondary Physiological Diseases" | "Hybrid / Multiaxial Diseases";
  description: string;
  axes: DiseaseAxis[];
  crosswalks: DiseaseCrosswalk[];
};

const diseases: DiseaseData[] = [
  {
    id: "ibd",
    name: "Inflammatory Bowel Disease (IBD)",
    group: "Hybrid / Multiaxial Diseases",
    description: "A relapsing-remitting inflammatory condition of the gastrointestinal tract, emerging from polygenic risk, barrier disruption, and dysregulated host immune response to gut microbiota.",
    axes: [
      { axis: "Anatomical", value: "Gastrointestinal tract, ileum and colon", explanation: "Primarily affects the mucosal lining of the intestines, causing localized lesions and ulcers." },
      { axis: "Etiologic", value: "Polygenic risk plus environmental triggers", explanation: "Dozens of susceptibility loci interacting with diet, smoking, and stress." },
      { axis: "Molecular", value: "NOD2 mutation, IL-23 / Th17 signalling pathways", explanation: "Intracellular pattern recognition receptor failure and cytokine pathway upregulation." },
      { axis: "Immunological", value: "Dysregulated mucosal immune response", explanation: "Excessive leukocyte recruitment and macrophage activation in the lamina propria." },
      { axis: "Barrier", value: "Compromised intestinal epithelial barrier", explanation: "Leaky tight junctions allow bacterial translocation into deeper tissue layers." },
      { axis: "Ecological", value: "Altered gut microbiome (dysbiosis)", explanation: "Loss of diversity, specifically reduced Firmicutes and increased Proteobacteria." },
      { axis: "Developmental", value: "Onset often in adolescence / young adulthood", explanation: "Typically diagnosed between ages 15 and 30, with lifelong relapsing courses." },
      { axis: "Social", value: "Western diet, urbanization, antibiotic exposure", explanation: "Heavily associated with industrialization and changes in early-life microbial exposure." },
      { axis: "Experiential", value: "Relapsing-remitting pain, fatigue, social stigma", explanation: "Lived burden includes unpredictable flares, dietary anxiety, and chronic fatigue." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "DD70 Crohn disease / DD71 Ulcerative colitis" },
      { name: "SNOMED CT", value: "34000006 Crohn's disease / 64766004 Ulcerative colitis" },
      { name: "MONDO", value: "MONDO:0005101 inflammatory bowel disease" },
    ],
  },
  {
    id: "t2d",
    name: "Type 2 Diabetes (T2D)",
    group: "Secondary Physiological Diseases",
    description: "A metabolic disorder characterized by chronic hyperglycemia, peripheral insulin resistance, and progressive pancreatic beta-cell dysfunction.",
    axes: [
      { axis: "Anatomical", value: "Pancreas, skeletal muscle, liver, adipose tissue", explanation: "Key metabolic organs fail to clear glucose or produce adequate regulatory signals." },
      { axis: "Etiologic", value: "Genetic susceptibility + chronic positive energy balance", explanation: "Heritable risk combined with sustained caloric surplus and physical inactivity." },
      { axis: "Molecular", value: "IRS-1 serine phosphorylation, GLUT4 downregulation", explanation: "Impaired intracellular insulin signaling prevents glucose transporter migration." },
      { axis: "Immunological", value: "Chronic low-grade macrophage-driven tissue inflammation", explanation: "Adipose tissue hypertrophy recruits pro-inflammatory macrophages, secreting TNF-alpha." },
      { axis: "Barrier", value: "Intestinal permeability leading to endotoxemia", explanation: "Leaky gut allows bacterial lipopolysaccharides (LPS) to enter circulation, driving systemic resistance." },
      { axis: "Ecological", value: "Altered gut microbiota diversity", explanation: "Reduced abundance of butyrate-producing taxa impairing metabolic homeostasis." },
      { axis: "Developmental", value: "Progressive accumulation of metabolic strain with age", explanation: "Slow development over decades, often preceded by years of silent pre-diabetes." },
      { axis: "Social", value: "Ultra-processed food environments, sedentary labor", explanation: "Driven by systemic food architecture, transit design, and socioeconomic disparities." },
      { axis: "Experiential", value: "Dietary anxiety, neuropathic pain, fear of failure", explanation: "Constant management burden, blood sugar checking, and fear of diabetic complications." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "5A11 Type 2 diabetes mellitus" },
      { name: "SNOMED CT", value: "44054006 Type 2 diabetes mellitus" },
      { name: "MONDO", value: "MONDO:0005148 type 2 diabetes mellitus" },
    ],
  },
  {
    id: "tb",
    name: "Tuberculosis (TB)",
    group: "Primary Etiologic Diseases",
    description: "An infectious disease caused by Mycobacterium tuberculosis, where clinical path is dictated by cellular immunity containment.",
    axes: [
      { axis: "Anatomical", value: "Pulmonary parenchyma, alveolar macrophages", explanation: "Infection centers in the lungs but can disseminate hematogenously to bones, brain, or kidneys." },
      { axis: "Etiologic", value: "Infection with Mycobacterium tuberculosis", explanation: "Inhalation of airborne droplet nuclei containing the intracellular pathogen." },
      { axis: "Molecular", value: "Mycolic acid wall, ESX-1 secretion system", explanation: "Bacterial cell wall lipids block phagosome-lysosome fusion inside host macrophages." },
      { axis: "Immunological", value: "Th1 cell-mediated immunity & granuloma formation", explanation: "T-cell IFN-gamma recruits macrophages to wall off bacteria in a caseous granuloma." },
      { axis: "Barrier", value: "Alveolar epithelial barrier disruption", explanation: "Bacterial invasion compromises gas exchange barrier during active disease." },
      { axis: "Ecological", value: "Host nutritional status and pulmonary microbiome", explanation: "Co-morbidities like malnutrition or HIV severely compromise host-defense ecology." },
      { axis: "Developmental", value: "Latency phase vs. active reactivation", explanation: "Pathogen can remain dormant for decades, reactivating under immunosuppression." },
      { axis: "Social", value: "Overcrowded housing, poverty, poor ventilation", explanation: "Classic disease of poverty, historical slums, and underfunded public health systems." },
      { axis: "Experiential", value: "Chronic cough, isolation, treatment fatigue", explanation: "Six-month multi-drug regimens, severe medication side effects, and social stigma." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "1B10 Tuberculosis" },
      { name: "SNOMED CT", value: "56717001 Tuberculosis" },
      { name: "MONDO", value: "MONDO:0019383 tuberculosis" },
    ],
  },
  {
    id: "ad",
    name: "Alzheimer's Disease (AD)",
    group: "Secondary Physiological Diseases",
    description: "A neurodegenerative disease characterized by progressive cognitive decline, synaptic loss, and pathological accumulation of amyloid-beta and tau proteins.",
    axes: [
      { axis: "Anatomical", value: "Hippocampus, neocortex, cerebral vasculature", explanation: "Progressive atrophy starting in memory centers and spreading through association cortices." },
      { axis: "Etiologic", value: "APOE4 allele, aging, cardiovascular disease", explanation: "Multifactorial risk combining genetic variants, vascular health, and systemic aging." },
      { axis: "Molecular", value: "Abeta42 aggregation, hyperphosphorylated tau", explanation: "Extracellular plaques block synaptic transmission; intracellular tangles collapse axonal transport." },
      { axis: "Immunological", value: "TREM2 microglial activation, astrogliosis", explanation: "Microglia fail to clear plaques and transition into a chronic neurotoxic inflammatory state." },
      { axis: "Barrier", value: "Blood-brain barrier breakdown, glymphatic failure", explanation: "Microvascular leakiness and impaired waste clearance during slow-wave sleep." },
      { axis: "Ecological", value: "Gut-brain metabolic axis, systemic lipid state", explanation: "Systemic inflammatory and metabolic profiles influence neuroinflammatory signaling." },
      { axis: "Developmental", value: "Long prodromal plaque accumulation (20+ years)", explanation: "Plaques begin depositing decades before memory complaints or clinical dementia appear." },
      { axis: "Social", value: "Cognitive reserve, air pollution, social isolation", explanation: "Higher education builds cognitive resilience; environmental toxins accelerate damage." },
      { axis: "Experiential", value: "Identity erosion, caregiver burden, memory loss", explanation: "Lived reality of losing memory of loved ones, losing spatial orientation, and loss of self." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "8A20 Dementia due to Alzheimer disease" },
      { name: "SNOMED CT", value: "26929004 Alzheimer's disease" },
      { name: "MONDO", value: "MONDO:0004975 Alzheimer's disease" },
    ],
  },
  {
    id: "tbi",
    name: "Traumatic Brain Injury (TBI)",
    group: "Primary Etiologic Diseases",
    description: "An alteration in brain function or structure caused by an external physical force, triggering chronic secondary cascades.",
    axes: [
      { axis: "Anatomical", value: "Cerebral cortex, diffuse axonal pathways, meninges", explanation: "Mechanical focal contusions combined with shearing of white matter axonal tracts." },
      { axis: "Etiologic", value: "Mechanical impact, deceleration forces", explanation: "Direct trauma from falls, motor vehicle collisions, sports impacts, or military blasts." },
      { axis: "Molecular", value: "Excitotoxicity, mitochondrial calcium overload", explanation: "Massive glutamate dump triggers toxic calcium influx and free radical generation." },
      { axis: "Immunological", value: "Microglial priming, peripheral cell infiltration", explanation: "Acute inflammatory response can evolve into chronic, progressive neurodegeneration." },
      { axis: "Barrier", value: "Traumatic blood-brain barrier (BBB) disruption", explanation: "Endothelial shear stresses break tight junctions, causing vasogenic edema and swelling." },
      { axis: "Ecological", value: "Systemic autonomic dysfunction, gut dysbiosis", explanation: "Trauma alters vagal tone, triggering physical gastrointestinal permeability changes." },
      { axis: "Developmental", value: "Acute mechanical shock to chronic dementia risk", explanation: "Single or repeated injuries increase long-term risk of Chronic Traumatic Encephalopathy." },
      { axis: "Social", value: "Sports regulations, infrastructure safety, military exposure", explanation: "Reshaped by athletic safety protocols, traffic laws, and combat zone armor." },
      { axis: "Experiential", value: "Cognitive fatigue, mood shifts, isolation", explanation: "Chronic headaches, light sensitivity, memory gaps, depression, and loss of vocational role." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "NA07.0 Concussion / NA07.1 Traumatic cerebral injury" },
      { name: "SNOMED CT", value: "127294003 Traumatic brain injury" },
      { name: "MONDO", value: "MONDO:0005086 traumatic brain injury" },
    ],
  },
];

export function MorbusExplorer() {
  const [selectedId, setSelectedId] = useState("ibd");
  const [selectedAxisIndex, setSelectedAxisIndex] = useState<number | null>(null);

  const activeDisease = diseases.find((d) => d.id === selectedId) || diseases[0];

  return (
    <div className="flex flex-col gap-8 border border-white/10 bg-white/[0.015] p-6 sm:p-8">
      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-5">
        {diseases.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              setSelectedId(d.id);
              setSelectedAxisIndex(null);
            }}
            className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${
              selectedId === d.id
                ? "border-b-2 border-emerald-300 text-emerald-100 bg-white/[0.04]"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Disease Summary */}
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              {activeDisease.group}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-100">{activeDisease.name}</h3>
          <p className="text-base leading-7 text-slate-300">{activeDisease.description}</p>
        </div>

        {/* Crosswalk Reference */}
        <div className="rounded border border-white/10 bg-white/[0.025] p-5 flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Ontology Crosswalks</h4>
          <div className="grid gap-2">
            {activeDisease.crosswalks.map((cw) => (
              <div key={cw.name} className="flex justify-between gap-4 text-sm">
                <span className="font-semibold text-emerald-200">{cw.name}</span>
                <span className="text-slate-300 text-right">{cw.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Axis Matrix Grid */}
      <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-emerald-300/90">
          Decomposition Along Morbus Axes (Click to inspect)
        </h4>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activeDisease.axes.map((axis, index) => {
            const isSelected = selectedAxisIndex === index;
            return (
              <button
                key={axis.axis}
                onClick={() => setSelectedAxisIndex(isSelected ? null : index)}
                className={`text-left p-4 border transition-all cursor-pointer flex flex-col gap-2 ${
                  isSelected
                    ? "border-emerald-300 bg-emerald-300/[0.06] shadow-[0_0_18px_rgba(52,211,153,0.15)]"
                    : "border-white/10 bg-white/[0.02] hover:border-emerald-200/30 hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-emerald-200">
                    {axis.axis}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {isSelected ? "▲ CLOSE" : "▼ INSPECT"}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-200">{axis.value}</p>
                {isSelected && (
                  <p className="mt-2 text-xs leading-relaxed text-slate-300 border-t border-emerald-300/20 pt-2">
                    {axis.explanation}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
