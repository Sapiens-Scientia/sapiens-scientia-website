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

type DigitalQuery = {
  database: "PubMed" | "ClinVar" | "UniProt" | "Open Targets";
  endpoint: string;
  queryDescription: string;
  findings: string[];
  mockResponse: string;
};

type DiseaseData = {
  id: string;
  name: string;
  group: "Primary Etiologic Diseases" | "Secondary Physiological Diseases" | "Hybrid / Multiaxial Diseases";
  description: string;
  axes: DiseaseAxis[];
  crosswalks: DiseaseCrosswalk[];
  digitalQueries: DigitalQuery[];
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
    digitalQueries: [
      {
        database: "PubMed",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=inflammatory+bowel+disease+AND+NOD2&retmode=json",
        queryDescription: "Querying literature database for clinical trials and review articles linking NOD2 mutations to Crohn's disease susceptibility.",
        findings: [
          "NOD2 (CARD15) was identified as the first susceptibility gene for Crohn's disease (2001).",
          "Double-allele mutants have a 20-to-40-fold increased risk of developing ileal Crohn's disease.",
          "Recent studies link NOD2 dysfunction to impaired defensin secretion by Paneth cells."
        ],
        mockResponse: `{
  "esearchresult": {
    "count": "1485",
    "retmax": "3",
    "idlist": ["38128312", "37992019", "37554318"],
    "translationset": [
      { "from": "inflammatory bowel disease", "to": "\\"inflammatory bowel diseases\\"[MeSH Terms] OR \\"inflammatory bowel disease\\"[All Fields]" }
    ]
  }
}`
      },
      {
        database: "ClinVar",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=1840&retmode=json",
        queryDescription: "Retrieving annotated genomic variants for the NOD2 gene related to disease phenotypes.",
        findings: [
          "Variant R702W (rs2066844) classified as Pathogenic/Susceptibility for Inflammatory Bowel Disease.",
          "Variant G908R (rs2066845) classified as Pathogenic/Susceptibility.",
          "Frameshift mutation 1007fs (rs2066847) leads to truncated NOD2 protein, disrupting bacterial sensing."
        ],
        mockResponse: `{
  "result": {
    "1840": {
      "uid": "1840",
      "title": "NOD2 variant R702W",
      "gene": { "symbol": "NOD2", "id": "64127" },
      "clinical_significance": {
        "description": "Pathogenic (Crohn's Disease susceptibility)",
        "last_evaluated": "2024-10-12"
      },
      "molecular_consequence": "missense variant"
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/O15331.json",
        queryDescription: "Fetching functional protein domains, binding sites, and biological ontologies for the human NOD2 protein.",
        findings: [
          "UniProt Accession: O15331 (Nod2_HUMAN).",
          "Contains 2 CARD domains (caspase recruitment) responsible for downstream NF-kappa-B activation.",
          "Contains 9 Leucine-rich repeats (LRR) involved in direct muramyl dipeptide (MDP) binding."
        ],
        mockResponse: `{
  "primaryAccession": "O15331",
  "uniProtkbId": "NOD2_HUMAN",
  "proteinDescription": {
    "recommendedName": { "fullName": { "value": "Nucleotide-binding oligomerization domain-containing protein 2" } }
  },
  "features": [
    { "type": "Domain", "location": { "start": 28, "end": 119 }, "description": "CARD 1" },
    { "type": "Domain", "location": { "start": 744, "end": 1020 }, "description": "LRR repeats (MDP sensing)" }
  ]
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql (Query: TargetAssociation)",
        queryDescription: "Fetching target-disease association scores and therapeutic pipelines for NOD2 and Inflammatory Bowel Disease.",
        findings: [
          "Overall association score between NOD2 and Crohn's disease: 0.92 (High confidence).",
          "Genetic association score: 0.98, driven by large-scale genome-wide association studies (GWAS).",
          "Implicated therapeutic targets include IL23R and JAK1/JAK3 blockers."
        ],
        mockResponse: `{
  "data": {
    "disease": {
      "id": "EFO_0003767",
      "name": "inflammatory bowel disease",
      "associatedTargets": {
        "score": 0.924,
        "target": {
          "id": "ENSG00000167207",
          "approvedSymbol": "NOD2"
        }
      }
    }
  }
}`
      }
    ]
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
    digitalQueries: [
      {
        database: "PubMed",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=type+2+diabetes+AND+IRS1&retmode=json",
        queryDescription: "Querying literature for studies connecting Insulin Receptor Substrate-1 (IRS1) polymorphisms to insulin resistance.",
        findings: [
          "IRS1 plays a key role in the insulin signaling pathway, transmitting signals to intracellular effectors.",
          "Polymorphisms like G972R impair insulin-stimulated PI3K activation and glucose transport.",
          "Clinical trials demonstrate that IRS1 variation correlates with metformin treatment efficacy."
        ],
        mockResponse: `{
  "esearchresult": {
    "count": "942",
    "retmax": "2",
    "idlist": ["37821811", "36452291"]
  }
}`
      },
      {
        database: "ClinVar",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=3245&retmode=json",
        queryDescription: "Checking genetic variants of IRS1 and SLC2A4 (GLUT4) associated with metabolic traits.",
        findings: [
          "IRS1 variant G972R (rs1801278) listed as pathogenic susceptibility factor for diabetes.",
          "Identified association with increased visceral fat accumulation and decreased insulin secretion."
        ],
        mockResponse: `{
  "result": {
    "3245": {
      "uid": "3245",
      "title": "IRS1 rs1801278 (G972R)",
      "clinical_significance": {
        "description": "Susceptibility to Type 2 Diabetes"
      }
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/P35568.json",
        queryDescription: "Fetching functional map of human Insulin Receptor Substrate-1 (IRS-1).",
        findings: [
          "Accession: P35568 (IRS1_HUMAN).",
          "Contains multiple tyrosine phosphorylation sites (target of Insulin Receptor kinase).",
          "Phosphorylation of serine residues (e.g., Ser307) by inflammatory cytokines (TNF-alpha) disrupts signaling."
        ],
        mockResponse: `{
  "primaryAccession": "P35568",
  "uniProtkbId": "IRS1_HUMAN",
  "features": [
    { "type": "Modified residue", "location": { "start": 307 }, "description": "Phosphoserine (insulin resistance inducer)" },
    { "type": "Modified residue", "location": { "start": 612 }, "description": "Phosphotyrosine (insulin signaling active)" }
  ]
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql",
        queryDescription: "Investigating drug targets and clinical pipelines for Type 2 Diabetes therapeutics.",
        findings: [
          "Top target is AMPK (PRKAA1/2) activated by first-line therapeutic Metformin.",
          "GLP-1 receptor (GLP1R) agonists show high target association and metabolic benefits.",
          "SGLT2 inhibitors (SLC5A2) are validated targets for kidney glucose clearance."
        ],
        mockResponse: `{
  "data": {
    "disease": {
      "name": "type 2 diabetes mellitus",
      "associatedTargets": [
        { "score": 1.0, "target": { "approvedSymbol": "GLP1R" } },
        { "score": 0.96, "target": { "approvedSymbol": "SLC5A2" } }
      ]
    }
  }
}`
      }
    ]
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
    digitalQueries: [
      {
        database: "PubMed",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=tuberculosis+AND+rifampicin+resistance&retmode=json",
        queryDescription: "Querying literature database for clinical studies on multi-drug resistant TB (MDR-TB) mutations.",
        findings: [
          "MDR-TB is defined by resistance to both isoniazid and rifampicin.",
          "Over 95% of rifampicin resistance is caused by mutations in the rpoB gene of M. tuberculosis.",
          "Molecular PCR assays (e.g., GeneXpert) allow rapid diagnostic identification of rpoB mutations."
        ],
        mockResponse: `{
  "esearchresult": {
    "count": "3824",
    "retmax": "1",
    "idlist": ["37910242"]
  }
}`
      },
      {
        database: "ClinVar",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=10245&retmode=json",
        queryDescription: "Querying human gene variants influencing host susceptibility to tuberculosis.",
        findings: [
          "SLC11A1 (formerly NRAMP1) variants (rs17235409) correlate with susceptibility to pulmonary TB.",
          "IFNGR1 mutations lead to complete or partial interferon-gamma receptor deficiency, causing extreme vulnerability to mycobacteria."
        ],
        mockResponse: `{
  "result": {
    "10245": {
      "uid": "10245",
      "title": "IFNGR1 autosomal recessive deficiency",
      "clinical_significance": {
        "description": "Pathogenic (Susceptibility to mycobacterial infection)"
      }
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/P9WGT2.json",
        queryDescription: "Fetching structure and functional annotation of M. tuberculosis Enoyl-[acyl-carrier-protein] reductase (InhA) — target of isoniazid.",
        findings: [
          "Accession: P9WGT2 (INHA_MYCTU).",
          "Key enzyme in fatty acid elongation, essential for mycolic acid biosynthesis.",
          "Activated isoniazid binds to NADH inside InhA, blocking active site and causing cell wall collapse."
        ],
        mockResponse: `{
  "primaryAccession": "P9WGT2",
  "uniProtkbId": "INHA_MYCTU",
  "proteinDescription": {
    "recommendedName": { "fullName": { "value": "Enoyl-[acyl-carrier-protein] reductase [NADH]" } }
  },
  "keywords": ["Antibiotic resistance", "Fatty acid biosynthesis", "Cell wall biogenesis"]
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql",
        queryDescription: "Reviewing targets for anti-mycobacterial therapies and resistance management.",
        findings: [
          "Bedaquiline targets the Mycobacterial ATP synthase subunit C (atpE).",
          "Pretomanid and Delamanid target mycolic acid synthesis, active against dormant bacilli.",
          "Host-directed therapies targeting host cytokine pathways (e.g. TNF alpha) are under trial."
        ],
        mockResponse: `{
  "data": {
    "drug": {
      "name": "Bedaquiline",
      "mechanismsOfAction": [
        { "target": "atpE", "action": "Inhibitor", "targetName": "ATP synthase subunit C" }
      ]
    }
  }
}`
      }
    ]
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
    digitalQueries: [
      {
        database: "PubMed",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=alzheimer+AND+APOE4+amyloid&retmode=json",
        queryDescription: "Querying literature for mechanisms linking the APOE4 allele to impaired amyloid clearance.",
        findings: [
          "APOE4 isoform has a lower affinity for amyloid-beta, reducing transport across the BBB.",
          "APOE4 carriers display significantly accelerated amyloid plaque deposition in Positron Emission Tomography (PET).",
          "Therapeutic trials show amyloid-reducing monoclonal antibodies are highly effective but carry risk of ARIA (amyloid-related imaging abnormalities) in E4 homozygotes."
        ],
        mockResponse: `{
  "esearchresult": {
    "count": "2311",
    "retmax": "1",
    "idlist": ["38001284"]
  }
}`
      },
      {
        database: "ClinVar",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=12560&retmode=json",
        queryDescription: "Retrieving pathogenic variants in APP, PSEN1, and PSEN2 that cause early-onset familial Alzheimer's.",
        findings: [
          "PSEN1 variant L166P (rs63750082) classified as Pathogenic; causes early-onset AD (onset in 20s/30s).",
          "APP Swedish mutation (rs63750263) increases total Abeta production by enhancing beta-secretase cleavage.",
          "APOE epsilon-4 allele listed as Risk Factor (not deterministic, major susceptibility locus)."
        ],
        mockResponse: `{
  "result": {
    "12560": {
      "uid": "12560",
      "title": "PSEN1 L166P mutation",
      "clinical_significance": {
        "description": "Pathogenic (Familial early-onset Alzheimer's Disease)"
      }
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/P05067.json",
        queryDescription: "Inspecting the Amyloid Beta Precursor Protein (APP) sequences and protease cleavage sites.",
        findings: [
          "Accession: P05067 (A4_HUMAN).",
          "Cleaved by beta-secretase (BACE1) and gamma-secretase complex to release Amyloid-beta peptides.",
          "Abeta-42 peptide (cleavage at Ala-713) is hydrophobic and highly prone to oligomerization into neurotoxic fibrils."
        ],
        mockResponse: `{
  "primaryAccession": "P05067",
  "uniProtkbId": "A4_HUMAN",
  "features": [
    { "type": "Peptide", "location": { "start": 672, "end": 713 }, "description": "Amyloid-beta protein 42 (toxic peptide)" }
  ]
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql",
        queryDescription: "Querying therapeutic pipelines and targets (anti-amyloid, anti-tau, neuroinflammatory pathways).",
        findings: [
          "Monoclonal antibody Lecanemab targets soluble Abeta protofibrils (APP).",
          "Donanemab targets N-terminally truncated pyroglutamate amyloid-beta.",
          "Microglial receptor TREM2 is a high-priority target in Phase I/II trials to stimulate plaque clearance."
        ],
        mockResponse: `{
  "data": {
    "target": {
      "approvedSymbol": "TREM2",
      "tractability": { "antibody": "Clinical Phase II", "smallMolecule": "Discovery" }
    }
  }
}`
      }
    ]
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
    digitalQueries: [
      {
        database: "PubMed",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=traumatic+brain+injury+AND+GFAP+biomarker&retmode=json",
        queryDescription: "Querying literature for studies utilizing serum biomarkers to diagnose mild traumatic brain injury.",
        findings: [
          "Glial Fibrillary Acidic Protein (GFAP) and Ubiquitin C-terminal Hydrolase L1 (UCH-L1) release into serum indicates glial injury.",
          "FDA approved blood tests for GFAP/UCH-L1 within 12 hours of injury to rule out the need for a head CT scan.",
          "Long-term outcomes correlate with peak biomarker concentrations, tracking axonal damage."
        ],
        mockResponse: `{
  "esearchresult": {
    "count": "342",
    "retmax": "1",
    "idlist": ["37648211"]
  }
}`
      },
      {
        database: "ClinVar",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&term=APOE+AND+traumatic+brain+injury",
        queryDescription: "Querying genetic modifiers that influence rehabilitation and dementia risk following head trauma.",
        findings: [
          "APOE epsilon-4 allele (rs429358) carriers display poor functional recovery and increased susceptibility to post-traumatic cognitive decline.",
          "MAPT (Tau) haplotypes (H1 vs H2) correlate with differential risk of chronic traumatic encephalopathy (CTE) from repeated sub-concussive impacts."
        ],
        mockResponse: `{
  "result": {
    "APOE_rs429358": {
      "gene": "APOE",
      "modifier_factor": "APOE4 carrier status",
      "association": "Poor neurological recovery following closed head injury"
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/P14136.json",
        queryDescription: "Inspecting Glial Fibrillary Acidic Protein (GFAP) protein annotation and structural release pathways.",
        findings: [
          "Accession: P14136 (GFAP_HUMAN).",
          "Main intermediate filament protein in mature astrocytes; maintains mechanical strength of cells.",
          "Trauma and cell necrosis trigger enzymatic cleavage and release of GFAP fragments into the cerebrospinal fluid and bloodstream."
        ],
        mockResponse: `{
  "primaryAccession": "P14136",
  "uniProtkbId": "GFAP_HUMAN",
  "proteinDescription": {
    "recommendedName": { "fullName": { "value": "Glial fibrillary acidic protein" } }
  },
  "subcellularLocation": "Cytoplasm, cytoskeleton"
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql",
        queryDescription: "Reviewing experimental targets targeting neuroprotection and blocking secondary cell death cascades.",
        findings: [
          "Targets include NMDA receptor antagonists (GRIN2A/GRIN2B) to mitigate acute glutamate excitotoxicity (mostly failed in clinical trials).",
          "Anti-inflammatory agents targeting interleukin-1 (IL1B / IL1R1) are under investigation to suppress microglial hyper-activation.",
          "Calcium channel blockades (e.g. CACNA1C) targeting mitochondrial overload."
        ],
        mockResponse: `{
  "data": {
    "disease": {
      "name": "brain injury",
      "clinicalTrials": [
        { "phase": "III", "drug": "Progesterone", "status": "Terminated" },
        { "phase": "II", "drug": "Anakinra", "target": "IL1R1" }
      ]
    }
  }
}`
      }
    ]
  },
  {
    id: "lead",
    name: "Lead Poisoning",
    group: "Primary Etiologic Diseases",
    description: "A toxicological condition caused by the ingestion or inhalation of lead, interfering with essential metal enzymes and calcium signaling.",
    axes: [
      { axis: "Anatomical", value: "Central and peripheral nervous system, bone marrow, kidneys", explanation: "Accumulates in mineralized tissues (bones/teeth) and causes demyelination in nerves." },
      { axis: "Etiologic", value: "Exposure to divalent lead cations (Pb2+)", explanation: "Ingestion of lead-based paint dust, contaminated soil, or drinking water from lead service pipes." },
      { axis: "Molecular", value: "Inhibition of ALAD enzyme, calcium ion mimicry", explanation: "Lead binds to sulfur atoms in ALAD, halting heme synthesis; mimics calcium to bypass blood-brain barrier." },
      { axis: "Immunological", value: "Pro-inflammatory microglia activation in cerebral cortex", explanation: "Lead triggers astrocyte and microglia activation, releasing nitric oxide and inflammatory cytokines." },
      { axis: "Barrier", value: "Disruption of capillary endothelial junctions (BBB)", explanation: "Lead breaks down the blood-brain barrier, causing brain microvascular leakage and cerebral edema." },
      { axis: "Ecological", value: "Interference with essential mineral absorption", explanation: "Competes directly with calcium, iron, and zinc in the gastrointestinal tract and osteoblasts." },
      { axis: "Developmental", value: "Irreversible cognitive deficit during early childhood", explanation: "Developing brains are highly vulnerable; lead exposure under age 5 leads to lifelong IQ reduction." },
      { axis: "Social", value: "Low-income housing aging, lead pipes, industrial smelting", explanation: "Prevalence is tightly linked to systemic poverty, zip code infrastructure age, and environmental regulation." },
      { axis: "Experiential", value: "Abdominal colic, peripheral motor weakness, developmental struggle", explanation: "Includes painful gastrointestinal cramps ('lead colic'), wrist drop, learning difficulties, and behavioral changes." }
    ],
    crosswalks: [
      { name: "ICD-11", value: "NE61.0 Toxic effect of lead and its compounds" },
      { name: "SNOMED CT", value: "85532008 Lead poisoning" },
      { name: "MONDO", value: "MONDO:0005570 lead poisoning" }
    ],
    digitalQueries: [
      {
        database: "PubMed",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=lead+poisoning+AND+ALAD+enzyme&retmode=json",
        queryDescription: "Searching for biochemical research detailing lead's inhibition of delta-aminolevulinic acid dehydratase.",
        findings: [
          "Lead binds to zinc-binding sites in ALAD, inhibiting heme biosythesis and causing accumulation of toxic aminolevulinic acid.",
          "Serum ALAD activity is a highly sensitive biomarker of lead exposure, decreasing linearly with blood lead level.",
          "Accumulated aminolevulinic acid generates reactive oxygen species, contributing to neuropathology."
        ],
        mockResponse: `{
  "esearchresult": {
    "count": "184",
    "retmax": "1",
    "idlist": ["37218301"]
  }
}`
      },
      {
        database: "ClinVar",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&term=ALAD+AND+lead+sensitivity",
        queryDescription: "Querying host genes with variants that modify lead susceptibility.",
        findings: [
          "ALAD polymorphism rs1800435 (ALAD-2 allele) encodes an enzyme with higher binding affinity for lead, retaining lead in blood and potentially protecting organs from tissue uptake.",
          "VDR (Vitamin D Receptor) genotypes modify lead mobilization from bones during pregnancy and aging."
        ],
        mockResponse: `{
  "result": {
    "ALAD_rs1800435": {
      "gene": "ALAD",
      "variant": "ALAD-2 (rs1800435)",
      "impact": "Modifies lead toxicokinetics; increases blood lead retention"
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/P13716.json",
        queryDescription: "Retrieving sequence annotation and zinc-binding coordinates for human ALAD.",
        findings: [
          "Accession: P13716 (ALAD_HUMAN).",
          "Binds 1 catalytic zinc ion per subunit at active site cysteine residues (Cys-122, Cys-124, Cys-132).",
          "Divalent lead displaces zinc, causing structural collapse of the homooctamer."
        ],
        mockResponse: `{
  "primaryAccession": "P13716",
  "uniProtkbId": "ALAD_HUMAN",
  "features": [
    { "type": "Metal binding", "location": { "start": 122 }, "description": "Zinc 1; displaced by Pb2+" },
    { "type": "Active site", "location": { "start": 204 }, "description": "Schiff base intermediate formation" }
  ]
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql",
        queryDescription: "Reviewing metal chelator therapies and antidote targets.",
        findings: [
          "Succimer (DMSA) acts as a heavy metal chelating agent to promote urinary excretion.",
          "Edetate calcium disodium (EDTA) is utilized in severe encephalopathic cases.",
          "Calcium/Iron supplementation is indicated to compete for intestinal transporters (DMT1)."
        ],
        mockResponse: `{
  "data": {
    "drug": {
      "name": "Succimer",
      "synonyms": ["DMSA", "dimercaptosuccinic acid"],
      "indications": ["Lead Poisoning, Pediatric"]
    }
  }
}`
      }
    ]
  },
  {
    id: "cf",
    name: "Cystic Fibrosis (CF)",
    group: "Primary Etiologic Diseases",
    description: "An autosomal recessive genetic disease caused by mutations in the CFTR gene, leading to defective chloride transport and thick, sticky mucus build-up in organs.",
    axes: [
      { axis: "Anatomical", value: "Lungs, pancreas, sweat glands, reproductive tract", explanation: "Blocks pulmonary airways and pancreatic ducts with dense mucus plugs, leading to tissue scarring." },
      { axis: "Etiologic", value: "Homozygous mutations in the CFTR gene", explanation: "Inheritance of two defective alleles of the Cystic Fibrosis Transmembrane Conductance Regulator." },
      { axis: "Molecular", value: "Misfolded CFTR chloride channel (F508del)", explanation: "Deletion of phenylalanine 508 triggers ER-associated degradation, preventing the channel from reaching cell membrane." },
      { axis: "Immunological", value: "Persistent neutrophil-dominated airway inflammation", explanation: "Sustained IL-8 secretion recruits vast numbers of neutrophils, releasing elastase and DNA that thickens mucus." },
      { axis: "Barrier", value: "Dehydrated epithelial mucosal barrier", explanation: "Impaired chloride efflux and excess sodium influx dehydrate the airway surface liquid, halting mucociliary clearance." },
      { axis: "Ecological", value: "Chronic pulmonary colonization (Pseudomonas aeruginosa)", explanation: "Deoxygenated mucus niches recruit Pseudomonas and Staphylococcus, forming drug-resistant biofilms." },
      { axis: "Developmental", value: "Congenital exocrine failure to progressive pulmonary destruction", explanation: "Begins with meconium ileus at birth and pancreatic enzyme deficiency, advancing to chronic lung bronchiectasis." },
      { axis: "Social", value: "Newborn screening, high-cost modulator therapies", explanation: "Transformed by infant genetic screening; highlights disparities in global access to CFTR modulators." },
      { axis: "Experiential", value: "Daily airway clearance, chronic cough, nutritional struggle", explanation: "Lived burden includes hours of chest physical therapy, dozens of daily enzyme pills, and frequent hospitalizations." }
    ],
    crosswalks: [
      { name: "ICD-11", value: "CA25 Cystic fibrosis" },
      { name: "SNOMED CT", value: "190905008 Cystic fibrosis" },
      { name: "MONDO", value: "MONDO:0009061 cystic fibrosis" }
    ],
    digitalQueries: [
      {
        database: "PubMed",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=cystic+fibrosis+AND+F508del+AND+modulators&retmode=json",
        queryDescription: "Querying literature for clinical trial efficacy of triple-combination CFTR modulators.",
        findings: [
          "Triple-combination therapy (Elexacaftor/Tezacaftor/Ivacaftor) significantly increases F508del cell membrane rescue.",
          "Clinical trials demonstrate a 10-14% increase in lung function (FEV1) and drastic decrease in sweat chloride.",
          "Modulators rescue both channel folding (correctors) and channel opening (potentiators)."
        ],
        mockResponse: `{
  "esearchresult": {
    "count": "753",
    "retmax": "1",
    "idlist": ["38118021"]
  }
}`
      },
      {
        database: "ClinVar",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=10738&retmode=json",
        queryDescription: "Inspecting mutations in the CFTR gene cataloged in ClinVar.",
        findings: [
          "Variant F508del (rs113993960) classified as Pathogenic; accounts for ~70% of CF alleles globally.",
          "G551D mutation (rs75527207) classified as Pathogenic (Class III gating defect; responsive to Ivacaftor).",
          "W1282X mutation classified as Pathogenic (Class I nonsense mutation; causes premature termination)."
        ],
        mockResponse: `{
  "result": {
    "10738": {
      "uid": "10738",
      "title": "CFTR phe508del",
      "clinical_significance": {
        "description": "Pathogenic (Cystic Fibrosis)"
      },
      "hgvs": "c.1521_1523delCTT"
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/P13569.json",
        queryDescription: "Fetching functional topology of the human CFTR ABC transporter.",
        findings: [
          "Accession: P13569 (CFTR_HUMAN).",
          "ATP-binding cassette (ABC) transporter functioning as a cAMP-regulated chloride channel.",
          "Contains 2 membrane-spanning domains, 2 nucleotide-binding domains (NBD), and a regulatory R domain."
        ],
        mockResponse: `{
  "primaryAccession": "P13569",
  "uniProtkbId": "CFTR_HUMAN",
  "proteinDescription": {
    "recommendedName": { "fullName": { "value": "Cystic fibrosis transmembrane conductance regulator" } }
  },
  "features": [
    { "type": "Mutagenesis", "location": { "start": 508, "end": 508 }, "description": "F -> del: Prevents folding & membrane trafficking" }
  ]
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql",
        queryDescription: "Reviewing approved CFTR modulator pipelines.",
        findings: [
          "Ivacaftor approved as a CFTR potentiator (forces channel open).",
          "Lumacaftor and Tezacaftor approved as correctors (stabilize channel folding).",
          "Gene editing (CRISPR/Cas9) and mRNA therapies targeting basal cells are in preclinical phases."
        ],
        mockResponse: `{
  "data": {
    "target": {
      "approvedSymbol": "CFTR",
      "associatedDiseases": [
        { "name": "cystic fibrosis", "score": 1.0 }
      ]
    }
  }
}`
      }
    ]
  },
  {
    id: "athero",
    name: "Atherosclerosis",
    group: "Secondary Physiological Diseases",
    description: "A chronic inflammatory disease of the arterial wall, characterized by the accumulation of lipid plaques, fibrous tissue, and inflammatory cells in the intima.",
    axes: [
      { axis: "Anatomical", value: "Large and medium-sized arteries (coronary, carotid, aorta)", explanation: "Plaques develop in the subendothelial space of arterial branches where blood flow is turbulent." },
      { axis: "Etiologic", value: "Endothelial shear stress + apoB-containing lipoproteins", explanation: "Circulating LDL particles penetrate and get trapped in the arterial wall under low shear stress." },
      { axis: "Molecular", value: "ApoB oxidation, CD36 macrophage activation, cholesterol crystallization", explanation: "Oxidized LDL binds to macrophage CD36 receptors, triggering NLRP3 inflammasome and foam cell formation." },
      { axis: "Immunological", value: "Chronic T-cell and macrophage-driven vascular inflammation", explanation: "Monocytes enter intima, differentiate into macrophages, and secrete TNF-alpha, IL-1beta, and metalloproteinases." },
      { axis: "Barrier", value: "Endothelial cell junction breakdown, fibrous cap thinning", explanation: "Vascular wall barrier breaks down, recruiting cells; cap matrix degradation leads to plaque rupture." },
      { axis: "Ecological", value: "Vascular wall lipid microenvironment", explanation: "Lipid core accumulation and calcification drive tissue necrosis and foam cell cell-death cascades." },
      { axis: "Developmental", value: "Progressive accumulation of vascular damage over decades", explanation: "Begins as fatty streaks in adolescence, progressing silently until rupture in mid-to-late life." },
      { axis: "Social", value: "Sedentary lifestyle, high-fat/refined diets, tobacco smoking", explanation: "Strongly shaped by industrialized food environments, tobacco marketing, and cardiovascular screening access." },
      { axis: "Experiential", value: "Silent progression to angina, myocardial infarction, or stroke", explanation: "Fears of cardiovascular events, chest pain (angina), medication burdens (statins), and physical limitations." }
    ],
    crosswalks: [
      { name: "ICD-11", value: "BD40 Atherosclerosis" },
      { name: "SNOMED CT", value: "28960008 Atherosclerosis" },
      { name: "MONDO", value: "MONDO:0005311 atherosclerosis" }
    ],
    digitalQueries: [
      {
        database: "PubMed",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=atherosclerosis+AND+PCSK9+inhibitors&retmode=json",
        queryDescription: "Querying literature for clinical trial data on PCSK9 monoclonal antibodies reducing cardiovascular events.",
        findings: [
          "PCSK9 binds to hepatic LDL receptors, promoting their degradation and increasing circulating LDL.",
          "Monoclonal antibodies (Evolocumab/Alirocumab) lower LDL cholesterol by 50-60% when added to statins.",
          "Cardiovascular outcome trials (e.g., FOURIER) show significant reduction in stroke and heart attacks."
        ],
        mockResponse: `{
  "esearchresult": {
    "count": "2184",
    "retmax": "1",
    "idlist": ["37549012"]
  }
}`
      },
      {
        database: "ClinVar",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&term=LDLR+AND+hypercholesterolemia",
        queryDescription: "Querying ClinVar database for mutations causing familial hypercholesterolemia (accelerating atherosclerosis).",
        findings: [
          "LDLR mutations (rs121908025) lead to defective low-density lipoprotein clearance (Class 1-5 defects).",
          "APOB variant R3527Q impairs binding to the LDL receptor, causing familial ligand-defective apoB-100."
        ],
        mockResponse: `{
  "result": {
    "LDLR_rs121908025": {
      "gene": "LDLR",
      "variant": "C295Y",
      "clinical_significance": {
        "description": "Pathogenic (Familial Hypercholesterolemia Type 1)"
      }
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/P01130.json",
        queryDescription: "Fetching structure and functional annotation of the human Low-Density Lipoprotein Receptor (LDLR).",
        findings: [
          "Accession: P01130 (LDUR_HUMAN).",
          "Mediates endocytosis of cholesterol-rich LDL; binds ApoB-100 and ApoE.",
          "Cleaved or internalized via clathrin-coated pits; recycled to the cell surface."
        ],
        mockResponse: `{
  "primaryAccession": "P01130",
  "uniProtkbId": "LDUR_HUMAN",
  "features": [
    { "type": "Domain", "location": { "start": 25, "end": 313 }, "description": "LDL-receptor class A repeats (ApoB binding)" }
  ]
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql",
        queryDescription: "Investigating cardiovascular drug targets (lipid-lowering, anti-inflammatory).",
        findings: [
          "HMG-CoA Reductase (HMGCR) is the target of Statins, inhibiting cholesterol biosynthesis.",
          "PCSK9 target is validated; includes monoclonal antibodies and siRNA (Inclisiran).",
          "IL-1beta (Canakinumab) validated anti-inflammatory target to reduce cardiovascular event rates without altering lipids."
        ],
        mockResponse: `{
  "data": {
    "target": {
      "approvedSymbol": "HMGCR",
      "associatedDiseases": [
        { "name": "atherosclerotic cardiovascular disease", "score": 0.98 }
      ]
    }
  }
}`
      }
    ]
  },
  {
    id: "copd",
    name: "Chronic Obstructive Pulmonary Disease (COPD)",
    group: "Hybrid / Multiaxial Diseases",
    description: "A progressive, chronic lung disease characterized by airflow limitation, caused by emphysema (alveolar destruction) and chronic bronchitis (airway inflammation).",
    axes: [
      { axis: "Anatomical", value: "Bronchioles, alveolar walls, respiratory epithelium", explanation: "Destruction of elastic alveolar walls reduces lung surface area and collapses small airways during exhalation." },
      { axis: "Etiologic", value: "Cigarette smoke, biomass fuel smoke, alpha-1 antitrypsin deficiency", explanation: "Chronic exposure to inhaled noxious gases and particles triggers cellular injury and enzyme imbalance." },
      { axis: "Molecular", value: "Protease-antiprotease imbalance, oxidative inactivation of AAT", explanation: "Inhaled oxidants inactivate alpha-1 antitrypsin, releasing neutrophil elastase to destroy elastin." },
      { axis: "Immunological", value: "CD8+ T-cell and neutrophil-mediated tissue destruction", explanation: "Macrophage and neutrophil activation releases matrix metalloproteinases (MMP-9/12) and inflammatory cytokines." },
      { axis: "Barrier", value: "Alveolar-capillary barrier degradation", explanation: "Destruction of alveolar septa compromises gas-exchange tissue barriers, leading to hypoxia." },
      { axis: "Ecological", value: "Altered lung microbiome, chronic bacterial colonization", explanation: "Loss of epithelial ciliary function allows colonization by Haemophilus influenzae and Moraxella catarrhalis." },
      { axis: "Developmental", value: "Slow decline in lung function (FEV1) over decades", explanation: "Typically diagnosed after age 40, accelerating age-related lung function loss." },
      { axis: "Social", value: "Tobacco marketing, occupational exposure (mining/agriculture)", explanation: "Directly correlated with tobacco density, industrial workplace regulations, and biomass cooking stove usage." },
      { axis: "Experiential", value: "Progressive dyspnea, chronic productive cough, oxygen dependence", explanation: "Air hunger ('dyspnea'), fatigue, constant cough, and anxiety from struggling to breathe." }
    ],
    crosswalks: [
      { name: "ICD-11", value: "CA22 Chronic obstructive pulmonary disease" },
      { name: "SNOMED CT", value: "13645005 Chronic obstructive lung disease" },
      { name: "MONDO", value: "MONDO:0005002 chronic obstructive pulmonary disease" }
    ],
    digitalQueries: [
      {
        database: "PubMed",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=COPD+AND+alpha-1+antitrypsin+deficiency&retmode=json",
        queryDescription: "Querying literature for studies connecting SERPINA1 mutations to early-onset emphysema in smokers.",
        findings: [
          "Alpha-1 antitrypsin deficiency (AATD) is a major genetic risk factor for COPD, accelerating emphysema.",
          "Smokers with homozygous AATD (PiZZ phenotype) experience rapid lung function decline in their 30s/40s.",
          "AAT augmentation therapy (intravenous infusing of human AAT) slows the progression of emphysema."
        ],
        mockResponse: `{
  "esearchresult": {
    "count": "1123",
    "retmax": "1",
    "idlist": ["37489012"]
  }
}`
      },
      {
        database: "ClinVar",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&term=SERPINA1+AND+deficiency",
        queryDescription: "Retrieving pathogenic variants in the SERPINA1 gene (alpha-1 antitrypsin inhibitor).",
        findings: [
          "PI*Z variant (rs28929474, Glu342Lys) classified as Pathogenic; causes protein aggregation in liver and deficiency in lung.",
          "PI*S variant (rs17580, Glu264Val) classified as Pathogenic (milder reduction in circulating AAT levels)."
        ],
        mockResponse: `{
  "result": {
    "SERPINA1_rs28929474": {
      "gene": "SERPINA1",
      "variant": "PiZZ (Glu342Lys)",
      "clinical_significance": {
        "description": "Pathogenic (Alpha-1 antitrypsin deficiency)"
      }
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/P01009.json",
        queryDescription: "Fetching functional annotations and active loop structures for human Alpha-1-antitrypsin.",
        findings: [
          "Accession: P01009 (A1AT_HUMAN).",
          "Functions as a serine protease inhibitor (serpin); inhibits neutrophil elastase to protect lung elastic fibers.",
          "Reactive center loop contains Met-358, which is oxidized by cigarette smoke, destroying inhibitory activity."
        ],
        mockResponse: `{
  "primaryAccession": "P01009",
  "uniProtkbId": "A1AT_HUMAN",
  "features": [
    { "type": "Active site", "location": { "start": 358 }, "description": "Methionine; oxidized by smoking" }
  ]
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql",
        queryDescription: "Querying pharmaceutical drug pipelines targeting COPD bronchodilation and inflammation.",
        findings: [
          "Tiotropium bromides target the Muscarinic acetylcholine receptor M3 (CHRM3) to induce smooth muscle relaxation.",
          "Indacaterol and Formoterol target the Beta-2 adrenergic receptor (ADRB2) as long-acting agonists (LABA).",
          "Dupilumab (IL-4R alpha) has entered Phase III clinical trials for eosinophilic-phenotype COPD."
        ],
        mockResponse: `{
  "data": {
    "disease": {
      "name": "chronic obstructive pulmonary disease",
      "associatedTargets": [
        { "score": 1.0, "target": { "approvedSymbol": "CHRM3" } },
        { "score": 1.0, "target": { "approvedSymbol": "ADRB2" } }
      ]
    }
  }
}`
      }
    ]
  }
];

export function MorbusExplorer() {
  const [selectedId, setSelectedId] = useState("ibd");
  const [selectedAxisIndex, setSelectedAxisIndex] = useState<number | null>(null);
  const [activeDbTab, setActiveDbTab] = useState<"PubMed" | "ClinVar" | "UniProt" | "Open Targets">("PubMed");

  const activeDisease = diseases.find((d) => d.id === selectedId) || diseases[0];
  const activeQuery = activeDisease.digitalQueries.find((q) => q.database === activeDbTab) || activeDisease.digitalQueries[0];

  const dbColors = {
    "PubMed": "text-sky-300 border-sky-400/30 bg-sky-400/5",
    "ClinVar": "text-teal-300 border-teal-400/30 bg-teal-400/5",
    "UniProt": "text-emerald-300 border-emerald-400/30 bg-emerald-400/5",
    "Open Targets": "text-indigo-300 border-indigo-400/30 bg-indigo-400/5"
  };

  const dbTabs: ("PubMed" | "ClinVar" | "UniProt" | "Open Targets")[] = ["PubMed", "ClinVar", "UniProt", "Open Targets"];

  return (
    <div className="flex flex-col gap-8 border border-white/10 bg-white/[0.015] p-6 sm:p-8 rounded-lg">
      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-5">
        {diseases.map((d) => (
          <button
            key={d.id}
            onClick={() => {
              setSelectedId(d.id);
              setSelectedAxisIndex(null);
            }}
            className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all rounded-md ${
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
        <div className="rounded-lg border border-white/10 bg-white/[0.025] p-5 flex flex-col gap-3">
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
                className={`text-left p-4 border transition-all cursor-pointer flex flex-col gap-2 rounded-lg ${
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

      {/* Digital Earth Knowledge Crosswalk */}
      <div className="flex flex-col gap-5 border-t border-white/10 pt-6">
        <div>
          <span className="text-[0.62rem] font-bold uppercase tracking-widest text-sky-400">
            Digital Earth Integration
          </span>
          <h4 className="text-lg font-bold text-slate-100 mt-0.5">
            Digital Earth Knowledge Crosswalk
          </h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Simulate how a computational agent queries the database registries of the Digital Earth to aggregate physiological evidence. Click a tab to select a database.
          </p>
        </div>

        {/* Database Selector Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/5 pb-3">
          {dbTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveDbTab(tab)}
              className={`cursor-pointer px-3.5 py-1.5 text-xs font-mono font-semibold transition-all rounded border ${
                activeDbTab === tab
                  ? dbColors[tab] + " shadow-[0_0_12px_rgba(56,189,248,0.1)]"
                  : "border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]"
              }`}
            >
              {tab === "PubMed" ? "🔬 PubMed (Literature)" : ""}
              {tab === "ClinVar" ? "🧬 ClinVar (Variants)" : ""}
              {tab === "UniProt" ? "🧬 UniProt (Proteins)" : ""}
              {tab === "Open Targets" ? "🎯 Open Targets (Drugs)" : ""}
            </button>
          ))}
        </div>

        {/* Crosswalk Visualizer Panel */}
        {activeQuery && (
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] bg-white/[0.01] border border-white/5 p-5 rounded-lg animate-fadeIn">
            {/* Query & Findings info */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-[0.68rem] font-mono font-semibold text-slate-400 uppercase tracking-widest">
                  Simulated API Request URL
                </p>
                <div className="mt-1.5 font-mono text-xs select-all bg-black border border-white/10 p-2.5 rounded text-sky-300 break-all">
                  {activeQuery.endpoint}
                </div>
                <p className="text-[0.68rem] text-slate-500 mt-1">
                  {activeQuery.queryDescription}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Knowledge Synthesis & Findings
                </p>
                <ul className="list-disc list-inside text-sm text-slate-400 space-y-1.5">
                  {activeQuery.findings.map((finding, fIdx) => (
                    <li key={fIdx} className="leading-snug">
                      <span className="text-slate-300">{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Simulated Response JSON */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Simulated JSON Response
                </span>
                <span className="text-[9px] font-mono text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 px-2 py-0.5 rounded uppercase">
                  STATUS 200 OK
                </span>
              </div>
              <pre className="text-[11px] leading-relaxed font-mono bg-black border border-white/10 p-4 rounded-lg text-slate-300 overflow-x-auto max-h-[220px] scrollbar-hidden select-text">
                <code>{activeQuery.mockResponse}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
