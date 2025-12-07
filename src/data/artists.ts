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
    bio: "One of the most influential figures in British techno. Co-founder of Counterbalance and Dynamic Tension. Known for his raw, visceral sound and extended live sets.",
    labels: ["Tresor", "Dynamic Tension", "Counterbalance", "Blueprint"],
    collaborators: ["Regis", "Lady Starlight", "British Murder Boys"],
    influences: ["Juan Atkins", "Robert Hood", "Industrial music"]
  },
  {
    id: "jeff-mills",
    name: "Jeff Mills",
    city: "Detroit",
    country: "USA",
    active: "1985–present",
    tags: ["Detroit", "minimal", "sci-fi", "TR-909"],
    bio: "The Wizard. Co-founder of Underground Resistance. Pioneer of minimal techno and the three-deck DJ technique. His work transcends dance music into cinematic and orchestral territories.",
    labels: ["Axis", "Underground Resistance", "Purpose Maker"],
    influences: ["Kraftwerk", "Parliament", "Science fiction cinema"]
  },
  {
    id: "robert-hood",
    name: "Robert Hood",
    city: "Detroit",
    country: "USA",
    active: "1990–present",
    tags: ["minimal", "Detroit", "stripped-down", "M-Plant"],
    bio: "The Godfather of Minimal Techno. Original member of Underground Resistance. Creator of the Minimal Nation concept that defined an entire genre.",
    labels: ["M-Plant", "Hardwax", "Tresor", "Dekmantel"],
    collaborators: ["Underground Resistance", "Floorplan"]
  },
  {
    id: "helena-hauff",
    name: "Helena Hauff",
    city: "Hamburg",
    country: "Germany",
    active: "2010–present",
    tags: ["electro", "acid", "hardware", "analog"],
    bio: "Hamburg's queen of electro and acid. Resident at Golden Pudel Club. Known for hardware-only performances and her uncompromising analog approach.",
    labels: ["Return to Disorder", "Ninja Tune", "Werkdiscs"],
    influences: ["Drexciya", "Dopplereffekt", "Industrial"]
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
    id: "ben-klock",
    name: "Ben Klock",
    city: "Berlin",
    country: "Germany",
    active: "2000–present",
    tags: ["Berghain", "driving", "dark", "Klockworks"],
    bio: "Berghain resident and founder of Klockworks. His marathon sets at the Berlin institution have defined the club's sonic identity.",
    labels: ["Klockworks", "Ostgut Ton"],
    crews: ["Berghain"]
  },
  {
    id: "marcel-dettmann",
    name: "Marcel Dettmann",
    city: "Berlin",
    country: "Germany",
    active: "1999–present",
    tags: ["Berghain", "hard", "industrial", "MDR"],
    bio: "Berghain resident since the club's inception. His label MDR has become a platform for the Berlin sound.",
    labels: ["MDR", "Ostgut Ton"],
    crews: ["Berghain"]
  },
  {
    id: "paula-temple",
    name: "Paula Temple",
    city: "Birmingham",
    country: "UK",
    active: "1998–present",
    tags: ["industrial", "noise", "Decon/Recon", "raw"],
    bio: "Producer and performer known for her deconstructed approach to techno. Her Decon/Recon parties have become legendary.",
    labels: ["R&S", "Noise Manifesto"],
    influences: ["Industrial", "Noise", "Birmingham scene"]
  },
  {
    id: "blawan",
    name: "Blawan",
    realName: "Jamie Roberts",
    city: "Manchester",
    country: "UK",
    active: "2010–present",
    tags: ["industrial", "modular", "Ternesc", "raw"],
    bio: "Half of Karenn. Known for visceral, hardware-driven productions that blur the line between techno and industrial.",
    labels: ["Ternesc", "R&S", "XL Recordings"],
    collaborators: ["Pariah", "Karenn"]
  },
  {
    id: "dax-j",
    name: "Dax J",
    city: "London",
    country: "UK",
    active: "2011–present",
    tags: ["hard", "industrial", "Monnom Black", "peak-time"],
    bio: "Founder of Monnom Black. Known for relentless, driving sets that have made him a favorite at the world's best techno clubs.",
    labels: ["Monnom Black", "Arts"]
  },
  {
    id: "oscar-mulero",
    name: "Oscar Mulero",
    city: "Madrid",
    country: "Spain",
    active: "1989–present",
    tags: ["Madrid", "Warm Up", "PoleGroup", "hypnotic"],
    bio: "Pioneer of Spanish techno. Co-founder of PoleGroup. His Warm Up club shaped Madrid's electronic music scene for decades.",
    labels: ["PoleGroup", "Warm Up", "Semantica"],
    collaborators: ["Exium", "Reeko"]
  },
  {
    id: "rebekah",
    name: "Rebekah",
    city: "Birmingham",
    country: "UK",
    active: "2011–present",
    tags: ["Birmingham", "driving", "Elements", "raw"],
    bio: "Birmingham-based artist and founder of Elements series. A powerful voice for equality in the techno scene.",
    labels: ["CLR", "Soma", "Sleaze"]
  },
  {
    id: "perc",
    name: "Perc",
    realName: "Ali Wells",
    city: "London",
    country: "UK",
    active: "2004–present",
    tags: ["industrial", "Perc Trax", "modular", "noise"],
    bio: "Founder of Perc Trax. His label has become a platform for the more industrial and experimental side of techno.",
    labels: ["Perc Trax", "Stroboscopic Artefacts"],
    collaborators: ["Truss"]
  },
  {
    id: "ancient-methods",
    name: "Ancient Methods",
    realName: "Michael Wollenhaupt",
    city: "Berlin",
    country: "Germany",
    active: "2008–present",
    tags: ["industrial", "ritual", "Persephonic Sirens", "dark"],
    bio: "Creator of a distinct ritualistic sound that merges industrial, EBM, and techno. His label Persephonic Sirens is a platform for dark electronics.",
    labels: ["Persephonic Sirens", "Hands"]
  },
  {
    id: "donato-dozzy",
    name: "Donato Dozzy",
    city: "Rome",
    country: "Italy",
    active: "1995–present",
    tags: ["hypnotic", "dub", "Spazio Disponibile", "ambient"],
    bio: "Master of hypnotic techno. His Labyrinth parties in Japan have become legendary for their extended, trance-inducing sets.",
    labels: ["Spazio Disponibile", "Tresor", "Further"]
  },
  {
    id: "i-hate-models",
    name: "I Hate Models",
    city: "Paris",
    country: "France",
    active: "2015–present",
    tags: ["emotional", "dark", "Music Is Solidarity", "rave"],
    bio: "French producer known for emotional, dark techno. His Musik Is Solidarity event series promotes equality and diversity in the scene.",
    labels: ["Arts", "Voitax"]
  },
  {
    id: "999999999",
    name: "999999999",
    city: "Rome",
    country: "Italy",
    active: "2015–present",
    tags: ["acid", "hard", "NineTimesNine", "raw"],
    bio: "Italian duo known for their raw, acid-influenced productions and energetic live performances.",
    labels: ["NineTimesNine", "Mord"]
  },
  {
    id: "rrose",
    name: "Rrose",
    city: "New York",
    country: "USA",
    active: "2011–present",
    tags: ["experimental", "optical", "Eaux", "cerebral"],
    bio: "Artist exploring the outer reaches of techno through optical illusions and experimental sound design.",
    labels: ["Eaux", "Sandwell District", "Stroboscopic Artefacts"]
  },
  {
    id: "dj-nobu",
    name: "DJ Nobu",
    city: "Chiba",
    country: "Japan",
    active: "1998–present",
    tags: ["hypnotic", "Future Terror", "minimal", "deep"],
    bio: "Founder of Future Terror and resident at AIR Tokyo. His marathon sets are known for their deep, hypnotic quality.",
    labels: ["Bitta", "Future Terror"]
  },
  {
    id: "setaoc-mass",
    name: "Setaoc Mass",
    city: "Berlin",
    country: "Germany",
    active: "2012–present",
    tags: ["hypnotic", "SK_eleven", "deep", "rolling"],
    bio: "Berlin-based producer known for hypnotic, rolling techno. Founder of SK_eleven label.",
    labels: ["SK_eleven", "Figure"]
  }
];

export const getArtistById = (id: string) => artists.find(a => a.id === id);
export const getArtistsByTag = (tag: string) => artists.filter(a => a.tags.includes(tag));
export const getArtistsByCountry = (country: string) => artists.filter(a => a.country === country);
