import type { Metadata } from "next";
import { SiteNav } from "@/components/site-nav";

export const metadata: Metadata = {
  title: "Sapiens Scientia Data Index | Sapiens Scientia",
  description:
    "A working index of public databases, scholarly indexes, archives, platforms, and registries relevant to Sapiens Scientia.",
};

const indexSections = [
  {
    title: "General Knowledge Databases",
    description:
      "Large structured or full-content repositories for encyclopedic, cultural, and web-scale knowledge.",
    items: [
      {
        name: "Wikipedia",
        href: "https://www.wikipedia.org/",
        role: "Full-content encyclopedia",
      },
      {
        name: "Wikidata",
        href: "https://www.wikidata.org/",
        role: "Structured knowledge graph",
      },
      {
        name: "Internet Archive",
        href: "https://archive.org/",
        role: "Full-content archive",
      },
      {
        name: "Common Crawl",
        href: "https://commoncrawl.org/",
        role: "Open web crawl corpus",
      },
      {
        name: "Library of Congress",
        href: "https://www.loc.gov/",
        role: "Library and cultural archive",
      },
    ],
  },
  {
    title: "Scholarly Index Databases",
    description:
      "Citation indexes, metadata graphs, search engines, and research intelligence databases for scholarly literature.",
    items: [
      {
        name: "Google Scholar",
        href: "https://scholar.google.com/",
        role: "Scholarly search engine",
      },
      {
        name: "OpenAlex",
        href: "https://openalex.org/",
        role: "Open scholarly metadata graph",
      },
      {
        name: "Semantic Scholar",
        href: "https://www.semanticscholar.org/",
        role: "AI-assisted scholarly search",
      },
      {
        name: "Crossref",
        href: "https://www.crossref.org/",
        role: "DOI metadata infrastructure",
      },
      {
        name: "Scopus",
        href: "https://www.scopus.com/",
        role: "Subscription citation index",
      },
      {
        name: "Web of Science",
        href: "https://www.webofscience.com/",
        role: "Subscription citation index",
      },
      {
        name: "Dimensions",
        href: "https://www.dimensions.ai/",
        role: "Research intelligence graph",
      },
      {
        name: "The Lens",
        href: "https://www.lens.org/",
        role: "Scholarly and patent database",
      },
    ],
  },
  {
    title: "Life Sciences And Medicine",
    description:
      "Biomedical literature, full text, trials, sequences, proteins, genomes, and structures.",
    items: [
      {
        name: "PubMed",
        href: "https://pubmed.ncbi.nlm.nih.gov/",
        role: "Biomedical literature index",
      },
      {
        name: "PubMed Central",
        href: "https://pmc.ncbi.nlm.nih.gov/",
        role: "Full-text biomedical repository",
      },
      {
        name: "Europe PMC",
        href: "https://europepmc.org/",
        role: "Life-science literature platform",
      },
      {
        name: "ClinicalTrials.gov",
        href: "https://clinicaltrials.gov/",
        role: "Clinical study registry",
      },
      {
        name: "GenBank",
        href: "https://www.ncbi.nlm.nih.gov/genbank/",
        role: "Nucleotide sequence database",
      },
      {
        name: "UniProt",
        href: "https://www.uniprot.org/",
        role: "Protein sequence and function",
      },
      {
        name: "RCSB Protein Data Bank",
        href: "https://www.rcsb.org/",
        role: "3D biomolecular structures",
      },
      {
        name: "Ensembl",
        href: "https://www.ensembl.org/",
        role: "Genome annotation database",
      },
    ],
  },
  {
    title: "Physical Sciences And Preprints",
    description:
      "Field-specific systems for physics, astronomy, mathematics, and fast-moving research communities.",
    items: [
      {
        name: "arXiv",
        href: "https://arxiv.org/",
        role: "Full-content preprint repository",
      },
      {
        name: "INSPIRE HEP",
        href: "https://inspirehep.net/",
        role: "High-energy physics index",
      },
      {
        name: "NASA ADS",
        href: "https://ui.adsabs.harvard.edu/",
        role: "Astronomy and physics index",
      },
    ],
  },
  {
    title: "Books, Libraries, And Archives",
    description:
      "Catalogs and repositories for books, journals, dissertations, historical collections, and cultural memory.",
    items: [
      {
        name: "WorldCat",
        href: "https://www.worldcat.org/",
        role: "Global library catalog",
      },
      {
        name: "Google Books",
        href: "https://books.google.com/",
        role: "Book search and scanned texts",
      },
      {
        name: "HathiTrust",
        href: "https://www.hathitrust.org/",
        role: "Digitized library repository",
      },
      {
        name: "JSTOR",
        href: "https://www.jstor.org/",
        role: "Scholarly archive",
      },
      {
        name: "ProQuest",
        href: "https://www.proquest.com/",
        role: "Academic and historical databases",
      },
      {
        name: "EBSCOhost",
        href: "https://www.ebsco.com/products/ebscohost-platform",
        role: "Research database platform",
      },
    ],
  },
  {
    title: "Law, Government, And Patent Databases",
    description:
      "Institutional knowledge systems for laws, public records, government documents, and technical invention.",
    items: [
      {
        name: "LexisNexis",
        href: "https://www.lexisnexis.com/",
        role: "Legal, news, and public records",
      },
      {
        name: "Westlaw",
        href: "https://legal.thomsonreuters.com/en/products/westlaw",
        role: "Legal research database",
      },
      {
        name: "GovInfo",
        href: "https://www.govinfo.gov/",
        role: "U.S. government publications",
      },
      {
        name: "EUR-Lex",
        href: "https://eur-lex.europa.eu/",
        role: "European Union law",
      },
      {
        name: "CourtListener",
        href: "https://www.courtlistener.com/",
        role: "Open legal opinions and dockets",
      },
      {
        name: "Espacenet",
        href: "https://worldwide.espacenet.com/",
        role: "Patent document database",
      },
      {
        name: "Google Patents",
        href: "https://patents.google.com/",
        role: "Patent search engine",
      },
      {
        name: "Derwent Innovation",
        href: "https://clarivate.com/products/derwent/",
        role: "Curated patent intelligence",
      },
    ],
  },
  {
    title: "Public Data Databases",
    description:
      "Open datasets, economic time series, global indicators, and news event databases.",
    items: [
      {
        name: "World Bank Data",
        href: "https://data.worldbank.org/",
        role: "Global development indicators",
      },
      {
        name: "OECD Data",
        href: "https://data.oecd.org/",
        role: "Economic and social indicators",
      },
      {
        name: "FRED",
        href: "https://fred.stlouisfed.org/",
        role: "Economic time series",
      },
      {
        name: "Data.gov",
        href: "https://data.gov/",
        role: "U.S. open data portal",
      },
      {
        name: "Kaggle Datasets",
        href: "https://www.kaggle.com/datasets",
        role: "Public dataset platform",
      },
      {
        name: "GDELT",
        href: "https://www.gdeltproject.org/",
        role: "Global news event database",
      },
    ],
  },
  {
    title: "Knowledge Platforms And Discourse Archives",
    description:
      "Large public platforms whose archives function as informal databases of video, discussion, technical problem-solving, and real-time discourse.",
    items: [
      {
        name: "YouTube",
        href: "https://www.youtube.com/",
        role: "Video knowledge archive",
      },
      {
        name: "X",
        href: "https://x.com/",
        role: "Real-time public discourse",
      },
      {
        name: "Reddit",
        href: "https://www.reddit.com/",
        role: "Community discussion archive",
      },
      {
        name: "Stack Exchange",
        href: "https://stackexchange.com/",
        role: "Expert Q&A network",
      },
    ],
  },
  {
    title: "Repository Registries",
    description:
      "Meta-catalogs that already track data repositories, open-access repositories, and scientific standards.",
    items: [
      {
        name: "re3data",
        href: "https://www.re3data.org/",
        role: "Research data repository registry",
      },
      {
        name: "OpenDOAR",
        href: "https://opendoar.ac.uk/",
        role: "Open-access repository directory",
      },
      {
        name: "FAIRsharing",
        href: "https://fairsharing.org/",
        role: "Scientific database and standards registry",
      },
      {
        name: "DataCite Repository Finder",
        href: "https://support.datacite.org/docs/repository-finder",
        role: "Repository discovery tool",
      },
    ],
  },
];

const totalEntries = indexSections.reduce(
  (sum, section) => sum + section.items.length,
  0,
);

export default function SapiensScientiaDataIndexPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white sm:px-10">
      <SiteNav
        links={[
          { href: "/", label: "Home" },
          { href: "/projects", label: "Projects" },
          { href: "/platforms", label: "Platforms" },
        ]}
      />

      <section className="mx-auto flex max-w-6xl flex-col gap-14">
        <header className="max-w-4xl">
          <p className="mb-3 text-xl font-medium uppercase tracking-[0.24em] text-blue-400">
            Sapiens Scientia
          </p>
          <h1 className="max-w-4xl text-5xl font-semibold tracking-normal sm:text-7xl">
            Sapiens Scientia Data Index
          </h1>
          <p className="mt-6 max-w-3xl text-2xl leading-tight text-slate-300 sm:text-3xl">
            A structured index of major databases behind human knowledge:
            repositories, scholarly indexes, metadata graphs, library catalogs,
            data portals, registries, and scientific archives.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 border-y border-white/15 py-5 text-sm uppercase tracking-[0.2em] text-slate-400">
            <span>{totalEntries} sources</span>
            <span>{indexSections.length} categories</span>
            <span>Database subset of the Digital Earth Catalog</span>
          </div>
        </header>

        <div className="grid gap-12">
          {indexSections.map((section) => (
            <section
              key={section.title}
              className="grid gap-6 border-t border-white/15 pt-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]"
            >
              <div>
                <h2 className="text-3xl font-semibold tracking-normal text-white">
                  {section.title}
                </h2>
                <p className="mt-3 max-w-xl text-lg leading-snug text-slate-400">
                  {section.description}
                </p>
              </div>

              <div className="divide-y divide-white/10 border-y border-white/10">
                {section.items.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="grid gap-2 py-4 text-slate-100 transition-colors hover:text-blue-300 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] sm:items-center"
                  >
                    <span className="text-2xl font-medium leading-none">
                      {item.name}
                    </span>
                    <span className="text-lg leading-tight text-slate-400">
                      {item.role}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
