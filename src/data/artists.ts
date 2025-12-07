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
    tags: ["industrial", "Birmingham sound", "hardware", "modular"],
    image: {
      url: "https://upload.wikimedia.org/wikipedia/commons/0/05/Surgeon_%28Anthony_Child%29.jpg",
      author: "Ali Wade",
      license: "CC BY-SA 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.en",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Surgeon_(Anthony_Child).jpg",
      sourceName: "Wikimedia Commons"
    },
    bio: "One of the most influential figures in British techno. Co-founder of Counterbalance and Dynamic Tension. Raw, visceral sound and extended live sets. His modular synthesizer performances are legendary.",
    labels: ["Tresor", "Dynamic Tension", "Counterbalance", "Blueprint"],
    collaborators: ["Regis", "Lady Starlight", "British Murder Boys"],
    careerHighlights: [
      "Co-founded Birmingham techno scene",
      "British Murder Boys with Regis",
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
    tags: ["industrial", "Birmingham", "Sandwell District", "dark"],
    // No photoUrl - requires licensed image
    bio: "Co-founder of Downwards Records. Half of British Murder Boys. A key architect of the Birmingham sound and industrial techno movement. His productions are raw, uncompromising, and deeply influential.",
    labels: ["Downwards", "Blackest Ever Black", "Sandwell District"],
    collaborators: ["Surgeon", "Female", "British Murder Boys"],
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
    tags: ["Madrid", "PoleGroup", "hypnotic", "deep"],
    photoUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
    bio: "Pioneer of Spanish techno. Co-founder of PoleGroup. His Warm Up club shaped Madrid's scene for decades. His extended sets are legendary.",
    labels: ["PoleGroup", "Warm Up", "Semantica"],
    careerHighlights: [
      "Co-founded PoleGroup",
      "Warm Up club Madrid",
      "35+ years in techno",
      "Spanish techno godfather"
    ],
    keyReleases: [
      { title: "About Discipline and Education", label: "PoleGroup", year: 2013, format: "LP" },
      { title: "Grey Fades to Green", label: "Warm Up", year: 2018, format: "LP" }
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
    city: "Madrid",
    country: "Spain",
    region: "Europe",
    active: "2000–present",
    tags: ["Spanish", "hypnotic", "deep", "Madrid"],
    photoUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    bio: "Madrid veteran. Part of the Spanish techno old guard. Deep, hypnotic sets that carry decades of crate-digging wisdom. His selections bridge classic and contemporary techno.",
    labels: ["PoleGroup", "Semantica"],
    careerHighlights: [
      "Madrid scene veteran",
      "PoleGroup affiliate",
      "20+ years in Spanish techno",
      "Deep selector"
    ],
    keyReleases: [
      { title: "Madrid Sessions", label: "PoleGroup", year: 2018, format: "12\"" }
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
  }
];

export const getArtistById = (id: string) => artists.find(a => a.id === id);
export const getArtistsByTag = (tag: string) => artists.filter(a => a.tags.includes(tag));
export const getArtistsByCountry = (country: string) => artists.filter(a => a.country === country);
export const getArtistsByRegion = (region: string) => artists.filter(a => a.region === region);
