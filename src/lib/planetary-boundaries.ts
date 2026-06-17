export type PlanetaryBoundary = {
  name: string;
  control: string;
  status: "breached" | "safe";
  safeLimit: string;
  currentState: string;
  radialValue: number;
  description: string;
  consequences: string;
};

export type PlanetarySignal = {
  value: string;
  label: string;
  detail: string;
  source: string;
};

export const planetaryBoundaries: PlanetaryBoundary[] = [
  {
    name: "Climate change",
    control: "Atmospheric CO₂ concentration & Radiative forcing",
    status: "breached",
    safeLimit: "350 ppm / 1.0 W/m²",
    currentState: "430 ppm / 2.91 W/m²",
    radialValue: 0.82,
    description: "Elevated carbon dioxide and other greenhouse gases trap excess heat in the Earth system, warming the planet and disrupting global meteorological equilibria.",
    consequences: "Accelerates glacier and ice sheet melt, raises sea levels, intensifies droughts, wildfires, and floods, and triggers climate tipping points.",
  },
  {
    name: "Biosphere integrity",
    control: "Extinction rate (E/MSY) & Biodiversity Intactness Index",
    status: "breached",
    safeLimit: "< 10 E/MSY / > 90% BII",
    currentState: "> 100 E/MSY / < 84% BII",
    radialValue: 0.98,
    description: "The accelerating loss of species diversity and functional traits degrades ecosystem networks and reduces biosphere stability.",
    consequences: "Erodes crop pollination, soils, water filtration, pest control, and food security, making ecosystems vulnerable to collapse.",
  },
  {
    name: "Land-system change",
    control: "Forest cover remaining (% of original)",
    status: "breached",
    safeLimit: "75% global / 85% tropical",
    currentState: "~60% global / ~50% tropical",
    radialValue: 0.78,
    description: "Clearing forests and woodlands for agriculture, pastures, and cities reduces the planet's primary organic carbon storage systems.",
    consequences: "Reduces land-based carbon sinks, degrades regional hydrology, accelerates habitat fragmentation, and drives local temperature spikes.",
  },
  {
    name: "Freshwater change",
    control: "Streamflow deviation (blue) & Soil moisture deviation (green)",
    status: "breached",
    safeLimit: "< 10.2% global deviation",
    currentState: "> 18.2% global deviation",
    radialValue: 0.74,
    description: "Human extraction, dams, deforestation, and climate warming alter river flows (blue water) and soil moisture distribution (green water).",
    consequences: "Exacerbates agricultural crop failures, river desiccation, wetlands collapse, and drinking water scarcity.",
  },
  {
    name: "Biogeochemical flows",
    control: "Industrial Nitrogen & Phosphorus inputs (Tg/yr)",
    status: "breached",
    safeLimit: "62 Tg N / 11 Tg P",
    currentState: "150 Tg N / 22 Tg P",
    radialValue: 0.92,
    description: "Excessive application of chemical fertilizers overloading natural nitrogen and phosphorus cycles, leading to environmental saturation.",
    consequences: "Fertilizer runoff triggers massive aquatic eutrophication, generating toxic algae blooms and hypoxic 'dead zones' in oceans and lakes.",
  },
  {
    name: "Novel entities",
    control: "Release of un-assessed synthetic substances & pollutants",
    status: "breached",
    safeLimit: "Zero un-screened releases",
    currentState: "Hundreds of millions of tonnes of plastics/PFAS annually",
    radialValue: 0.95,
    description: "The release of synthetic chemicals, plastics, heavy metals, and nuclear materials that can accumulate and persist in global food webs.",
    consequences: "Causes endocrine disruption in wildlife, soil contamination, bioaccumulation of forever chemicals (PFAS), and marine microplastic loading.",
  },
  {
    name: "Ocean acidification",
    control: "Aragonite saturation state of surface seawater (Ω)",
    status: "breached",
    safeLimit: "2.90 Ω",
    currentState: "2.80 Ω (breached in 2025)",
    radialValue: 0.68,
    description: "Oceans absorb roughly 30% of human carbon emissions, driving chemical reactions that lower seawater pH and carbonate availability.",
    consequences: "Hinders calcification in shell-forming marine life (corals, shellfish, plankton), threatening the marine food web from its base.",
  },
  {
    name: "Atmospheric aerosols",
    control: "Global & regional Aerosol Optical Depth (AOD) deviations",
    status: "safe",
    safeLimit: "AOD deviation < 0.25",
    currentState: "Global average safe; regional breaches (South Asia)",
    radialValue: 0.45,
    description: "Particulate air pollution (soot, dust, sulfates) reflecting solar energy and altering regional monsoon patterns and precipitation cycles.",
    consequences: "Exacerbates cardiovascular disease, damages crops, and shifts regional monsoons, though remains within safe global thresholds.",
  },
  {
    name: "Ozone depletion",
    control: "Stratospheric Ozone concentration (Dobson Units, DU)",
    status: "safe",
    safeLimit: "< 5% reduction from pre-industrial (290 DU)",
    currentState: "~2% global reduction (steady recovery)",
    radialValue: 0.35,
    description: "The thinning of the stratospheric ozone layer caused by synthetic chlorofluorocarbons (CFCs) and halons.",
    consequences: "Ban on CFCs under the Montreal Protocol has allowed the ozone layer to heal, successfully protecting surface life from lethal solar UV.",
  },
];

export const planetarySignals: PlanetarySignal[] = [
  {
    value: "1.55 °C",
    label: "above pre-industrial",
    detail: "2024 was the warmest year on record and the first calendar year to average more than 1.5 °C above the 1850–1900 baseline.",
    source: "WMO",
  },
  {
    value: "430 ppm",
    label: "atmospheric CO₂",
    detail: "Monthly CO₂ at Mauna Loa first passed 430 ppm in May 2025; the 3.75 ppm annual jump in 2024 was the largest on record.",
    source: "NOAA / Scripps",
  },
  {
    value: "4.5 mm/yr",
    label: "sea-level rise",
    detail: "The rate of global mean sea-level rise roughly doubled from 2.1 mm/yr in 1993 to 4.5 mm/yr in 2024, and continues to accelerate.",
    source: "NASA",
  },
  {
    value: "6.7M ha",
    label: "tropical primary forest lost",
    detail: "Tropical primary forest loss hit a record in 2024 — nearly double 2023 — with fire the leading driver for the first time.",
    source: "Global Forest Watch / WRI",
  },
  {
    value: "73%",
    label: "wildlife population decline",
    detail: "The average size of monitored vertebrate populations fell 73% between 1970 and 2020; freshwater systems fell 85%.",
    source: "WWF / ZSL",
  },
  {
    value: "86%",
    label: "primary energy from fossil fuels",
    detail: "Fossil fuels still supplied roughly 86% of global primary energy in 2024, even as wind and solar grew about 16%.",
    source: "Energy Institute",
  },
];
