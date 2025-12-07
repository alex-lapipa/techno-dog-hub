import FestivalCard from "./FestivalCard";

const festivals = [
  {
    name: "Aquasella",
    location: "Arriondas, Asturias",
    date: "Agosto 2025",
    attendees: "50,000+",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80",
    featured: true,
  },
  {
    name: "Awakenings",
    location: "Ámsterdam, Países Bajos",
    date: "Julio 2025",
    attendees: "80,000+",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
  },
  {
    name: "Time Warp",
    location: "Mannheim, Alemania",
    date: "Abril 2025",
    attendees: "15,000+",
    image: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80",
  },
  {
    name: "Sónar",
    location: "Barcelona, España",
    date: "Junio 2025",
    attendees: "126,000+",
    image: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80",
  },
  {
    name: "Dekmantel",
    location: "Ámsterdam, Países Bajos",
    date: "Agosto 2025",
    attendees: "25,000+",
    image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
  },
];

const FestivalsSection = () => {
  return (
    <section id="festivales" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <span className="inline-block font-body text-sm uppercase tracking-[0.3em] text-primary">
            Próximos Eventos
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            Festivales <span className="gradient-text">Destacados</span>
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Los mejores festivales de música electrónica que no te puedes perder
            esta temporada.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {festivals.map((festival, index) => (
            <FestivalCard key={index} {...festival} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FestivalsSection;
