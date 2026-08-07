// The planetary connectivity layer: the geography of humanity's second
// planetary shell — the one made of information rather than rock, water, or air.
//
// This is the source of truth for the Meta Earth globe's network visualization
// (`PlanetaryNetwork` in `src/components/lab/lab-earth-view.tsx`). Coordinates
// are approximate real-world positions: metropolitan regions that host the
// major internet exchange points and data-center clusters, the terrestrial
// fiber corridors between them, the submarine cable systems that carry ~99% of
// intercontinental traffic, and the long wireless links (satellite, cellular
// backhaul, terrestrial radio) that reach where cable does not.
//
// Routes are traced as chains of waypoints. Node ids resolve to a node's
// coordinates; bare [lat, lng] pairs are intermediate waypoints, used mainly to
// keep submarine paths in water and to send them through the straits and canals
// real cables actually use (Malacca, Bab-el-Mandeb, Suez, Luzon, Hormuz).
//
// The data is illustrative rather than exhaustive: a legible sample of a system
// with roughly 1.5 million kilometres of submarine cable and several hundred
// significant exchange points.

export type NetworkNodeTier = 1 | 2;

export type NetworkNode = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** 1 = top-tier exchange / cloud region cluster, 2 = major regional hub. */
  tier: NetworkNodeTier;
};

/** An intermediate waypoint: `[lat, lng]`. */
export type NetworkWaypoint = [number, number];

export type NetworkChannel = "fiber" | "submarine" | "wireless";

export type NetworkRoute = {
  id: string;
  channel: NetworkChannel;
  label: string;
  /** Ordered chain of node ids and raw waypoints. */
  path: (string | NetworkWaypoint)[];
};

// ---------------------------------------------------------------------------
// Nodes — metropolitan regions carrying major exchange points, cable landings,
// and data-center clusters.
// ---------------------------------------------------------------------------

export const networkNodes: NetworkNode[] = [
  // North America
  { id: "ashburn", label: "Ashburn", lat: 39.04, lng: -77.49, tier: 1 },
  { id: "new-york", label: "New York", lat: 40.71, lng: -74.01, tier: 1 },
  { id: "toronto", label: "Toronto", lat: 43.65, lng: -79.38, tier: 2 },
  { id: "montreal", label: "Montréal", lat: 45.5, lng: -73.57, tier: 2 },
  { id: "chicago", label: "Chicago", lat: 41.88, lng: -87.63, tier: 1 },
  { id: "atlanta", label: "Atlanta", lat: 33.75, lng: -84.39, tier: 2 },
  { id: "miami", label: "Miami", lat: 25.76, lng: -80.19, tier: 1 },
  { id: "dallas", label: "Dallas", lat: 32.78, lng: -96.8, tier: 2 },
  { id: "denver", label: "Denver", lat: 39.74, lng: -104.99, tier: 2 },
  { id: "phoenix", label: "Phoenix", lat: 33.45, lng: -112.07, tier: 2 },
  { id: "los-angeles", label: "Los Angeles", lat: 34.05, lng: -118.24, tier: 1 },
  { id: "san-jose", label: "San José", lat: 37.34, lng: -121.89, tier: 1 },
  { id: "seattle", label: "Seattle", lat: 47.61, lng: -122.33, tier: 2 },
  { id: "mexico-city", label: "Mexico City", lat: 19.43, lng: -99.13, tier: 2 },

  // South America
  { id: "bogota", label: "Bogotá", lat: 4.71, lng: -74.07, tier: 2 },
  { id: "lima", label: "Lima", lat: -12.05, lng: -77.04, tier: 2 },
  { id: "santiago", label: "Santiago", lat: -33.45, lng: -70.67, tier: 2 },
  { id: "buenos-aires", label: "Buenos Aires", lat: -34.6, lng: -58.38, tier: 2 },
  { id: "sao-paulo", label: "São Paulo", lat: -23.55, lng: -46.63, tier: 1 },
  { id: "rio", label: "Rio de Janeiro", lat: -22.91, lng: -43.17, tier: 2 },
  { id: "fortaleza", label: "Fortaleza", lat: -3.73, lng: -38.53, tier: 1 },

  // Europe
  { id: "lisbon", label: "Lisbon", lat: 38.72, lng: -9.14, tier: 2 },
  { id: "madrid", label: "Madrid", lat: 40.42, lng: -3.7, tier: 2 },
  { id: "marseille", label: "Marseille", lat: 43.3, lng: 5.37, tier: 1 },
  { id: "milan", label: "Milan", lat: 45.46, lng: 9.19, tier: 2 },
  { id: "paris", label: "Paris", lat: 48.86, lng: 2.35, tier: 1 },
  { id: "london", label: "London", lat: 51.51, lng: -0.13, tier: 1 },
  { id: "dublin", label: "Dublin", lat: 53.35, lng: -6.26, tier: 2 },
  { id: "amsterdam", label: "Amsterdam", lat: 52.37, lng: 4.9, tier: 1 },
  { id: "frankfurt", label: "Frankfurt", lat: 50.11, lng: 8.68, tier: 1 },
  { id: "vienna", label: "Vienna", lat: 48.21, lng: 16.37, tier: 2 },
  { id: "warsaw", label: "Warsaw", lat: 52.23, lng: 21.01, tier: 2 },
  { id: "stockholm", label: "Stockholm", lat: 59.33, lng: 18.07, tier: 2 },
  { id: "moscow", label: "Moscow", lat: 55.76, lng: 37.62, tier: 2 },
  { id: "istanbul", label: "Istanbul", lat: 41.01, lng: 28.98, tier: 2 },

  // Africa and the Middle East
  { id: "casablanca", label: "Casablanca", lat: 33.57, lng: -7.59, tier: 2 },
  { id: "accra", label: "Accra", lat: 5.6, lng: -0.19, tier: 2 },
  { id: "lagos", label: "Lagos", lat: 6.52, lng: 3.38, tier: 1 },
  { id: "cape-town", label: "Cape Town", lat: -33.92, lng: 18.42, tier: 2 },
  { id: "durban", label: "Durban", lat: -29.86, lng: 31.02, tier: 2 },
  { id: "johannesburg", label: "Johannesburg", lat: -26.2, lng: 28.05, tier: 1 },
  { id: "nairobi", label: "Nairobi", lat: -1.29, lng: 36.82, tier: 2 },
  { id: "mombasa", label: "Mombasa", lat: -4.04, lng: 39.67, tier: 2 },
  { id: "djibouti", label: "Djibouti", lat: 11.59, lng: 43.15, tier: 2 },
  { id: "cairo", label: "Cairo", lat: 30.04, lng: 31.24, tier: 1 },
  { id: "tel-aviv", label: "Tel Aviv", lat: 32.08, lng: 34.78, tier: 2 },
  { id: "dubai", label: "Dubai", lat: 25.2, lng: 55.27, tier: 1 },

  // Asia
  { id: "karachi", label: "Karachi", lat: 24.86, lng: 67.01, tier: 2 },
  { id: "mumbai", label: "Mumbai", lat: 19.08, lng: 72.88, tier: 1 },
  { id: "delhi", label: "Delhi", lat: 28.61, lng: 77.21, tier: 2 },
  { id: "chennai", label: "Chennai", lat: 13.08, lng: 80.27, tier: 2 },
  { id: "bangkok", label: "Bangkok", lat: 13.76, lng: 100.5, tier: 2 },
  { id: "singapore", label: "Singapore", lat: 1.35, lng: 103.82, tier: 1 },
  { id: "jakarta", label: "Jakarta", lat: -6.21, lng: 106.85, tier: 2 },
  { id: "manila", label: "Manila", lat: 14.6, lng: 120.98, tier: 2 },
  { id: "hong-kong", label: "Hong Kong", lat: 22.32, lng: 114.17, tier: 1 },
  { id: "guangzhou", label: "Guangzhou", lat: 23.13, lng: 113.26, tier: 2 },
  { id: "shanghai", label: "Shanghai", lat: 31.23, lng: 121.47, tier: 1 },
  { id: "beijing", label: "Beijing", lat: 39.9, lng: 116.41, tier: 2 },
  { id: "seoul", label: "Seoul", lat: 37.57, lng: 126.98, tier: 1 },
  { id: "tokyo", label: "Tokyo", lat: 35.68, lng: 139.69, tier: 1 },
  { id: "osaka", label: "Osaka", lat: 34.69, lng: 135.5, tier: 2 },
  { id: "taipei", label: "Taipei", lat: 25.03, lng: 121.57, tier: 2 },
  { id: "novosibirsk", label: "Novosibirsk", lat: 55.03, lng: 82.92, tier: 2 },
  { id: "vladivostok", label: "Vladivostok", lat: 43.12, lng: 131.89, tier: 2 },

  // Oceania
  { id: "perth", label: "Perth", lat: -31.95, lng: 115.86, tier: 2 },
  { id: "melbourne", label: "Melbourne", lat: -37.81, lng: 144.96, tier: 2 },
  { id: "sydney", label: "Sydney", lat: -33.87, lng: 151.21, tier: 1 },
  { id: "auckland", label: "Auckland", lat: -36.85, lng: 174.76, tier: 2 },
];

// ---------------------------------------------------------------------------
// Terrestrial fiber — the long-haul corridors that follow rail, road, and
// pipeline rights-of-way across continents.
// ---------------------------------------------------------------------------

const fiberRoutes: NetworkRoute[] = [
  { id: "na-pacific", channel: "fiber", label: "Pacific Coast corridor", path: ["seattle", "san-jose", "los-angeles", "phoenix"] },
  { id: "na-sunbelt", channel: "fiber", label: "Southern corridor", path: ["phoenix", "dallas", "atlanta", "miami"] },
  { id: "na-transcontinental", channel: "fiber", label: "Transcontinental backbone", path: ["san-jose", "denver", "chicago", "new-york"] },
  { id: "na-great-lakes", channel: "fiber", label: "Great Lakes corridor", path: ["chicago", "toronto", "montreal", "new-york"] },
  { id: "na-eastern", channel: "fiber", label: "Eastern seaboard corridor", path: ["new-york", "ashburn", "atlanta"] },
  { id: "na-central", channel: "fiber", label: "Central corridor", path: ["dallas", "chicago"] },
  { id: "na-mexico", channel: "fiber", label: "North American south link", path: ["los-angeles", "mexico-city"] },

  { id: "sa-andean", channel: "fiber", label: "Andean corridor", path: ["bogota", "lima", "santiago", "buenos-aires"] },
  { id: "sa-atlantic", channel: "fiber", label: "South Atlantic corridor", path: ["buenos-aires", "sao-paulo", "rio", "fortaleza"] },

  { id: "eu-iberia-alps", channel: "fiber", label: "Iberia–Alpine corridor", path: ["lisbon", "madrid", "marseille", "milan", "frankfurt"] },
  { id: "eu-northwest", channel: "fiber", label: "North-west European ring", path: ["london", "paris", "frankfurt", "amsterdam"] },
  { id: "eu-east", channel: "fiber", label: "Central European corridor", path: ["frankfurt", "vienna", "warsaw", "moscow"] },
  { id: "eu-nordic", channel: "fiber", label: "Nordic corridor", path: ["amsterdam", "stockholm"] },
  { id: "eu-balkan", channel: "fiber", label: "Balkan corridor", path: ["vienna", "istanbul"] },

  { id: "eurasia-siberian", channel: "fiber", label: "Trans-Siberian corridor", path: ["moscow", "novosibirsk", "vladivostok"] },
  { id: "eurasia-china", channel: "fiber", label: "Trans-Eurasian corridor", path: ["novosibirsk", "beijing"] },

  { id: "af-maghreb", channel: "fiber", label: "Trans-Saharan corridor", path: ["casablanca", "cairo"] },
  { id: "af-west", channel: "fiber", label: "West African corridor", path: ["lagos", "accra", "casablanca"] },
  { id: "af-rift", channel: "fiber", label: "Great Rift corridor", path: ["cairo", "nairobi", "johannesburg"] },
  { id: "af-south", channel: "fiber", label: "Southern African corridor", path: ["johannesburg", "durban"] },
  { id: "af-cape", channel: "fiber", label: "Cape corridor", path: ["johannesburg", "cape-town"] },
  { id: "me-levant", channel: "fiber", label: "Levantine corridor", path: ["istanbul", "tel-aviv", "cairo"] },

  { id: "as-indus", channel: "fiber", label: "Indus corridor", path: ["karachi", "delhi"] },
  { id: "as-india", channel: "fiber", label: "Indian trunk", path: ["delhi", "mumbai", "chennai"] },
  { id: "as-indochina", channel: "fiber", label: "Indochina corridor", path: ["delhi", "bangkok", "singapore"] },
  { id: "as-south-china", channel: "fiber", label: "South China corridor", path: ["bangkok", "guangzhou", "hong-kong"] },
  { id: "as-china-coast", channel: "fiber", label: "Chinese coastal trunk", path: ["guangzhou", "shanghai", "beijing"] },
  { id: "as-japan", channel: "fiber", label: "Tōkaidō corridor", path: ["osaka", "tokyo"] },

  { id: "oc-australia", channel: "fiber", label: "Trans-Australian corridor", path: ["perth", "melbourne", "sydney"] },
];

// ---------------------------------------------------------------------------
// Submarine cable — the ocean-floor systems that carry almost all
// intercontinental traffic. Waypoints keep each path in water and route it
// through the straits and canals the real systems use.
// ---------------------------------------------------------------------------

const submarineRoutes: NetworkRoute[] = [
  {
    id: "transatlantic-north",
    channel: "submarine",
    label: "North Atlantic system",
    path: ["new-york", [41.4, -68], [43.5, -55], [48, -35], [50.5, -15], [50.2, -5.5], "london"],
  },
  {
    id: "transatlantic-iberia",
    channel: "submarine",
    label: "Mid-Atlantic system",
    path: ["ashburn", [36.9, -75.9], [37, -62], [38, -45], [38.5, -28], [39, -14], "lisbon"],
  },
  {
    id: "south-atlantic-europe",
    channel: "submarine",
    label: "Brazil–Europe system",
    path: ["fortaleza", [-1, -33], [8, -30], [20, -27], [32, -20], "lisbon"],
  },
  {
    id: "south-atlantic-africa",
    channel: "submarine",
    label: "South Atlantic crossing",
    path: ["fortaleza", [-6, -28], [-6, -12], [0, -2], "lagos"],
  },
  {
    id: "americas-caribbean",
    channel: "submarine",
    label: "Americas system",
    path: ["miami", [22, -73], [15, -62], [8, -53], [0, -45], "fortaleza"],
  },
  {
    id: "pacific-north",
    channel: "submarine",
    label: "North Pacific system",
    path: ["seattle", [47, -135], [47, -160], [45, 175], [40, 150], "tokyo"],
  },
  {
    id: "pacific-central",
    channel: "submarine",
    label: "Trans-Pacific system",
    path: ["los-angeles", [33, -130], [32, -155], [33, -178], [34, 160], "tokyo"],
  },
  {
    id: "pacific-guam",
    channel: "submarine",
    label: "Trans-Pacific south route",
    path: ["los-angeles", [26, -135], [19, -160], [15, -178], [13.4, 144.8], [19, 131], [21.5, 120.5], "hong-kong"],
  },
  {
    id: "southern-cross",
    channel: "submarine",
    label: "Australia–Americas system",
    path: ["sydney", [-30, 163], [-20, -178], [-8, -165], [8, -150], [22, -130], "los-angeles"],
  },
  { id: "tasman", channel: "submarine", label: "Tasman crossing", path: ["sydney", [-35, 163], "auckland"] },
  {
    id: "indian-ocean-west",
    channel: "submarine",
    label: "Australia–Asia system",
    path: ["perth", [-25, 110], [-12, 106], [-3, 104], "singapore"],
  },
  {
    id: "asia-pacific-gateway",
    channel: "submarine",
    label: "East Asia gateway",
    path: ["tokyo", [31, 134], [25, 124], [20, 120], [12, 113], [5, 106], "singapore"],
  },
  { id: "south-china-sea", channel: "submarine", label: "South China Sea link", path: ["hong-kong", [16, 112], [8, 107], "singapore"] },
  { id: "korea-japan", channel: "submarine", label: "Korea Strait link", path: ["seoul", [36, 127.5], [34, 130], "osaka"] },
  { id: "yellow-sea", channel: "submarine", label: "Yellow Sea link", path: ["beijing", [38.5, 120], [37.5, 125], "seoul"] },
  { id: "ryukyu", channel: "submarine", label: "Ryukyu link", path: ["taipei", [26, 124], [29, 129], "osaka"] },
  { id: "luzon", channel: "submarine", label: "Luzon link", path: ["hong-kong", [19, 117], "manila"] },
  { id: "java-sea", channel: "submarine", label: "Java Sea link", path: ["singapore", [-2, 105], "jakarta"] },
  { id: "sulu", channel: "submarine", label: "Sulu Sea link", path: ["singapore", [6, 110], [12, 117], "manila"] },
  { id: "sea-of-japan", channel: "submarine", label: "Sea of Japan link", path: ["vladivostok", [42, 134], [40, 138], "tokyo"] },
  {
    id: "asia-europe-trunk",
    channel: "submarine",
    label: "Asia–Europe trunk",
    path: [
      "singapore",
      [4, 99],
      [6.5, 94],
      [6, 86],
      [6, 78],
      [10, 65],
      [12, 52],
      "djibouti",
      [16, 40.5],
      [21, 37.5],
      [26, 34.8],
      [29.4, 32.6],
      [31.5, 32.3],
      [33.5, 29],
      [34.5, 22],
      [36, 14],
      [38.5, 9],
      "marseille",
    ],
  },
  { id: "arabian-sea", channel: "submarine", label: "Arabian Sea link", path: ["mumbai", [21, 68], [24, 60], [25.6, 56.5], "dubai"] },
  { id: "bay-of-bengal", channel: "submarine", label: "Bay of Bengal link", path: ["chennai", [9, 83], [6, 90], [5, 97], "singapore"] },
  { id: "indian-ocean-north", channel: "submarine", label: "India–Asia system", path: ["mumbai", [12, 71], [4, 80], [3, 90], [2, 99], "singapore"] },
  {
    id: "east-africa",
    channel: "submarine",
    label: "East African system",
    path: ["djibouti", [8, 49], [0, 45], "mombasa", [-12, 42], [-22, 37], "durban"],
  },
  { id: "west-africa", channel: "submarine", label: "West African system", path: ["lagos", [0, 5], [-10, 9], [-22, 11], "cape-town"] },
  { id: "north-sea", channel: "submarine", label: "North Sea link", path: ["amsterdam", [52.2, 3.2], [51.8, 1.5], "london"] },
  { id: "irish-sea", channel: "submarine", label: "Irish Sea link", path: ["dublin", [53.4, -4.5], [53.4, -3.1], "london"] },
  { id: "mediterranean", channel: "submarine", label: "Mediterranean system", path: ["marseille", [40, 8], [36, 17], [33, 26], [31.4, 30], "cairo"] },
  { id: "iberia-maghreb", channel: "submarine", label: "Iberia–Maghreb link", path: ["lisbon", [36, -9.5], "casablanca"] },
];

// ---------------------------------------------------------------------------
// Wireless — satellite relay, long-haul microwave, and cellular backhaul: the
// links that ride through the air rather than through glass.
// ---------------------------------------------------------------------------

const wirelessPairs: [string, string][] = [
  ["ashburn", "frankfurt"],
  ["san-jose", "sydney"],
  ["tokyo", "delhi"],
  ["johannesburg", "mumbai"],
  ["moscow", "beijing"],
  ["sao-paulo", "madrid"],
  ["nairobi", "dubai"],
  ["auckland", "santiago"],
  ["jakarta", "tokyo"],
  ["cairo", "karachi"],
  ["buenos-aires", "cape-town"],
  ["seattle", "stockholm"],
  ["toronto", "london"],
  ["mexico-city", "lima"],
];

const wirelessRoutes: NetworkRoute[] = wirelessPairs.map(([from, to]) => ({
  id: `wireless-${from}-${to}`,
  channel: "wireless" as const,
  label: "Wireless relay",
  path: [from, to],
}));

export const networkRoutes: NetworkRoute[] = [
  ...fiberRoutes,
  ...submarineRoutes,
  ...wirelessRoutes,
];

const nodeById = new Map(networkNodes.map((node) => [node.id, node]));

/** Resolve a route's path into plain `[lat, lng]` waypoints. */
export function resolveRoutePath(route: NetworkRoute): NetworkWaypoint[] {
  return route.path.map((step) => {
    if (typeof step !== "string") {
      return step;
    }
    const node = nodeById.get(step);
    if (!node) {
      throw new Error(`Unknown network node "${step}" in route "${route.id}"`);
    }
    return [node.lat, node.lng];
  });
}
