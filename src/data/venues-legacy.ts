export interface ImageAttribution {
  url: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  sourceName: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
  type: 'club' | 'warehouse' | 'outdoor' | 'multi-space';
  active: string;
  capacity?: number;
  tags: string[];
  soundSystem?: string;
  atmosphere?: string;
  historicLineups?: string[];
  coords?: { lat: number; lng: number };
  image?: ImageAttribution;
}

export const venues: Venue[] = [
  // GERMANY
  {
    id: "berghain",
    name: "Berghain",
    city: "Berlin",
    country: "Germany",
    type: "club",
    active: "2004–present",
    capacity: 1500,
    tags: ["industrial", "techno", "Funktion-One", "iconic"],
    soundSystem: "Custom Funktion-One with 11 bass units",
    atmosphere: "Former power plant. Cathedral of techno. No photos. Pure sound.",
    historicLineups: ["Ben Klock", "Marcel Dettmann", "Len Faki", "Steffi", "DVS1"],
    coords: { lat: 52.5112, lng: 13.4425 },
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Berlin_Berghain.jpg/800px-Berlin_Berghain.jpg",
      author: "Arne Müseler",
      license: "CC BY-SA 3.0 DE",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/de/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Berlin_Berghain.jpg",
      sourceName: "Wikimedia Commons"
    }
  },
  {
    id: "tresor",
    name: "Tresor",
    city: "Berlin",
    country: "Germany",
    type: "club",
    active: "1991–present",
    capacity: 1000,
    tags: ["Detroit-Berlin axis", "historic", "vault", "underground"],
    soundSystem: "Custom Martin Audio with emphasis on low-end",
    atmosphere: "The original vault. The Detroit-Berlin connection that changed everything.",
    historicLineups: ["Jeff Mills", "Juan Atkins", "Underground Resistance", "Surgeon"],
    coords: { lat: 52.5096, lng: 13.4182 },
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Tresor_-_Berlin.jpg/800px-Tresor_-_Berlin.jpg",
      author: "MichaelBrossmann",
      license: "Public Domain",
      licenseUrl: "https://en.wikipedia.org/wiki/Public_domain",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Tresor_-_Berlin.jpg",
      sourceName: "Wikimedia Commons"
    }
  },
  {
    id: "about-blank",
    name: "://about blank",
    city: "Berlin",
    country: "Germany",
    type: "club",
    active: "2010–present",
    capacity: 600,
    tags: ["garden", "collective", "political", "queer-friendly"],
    atmosphere: "Collective-run space with large garden. Strong political stance. Community first.",
    coords: { lat: 52.5067, lng: 13.4695 },
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Techno-Club_About_Blank_Markgrafendamm_Berlin.jpg/800px-Techno-Club_About_Blank_Markgrafendamm_Berlin.jpg",
      author: "Singlespeedfahrer",
      license: "CC0 1.0",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Techno-Club_About_Blank_Markgrafendamm_Berlin.jpg",
      sourceName: "Wikimedia Commons"
    }
  },

  // GEORGIA
  {
    id: "bassiani",
    name: "Bassiani",
    city: "Tbilisi",
    country: "Georgia",
    type: "club",
    active: "2014–present",
    capacity: 1200,
    tags: ["former swimming pool", "political", "movement", "resistance"],
    soundSystem: "Custom d&b audiotechnik with J-series mains",
    atmosphere: "Built in a Soviet swimming pool beneath a football stadium. Symbol of Georgian youth resistance.",
    historicLineups: ["Paula Temple", "Kobosil", "SPFDJ", "Dax J", "Hector Oaks"],
    coords: { lat: 41.7266, lng: 44.7667 },
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Tbilisi_Boris_Paichadze_Dinamo_Arena_1.jpg/800px-Tbilisi_Boris_Paichadze_Dinamo_Arena_1.jpg",
      author: "DJMX",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Tbilisi_Boris_Paichadze_Dinamo_Arena_1.jpg",
      sourceName: "Wikimedia Commons"
    }
  },
  {
    id: "khidi",
    name: "Khidi",
    city: "Tbilisi",
    country: "Georgia",
    type: "warehouse",
    active: "2015–present",
    capacity: 800,
    tags: ["industrial", "raw", "warehouse", "underground"],
    atmosphere: "Raw industrial space. Dark. Uncompromising. The other side of Tbilisi.",
    coords: { lat: 41.7151, lng: 44.8097 }
  },

  // FRANCE
  {
    id: "concrete",
    name: "Concrete",
    city: "Paris",
    country: "France",
    type: "club",
    active: "2011–2019",
    capacity: 400,
    tags: ["riverside", "Funktion-One", "intimate", "daylight"],
    soundSystem: "Funktion-One with custom configuration",
    atmosphere: "On a barge on the Seine. Sunrise sessions with natural light. Closed but legendary.",
    historicLineups: ["Ben Klock", "Paula Temple", "Rødhåd", "Dax J"]
  },

  // NETHERLANDS
  {
    id: "de-school",
    name: "De School",
    city: "Amsterdam",
    country: "Netherlands",
    type: "multi-space",
    active: "2016–2021",
    capacity: 700,
    tags: ["former school", "intimate", "restaurant", "vinyl"],
    soundSystem: "Custom system focused on clarity and warmth",
    atmosphere: "Former technical school. Daytime café. Nighttime temple. Closed but not forgotten.",
    historicLineups: ["Objekt", "Skee Mask", "Shackleton", "Pangaea"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/De_School_Dancefloor.jpg/960px-De_School_Dancefloor.jpg",
      author: "Martijn Savenije",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:De_School_Dancefloor.jpg",
      sourceName: "Wikimedia Commons"
    }
  },

  // UK
  {
    id: "fold",
    name: "Fold",
    city: "London",
    country: "UK",
    type: "warehouse",
    active: "2018–present",
    capacity: 600,
    tags: ["warehouse", "long hours", "industrial", "raw"],
    soundSystem: "Custom Void Acoustics system",
    atmosphere: "East London warehouse. 24+ hour events. No natural light. Pure darkness.",
    historicLineups: ["Perc", "Blawan", "Paula Temple", "Dax J"],
    coords: { lat: 51.5391, lng: -0.0053 }
  },

  // BELGIUM
  {
    id: "fuse",
    name: "Fuse",
    city: "Brussels",
    country: "Belgium",
    type: "club",
    active: "1994–present",
    capacity: 900,
    tags: ["legendary", "vinyl", "low ceiling", "intimate"],
    soundSystem: "Custom with emphasis on mid-range clarity",
    atmosphere: "Low ceilings. Dense. The heart of Belgian techno.",
    historicLineups: ["Ben Klock", "Marcel Dettmann", "Trym"],
    coords: { lat: 50.8424, lng: 4.3360 }
  },

  // POLAND
  {
    id: "instytut",
    name: "Instytut",
    city: "Katowice",
    country: "Poland",
    type: "club",
    active: "2014–present",
    capacity: 400,
    tags: ["Polish", "industrial heritage", "Silesia", "underground"],
    atmosphere: "In the post-industrial heart of Silesia. Raw Polish techno.",
    coords: { lat: 50.2649, lng: 19.0238 }
  },

  // USA
  {
    id: "marble-bar",
    name: "Marble Bar",
    city: "Detroit",
    country: "USA",
    type: "club",
    active: "2015–present",
    capacity: 400,
    tags: ["Detroit", "origin city", "intimate", "diverse"],
    atmosphere: "In the birthplace of techno. A new generation space keeping the tradition alive.",
    coords: { lat: 42.3314, lng: -83.0458 }
  },

  // JAPAN
  {
    id: "vent",
    name: "Vent",
    city: "Tokyo",
    country: "Japan",
    type: "club",
    active: "2016–present",
    capacity: 300,
    tags: ["intimate", "quality sound", "Tokyo", "underground"],
    soundSystem: "Custom Pioneer system with analog mixing",
    atmosphere: "Small but perfectly formed. Focus on sound quality.",
    historicLineups: ["DJ Nobu", "Wata Igarashi", "Donato Dozzy"],
    coords: { lat: 35.6574, lng: 139.7053 }
  },

  // COLOMBIA
  {
    id: "video-club",
    name: "Video Club",
    city: "Bogotá",
    country: "Colombia",
    type: "club",
    active: "2019–present",
    capacity: 350,
    tags: ["Colombian", "underground", "intimate", "raw"],
    atmosphere: "Bogotá's underground techno institution. Raw and uncompromising.",
    coords: { lat: 4.6097, lng: -74.0817 }
  },

  // BRAZIL
  {
    id: "d-edge",
    name: "D-Edge",
    city: "São Paulo",
    country: "Brazil",
    type: "club",
    active: "2000–present",
    capacity: 1000,
    tags: ["South America", "LED", "marathon", "diverse"],
    soundSystem: "Full Void Acoustics system",
    atmosphere: "São Paulo's techno institution. 24+ hour parties. Leading South American techno.",
    historicLineups: ["Ben Klock", "Jeff Mills", "Oscar Mulero"],
    coords: { lat: -23.5284, lng: -46.6665 }
  },

  // MEXICO
  {
    id: "mutek-mx",
    name: "MUTEK.MX Stages",
    city: "Mexico City",
    country: "Mexico",
    type: "multi-space",
    active: "2003–present",
    tags: ["festival", "audiovisual", "experimental", "Latin America"],
    atmosphere: "Various venues across Mexico City. Audiovisual and experimental techno.",
    coords: { lat: 19.4326, lng: -99.1332 }
  },

  // AUSTRALIA
  {
    id: "sub-club-melbourne",
    name: "Sub Club",
    city: "Melbourne",
    country: "Australia",
    type: "club",
    active: "2015–present",
    capacity: 400,
    tags: ["Australian", "underground", "intimate", "quality"],
    atmosphere: "Melbourne's underground techno space. Intimate and focused.",
    coords: { lat: -37.8136, lng: 144.9631 }
  },

  // SPAIN
  {
    id: "la-real",
    name: "La Real",
    city: "Oviedo",
    country: "Spain",
    type: "club",
    active: "1994–early 2000s",
    capacity: 2000,
    tags: ["Spanish", "techno cathedral", "marathon sets", "legendary"],
    atmosphere: "Highly influential Spanish club in the 1990s, known for marathon resident sets and regular international guests.",
    historicLineups: ["Pepo", "Higinio", "Eulogio Victorero", "Oscar Mulero"]
  },
  {
    id: "florida-135",
    name: "Florida 135",
    city: "Fraga",
    country: "Spain",
    type: "club",
    active: "1988–present",
    capacity: 5000,
    tags: ["Spanish", "destination club", "techno cathedral", "legendary"],
    atmosphere: "Legendary Spanish club often described as a techno cathedral; large capacity and top-tier bookings made it an international reference point for decades."
  },
  {
    id: "quimica",
    name: "Química",
    city: "Gijón",
    country: "Spain",
    type: "club",
    active: "early 1990s–2000s",
    tags: ["Spanish", "underground", "foundational", "Asturias"],
    atmosphere: "One of Spain's foundational underground electronic spaces where figures like Eulogio Victorero shaped early northern Spanish techno.",
    historicLineups: ["Eulogio Victorero"]
  },

  // UK
  {
    id: "club-414",
    name: "Club 414",
    city: "London",
    country: "UK",
    type: "club",
    active: "1988–present",
    capacity: 350,
    tags: ["acid techno", "Brixton", "DIY", "squat party spirit"],
    atmosphere: "A Brixton landmark and epicenter of London acid techno. DIY ethos rooted in squat-party spirit within a club setting.",
    historicLineups: ["Chris Liberator", "D.A.V.E. The Drummer", "The Geezer"]
  },

  // USA
  {
    id: "music-institute",
    name: "The Music Institute",
    city: "Detroit",
    country: "USA",
    type: "club",
    active: "1988–1989",
    tags: ["birthplace", "historic", "Belleville Three", "foundational"],
    atmosphere: "Seminal Detroit venue where the first wave of techno took shape; closely linked with the Belleville Three and early Detroit innovators.",
    historicLineups: ["Derrick May", "Kevin Saunderson", "Juan Atkins"]
  },
  {
    id: "movement-festival",
    name: "Movement Festival",
    city: "Detroit",
    country: "USA",
    type: "outdoor",
    active: "2000–present",
    capacity: 100000,
    tags: ["festival", "Hart Plaza", "DEMF", "techno homecoming"],
    atmosphere: "Annual festival at Hart Plaza (formerly DEMF) celebrating Detroit's techno legacy; a global pilgrimage for techno fans.",
    coords: { lat: 42.3286, lng: -83.0441 }
  },

  // NETHERLANDS
  {
    id: "shelter-amsterdam",
    name: "Shelter",
    city: "Amsterdam",
    country: "Netherlands",
    type: "club",
    active: "2016–present",
    capacity: 700,
    tags: ["bunker", "underground", "Funktion-One", "ADAM Tower"],
    soundSystem: "Funktion-One",
    atmosphere: "Club under the A'DAM Tower with a bunker-like dancefloor and Funktion-One sound; widely respected in Amsterdam's underground.",
    coords: { lat: 52.3843, lng: 4.9016 }
  },
  {
    id: "radion",
    name: "RADION",
    city: "Amsterdam",
    country: "Netherlands",
    type: "multi-space",
    active: "2014–present",
    capacity: 1000,
    tags: ["arts space", "multifaceted", "long-hour", "community"],
    atmosphere: "Cultural venue combining visual arts and underground electronic music; known for long-hour programming.",
    coords: { lat: 52.3579, lng: 4.8430 }
  },

  // ARGENTINA
  {
    id: "under-club",
    name: "Under Club",
    city: "Buenos Aires",
    country: "Argentina",
    type: "club",
    active: "2012–present",
    capacity: 600,
    tags: ["Latin America", "techno temple", "intense", "community"],
    atmosphere: "Key Buenos Aires techno venue with an intense atmosphere, international bookings, and strong community drive.",
    coords: { lat: -34.5947, lng: -58.3973 }
  },
  {
    id: "crobar-bsas",
    name: "Crobar Buenos Aires",
    city: "Buenos Aires",
    country: "Argentina",
    type: "club",
    active: "2001–present",
    capacity: 2500,
    tags: ["South America", "peak-time", "multi-room", "large-scale"],
    atmosphere: "Major South American electronic club with large-scale production and multi-room experiences.",
    coords: { lat: -34.5829, lng: -58.4257 }
  },

  // COLOMBIA
  {
    id: "baum-park",
    name: "Baum Park",
    city: "Medellín",
    country: "Colombia",
    type: "outdoor",
    active: "2018–present",
    tags: ["festival", "outdoor", "Parque Norte", "Latin America"],
    atmosphere: "Outdoor techno event in Parque Norte that helped cement Medellín's position in the Latin American techno circuit.",
    coords: { lat: 6.2748, lng: -75.5669 }
  },

  // MEXICO
  {
    id: "funk-club",
    name: "Fünk Club",
    city: "Mexico City",
    country: "Mexico",
    type: "club",
    active: "2018–present",
    capacity: 200,
    tags: ["hidden", "intimate", "underground", "historic building"],
    atmosphere: "Hidden, intimate venue under a historic building, championing underground electronic programming.",
    coords: { lat: 19.4320, lng: -99.1520 }
  },
  {
    id: "brutal-mx",
    name: "Brutal (MX)",
    city: "Mexico City",
    country: "Mexico",
    type: "warehouse",
    active: "2019–present",
    tags: ["warehouse", "Pervert collective", "raw", "immersive"],
    atmosphere: "Warehouse-style event series associated with the Pervert collective, focused on raw, immersive techno experiences.",
    coords: { lat: 19.4284, lng: -99.1276 }
  }
];

export const getVenueById = (id: string) => venues.find(v => v.id === id);
export const getVenuesByCity = (city: string) => venues.filter(v => v.city === city);
export const getVenuesByType = (type: Venue['type']) => venues.filter(v => v.type === type);
export const getActiveVenues = () => venues.filter(v => v.active.includes('present'));
