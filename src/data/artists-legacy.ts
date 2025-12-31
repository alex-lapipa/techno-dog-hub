export interface ImageAttribution {
  url: string;
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  sourceName: string;
}

export interface Artist {
  id: string;
  name: string;
  realName?: string;
  city: string;
  country: string;
  region: string;
  active: string;
  tags: string[];
  bio: string;
  photoUrl?: string;
  image?: ImageAttribution;
  labels?: string[];
  collaborators?: string[];
  influences?: string[];
  crews?: string[];
  // Career highlights
  careerHighlights?: string[];
  // Key releases
  keyReleases?: {
    title: string;
    label: string;
    year: number;
    format: string;
  }[];
  // Gear & Rider
  studioGear?: string[];
  liveSetup?: string[];
  djSetup?: string[];
  riderNotes?: string;
  // RAG enriched fields
  knownFor?: string;
  topTracks?: string[];
  subgenres?: string[];
  rank?: number;
  nationality?: string;
}

export const artists: Artist[] = [
  // ═══════════════════════════════════════════════════════════════
  // NORTH AMERICA
  // ═══════════════════════════════════════════════════════════════
  
  // DETROIT
  {
    id: "jeff-mills",
    name: "Jeff Mills",
    city: "Detroit",
    country: "USA",
    region: "North America",
    active: "1985–present",
    tags: ["Detroit", "minimal", "sci-fi", "TR-909", "three-deck"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/52/Jeff_Mills_2010.jpg",
      author: "Basic Sounds",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Jeff_Mills_2010.jpg",
      sourceName: "Wikimedia Commons"
    },
    bio: "The Wizard. Co-founder of Underground Resistance. Pioneer of minimal techno and the three-deck technique. His work transcends dance music into cinematic and orchestral territories. Mills has performed with symphony orchestras worldwide and continues to push the boundaries of what techno can be.",
    labels: ["Axis", "Underground Resistance", "Purpose Maker", "Tomorrow"],
    careerHighlights: [
      "Co-founded Underground Resistance in 1989",
      "Created the three-deck DJ technique",
      "Performed with Montpellier Philharmonic Orchestra",
      "Scored Fritz Lang's 'Metropolis' restoration",
      "Axis Records operating since 1992"
    ],
    keyReleases: [
      { title: "The Bells", label: "Purpose Maker", year: 1997, format: "12\"" },
      { title: "Waveform Transmission Vol. 1", label: "Tresor", year: 1992, format: "LP" },
      { title: "Exhibitionist", label: "React", year: 2004, format: "DVD" },
      { title: "Moon: The Area of Influence", label: "Axis", year: 2019, format: "LP" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TR-808",
      "Roland TB-303",
      "Technics SL-1200",
      "Custom modular synthesizers"
    ],
    liveSetup: [
      "Three Technics SL-1200MK2 turntables",
      "Pioneer DJM-900NXS2",
      "Roland TR-909 (live)",
      "Custom MIDI controllers"
    ],
    djSetup: [
      "Three Technics SL-1200MK2",
      "Pioneer DJM-900NXS2 or Allen & Heath Xone:92"
    ],
    riderNotes: "Requires three turntables. No CDJs. Prefers minimal lighting."
  },
  {
    id: "robert-hood",
    name: "Robert Hood",
    city: "Detroit",
    country: "USA",
    region: "North America",
    active: "1990–present",
    tags: ["minimal", "Detroit", "stripped-down", "M-Plant"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Robert_Hood_Live_%40_Kennedys%2C_Dublin%2C_Ireland_2009.JPG",
      author: "Ventolin",
      license: "CC BY-SA 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Robert_Hood_Live_@_Kennedys,_Dublin,_Ireland_2009.JPG",
      sourceName: "Wikimedia Commons"
    },
    bio: "The Godfather of Minimal Techno. Original member of Underground Resistance. Creator of the Minimal Nation concept that defined an entire genre. His stripped-down approach to production influenced generations of producers worldwide.",
    labels: ["M-Plant", "Hardwax", "Tresor", "Dekmantel"],
    careerHighlights: [
      "Co-founded Underground Resistance",
      "Created 'Minimal Nation' defining minimal techno",
      "M-Plant Records since 1994",
      "Floorplan project for deeper spiritual techno",
      "Berghain residency"
    ],
    keyReleases: [
      { title: "Minimal Nation", label: "M-Plant", year: 1994, format: "LP" },
      { title: "Internal Empire", label: "M-Plant", year: 1994, format: "LP" },
      { title: "Paradygm Shift", label: "Floorplan", year: 2013, format: "LP" },
      { title: "Never Grow Old", label: "M-Plant", year: 2015, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TR-808",
      "Roland Juno-106",
      "Sequential Circuits Prophet-5",
      "Akai MPC3000"
    ],
    liveSetup: [
      "Native Instruments Traktor",
      "Pioneer CDJ-3000s",
      "Custom Ableton Live setup"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup. Prefers dark, industrial venues."
  },
  {
    id: "underground-resistance",
    name: "Underground Resistance",
    city: "Detroit",
    country: "USA",
    region: "North America",
    active: "1989–present",
    tags: ["Detroit", "militant", "anonymous", "revolutionary"],
    // No photoUrl - UR maintains anonymity
    bio: "More than artists—a movement. The masked revolutionaries of Detroit techno. Anti-corporate, pro-community. Their sonic warfare approach created a template for artistic resistance through electronic music.",
    labels: ["Underground Resistance"],
    careerHighlights: [
      "Founded by Mike Banks, Jeff Mills, Robert Hood in 1989",
      "Created the 'sonic warfare' concept",
      "Galaxy 2 Galaxy orchestral project",
      "Timeline parties series",
      "Submerge distribution center in Detroit"
    ],
    keyReleases: [
      { title: "The Final Frontier", label: "Underground Resistance", year: 1991, format: "12\"" },
      { title: "World 2 World", label: "Underground Resistance", year: 1992, format: "12\"" },
      { title: "Galaxy 2 Galaxy", label: "Underground Resistance", year: 2005, format: "LP" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TR-808",
      "Roland TB-303",
      "Korg MS-20",
      "Oberheim OB-8"
    ],
    liveSetup: [
      "Full band setup with synthesizers",
      "Multiple drummers and percussionists",
      "Custom light show with masks"
    ],
    djSetup: [
      "Vinyl only",
      "Technics SL-1200MK2"
    ],
    riderNotes: "Vinyl only. No photos during performance. Masks required for all members."
  },

  // NEW YORK
  {
    id: "rrose",
    name: "Rrose",
    city: "New York",
    country: "USA",
    region: "North America",
    active: "2011–present",
    tags: ["experimental", "optical", "Eaux", "cerebral", "modular"],
    // No photoUrl - requires licensed image
    bio: "Exploring techno's outer reaches through optical illusions and experimental sound design. Rrose's approach to production and performance is deeply cerebral, creating immersive sonic experiences that challenge perception.",
    labels: ["Eaux", "Sandwell District", "Stroboscopic Artefacts"],
    careerHighlights: [
      "Founded Eaux Records",
      "Former Sandwell District member",
      "Berghain regular",
      "Optical sound installations",
      "Collaboration with Lucy"
    ],
    keyReleases: [
      { title: "Merchant of Salt", label: "Eaux", year: 2015, format: "LP" },
      { title: "Please Touch", label: "Stroboscopic Artefacts", year: 2014, format: "12\"" },
      { title: "Having Never Written a Note for Percussion", label: "Eaux", year: 2018, format: "LP" }
    ],
    studioGear: [
      "Eurorack modular system",
      "Serge modular",
      "Buchla Music Easel",
      "Sequential Circuits Prophet-5",
      "Custom Csound patches"
    ],
    liveSetup: [
      "Modular synthesizer",
      "Custom Max/MSP patches",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-2000NXS2",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Prefers analog mixer. Extended sets preferred."
  },
  {
    id: "d-dan",
    name: "D.Dan",
    city: "New York",
    country: "USA",
    region: "North America",
    active: "2014–present",
    tags: ["NYC", "hypnotic", "Bossa Nova Civic Club", "deep"],
    // No photoUrl - requires licensed image
    bio: "NYC-based selector. Deep, hypnotic selections that bridge the New York underground with global techno. Resident at Bossa Nova Civic Club. Co-founder of The Bunker New York.",
    labels: ["The Bunker New York"],
    careerHighlights: [
      "Resident at Bossa Nova Civic Club",
      "The Bunker New York co-founder",
      "Tokyo and Berlin touring",
      "Marathon sets specialty"
    ],
    keyReleases: [
      { title: "NYC Underground Edits", label: "The Bunker New York", year: 2019, format: "12\"" }
    ],
    studioGear: [
      "Elektron Digitakt",
      "Roland TR-8S",
      "Korg Minilogue XD"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:96"
    ],
    riderNotes: "Prefers Allen & Heath mixers. Extended sets preferred."
  },

  // ═══════════════════════════════════════════════════════════════
  // EUROPE
  // ═══════════════════════════════════════════════════════════════

  // GERMANY - BERLIN (Spanish-born)
  {
    id: "kwartz",
    name: "Kwartz",
    realName: "Mario Campos",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2011–present",
    tags: ["Spanish", "dark", "hypnotic", "industrial", "PoleGroup"],
    // No photoUrl - requires licensed image
    bio: "Real name Mario Campos. Born in Madrid 1989, now Berlin-based. Member of PoleGroup. His dark, hypnotic industrial techno drew attention from leading names in the scene. Released split EP with Exium in 2013.",
    labels: ["PoleGroup", "Planet Rhythm", "Mord"],
    careerHighlights: [
      "PoleGroup member since 2013",
      "Split EP with Exium - Fenomen",
      "Berghain debut 2018",
      "Berlin-based producer"
    ],
    keyReleases: [
      { title: "Systematic Oppression", label: "PoleGroup", year: 2017, format: "12\"" },
      { title: "Industria", label: "Mord", year: 2019, format: "12\"" },
      { title: "Control Mental", label: "Planet Rhythm", year: 2020, format: "12\"" }
    ],
    studioGear: [
      "Elektron Analog Four",
      "Roland TR-909",
      "Korg MS-20",
      "Ableton Live"
    ],
    liveSetup: [
      "Elektron Analog Rytm",
      "Elektron Analog Four",
      "Pioneer DJM-900NXS2"
    ],
    djSetup: [
      "Pioneer CDJ-2000NXS2",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup. Dark venue preferred."
  },

  // UK - BIRMINGHAM
  {
    id: "surgeon",
    name: "Surgeon",
    realName: "Anthony Child",
    city: "Birmingham",
    country: "UK",
    region: "Europe",
    active: "1994–present",
    tags: ["industrial", "Birmingham sound", "hardware", "modular", "Downwards"],
    knownFor: "The Birmingham Blueprint",
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Surgeon_%28Anthony_Child%29.jpg",
      author: "Ali Wade",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Surgeon_(Anthony_Child).jpg",
      sourceName: "Wikimedia Commons"
    },
    bio: "Pioneer of the Birmingham techno sound alongside Regis. Known for his 'surgical' precision and industrial textures. Co-founded Downwards Records, defining the raw industrial techno aesthetic. His modular synthesizer performances are legendary.",
    labels: ["Downwards", "Dynamic Tension", "SRX", "Tresor", "Blueprint"],
    collaborators: ["Regis", "Lady Starlight", "British Murder Boys"],
    topTracks: ["Magneze", "Bad Hands", "La Real"],
    careerHighlights: [
      "Co-founded Birmingham techno scene with Regis",
      "British Murder Boys with Regis",
      "Co-founded Downwards Records",
      "Dynamic Tension label",
      "Tresor resident since 1990s",
      "Extended modular live sets"
    ],
    keyReleases: [
      { title: "Force + Form", label: "Tresor", year: 1999, format: "LP" },
      { title: "Breaking the Frame", label: "Tresor", year: 1998, format: "LP" },
      { title: "Luminosity Device", label: "Dynamic Tension", year: 2010, format: "LP" },
      { title: "From Farthest Known Objects", label: "Dynamic Tension", year: 2020, format: "LP" }
    ],
    studioGear: [
      "Eurorack modular system (extensive)",
      "Serge modular",
      "Roland System 100m",
      "Roland TR-909",
      "Sequential Circuits Pro-One"
    ],
    liveSetup: [
      "Eurorack modular system",
      "Elektron Analog Four",
      "Custom MIDI controllers",
      "No laptop - fully hardware"
    ],
    djSetup: [
      "Technics SL-1200",
      "Pioneer CDJ-2000NXS2",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Extended sets only (4+ hours). Prefers analog mixer. Dark, minimal lighting."
  },
  {
    id: "regis",
    name: "Regis",
    realName: "Karl O'Connor",
    city: "Birmingham",
    country: "UK",
    region: "Europe",
    active: "1991–present",
    tags: ["industrial", "Birmingham", "Sandwell District", "dark", "Downwards"],
    knownFor: "The Birmingham Architect",
    bio: "Co-founded Downwards Records with Surgeon, defining the industrial sound of Birmingham. Later formed the legendary Sandwell District collective. His productions are raw, uncompromising, and deeply influential in the industrial techno movement.",
    labels: ["Downwards", "Sandwell District", "Blackest Ever Black"],
    collaborators: ["Surgeon", "Female", "Silent Servant"],
    topTracks: ["Speak to Me", "Blood Witness", "Application of Language"],
    careerHighlights: [
      "Founded Downwards Records 1993",
      "British Murder Boys with Surgeon",
      "Sandwell District collective",
      "Berghain regular",
      "Defined industrial techno aesthetic"
    ],
    keyReleases: [
      { title: "Gymnastics", label: "Downwards", year: 1996, format: "LP" },
      { title: "Blood Politics", label: "Blackest Ever Black", year: 2013, format: "LP" },
      { title: "British Murder Boys - A1", label: "Downwards", year: 2007, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Korg MS-20",
      "Oberheim Matrix-1000",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-2000NXS2",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Prefers dark industrial venues. Extended sets."
  },
  {
    id: "paula-temple",
    name: "Paula Temple",
    city: "Birmingham",
    country: "UK",
    region: "Europe",
    active: "1998–present",
    tags: ["industrial", "noise", "Decon/Recon", "raw", "live"],
    // No photoUrl - requires licensed image
    bio: "Deconstructed approach to techno. Her Decon/Recon parties are legendary. Raw power meets precision engineering in both her DJ sets and live performances.",
    labels: ["R&S", "Noise Manifesto"],
    careerHighlights: [
      "Decon/Recon party series",
      "Noise Manifesto label",
      "Berghain regular",
      "Live hardware performances",
      "R&S Records artist"
    ],
    keyReleases: [
      { title: "Colonized", label: "R&S", year: 2014, format: "12\"" },
      { title: "Decon/Recon", label: "Noise Manifesto", year: 2019, format: "LP" }
    ],
    studioGear: [
      "Eurorack modular",
      "Nord Lead",
      "Roland TR-909",
      "Elektron Analog Rytm"
    ],
    liveSetup: [
      "Custom modular system",
      "Elektron Analog Rytm",
      "Nord Lead 4",
      "Pioneer DJM-900NXS2"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "High-quality sound system essential. No requests for commercial music."
  },
  {
    id: "rebekah",
    name: "Rebekah",
    city: "Birmingham",
    country: "UK",
    region: "Europe",
    active: "2011–present",
    tags: ["Birmingham", "driving", "Elements", "raw"],
    // No photoUrl - requires licensed image
    bio: "Founder of Elements series. Powerful voice for equality in the scene. Her DJ sets are renowned for their power and precision.",
    labels: ["CLR", "Soma", "Sleaze"],
    careerHighlights: [
      "Founded Elements party series",
      "Equality advocate in techno",
      "CLR resident",
      "Soma Records artist"
    ],
    keyReleases: [
      { title: "Fear Paralysis", label: "CLR", year: 2015, format: "LP" },
      { title: "Code Black", label: "Soma", year: 2019, format: "12\"" }
    ],
    studioGear: [
      "Elektron Analog Rytm",
      "Roland TR-8S",
      "Ableton Live",
      "Native Instruments Maschine"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },

  // UK - LONDON
  {
    id: "james-ruskin",
    name: "James Ruskin",
    city: "London",
    country: "UK",
    region: "Europe",
    active: "1994–present",
    tags: ["Blueprint", "UK", "deep", "hypnotic"],
    // No photoUrl - requires licensed image
    bio: "Founder of Blueprint Records. Defining the UK techno sound for three decades. His productions are deep, hypnotic, and meticulously crafted.",
    labels: ["Blueprint", "Tresor"],
    careerHighlights: [
      "Founded Blueprint Records 1996",
      "Tresor resident",
      "30 years defining UK techno",
      "Collaboration with Surgeon"
    ],
    keyReleases: [
      { title: "Into Submission", label: "Blueprint", year: 2011, format: "LP" },
      { title: "The Outsider", label: "Blueprint", year: 1997, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland SH-101",
      "Elektron Analog Four",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-2000NXS2",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Prefers analog mixer."
  },
  {
    id: "planetary-assault-systems",
    name: "Planetary Assault Systems",
    realName: "Luke Slater",
    city: "London",
    country: "UK",
    region: "Europe",
    active: "1993–present",
    tags: ["hypnotic", "relentless", "Ostgut Ton", "peak-time"],
    photoUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800",
    bio: "Luke Slater's techno alias. Relentless, hypnotic, designed for marathon sets. His productions are legendary for their rolling, unstoppable energy.",
    labels: ["Ostgut Ton", "Mote-Evolver", "Peacefrog"],
    careerHighlights: [
      "Founded Mote-Evolver label",
      "Berghain resident",
      "30+ years in techno",
      "LB Dub Corp alias"
    ],
    keyReleases: [
      { title: "The Messenger", label: "Peacefrog", year: 1998, format: "12\"" },
      { title: "Arc Angel", label: "Mote-Evolver", year: 2008, format: "LP" },
      { title: "Deep Fried in Japan", label: "Ostgut Ton", year: 2017, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Moog Sub 37",
      "Native Instruments Maschine",
      "Ableton Live"
    ],
    liveSetup: [
      "Custom Ableton Live setup",
      "Roland TR-8S",
      "Moog Sub 37"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Extended sets preferred. High-quality monitoring essential."
  },
  {
    id: "perc",
    name: "Perc",
    realName: "Ali Wells",
    city: "London",
    country: "UK",
    region: "Europe",
    active: "2004–present",
    tags: ["industrial", "Perc Trax", "modular", "noise"],
    photoUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
    bio: "Founder of Perc Trax. Platform for industrial and experimental techno. His productions blend noise, industrial sounds with relentless rhythms.",
    labels: ["Perc Trax", "Stroboscopic Artefacts"],
    collaborators: ["Truss"],
    careerHighlights: [
      "Founded Perc Trax 2004",
      "Truss collaboration",
      "Industrial techno pioneer",
      "Modular live performances"
    ],
    keyReleases: [
      { title: "Wicker & Steel", label: "Perc Trax", year: 2014, format: "LP" },
      { title: "Bitter Music", label: "Perc Trax", year: 2016, format: "LP" },
      { title: "Look What Your Love Has Done to Me", label: "Perc Trax", year: 2020, format: "12\"" }
    ],
    studioGear: [
      "Eurorack modular system",
      "Elektron Analog Rytm",
      "Roland TR-909",
      "Korg MS-20",
      "Ableton Live"
    ],
    liveSetup: [
      "Eurorack modular",
      "Elektron Analog Rytm",
      "Elektron Octatrack",
      "No laptop"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:96"
    ],
    riderNotes: "Prefers industrial venues. Extended sets."
  },
  {
    id: "blawan",
    name: "Blawan",
    realName: "Jamie Roberts",
    city: "Manchester",
    country: "UK",
    region: "Europe",
    active: "2010–present",
    tags: ["industrial", "modular", "Ternesc", "raw"],
    photoUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    bio: "Half of Karenn. Visceral, hardware-driven productions. Modular machines meet industrial grit. His live performances are legendary for their intensity.",
    labels: ["Ternesc", "R&S", "XL Recordings"],
    collaborators: ["Pariah", "Karenn"],
    careerHighlights: [
      "Karenn with Pariah",
      "Founded Ternesc label",
      "R&S Records breakthrough",
      "Hardware-only live sets"
    ],
    keyReleases: [
      { title: "Wet Will Always Dry", label: "R&S", year: 2016, format: "LP" },
      { title: "Why They Hide Their Bodies Under My Garage?", label: "R&S", year: 2012, format: "12\"" }
    ],
    studioGear: [
      "Eurorack modular (extensive)",
      "Roland TR-909",
      "Sequential Circuits Pro-One",
      "Elektron Analog Rytm"
    ],
    liveSetup: [
      "Modular synthesizers",
      "Elektron Analog Rytm",
      "Roland TR-8S",
      "No laptop"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:96"
    ],
    riderNotes: "Hardware only for live. Extended sets preferred."
  },
  {
    id: "karenn",
    name: "Karenn",
    city: "London",
    country: "UK",
    region: "Europe",
    active: "2011–present",
    tags: ["live", "hardware", "industrial", "raw"],
    photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    bio: "Blawan and Pariah's live hardware project. Uncompromising, improvised, raw. Their live sets are fully improvised using only hardware.",
    labels: ["Works The Long Nights", "Voam"],
    careerHighlights: [
      "Fully improvised hardware sets",
      "Works The Long Nights label",
      "Berghain regulars",
      "No studio tracks - only live recordings"
    ],
    keyReleases: [
      { title: "Grapefruit Regret", label: "Works The Long Nights", year: 2014, format: "12\"" }
    ],
    studioGear: [
      "Dual modular systems",
      "Elektron Analog Rytm x2",
      "Roland TR-909",
      "Sequential synthesizers"
    ],
    liveSetup: [
      "Two independent modular systems",
      "Elektron Analog Rytm x2",
      "Custom mixer setup",
      "Fully improvised"
    ],
    riderNotes: "Live hardware only. Large table setup required. Extended sets only."
  },
  {
    id: "manni-dee",
    name: "Manni Dee",
    city: "London",
    country: "UK",
    region: "Europe",
    active: "2012–present",
    tags: ["industrial", "EBM", "London", "dark"],
    photoUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800",
    bio: "Industrial and EBM-influenced techno from London. Raw, uncompromising sound that bridges industrial music with techno.",
    labels: ["Perc Trax", "Voitax"],
    careerHighlights: [
      "Perc Trax artist",
      "EBM techno fusion",
      "Fold London resident"
    ],
    keyReleases: [
      { title: "Industrial Complexx", label: "Perc Trax", year: 2018, format: "12\"" }
    ],
    studioGear: [
      "Elektron Digitakt",
      "Roland TR-8S",
      "Korg MS-20",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },

  // GERMANY - BERLIN
  {
    id: "marcel-dettmann",
    name: "Marcel Dettmann",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "1999–present",
    tags: ["Berghain", "hard", "industrial", "MDR"],
    photoUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
    bio: "Berghain resident since the club's inception. His label MDR defines the Berlin sound at its darkest. Extended sets that build and release tension over hours.",
    labels: ["MDR", "Ostgut Ton"],
    crews: ["Berghain"],
    careerHighlights: [
      "Berghain resident since 2004",
      "Founded MDR label",
      "Hard Wax record store",
      "Extended set specialist"
    ],
    keyReleases: [
      { title: "Dettmann", label: "Ostgut Ton", year: 2009, format: "LP" },
      { title: "Dettmann II", label: "Ostgut Ton", year: 2013, format: "LP" },
      { title: "Range", label: "MDR", year: 2011, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Moog Sub 37",
      "Native Instruments Maschine",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:96"
    ],
    riderNotes: "Extended sets only. Prefers Allen & Heath. Dark venue essential."
  },
  {
    id: "ben-klock",
    name: "Ben Klock",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2000–present",
    tags: ["Berghain", "driving", "dark", "Klockworks"],
    photoUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    bio: "Berghain resident and founder of Klockworks. Marathon sets that define the institution's sonic identity. His productions are dark, driving, and hypnotic.",
    labels: ["Klockworks", "Ostgut Ton"],
    crews: ["Berghain"],
    careerHighlights: [
      "Berghain resident since 2004",
      "Founded Klockworks label",
      "Marathon set specialist",
      "Global touring"
    ],
    keyReleases: [
      { title: "One", label: "Klockworks", year: 2006, format: "LP" },
      { title: "Before One", label: "Ostgut Ton", year: 2009, format: "LP" },
      { title: "Subzero", label: "Klockworks", year: 2015, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Korg MS-20",
      "Native Instruments",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:96"
    ],
    riderNotes: "Extended sets only (6+ hours preferred). Allen & Heath mixer required."
  },
  {
    id: "rodhad",
    name: "Rødhåd",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2009–present",
    tags: ["Dystopian", "dark", "hypnotic", "atmospheric"],
    photoUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800",
    bio: "Founder of Dystopian label and parties. Dark, atmospheric techno with a deeply hypnotic edge. His sets create immersive sonic landscapes.",
    labels: ["Dystopian", "Token"],
    careerHighlights: [
      "Founded Dystopian label 2012",
      "Dystopian parties series",
      "Berlin scene leader",
      "Token Records artist"
    ],
    keyReleases: [
      { title: "Anxious", label: "Dystopian", year: 2015, format: "LP" },
      { title: "1984", label: "Token", year: 2012, format: "12\"" }
    ],
    studioGear: [
      "Elektron Analog Rytm",
      "Elektron Analog Four",
      "Roland TR-909",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Dark atmospheric lighting essential."
  },
  {
    id: "ancient-methods",
    name: "Ancient Methods",
    realName: "Michael Wollenhaupt",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2008–present",
    tags: ["industrial", "ritual", "Persephonic Sirens", "dark"],
    photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    bio: "Ritualistic sound merging industrial, EBM, and techno. Persephonic Sirens label. His productions are dark, cinematic, and deeply evocative.",
    labels: ["Persephonic Sirens", "Hands"],
    careerHighlights: [
      "Founded Persephonic Sirens",
      "Ritualistic techno pioneer",
      "Industrial crossover artist",
      "Berghain regular"
    ],
    keyReleases: [
      { title: "The Jericho Records", label: "Persephonic Sirens", year: 2013, format: "LP" },
      { title: "First Method", label: "Hands", year: 2011, format: "LP" }
    ],
    studioGear: [
      "Modular synthesizers",
      "Roland TR-909",
      "Korg MS-20",
      "Field recordings"
    ],
    djSetup: [
      "Pioneer CDJ-2000NXS2",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Dark ritual atmosphere required."
  },
  {
    id: "phase-fatale",
    name: "Phase Fatale",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2012–present",
    tags: ["industrial", "EBM", "Ostgut Ton", "dark"],
    photoUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800",
    bio: "Industrial and EBM-influenced productions. Berghain regular. His sound bridges the worlds of industrial music and techno.",
    labels: ["Ostgut Ton", "Hospital Productions"],
    careerHighlights: [
      "Berghain resident",
      "Hospital Productions artist",
      "EBM-techno fusion",
      "Zusammen parties"
    ],
    keyReleases: [
      { title: "Scanning Backwards", label: "Ostgut Ton", year: 2019, format: "LP" },
      { title: "Reverse Fall", label: "Hospital Productions", year: 2017, format: "12\"" }
    ],
    studioGear: [
      "Sequential Prophet-6",
      "Roland TR-909",
      "Moog Sub 37",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:96"
    ],
    riderNotes: "Industrial venues preferred. Extended sets."
  },
  {
    id: "dasha-rush",
    name: "Dasha Rush",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2005–present",
    tags: ["experimental", "audiovisual", "Fullpanda", "avant-garde"],
    photoUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    bio: "Russian-born, Berlin-based. Exploring the outer reaches through audiovisual performance. Her work merges techno with visual art and experimental sound.",
    labels: ["Fullpanda", "Raster-Noton"],
    careerHighlights: [
      "Founded Fullpanda Records",
      "Audiovisual performances",
      "Raster-Noton artist",
      "Art installations"
    ],
    keyReleases: [
      { title: "Sleepstep", label: "Fullpanda", year: 2015, format: "LP" },
      { title: "Dark Hearts of Space", label: "Raster-Noton", year: 2018, format: "LP" }
    ],
    studioGear: [
      "Modular synthesizers",
      "Max/MSP",
      "Custom visual software",
      "Ableton Live"
    ],
    liveSetup: [
      "Custom audiovisual system",
      "Modular synthesizers",
      "Projection mapping"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Visual projection system required for live sets."
  },
  {
    id: "setaoc-mass",
    name: "Setaoc Mass",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2012–present",
    tags: ["hypnotic", "SK_eleven", "deep", "rolling"],
    photoUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800",
    bio: "Hypnotic, rolling techno. Founder of SK_eleven label. His productions are characterized by their relentless, hypnotic energy.",
    labels: ["SK_eleven", "Figure"],
    careerHighlights: [
      "Founded SK_eleven label",
      "Figure Records artist",
      "Hypnotic techno specialist"
    ],
    keyReleases: [
      { title: "Voight", label: "SK_eleven", year: 2017, format: "12\"" },
      { title: "Endless", label: "Figure", year: 2016, format: "12\"" }
    ],
    studioGear: [
      "Elektron Digitakt",
      "Roland TR-8S",
      "Korg Minilogue",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },
  {
    id: "vril",
    name: "Vril",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2011–present",
    tags: ["Giegling", "hypnotic", "deep", "minimal", "trance-inducing"],
    photoUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    bio: "Hypnotic, trance-inducing productions. Giegling affiliate. His sound is deeply hypnotic, creating transcendent dancefloor experiences.",
    labels: ["Giegling", "Dystopian"],
    careerHighlights: [
      "Giegling collective member",
      "Trance-inducing productions",
      "Extended set specialist"
    ],
    keyReleases: [
      { title: "Portal", label: "Giegling", year: 2016, format: "LP" },
      { title: "Torus", label: "Dystopian", year: 2015, format: "12\"" }
    ],
    studioGear: [
      "Elektron Analog Four",
      "Roland TR-909",
      "Moog Sub 37",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-2000NXS2",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Extended sets preferred. Dark hypnotic atmosphere."
  },
  {
    id: "spfdj",
    name: "SPFDJ",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2015–present",
    tags: ["hard", "EBM", "industrial", "Bassiani"],
    photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    bio: "Berlin-based selector. Hard-hitting sets blending industrial, EBM, and raw techno. Bassiani regular. Her sets are known for their intensity and diversity.",
    labels: ["Intrepid Skin"],
    careerHighlights: [
      "Bassiani resident",
      "Founded Intrepid Skin",
      "Berlin scene leader",
      "Hard industrial techno"
    ],
    keyReleases: [
      { title: "Intrepid Skin Compilation", label: "Intrepid Skin", year: 2020, format: "LP" }
    ],
    studioGear: [
      "Elektron Digitakt",
      "Roland TR-8S",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "High-quality monitoring essential."
  },
  {
    id: "hector-oaks",
    name: "Hector Oaks",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2014–present",
    tags: ["Bassiani", "KAOS", "driving", "raw"],
    photoUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800",
    bio: "Berlin-based. Founder of KAOS label. Driving, raw techno. Regular at Bassiani and across Europe's leading clubs.",
    labels: ["KAOS", "Bassiani Records"],
    careerHighlights: [
      "Founded KAOS label",
      "Bassiani resident",
      "Berlin scene leader"
    ],
    keyReleases: [
      { title: "KAOS 01", label: "KAOS", year: 2018, format: "12\"" }
    ],
    studioGear: [
      "Elektron Analog Rytm",
      "Roland TR-909",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },
  {
    id: "adriana-lopez",
    name: "Adriana Lopez",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2008–present",
    tags: ["hypnotic", "dark", "Semantica", "deep"],
    photoUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    bio: "Venezuelan-born, Berlin-based. Dark, hypnotic techno. Her productions are deep, atmospheric, and immersive.",
    labels: ["Semantica", "CLR"],
    careerHighlights: [
      "Semantica Records artist",
      "CLR artist",
      "Berlin scene leader"
    ],
    keyReleases: [
      { title: "Essence", label: "Semantica", year: 2016, format: "12\"" }
    ],
    studioGear: [
      "Elektron Analog Four",
      "Roland TR-909",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Dark venues preferred."
  },
  {
    id: "shdw-obscure-shape",
    name: "SHDW & Obscure Shape",
    city: "Stuttgart",
    country: "Germany",
    region: "Europe",
    active: "2014–present",
    tags: ["rave", "melodic", "German", "driving"],
    photoUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
    bio: "German duo. Rave-influenced techno with melodic elements. Their sound bridges 90s rave with contemporary techno.",
    labels: ["Arts", "Afterlife"],
    careerHighlights: [
      "Arts Records artists",
      "Rave revival sound",
      "German techno new wave"
    ],
    keyReleases: [
      { title: "Bohemian Rave", label: "Arts", year: 2019, format: "12\"" }
    ],
    studioGear: [
      "Roland TB-303",
      "Roland TR-909",
      "Korg M1",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },

  // GERMANY - HAMBURG
  {
    id: "helena-hauff",
    name: "Helena Hauff",
    city: "Hamburg",
    country: "Germany",
    region: "Europe",
    active: "2010–present",
    tags: ["electro", "acid", "hardware", "analog"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/5/57/Helena_Hauff_%40_Primavera_Sound_Festival%2C_Barcelona%2C_02.06.2016_%2836682200586%29_%28cropped%29.jpg",
      author: "deepskyobject",
      license: "CC BY-SA 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Helena_Hauff_@_Primavera_Sound_Festival,_Barcelona,_02.06.2016_(36682200586)_(cropped).jpg",
      sourceName: "Wikimedia Commons"
    },
    bio: "Hamburg's queen of electro and acid. Resident at Golden Pudel Club. Hardware-only performances. Uncompromising. Her vinyl sets are legendary for their energy and precision.",
    labels: ["Return to Disorder", "Ninja Tune", "Werkdiscs"],
    careerHighlights: [
      "Golden Pudel Club resident",
      "Founded Return to Disorder",
      "Vinyl-only sets",
      "BBC Radio 1 Essential Mix"
    ],
    keyReleases: [
      { title: "Discreet Desires", label: "Werkdiscs", year: 2015, format: "LP" },
      { title: "Qualm", label: "Ninja Tune", year: 2018, format: "LP" },
      { title: "Return to Disorder 01", label: "Return to Disorder", year: 2016, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Roland TR-808",
      "Korg MS-20",
      "Sequential Circuits Pro-One"
    ],
    liveSetup: [
      "Roland TR-909",
      "Roland TB-303",
      "Korg MS-20",
      "Sequential Pro-One",
      "No laptop"
    ],
    djSetup: [
      "Technics SL-1200MK2",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Vinyl only. Technics turntables required. Allen & Heath mixer preferred."
  },

  // NETHERLANDS
  {
    id: "dimi-angelis",
    name: "Dimi Angélis",
    city: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
    active: "2000–present",
    tags: ["Dutch", "Djax-Up-Beats", "hypnotic", "deep"],
    photoUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800",
    bio: "Dutch techno veteran. Part of the original Dutch scene. Deep, hypnotic productions that carry the spirit of the 90s Dutch techno movement.",
    labels: ["Djax-Up-Beats", "Figure"],
    careerHighlights: [
      "Djax-Up-Beats artist",
      "Dutch scene pioneer",
      "Extended set specialist"
    ],
    keyReleases: [
      { title: "Untitled", label: "Djax-Up-Beats", year: 2010, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Korg MS-20",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-2000NXS2",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Extended sets preferred."
  },
  {
    id: "jeroen-search",
    name: "Jeroen Search",
    city: "Rotterdam",
    country: "Netherlands",
    region: "Europe",
    active: "1996–present",
    tags: ["Dutch", "Search", "hypnotic", "deep"],
    photoUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800",
    bio: "Founder of Search label. Deep, hypnotic Dutch techno. His productions are characterized by their rolling, hypnotic grooves.",
    labels: ["Search", "Figure"],
    careerHighlights: [
      "Founded Search label",
      "Dutch techno pioneer",
      "25+ years in techno"
    ],
    keyReleases: [
      { title: "Motion EP", label: "Search", year: 2015, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Korg MS-20",
      "Elektron Analog Four",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },

  // SPAIN
  {
    id: "oscar-mulero",
    name: "Oscar Mulero",
    city: "Madrid",
    country: "Spain",
    region: "Europe",
    active: "1989–present",
    tags: ["Madrid", "PoleGroup", "hypnotic", "deep", "industrial", "The Omen"],
    knownFor: "Godfather of Spanish Techno",
    photoUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
    bio: "The most influential figure in Spanish techno since the 90s. His label Pole Group defined a generation. Resident at legendary clubs including The Omen. Connected Spain with the international techno circuit. Known for dark, hypnotic, industrial techno.",
    labels: ["PoleGroup", "Warm Up", "Semantica"],
    topTracks: ["Grey Fades to Green", "About Discipline and Education", "Black Propaganda"],
    careerHighlights: [
      "Co-founded PoleGroup",
      "Warm Up club Madrid",
      "The Omen residency",
      "35+ years in techno",
      "Spanish techno godfather",
      "Connected Spain to international techno circuit"
    ],
    keyReleases: [
      { title: "About Discipline and Education", label: "PoleGroup", year: 2013, format: "LP" },
      { title: "Grey Fades to Green", label: "Warm Up", year: 2018, format: "LP" },
      { title: "Black Propaganda", label: "PoleGroup", year: 2016, format: "LP" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Korg MS-20",
      "Moog Sub 37",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:96"
    ],
    riderNotes: "Extended sets only (6+ hours). Allen & Heath mixer required."
  },
  {
    id: "exium",
    name: "Exium",
    city: "Oviedo",
    country: "Spain",
    region: "Europe",
    active: "2003–present",
    tags: ["Spanish", "PoleGroup", "industrial", "driving"],
    photoUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800",
    bio: "Spanish duo. Industrial, driving techno. PoleGroup core. Their productions are powerful, relentless, and deeply influential.",
    labels: ["PoleGroup", "Nheoma"],
    careerHighlights: [
      "PoleGroup core artists",
      "Spanish techno leaders",
      "Industrial techno pioneers"
    ],
    keyReleases: [
      { title: "Expect Nothing", label: "PoleGroup", year: 2018, format: "LP" }
    ],
    studioGear: [
      "Roland TR-909",
      "Elektron Analog Rytm",
      "Korg MS-20",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "B2B sets preferred."
  },
  {
    id: "reeko",
    name: "Reeko",
    realName: "Juan Rico",
    city: "Madrid",
    country: "Spain",
    region: "Europe",
    active: "1997–present",
    tags: ["Spanish", "Mental Disorder", "dark", "industrial", "PoleGroup"],
    photoUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    bio: "Madrid veteran. Real name Juan Rico. Founder of Mental Disorder label. Part of the PoleGroup gang and Selección Natural collective. One of the most prolific Spanish producers since the late 90s with a signature dark, industrial sound.",
    labels: ["Mental Disorder", "PoleGroup"],
    careerHighlights: [
      "Founded Mental Disorder label",
      "Madrid scene veteran",
      "25+ years in techno"
    ],
    keyReleases: [
      { title: "Your Mind Is a War Zone", label: "Mental Disorder", year: 2016, format: "LP" }
    ],
    studioGear: [
      "Roland TR-909",
      "Elektron Analog Four",
      "Korg MS-20",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Dark venues preferred."
  },
  {
    id: "tensal",
    name: "Tensal",
    city: "Barcelona",
    country: "Spain",
    region: "Europe",
    active: "2010–present",
    tags: ["Spanish", "Semantica", "deep", "atmospheric"],
    photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    bio: "Barcelona-based producer. Deep, atmospheric techno. His sound is characterized by its depth and attention to sonic detail.",
    labels: ["Semantica", "Token"],
    careerHighlights: [
      "Semantica Records artist",
      "Token Records artist",
      "Barcelona scene leader"
    ],
    keyReleases: [
      { title: "Principles of Low", label: "Semantica", year: 2017, format: "LP" }
    ],
    studioGear: [
      "Elektron Analog Four",
      "Roland TR-8S",
      "Moog Sub 37",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },
  {
    id: "kike-pravda",
    name: "Kike Pravda",
    city: "Madrid",
    country: "Spain",
    region: "Europe",
    active: "2008–present",
    tags: ["Spanish", "Children of Tomorrow", "dark", "hypnotic"],
    photoUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800",
    bio: "Madrid-based. Founder of Children of Tomorrow label. Dark, hypnotic techno that bridges Spanish and German scenes.",
    labels: ["Children of Tomorrow", "PoleGroup"],
    careerHighlights: [
      "Founded Children of Tomorrow",
      "Madrid scene leader",
      "PoleGroup affiliate"
    ],
    keyReleases: [
      { title: "Lost in the Loop", label: "Children of Tomorrow", year: 2019, format: "12\"" }
    ],
    studioGear: [
      "Elektron Digitakt",
      "Roland TR-8S",
      "Korg Minilogue",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },
  {
    id: "psyk",
    name: "Psyk",
    city: "Madrid",
    country: "Spain",
    region: "Europe",
    active: "2005–present",
    tags: ["hypnotic", "Non Series", "Spanish", "deep", "cerebral"],
    photoUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800",
    bio: "Madrid-based. Founder of Non Series label. Hypnotic, cerebral techno. His productions are deep, intricate, and immersive.",
    labels: ["Non Series", "Mote-Evolver", "Blueprint"],
    careerHighlights: [
      "Founded Non Series label",
      "Mote-Evolver artist",
      "Blueprint Records artist"
    ],
    keyReleases: [
      { title: "Time Foundation", label: "Non Series", year: 2014, format: "LP" }
    ],
    studioGear: [
      "Elektron Analog Four",
      "Roland TR-909",
      "Moog Sub 37",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Extended sets preferred."
  },
  {
    id: "eulogio",
    name: "Eulogio",
    city: "Oviedo",
    country: "Spain",
    region: "Europe",
    active: "1995–present",
    tags: ["Spanish", "hypnotic", "deep", "Asturias", "La Real"],
    photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    bio: "Asturian techno pioneer from Oviedo. A foundational figure at La Real, the legendary club that shaped Oviedo's electronic music scene in the late '90s and 2000s. His deep, hypnotic selections carry decades of crate-digging wisdom and an uncompromising dedication to underground sound. Eulogio bridges the classic and contemporary, bringing northern Spain's raw, honest approach to techno to dancefloors across the country.",
    labels: ["PoleGroup", "Semantica"],
    careerHighlights: [
      "Resident and key figure at La Real, Oviedo",
      "Asturian techno scene pioneer since mid-'90s",
      "PoleGroup affiliate",
      "25+ years in Spanish underground techno",
      "Deep selector bridging old-school and contemporary sounds"
    ],
    keyReleases: [
      { title: "Asturias Sessions", label: "PoleGroup", year: 2018, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Korg MS-20",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Extended sets preferred. Analog mixer."
  },
  {
    id: "men",
    name: "M.E.N",
    city: "Barcelona",
    country: "Spain",
    region: "Europe",
    active: "2010–present",
    tags: ["Spanish", "Barcelona", "Moog", "hypnotic", "deep"],
    photoUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800",
    bio: "Barcelona-based. Resident at Moog Barcelona—the city's legendary basement club. His sets are deep, hypnotic, and perfectly tailored for intimate spaces. A key figure in the Catalan techno scene.",
    labels: ["Moog Barcelona"],
    careerHighlights: [
      "Moog Barcelona resident",
      "Barcelona scene leader",
      "Intimate club specialist",
      "Catalan techno ambassador"
    ],
    keyReleases: [
      { title: "Basement Sessions", label: "Moog Barcelona", year: 2019, format: "12\"" }
    ],
    studioGear: [
      "Elektron Digitakt",
      "Roland TR-8S",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-2000NXS2",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup. Intimate venues preferred."
  },

  // FRANCE
  {
    id: "anetha",
    name: "Anetha",
    city: "Paris",
    country: "France",
    region: "Europe",
    active: "2014–present",
    tags: ["acid", "tribal", "Mama Told Ya", "French"],
    photoUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    bio: "Paris-based. Founder of Mama Told Ya collective. Acid-laced, tribal-influenced techno. Her productions are raw, energetic, and deeply rhythmic.",
    labels: ["MYT", "Possession"],
    careerHighlights: [
      "Founded Mama Told Ya collective",
      "Possession Records artist",
      "French techno leader"
    ],
    keyReleases: [
      { title: "Mama Told Ya 01", label: "MYT", year: 2017, format: "12\"" },
      { title: "Bitten EP", label: "Possession", year: 2019, format: "12\"" }
    ],
    studioGear: [
      "Roland TB-303",
      "Roland TR-909",
      "Elektron Digitakt",
      "Ableton Live"
    ],
    liveSetup: [
      "Roland TB-303",
      "Elektron Digitakt",
      "Pioneer DJM-900NXS2"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },
  {
    id: "i-hate-models",
    name: "I Hate Models",
    city: "Paris",
    country: "France",
    region: "Europe",
    active: "2015–present",
    tags: ["emotional", "dark", "rave", "French"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/b/be/I_Hate_Models_Contours.png",
      author: "Charlestpt",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:I_Hate_Models_Contours.png",
      sourceName: "Wikimedia Commons"
    },
    bio: "French producer. Dark emotional techno. Early work only—pre-festival era. His productions blend rave nostalgia with modern intensity.",
    labels: ["Arts", "Voitax"],
    careerHighlights: [
      "Arts Records artist",
      "Voitax Records artist",
      "Dark emotional techno pioneer"
    ],
    keyReleases: [
      { title: "Daydream", label: "Arts", year: 2018, format: "LP" },
      { title: "Abstract Hell", label: "Voitax", year: 2019, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Korg M1",
      "Roland JP-8000",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },
  {
    id: "hadone",
    name: "Hadone",
    city: "Paris",
    country: "France",
    region: "Europe",
    active: "2016–present",
    tags: ["hard", "French", "industrial", "raw"],
    photoUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800",
    bio: "French producer. Hard, industrial techno. His productions are relentless, powerful, and uncompromising.",
    labels: ["Arts", "Musik Is Solidarity"],
    careerHighlights: [
      "Arts Records artist",
      "Hard techno leader",
      "French scene leader"
    ],
    keyReleases: [
      { title: "Rave Culture", label: "Arts", year: 2019, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Elektron Analog Rytm",
      "Korg MS-20",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "High-powered sound system essential."
  },
  {
    id: "nico-moreno",
    name: "Nico Moreno",
    city: "Paris",
    country: "France",
    region: "Europe",
    active: "2018–present",
    tags: ["hard", "French", "raw", "uncompromising"],
    photoUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    bio: "French producer. Hard, uncompromising techno. Raw energy meets precision engineering.",
    labels: ["Music Is Solidarity"],
    careerHighlights: [
      "Hard techno new wave",
      "French scene leader"
    ],
    keyReleases: [
      { title: "Revolt", label: "Music Is Solidarity", year: 2020, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Elektron Digitakt",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "High-powered sound system essential."
  },

  // BELGIUM
  {
    id: "trym",
    name: "Trym",
    city: "Brussels",
    country: "Belgium",
    region: "Europe",
    active: "2016–present",
    tags: ["hard", "Belgian", "industrial", "raw"],
    photoUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800",
    bio: "Belgian producer. Hard, industrial techno. No compromise. His productions are powerful and relentless.",
    labels: ["KNTXT", "Mord"],
    careerHighlights: [
      "KNTXT artist",
      "Mord Records artist",
      "Belgian techno leader"
    ],
    keyReleases: [
      { title: "Immersion", label: "KNTXT", year: 2019, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Elektron Analog Rytm",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Standard Pioneer setup."
  },

  // ITALY
  {
    id: "999999999",
    name: "999999999",
    city: "Venice",
    country: "Italy",
    region: "Europe",
    active: "2015–present",
    tags: ["acid", "hard", "NineTimesNine", "raw", "industrial"],
    photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    bio: "Venetian duo reshaping hard techno. Raw, acid-fused productions with industrial intensity. Known for building scenes in challenging cities like Venice. Their live hardware performances with multiple TB-303s are legendary.",
    labels: ["NineTimesNine", "Mord"],
    careerHighlights: [
      "Founded NineTimesNine label",
      "Live hardware performances",
      "Italian techno leaders"
    ],
    keyReleases: [
      { title: "Ritual", label: "NineTimesNine", year: 2018, format: "12\"" }
    ],
    studioGear: [
      "Roland TB-303 x3",
      "Roland TR-909",
      "Roland TR-808",
      "Elektron Analog Rytm"
    ],
    liveSetup: [
      "Roland TB-303 x3",
      "Roland TR-909",
      "Roland TR-808",
      "Custom MIDI controllers"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Live setup requires large table. Extended sets preferred."
  },
  {
    id: "onyvaa",
    name: "Onyvaa",
    city: "Rome",
    country: "Italy",
    region: "Europe",
    active: "2016–present",
    tags: ["Italian", "hypnotic", "rolling", "deep"],
    photoUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    bio: "Italian selector. Hypnotic, rolling techno. Her sets are known for their depth and groove.",
    labels: ["Soma", "Clergy"],
    careerHighlights: [
      "Soma Records artist",
      "Clergy Records artist",
      "Italian techno leader"
    ],
    keyReleases: [
      { title: "Groove EP", label: "Soma", year: 2019, format: "12\"" }
    ],
    studioGear: [
      "Elektron Digitakt",
      "Roland TR-8S",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },
  {
    id: "neel",
    name: "Neel",
    city: "Rome",
    country: "Italy",
    region: "Europe",
    active: "2005–present",
    tags: ["Italian", "Spazio Disponibile", "hypnotic", "deep"],
    photoUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800",
    bio: "Italian producer. Co-runs Spazio Disponibile with Donato Dozzy. Deep, hypnotic productions.",
    labels: ["Spazio Disponibile", "Stroboscopic Artefacts"],
    careerHighlights: [
      "Spazio Disponibile co-founder",
      "Stroboscopic Artefacts artist",
      "Hypnotic techno pioneer"
    ],
    keyReleases: [
      { title: "Phobos", label: "Spazio Disponibile", year: 2016, format: "LP" }
    ],
    studioGear: [
      "Modular synthesizers",
      "Roland TR-909",
      "Korg MS-20",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Extended sets preferred."
  },
  {
    id: "donato-dozzy",
    name: "Donato Dozzy",
    city: "Rome",
    country: "Italy",
    region: "Europe",
    active: "1995–present",
    tags: ["hypnotic", "dub", "Spazio Disponibile", "Labyrinth"],
    photoUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
    bio: "Master of hypnotic techno. His Labyrinth parties in Japan are legendary. Deep, dub-influenced productions that create transcendent experiences.",
    labels: ["Spazio Disponibile", "Tresor", "Further"],
    careerHighlights: [
      "Labyrinth festival Japan",
      "Spazio Disponibile founder",
      "30+ years in techno",
      "Hypnotic techno godfather"
    ],
    keyReleases: [
      { title: "Plays Bee Mask", label: "Spectrum Spools", year: 2013, format: "LP" },
      { title: "K", label: "Further", year: 2016, format: "LP" }
    ],
    studioGear: [
      "Modular synthesizers",
      "Roland Space Echo",
      "Korg MS-20",
      "Moog Sub 37"
    ],
    liveSetup: [
      "Modular synthesizers",
      "Roland Space Echo",
      "Custom effects chains"
    ],
    djSetup: [
      "Pioneer CDJ-2000NXS2",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Extended sets only (4+ hours). Analog effects essential."
  },
  {
    id: "boston-168",
    name: "Boston 168",
    city: "Milan",
    country: "Italy",
    region: "Europe",
    active: "2013–present",
    tags: ["Italian", "acid", "rave", "energetic"],
    photoUrl: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=800",
    bio: "Italian duo. Acid-laced, rave-influenced techno. Their productions are energetic and nostalgic.",
    labels: ["Involve", "Lobster Theremin"],
    careerHighlights: [
      "Acid rave revival",
      "Italian scene leaders"
    ],
    keyReleases: [
      { title: "Acid Dream", label: "Involve", year: 2018, format: "12\"" }
    ],
    studioGear: [
      "Roland TB-303",
      "Roland TR-909",
      "Korg M1",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },

  // POLAND
  {
    id: "vtss",
    name: "VTSS",
    realName: "Martyna Maja",
    city: "Warsaw",
    country: "Poland",
    region: "Europe",
    active: "2015–present",
    tags: ["Polish", "hard", "industrial", "driving", "maximalist"],
    photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    bio: "Techno maximalist. Real name Martyna Maja. High-octane club rhythms maestro from Poland. A key figure in Poland's techno scene with relentless, driving sets.",
    labels: ["VTSS", "Perc Trax"],
    careerHighlights: [
      "Perc Trax artist",
      "Polish techno leader",
      "Instytut resident"
    ],
    keyReleases: [
      { title: "Self-titled EP", label: "Perc Trax", year: 2019, format: "12\"" }
    ],
    studioGear: [
      "Elektron Analog Rytm",
      "Roland TR-8S",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Standard Pioneer setup."
  },

  // UKRAINE
  {
    id: "yan-cook",
    name: "Yan Cook",
    city: "Kyiv",
    country: "Ukraine",
    region: "Europe",
    active: "2012–present",
    tags: ["Ukrainian", "Horo", "hypnotic", "deep"],
    photoUrl: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=800",
    bio: "Ukrainian producer. Co-founder of Horo label. Deep, hypnotic productions from Kyiv.",
    labels: ["Horo", "Semantica"],
    careerHighlights: [
      "Co-founded Horo label",
      "Ukrainian techno pioneer",
      "Semantica artist"
    ],
    keyReleases: [
      { title: "Horo 01", label: "Horo", year: 2016, format: "12\"" }
    ],
    studioGear: [
      "Elektron Analog Four",
      "Roland TR-909",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },

  // RUSSIA
  {
    id: "rikhter",
    name: "RIKHTER",
    city: "St. Petersburg",
    country: "Russia",
    region: "Europe",
    active: "2015–present",
    tags: ["Russian", "hypnotic", "atmospheric", "deep"],
    photoUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    bio: "Russian producer. Hypnotic, atmospheric techno from St. Petersburg. His sound is deeply immersive.",
    labels: ["Dystopian", "Northern Electronics"],
    careerHighlights: [
      "Dystopian Records artist",
      "Northern Electronics artist",
      "Russian scene leader"
    ],
    keyReleases: [
      { title: "Put EP", label: "Dystopian", year: 2018, format: "12\"" }
    ],
    studioGear: [
      "Elektron Analog Four",
      "Korg MS-20",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Dark atmospheric venues preferred."
  },

  // PORTUGAL
  {
    id: "lewis-fautzi",
    name: "Lewis Fautzi",
    city: "Porto",
    country: "Portugal",
    region: "Europe",
    active: "2011–present",
    tags: ["Portuguese", "hypnotic", "Faut Section", "driving"],
    photoUrl: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800",
    bio: "Portuguese producer. Founder of Faut Section. Hypnotic, driving techno from Porto.",
    labels: ["Faut Section", "PoleGroup", "Token"],
    careerHighlights: [
      "Founded Faut Section label",
      "PoleGroup affiliate",
      "Token Records artist"
    ],
    keyReleases: [
      { title: "Controlled Processes", label: "Faut Section", year: 2017, format: "LP" }
    ],
    studioGear: [
      "Elektron Analog Rytm",
      "Roland TR-909",
      "Moog Sub 37",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  },

  // ═══════════════════════════════════════════════════════════════
  // ASIA
  // ═══════════════════════════════════════════════════════════════

  // JAPAN
  {
    id: "dj-nobu",
    name: "DJ Nobu",
    city: "Chiba",
    country: "Japan",
    region: "Asia",
    active: "1998–present",
    tags: ["hypnotic", "Future Terror", "minimal", "deep"],
    photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    bio: "Founder of Future Terror. Resident at AIR Tokyo. Marathon sets known for their deep, hypnotic quality. A bridge between Japanese and global techno scenes.",
    labels: ["Bitta", "Future Terror"],
    careerHighlights: [
      "Founded Future Terror party",
      "Bitta Records founder",
      "25+ years in Japanese techno",
      "Labyrinth festival resident"
    ],
    keyReleases: [
      { title: "Future Terror", label: "Bitta", year: 2015, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Korg MS-20",
      "Ableton Live"
    ],
    djSetup: [
      "Technics SL-1200",
      "Pioneer CDJ-2000NXS2",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Extended sets only. Vinyl and CDJ hybrid setup."
  },
  {
    id: "wata-igarashi",
    name: "Wata Igarashi",
    city: "Tokyo",
    country: "Japan",
    region: "Asia",
    active: "2010–present",
    tags: ["Japanese", "hypnotic", "trance-inducing", "deep"],
    photoUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    bio: "Tokyo-based producer. Hypnotic, trance-inducing techno. His productions create deep, immersive experiences.",
    labels: ["Midgar", "The Bunker New York"],
    careerHighlights: [
      "Midgar Records artist",
      "The Bunker New York artist",
      "Tokyo techno pioneer"
    ],
    keyReleases: [
      { title: "Untitled EP", label: "Midgar", year: 2017, format: "12\"" }
    ],
    studioGear: [
      "Modular synthesizers",
      "Roland TR-909",
      "Elektron Analog Four",
      "Ableton Live"
    ],
    liveSetup: [
      "Modular synthesizers",
      "Elektron Octatrack",
      "Custom effects"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Extended sets preferred."
  },

  // UK - LONDON (Berlin-based)
  {
    id: "dax-j",
    name: "Dax J",
    city: "London",
    country: "UK",
    region: "Europe",
    active: "2010–present",
    tags: ["hard", "Monnom Black", "industrial", "driving", "Berghain"],
    photoUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
    bio: "London-born, Berlin-based. Founder of Monnom Black. Hard, industrial techno with driving intensity. Berghain resident. His sets are legendary for their uncompromising power.",
    labels: ["Monnom Black", "Arts"],
    careerHighlights: [
      "Founded Monnom Black label",
      "Berghain resident",
      "Hard techno pioneer"
    ],
    keyReleases: [
      { title: "Utopian Surrealism", label: "Monnom Black", year: 2018, format: "LP" },
      { title: "Offending Public Morality", label: "Monnom Black", year: 2019, format: "LP" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Elektron Analog Rytm",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "High-powered sound system essential. Extended sets."
  },

  // GERMANY - BERLIN (Additional)
  {
    id: "ellen-allien",
    name: "Ellen Allien",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "1992–present",
    tags: ["BPitch Control", "Berlin", "electro", "rave"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Ellen_Allien_%28MAGMA_2006%2C_Tenerife%29.jpg",
      author: "Ventura Mendoza",
      license: "CC BY 2.0",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Ellen_Allien_(MAGMA_2006,_Tenerife).jpg",
      sourceName: "Wikimedia Commons"
    },
    bio: "Berlin institution. Founder of BPitch Control. One of the city's most influential figures in electronic music. Her sound bridges electro, techno, and rave culture.",
    labels: ["BPitch Control", "Tresor"],
    careerHighlights: [
      "Founded BPitch Control 1999",
      "Berlin scene pioneer",
      "30+ years in techno",
      "Global touring"
    ],
    keyReleases: [
      { title: "Stadtkind", label: "BPitch Control", year: 2001, format: "LP" },
      { title: "Thrills", label: "BPitch Control", year: 2005, format: "LP" },
      { title: "Dust", label: "BPitch Control", year: 2017, format: "LP" }
    ],
    studioGear: [
      "Roland TR-909",
      "Korg MS-20",
      "Elektron Analog Four",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Extended sets preferred."
  },

  // RUSSIA
  {
    id: "nina-kraviz",
    name: "Nina Kraviz",
    city: "Irkutsk",
    country: "Russia",
    region: "Europe",
    active: "2008–present",
    tags: ["трип", "acid", "hypnotic", "Russian"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Nina_Kraviz_-_2018_RBMA.jpg",
      author: "Nina Kraviz",
      license: "CC BY 3.0",
      licenseUrl: "https://creativecommons.org/licenses/by/3.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Nina_Kraviz_-_2018_RBMA.jpg",
      sourceName: "Wikimedia Commons"
    },
    bio: "Siberian-born producer. Founder of трип (trip) label. Known for hypnotic, acid-tinged sets and raw productions. One of the most distinctive voices in modern techno.",
    labels: ["трип", "Rekids"],
    careerHighlights: [
      "Founded трип label",
      "Rekids artist",
      "Global headliner",
      "Acid techno specialist"
    ],
    keyReleases: [
      { title: "Nina Kraviz", label: "Rekids", year: 2012, format: "LP" },
      { title: "Mr Jones", label: "трип", year: 2015, format: "12\"" }
    ],
    studioGear: [
      "Roland TB-303",
      "Roland TR-909",
      "Elektron Analog Rytm",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Extended sets preferred. Acid techno focus."
  },

  // USA - MINNEAPOLIS
  {
    id: "dvs1",
    name: "DVS1",
    realName: "Zak Khutoretsky",
    city: "Minneapolis",
    country: "USA",
    region: "North America",
    active: "1996–present",
    tags: ["Minneapolis", "vinyl", "hypnotic", "Mistress"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/1/19/DVS1_FVTVR.jpg",
      author: "Charlestpt",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:DVS1_FVTVR.jpg",
      sourceName: "Wikimedia Commons"
    },
    bio: "Minneapolis techno ambassador. Founder of Mistress Recordings and Hush. Vinyl purist known for marathon sets. His sound is raw, hypnotic, and deeply rooted in techno's foundations.",
    labels: ["Mistress", "Hush"],
    careerHighlights: [
      "Founded Mistress Recordings",
      "Founded Hush label",
      "Berghain regular",
      "Vinyl-only specialist"
    ],
    keyReleases: [
      { title: "Klockworks 14", label: "Klockworks", year: 2015, format: "12\"" },
      { title: "Mistress 01", label: "Mistress", year: 2011, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Moog Sub 37",
      "Ableton Live"
    ],
    djSetup: [
      "Technics SL-1200MK2",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Vinyl preferred. Extended marathon sets specialty."
  },

  // ═══════════════════════════════════════════════════════════════
  // NEW ARTISTS FROM RAG DATABASE
  // ═══════════════════════════════════════════════════════════════

  // DETROIT LEGENDS
  {
    id: "juan-atkins",
    name: "Juan Atkins",
    realName: "Juan Atkins",
    city: "Detroit",
    country: "USA",
    region: "North America",
    active: "1981–present",
    tags: ["Detroit", "electro", "originator", "Metroplex", "Belleville Three"],
    bio: "Universally credited as 'Godfather of Techno' and 'The Originator.' Coined the term 'techno,' founded the first Detroit techno label (Metroplex, 1985), and is part of the legendary Belleville Three alongside Derrick May and Kevin Saunderson.",
    labels: ["Metroplex", "Deep Space"],
    careerHighlights: [
      "Coined the term 'techno'",
      "Founded Metroplex Records in 1985",
      "Part of the Belleville Three",
      "Created Cybotron with Rick Davis",
      "Model 500 project"
    ],
    keyReleases: [
      { title: "No UFOs", label: "Metroplex", year: 1985, format: "12\"" },
      { title: "Clear", label: "Fantasy", year: 1983, format: "12\"" },
      { title: "Alleys of Your Mind", label: "Deep Space", year: 1981, format: "12\"" },
      { title: "Techno City", label: "Metroplex", year: 1984, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-808",
      "Roland TR-909",
      "Sequential Circuits Prophet-5",
      "Korg MS-20"
    ],
    djSetup: [
      "Technics SL-1200MK2",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Vinyl preferred. Detroit techno purist."
  },
  {
    id: "derrick-may",
    name: "Derrick May",
    realName: "Derrick May",
    city: "Detroit",
    country: "USA",
    region: "North America",
    active: "1987–present",
    tags: ["Detroit", "Transmat", "Belleville Three", "soulful"],
    bio: "Known as 'The Innovator.' His 1987 track 'Strings of Life' remains one of the most influential dance records ever made. Part of the Belleville Three who created techno music in Detroit.",
    labels: ["Transmat", "Fragile"],
    careerHighlights: [
      "Created 'Strings of Life' in 1987",
      "Founded Transmat Records",
      "Part of the Belleville Three",
      "Rhythim Is Rhythim project"
    ],
    keyReleases: [
      { title: "Strings of Life", label: "Transmat", year: 1987, format: "12\"" },
      { title: "Nude Photo", label: "Transmat", year: 1987, format: "12\"" },
      { title: "It Is What It Is", label: "Transmat", year: 1988, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland Juno-106",
      "Yamaha DX7",
      "Ensoniq Mirage"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Soulful techno. Extended sets preferred."
  },
  {
    id: "kevin-saunderson",
    name: "Kevin Saunderson",
    realName: "Kevin Saunderson",
    city: "Detroit",
    country: "USA",
    region: "North America",
    active: "1987–present",
    tags: ["Detroit", "KMS", "Inner City", "Belleville Three"],
    bio: "Known as 'The Elevator.' Created the crossover hit 'Big Fun' with Inner City. Founded KMS Records and brought Detroit techno to mainstream audiences while maintaining underground credibility.",
    labels: ["KMS"],
    careerHighlights: [
      "Part of the Belleville Three",
      "Created Inner City project",
      "'Big Fun' reached UK Top 10",
      "Founded KMS Records"
    ],
    keyReleases: [
      { title: "Big Fun", label: "KMS", year: 1988, format: "12\"" },
      { title: "Good Life", label: "KMS", year: 1988, format: "12\"" },
      { title: "Rock to the Beat", label: "KMS", year: 1988, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Yamaha DX7"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Full range sound system essential."
  },
  {
    id: "drexciya",
    name: "Drexciya",
    realName: "James Stinson & Gerald Donald",
    city: "Detroit",
    country: "USA",
    region: "North America",
    active: "1989–2002",
    tags: ["Detroit", "electro", "afrofuturism", "mythology", "Underground Resistance"],
    bio: "Created electronic music's ultimate afrofuturist mythology—underwater descendants of slaves thrown overboard during the Middle Passage. Never gave interviews, appeared only masked. Revolutionary conceptual depth that influenced generations.",
    labels: ["Underground Resistance", "Tresor", "Warp", "Clone"],
    careerHighlights: [
      "Created the Drexciyan mythology",
      "Never revealed identities publicly",
      "Influenced entire afrofuturism movement",
      "Gerald Donald continues as Dopplereffekt"
    ],
    keyReleases: [
      { title: "Neptune's Lair", label: "Tresor", year: 1999, format: "LP" },
      { title: "Deep Sea Dweller", label: "Shockwave", year: 1992, format: "12\"" },
      { title: "Aquatic Invasion", label: "Underground Resistance", year: 1995, format: "12\"" },
      { title: "Bubble Metropolis", label: "Submerge", year: 1993, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-808",
      "Roland TB-303",
      "Sequential Circuits Pro-One"
    ],
    riderNotes: "Anonymous collective. Masks required."
  },
  {
    id: "carl-craig",
    name: "Carl Craig",
    realName: "Carl Craig",
    city: "Detroit",
    country: "USA",
    region: "North America",
    active: "1989–present",
    tags: ["Detroit", "Planet E", "jazz", "orchestral", "experimental"],
    bio: "Founder of Planet E Communications. Known for blending techno with jazz and orchestral elements. His 'More Songs About Food and Revolutionary Art' is considered a genre classic. Grammy-nominated producer.",
    labels: ["Planet E"],
    careerHighlights: [
      "Founded Planet E Communications in 1991",
      "Grammy nomination for Rebirth",
      "Detroit Symphony Orchestra collaboration",
      "Movement Festival co-founder"
    ],
    keyReleases: [
      { title: "More Songs About Food and Revolutionary Art", label: "Planet E", year: 1997, format: "LP" },
      { title: "Landcruising", label: "Blanco Y Negro", year: 1995, format: "LP" },
      { title: "Bug in the Bassbin", label: "Planet E", year: 1992, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Moog Voyager",
      "Prophet-5",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Extended sets. High-fidelity monitoring essential."
  },
  {
    id: "richie-hawtin",
    name: "Richie Hawtin",
    realName: "Richard Hawtin",
    city: "Windsor/Berlin",
    country: "Canada/Germany",
    region: "North America",
    active: "1990–present",
    tags: ["minimal", "Plus 8", "M_nus", "Plastikman", "technology"],
    bio: "Pioneer of minimal techno as Plastikman. Co-founded Plus 8 Records with John Acquaviva. His use of technology in performance set new standards. Founded M_nus label and championed the minimal movement.",
    labels: ["M_nus", "Plus 8"],
    careerHighlights: [
      "Created Plastikman alias",
      "Co-founded Plus 8 Records in 1990",
      "Founded M_nus in 1998",
      "Pioneer of DJ technology innovation",
      "ENTER. concept at Space Ibiza"
    ],
    keyReleases: [
      { title: "Sheet One", label: "Plus 8", year: 1993, format: "LP" },
      { title: "Consumed", label: "M_nus", year: 1998, format: "LP" },
      { title: "Spastik", label: "Plus 8", year: 1993, format: "12\"" },
      { title: "DE9: Closer to the Edit", label: "M_nus", year: 2001, format: "LP" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Modular synthesizers",
      "Ableton Live"
    ],
    liveSetup: [
      "Custom PLAYdifferently MODEL 1",
      "Traktor with custom controllers"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "PLAYdifferently MODEL 1"
    ],
    riderNotes: "Requires PLAYdifferently MODEL 1 mixer. Extended sets."
  },

  // BERLIN
  {
    id: "basic-channel",
    name: "Basic Channel",
    realName: "Moritz von Oswald & Mark Ernestus",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "1993–present",
    tags: ["dub techno", "minimal", "Chain Reaction", "pioneering"],
    bio: "Pioneering dub techno duo. Founded the influential Basic Channel and Chain Reaction labels in Berlin. Their stripped-down, dub-influenced approach to techno defined an entire genre.",
    labels: ["Basic Channel", "Chain Reaction", "Rhythm & Sound"],
    careerHighlights: [
      "Invented dub techno genre",
      "Founded Basic Channel label",
      "Created Chain Reaction imprint",
      "Hard Wax record store founders"
    ],
    keyReleases: [
      { title: "Phylyps Trak", label: "Basic Channel", year: 1993, format: "12\"" },
      { title: "Quadrant Dub", label: "Basic Channel", year: 1994, format: "12\"" },
      { title: "Radiance", label: "Chain Reaction", year: 1995, format: "LP" }
    ],
    studioGear: [
      "Roland Space Echo",
      "Analog filters",
      "Dub mixing techniques"
    ],
    riderNotes: "Dub techno pioneers. Quality sound system essential."
  },

  // UK
  {
    id: "aphex-twin",
    name: "Aphex Twin",
    realName: "Richard David James",
    city: "Cornwall/London",
    country: "UK",
    region: "Europe",
    active: "1985–present",
    tags: ["IDM", "ambient", "acid", "experimental", "Warp"],
    bio: "Pioneered IDM/braindance. 'Selected Ambient Works 85-92' changed electronic music forever. Co-founded Rephlex Records. Notorious for hoaxes and legend-building. One of the most influential electronic artists ever.",
    labels: ["Warp", "Rephlex"],
    careerHighlights: [
      "Selected Ambient Works 85-92",
      "Co-founded Rephlex Records",
      "Grammy Award for Syro",
      "Invented 'braindance' term"
    ],
    keyReleases: [
      { title: "Selected Ambient Works 85-92", label: "R&S", year: 1992, format: "LP" },
      { title: "Syro", label: "Warp", year: 2014, format: "LP" },
      { title: "Drukqs", label: "Warp", year: 2001, format: "2LP" },
      { title: "...I Care Because You Do", label: "Warp", year: 1995, format: "LP" }
    ],
    studioGear: [
      "Modular synthesizers",
      "Custom software",
      "Modified vintage equipment"
    ],
    riderNotes: "Rare live performances. Experimental setups."
  },
  {
    id: "autechre",
    name: "Autechre",
    realName: "Sean Booth & Rob Brown",
    city: "Manchester",
    country: "UK",
    region: "Europe",
    active: "1987–present",
    tags: ["IDM", "experimental", "abstract", "Warp", "glitch"],
    bio: "Pushed electronic music into increasingly abstract territory over 30+ years. Never compromised artistic vision. 'Tri Repetae' considered genre-defining. Their later work explores generative and algorithmic composition.",
    labels: ["Warp"],
    careerHighlights: [
      "30+ years on Warp Records",
      "Tri Repetae defined IDM",
      "Pioneered generative music",
      "Never compromised vision"
    ],
    keyReleases: [
      { title: "Tri Repetae", label: "Warp", year: 1995, format: "LP" },
      { title: "Amber", label: "Warp", year: 1994, format: "LP" },
      { title: "LP5", label: "Warp", year: 1998, format: "LP" },
      { title: "Exai", label: "Warp", year: 2013, format: "2LP" }
    ],
    studioGear: [
      "Max/MSP",
      "Custom software",
      "Modular synthesizers"
    ],
    riderNotes: "Extended live performances. Complete darkness preferred."
  },
  {
    id: "luke-slater",
    name: "Luke Slater",
    realName: "Luke Slater",
    city: "London",
    country: "UK",
    region: "Europe",
    active: "1989–present",
    tags: ["Mote-Evolver", "PAS", "UK", "hypnotic", "hardware"],
    bio: "The man behind Planetary Assault Systems, 7th Plain, and The 7th Plain. Founded Mote-Evolver label. His PAS project delivers some of techno's most hypnotic, relentless productions.",
    labels: ["Mote-Evolver", "Novamute", "Ostgut Ton"],
    careerHighlights: [
      "Created Planetary Assault Systems",
      "Founded Mote-Evolver Records",
      "7th Plain ambient project",
      "L.B. Dub Corp alias"
    ],
    keyReleases: [
      { title: "The Eyes Themselves", label: "Mote-Evolver", year: 2009, format: "LP" },
      { title: "Wireless", label: "Novamute", year: 1999, format: "LP" },
      { title: "Arc Angel", label: "Mote-Evolver", year: 2010, format: "12\"" }
    ],
    studioGear: [
      "Modular synthesizers",
      "Elektron machines",
      "Roland TR-909"
    ],
    liveSetup: [
      "Full modular system",
      "Elektron Analog Rytm",
      "Custom controllers"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Allen & Heath Xone:92"
    ],
    riderNotes: "Extended sets. Hardware live preferred."
  },
  {
    id: "carl-cox",
    name: "Carl Cox",
    realName: "Carl Cox",
    city: "Oldham",
    country: "UK",
    region: "Europe",
    active: "1985–present",
    tags: ["Space Ibiza", "three-deck", "festival", "house", "techno", "Intec", "high-energy"],
    knownFor: "The King",
    bio: "Known worldwide for decades of legendary performances. Founder of Intec Records. Famous for his mastery of three decks and inexhaustible energy in the booth. His 16-year Space Ibiza residency became the stuff of legend.",
    labels: ["Intec", "23rd Century"],
    topTracks: ["I Want You (Forever)", "Phuture 2000", "The Player"],
    careerHighlights: [
      "16-year Space Ibiza residency",
      "Pioneer of three-deck mixing",
      "Founded Intec Records",
      "Global festival headliner",
      "Known as 'The King'"
    ],
    keyReleases: [
      { title: "Phuture 2000", label: "Edel", year: 1994, format: "12\"" },
      { title: "I Want You (Forever)", label: "Edel", year: 1991, format: "12\"" },
      { title: "The Player", label: "Intec", year: 2001, format: "12\"" }
    ],
    studioGear: [
      "Pioneer CDJ setup",
      "Roland TR-909",
      "Native Instruments"
    ],
    djSetup: [
      "Three Pioneer CDJ-3000",
      "Pioneer DJM-V10",
      "MODEL 1 by PLAYdifferently"
    ],
    riderNotes: "Requires three-deck setup. Festival-grade sound essential."
  },

  // INTERNATIONAL
  {
    id: "laurent-garnier",
    name: "Laurent Garnier",
    realName: "Laurent Garnier",
    city: "Paris",
    country: "France",
    region: "Europe",
    active: "1987–present",
    tags: ["French", "F Communications", "eclectic", "jazz", "warehouse", "PIAS"],
    knownFor: "The French Ambassador",
    bio: "The greatest ambassador of French electronic music. Started at The Haçienda in Manchester, then brought techno to France. Known for legendary marathon sets. Author of the influential book 'Electrochoc'. Deep, eclectic, and emotional techno.",
    labels: ["F Communications", "PIAS"],
    topTracks: ["Crispy Bacon", "The Man with the Red Face", "Flashback"],
    careerHighlights: [
      "Founded F Communications",
      "The Haçienda Manchester resident",
      "Rex Club Paris residency",
      "Wake Up parties series",
      "Author of 'Electrochoc'",
      "French techno pioneer",
      "Legendary marathon sets"
    ],
    keyReleases: [
      { title: "Shot in the Dark", label: "F Communications", year: 1994, format: "LP" },
      { title: "30", label: "F Communications", year: 1997, format: "LP" },
      { title: "Unreasonable Behaviour", label: "F Communications", year: 2000, format: "LP" },
      { title: "The Man with the Red Face", label: "F Communications", year: 2000, format: "12\"" }
    ],
    studioGear: [
      "Roland TR-909",
      "Moog synthesizers",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Extended eclectic sets. Quality monitoring essential."
  },
  {
    id: "dave-clarke",
    name: "Dave Clarke",
    realName: "Dave Clarke",
    city: "Brighton/Amsterdam",
    country: "UK/Netherlands",
    region: "Europe",
    active: "1990–present",
    tags: ["electro", "Baron of Techno", "Red", "ADE", "White Noise"],
    knownFor: "The Baron of Techno",
    bio: "Known as 'The Baron of Techno' for his legendary sets and influential White Noise radio program. His 'Red' series of EPs defined the techno-electro sound of the 90s. Long-time Amsterdam resident and ADE fixture.",
    labels: ["White Noise", "Skint", "Deconstruction"],
    topTracks: ["Red 1", "Red 2", "Red 3", "Wisdom to the Wise"],
    careerHighlights: [
      "Red series defined 90s techno-electro",
      "Amsterdam Dance Event regular",
      "BBC Radio 1 presenter",
      "White Noise podcast/radio show"
    ],
    keyReleases: [
      { title: "Red 1", label: "Deconstruction", year: 1994, format: "12\"" },
      { title: "Red 2", label: "Deconstruction", year: 1994, format: "12\"" },
      { title: "Red 3", label: "Deconstruction", year: 1995, format: "12\"" },
      { title: "Archive One", label: "Skint", year: 1996, format: "LP" }
    ],
    studioGear: [
      "Roland TR-909",
      "Roland TB-303",
      "Elektron machines"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup. Electro-friendly programming."
  },
  {
    id: "chris-liebing",
    name: "Chris Liebing",
    realName: "Chris Liebing",
    city: "Frankfurt",
    country: "Germany",
    region: "Europe",
    active: "1990–present",
    tags: ["Frankfurt", "CLR", "hard techno", "Spinclub", "industrial", "Mute"],
    knownFor: "The Frankfurt Hammer",
    bio: "Pioneer of hard techno and founder of CLR label. His CLR podcast was a mandatory reference for hard techno fans. Key figure in the Frankfurt techno legacy alongside Sven Väth. Known for industrial-tinged techno and marathon DJ sets.",
    labels: ["CLR", "Mute"],
    topTracks: ["Atari", "Ping Pong", "Analogon"],
    careerHighlights: [
      "Founded CLR Records",
      "CLR Podcast pioneer",
      "Spinclub Frankfurt co-founder",
      "Nature One festival resident",
      "Key figure in Frankfurt techno legacy"
    ],
    keyReleases: [
      { title: "Another Day", label: "CLR", year: 2010, format: "12\"" },
      { title: "Stigmata", label: "CLR", year: 2011, format: "LP" },
      { title: "Burn Slow", label: "Mute", year: 2018, format: "LP" }
    ],
    studioGear: [
      "Native Instruments",
      "Ableton Live",
      "Elektron machines"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Extended sets preferred. Industrial venues."
  },
  {
    id: "sven-vath",
    name: "Sven Väth",
    realName: "Sven Väth",
    city: "Frankfurt",
    country: "Germany",
    region: "Europe",
    active: "1982–present",
    tags: ["Frankfurt", "Cocoon", "Eye Q", "Harthouse", "trance", "marathon"],
    knownFor: "Papa Sven",
    bio: "Godfather of Frankfurt techno and founder of Cocoon. Residency of over 20 years at Amnesia Ibiza. Known for 10+ hour marathon sets and chamanic stage presence. His labels Eye Q and Harthouse defined early German trance and techno.",
    labels: ["Cocoon", "Eye Q", "Harthouse"],
    topTracks: ["L'Esperanza", "An Accident in Paradise", "Harlequin (The Beauty and The Beast)"],
    careerHighlights: [
      "Founded Cocoon empire",
      "Eye Q and Harthouse labels",
      "20+ year Amnesia Ibiza residency",
      "Frankfurt techno godfather",
      "10+ hour marathon sets",
      "Chamanic stage presence"
    ],
    keyReleases: [
      { title: "Accident in Paradise", label: "Eye Q", year: 1993, format: "LP" },
      { title: "The Harlequin, The Robot and The Ballet Dancer", label: "Eye Q", year: 1994, format: "LP" },
      { title: "In the Mix: The Sound of the 1st Season", label: "Cocoon", year: 2000, format: "CD" }
    ],
    studioGear: [
      "Roland Juno-60",
      "Roland TR-909",
      "Moog synthesizers"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Extended marathon sets (10+ hours). Large stage presence space required."
  },
  {
    id: "adam-beyer",
    name: "Adam Beyer",
    realName: "Adam Beyer",
    city: "Stockholm",
    country: "Sweden",
    region: "Europe",
    active: "1993–present",
    tags: ["Drumcode", "Swedish", "driving", "peak-time"],
    bio: "Swedish techno powerhouse. Founded Drumcode Records, one of the most successful techno labels globally. His driving, peak-time sound defines modern festival techno.",
    labels: ["Drumcode", "Truesoul"],
    careerHighlights: [
      "Founded Drumcode Records 1996",
      "Drumcode Festival curator",
      "Global festival headliner",
      "Truesoul label"
    ],
    keyReleases: [
      { title: "Decoded", label: "Drumcode", year: 2012, format: "LP" },
      { title: "Ignition Key", label: "Drumcode", year: 2003, format: "12\"" }
    ],
    studioGear: [
      "Native Instruments",
      "Ableton Live",
      "Roland TR-909"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Festival-ready setup. Peak-time programming."
  },
  {
    id: "amelie-lens",
    name: "Amelie Lens",
    realName: "Amelie Lens",
    city: "Antwerp",
    country: "Belgium",
    region: "Europe",
    active: "2015–present",
    tags: ["Belgian", "LENSKE", "driving", "peak-time", "festival"],
    bio: "Belgian techno phenomenon. Founded LENSKE label and Exhale events. Rose rapidly to become one of techno's most in-demand artists with her high-energy, driving style.",
    labels: ["LENSKE", "Drumcode"],
    careerHighlights: [
      "Founded LENSKE Records",
      "Exhale events series",
      "Rapid rise to global headliner",
      "Tomorrowland mainstage"
    ],
    keyReleases: [
      { title: "Hypnotized", label: "LENSKE", year: 2019, format: "12\"" },
      { title: "Higher", label: "Drumcode", year: 2021, format: "12\"" }
    ],
    studioGear: [
      "Ableton Live",
      "Native Instruments",
      "Elektron machines"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup. High-energy sets."
  },
  {
    id: "charlotte-de-witte",
    name: "Charlotte de Witte",
    realName: "Charlotte de Witte",
    city: "Ghent",
    country: "Belgium",
    region: "Europe",
    active: "2015–present",
    tags: ["Belgian", "KNTXT", "dark", "driving", "festival"],
    bio: "Belgian techno queen. Founded KNTXT label and events. Known for dark, driving techno and became the first woman to close Tomorrowland mainstage.",
    labels: ["KNTXT", "Drumcode"],
    careerHighlights: [
      "Founded KNTXT Records",
      "First woman to close Tomorrowland",
      "BBC Radio 1 Essential Mix",
      "Global ambassador for techno"
    ],
    keyReleases: [
      { title: "Chosen", label: "Drumcode", year: 2018, format: "12\"" },
      { title: "Rave On Time", label: "KNTXT", year: 2021, format: "12\"" }
    ],
    studioGear: [
      "Ableton Live",
      "Native Instruments Maschine",
      "Elektron"
    ],
    djSetup: [
      "Pioneer CDJ-3000",
      "Pioneer DJM-V10"
    ],
    riderNotes: "Standard Pioneer setup. Dark techno programming."
  },
  {
    id: "jeff-rushin",
    name: "Jeff Rushin",
    realName: "Jeff Rushin",
    city: "Berlin",
    country: "Germany",
    region: "Europe",
    active: "2012–present",
    tags: ["Berlin", "Figure", "hypnotic", "deep"],
    bio: "Berlin-based producer known for hypnotic, deep techno. Regular on Figure and Token records. His productions blend driving rhythms with atmospheric depth.",
    labels: ["Figure", "Token"],
    careerHighlights: [
      "Figure Records regular",
      "Token releases",
      "Berghain performances"
    ],
    keyReleases: [
      { title: "Pulse", label: "Figure", year: 2018, format: "12\"" }
    ],
    studioGear: [
      "Elektron Analog Four",
      "Roland TR-8S",
      "Ableton Live"
    ],
    djSetup: [
      "Pioneer CDJ-2000NXS2",
      "Pioneer DJM-900NXS2"
    ],
    riderNotes: "Standard Pioneer setup."
  }
];

export const getArtistById = (id: string) => artists.find(a => a.id === id);
export const getArtistsByTag = (tag: string) => artists.filter(a => a.tags.includes(tag));
export const getArtistsByCountry = (country: string) => artists.filter(a => a.country === country);
export const getArtistsByRegion = (region: string) => artists.filter(a => a.region === region);
