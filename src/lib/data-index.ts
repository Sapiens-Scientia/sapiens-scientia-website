export type DataIndexEntry = {
  name: string;
  shortName?: string;
  href: string;
  role: string;
};

export type DataIndexCategory = {
  name: string;
  title: string;
  description: string;
  color: string;
  entries: DataIndexEntry[];
};

export const dataIndexCategories: DataIndexCategory[] = [
  {
    name: "General Knowledge",
    title: "General Knowledge Databases",
    description:
      "Large structured or full-content repositories for encyclopedic, cultural, and web-scale knowledge.",
    color: "#2dd4bf",
    entries: [
      { name: "Wikipedia", href: "https://www.wikipedia.org/", role: "Full-content encyclopedia" },
      { name: "Wikidata", href: "https://www.wikidata.org/", role: "Structured knowledge graph" },
      { name: "Internet Archive", href: "https://archive.org/", role: "Full-content archive" },
      { name: "Common Crawl", href: "https://commoncrawl.org/", role: "Open web crawl corpus" },
      { name: "Library of Congress", href: "https://www.loc.gov/", role: "Library and cultural archive" },
    ],
  },
  {
    name: "Scholarly Indexes",
    title: "Scholarly Index Databases",
    description:
      "Citation indexes, metadata graphs, search engines, and research intelligence databases for scholarly literature.",
    color: "#7dd3fc",
    entries: [
      { name: "Google Scholar", href: "https://scholar.google.com/", role: "Scholarly search engine" },
      { name: "OpenAlex", href: "https://openalex.org/", role: "Open scholarly metadata graph" },
      { name: "Semantic Scholar", href: "https://www.semanticscholar.org/", role: "AI-assisted scholarly search" },
      { name: "Crossref", href: "https://www.crossref.org/", role: "DOI metadata infrastructure" },
      { name: "Scopus", href: "https://www.scopus.com/", role: "Subscription citation index" },
      { name: "Web of Science", href: "https://www.webofscience.com/", role: "Subscription citation index" },
      { name: "Dimensions", href: "https://www.dimensions.ai/", role: "Research intelligence graph" },
      { name: "The Lens", href: "https://www.lens.org/", role: "Scholarly and patent database" },
    ],
  },
  {
    name: "Life Sciences",
    title: "Life Sciences And Medicine",
    description:
      "Biomedical literature, full text, trials, sequences, proteins, genomes, and structures.",
    color: "#34d399",
    entries: [
      { name: "PubMed", href: "https://pubmed.ncbi.nlm.nih.gov/", role: "Biomedical literature index" },
      { name: "PubMed Central", href: "https://pmc.ncbi.nlm.nih.gov/", role: "Full-text biomedical repository" },
      { name: "Europe PMC", href: "https://europepmc.org/", role: "Life-science literature platform" },
      { name: "ClinicalTrials.gov", href: "https://clinicaltrials.gov/", role: "Clinical study registry" },
      { name: "GenBank", href: "https://www.ncbi.nlm.nih.gov/genbank/", role: "Nucleotide sequence database" },
      { name: "UniProt", href: "https://www.uniprot.org/", role: "Protein sequence and function" },
      {
        name: "RCSB Protein Data Bank",
        shortName: "RCSB PDB",
        href: "https://www.rcsb.org/",
        role: "3D biomolecular structures",
      },
      { name: "Ensembl", href: "https://www.ensembl.org/", role: "Genome annotation database" },
    ],
  },
  {
    name: "Physical Sciences",
    title: "Physical Sciences And Preprints",
    description:
      "Field-specific systems for physics, astronomy, mathematics, and fast-moving research communities.",
    color: "#a78bfa",
    entries: [
      { name: "arXiv", href: "https://arxiv.org/", role: "Full-content preprint repository" },
      { name: "INSPIRE HEP", href: "https://inspirehep.net/", role: "High-energy physics index" },
      { name: "NASA ADS", href: "https://ui.adsabs.harvard.edu/", role: "Astronomy and physics index" },
    ],
  },
  {
    name: "Books & Archives",
    title: "Books, Libraries, And Archives",
    description:
      "Catalogs and repositories for books, journals, dissertations, historical collections, and cultural memory.",
    color: "#fbbf24",
    entries: [
      { name: "WorldCat", href: "https://www.worldcat.org/", role: "Global library catalog" },
      { name: "Google Books", href: "https://books.google.com/", role: "Book search and scanned texts" },
      { name: "HathiTrust", href: "https://www.hathitrust.org/", role: "Digitized library repository" },
      { name: "JSTOR", href: "https://www.jstor.org/", role: "Scholarly archive" },
      { name: "ProQuest", href: "https://www.proquest.com/", role: "Academic and historical databases" },
      { name: "EBSCOhost", href: "https://www.ebsco.com/products/ebscohost-platform", role: "Research database platform" },
    ],
  },
  {
    name: "Law & Patents",
    title: "Law, Government, And Patent Databases",
    description:
      "Institutional knowledge systems for laws, public records, government documents, and technical invention.",
    color: "#fb7185",
    entries: [
      { name: "LexisNexis", href: "https://www.lexisnexis.com/", role: "Legal, news, and public records" },
      { name: "Westlaw", href: "https://legal.thomsonreuters.com/en/products/westlaw", role: "Legal research database" },
      { name: "GovInfo", href: "https://www.govinfo.gov/", role: "U.S. government publications" },
      { name: "EUR-Lex", href: "https://eur-lex.europa.eu/", role: "European Union law" },
      { name: "CourtListener", href: "https://www.courtlistener.com/", role: "Open legal opinions and dockets" },
      { name: "Espacenet", href: "https://worldwide.espacenet.com/", role: "Patent document database" },
      { name: "Google Patents", href: "https://patents.google.com/", role: "Patent search engine" },
      { name: "Derwent Innovation", href: "https://clarivate.com/products/derwent/", role: "Curated patent intelligence" },
    ],
  },
  {
    name: "Public Data",
    title: "Public Data Databases",
    description:
      "Open datasets, economic time series, global indicators, and news event databases.",
    color: "#22d3ee",
    entries: [
      { name: "World Bank Data", href: "https://data.worldbank.org/", role: "Global development indicators" },
      { name: "OECD Data", href: "https://data.oecd.org/", role: "Economic and social indicators" },
      { name: "FRED", href: "https://fred.stlouisfed.org/", role: "Economic time series" },
      { name: "Data.gov", href: "https://data.gov/", role: "U.S. open data portal" },
      { name: "Kaggle Datasets", href: "https://www.kaggle.com/datasets", role: "Public dataset platform" },
      { name: "GDELT", href: "https://www.gdeltproject.org/", role: "Global news event database" },
    ],
  },
  {
    name: "Platforms",
    title: "Knowledge Platforms And Discourse Archives",
    description:
      "Large public platforms whose archives function as informal databases of video, discussion, technical problem-solving, and real-time discourse.",
    color: "#f472b6",
    entries: [
      { name: "YouTube", href: "https://www.youtube.com/", role: "Video knowledge archive" },
      { name: "X", href: "https://x.com/", role: "Real-time public discourse" },
      { name: "Reddit", href: "https://www.reddit.com/", role: "Community discussion archive" },
      { name: "Stack Exchange", href: "https://stackexchange.com/", role: "Expert Q&A network" },
    ],
  },
  {
    name: "Registries",
    title: "Repository Registries",
    description:
      "Meta-catalogs that already track data repositories, open-access repositories, and scientific standards.",
    color: "#c4b5fd",
    entries: [
      { name: "re3data", href: "https://www.re3data.org/", role: "Research data repository registry" },
      { name: "OpenDOAR", href: "https://opendoar.ac.uk/", role: "Open-access repository directory" },
      { name: "FAIRsharing", href: "https://fairsharing.org/", role: "Scientific database and standards registry" },
      {
        name: "DataCite Repository Finder",
        shortName: "DataCite",
        href: "https://support.datacite.org/docs/repository-finder",
        role: "Repository discovery tool",
      },
    ],
  },
];

export const dataIndexEntries = dataIndexCategories.flatMap((category) =>
  category.entries.map((entry, entryIndex) => ({
    ...entry,
    category: category.name,
    color: category.color,
    entryIndex,
    entryTotal: category.entries.length,
  })),
);

export const dataIndexTotalEntries = dataIndexEntries.length;
