import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background noise">
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* Background text decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-1/4 left-0 right-0 opacity-[0.03] text-[20vw] font-mono font-bold leading-none whitespace-nowrap">
          TECHNO_EUROPA
        </div>
        <div className="absolute top-1/2 left-0 right-0 opacity-[0.02] text-[15vw] font-mono leading-none whitespace-nowrap animate-marquee">
          AQUASELLA • L.E.V. • AWAKENINGS • SÓNAR • TIME WARP • DEKMANTEL • AQUASELLA • L.E.V. • AWAKENINGS • SÓNAR • TIME WARP • DEKMANTEL •
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 pt-20">
        <div className="max-w-4xl space-y-12">
          {/* Terminal header */}
          <div className="font-mono text-xs text-muted-foreground tracking-wider">
            <span className="text-foreground">user@technofest</span>
            <span className="text-muted-foreground">:</span>
            <span className="text-foreground">~</span>
            <span className="text-muted-foreground">$ </span>
            <span className="animate-flicker">cat /festivales/europa/2025</span>
            <span className="animate-blink">_</span>
          </div>

          {/* Main title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-mono font-bold tracking-tight leading-[0.9]">
              <span className="block text-foreground">Festivales</span>
              <span className="block text-foreground animate-glitch-hover">Techno Europa</span>
            </h1>
          </div>

          {/* Description */}
          <p className="font-mono text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed tracking-wide">
            Portal de música electrónica experimental y cultura techno.
            Aquasella, L.E.V., y los eventos más relevantes del continente.
            <span className="text-foreground"> [ES/EN/FR]</span>
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button variant="brutalist" size="lg">
              Explorar festivales
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="terminal" size="lg">
              Aquasella 2025
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-border">
            <div>
              <div className="font-mono text-3xl md:text-4xl font-bold text-foreground">
                150+
              </div>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
                Festivales
              </div>
            </div>
            <div>
              <div className="font-mono text-3xl md:text-4xl font-bold text-foreground">
                25
              </div>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
                Países
              </div>
            </div>
            <div>
              <div className="font-mono text-3xl md:text-4xl font-bold text-foreground">
                2M+
              </div>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
                Asistentes
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground">
        <span className="animate-float-slow inline-block">[ scroll ]</span>
      </div>
    </section>
  );
};

export default HeroSection;
