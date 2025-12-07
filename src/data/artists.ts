export interface Artist {
  id: string;
  name: string;
  realName?: string;
  city: string;
  country: string;
  active: string;
  tags: string[];
  bio?: string;
  labels?: string[];
  collaborators?: string[];
  influences?: string[];
  crews?: string[];
}

export const artists: Artist[] = [
  // DETROIT ORIGINATORS
  {
    id: "jeff-mills",
    name: "Jeff Mills",
    city: "Detroit",
    country: "USA",
    active: "1985–present",
    tags: ["Detroit", "minimal", "sci-fi", "TR-909"],
    bio: "The Wizard. Co-founder of Underground Resistance. Pioneer of minimal techno and the three-deck technique. His work transcends dance music into cinematic and orchestral territories.",
    labels: ["Axis", "Underground Resistance", "Purpose Maker"]
  },
  {
    id: "robert-hood",
    name: "Robert Hood",
    city: "Detroit",
    country: "USA",
    active: "1990–present",
    tags: ["minimal", "Detroit", "stripped-down", "M-Plant"],
    bio: "The Godfather of Minimal Techno. Original member of Underground Resistance. Creator of the Minimal Nation concept that defined an entire genre.",
    labels: ["M-Plant", "Hardwax", "Tresor", "Dekmantel"]
  },
  {
    id: "underground-resistance",
    name: "Underground Resistance",
    city: "Detroit",
    country: "USA",
    active: "1989–present",
    tags: ["Detroit", "militant", "anonymous", "revolutionary"],
    bio: "More than artists—a movement. The masked revolutionaries of Detroit techno. Anti-corporate, pro-community.",
    labels: ["Underground Resistance"]
  },

  // UK & BIRMINGHAM
  {
    id: "surgeon",
    name: "Surgeon",
    realName: "Anthony Child",
    city: "Birmingham",
    country: "UK",
    active: "1994–present",
    tags: ["industrial", "Birmingham sound", "hardware", "modular"],
    bio: "One of the most influential figures in British techno. Co-founder of Counterbalance and Dynamic Tension. Raw, visceral sound and extended live sets.",
    labels: ["Tresor", "Dynamic Tension", "Counterbalance", "Blueprint"],
    collaborators: ["Regis", "Lady Starlight", "British Murder Boys"]
  },
  {
    id: "regis",
    name: "Regis",
    realName: "Karl O'Connor",
    city: "Birmingham",
    country: "UK",
    active: "1991–present",
    tags: ["industrial", "Birmingham", "Sandwell District", "dark"],
    bio: "Co-founder of Downwards Records. Half of British Murder Boys. A key architect of the Birmingham sound and industrial techno movement.",
    labels: ["Downwards", "Blackest Ever Black", "Sandwell District"],
    collaborators: ["Surgeon", "Female", "British Murder Boys"]
  },
  {
    id: "james-ruskin",
    name: "James Ruskin",
    city: "London",
    country: "UK",
    active: "1994–present",
    tags: ["Blueprint", "UK", "deep", "hypnotic"],
    bio: "Founder of Blueprint Records. Defining the UK techno sound for three decades.",
    labels: ["Blueprint", "Tresor"]
  },
  {
    id: "planetary-assault-systems",
    name: "Planetary Assault Systems",
    realName: "Luke Slater",
    city: "London",
    country: "UK",
    active: "1993–present",
    tags: ["hypnotic", "relentless", "Ostgut Ton", "peak-time"],
    bio: "Luke Slater's techno alias. Relentless, hypnotic, designed for marathon sets.",
    labels: ["Ostgut Ton", "Mote-Evolver", "Peacefrog"]
  },
  {
    id: "perc",
    name: "Perc",
    realName: "Ali Wells",
    city: "London",
    country: "UK",
    active: "2004–present",
    tags: ["industrial", "Perc Trax", "modular", "noise"],
    bio: "Founder of Perc Trax. Platform for industrial and experimental techno.",
    labels: ["Perc Trax", "Stroboscopic Artefacts"],
    collaborators: ["Truss"]
  },
  {
    id: "blawan",
    name: "Blawan",
    realName: "Jamie Roberts",
    city: "Manchester",
    country: "UK",
    active: "2010–present",
    tags: ["industrial", "modular", "Ternesc", "raw"],
    bio: "Half of Karenn. Visceral, hardware-driven productions. Modular machines meet industrial grit.",
    labels: ["Ternesc", "R&S", "XL Recordings"],
    collaborators: ["Pariah", "Karenn"]
  },
  {
    id: "karenn",
    name: "Karenn",
    city: "London",
    country: "UK",
    active: "2011–present",
    tags: ["live", "hardware", "industrial", "raw"],
    bio: "Blawan and Pariah's live hardware project. Uncompromising, improvised, raw.",
    labels: ["Works The Long Nights", "Voam"]
  },
  {
    id: "paula-temple",
    name: "Paula Temple",
    city: "Birmingham",
    country: "UK",
    active: "1998–present",
    tags: ["industrial", "noise", "Decon/Recon", "raw"],
    bio: "Deconstructed approach to techno. Her Decon/Recon parties are legendary.",
    labels: ["R&S", "Noise Manifesto"]
  },
  {
    id: "rebekah",
    name: "Rebekah",
    city: "Birmingham",
    country: "UK",
    active: "2011–present",
    tags: ["Birmingham", "driving", "Elements", "raw"],
    bio: "Founder of Elements series. Powerful voice for equality in the scene.",
    labels: ["CLR", "Soma", "Sleaze"]
  },
  {
    id: "manni-dee",
    name: "Manni Dee",
    city: "London",
    country: "UK",
    active: "2012–present",
    tags: ["industrial", "EBM", "London", "dark"],
    bio: "Industrial and EBM-influenced techno from London.",
    labels: ["Perc Trax", "Voitax"]
  },

  // BERLIN
  {
    id: "marcel-dettmann",
    name: "Marcel Dettmann",
    city: "Berlin",
    country: "Germany",
    active: "1999–present",
    tags: ["Berghain", "hard", "industrial", "MDR"],
    bio: "Berghain resident since the club's inception. His label MDR defines the Berlin sound at its darkest.",
    labels: ["MDR", "Ostgut Ton"],
    crews: ["Berghain"]
  },
  {
    id: "ben-klock",
    name: "Ben Klock",
    city: "Berlin",
    country: "Germany",
    active: "2000–present",
    tags: ["Berghain", "driving", "dark", "Klockworks"],
    bio: "Berghain resident and founder of Klockworks. Marathon sets that define the institution's sonic identity.",
    labels: ["Klockworks", "Ostgut Ton"],
    crews: ["Berghain"]
  },
  {
    id: "rodhad",
    name: "Rødhåd",
    city: "Berlin",
    country: "Germany",
    active: "2009–present",
    tags: ["Dystopian", "dark", "hypnotic", "atmospheric"],
    bio: "Founder of Dystopian label and parties. Dark, atmospheric techno with a deeply hypnotic edge.",
    labels: ["Dystopian", "Token"]
  },
  {
    id: "ancient-methods",
    name: "Ancient Methods",
    realName: "Michael Wollenhaupt",
    city: "Berlin",
    country: "Germany",
    active: "2008–present",
    tags: ["industrial", "ritual", "Persephonic Sirens", "dark"],
    bio: "Ritualistic sound merging industrial, EBM, and techno. Persephonic Sirens label.",
    labels: ["Persephonic Sirens", "Hands"]
  },
  {
    id: "phase-fatale",
    name: "Phase Fatale",
    city: "Berlin",
    country: "Germany",
    active: "2012–present",
    tags: ["industrial", "EBM", "Ostgut Ton", "dark"],
    bio: "Industrial and EBM-influenced productions. Berghain regular.",
    labels: ["Ostgut Ton", "Hospital Productions"]
  },
  {
    id: "dasha-rush",
    name: "Dasha Rush",
    city: "Berlin",
    country: "Germany",
    active: "2005–present",
    tags: ["experimental", "audiovisual", "Fullpanda", "avant-garde"],
    bio: "Russian-born, Berlin-based. Exploring the outer reaches through audiovisual performance.",
    labels: ["Fullpanda", "Raster-Noton"]
  },
  {
    id: "setaoc-mass",
    name: "Setaoc Mass",
    city: "Berlin",
    country: "Germany",
    active: "2012–present",
    tags: ["hypnotic", "SK_eleven", "deep", "rolling"],
    bio: "Hypnotic, rolling techno. Founder of SK_eleven label.",
    labels: ["SK_eleven", "Figure"]
  },
  {
    id: "vril",
    name: "Vril",
    city: "Berlin",
    country: "Germany",
    active: "2011–present",
    tags: ["Giegling", "hypnotic", "deep", "minimal"],
    bio: "Hypnotic, trance-inducing productions. Giegling affiliate.",
    labels: ["Giegling", "Dystopian"]
  },

  // HAMBURG
  {
    id: "helena-hauff",
    name: "Helena Hauff",
    city: "Hamburg",
    country: "Germany",
    active: "2010–present",
    tags: ["electro", "acid", "hardware", "analog"],
    bio: "Hamburg's queen of electro and acid. Resident at Golden Pudel Club. Hardware-only performances. Uncompromising.",
    labels: ["Return to Disorder", "Ninja Tune", "Werkdiscs"]
  },

  // NETHERLANDS
  {
    id: "dimi-angelis",
    name: "Dimi Angélis",
    city: "Amsterdam",
    country: "Netherlands",
    active: "2000–present",
    tags: ["Dutch", "Djax-Up-Beats", "hypnotic", "deep"],
    bio: "Dutch techno veteran. Part of the original Dutch scene.",
    labels: ["Djax-Up-Beats", "Figure"]
  },
  {
    id: "jeroen-search",
    name: "Jeroen Search",
    city: "Rotterdam",
    country: "Netherlands",
    active: "1996–present",
    tags: ["Dutch", "Search", "hypnotic", "deep"],
    bio: "Founder of Search label. Deep, hypnotic Dutch techno.",
    labels: ["Search", "Figure"]
  },

  // SPAIN
  {
    id: "oscar-mulero",
    name: "Oscar Mulero",
    city: "Madrid",
    country: "Spain",
    active: "1989–present",
    tags: ["Madrid", "PoleGroup", "hypnotic", "deep"],
    bio: "Pioneer of Spanish techno. Co-founder of PoleGroup. His Warm Up club shaped Madrid's scene for decades.",
    labels: ["PoleGroup", "Warm Up", "Semantica"]
  },
  {
    id: "exium",
    name: "Exium",
    city: "Oviedo",
    country: "Spain",
    active: "2003–present",
    tags: ["Spanish", "PoleGroup", "industrial", "driving"],
    bio: "Spanish duo. Industrial, driving techno. PoleGroup core.",
    labels: ["PoleGroup", "Nheoma"]
  },
  {
    id: "reeko",
    name: "Reeko",
    city: "Madrid",
    country: "Spain",
    active: "1998–present",
    tags: ["Spanish", "Mental Disorder", "dark", "industrial"],
    bio: "Madrid veteran. Founder of Mental Disorder label.",
    labels: ["Mental Disorder", "PoleGroup"]
  },
  {
    id: "tensal",
    name: "Tensal",
    city: "Barcelona",
    country: "Spain",
    active: "2010–present",
    tags: ["Spanish", "Semantica", "deep", "atmospheric"],
    bio: "Barcelona-based producer. Deep, atmospheric techno.",
    labels: ["Semantica", "Token"]
  },
  {
    id: "kike-pravda",
    name: "Kike Pravda",
    city: "Madrid",
    country: "Spain",
    active: "2008–present",
    tags: ["Spanish", "Children of Tomorrow", "dark", "hypnotic"],
    bio: "Madrid-based. Founder of Children of Tomorrow label.",
    labels: ["Children of Tomorrow", "PoleGroup"]
  },

  // FRANCE
  {
    id: "anetha",
    name: "Anetha",
    city: "Paris",
    country: "France",
    active: "2014–present",
    tags: ["acid", "tribal", "Mama Told Ya", "French"],
    bio: "Paris-based. Founder of Mama Told Ya collective. Acid-laced, tribal-influenced techno.",
    labels: ["MYT", "Possession"]
  },
  {
    id: "i-hate-models",
    name: "I Hate Models",
    city: "Paris",
    country: "France",
    active: "2015–present",
    tags: ["emotional", "dark", "rave", "French"],
    bio: "French producer. Dark emotional techno. Early work only—pre-festival era.",
    labels: ["Arts", "Voitax"]
  },
  {
    id: "hadone",
    name: "Hadone",
    city: "Paris",
    country: "France",
    active: "2016–present",
    tags: ["hard", "French", "industrial", "raw"],
    bio: "French producer. Hard, industrial techno.",
    labels: ["Arts", "Musik Is Solidarity"]
  },
  {
    id: "nico-moreno",
    name: "Nico Moreno",
    city: "Paris",
    country: "France",
    active: "2018–present",
    tags: ["hard", "French", "raw", "uncompromising"],
    bio: "French producer. Hard, uncompromising techno.",
    labels: ["Music Is Solidarity"]
  },

  // BELGIUM
  {
    id: "trym",
    name: "Trym",
    city: "Brussels",
    country: "Belgium",
    active: "2016–present",
    tags: ["hard", "Belgian", "industrial", "raw"],
    bio: "Belgian producer. Hard, industrial techno. No compromise.",
    labels: ["KNTXT", "Mord"]
  },

  // ITALY
  {
    id: "999999999",
    name: "999999999",
    city: "Rome",
    country: "Italy",
    active: "2015–present",
    tags: ["acid", "hard", "NineTimesNine", "raw"],
    bio: "Italian duo. Raw, acid-influenced productions. Smoke-twisting filth.",
    labels: ["NineTimesNine", "Mord"]
  },
  {
    id: "onyvaa",
    name: "Onyvaa",
    city: "Rome",
    country: "Italy",
    active: "2016–present",
    tags: ["Italian", "hypnotic", "rolling", "deep"],
    bio: "Italian selector. Hypnotic, rolling techno.",
    labels: ["Soma", "Clergy"]
  },
  {
    id: "neel",
    name: "Neel",
    city: "Rome",
    country: "Italy",
    active: "2005–present",
    tags: ["Italian", "Spazio Disponibile", "hypnotic", "deep"],
    bio: "Italian producer. Co-runs Spazio Disponibile with Donato Dozzy.",
    labels: ["Spazio Disponibile", "Stroboscopic Artefacts"]
  },
  {
    id: "donato-dozzy",
    name: "Donato Dozzy",
    city: "Rome",
    country: "Italy",
    active: "1995–present",
    tags: ["hypnotic", "dub", "Spazio Disponibile", "Labyrinth"],
    bio: "Master of hypnotic techno. His Labyrinth parties in Japan are legendary.",
    labels: ["Spazio Disponibile", "Tresor", "Further"]
  },
  {
    id: "boston-168",
    name: "Boston 168",
    city: "Milan",
    country: "Italy",
    active: "2013–present",
    tags: ["Italian", "acid", "rave", "energetic"],
    bio: "Italian duo. Acid-laced, rave-influenced techno.",
    labels: ["Involve", "Lobster Theremin"]
  },

  // POLAND
  {
    id: "vtss",
    name: "VTSS",
    city: "Warsaw",
    country: "Poland",
    active: "2015–present",
    tags: ["Polish", "hard", "industrial", "driving"],
    bio: "Polish producer. Hard, industrial techno.",
    labels: ["VTSS", "Perc Trax"]
  },

  // UKRAINE
  {
    id: "yan-cook",
    name: "Yan Cook",
    city: "Kyiv",
    country: "Ukraine",
    active: "2012–present",
    tags: ["Ukrainian", "Horo", "hypnotic", "deep"],
    bio: "Ukrainian producer. Co-founder of Horo label.",
    labels: ["Horo", "Semantica"]
  },

  // GEORGIA
  {
    id: "spfdj",
    name: "SPFDJ",
    city: "Berlin",
    country: "Germany",
    active: "2015–present",
    tags: ["hard", "EBM", "industrial", "Bassiani"],
    bio: "Berlin-based selector. Hard-hitting sets blending industrial, EBM, and raw techno. Bassiani regular.",
    labels: ["Intrepid Skin"]
  },
  {
    id: "hector-oaks",
    name: "Hector Oaks",
    city: "Berlin",
    country: "Germany",
    active: "2014–present",
    tags: ["Bassiani", "KAOS", "driving", "raw"],
    bio: "Berlin-based. Founder of KAOS label. Driving, raw techno.",
    labels: ["KAOS", "Bassiani Records"]
  },

  // PORTUGAL
  {
    id: "lewis-fautzi",
    name: "Lewis Fautzi",
    city: "Porto",
    country: "Portugal",
    active: "2011–present",
    tags: ["Portuguese", "hypnotic", "Faut Section", "driving"],
    bio: "Portuguese producer. Founder of Faut Section. Hypnotic, driving techno.",
    labels: ["Faut Section", "PoleGroup", "Token"]
  },

  // COLOMBIA
  {
    id: "kwartz",
    name: "Kwartz",
    city: "Bogotá",
    country: "Colombia",
    active: "2012–present",
    tags: ["Colombian", "dark", "hypnotic", "industrial"],
    bio: "Colombian producer. Dark, hypnotic industrial techno from Bogotá.",
    labels: ["PoleGroup", "Planet Rhythm"]
  },

  // RUSSIA
  {
    id: "rikhter",
    name: "RIKHTER",
    city: "St. Petersburg",
    country: "Russia",
    active: "2015–present",
    tags: ["Russian", "hypnotic", "atmospheric", "deep"],
    bio: "Russian producer. Hypnotic, atmospheric techno.",
    labels: ["Dystopian", "Northern Electronics"]
  },

  // JAPAN
  {
    id: "dj-nobu",
    name: "DJ Nobu",
    city: "Chiba",
    country: "Japan",
    active: "1998–present",
    tags: ["hypnotic", "Future Terror", "minimal", "deep"],
    bio: "Founder of Future Terror. Resident at AIR Tokyo. Marathon sets known for their deep, hypnotic quality.",
    labels: ["Bitta", "Future Terror"]
  },
  {
    id: "wata-igarashi",
    name: "Wata Igarashi",
    city: "Tokyo",
    country: "Japan",
    active: "2010–present",
    tags: ["Japanese", "hypnotic", "trance-inducing", "deep"],
    bio: "Tokyo-based producer. Hypnotic, trance-inducing techno.",
    labels: ["Midgar", "The Bunker New York"]
  },

  // USA (NYC)
  {
    id: "rrose",
    name: "Rrose",
    city: "New York",
    country: "USA",
    active: "2011–present",
    tags: ["experimental", "optical", "Eaux", "cerebral"],
    bio: "Exploring techno's outer reaches through optical illusions and experimental sound design.",
    labels: ["Eaux", "Sandwell District", "Stroboscopic Artefacts"]
  },
  {
    id: "d-dan",
    name: "D.Dan",
    city: "New York",
    country: "USA",
    active: "2014–present",
    tags: ["NYC", "hypnotic", "Bossa Nova Civic Club", "deep"],
    bio: "NYC-based selector. Deep, hypnotic selections.",
    labels: ["The Bunker New York"]
  },

  // GERMANY (OTHER)
  {
    id: "shdw-obscure-shape",
    name: "SHDW & Obscure Shape",
    city: "Stuttgart",
    country: "Germany",
    active: "2014–present",
    tags: ["rave", "melodic", "German", "driving"],
    bio: "German duo. Rave-influenced techno with melodic elements.",
    labels: ["Arts", "Afterlife"]
  },
  {
    id: "adriana-lopez",
    name: "Adriana Lopez",
    city: "Berlin",
    country: "Germany",
    active: "2008–present",
    tags: ["hypnotic", "dark", "Semantica", "deep"],
    bio: "Venezuelan-born, Berlin-based. Dark, hypnotic techno.",
    labels: ["Semantica", "CLR"]
  },
  {
    id: "psyk",
    name: "Psyk",
    city: "Madrid",
    country: "Spain",
    active: "2005–present",
    tags: ["hypnotic", "Non Series", "Spanish", "deep"],
    bio: "Madrid-based. Founder of Non Series label. Hypnotic, cerebral techno.",
    labels: ["Non Series", "Mote-Evolver", "Blueprint"]
  }
];

export const getArtistById = (id: string) => artists.find(a => a.id === id);
export const getArtistsByTag = (tag: string) => artists.filter(a => a.tags.includes(tag));
export const getArtistsByCountry = (country: string) => artists.filter(a => a.country === country);
