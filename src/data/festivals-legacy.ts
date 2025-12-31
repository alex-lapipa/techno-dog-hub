export interface Festival {
  id: string;
  name: string;
  city: string;
  country: string;
  founded: number;
  active: boolean;
  type: 'outdoor' | 'indoor' | 'hybrid';
  months: string[];
  tags: string[];
  description?: string;
  stages?: string[];
  capacity?: number;
  historicLineups?: string[];
  coords?: { lat: number; lng: number };
  image?: string;
  images?: string[];
}

export const festivals: Festival[] = [
  {
    id: "awakenings",
    name: "Awakenings",
    city: "Amsterdam",
    country: "Netherlands",
    founded: 1997,
    active: true,
    type: "hybrid",
    months: ["June", "July"],
    tags: ["massive", "Dutch", "essential", "techno"],
    description: "One of the largest techno festivals in the world. Multiple locations, multiple days.",
    stages: ["Main", "Area Y", "Area Z", "Klokgebouw"],
    capacity: 40000,
    historicLineups: ["Jeff Mills", "Adam Beyer", "Nina Kraviz", "Amelie Lens"],
    coords: { lat: 52.3702, lng: 4.8952 }
  },
  {
    id: "dekmantel",
    name: "Dekmantel",
    city: "Amsterdam",
    country: "Netherlands",
    founded: 2013,
    active: true,
    type: "outdoor",
    months: ["August"],
    tags: ["eclectic", "curated", "Amsterdamse Bos", "quality"],
    description: "Curated festival in the Amsterdamse Bos forest. Quality over quantity.",
    stages: ["Main Stage", "UFO I", "UFO II", "Greenhouse", "Selectors"],
    capacity: 10000,
    historicLineups: ["DJ Nobu", "Helena Hauff", "Objekt", "Shackleton"],
    coords: { lat: 52.3246, lng: 4.8453 }
  },
  {
    id: "time-warp",
    name: "Time Warp",
    city: "Mannheim",
    country: "Germany",
    founded: 1994,
    active: true,
    type: "indoor",
    months: ["April"],
    tags: ["marathon", "Maimarkthalle", "German", "legendary"],
    description: "All-night techno marathon in the Maimarkthalle. German techno institution.",
    stages: ["Main Floor", "Krypton", "Void"],
    capacity: 15000,
    historicLineups: ["Sven Väth", "Richie Hawtin", "Chris Liebing"],
    coords: { lat: 49.4875, lng: 8.4660 }
  },
  {
    id: "atonal",
    name: "Berlin Atonal",
    city: "Berlin",
    country: "Germany",
    founded: 1982,
    active: true,
    type: "indoor",
    months: ["August"],
    tags: ["experimental", "Kraftwerk", "audiovisual", "avant-garde"],
    description: "Festival for experimental and avant-garde electronic music. Held in the Kraftwerk power plant.",
    stages: ["Main Hall", "Null", "OHM"],
    historicLineups: ["Rrose", "Pan Sonic", "Lustmord", "Shackleton"],
    coords: { lat: 52.5112, lng: 13.4425 }
  },
  {
    id: "sonar",
    name: "Sónar",
    city: "Barcelona",
    country: "Spain",
    founded: 1994,
    active: true,
    type: "hybrid",
    months: ["June"],
    tags: ["electronic", "experimental", "daytime/nighttime", "Barcelona"],
    description: "International festival of advanced music and new media art. Day and night programs.",
    stages: ["SonarHall", "SonarPub", "SonarClub", "SonarVillage"],
    capacity: 100000,
    coords: { lat: 41.3879, lng: 2.1699 },
    image: "/festivals/sonar-2015.jpg",
    historicLineups: ["Richie Hawtin", "Jeff Mills", "Laurent Garnier", "Aphex Twin", "Autechre"]
  },
  {
    id: "mira",
    name: "MIRA Festival",
    city: "Barcelona",
    country: "Spain",
    founded: 2011,
    active: true,
    type: "indoor",
    months: ["November"],
    tags: ["audiovisual", "digital art", "experimental", "Barcelona"],
    description: "Festival dedicated to digital arts, electronic music, and live visuals.",
    coords: { lat: 41.3879, lng: 2.1699 }
  },
  {
    id: "lev",
    name: "L.E.V. Festival",
    city: "Gijón",
    country: "Spain",
    founded: 2007,
    active: true,
    type: "hybrid",
    months: ["May"],
    tags: ["audiovisual", "LABoral", "experimental", "Asturias"],
    description: "Laboratorio de Electrónica Visual. Where audio and visual art converge.",
    stages: ["LABoral", "Teatro Jovellanos"],
    historicLineups: ["Ryoji Ikeda", "Amon Tobin", "Murcof"],
    coords: { lat: 43.5322, lng: -5.6611 }
  },
  {
    id: "aquasella",
    name: "Aquasella",
    city: "Arriondas",
    country: "Spain",
    founded: 1997,
    active: true,
    type: "outdoor",
    months: ["August"],
    tags: ["outdoor", "river", "Asturias", "intimate"],
    description: "Intimate outdoor festival by the Sella river. Asturian mountains as backdrop.",
    capacity: 15000,
    coords: { lat: 43.3883, lng: -5.1878 }
  },
  {
    id: "unsound",
    name: "Unsound",
    city: "Kraków",
    country: "Poland",
    founded: 2003,
    active: true,
    type: "hybrid",
    months: ["October"],
    tags: ["experimental", "Polish", "avant-garde", "thematic"],
    description: "Festival for experimental and avant-garde music. Each year explores a different theme.",
    coords: { lat: 50.0647, lng: 19.9450 }
  },
  {
    id: "movement",
    name: "Movement Detroit",
    city: "Detroit",
    country: "USA",
    founded: 2000,
    active: true,
    type: "outdoor",
    months: ["May"],
    tags: ["Detroit", "Hart Plaza", "origin city", "essential"],
    description: "The festival in the birthplace of techno. Hart Plaza. Memorial Day weekend.",
    stages: ["Main Stage", "Underground Stage", "Movement Stage"],
    capacity: 100000,
    historicLineups: ["Jeff Mills", "Kevin Saunderson", "Carl Craig", "Underground Resistance"],
    coords: { lat: 42.3286, lng: -83.0458 }
  },
  {
    id: "labyrinth",
    name: "Labyrinth",
    city: "Niigata",
    country: "Japan",
    founded: 2011,
    active: true,
    type: "outdoor",
    months: ["September"],
    tags: ["Japanese", "nature", "hypnotic", "intimate"],
    description: "Intimate outdoor festival in the Japanese mountains. Extended sets only.",
    historicLineups: ["Donato Dozzy", "DJ Nobu", "Wata Igarashi"],
    coords: { lat: 37.9161, lng: 139.0364 }
  },
  {
    id: "gamma",
    name: "GAMMA Festival",
    city: "St. Petersburg",
    country: "Russia",
    founded: 2016,
    active: true,
    type: "hybrid",
    months: ["August"],
    tags: ["Russian", "industrial", "raw", "port"],
    description: "Festival in an abandoned port. Industrial setting. Raw techno.",
    coords: { lat: 59.9311, lng: 30.3609 }
  },
  {
    id: "instytut",
    name: "Tauron Nowa Muzyka",
    city: "Katowice",
    country: "Poland",
    founded: 2006,
    active: true,
    type: "outdoor",
    months: ["August"],
    tags: ["Polish", "diverse", "industrial heritage", "Silesia"],
    description: "Festival in the post-industrial landscape of Silesia. Diverse programming.",
    coords: { lat: 50.2649, lng: 19.0238 }
  }
];

export const getFestivalById = (id: string) => festivals.find(f => f.id === id);
export const getFestivalsByCountry = (country: string) => festivals.filter(f => f.country === country);
export const getActiveFestivals = () => festivals.filter(f => f.active);
export const getFestivalsByMonth = (month: string) => festivals.filter(f => f.months.includes(month));
