// Sapiens Scientia Soma — the human body module inside Salus.
//
// Soma is an independent model of human biology. Where Morbus organizes disease,
// Soma organizes the healthy body: its structure (anatomy), its function
// (physiology), and its tissue-level fabric (histology). The native frame is the
// organ system, examined through three disciplinary lenses at once, plus the
// nested levels of structural organization that connect a molecule to the whole
// organism. Soma links out to Morbus where a system's failure modes live, but it
// does not depend on Morbus to stand on its own.

export type SomaLensId = "anatomy" | "physiology" | "histology";

export type SomaLens = {
  id: SomaLensId;
  name: string;
  latin: string;
  tagline: string;
  description: string;
};

export const somaLenses: SomaLens[] = [
  {
    id: "anatomy",
    name: "Anatomy",
    latin: "structura",
    tagline: "What the body is made of and where it sits",
    description:
      "The study of bodily structure and the spatial relationships between parts — from gross organs visible to the eye down to the regional architecture that surgery and imaging navigate.",
  },
  {
    id: "physiology",
    name: "Physiology",
    latin: "functio",
    tagline: "How living structures work and regulate themselves",
    description:
      "The study of function: the mechanisms, flows, and feedback loops by which organs and systems maintain homeostasis and respond to demand across the lifespan.",
  },
  {
    id: "histology",
    name: "Histology",
    latin: "textus",
    tagline: "The microscopic fabric of organs",
    description:
      "The study of tissues — the cellular and extracellular fabric, examined under the microscope, from which every organ is assembled and through which function and pathology are read.",
  },
];

// The nested levels of structural organization. This is Soma's spine and the
// hook into the site-wide ladder of scale.
export type SomaLevel = {
  level: string;
  scale: string;
  detail: string;
};

export const somaLevels: SomaLevel[] = [
  { level: "Chemical", scale: "atoms · molecules", detail: "Atoms bond into the biomolecules — water, ions, proteins, lipids, nucleic acids — that make life chemically possible." },
  { level: "Cellular", scale: "~10 µm", detail: "The cell is the smallest living unit; ~200 specialized human cell types arise from one genome." },
  { level: "Tissue", scale: "epithelial · connective · muscle · nervous", detail: "Groups of like cells and their matrix cooperate as one of the four primary tissues." },
  { level: "Organ", scale: "heart · kidney · skin", detail: "Two or more tissue types combine into a discrete structure with a defined function." },
  { level: "Organ system", scale: "11 systems", detail: "Organs working toward a shared purpose — circulation, respiration, cognition." },
  { level: "Organism", scale: "~37 trillion cells", detail: "All systems integrated into a single self-regulating human being." },
];

// The four primary tissue types — the foundation of histology.
export type SomaTissue = {
  id: string;
  name: string;
  role: string;
  examples: string[];
  marker: string;
};

export const somaTissues: SomaTissue[] = [
  {
    id: "epithelial",
    name: "Epithelial",
    role: "Covers surfaces, lines cavities, forms glands; controls what crosses a boundary.",
    examples: ["epidermis", "gut mucosa", "alveolar lining", "kidney tubules"],
    marker: "Polarized cells on a basement membrane, little extracellular matrix.",
  },
  {
    id: "connective",
    name: "Connective",
    role: "Binds, supports, and transports; defined by abundant extracellular matrix.",
    examples: ["bone", "cartilage", "blood", "adipose", "tendon"],
    marker: "Sparse cells scattered in matrix of fibers and ground substance.",
  },
  {
    id: "muscle",
    name: "Muscle",
    role: "Generates force and movement through actin–myosin contraction.",
    examples: ["skeletal muscle", "cardiac muscle", "smooth muscle"],
    marker: "Elongated contractile cells rich in myofilaments and mitochondria.",
  },
  {
    id: "nervous",
    name: "Nervous",
    role: "Senses, integrates, and transmits electrochemical signals.",
    examples: ["neurons", "astrocytes", "oligodendrocytes", "microglia"],
    marker: "Excitable neurons supported by glia; dense synaptic networks.",
  },
];

export type SomaSystem = {
  id: string;
  name: string;
  latin: string;
  summary: string;
  // Three lenses on the same system.
  anatomy: { summary: string; structures: string[] };
  physiology: { summary: string; processes: string[] };
  histology: { summary: string; tissues: string[] };
  // Cross-links into Morbus exemplar diseases (by morbus id).
  morbusLinks: string[];
};

export const somaSystems: SomaSystem[] = [
  {
    id: "nervous",
    name: "Nervous System",
    latin: "Systema nervosum",
    summary:
      "The body's high-speed control and communication network — sensing the world, integrating information, and directing response.",
    anatomy: {
      summary: "Central nervous system (brain and spinal cord) plus the peripheral nerves and ganglia that reach every tissue.",
      structures: ["cerebral cortex", "cerebellum", "brainstem", "spinal cord", "peripheral nerves", "autonomic ganglia"],
    },
    physiology: {
      summary: "Encodes information as graded and action potentials, transmits it across chemical synapses, and runs reflex, autonomic, and cognitive control loops.",
      processes: ["action potential conduction", "synaptic transmission", "sensory transduction", "autonomic regulation", "synaptic plasticity"],
    },
    histology: {
      summary: "Excitable neurons embedded in a supportive glial matrix; grey matter holds cell bodies, white matter holds myelinated axons.",
      tissues: ["neurons", "astrocytes", "oligodendrocytes", "microglia", "myelinated tracts"],
    },
    morbusLinks: ["ad", "tbi", "mdd", "ptsd"],
  },
  {
    id: "cardiovascular",
    name: "Cardiovascular System",
    latin: "Systema cardiovasculare",
    summary:
      "A closed pump-and-pipe network that moves blood, delivering oxygen and nutrients and carrying away waste.",
    anatomy: {
      summary: "A four-chambered heart driving blood through arteries, capillaries, and veins across pulmonary and systemic circuits.",
      structures: ["heart (4 chambers)", "aorta", "coronary arteries", "capillary beds", "veins", "valves"],
    },
    physiology: {
      summary: "Rhythmic myocardial contraction generates pressure; cardiac output and vascular tone are tuned to perfusion demand beat to beat.",
      processes: ["cardiac cycle", "blood pressure regulation", "capillary exchange", "baroreflex", "tissue perfusion matching"],
    },
    histology: {
      summary: "Striated, branching cardiac muscle joined by intercalated discs; vessels lined by endothelium over smooth muscle and elastic layers.",
      tissues: ["cardiac muscle", "endothelium", "vascular smooth muscle", "elastic connective tissue"],
    },
    morbusLinks: ["hf", "scd"],
  },
  {
    id: "respiratory",
    name: "Respiratory System",
    latin: "Systema respiratorium",
    summary:
      "The gas-exchange surface where oxygen enters the blood and carbon dioxide leaves it.",
    anatomy: {
      summary: "A branching airway tree from nose and trachea to bronchi and the alveoli, housed in the pleural cavity and driven by the diaphragm.",
      structures: ["nasal cavity", "trachea", "bronchi", "bronchioles", "alveoli", "diaphragm", "pleura"],
    },
    physiology: {
      summary: "Pressure gradients ventilate the lungs; gases diffuse across the alveolar–capillary membrane and chemoreceptors tune breathing rate.",
      processes: ["ventilation mechanics", "alveolar gas diffusion", "oxygen transport", "CO₂ / pH buffering", "chemoreceptor control"],
    },
    histology: {
      summary: "Ciliated pseudostratified epithelium lines the airways; alveoli use a thin squamous wall plus surfactant-secreting type II cells.",
      tissues: ["respiratory epithelium", "type I & II pneumocytes", "airway smooth muscle", "elastic tissue"],
    },
    morbusLinks: ["asthma", "covid19", "lung-cancer", "tb"],
  },
  {
    id: "digestive",
    name: "Digestive System",
    latin: "Systema digestorium",
    summary:
      "A muscular tube with accessory glands that breaks food into absorbable molecules and excretes the residue.",
    anatomy: {
      summary: "The alimentary canal from mouth to anus, with liver, pancreas, and gallbladder feeding in digestive secretions.",
      structures: ["esophagus", "stomach", "small intestine", "colon", "liver", "pancreas", "gallbladder"],
    },
    physiology: {
      summary: "Coordinated motility, enzymatic digestion, and selective absorption move nutrients into blood while the microbiome ferments residues.",
      processes: ["peristalsis", "enzymatic digestion", "nutrient absorption", "bile & acid secretion", "microbiome fermentation"],
    },
    histology: {
      summary: "A four-layered wall (mucosa, submucosa, muscularis, serosa) with absorptive villi and a barrier epithelium over gut-associated lymphoid tissue.",
      tissues: ["columnar absorptive epithelium", "smooth muscle", "submucosal glands", "gut-associated lymphoid tissue"],
    },
    morbusLinks: ["ibd"],
  },
  {
    id: "endocrine",
    name: "Endocrine System",
    latin: "Systema endocrinum",
    summary:
      "A network of glands that releases hormones into the blood to regulate metabolism, growth, and homeostasis on slower timescales.",
    anatomy: {
      summary: "Ductless glands distributed through the body, coordinated by the hypothalamic–pituitary axis.",
      structures: ["hypothalamus", "pituitary", "thyroid", "adrenal glands", "pancreatic islets", "gonads"],
    },
    physiology: {
      summary: "Hormones travel in blood to distant receptors, with negative-feedback loops holding metabolic and reproductive set points.",
      processes: ["hormone secretion", "negative feedback control", "glucose homeostasis", "metabolic rate setting", "stress response"],
    },
    histology: {
      summary: "Secretory epithelial cells arranged in cords or follicles next to rich fenestrated capillaries for rapid hormone release.",
      tissues: ["glandular epithelium", "endocrine islets", "fenestrated capillaries", "colloid follicles"],
    },
    morbusLinks: ["t2d"],
  },
  {
    id: "immune",
    name: "Immune & Lymphatic System",
    latin: "Systema immunitatis et lymphaticum",
    summary:
      "A distributed defense and surveillance network that distinguishes self from non-self and drains tissue fluid.",
    anatomy: {
      summary: "Lymphoid organs and vessels seeded throughout the body, from bone marrow and thymus to nodes, spleen, and mucosal patches.",
      structures: ["bone marrow", "thymus", "lymph nodes", "spleen", "lymphatic vessels", "mucosal lymphoid tissue"],
    },
    physiology: {
      summary: "Innate cells respond first; adaptive lymphocytes generate antigen-specific memory while lymph returns fluid and antigens to circulation.",
      processes: ["innate inflammation", "antigen presentation", "clonal selection", "immunological memory", "lymph drainage"],
    },
    histology: {
      summary: "Reticular connective tissue scaffolds packed with lymphocytes, organized into follicles, with endothelium-lined lymphatic channels.",
      tissues: ["lymphocytes", "reticular connective tissue", "germinal centers", "lymphatic endothelium"],
    },
    morbusLinks: ["hiv", "ra", "malaria"],
  },
  {
    id: "musculoskeletal",
    name: "Musculoskeletal System",
    latin: "Systema musculoskeletale",
    summary:
      "The body's framework and motor — bones, joints, and skeletal muscles that give form, protect organs, and produce movement.",
    anatomy: {
      summary: "The bony skeleton articulated at joints and moved by skeletal muscles via tendons, stabilized by ligaments.",
      structures: ["axial skeleton", "appendicular skeleton", "synovial joints", "skeletal muscles", "tendons", "ligaments"],
    },
    physiology: {
      summary: "Motor neurons trigger actin–myosin contraction for force and posture; bone continuously remodels and stores calcium.",
      processes: ["excitation–contraction coupling", "lever mechanics", "bone remodeling", "calcium storage", "proprioception"],
    },
    histology: {
      summary: "Striated multinucleate skeletal muscle fibers paired with mineralized bone matrix laid down in osteons by osteoblasts.",
      tissues: ["skeletal muscle", "compact & spongy bone", "hyaline cartilage", "dense connective tissue"],
    },
    morbusLinks: ["ra"],
  },
  {
    id: "integumentary",
    name: "Integumentary System",
    latin: "Systema integumentum",
    summary:
      "The skin and its appendages — the body's largest organ and its first barrier against the outside world.",
    anatomy: {
      summary: "Layered skin (epidermis, dermis, hypodermis) with hair, nails, and sweat and sebaceous glands.",
      structures: ["epidermis", "dermis", "hypodermis", "hair follicles", "sweat glands", "sebaceous glands", "nails"],
    },
    physiology: {
      summary: "Forms a waterproof barrier, regulates temperature, senses touch, synthesizes vitamin D, and defends against pathogens.",
      processes: ["barrier protection", "thermoregulation", "sensory reception", "vitamin D synthesis", "wound healing"],
    },
    histology: {
      summary: "Keratinized stratified squamous epidermis over a collagen-rich dermis, with melanocytes and resident immune cells.",
      tissues: ["keratinized epithelium", "melanocytes", "dense irregular connective tissue", "adipose (hypodermis)"],
    },
    morbusLinks: [],
  },
  {
    id: "urinary",
    name: "Urinary System",
    latin: "Systema urinarium",
    summary:
      "The body's filtration and fluid-balance system, clearing waste and regulating blood volume, pressure, and electrolytes.",
    anatomy: {
      summary: "Two kidneys feeding ureters, bladder, and urethra; each kidney holds about a million filtering nephrons.",
      structures: ["kidneys", "nephrons", "renal cortex & medulla", "ureters", "bladder", "urethra"],
    },
    physiology: {
      summary: "Glomerular filtration, tubular reabsorption, and secretion produce urine while controlling pH, osmolarity, and blood pressure.",
      processes: ["glomerular filtration", "tubular reabsorption", "acid–base balance", "blood pressure (RAAS)", "erythropoietin release"],
    },
    histology: {
      summary: "Specialized tubular epithelia along the nephron with a podocyte-lined filtration barrier in the glomerulus.",
      tissues: ["tubular epithelium", "podocytes", "transitional epithelium (urothelium)", "vascular endothelium"],
    },
    morbusLinks: [],
  },
  {
    id: "reproductive",
    name: "Reproductive System",
    latin: "Systema genitale",
    summary:
      "The system that produces gametes and sex hormones and, in the female, supports gestation — the body's continuity across generations.",
    anatomy: {
      summary: "Gonads and accessory ducts and glands, differing by sex, that produce and deliver gametes.",
      structures: ["ovaries / testes", "uterus", "fallopian tubes", "vas deferens", "prostate", "external genitalia"],
    },
    physiology: {
      summary: "Hypothalamic–pituitary–gonadal hormones drive gametogenesis and cyclical fertility; fertilization initiates development.",
      processes: ["gametogenesis", "menstrual / hormonal cycling", "fertilization", "pregnancy support", "sex hormone signaling"],
    },
    histology: {
      summary: "Germinal epithelium producing gametes alongside hormone-secreting cells, with smooth-muscle-walled tracts.",
      tissues: ["germinal epithelium", "Leydig / theca & granulosa cells", "smooth muscle", "glandular epithelium"],
    },
    morbusLinks: [],
  },
];

export const somaSystemCount = somaSystems.length;
export const somaTissueCount = somaTissues.length;

export function somaSystemsWithMorbusLinks(): SomaSystem[] {
  return somaSystems.filter((system) => system.morbusLinks.length > 0);
}
