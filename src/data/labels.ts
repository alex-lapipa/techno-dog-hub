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
    id: "ostgut-ton",
    name: "Ostgut Ton",
    city: "Berlin",
    country: "Germany",
    founded: 2005,
    active: true,
    tags: ["Berghain", "Berlin", "diverse", "quality"],
    description: "The label arm of Berghain. Documenting the club's residents and sound. The Berlin standard.",
    artists: ["Ben Klock", "Marcel Dettmann", "Steffi", "Fiedel", "Len Faki"]
  },
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
    artists: ["Inigo Kennedy", "Oscar Mulero", "Kr!z", "Lewis Fautzi"]
  },
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
    id: "arts",
    name: "Arts",
    city: "Paris",
    country: "France",
    founded: 2014,
    active: true,
    tags: ["French", "hard", "dark", "emotional"],
    description: "French techno at its finest. Emotional but powerful.",
    founders: ["Emmanuel"],
    artists: ["Dax J", "SHDW & Obscure Shape", "Hadone"]
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
    artists: ["Svreca", "Tensal", "Cassegrain", "Oscar Mulero"]
  },
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
    id: "hayes",
    name: "Hayes",
    city: "Berlin",
    country: "Germany",
    founded: 2018,
    active: true,
    tags: ["Berlin", "hypnotic", "modern", "quality"],
    description: "Modern Berlin techno. Quality hypnotic productions."
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
    artists: ["Lucy", "Perc", "Rrose"]
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
  {
    id: "unterton",
    name: "Unterton",
    city: "Berlin",
    country: "Germany",
    founded: 2016,
    active: true,
    tags: ["Berlin", "hypnotic", "modern", "atmospheric"],
    description: "Modern Berlin techno with atmospheric depth."
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
    id: "dystopian",
    name: "Dystopian",
    city: "Berlin",
    country: "Germany",
    founded: 2012,
    active: true,
    tags: ["Berlin", "dark", "atmospheric", "hypnotic"],
    description: "Rødhåd's dark, atmospheric label. Berlin at its moodiest.",
    founders: ["Rødhåd"],
    artists: ["Rødhåd", "Alex.Do", "Vril"]
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
  }
];

export const getLabelById = (id: string) => labels.find(l => l.id === id);
export const getLabelsByCountry = (country: string) => labels.filter(l => l.country === country);
export const getActiveLabels = () => labels.filter(l => l.active);
