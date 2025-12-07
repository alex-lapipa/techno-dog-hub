import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-festival.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Festival techno"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
      </div>

      {/* Animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <span className="inline-block font-body text-sm uppercase tracking-[0.3em] text-primary animate-float">
              Tu guía de festivales techno en Europa
            </span>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-tight">
              <span className="block text-foreground">Descubre el</span>
              <span className="block gradient-text text-glow-cyan">
                Ritmo Europeo
              </span>
            </h1>
          </div>

          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explora los mejores festivales de música electrónica en Europa.
            Desde Aquasella en Asturias hasta los eventos más underground del
            continente.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button variant="hero" size="xl">
              Explorar Festivales
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="neon" size="xl">
              <Play className="w-5 h-5" />
              Ver Trailer
            </Button>
          </div>

          <div className="pt-12 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-primary text-glow-cyan">
                150+
              </div>
              <div className="font-body text-sm text-muted-foreground uppercase tracking-wider">
                Festivales
              </div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-secondary text-glow-magenta">
                25
              </div>
              <div className="font-body text-sm text-muted-foreground uppercase tracking-wider">
                Países
              </div>
            </div>
            <div className="text-center">
              <div className="font-display text-3xl md:text-4xl font-bold text-accent text-glow-purple">
                2M+
              </div>
              <div className="font-body text-sm text-muted-foreground uppercase tracking-wider">
                Asistentes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
