export interface Label {
  id: string;
  name: string;
  city: string;
  country: string;
  founded: number;
  active: boolean;
  tags: string[];
  description?: string;
  founders?: string[];
  keyReleases?: string[];
  artists?: string[];
}

export const labels: Label[] = [
  // DETROIT
  {
    id: "axis",
    name: "Axis Records",
    city: "Detroit",
    country: "USA",
    founded: 1992,
    active: true,
    tags: ["Detroit", "minimal", "sci-fi", "essential"],
    description: "Jeff Mills' personal imprint. Techno as cosmic, futuristic art form.",
    founders: ["Jeff Mills"],
    artists: ["Jeff Mills", "Robert Hood"]
  },
  {
    id: "underground-resistance",
    name: "Underground Resistance",
    city: "Detroit",
    country: "USA",
    founded: 1989,
    active: true,
    tags: ["Detroit", "militant", "anonymous", "revolutionary"],
    description: "More than a label—a movement. Anti-corporate, pro-community. The masked revolutionaries.",
    founders: ["Mad Mike Banks", "Jeff Mills", "Robert Hood"],
    artists: ["Mad Mike Banks", "Drexciya", "Galaxy 2 Galaxy"]
  },

  // BERLIN
  {
    id: "ostgut-ton",
    name: "Ostgut Ton",
    city: "Berlin",
    country: "Germany",
    founded: 2005,
    active: true,
    tags: ["Berghain", "Berlin", "diverse", "quality"],
    description: "The label arm of Berghain. Documenting the club's residents and sound.",
    artists: ["Ben Klock", "Marcel Dettmann", "Steffi", "Fiedel", "Len Faki", "Phase Fatale"]
  },
  {
    id: "tresor-records",
    name: "Tresor Records",
    city: "Berlin",
    country: "Germany",
    founded: 1991,
    active: true,
    tags: ["Detroit-Berlin", "historic", "essential", "foundational"],
    description: "The label that bridged Detroit and Berlin. Document of a transatlantic revolution.",
    founders: ["Dimitri Hegemann"],
    artists: ["Jeff Mills", "Juan Atkins", "Blake Baxter", "Surgeon"]
  },
  {
    id: "dystopian",
    name: "Dystopian",
    city: "Berlin",
    country: "Germany",
    founded: 2012,
    active: true,
    tags: ["Berlin", "dark", "atmospheric", "hypnotic"],
    description: "Rødhåd's dark, atmospheric label. Berlin at its moodiest.",
    founders: ["Rødhåd"],
    artists: ["Rødhåd", "Alex.Do", "Vril", "RIKHTER"]
  },
  {
    id: "stroboscopic-artefacts",
    name: "Stroboscopic Artefacts",
    city: "Berlin",
    country: "Germany",
    founded: 2009,
    active: true,
    tags: ["experimental", "avant-garde", "Berlin", "conceptual"],
    description: "Experimental and avant-garde electronic music. Pushing boundaries.",
    founders: ["Lucy"],
    artists: ["Lucy", "Perc", "Rrose", "Neel"]
  },
  {
    id: "figure",
    name: "Figure",
    city: "Berlin",
    country: "Germany",
    founded: 2008,
    active: true,
    tags: ["driving", "loop-heavy", "Len Faki", "Berlin"],
    description: "Len Faki's imprint. Driving, loop-focused techno.",
    founders: ["Len Faki"],
    artists: ["Len Faki", "Truncate", "Setaoc Mass", "Dimi Angélis"]
  },

  // UK
  {
    id: "mote-evolver",
    name: "Mote-Evolver",
    city: "London",
    country: "UK",
    founded: 1999,
    active: true,
    tags: ["UK", "Luke Slater", "hypnotic", "essential"],
    description: "Luke Slater's imprint. Hypnotic, relentless techno.",
    founders: ["Luke Slater"],
    artists: ["Planetary Assault Systems", "Psyk"]
  },
  {
    id: "perc-trax",
    name: "Perc Trax",
    city: "London",
    country: "UK",
    founded: 2004,
    active: true,
    tags: ["industrial", "experimental", "UK", "noise"],
    description: "Platform for the harder, more experimental edge of techno.",
    founders: ["Perc"],
    artists: ["Perc", "Truss", "Ansome", "Blawan", "VTSS", "Manni Dee"]
  },
  {
    id: "soma",
    name: "Soma Quality Recordings",
    city: "Glasgow",
    country: "UK",
    founded: 1991,
    active: true,
    tags: ["Scottish", "Slam", "diverse", "historic"],
    description: "Glasgow's longest-running electronic label. Home of Slam.",
    founders: ["Stuart McMillan", "Orde Meikle"],
    artists: ["Slam", "Rebekah", "Gary Beck", "Onyvaa"]
  },
  {
    id: "clergy",
    name: "Clergy",
    city: "London",
    country: "UK",
    founded: 2013,
    active: true,
    tags: ["UK", "hypnotic", "deep", "quality"],
    description: "UK label focused on hypnotic, deep techno.",
    founders: ["Sigha"],
    artists: ["Sigha", "Onyvaa"]
  },
  {
    id: "r-label-group",
    name: "R Label Group",
    city: "London",
    country: "UK",
    founded: 2012,
    active: true,
    tags: ["UK", "diverse", "quality", "London"],
    description: "London-based collective with quality-focused releases."
  },

  // BELGIUM
  {
    id: "token",
    name: "Token",
    city: "Brussels",
    country: "Belgium",
    founded: 2009,
    active: true,
    tags: ["Belgian", "driving", "quality", "essential"],
    description: "Belgian techno institution. Quality over quantity. Every release counts.",
    founders: ["Kr!z"],
    artists: ["Inigo Kennedy", "Oscar Mulero", "Kr!z", "Lewis Fautzi", "Tensal"]
  },

  // NETHERLANDS
  {
    id: "mord",
    name: "Mord Records",
    city: "Rotterdam",
    country: "Netherlands",
    founded: 2014,
    active: true,
    tags: ["industrial", "hard", "bass-heavy", "dark"],
    description: "Hard, industrial techno. No compromises. Chest punch guaranteed.",
    founders: ["Bas Mooy"],
    artists: ["Bas Mooy", "UVB", "Ansome", "999999999", "Trym"]
  },
  {
    id: "dynamic-reflection",
    name: "Dynamic Reflection",
    city: "Rotterdam",
    country: "Netherlands",
    founded: 2015,
    active: true,
    tags: ["Dutch", "hard", "industrial", "raw"],
    description: "Hard, industrial Dutch techno.",
    artists: ["Stranger", "TWR72"]
  },

  // SPAIN
  {
    id: "polegroup",
    name: "PoleGroup",
    city: "Madrid",
    country: "Spain",
    founded: 2006,
    active: true,
    tags: ["Madrid", "hypnotic", "minimal", "deep"],
    description: "Oscar Mulero's collective. Spanish techno at its finest. Pure warehouse sound.",
    founders: ["Oscar Mulero"],
    artists: ["Oscar Mulero", "Exium", "Reeko", "Lewis Fautzi", "Kwartz"]
  },
  {
    id: "semantica",
    name: "Semantica",
    city: "Barcelona",
    country: "Spain",
    founded: 2006,
    active: true,
    tags: ["deep", "hypnotic", "atmospheric", "ambient"],
    description: "Deep, atmospheric techno with an ambient edge.",
    founders: ["Svreca"],
    artists: ["Svreca", "Tensal", "Cassegrain", "Oscar Mulero", "Yan Cook"]
  },
  {
    id: "warm-up",
    name: "Warm Up",
    city: "Madrid",
    country: "Spain",
    founded: 1996,
    active: false,
    tags: ["Madrid", "historic", "Oscar Mulero", "foundational"],
    description: "Oscar Mulero's legendary club and label. Shaped Spanish techno.",
    founders: ["Oscar Mulero"]
  },
  {
    id: "subsist",
    name: "Subsist",
    city: "Oviedo",
    country: "Spain",
    founded: 2010,
    active: true,
    tags: ["Spanish", "industrial", "dark", "raw"],
    description: "Spanish label for industrial, dark techno.",
    artists: ["Exium"]
  },
  {
    id: "children-of-tomorrow",
    name: "Children of Tomorrow",
    city: "Madrid",
    country: "Spain",
    founded: 2012,
    active: true,
    tags: ["Spanish", "dark", "hypnotic", "Madrid"],
    description: "Madrid-based label. Dark, hypnotic techno.",
    founders: ["Kike Pravda"],
    artists: ["Kike Pravda"]
  },

  // FRANCE
  {
    id: "arts",
    name: "Arts",
    city: "Paris",
    country: "France",
    founded: 2014,
    active: true,
    tags: ["French", "hard", "dark", "emotional"],
    description: "French techno at its finest. Emotional but powerful.",
    founders: ["Emmanuel"],
    artists: ["Dax J", "I Hate Models", "Hadone", "SHDW & Obscure Shape"]
  },
  {
    id: "hayes",
    name: "Hayes",
    city: "Paris",
    country: "France",
    founded: 2018,
    active: true,
    tags: ["French", "hypnotic", "modern", "quality"],
    description: "Modern French techno. Hypnotic productions."
  },

  // UKRAINE
  {
    id: "horo",
    name: "Horo",
    city: "Kyiv",
    country: "Ukraine",
    founded: 2014,
    active: true,
    tags: ["Ukrainian", "hypnotic", "deep", "atmospheric"],
    description: "Ukrainian label. Hypnotic, atmospheric techno.",
    founders: ["Yan Cook"],
    artists: ["Yan Cook"]
  },

  // SWEDEN
  {
    id: "northern-electronics",
    name: "Northern Electronics",
    city: "Stockholm",
    country: "Sweden",
    founded: 2013,
    active: true,
    tags: ["ambient", "experimental", "Scandinavian", "deep"],
    description: "Ambient and experimental electronics from Sweden.",
    founders: ["VARG"],
    artists: ["VARG", "Acronym", "RIKHTER"]
  },

  // ITALY
  {
    id: "infrastructure",
    name: "Infrastructure",
    city: "Rome",
    country: "Italy",
    founded: 2015,
    active: true,
    tags: ["Italian", "dark", "industrial", "raw"],
    description: "Italian label for dark, industrial techno."
  }
];

export const getLabelById = (id: string) => labels.find(l => l.id === id);
export const getLabelsByCountry = (country: string) => labels.filter(l => l.country === country);
export const getActiveLabels = () => labels.filter(l => l.active);
