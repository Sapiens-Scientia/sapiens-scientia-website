"use client";

import { useMemo, useState } from "react";
import { morbusDiseases, morbusGroupKinds, type DiseaseData } from "@/lib/morbus";

const diseaseGroups = morbusGroupKinds;

function diseaseMatchesQuery(disease: DiseaseData, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return (
    disease.name.toLowerCase().includes(normalized) ||
    disease.group.toLowerCase().includes(normalized) ||
    disease.axes.some(
      (axis) =>
        axis.axis.toLowerCase().includes(normalized) ||
        axis.value.toLowerCase().includes(normalized),
    )
  );
}

export type DigitalQuery = {
  database: "PubMed" | "ClinVar" | "UniProt" | "Open Targets";
  endpoint: string;
  queryDescription: string;
  findings: string[];
  mockResponse: string;
};

function getDigitalQueriesForDisease(disease: DiseaseData): DigitalQuery[] {
  const name = disease.name;
  const id = disease.id;

  if (id === "ibd") {
    return [
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
    ];
  }

  if (id === "t2d") {
    return [
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
        queryDescription: "Checking genetic variants of IRS1 associated with metabolic traits.",
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
        "description": "Pathogenic (T2D susceptibility)",
        "last_evaluated": "2024-05-18"
      }
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/P35568.json",
        queryDescription: "Fetching functional annotations and phosphorylation sites for human IRS1.",
        findings: [
          "Accession: P35568 (IRS1_HUMAN).",
          "Contains multiple tyrosine phosphorylation sites that serve as docking platforms for SH2 domain proteins.",
          "Serine phosphorylation by inflammatory cytokines (TNF-alpha) disrupts insulin signaling transduction."
        ],
        mockResponse: `{
  "primaryAccession": "P35568",
  "uniProtkbId": "IRS1_HUMAN",
  "features": [
    { "type": "Modified residue", "location": { "start": 307 }, "description": "Phosphoserine (mediates insulin resistance)" }
  ]
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql",
        queryDescription: "Querying pharmaceutical pipelines targeting type 2 diabetes and GLP-1/GIP receptor agonists.",
        findings: [
          "Implicated targets include GLP1R (Glucagon-like peptide 1 receptor) and GIPR.",
          "Approved therapeutics (e.g., Semaglutide, Tirzepatide) show extremely high efficacy in clinical weight loss.",
          "Secondary targets target SGLT2 (SLC5A2) to increase renal glucose clearance."
        ],
        mockResponse: `{
  "data": {
    "disease": {
      "name": "type 2 diabetes mellitus",
      "associatedTargets": [
        { "score": 1.0, "target": { "approvedSymbol": "GLP1R" } },
        { "score": 1.0, "target": { "approvedSymbol": "SLC5A2" } }
      ]
    }
  }
}`
      }
    ];
  }

  if (id === "tb") {
    return [
      {
        database: "PubMed",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=tuberculosis+AND+IFNG+pathway&retmode=json",
        queryDescription: "Querying biomedical papers analyzing interferon-gamma (IFN-g) responses in active tuberculosis.",
        findings: [
          "IFN-gamma production by CD4+ Th1 cells is critical for macrophage activation and control of M. tuberculosis.",
          "Genetic defects in the IFN-gamma receptor (IFNGR1/IFNGR2) lead to severe mycobacterial vulnerability.",
          "IGRA (Interferon-Gamma Release Assays) measure T-cell response to diagnose latent tuberculosis."
        ],
        mockResponse: `{
  "esearchresult": {
    "count": "812",
    "retmax": "2",
    "idlist": ["37492102", "37119024"]
  }
}`
      },
      {
        database: "ClinVar",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&term=IFNGR1+AND+tuberculosis",
        queryDescription: "Querying human variations in the IFN-gamma receptor linked to mycobacterial susceptibility.",
        findings: [
          "Autosomal recessive mutations in IFNGR1 cause Mendelian Susceptibility to Mycobacterial Diseases (MSMD).",
          "Frameshift and missense mutations in the ligand-binding domain prevent IFN-g binding."
        ],
        mockResponse: `{
  "result": {
    "IFNGR1_mutation": {
      "gene": "IFNGR1",
      "significance": "Pathogenic (Mendelian Susceptibility to Mycobacterial Disease)",
      "transmission": "Autosomal recessive"
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/P15260.json",
        queryDescription: "Fetching structure and functional mapping for the human Interferon-gamma receptor 1 (IFNGR1).",
        findings: [
          "Accession: P15260 (INGR1_HUMAN).",
          "Single-pass transmembrane protein acting as receptor for interferon-gamma.",
          "Intracellular domain binds JAK1 tyrosine kinase to initiate STAT1 transcription signaling."
        ],
        mockResponse: `{
  "primaryAccession": "P15260",
  "uniProtkbId": "INGR1_HUMAN",
  "features": [
    { "type": "Transmembrane", "location": { "start": 254, "end": 276 }, "description": "Single-pass helice" }
  ]
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql",
        queryDescription: "Querying drug registry databases for antibiotic therapeutics for Mycobacterium tuberculosis.",
        findings: [
          "Main line therapies block bacterial RNA polymerase (Rifampicin) and cell-wall synthesis (Isoniazid).",
          "Multi-drug resistant (MDR-TB) strains require secondary regimens including Bedaquiline (blocks ATP synthase).",
          "Implicated therapeutic targets include Mtb DnaG primase and cell wall enzymes."
        ],
        mockResponse: `{
  "data": {
    "disease": {
      "name": "tuberculosis",
      "clinicalTrials": [
        { "phase": "Approved", "drug": "Rifampicin", "mechanism": "RNA polymerase inhibitor" },
        { "phase": "Approved", "drug": "Bedaquiline", "mechanism": "M. tuberculosis ATP synthase inhibitor" }
      ]
    }
  }
}`
      }
    ];
  }

  if (id === "ad") {
    return [
      {
        database: "PubMed",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=alzheimer+AND+APOE4+pathology&retmode=json",
        queryDescription: "Querying literature for mechanisms linking the APOE epsilon 4 allele to amyloid accumulation.",
        findings: [
          "APOE4 is the strongest genetic risk factor for late-onset sporadic Alzheimer's disease.",
          "APOE4 impairs amyloid-beta clearance from the brain interstitial fluid compared to APOE3 and APOE2.",
          "APOE4 expression in microglia promotes a pro-inflammatory, neurotoxic activation pattern."
        ],
        mockResponse: `{
  "esearchresult": {
    "count": "2815",
    "retmax": "2",
    "idlist": ["37918314", "37521092"]
  }
}`
      },
      {
        database: "ClinVar",
        endpoint: "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=12518&retmode=json",
        queryDescription: "Querying alleles of the Apolipoprotein E (APOE) gene and their clinical classifications.",
        findings: [
          "APOE epsilon-4 variant (rs429358) classified as Pathogenic Susceptibility modifier for Alzheimer's disease.",
          "Homozygous epsilon-4/4 carriers face a 12-to-15-fold increased lifetime risk of Alzheimer's.",
          "APOE epsilon-2 variant classified as protective against Alzheimer's disease."
        ],
        mockResponse: `{
  "result": {
    "12518": {
      "uid": "12518",
      "title": "APOE rs429358 (C130R)",
      "clinical_significance": {
        "description": "Pathogenic (Alzheimer's Disease susceptibility)",
        "last_evaluated": "2024-09-08"
      }
    }
  }
}`
      },
      {
        database: "UniProt",
        endpoint: "https://rest.uniprot.org/uniprotkb/P02649.json",
        queryDescription: "Fetching structure and lipid-binding domains for Apolipoprotein E.",
        findings: [
          "Accession: P02649 (APOE_HUMAN).",
          "Lipoprotein ligand for LDL receptors; mediates cholesterol transport in the central nervous system.",
          "Epsilon-4 isoform differs by a single Arg-112 replacement of Cys-112, altering salt-bridge folding."
        ],
        mockResponse: `{
  "primaryAccession": "P02649",
  "uniProtkbId": "APOE_HUMAN",
  "features": [
    { "type": "Sequence variant", "location": { "start": 130 }, "description": "Cys -> Arg (APOE4 variant)" }
  ]
}`
      },
      {
        database: "Open Targets",
        endpoint: "https://api.platform.opentargets.org/v4/graphql",
        queryDescription: "Querying clinical drug pipelines for monoclonal antibodies targeting amyloid-beta.",
        findings: [
          "Monoclonal antibodies (Lecanemab, Donanemab) target clearance of amyloid-beta protofibrils and plaques.",
          "Approved by FDA after demonstrating modest slowing (27-35%) of cognitive decline in early-stage trials.",
          "Associated with ARIA (Amyloid-Related Imaging Abnormalities) micro-hemorrhages."
        ],
        mockResponse: `{
  "data": {
    "disease": {
      "name": "alzheimers disease",
      "clinicalTrials": [
        { "phase": "Approved", "drug": "Lecanemab", "target": "Amyloid-beta" },
        { "phase": "Approved", "drug": "Donanemab", "target": "Amyloid-beta" }
      ]
    }
  }
}`
      }
    ];
  }

  if (id === "tbi") {
    return [
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
          "Trauma and cell necrosis trigger enzymatic cleavage and release of GFAP fragments into the bloodstream."
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
          "Targets include NMDA receptor antagonists (GRIN2A/GRIN2B) to mitigate acute glutamate excitotoxicity.",
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
    ];
  }

  // Fallback generator for the other diseases!
  const term = encodeURIComponent(name.toLowerCase());
  return [
    {
      database: "PubMed",
      endpoint: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${term}&retmode=json`,
      queryDescription: `Querying literature database for clinical trials and review articles relating to ${name}.`,
      findings: [
        `Highly cited research papers index ${name} pathology and treatment outcomes.`,
        `Multi-center clinical trials evaluate efficacy of primary interventions for ${name}.`,
        `Systematic reviews summarize the physiological pathways and diagnostic criteria of ${name}.`
      ],
      mockResponse: `{
  "esearchresult": {
    "count": "3420",
    "retmax": "3",
    "idlist": ["38210344", "37990124", "37542109"],
    "translationset": [
      { "from": "${name.toLowerCase()}", "to": "\\"${name.toLowerCase()}\\"[MeSH Terms] OR \\"${name.toLowerCase()}\\"[All Fields]" }
    ]
  }
}`
    },
    {
      database: "ClinVar",
      endpoint: `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&term=${term}&retmode=json`,
      queryDescription: `Retrieving genomic variants and phenotypic associations related to ${name}.`,
      findings: [
        `Annotated variants in susceptibility genes linked to increased risk of ${name}.`,
        `Pathogenic and drug-response alleles cataloged in the ClinVar database.`,
        `Genome-wide association studies map multiple loci contributing to ${name} susceptibility.`
      ],
      mockResponse: `{
  "result": {
    "50294": {
      "uid": "50294",
      "title": "${name} susceptibility variant",
      "clinical_significance": {
        "description": "Pathogenic / Susceptibility",
        "last_evaluated": "2024-11-20"
      }
    }
  }
}`
    },
    {
      database: "UniProt",
      endpoint: `https://rest.uniprot.org/uniprotkb/search?query=${term}&format=json`,
      queryDescription: `Fetching protein structures, active sites, and biological functional ontologies related to ${name}.`,
      findings: [
        `UniProt entries map primary receptor and enzymatic structures implicated in ${name}.`,
        `Intracellular signaling pathways and signaling cascades cataloged.`,
        `Post-translational modifications and protein-protein interactions documented.`
      ],
      mockResponse: `{
  "results": [
    {
      "primaryAccession": "P01106",
      "uniProtkbId": "MYC_HUMAN",
      "proteinDescription": {
        "recommendedName": { "fullName": { "value": "Transcription factor Myc implicated in cell cycle regulation" } }
      }
    }
  ]
}`
    },
    {
      database: "Open Targets",
      endpoint: `https://api.platform.opentargets.org/v4/graphql (Query: TargetAssociation)`,
      queryDescription: `Fetching therapeutic pipelines and target-disease association scores for ${name}.`,
      findings: [
        `Overall association score between key drug targets and ${name} cataloged.`,
        `FDA-approved therapeutics and clinical trial pipelines mapped for disease targets.`,
        `Target tractability (small molecules, antibodies) evaluated for candidate targets.`
      ],
      mockResponse: `{
  "data": {
    "disease": {
      "name": "${name.toLowerCase()}",
      "associatedTargets": [
        { "score": 0.85, "target": { "approvedSymbol": "JAK1" } }
      ]
    }
  }
}`
    }
  ];
}

export function MorbusExplorer() {
  const [selectedId, setSelectedId] = useState(() => {
    if (typeof window === "undefined") {
      return morbusDiseases[0]?.id ?? "ibd";
    }

    const hashId = window.location.hash.replace(/^#/, "");
    return morbusDiseases.some((disease) => disease.id === hashId)
      ? hashId
      : morbusDiseases[0]?.id ?? "ibd";
  });
  const [selectedAxisIndex, setSelectedAxisIndex] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [activeDbTab, setActiveDbTab] = useState<"PubMed" | "ClinVar" | "UniProt" | "Open Targets">("PubMed");

  const filteredDiseases = useMemo(
    () =>
      morbusDiseases.filter((disease) => {
        if (groupFilter && disease.group !== groupFilter) {
          return false;
        }

        return diseaseMatchesQuery(disease, query);
      }),
    [groupFilter, query],
  );

  const activeDisease =
    morbusDiseases.find((disease) => disease.id === selectedId) || morbusDiseases[0];

  const selectDisease = (id: string) => {
    setSelectedId(id);
    setSelectedAxisIndex(null);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  const copyDiseaseLink = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const url = `${window.location.origin}${window.location.pathname}#${selectedId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard may be unavailable; hash URL still works manually.
    }
  };

  const digitalQueries = useMemo(() => getDigitalQueriesForDisease(activeDisease), [activeDisease]);
  const activeQuery = useMemo(() => digitalQueries.find((q) => q.database === activeDbTab) || digitalQueries[0], [digitalQueries, activeDbTab]);

  const dbColors = {
    "PubMed": "text-sky-300 border-sky-400/30 bg-sky-400/5",
    "ClinVar": "text-teal-300 border-teal-400/30 bg-teal-400/5",
    "UniProt": "text-emerald-300 border-emerald-400/30 bg-emerald-400/5",
    "Open Targets": "text-indigo-300 border-indigo-400/30 bg-indigo-400/5"
  };

  const dbTabs: ("PubMed" | "ClinVar" | "UniProt" | "Open Targets")[] = ["PubMed", "ClinVar", "UniProt", "Open Targets"];

  return (
    <div className="flex flex-col gap-8 border border-white/10 bg-white/[0.015] p-6 sm:p-8 rounded-lg">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
            {morbusDiseases.length} exemplar diseases · 9 axes each
          </p>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search diseases or axes…"
            aria-label="Search Morbus diseases"
            className="w-full max-w-sm border border-white/10 bg-black/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-300/40 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGroupFilter(null)}
            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
              groupFilter === null
                ? "bg-emerald-300/15 text-emerald-200"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            All groups
          </button>
          {diseaseGroups.map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setGroupFilter(groupFilter === group ? null : group)}
              className={`cursor-pointer px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                groupFilter === group
                  ? "bg-emerald-300/15 text-emerald-200"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {group.replace(" Diseases", "")}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {filteredDiseases.map((disease) => (
            <button
              key={disease.id}
              type="button"
              onClick={() => selectDisease(disease.id)}
              className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${
                selectedId === disease.id
                  ? "border-b-2 border-emerald-300 text-emerald-100 bg-white/[0.04]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              {disease.name}
            </button>
          ))}
          {filteredDiseases.length === 0 && (
            <p className="text-sm text-slate-500">No diseases match this filter.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              {activeDisease.group}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-slate-100">{activeDisease.name}</h3>
          <button
            type="button"
            onClick={copyDiseaseLink}
            className="mt-2 w-fit cursor-pointer border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:border-emerald-400/35 hover:text-emerald-200"
          >
            Copy share link
          </button>
          <p className="text-base leading-7 text-slate-300">{activeDisease.description}</p>
        </div>

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
                type="button"
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
                <p className="text-sm font-medium text-slate-100">{axis.value}</p>
                {isSelected && (
                  <p className="text-sm leading-6 text-slate-400 border-t border-white/10 pt-2 mt-1">
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
