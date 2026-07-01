const cosmicHierarchy = [
  {
    name: "Dust grain",
    size: "~1 um",
    description: "Tiny mineral and carbon particles drifting between stars.",
  },
  {
    name: "Pebble",
    size: "~1 cm",
    description: "Early building blocks that can collect inside planet-forming disks.",
  },
  {
    name: "Boulder",
    size: "~1 m",
    description: "A compact rocky body shaped by collision, gravity, and accretion.",
  },
  {
    name: "Asteroid",
    size: "~1-1,000 km",
    description: "Leftover planetesimals preserving early Solar System material.",
  },
  {
    name: "Moon",
    size: "~1,000-5,000 km",
    description: "Natural satellites orbiting planets and sculpting tides and impacts.",
  },
  {
    name: "Planet",
    size: "~10,000 km",
    description: "A rounded world orbiting a star; Earth is the living example here.",
  },
  {
    name: "Star",
    size: "~1 million km",
    description: "A self-gravitating fusion engine that lights and enriches space.",
  },
  {
    name: "Solar system",
    size: "~10^13 m",
    description: "A star, its planets, and the small bodies bound to it.",
  },
  {
    name: "Stellar neighborhood",
    size: "~10-100 ly",
    description: "Nearby stars moving together through a small patch of the galaxy.",
  },
  {
    name: "Milky Way",
    size: "~100,000 ly",
    description: "A spiral galaxy of stars, gas, dust, dark matter, and our Sun.",
  },
  {
    name: "Local Group",
    size: "~10 million ly",
    description: "The Milky Way, Andromeda, and smaller galaxies gravitationally bound.",
  },
  {
    name: "Virgo Supercluster",
    size: "~100 million ly",
    description: "A vast regional concentration of galaxy groups and clusters.",
  },
  {
    name: "Laniakea",
    size: "~500 million ly",
    description: "The larger flow basin of galaxies that includes the Milky Way.",
  },
  {
    name: "Observable universe",
    size: "~93 billion ly",
    description: "Everything whose light has had time to reach us since the Big Bang.",
  },
];

export function CosmicObjectHierarchy() {
  return (
    <aside className="cosmic-hierarchy-panel" aria-label="Cosmic object hierarchy">
      <div className="earth-event-browser-header">
        <span>Space Object Sizes</span>
      </div>

      <div className="cosmic-hierarchy-list">
        {cosmicHierarchy.map((item) => (
          <article key={item.name} className="cosmic-hierarchy-item">
            <div className="cosmic-hierarchy-item__header">
              <h2>{item.name}</h2>
              <span>{item.size}</span>
            </div>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </aside>
  );
}
