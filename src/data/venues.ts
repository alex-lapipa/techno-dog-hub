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
}

export const venues: Venue[] = [
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
    coords: { lat: 52.5112, lng: 13.4425 }
  },
  {
    id: "tresor",
    name: "Tresor",
    city: "Berlin",
    country: "Germany",
    type: "club",
    active: "1991–present",
    capacity: 700,
    tags: ["Detroit-Berlin axis", "historic", "vault", "underground"],
    soundSystem: "Custom Martin Audio with emphasis on low-end",
    atmosphere: "Originally in a Wertheim department store vault. The Detroit-Berlin connection.",
    historicLineups: ["Jeff Mills", "Juan Atkins", "Underground Resistance", "Surgeon"],
    coords: { lat: 52.5096, lng: 13.4182 }
  },
  {
    id: "bassiani",
    name: "Bassiani",
    city: "Tbilisi",
    country: "Georgia",
    type: "club",
    active: "2014–present",
    capacity: 1200,
    tags: ["former swimming pool", "political", "movement", "techno"],
    soundSystem: "Custom d&b audiotechnik with J-series mains",
    atmosphere: "Built in a Soviet swimming pool beneath a football stadium. Symbol of Georgian youth resistance.",
    historicLineups: ["Nina Kraviz", "Paula Temple", "Kobosil", "SPFDJ"],
    coords: { lat: 41.7266, lng: 44.7667 }
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
    atmosphere: "Raw industrial space. Dark. Uncompromising.",
    coords: { lat: 41.7151, lng: 44.8097 }
  },
  {
    id: "de-school",
    name: "De School",
    city: "Amsterdam",
    country: "Netherlands",
    type: "multi-space",
    active: "2016–2020",
    capacity: 700,
    tags: ["former school", "intimate", "restaurant", "vinyl"],
    soundSystem: "Custom system focused on clarity and warmth",
    atmosphere: "Former technical school. Daytime café. Nighttime temple.",
    historicLineups: ["Objekt", "Skee Mask", "Shackleton", "Pangaea"]
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
    atmosphere: "Collective-run space with large garden. Strong political stance.",
    coords: { lat: 52.5067, lng: 13.4695 }
  },
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
    atmosphere: "On a barge on the Seine. Sunrise sessions with natural light.",
    historicLineups: ["Ben Klock", "Paula Temple", "Rødhåd", "Dax J"]
  },
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
    atmosphere: "East London warehouse. 24+ hour events. No natural light.",
    coords: { lat: 51.5391, lng: -0.0053 }
  },
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
    historicLineups: ["Jeff Mills", "Dave Clarke", "Amelie Lens"],
    coords: { lat: 50.8424, lng: 4.3360 }
  },
  {
    id: "warm-up",
    name: "Warm Up",
    city: "Madrid",
    country: "Spain",
    active: "1996–2010",
    type: "club",
    capacity: 400,
    tags: ["Madrid", "Oscar Mulero", "historic", "intimate"],
    atmosphere: "Oscar Mulero's legendary club. Shaped Spanish techno.",
    historicLineups: ["Oscar Mulero", "Surgeon", "Regis", "Jeff Mills"]
  },
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
    coords: { lat: 35.6574, lng: 139.7053 }
  },
  {
    id: "marble-bar",
    name: "Marble Bar",
    city: "Detroit",
    country: "USA",
    type: "club",
    active: "2015–present",
    capacity: 400,
    tags: ["Detroit", "origin city", "intimate", "diverse"],
    atmosphere: "In the birthplace of techno. A new generation space.",
    coords: { lat: 42.3314, lng: -83.0458 }
  },
  {
    id: "golden-pudel",
    name: "Golden Pudel Club",
    city: "Hamburg",
    country: "Germany",
    type: "club",
    active: "1994–present",
    capacity: 200,
    tags: ["dive bar", "Helena Hauff", "anti-commercial", "cult"],
    atmosphere: "Tiny. Cheap. Legendary. Where Helena Hauff residencies began.",
    coords: { lat: 53.5481, lng: 9.9562 }
  },
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
    atmosphere: "São Paulo's techno institution. 24+ hour parties.",
    coords: { lat: -23.5284, lng: -46.6665 }
  },
  {
    id: "printworks",
    name: "Printworks",
    city: "London",
    country: "UK",
    type: "warehouse",
    active: "2017–2023",
    capacity: 6000,
    tags: ["former printing factory", "massive", "daylight", "industrial"],
    soundSystem: "Custom d&b audiotechnik system",
    atmosphere: "Massive former printing press hall. Daylight floods through skylights.",
    historicLineups: ["Ben Klock", "Jeff Mills", "Nina Kraviz", "Charlotte de Witte"]
  }
];

export const getVenueById = (id: string) => venues.find(v => v.id === id);
export const getVenuesByCity = (city: string) => venues.filter(v => v.city === city);
export const getVenuesByType = (type: Venue['type']) => venues.filter(v => v.type === type);
export const getActiveVenues = () => venues.filter(v => v.active.includes('present'));
