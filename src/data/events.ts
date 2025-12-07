export interface Event {
  id: string;
  name: string;
  venue: string;
  venueId?: string;
  city: string;
  country: string;
  date: string;
  endDate?: string;
  artists: string[];
  tags: string[];
  type: 'club night' | 'festival' | 'free party' | 'warehouse' | 'outdoor';
}

// Non-commercial calendar - informational only, no ticket links
export const events: Event[] = [
  {
    id: "tresor-nye-2025",
    name: "Tresor NYE",
    venue: "Tresor",
    venueId: "tresor",
    city: "Berlin",
    country: "Germany",
    date: "2025-12-31",
    endDate: "2026-01-01",
    artists: ["Surgeon", "DVS1", "Rødhåd"],
    tags: ["NYE", "marathon", "historic"],
    type: "club night"
  },
  {
    id: "dekmantel-2025",
    name: "Dekmantel Festival 2025",
    venue: "Amsterdamse Bos",
    city: "Amsterdam",
    country: "Netherlands",
    date: "2025-08-06",
    endDate: "2025-08-10",
    artists: ["DJ Nobu", "Helena Hauff", "Ben Klock", "Objekt"],
    tags: ["festival", "curated", "essential"],
    type: "festival"
  },
  {
    id: "awakenings-summer-2025",
    name: "Awakenings Summer Festival",
    venue: "Spaarnwoude",
    city: "Amsterdam",
    country: "Netherlands",
    date: "2025-07-05",
    endDate: "2025-07-06",
    artists: ["Adam Beyer", "Amelie Lens", "I Hate Models"],
    tags: ["massive", "outdoor", "Dutch"],
    type: "festival"
  },
  {
    id: "movement-2025",
    name: "Movement Detroit 2025",
    venue: "Hart Plaza",
    city: "Detroit",
    country: "USA",
    date: "2025-05-24",
    endDate: "2025-05-26",
    artists: ["Jeff Mills", "Kevin Saunderson", "Carl Craig"],
    tags: ["Detroit", "origin city", "essential"],
    type: "festival"
  },
  {
    id: "lev-2025",
    name: "L.E.V. Festival 2025",
    venue: "LABoral Centro de Arte",
    city: "Gijón",
    country: "Spain",
    date: "2025-05-08",
    endDate: "2025-05-11",
    artists: ["Ryoji Ikeda", "Donato Dozzy"],
    tags: ["audiovisual", "experimental", "Asturias"],
    type: "festival"
  },
  {
    id: "aquasella-2025",
    name: "Aquasella 2025",
    venue: "Arriondas",
    city: "Arriondas",
    country: "Spain",
    date: "2025-08-14",
    endDate: "2025-08-17",
    artists: ["Charlotte de Witte", "Amelie Lens", "Adam Beyer"],
    tags: ["outdoor", "river", "Asturias"],
    type: "festival"
  },
  {
    id: "time-warp-2025",
    name: "Time Warp 2025",
    venue: "Maimarkthalle",
    city: "Mannheim",
    country: "Germany",
    date: "2025-04-05",
    endDate: "2025-04-06",
    artists: ["Sven Väth", "Richie Hawtin", "Nina Kraviz"],
    tags: ["marathon", "German", "legendary"],
    type: "club night"
  },
  {
    id: "atonal-2025",
    name: "Berlin Atonal 2025",
    venue: "Kraftwerk Berlin",
    city: "Berlin",
    country: "Germany",
    date: "2025-08-20",
    endDate: "2025-08-24",
    artists: ["Rrose", "Shackleton", "Emptyset"],
    tags: ["experimental", "avant-garde", "audiovisual"],
    type: "festival"
  },
  {
    id: "unsound-2025",
    name: "Unsound 2025",
    venue: "Various",
    city: "Kraków",
    country: "Poland",
    date: "2025-10-12",
    endDate: "2025-10-19",
    artists: ["TBA"],
    tags: ["experimental", "thematic", "Polish"],
    type: "festival"
  },
  {
    id: "mira-2025",
    name: "MIRA Festival 2025",
    venue: "Various",
    city: "Barcelona",
    country: "Spain",
    date: "2025-11-07",
    endDate: "2025-11-09",
    artists: ["TBA"],
    tags: ["audiovisual", "digital art", "Barcelona"],
    type: "festival"
  },
  {
    id: "sonar-2025",
    name: "Sónar 2025",
    venue: "Fira Gran Via",
    city: "Barcelona",
    country: "Spain",
    date: "2025-06-19",
    endDate: "2025-06-21",
    artists: ["TBA"],
    tags: ["massive", "diverse", "Barcelona"],
    type: "festival"
  },
  {
    id: "labyrinth-2025",
    name: "Labyrinth 2025",
    venue: "Naeba Greenland",
    city: "Niigata",
    country: "Japan",
    date: "2025-09-20",
    endDate: "2025-09-22",
    artists: ["Donato Dozzy", "DJ Nobu", "Wata Igarashi"],
    tags: ["hypnotic", "nature", "Japanese"],
    type: "festival"
  }
];

export const getEventById = (id: string) => events.find(e => e.id === id);
export const getEventsByMonth = (month: number, year: number) => 
  events.filter(e => {
    const date = new Date(e.date);
    return date.getMonth() + 1 === month && date.getFullYear() === year;
  });
export const getEventsByCity = (city: string) => events.filter(e => e.city === city);
export const getUpcomingEvents = () => {
  const now = new Date();
  return events.filter(e => new Date(e.date) >= now).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};
