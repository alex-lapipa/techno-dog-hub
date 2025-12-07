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
  {
    id: "axis",
    name: "Axis Records",
    city: "Detroit",
    country: "USA",
    founded: 1992,
    active: true,
    tags: ["Detroit", "minimal", "sci-fi", "essential"],
    description: "Jeff Mills' personal imprint. A platform for his vision of techno as a cosmic, futuristic art form.",
    founders: ["Jeff Mills"],
    artists: ["Jeff Mills", "Robert Hood"],
    keyReleases: ["Waveform Transmission Vol.1", "Purpose Maker Compilation"]
  },
  {
    id: "underground-resistance",
    name: "Underground Resistance",
    city: "Detroit",
    country: "USA",
    founded: 1989,
    active: true,
    tags: ["Detroit", "militant", "anonymous", "revolutionary"],
    description: "More than a label—a movement. Anti-corporate, pro-community. The masked revolutionaries of Detroit techno.",
    founders: ["Mad Mike Banks", "Jeff Mills", "Robert Hood"],
    artists: ["Mad Mike Banks", "Drexciya", "Galaxy 2 Galaxy"]
  },
  {
    id: "tresor-records",
    name: "Tresor Records",
    city: "Berlin",
    country: "Germany",
    founded: 1991,
    active: true,
    tags: ["Detroit-Berlin", "historic", "essential", "techno"],
    description: "The label that bridged Detroit and Berlin. Document of a transatlantic revolution.",
    founders: ["Dimitri Hegemann"],
    artists: ["Jeff Mills", "Juan Atkins", "Blake Baxter", "Surgeon"]
  },
  {
    id: "ostgut-ton",
    name: "Ostgut Ton",
    city: "Berlin",
    country: "Germany",
    founded: 2005,
    active: true,
    tags: ["Berghain", "Berlin", "diverse", "quality"],
    description: "The label arm of Berghain. Documenting the club's residents and sound.",
    artists: ["Ben Klock", "Marcel Dettmann", "Steffi", "Fiedel", "Len Faki"]
  },
  {
    id: "mord",
    name: "Mord Records",
    city: "Rotterdam",
    country: "Netherlands",
    founded: 2014,
    active: true,
    tags: ["industrial", "hard", "bass-heavy", "dark"],
    description: "Hard, industrial techno. No compromises.",
    founders: ["Bas Mooy"],
    artists: ["Bas Mooy", "UVB", "Ansome", "Brutalismus 3000"]
  },
  {
    id: "polegroup",
    name: "PoleGroup",
    city: "Madrid",
    country: "Spain",
    founded: 2006,
    active: true,
    tags: ["Madrid", "hypnotic", "minimal", "deep"],
    description: "Oscar Mulero's collective. Spanish techno at its finest.",
    founders: ["Oscar Mulero"],
    artists: ["Oscar Mulero", "Exium", "Reeko", "Lewis Fautzi"]
  },
  {
    id: "downwards",
    name: "Downwards",
    city: "Birmingham",
    country: "UK",
    founded: 1993,
    active: true,
    tags: ["Birmingham", "industrial", "dark", "essential"],
    description: "The dark heart of Birmingham techno. Co-founded by Regis.",
    founders: ["Regis", "Female"],
    artists: ["Regis", "Surgeon", "Female", "Vatican Shadow"]
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
    artists: ["Perc", "Truss", "Ansome", "Blawan"]
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
    artists: ["Svreca", "Tensal", "Cassegrain"]
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
    artists: ["Slam", "Rebekah", "Gary Beck"]
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
    artists: ["Len Faki", "Truncate", "Setaoc Mass"]
  },
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
    artists: ["Dax J", "I Hate Models", "Hadone"]
  },
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
    artists: ["VARG", "Acronym", "Posh Isolation"]
  },
  {
    id: "token",
    name: "Token",
    city: "Brussels",
    country: "Belgium",
    founded: 2009,
    active: true,
    tags: ["Belgian", "driving", "Km Amen", "quality"],
    description: "Belgian techno institution. Quality over quantity.",
    founders: ["Kr!z"],
    artists: ["Inigo Kennedy", "Oscar Mulero", "Kr!z"]
  },
  {
    id: "m-plant",
    name: "M-Plant",
    city: "Detroit",
    country: "USA",
    founded: 1994,
    active: true,
    tags: ["minimal", "Detroit", "Robert Hood", "essential"],
    description: "Robert Hood's label. The blueprint for minimal techno.",
    founders: ["Robert Hood"],
    artists: ["Robert Hood", "Floorplan"]
  }
];

export const getLabelById = (id: string) => labels.find(l => l.id === id);
export const getLabelsByCountry = (country: string) => labels.filter(l => l.country === country);
export const getActiveLabels = () => labels.filter(l => l.active);
