export type DiseaseAxis = {
  axis: string;
  value: string;
  explanation: string;
};

export type DiseaseCrosswalk = {
  name: string;
  value: string;
};

export type DiseaseData = {
  id: string;
  name: string;
  group: DiseaseGroupKind;
  description: string;
  axes: DiseaseAxis[];
  crosswalks: DiseaseCrosswalk[];
};

export type DiseaseGroupKind =
  | "Primary Etiologic Diseases"
  | "Secondary Physiological Diseases"
  | "Hybrid / Multiaxial Diseases";

export const morbusGroupKinds: DiseaseGroupKind[] = [
  "Primary Etiologic Diseases",
  "Secondary Physiological Diseases",
  "Hybrid / Multiaxial Diseases",
];

export type MorbusDiseaseGroup = {
  kind: string;
  principle: string;
  subtypes: { name: string; examples: string[] }[];
};

export const morbusDiseaseGroups: MorbusDiseaseGroup[] = [
  {
    kind: "Primary Etiologic Diseases",
    principle: "Pathology is chiefly organized around a relatively identifiable initiating cause.",
    subtypes: [
      { name: "Physical injury", examples: ["trauma", "burns", "frostbite"] },
      { name: "Deficiency", examples: ["scurvy", "iron-deficiency anaemia", "iodine deficiency"] },
      { name: "Chemical exposure", examples: ["asbestosis", "silicosis", "alcohol-related liver disease"] },
      { name: "Infectious disease", examples: ["influenza", "tuberculosis", "HIV disease"] },
      { name: "Hereditary disease", examples: ["cystic fibrosis", "sickle cell disease", "Huntington disease"] },
    ],
  },
  {
    kind: "Secondary Physiological Diseases",
    principle: "Pathology emerges from complex dysregulation of physiological systems over time.",
    subtypes: [
      { name: "Cardiovascular", examples: ["hypertension", "atherosclerosis", "heart failure"] },
      { name: "Metabolic / endocrine", examples: ["type 2 diabetes", "obesity", "PCOS"] },
      { name: "Neurological", examples: ["Alzheimer disease", "Parkinson disease", "epilepsy"] },
      { name: "Degenerative", examples: ["osteoarthritis", "sarcopenia", "macular degeneration"] },
      { name: "Neoplastic", examples: ["cancer", "leukaemia", "lymphoma"] },
      { name: "Immunological / inflammatory", examples: ["Crohn disease", "lupus", "asthma", "allergy"] },
    ],
  },
  {
    kind: "Hybrid / Multiaxial Diseases",
    principle: "Cause and physiology are both essential; one disease may belong to multiple explanatory layers.",
    subtypes: [
      { name: "Infection plus host response", examples: ["sepsis", "long COVID", "post-infectious syndromes"] },
      { name: "Gene plus physiology", examples: ["familial hypercholesterolaemia", "haemochromatosis", "BRCA-associated cancer risk"] },
      { name: "Environment plus regulation", examples: ["COPD", "occupational asthma", "non-alcoholic fatty liver disease"] },
      { name: "Immune plus tissue ecology", examples: ["inflammatory bowel disease", "rheumatoid arthritis", "psoriasis"] },
      { name: "Treatment effect", examples: ["iatrogenic harm", "adverse drug reaction", "post-surgical adhesions"] },
    ],
  },
];

export const morbusDistinctionSet = [
  { term: "Disease entity", detail: "A condition treated as a recognizable, nameable whole." },
  { term: "Syndrome", detail: "A co-occurring cluster of features without a single settled cause." },
  { term: "Pathophysiological process", detail: "The unfolding mechanism by which function is disrupted." },
  { term: "Etiology", detail: "The initiating cause or causes that set the process in motion." },
  { term: "Risk state", detail: "A predisposing condition that raises the probability of disease." },
  { term: "Tissue lesion", detail: "The structural change visible at the level of tissue." },
  { term: "Molecular mechanism", detail: "The pathway, mutation, or signalling change underneath." },
  { term: "Immune pattern", detail: "The characteristic immune response or dysregulation involved." },
  { term: "Barrier dysfunction", detail: "Failure of epithelial, vascular, or other protective barriers." },
  { term: "Microbial ecology", detail: "The microbial community whose shifts shape the condition." },
  { term: "Complication", detail: "A downstream condition arising from the primary disease." },
  { term: "Treatment effect", detail: "Change in the disease produced by intervention." },
  { term: "Iatrogenic harm", detail: "Harm caused by medical care itself." },
  { term: "Lived experience", detail: "The condition as felt and narrated by the person living it." },
];

export const morbusCrosswalks = [
  { name: "ICD-11", role: "Public nosology and reporting crosswalk", href: "https://icd.who.int/browse/2025-01/mms/en" },
  { name: "SNOMED CT", role: "Clinical terminology for records", href: "https://www.snomed.org/" },
  { name: "MeSH", role: "Literature indexing vocabulary", href: "https://www.nlm.nih.gov/mesh/meshhome.html" },
  { name: "MONDO", role: "Harmonized disease ontology", href: "https://mondo.monarchinitiative.org/" },
  { name: "DOID", role: "Human Disease Ontology", href: "https://disease-ontology.org/" },
  { name: "HPO", role: "Human Phenotype Ontology", href: "https://hpo.jax.org/" },
];

export const morbusAxisNames = [
  "Anatomical",
  "Etiologic",
  "Molecular",
  "Immunological",
  "Barrier",
  "Ecological",
  "Developmental",
  "Social",
  "Experiential",
] as const;

export function morbusDiseasesByGroup(group: DiseaseGroupKind): DiseaseData[] {
  return morbusDiseases.filter((disease) => disease.group === group);
}

export const morbusDiseases: DiseaseData[] = [
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
  {
    id: "ptsd",
    name: "Post-Traumatic Stress Disorder (PTSD)",
    group: "Hybrid / Multiaxial Diseases",
    description: "A trauma- and stressor-related disorder where threat-circuit hyperarousal, intrusive memory, and avoidance reshape cognition, physiology, and social life long after the original event.",
    axes: [
      { axis: "Anatomical", value: "Amygdala, hippocampus, medial prefrontal cortex", explanation: "Fear-conditioning circuits show altered volume and connectivity after repeated or severe trauma." },
      { axis: "Etiologic", value: "Exposure to actual or threatened death, injury, or sexual violence", explanation: "Not every exposed person develops PTSD — risk depends on dose, timing, and prior adversity." },
      { axis: "Molecular", value: "FKBP5, glucocorticoid receptor sensitivity, BDNF", explanation: "Stress-hormone signalling and neurotrophic pathways modulate whether memory becomes pathologically fixed." },
      { axis: "Immunological", value: "Low-grade systemic inflammation, HPA-axis dysregulation", explanation: "Chronic cortisol swings and inflammatory markers often accompany long-standing PTSD." },
      { axis: "Barrier", value: "Blood-brain barrier stress vulnerability", explanation: "Repeated neuroendocrine strain may worsen BBB integrity and neuroinflammatory tone." },
      { axis: "Ecological", value: "Gut-brain axis, sleep ecology, substance co-use", explanation: "Disrupted sleep, alcohol use, and microbiome shifts feed back into threat processing." },
      { axis: "Developmental", value: "Childhood trauma increases lifetime risk", explanation: "Early adversity can prime stress systems before the brain's regulatory architecture is mature." },
      { axis: "Social", value: "War, displacement, intimate partner violence, occupational trauma", explanation: "PTSD clusters where violence, instability, and institutional failure concentrate." },
      { axis: "Experiential", value: "Hypervigilance, flashbacks, emotional numbing, moral injury", explanation: "Lived reality of feeling unsafe in ordinary spaces and reliving danger without warning." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "6B40 Post traumatic stress disorder" },
      { name: "SNOMED CT", value: "47505003 Post-traumatic stress disorder" },
      { name: "MONDO", value: "MONDO:0005401 post-traumatic stress disorder" },
    ],
  },
  {
    id: "malaria",
    name: "Malaria",
    group: "Primary Etiologic Diseases",
    description: "A mosquito-borne infectious disease caused by Plasmodium parasites, where clinical severity reflects parasite species, host immunity, and ecological exposure.",
    axes: [
      { axis: "Anatomical", value: "Liver, erythrocytes, cerebral microvasculature", explanation: "Hepatic schizonts release meroozoites that invade red cells; severe cases can occlude brain capillaries." },
      { axis: "Etiologic", value: "Plasmodium falciparum, P. vivax, and related species", explanation: "Transmission requires Anopheles mosquitoes and human reservoirs in overlapping habitats." },
      { axis: "Molecular", value: "PfEMP1 variant surface antigens, hemozoin crystals", explanation: "Parasite proteins remodel infected cells and trigger immune recognition / evasion cycles." },
      { axis: "Immunological", value: "Partial acquired immunity after repeated exposure", explanation: "Endemic populations develop age-structured immunity; travelers lack this buffer." },
      { axis: "Barrier", value: "Blood-brain barrier sequestration in cerebral malaria", explanation: "Infected erythrocytes adhere to cerebral endothelium, causing coma and mortality in children." },
      { axis: "Ecological", value: "Rainfall, temperature, vector habitat, land use", explanation: "Climate and water bodies set mosquito breeding ranges; deforestation and irrigation reshape risk maps." },
      { axis: "Developmental", value: "Highest mortality in young children and pregnant people", explanation: "Immature immune systems and placental vulnerability create distinct clinical windows." },
      { axis: "Social", value: "Bed-net access, health-system reach, poverty, migration", explanation: "Prevention and treatment depend on supply chains, financing, and stable primary care." },
      { axis: "Experiential", value: "Cyclical fever, anemia, treatment delays, recurrence fear", explanation: "Lived burden of unpredictable fevers, lost workdays, and household financial shock." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "1F40 Malaria" },
      { name: "SNOMED CT", value: "61462000 Malaria" },
      { name: "MONDO", value: "MONDO:0005136 malaria" },
    ],
  },
  {
    id: "hf",
    name: "Heart Failure (HF)",
    group: "Secondary Physiological Diseases",
    description: "A syndrome of ventricular dysfunction where the heart cannot pump enough blood to meet metabolic demand, often after years of hypertension, ischemia, or cardiomyopathy.",
    axes: [
      { axis: "Anatomical", value: "Left ventricle, atria, coronary arteries, kidneys", explanation: "Pump failure and fluid retention reshape cardiac chambers and renal salt handling." },
      { axis: "Etiologic", value: "Ischemic heart disease, hypertension, valve disease, toxins", explanation: "Multiple upstream insults converge on weakened contractility or stiff ventricles." },
      { axis: "Molecular", value: "BNP/NT-proBNP release, beta-adrenergic desensitization", explanation: "Stretch hormones rise as compensation fails; chronic catecholamine drive becomes maladaptive." },
      { axis: "Immunological", value: "Cardiac fibrosis, macrophage-mediated remodeling", explanation: "Post-injury inflammation converts to collagen deposition and stiff myocardium." },
      { axis: "Barrier", value: "Capillary leak, pulmonary and gut barrier congestion", explanation: "Elevated filling pressures back up into lungs and splanchnic circulation." },
      { axis: "Ecological", value: "Sodium intake, air pollution, sleep-disordered breathing", explanation: "Dietary salt, particulate exposure, and apnea worsen hemodynamic load." },
      { axis: "Developmental", value: "Adult-onset progression with acute decompensation episodes", explanation: "Often silent for years, then punctuated by hospitalizations and functional decline." },
      { axis: "Social", value: "Access to diagnostics, medications, cardiac rehabilitation", explanation: "Outcomes diverge sharply by healthcare coverage, transport, and medication adherence support." },
      { axis: "Experiential", value: "Breathlessness, fluid limits, hospitalization anxiety", explanation: "Daily life reorganizes around fatigue, weight checks, and fear of sudden worsening." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "BD10 Heart failure" },
      { name: "SNOMED CT", value: "84114007 Heart failure" },
      { name: "MONDO", value: "MONDO:0005383 heart failure" },
    ],
  },
  {
    id: "ra",
    name: "Rheumatoid Arthritis (RA)",
    group: "Hybrid / Multiaxial Diseases",
    description: "A chronic autoimmune inflammatory arthritis where synovial hyperplasia, autoantibodies, and systemic inflammation erode joints and affect cardiovascular risk.",
    axes: [
      { axis: "Anatomical", value: "Synovium, small joints of hands and feet, cardiovascular system", explanation: "Pannus formation destroys cartilage and bone; systemic inflammation raises vascular risk." },
      { axis: "Etiologic", value: "Autoimmune dysregulation with genetic and environmental triggers", explanation: "HLA-DRB1 alleles and smoking interact to break tolerance to citrullinated proteins." },
      { axis: "Molecular", value: "Anti-CCP antibodies, TNF-alpha, IL-6 pathway activation", explanation: "Cytokine networks sustain synovitis and recruit destructive leukocytes." },
      { axis: "Immunological", value: "Adaptive autoimmunity plus innate inflammatory amplification", explanation: "B cells, T cells, and macrophages maintain a self-sustaining inflammatory niche." },
      { axis: "Barrier", value: "Synovial barrier breakdown, endothelial activation", explanation: "Inflamed synovium leaks inflammatory mediators into circulation." },
      { axis: "Ecological", value: "Oral microbiome, gut dysbiosis hypotheses", explanation: "Mucosal immune triggers from periodontitis or gut bacteria are active research fronts." },
      { axis: "Developmental", value: "Peak onset in middle adulthood with chronic course", explanation: "Often begins between ages 30 and 50 and persists for decades without treatment." },
      { axis: "Social", value: "Work disability, gendered burden, treatment access", explanation: "Joint damage limits manual labor; biologic therapies remain unevenly available globally." },
      { axis: "Experiential", value: "Morning stiffness, pain unpredictability, treatment trade-offs", explanation: "Lived experience of planning life around flares and immunosuppressive side effects." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "FA20 Rheumatoid arthritis" },
      { name: "SNOMED CT", value: "69896004 Rheumatoid arthritis" },
      { name: "MONDO", value: "MONDO:0005180 rheumatoid arthritis" },
    ],
  },
  {
    id: "covid19",
    name: "COVID-19",
    group: "Primary Etiologic Diseases",
    description: "An acute respiratory disease caused by SARS-CoV-2, where severity reflects viral load, prior immunity, vascular injury, and systemic inflammatory cascades.",
    axes: [
      { axis: "Anatomical", value: "Respiratory epithelium, alveoli, endothelium", explanation: "Primary infection begins in upper airways and can descend to cause diffuse alveolar damage." },
      { axis: "Etiologic", value: "SARS-CoV-2 coronavirus infection", explanation: "Spreads via respiratory droplets and aerosols with high transmissibility in dense settings." },
      { axis: "Molecular", value: "ACE2 receptor binding, spike protein variants", explanation: "Viral entry depends on ACE2; variant evolution alters transmissibility and immune escape." },
      { axis: "Immunological", value: "Cytokine storm, T-cell exhaustion, autoantibody formation", explanation: "Severe disease involves dysregulated innate and adaptive responses beyond direct viral cytopathy." },
      { axis: "Barrier", value: "Alveolar-capillary barrier breakdown", explanation: "Endothelial injury drives edema, microthrombi, and impaired gas exchange." },
      { axis: "Ecological", value: "Indoor ventilation, seasonality, co-circulating pathogens", explanation: "Environmental crowding and air exchange strongly modulate outbreak dynamics." },
      { axis: "Developmental", value: "Acute illness with long-COVID sequelae", explanation: "Some survivors develop persistent fatigue, dysautonomia, and cognitive symptoms for months." },
      { axis: "Social", value: "Global travel, vaccine equity, misinformation", explanation: "Institutional trust and supply chains shaped mortality disparities across countries." },
      { axis: "Experiential", value: "Isolation, breathlessness, grief, uncertainty", explanation: "Lived burden includes fear of transmission, hospital separation, and disrupted life plans." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "RA01 COVID-19" },
      { name: "SNOMED CT", value: "840539006 Disease caused by SARS-CoV-2" },
      { name: "MONDO", value: "MONDO:0100096 COVID-19" },
    ],
  },
  {
    id: "scd",
    name: "Sickle Cell Disease (SCD)",
    group: "Hybrid / Multiaxial Diseases",
    description: "A hereditary hemoglobinopathy where polymerized sickle hemoglobin deforms erythrocytes, causing vaso-occlusion, hemolysis, and end-organ damage.",
    axes: [
      { axis: "Anatomical", value: "Erythrocytes, bone marrow, spleen, cerebral vessels", explanation: "Sickled cells occlude microvasculature and injure oxygen-sensitive organs." },
      { axis: "Etiologic", value: "HBB gene mutation (HbS) inherited in autosomal recessive pattern", explanation: "Carrier advantage against malaria in endemic regions shapes global allele distribution." },
      { axis: "Molecular", value: "Hemoglobin S polymerization under deoxygenation", explanation: "HbS tetramers form rigid fibers that distort red cell shape and membrane." },
      { axis: "Immunological", value: "Functional asplenia, chronic inflammation", explanation: "Repeated splenic infarction removes filtering capacity and raises infection risk." },
      { axis: "Barrier", value: "Endothelial activation and microvascular leak", explanation: "Ischemia-reperfusion injures vessel walls and promotes thrombosis." },
      { axis: "Ecological", value: "Malaria endemicity and ancestral selection pressure", explanation: "Heterozygote advantage explains high prevalence in West and Central Africa." },
      { axis: "Developmental", value: "Symptoms from infancy with cumulative organ injury", explanation: "Pain crises and stroke risk persist across the lifespan without curative therapy." },
      { axis: "Social", value: "Healthcare access, newborn screening, hydroxyurea availability", explanation: "Outcomes vary sharply by screening programs and specialist care access." },
      { axis: "Experiential", value: "Unpredictable pain crises, fatigue, stigma", explanation: "Lived reality of emergency visits, missed school/work, and invisible disability." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "3A51 Sickle cell disorders" },
      { name: "SNOMED CT", value: "417357006 Sickle cell anemia" },
      { name: "MONDO", value: "MONDO:0011382 sickle cell disease" },
    ],
  },
  {
    id: "mdd",
    name: "Major Depressive Disorder (MDD)",
    group: "Hybrid / Multiaxial Diseases",
    description: "A mood disorder of persistent low mood, anhedonia, and neurovegetative symptoms arising from interacting genetic, neurobiological, and psychosocial factors.",
    axes: [
      { axis: "Anatomical", value: "Prefrontal cortex, amygdala, hippocampus, raphe nuclei", explanation: "Circuits regulating mood, reward, and stress show altered structure and connectivity." },
      { axis: "Etiologic", value: "Multifactorial — genetic risk plus adversity and stress", explanation: "No single cause; heritability interacts with trauma, loss, and chronic strain." },
      { axis: "Molecular", value: "Serotonin, norepinephrine, BDNF pathway dysregulation", explanation: "Monoamine and neurotrophic hypotheses inform but do not fully explain treatment response." },
      { axis: "Immunological", value: "Elevated inflammatory cytokines in subsets", explanation: "IL-6, CRP, and related markers associate with treatment-resistant depression." },
      { axis: "Barrier", value: "HPA-axis hyperactivity, gut-brain signalling", explanation: "Chronic cortisol elevation and microbiome shifts may worsen mood regulation." },
      { axis: "Ecological", value: "Sleep disruption, substance use, social isolation", explanation: "Behavioral and environmental context strongly modulates episode onset and recovery." },
      { axis: "Developmental", value: "First episodes often in adolescence or early adulthood", explanation: "Early-onset depression predicts recurrence and functional impairment." },
      { axis: "Social", value: "Poverty, unemployment, discrimination, care access", explanation: "Social determinants shape both incidence and likelihood of receiving effective care." },
      { axis: "Experiential", value: "Emptiness, guilt, hopelessness, slowed cognition", explanation: "Lived burden includes loss of pleasure, social withdrawal, and fear of being a burden." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "6A70 Single episode depressive disorder" },
      { name: "SNOMED CT", value: "370143000 Major depressive disorder" },
      { name: "MONDO", value: "MONDO:0002009 major depressive disorder" },
    ],
  },
  {
    id: "asthma",
    name: "Asthma",
    group: "Hybrid / Multiaxial Diseases",
    description: "A chronic inflammatory airway disease with reversible bronchoconstriction, where genetics, allergens, pollution, and immune tone interact.",
    axes: [
      { axis: "Anatomical", value: "Bronchi, bronchioles, airway smooth muscle", explanation: "Inflammation and remodeling narrow conducting airways and increase mucus production." },
      { axis: "Etiologic", value: "Atopy, early-life exposures, respiratory infections", explanation: "Childhood allergen and viral exposures prime long-lived airway hyperreactivity." },
      { axis: "Molecular", value: "IgE signalling, IL-4/IL-13 pathways, mast cell degranulation", explanation: "Type 2 inflammation dominates many but not all asthma endotypes." },
      { axis: "Immunological", value: "Eosinophilic and neutrophilic airway inflammation", explanation: "Endotype heterogeneity shapes biologic therapy response." },
      { axis: "Barrier", value: "Epithelial barrier fragility in airways", explanation: "Damaged epithelium allows allergen penetration and amplifies inflammation." },
      { axis: "Ecological", value: "Indoor allergens, outdoor air pollution, climate", explanation: "Urban particulates and pollen seasons worsen symptom burden." },
      { axis: "Developmental", value: "Often begins in childhood with variable remission", explanation: "Many children improve at puberty; adult-onset asthma also occurs." },
      { axis: "Social", value: "Housing quality, occupational exposures, inhaler access", explanation: "Poor ventilation and cost barriers to controllers drive preventable attacks." },
      { axis: "Experiential", value: "Breathlessness fear, activity limits, night waking", explanation: "Lived reality of carrying rescue inhalers and avoiding triggers." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "CA23 Asthma" },
      { name: "SNOMED CT", value: "195967001 Asthma" },
      { name: "MONDO", value: "MONDO:0004979 asthma" },
    ],
  },
  {
    id: "hiv",
    name: "HIV / AIDS",
    group: "Primary Etiologic Diseases",
    description: "A retroviral infection that depletes CD4+ T cells, progressing to AIDS when untreated — now often chronic with antiretroviral therapy.",
    axes: [
      { axis: "Anatomical", value: "CD4+ T lymphocytes, gut-associated lymphoid tissue", explanation: "Viral replication concentrates in lymphoid organs and mucosal immune sites." },
      { axis: "Etiologic", value: "Human immunodeficiency virus (HIV-1 / HIV-2)", explanation: "Transmitted via blood, sexual contact, and perinatal routes." },
      { axis: "Molecular", value: "Reverse transcriptase, integrase, envelope glycoprotein", explanation: "High mutation rate drives drug resistance without consistent therapy." },
      { axis: "Immunological", value: "Progressive T-cell loss and immune activation", explanation: "Chronic inflammation persists even when viral load is suppressed." },
      { axis: "Barrier", value: "Mucosal barrier disruption in gut", explanation: "Early infection damages intestinal epithelium and microbial translocation." },
      { axis: "Ecological", value: "Sexual networks, injection equipment sharing, coinfections", explanation: "TB and other opportunistic infections shape clinical course in untreated disease." },
      { axis: "Developmental", value: "Acute seroconversion to chronic controlled infection", explanation: "ART converts a once-fatal illness into a manageable chronic condition for many." },
      { axis: "Social", value: "Stigma, criminalization, PrEP/ART access disparities", explanation: "Social exclusion and policy determine who receives prevention and treatment." },
      { axis: "Experiential", value: "Disclosure anxiety, pill burden, fear of progression", explanation: "Lived burden includes managing a lifelong diagnosis in a stigmatizing world." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "1C62 HIV disease" },
      { name: "SNOMED CT", value: "86406008 Human immunodeficiency virus infection" },
      { name: "MONDO", value: "MONDO:0005095 HIV infection" },
    ],
  },
  {
    id: "lung-cancer",
    name: "Lung Cancer",
    group: "Secondary Physiological Diseases",
    description: "Malignant neoplasms of the lung driven by tobacco carcinogens, radon, air pollution, and somatic mutations in a complex tumor microenvironment.",
    axes: [
      { axis: "Anatomical", value: "Bronchial epithelium, alveoli, pleura", explanation: "Tumors arise in conducting airways or peripheral parenchyma with distinct histologies." },
      { axis: "Etiologic", value: "Tobacco smoke, radon, occupational carcinogens, genetics", explanation: "Smoking remains the dominant preventable cause worldwide." },
      { axis: "Molecular", value: "EGFR, KRAS, ALK, PD-L1 expression", explanation: "Actionable mutations guide targeted therapy and immunotherapy selection." },
      { axis: "Immunological", value: "Tumor immune evasion, checkpoint suppression", explanation: "Immune checkpoint inhibitors exploit restored T-cell recognition." },
      { axis: "Barrier", value: "Disrupted alveolar-capillary interface", explanation: "Local invasion impairs gas exchange and enables metastasis." },
      { axis: "Ecological", value: "Air pollution, occupational dust, radon in homes", explanation: "Environmental co-exposures add risk beyond smoking alone." },
      { axis: "Developmental", value: "Long latency from exposure to diagnosis", explanation: "Often diagnosed at advanced stage after decades of carcinogenesis." },
      { axis: "Social", value: "Tobacco policy, screening access, occupational protection", explanation: "Screening programs and smoking cessation shape population mortality." },
      { axis: "Experiential", value: "Dyspnea, fatigue, prognosis conversations", explanation: "Lived burden of breathlessness, treatment side effects, and mortality awareness." },
    ],
    crosswalks: [
      { name: "ICD-11", value: "2C25 Malignant neoplasms of bronchus or lung" },
      { name: "SNOMED CT", value: "363358000 Malignant tumor of lung" },
      { name: "MONDO", value: "MONDO:0008903 lung cancer" },
    ],
  },
];

export const morbusDiseaseCount = morbusDiseases.length;
