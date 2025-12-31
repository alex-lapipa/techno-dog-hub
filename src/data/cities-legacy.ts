/**
 * Techno Cities & Scenes Database
 * Core geographic hubs of global techno culture
 */

export interface TechnoCity {
  id: string;
  city: string;
  country: string;
  description: string;
  keyArtists?: string[];
  keyVenues?: string[];
  keyLabels?: string[];
  keyFestivals?: string[];
  keyCollectives?: string[];
  culture?: string;
  history?: string;
}

export const technoCities: TechnoCity[] = [
  // BIRTHPLACE
  {
    id: "detroit",
    city: "Detroit",
    country: "USA",
    description: "The birthplace of techno in the mid-1980s, fusing European electronics with Detroit funk and soul. Juan Atkins, Derrick May, and Kevin Saunderson (the Belleville Three) laid the foundations here.",
    keyArtists: ["Juan Atkins", "Derrick May", "Kevin Saunderson", "Jeff Mills", "Carl Craig"],
    keyVenues: ["The Music Institute", "Movement Festival"],
    keyLabels: ["Metroplex", "Transmat", "KMS Records", "Underground Resistance"],
    culture: "Techno's origin point—everything started here."
  },

  // EUROPE
  {
    id: "berlin",
    city: "Berlin",
    country: "Germany",
    description: "Europe's techno capital after the fall of the Wall. Reunification opened up abandoned industrial spaces that became temples of electronic sound.",
    keyArtists: ["Ben Klock", "Marcel Dettmann", "Len Faki", "Ellen Allien"],
    keyVenues: ["Berghain", "Tresor", "Watergate", "://about blank"],
    keyLabels: ["Ostgut Ton", "Tresor Records", "BPitch Control"],
    culture: "A 24/7 ecosystem with strict door policy and deep respect for the music."
  },
  {
    id: "london",
    city: "London",
    country: "United Kingdom",
    description: "Cradle of underground acid techno. From 1990s squat parties to today's clubs, London retains a rebellious DIY spirit—TB-303 acid as the soundtrack of resistance.",
    keyArtists: ["Chris Liberator", "D.A.V.E. The Drummer", "Blawan", "Dax J", "Paula Temple"],
    keyVenues: ["Fold", "Fabric", "The Cause", "Club 414", "Corsica Studios"],
    keyLabels: ["Stay Up Forever", "Hydraulix", "Smitten", "Liberator", "Monnom Black"],
    culture: "Punk spirit applied to techno: anti-commercial, fiercely underground.",
    history: "The scene grew out of squats in areas like Brixton and Hackney in the late 1980s; sound systems and crews built a parallel rave infrastructure."
  },
  {
    id: "amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    description: "Known for progressive club culture and long-hour licensing. Blends rave heritage with contemporary electronic innovation.",
    keyArtists: ["Speedy J", "Secret Cinema", "I Hate Models"],
    keyVenues: ["Shelter", "RADION", "Garage Noord", "Thuishaven"],
    keyLabels: ["Clone", "Dekmantel", "Rush Hour"]
  },
  {
    id: "tbilisi",
    city: "Tbilisi",
    country: "Georgia",
    description: "An emerging scene that became a stronghold of techno freedom in Eastern Europe. In a conservative context, techno evolved as a symbol of youth liberation.",
    keyVenues: ["Bassiani", "Khidi", "Mtkvarze"],
    culture: "Techno as liberation—dancing as a political act."
  },

  // ASIA
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    description: "A scene defined by deep respect for music and DJ craft, combining technical discipline with sonic experimentation.",
    keyArtists: ["Ken Ishii", "DJ Nobu", "Fumiya Tanaka"],
    keyVenues: ["WOMB", "Contact", "Vent"],
    culture: "Deep listening culture and technical precision, with knowledgeable crowds."
  },

  // LATIN AMERICA
  {
    id: "buenos-aires",
    city: "Buenos Aires",
    country: "Argentina",
    description: "A major South American techno capital, with a vibrant underground that expanded strongly after 2010 through parties and world-class clubs.",
    keyArtists: ["Jonas Kopp", "Pfirter"],
    keyVenues: ["Under Club", "Crobar", "Avant Garten"],
    culture: "High-intensity community energy—passionate crowds and tight local networks."
  },
  {
    id: "medellin",
    city: "Medellín",
    country: "Colombia",
    description: "Medellín has become a rising Latin American techno hub, with extended festival formats and a rapidly growing local ecosystem.",
    keyVenues: ["Baum Park", "Orquideorama", "Salón Amador"],
    keyFestivals: ["Freedom Festival", "Baum Festival", "Dreaming Festival"],
    culture: "Relentless energy—techno under tropical night skies."
  },
  {
    id: "mexico-city",
    city: "Mexico City",
    country: "Mexico",
    description: "A diverse, fast-growing underground spanning warehouses to rooftops, with strong queer participation and wide stylistic range.",
    keyVenues: ["Fünk Club", "Brutal (Pervert)", "Bar Oriente", "Departamento"],
    keyCollectives: ["Pervert", "N.A.A.F.I", "Capricho"],
    culture: "Extreme diversity—techno fused with local identity and community."
  }
];

// Helper functions
export const getCityById = (id: string): TechnoCity | undefined => 
  technoCities.find(city => city.id === id);

export const getCitiesByCountry = (country: string): TechnoCity[] => 
  technoCities.filter(city => city.country.toLowerCase() === country.toLowerCase());

export const getCitiesByRegion = (region: 'europe' | 'asia' | 'americas'): TechnoCity[] => {
  const regionMap: Record<string, string[]> = {
    europe: ['Germany', 'United Kingdom', 'Netherlands', 'Georgia'],
    asia: ['Japan'],
    americas: ['USA', 'Argentina', 'Colombia', 'Mexico']
  };
  return technoCities.filter(city => regionMap[region]?.includes(city.country));
};
