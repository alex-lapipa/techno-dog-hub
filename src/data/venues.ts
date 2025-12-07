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
    historicLineups: ["Paula Temple", "Kobosil", "SPFDJ", "Dax J"],
    coords: { lat: 41.7266, lng: 44.7667 }
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
    atmosphere: "Former technical school. Daytime café. Nighttime temple. Closed but not forgotten.",
    historicLineups: ["Objekt", "Skee Mask", "Shackleton", "Pangaea"]
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
  {
    id: "tresor",
    name: "Tresor",
    city: "Berlin",
    country: "Germany",
    type: "club",
    active: "1991–present",
    capacity: 700,
    tags: ["historic", "vault", "underground", "industrial"],
    soundSystem: "Custom Martin Audio with emphasis on low-end",
    atmosphere: "The original vault. The connection that changed everything.",
    historicLineups: ["Surgeon", "Planetary Assault Systems", "Blawan"],
    coords: { lat: 52.5096, lng: 13.4182 }
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
    atmosphere: "East London warehouse. 24+ hour events. No natural light. Pure darkness.",
    historicLineups: ["Perc", "Blawan", "Paula Temple", "Dax J"],
    coords: { lat: 51.5391, lng: -0.0053 }
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
    atmosphere: "On a barge on the Seine. Sunrise sessions with natural light. Closed but legendary.",
    historicLineups: ["Ben Klock", "Paula Temple", "Rødhåd", "Dax J"]
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
    historicLineups: ["Ben Klock", "Marcel Dettmann", "Trym"],
    coords: { lat: 50.8424, lng: 4.3360 }
  },
  {
    id: "garage-nord",
    name: "Garage Nord",
    city: "Amsterdam",
    country: "Netherlands",
    type: "warehouse",
    active: "2019–present",
    capacity: 500,
    tags: ["warehouse", "Amsterdam Noord", "raw", "intimate"],
    atmosphere: "Raw warehouse in Amsterdam Noord. Intimate. Proper.",
    coords: { lat: 52.3883, lng: 4.9034 }
  },
  {
    id: "blitz",
    name: "Blitz",
    city: "Munich",
    country: "Germany",
    type: "club",
    active: "2016–present",
    capacity: 600,
    tags: ["Munich", "Funktion-One", "marathon", "quality"],
    soundSystem: "Funktion-One system",
    atmosphere: "Munich's answer to the Berlin sound. Quality bookings. Marathon sessions.",
    coords: { lat: 48.1351, lng: 11.5820 }
  },
  {
    id: "eerste-communie",
    name: "Eerste Communie",
    city: "Amsterdam",
    country: "Netherlands",
    type: "club",
    active: "2021–present",
    capacity: 300,
    tags: ["intimate", "Dutch", "vinyl", "quality"],
    atmosphere: "Small but perfectly formed. Focus on quality sound and bookings.",
    coords: { lat: 52.3667, lng: 4.8945 }
  },
  {
    id: "corsica-studios",
    name: "Corsica Studios",
    city: "London",
    country: "UK",
    type: "club",
    active: "2003–present",
    capacity: 500,
    tags: ["London", "two rooms", "intimate", "quality"],
    soundSystem: "Custom Funktion-One",
    atmosphere: "Two rooms under the arches. London's proper underground.",
    historicLineups: ["Blawan", "Perc", "Helena Hauff"],
    coords: { lat: 51.4871, lng: -0.0993 }
  }
];

export const getVenueById = (id: string) => venues.find(v => v.id === id);
export const getVenuesByCity = (city: string) => venues.filter(v => v.city === city);
export const getVenuesByType = (type: Venue['type']) => venues.filter(v => v.type === type);
export const getActiveVenues = () => venues.filter(v => v.active.includes('present'));
