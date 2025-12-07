import { ArrowUpRight } from "lucide-react";

interface FestivalCardProps {
  name: string;
  location: string;
  date: string;
  index: number;
}

const FestivalCard = ({ name, location, date, index }: FestivalCardProps) => {
  return (
    <a
      href={`#${name.toLowerCase().replace(/\s/g, "-")}`}
      className="group block border-b border-border py-6 hover:bg-muted/30 transition-colors px-4 -mx-4"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-6">
          {/* Index */}
          <span className="font-mono text-xs text-muted-foreground w-8">
            {String(index).padStart(2, "0")}
          </span>

          {/* Name */}
          <h3 className="font-mono text-lg md:text-xl uppercase tracking-wide text-foreground group-hover:animate-glitch">
            {name}
          </h3>
        </div>

        <div className="flex items-center gap-8">
          {/* Location */}
          <span className="hidden md:block font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {location}
          </span>

          {/* Date */}
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {date}
          </span>

          {/* Arrow */}
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
        </div>
      </div>
    </a>
  );
};

const festivals = [
  { name: "Aquasella", location: "Arriondas, Asturias", date: "Ago 2025" },
  { name: "L.E.V. Festival", location: "Gijón, Asturias", date: "May 2025" },
  { name: "Sónar", location: "Barcelona", date: "Jun 2025" },
  { name: "Awakenings", location: "Ámsterdam", date: "Jul 2025" },
  { name: "Dekmantel", location: "Ámsterdam", date: "Ago 2025" },
  { name: "Time Warp", location: "Mannheim", date: "Abr 2025" },
  { name: "Mira Festival", location: "Barcelona", date: "Nov 2025" },
  { name: "Atonal", location: "Berlín", date: "Ago 2025" },
];

const FestivalsSection = () => {
  return (
    <section id="festivales" className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            // Próximos eventos
          </div>
          <h2 className="font-mono text-3xl md:text-4xl uppercase tracking-wide text-foreground">
            Festivales 2025
          </h2>
        </div>

        {/* List */}
        <div className="border-t border-border">
          {festivals.map((festival, index) => (
            <FestivalCard key={festival.name} {...festival} index={index + 1} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 font-mono text-xs text-muted-foreground">
          Mostrando {festivals.length} de 150+ festivales
        </div>
      </div>
    </section>
  );
};

export default FestivalsSection;
