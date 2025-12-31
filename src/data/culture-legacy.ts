/**
 * Techno Culture & Movements Database
 * Cultural history, movements, and philosophy of global techno
 */

export interface SoundSystem {
  name: string;
  formationYear: number;
  originCity: string;
  description: string;
}

export interface CulturalMovement {
  id: string;
  name: string;
  type: 'movement' | 'legislation' | 'event-type' | 'genre' | 'philosophy';
  description: string;
  origin?: string;
  peakYears?: string;
  philosophy?: string;
  keyCollectives?: SoundSystem[];
  provisions?: string[];
  resistance?: string[];
  impact?: string;
  legacy?: string;
  notableEvents?: string[];
  regions?: string[];
  elements?: string | string[];
  sound?: string;
  values?: string;
  keyArtists?: string[];
  keyLabels?: string[];
  keyTracks?: string[];
  connection?: string;
  quote?: string;
  principles?: string[];
}

export const technoCulture: CulturalMovement[] = [
  // MOVEMENTS
  {
    id: "free-party-movement",
    name: "Free Party Movement",
    type: "movement",
    description: "A countercultural movement rejecting the commercialization of electronic music. Illegal parties in fields, warehouses, and abandoned spaces with no profit motive.",
    origin: "United Kingdom in the late 1980s, responding to the commercialization of acid house.",
    peakYears: "1989–1994",
    philosophy: "Music should be free: no bouncers, no dress code, no profit—just music and community.",
    keyCollectives: [
      {
        name: "Spiral Tribe",
        formationYear: 1990,
        originCity: "London, UK",
        description: "One of the most influential sound systems in the movement. Grew from London squats into massive teknivals. After legal persecution, relocated across Europe. Slogan: \"Make Some Fucking Noise\"."
      },
      {
        name: "DiY Sound System",
        formationYear: 1989,
        originCity: "Nottingham, UK",
        description: "Midlands free-party pioneers known for community ethos and sound quality. Survived the post-CJA era and remained active, faithful to DIY values."
      },
      {
        name: "Bedlam",
        formationYear: 1991,
        originCity: "London, UK",
        description: "Legendary London sound system known for intense raves and massive sound."
      },
      {
        name: "Desert Storm",
        formationYear: 1989,
        originCity: "United Kingdom (multi-city)",
        description: "One of the earliest and largest UK sound systems, known for iconic countryside parties and early rave circuits."
      },
      {
        name: "Circus Warp",
        formationYear: 1990,
        originCity: "London, UK",
        description: "Collective blending performance art with rave, adopting a dystopian circus aesthetic."
      }
    ]
  },
  {
    id: "freetekno",
    name: "Freetekno",
    type: "movement",
    description: "Continental European evolution of the free-party movement—harder, faster, and more politicized.",
    origin: "Expanded when UK sound systems moved into Europe after the 1994 Act.",
    regions: ["France", "Czech Republic", "Italy", "Spain", "Portugal"],
    elements: "Teknivals, nomadic collectives, anti-commercial culture, itinerant lifestyle.",
    philosophy: "Inspired by TAZ (Temporary Autonomous Zones): briefly liberated spaces outside state/commercial control.",
    sound: "Hardcore techno, tribe, acidcore—more aggressive than the earlier UK rave roots."
  },
  {
    id: "rave-culture",
    name: "Rave Culture",
    type: "movement",
    description: "A 1990s movement that transformed electronic music into a global phenomenon.",
    values: "PLUR (Peace, Love, Unity, Respect) as an ethical code in the scene.",
    elements: ["Warehouses", "Collective experience", "Connection through dance"]
  },

  // LEGISLATION
  {
    id: "criminal-justice-act-1994",
    name: "Criminal Justice and Public Order Act 1994",
    type: "legislation",
    description: "UK legislation aimed at criminalizing raves and free parties after major events such as Castlemorton 1992. It even defined rave music as 'sounds characterized by repetitive beats' to enable enforcement.",
    provisions: [
      "Police power to stop raves of 100+ people",
      "Defines rave music as 'sounds characterized by repetitive beats'",
      "Power to confiscate sound systems",
      "Fines and prison sentences for organizers"
    ],
    resistance: [
      "Large-scale protests in London against the law (e.g., 'Freedom to Party')",
      "Underground crews continued illegal events in defiance",
      "Migration of sound systems to continental Europe seeking more permissive contexts"
    ],
    impact: "Pushed the movement deeper underground or into exile, spreading rave/free-party culture across Europe.",
    legacy: "A symbol of state backlash against youth culture; the scene survived, adapted, and globalized."
  },

  // EVENT TYPES
  {
    id: "teknivals",
    name: "Teknivals",
    type: "event-type",
    description: "Large free festivals organized by multiple sound systems without permits or commercial promoters, rooted in the free-party ethos.",
    notableEvents: [
      "Castlemorton Common Festival 1992 (UK) – Week-long teknival with ~40,000 attendees; directly triggered the Criminal Justice Act.",
      "Czechtek (Czech Republic, 1994–2006) – One of Europe's biggest teknivals; heavily repressed in 2005, sparking protests.",
      "French teknivals (1993–present) – France became a refuge for teknivals after 1994, with recurring large-scale events."
    ]
  },

  // GENRES
  {
    id: "industrial-techno",
    name: "Industrial Techno",
    type: "genre",
    description: "A darker, more experimental branch of techno influenced by industrial and noise aesthetics.",
    keyArtists: ["Regis", "Surgeon", "Ancient Methods", "Ansome"],
    keyLabels: ["Downwards", "Hospital Productions"]
  },
  {
    id: "acid-house",
    name: "Acid House",
    type: "genre",
    description: "TB-303-driven sound that helped ignite everything. Originated in Chicago (1986) and exploded in the UK during the 'Second Summer of Love' (1988).",
    keyTracks: ["Phuture – Acid Tracks", "A Guy Called Gerald – Voodoo Ray"],
    connection: "A direct precursor to free-party culture: early ravers sought to extend the club experience into autonomous spaces."
  },

  // PHILOSOPHY
  {
    id: "techno-philosophy",
    name: "Techno Philosophy",
    type: "philosophy",
    description: "The underlying values and worldview of techno culture.",
    quote: "\"Techno is not just music. It's a complete way of life.\" — Jeff Mills",
    principles: [
      "Underground: not a genre but an attitude—credibility over commerciality.",
      "Community: from Detroit to Tbilisi, Tokyo to Bogotá—techno builds global communities.",
      "Detroit: where it began—European electronics fused with American funk and soul to create a futurist sound.",
      "Global connection: Detroit → Berlin → beyond—techno spread through an international cultural network."
    ]
  }
];

// Helper functions
export const getMovementById = (id: string): CulturalMovement | undefined =>
  technoCulture.find(m => m.id === id);

export const getMovementsByType = (type: CulturalMovement['type']): CulturalMovement[] =>
  technoCulture.filter(m => m.type === type);

export const getAllSoundSystems = (): SoundSystem[] =>
  technoCulture
    .filter(m => m.keyCollectives)
    .flatMap(m => m.keyCollectives || []);
