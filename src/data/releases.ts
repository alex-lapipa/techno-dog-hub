export interface Release {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  label: string;
  labelId?: string;
  year: number;
  format: ('vinyl' | 'digital' | 'CD' | 'cassette')[];
  tags: string[];
  bpm?: string;
  tracklist?: string[];
  description?: string;
}

export const releases: Release[] = [
  {
    id: "minimal-nation",
    title: "Minimal Nation",
    artist: "Robert Hood",
    artistId: "robert-hood",
    label: "Axis",
    labelId: "axis",
    year: 1994,
    format: ["vinyl"],
    tags: ["minimal", "essential", "Detroit", "blueprint"],
    bpm: "125-135",
    tracklist: ["Minus", "Moveable Parts", "Untitled (Home)", "The Pace"],
    description: "The album that defined minimal techno. Stripped to the bone. Pure machine soul."
  },
  {
    id: "waveform-transmission-1",
    title: "Waveform Transmission Vol.1",
    artist: "Jeff Mills",
    artistId: "jeff-mills",
    label: "Tresor",
    labelId: "tresor-records",
    year: 1992,
    format: ["vinyl"],
    tags: ["Detroit", "essential", "sci-fi", "classic"],
    bpm: "130-140",
    tracklist: ["Phase 4", "Changes of Life", "The Hacker", "Step to Enchantment"],
    description: "The Wizard's first transmission. Detroit techno at escape velocity."
  },
  {
    id: "force-mass-motion",
    title: "Force + Form",
    artist: "Surgeon",
    artistId: "surgeon",
    label: "Tresor",
    labelId: "tresor-records",
    year: 1996,
    format: ["vinyl", "CD"],
    tags: ["Birmingham", "industrial", "essential", "raw"],
    bpm: "130-145",
    description: "Birmingham's answer to Detroit. Raw, visceral, uncompromising."
  },
  {
    id: "qualm",
    title: "Qualm",
    artist: "Helena Hauff",
    artistId: "helena-hauff",
    label: "Ninja Tune",
    year: 2018,
    format: ["vinyl", "digital"],
    tags: ["electro", "acid", "album", "hardware"],
    bpm: "120-140",
    tracklist: ["Barrow Boot Boys", "Fag Butts in the Fire Bucket", "Hyper-Intelligent Genetically Enriched Cyborg"],
    description: "Hamburg's electro queen. Analog machines. No computer."
  },
  {
    id: "blood-from-stone",
    title: "Blood from Stone",
    artist: "Regis",
    artistId: "regis",
    label: "Downwards",
    labelId: "downwards",
    year: 1997,
    format: ["vinyl"],
    tags: ["industrial", "Birmingham", "dark", "essential"],
    bpm: "130-140",
    description: "Industrial techno from the Midlands. Dark as coal."
  },
  {
    id: "one",
    title: "One",
    artist: "Ben Klock",
    artistId: "ben-klock",
    label: "Klockworks",
    year: 2009,
    format: ["vinyl", "digital"],
    tags: ["Berghain", "driving", "Berlin", "classic"],
    bpm: "128-132",
    description: "The Klockworks blueprint. Berghain in a groove."
  },
  {
    id: "bitter-sweet",
    title: "Bitter Sweet",
    artist: "Blawan",
    artistId: "blawan",
    label: "R&S",
    year: 2018,
    format: ["vinyl", "digital"],
    tags: ["industrial", "modular", "UK", "album"],
    bpm: "130-145",
    description: "Modular machines meet industrial grit. No softness."
  },
  {
    id: "dissent",
    title: "Dissent",
    artist: "Perc",
    artistId: "perc",
    label: "Perc Trax",
    labelId: "perc-trax",
    year: 2017,
    format: ["vinyl", "digital"],
    tags: ["industrial", "noise", "UK", "album"],
    bpm: "130-150",
    description: "Noise and techno collide. Not for the faint of heart."
  },
  {
    id: "the-prototype",
    title: "The Prototype",
    artist: "Dax J",
    artistId: "dax-j",
    label: "Monnom Black",
    year: 2019,
    format: ["vinyl", "digital"],
    tags: ["hard", "driving", "peak-time", "album"],
    bpm: "135-145",
    description: "Peak-time techno. Built for the biggest rooms."
  },
  {
    id: "l-i-e-s",
    title: "L.I.E.S.",
    artist: "999999999",
    artistId: "999999999",
    label: "Mord",
    labelId: "mord",
    year: 2018,
    format: ["vinyl"],
    tags: ["acid", "hard", "Italian", "raw"],
    bpm: "140-150",
    description: "Acid from Rome. Twisted and relentless."
  },
  {
    id: "monad",
    title: "Monad",
    artist: "Rrose",
    artistId: "rrose",
    label: "Eaux",
    year: 2017,
    format: ["vinyl", "digital"],
    tags: ["experimental", "optical", "cerebral", "album"],
    bpm: "125-135",
    description: "Techno as optical illusion. Mind-bending."
  },
  {
    id: "asymmetric",
    title: "Asymmetric Warfare",
    artist: "Paula Temple",
    artistId: "paula-temple",
    label: "Noise Manifesto",
    year: 2019,
    format: ["vinyl", "digital"],
    tags: ["industrial", "noise", "powerful", "UK"],
    bpm: "135-150",
    description: "Industrial noise from the Birmingham underground."
  },
  {
    id: "floorplan-paradies",
    title: "Paradise",
    artist: "Floorplan",
    label: "M-Plant",
    labelId: "m-plant",
    year: 2016,
    format: ["vinyl", "digital"],
    tags: ["house", "gospel", "Detroit", "uplifting"],
    bpm: "122-126",
    description: "Robert Hood's house alias. Gospel meets the warehouse."
  },
  {
    id: "drexciya-quest",
    title: "Neptune's Lair",
    artist: "Drexciya",
    label: "Tresor",
    labelId: "tresor-records",
    year: 1999,
    format: ["vinyl", "CD"],
    tags: ["electro", "Detroit", "afrofuturism", "essential"],
    bpm: "125-145",
    description: "Underwater mythology. The deepest Detroit electro."
  },
  {
    id: "psyche-bfc",
    title: "Psyche",
    artist: "Carl Craig (as BFC)",
    label: "Planet E",
    year: 1992,
    format: ["vinyl"],
    tags: ["Detroit", "emotional", "classic", "essential"],
    bpm: "120-130",
    description: "Carl Craig at his most emotional. Detroit soul in machine form."
  }
];

export const getReleaseById = (id: string) => releases.find(r => r.id === id);
export const getReleasesByArtist = (artistId: string) => releases.filter(r => r.artistId === artistId);
export const getReleasesByLabel = (labelId: string) => releases.filter(r => r.labelId === labelId);
export const getReleasesByYear = (year: number) => releases.filter(r => r.year === year);
export const getReleasesByTag = (tag: string) => releases.filter(r => r.tags.includes(tag));
