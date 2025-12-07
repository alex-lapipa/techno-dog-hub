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
  {
    id: "surgeon",
    name: "Surgeon",
    realName: "Anthony Child",
    city: "Birmingham",
    country: "UK",
    active: "1994–present",
    tags: ["industrial", "Birmingham sound", "hardware", "modular"],
    bio: "One of the most influential figures in British techno. Co-founder of Counterbalance and Dynamic Tension. Known for raw, visceral sound and extended live sets that redefine what the genre can be.",
    labels: ["Tresor", "Dynamic Tension", "Counterbalance", "Blueprint"],
    collaborators: ["Regis", "Lady Starlight", "British Murder Boys"]
  },
  {
    id: "planetary-assault-systems",
    name: "Planetary Assault Systems",
    realName: "Luke Slater",
    city: "London",
    country: "UK",
    active: "1993–present",
    tags: ["hypnotic", "relentless", "Ostgut Ton", "peak-time"],
    bio: "Luke Slater's techno alias. Relentless, hypnotic, designed for marathon sets. The Mote-Evolver label boss.",
    labels: ["Ostgut Ton", "Mote-Evolver", "Peacefrog"]
  },
  {
    id: "marcel-dettmann",
    name: "Marcel Dettmann",
    city: "Berlin",
    country: "Germany",
    active: "1999–present",
    tags: ["Berghain", "hard", "industrial", "MDR"],
    bio: "Berghain resident since the club's inception. His label MDR has become a platform for the Berlin sound at its darkest.",
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
    bio: "Berghain resident and founder of Klockworks. Marathon sets that define the Berlin institution's sonic identity.",
    labels: ["Klockworks", "Ostgut Ton"],
    crews: ["Berghain"]
  },
  {
    id: "helena-hauff",
    name: "Helena Hauff",
    city: "Hamburg",
    country: "Germany",
    active: "2010–present",
    tags: ["electro", "acid", "hardware", "analog"],
    bio: "Hamburg's queen of electro and acid. Resident at Golden Pudel Club. Hardware-only performances. Uncompromising analog approach.",
    labels: ["Return to Disorder", "Ninja Tune", "Werkdiscs"]
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
    id: "dax-j",
    name: "Dax J",
    city: "London",
    country: "UK",
    active: "2011–present",
    tags: ["hard", "industrial", "Monnom Black", "peak-time"],
    bio: "Founder of Monnom Black. Relentless, driving sets. Built for the biggest rooms and the hardest crowds.",
    labels: ["Monnom Black", "Arts"]
  },
  {
    id: "spfdj",
    name: "SPFDJ",
    city: "Berlin",
    country: "Germany",
    active: "2015–present",
    tags: ["hard", "EBM", "industrial", "Berlin"],
    bio: "Berlin-based selector known for hard-hitting sets that blend industrial, EBM, and raw techno.",
    labels: ["Intrepid Skin"]
  },
  {
    id: "anetha",
    name: "Anetha",
    city: "Paris",
    country: "France",
    active: "2014–present",
    tags: ["acid", "tribal", "Mama Told Ya", "French"],
    bio: "Paris-based artist and founder of Mama Told Ya collective. Acid-laced, tribal-influenced techno.",
    labels: ["MYT", "Possession"]
  },
  {
    id: "999999999",
    name: "999999999",
    city: "Rome",
    country: "Italy",
    active: "2015–present",
    tags: ["acid", "hard", "NineTimesNine", "raw"],
    bio: "Italian duo. Raw, acid-influenced productions and energetic live performances. Smoke-twisting filth.",
    labels: ["NineTimesNine", "Mord"]
  },
  {
    id: "onyvaa",
    name: "Onyvaa",
    city: "Rome",
    country: "Italy",
    active: "2016–present",
    tags: ["Italian", "hypnotic", "rolling", "deep"],
    bio: "Italian selector with a focus on hypnotic, rolling techno. Deep and driving.",
    labels: ["Soma", "Clergy"]
  },
  {
    id: "paula-temple",
    name: "Paula Temple",
    city: "Birmingham",
    country: "UK",
    active: "1998–present",
    tags: ["industrial", "noise", "Decon/Recon", "raw"],
    bio: "Producer and performer known for deconstructed approach to techno. Her Decon/Recon parties are legendary.",
    labels: ["R&S", "Noise Manifesto"]
  },
  {
    id: "rebekah",
    name: "Rebekah",
    city: "Birmingham",
    country: "UK",
    active: "2011–present",
    tags: ["Birmingham", "driving", "Elements", "raw"],
    bio: "Birmingham-based artist and founder of Elements series. Powerful voice for equality in the scene.",
    labels: ["CLR", "Soma", "Sleaze"]
  },
  {
    id: "dasha-rush",
    name: "Dasha Rush",
    city: "Berlin",
    country: "Germany",
    active: "2005–present",
    tags: ["experimental", "audiovisual", "Fullpanda", "avant-garde"],
    bio: "Russian-born, Berlin-based artist exploring the outer reaches of techno through audiovisual performance.",
    labels: ["Fullpanda", "Raster-Noton"]
  },
  {
    id: "lena-willikens",
    name: "Lena Willikens",
    city: "Düsseldorf",
    country: "Germany",
    active: "2010–present",
    tags: ["eclectic", "wave", "industrial", "Salon des Amateurs"],
    bio: "Düsseldorf selector. Eclectic sets that blend industrial, wave, and experimental electronics.",
    labels: ["Cómeme", "Dekmantel"]
  },
  {
    id: "trym",
    name: "Trym",
    city: "Brussels",
    country: "Belgium",
    active: "2016–present",
    tags: ["hard", "Belgian", "KNTXT", "industrial"],
    bio: "Belgian producer. Hard, industrial techno. No compromise.",
    labels: ["KNTXT", "Mord"]
  },
  {
    id: "nico-moreno",
    name: "Nico Moreno",
    city: "Paris",
    country: "France",
    active: "2018–present",
    tags: ["hard", "French", "Music Is Solidarity", "raw"],
    bio: "French producer. Hard, uncompromising techno with a raw edge.",
    labels: ["Music Is Solidarity"]
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
    id: "rrose",
    name: "Rrose",
    city: "New York",
    country: "USA",
    active: "2011–present",
    tags: ["experimental", "optical", "Eaux", "cerebral"],
    bio: "Exploring the outer reaches of techno through optical illusions and experimental sound design.",
    labels: ["Eaux", "Sandwell District", "Stroboscopic Artefacts"]
  },
  {
    id: "psyk",
    name: "Psyk",
    city: "Madrid",
    country: "Spain",
    active: "2005–present",
    tags: ["hypnotic", "Non Series", "Spanish", "deep"],
    bio: "Madrid-based producer. Hypnotic, cerebral techno. Founder of Non Series label.",
    labels: ["Non Series", "Mote-Evolver", "Blueprint"]
  },
  {
    id: "adriana-lopez",
    name: "Adriana Lopez",
    city: "Berlin",
    country: "Germany",
    active: "2008–present",
    tags: ["hypnotic", "dark", "Semantica", "deep"],
    bio: "Venezuelan-born, Berlin-based artist. Dark, hypnotic techno.",
    labels: ["Semantica", "CLR"]
  },
  {
    id: "zadig",
    name: "Zadig",
    realName: "François Dalmasso",
    city: "Paris",
    country: "France",
    active: "2008–present",
    tags: ["French", "hypnotic", "Construct Re-Form", "minimal"],
    bio: "French producer. Hypnotic, stripped-down techno with deep rhythmic foundations.",
    labels: ["Construct Re-Form", "Skudge"]
  },
  {
    id: "setaoc-mass",
    name: "Setaoc Mass",
    city: "Berlin",
    country: "Germany",
    active: "2012–present",
    tags: ["hypnotic", "SK_eleven", "deep", "rolling"],
    bio: "Berlin-based producer. Hypnotic, rolling techno. Founder of SK_eleven label.",
    labels: ["SK_eleven", "Figure"]
  },
  {
    id: "shdw-obscure-shape",
    name: "SHDW & Obscure Shape",
    city: "Stuttgart",
    country: "Germany",
    active: "2014–present",
    tags: ["Rave", "melodic", "German", "driving"],
    bio: "German duo. Rave-influenced techno with melodic elements.",
    labels: ["Arts", "Afterlife"]
  },
  {
    id: "kwartz",
    name: "Kwartz",
    city: "Bogotá",
    country: "Colombia",
    active: "2012–present",
    tags: ["Colombian", "dark", "hypnotic", "industrial"],
    bio: "Colombian producer. Dark, hypnotic industrial techno.",
    labels: ["PoleGroup", "Planet Rhythm"]
  },
  {
    id: "lewis-fautzi",
    name: "Lewis Fautzi",
    city: "Porto",
    country: "Portugal",
    active: "2011–present",
    tags: ["Portuguese", "hypnotic", "Faut Section", "driving"],
    bio: "Portuguese producer. Founder of Faut Section. Hypnotic, driving techno.",
    labels: ["Faut Section", "PoleGroup", "Token"]
  }
];

export const getArtistById = (id: string) => artists.find(a => a.id === id);
export const getArtistsByTag = (tag: string) => artists.filter(a => a.tags.includes(tag));
export const getArtistsByCountry = (country: string) => artists.filter(a => a.country === country);
