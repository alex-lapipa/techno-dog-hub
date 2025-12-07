import { Calendar, MapPin, Ticket, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AquasellaSection = () => {
  return (
    <section
      id="aquasella"
      className="py-24 relative overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 font-body text-sm uppercase tracking-[0.3em] text-secondary">
                <Star className="w-4 h-4" />
                Festival Destacado
              </span>
              <h2 className="font-display text-4xl md:text-6xl font-black text-foreground">
                Aquasella
                <span className="block text-2xl md:text-3xl font-medium text-primary mt-2">
                  Asturias, España
                </span>
              </h2>
            </div>

            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Aquasella es uno de los festivales de música electrónica más
              emblemáticos de España. Celebrado en el corazón de Asturias, este
              evento reúne a los mejores artistas del techno mundial en un
              entorno natural incomparable, donde las montañas y los ríos crean
              una atmósfera mágica.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="gradient-card rounded-xl p-4 border border-border/50">
                <Calendar className="w-6 h-6 text-primary mb-2" />
                <div className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                  Fecha
                </div>
                <div className="font-body text-lg text-foreground">
                  14-17 Agosto 2025
                </div>
              </div>
              <div className="gradient-card rounded-xl p-4 border border-border/50">
                <MapPin className="w-6 h-6 text-primary mb-2" />
                <div className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                  Ubicación
                </div>
                <div className="font-body text-lg text-foreground">
                  Arriondas, Asturias
                </div>
              </div>
              <div className="gradient-card rounded-xl p-4 border border-border/50">
                <Ticket className="w-6 h-6 text-secondary mb-2" />
                <div className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                  Precio desde
                </div>
                <div className="font-body text-lg text-foreground">85€</div>
              </div>
              <div className="gradient-card rounded-xl p-4 border border-border/50">
                <Star className="w-6 h-6 text-accent mb-2" />
                <div className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                  Edición
                </div>
                <div className="font-body text-lg text-foreground">
                  28ª Edición
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg">
                Comprar Entradas
                <Ticket className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg">
                Más Información
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
            <div className="aspect-square relative rounded-2xl overflow-hidden border border-border/50 box-glow-cyan">
              <img
                src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80"
                alt="Aquasella Festival"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              
              {/* Floating badge */}
              <div className="absolute bottom-6 left-6 right-6 gradient-card backdrop-blur-md rounded-xl p-4 border border-primary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-xs uppercase tracking-wider text-primary">
                      Headliners 2025
                    </div>
                    <div className="font-body text-sm text-foreground mt-1">
                      Charlotte de Witte, Amelie Lens, Adam Beyer...
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center animate-beat">
                    <span className="font-display text-primary-foreground font-bold">
                      50+
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 border border-primary/30 rounded-xl animate-float" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-secondary/30 rounded-full animate-float" style={{ animationDelay: "2s" }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AquasellaSection;
