export interface Crew {
  id: string;
  name: string;
  city: string;
  country: string;
  founded?: number;
  active: boolean;
  type: 'sound system' | 'collective' | 'party series' | 'rave crew';
  tags: string[];
  description?: string;
  soundSystem?: string;
  members?: string[];
  ideology?: string;
}

export const crews: Crew[] = [
  {
    id: "underground-resistance-crew",
    name: "Underground Resistance",
    city: "Detroit",
    country: "USA",
    founded: 1989,
    active: true,
    type: "collective",
    tags: ["Detroit", "revolutionary", "anonymous", "militant"],
    description: "The masked collective. Anti-corporate, pro-community. More than music—a movement.",
    ideology: "Fight the power. Protect the underground. No compromise with the mainstream.",
    members: ["Mad Mike Banks", "Jeff Mills (1989-1992)", "Robert Hood (1989-1992)"]
  },
  {
    id: "sandwell-district",
    name: "Sandwell District",
    city: "Birmingham",
    country: "UK",
    founded: 2002,
    active: false,
    type: "collective",
    tags: ["Birmingham", "industrial", "anonymous", "dark"],
    description: "Anonymous collective bridging Birmingham and Berlin. Industrial techno refined to its essence.",
    members: ["Regis", "Female", "Silent Servant"],
    ideology: "Anonymity. Function over form. The music speaks."
  },
  {
    id: "spiral-tribe",
    name: "Spiral Tribe",
    city: "London",
    country: "UK",
    founded: 1990,
    active: true,
    type: "sound system",
    tags: ["free party", "travelers", "political", "legendary"],
    description: "The crew that sparked the Criminal Justice Act. Free party legends.",
    soundSystem: "Custom-built rig, constantly evolving",
    ideology: "Free parties. Free music. Free people. No borders."
  },
  {
    id: "teknival",
    name: "Teknival Movement",
    city: "Various",
    country: "France",
    founded: 1993,
    active: true,
    type: "rave crew",
    tags: ["free party", "outdoor", "massive", "European"],
    description: "Pan-European free party movement. Tens of thousands gather in fields.",
    ideology: "Music is free. The rave is free. Everyone is welcome."
  },
  {
    id: "mord-crew",
    name: "Mord Crew",
    city: "Rotterdam",
    country: "Netherlands",
    founded: 2014,
    active: true,
    type: "collective",
    tags: ["hard techno", "industrial", "Dutch", "uncompromising"],
    description: "The hardest edge of Dutch techno. No softness allowed.",
    members: ["Bas Mooy", "The crew rotates"]
  },
  {
    id: "bassiani-crew",
    name: "Bassiani Collective",
    city: "Tbilisi",
    country: "Georgia",
    founded: 2014,
    active: true,
    type: "collective",
    tags: ["Georgian", "political", "resistance", "community"],
    description: "More than a club—a movement. Symbol of Georgian youth resistance against oppression.",
    ideology: "Dance is protest. The club is sanctuary. Solidarity."
  },
  {
    id: "future-terror",
    name: "Future Terror",
    city: "Chiba",
    country: "Japan",
    founded: 2003,
    active: true,
    type: "party series",
    tags: ["Japanese", "hypnotic", "DJ Nobu", "marathon"],
    description: "DJ Nobu's party series. 12+ hour journeys into the hypnotic.",
    members: ["DJ Nobu"],
    ideology: "Deep listening. No shortcuts. The journey is the destination."
  },
  {
    id: "elements",
    name: "Elements",
    city: "Birmingham",
    country: "UK",
    founded: 2013,
    active: true,
    type: "party series",
    tags: ["Birmingham", "Rebekah", "equality", "community"],
    description: "Rebekah's party series promoting equality and diversity in techno.",
    members: ["Rebekah"],
    ideology: "Equality. Diversity. Community. Techno for all."
  },
  {
    id: "decon-recon",
    name: "Decon/Recon",
    city: "London",
    country: "UK",
    founded: 2015,
    active: true,
    type: "party series",
    tags: ["industrial", "Paula Temple", "noise", "experimental"],
    description: "Paula Temple's deconstructed techno events. Industrial. Experimental. Intense.",
    members: ["Paula Temple"]
  },
  {
    id: "polegroup-crew",
    name: "PoleGroup Collective",
    city: "Madrid",
    country: "Spain",
    founded: 2006,
    active: true,
    type: "collective",
    tags: ["Spanish", "hypnotic", "Oscar Mulero", "deep"],
    description: "Spanish techno collective centered around Oscar Mulero's vision.",
    members: ["Oscar Mulero", "Exium", "Reeko", "Lewis Fautzi"]
  },
  {
    id: "clermont-music",
    name: "Clermont Music",
    city: "Detroit",
    country: "USA",
    founded: 2017,
    active: true,
    type: "collective",
    tags: ["Detroit", "new generation", "diverse", "community"],
    description: "New generation Detroit collective. Keeping the tradition alive while pushing forward."
  },
  {
    id: "mutekx",
    name: "MUTEK",
    city: "Montreal",
    country: "Canada",
    founded: 1999,
    active: true,
    type: "collective",
    tags: ["audiovisual", "experimental", "global", "festival"],
    description: "Global collective presenting audiovisual electronic music. Festival and community.",
    ideology: "Art and technology. Sound and image. Forward thinking."
  }
];

export const getCrewById = (id: string) => crews.find(c => c.id === id);
export const getCrewsByCountry = (country: string) => crews.filter(c => c.country === country);
export const getCrewsByType = (type: Crew['type']) => crews.filter(c => c.type === type);
export const getActiveCrews = () => crews.filter(c => c.active);
