import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import alexLaunchHero from '@/assets/alex-launch-hero.png';

const DailySpotlight = () => {
  return (
    <section className="border-b border-border">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-6">
          // Daily spotlight
        </div>
        
        {/* Hero Banner - matching Alex's launch note */}
        <Link 
          to="/news/article/a0000001-0001-0001-0001-000000000001"
          className="group block relative w-full overflow-hidden border border-border hover:border-logo-green/50 transition-colors"
        >
          {/* Background image with blended edges and VHS effect */}
          <div className="absolute inset-0 flex items-center justify-end pr-8 transition-transform duration-700 group-hover:scale-105">
            <div className="relative h-[130%] w-auto">
              <img 
                src={alexLaunchHero} 
                alt="" 
                className="h-full w-auto max-w-none object-contain opacity-70 transition-all duration-500 group-hover:opacity-85"
                style={{
                  maskImage: 'radial-gradient(ellipse 80% 80% at 60% 50%, black 30%, transparent 70%)',
                  WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 60% 50%, black 30%, transparent 70%)',
                }}
              />
              {/* VHS overlay on image */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-80 group-hover:opacity-50 transition-opacity duration-500"
                style={{
                  background: `
                    repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px),
                    radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%),
                    linear-gradient(to top, rgba(220,38,38,0.08), rgba(0,255,136,0.03))
                  `,
                }}
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          
          {/* Accent lines */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-destructive via-logo-green/50 to-transparent" />
          
          {/* Content */}
          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            <div className="max-w-2xl">
              {/* Tags */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest border-destructive text-destructive bg-background/80 hover:bg-destructive hover:text-white transition-colors duration-300">
                  Global
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest border-logo-green/70 text-logo-green bg-background/80 hover:bg-logo-green hover:text-background transition-colors duration-300">
                  Techno
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest border-logo-green/70 text-logo-green bg-background/80 hover:bg-logo-green hover:text-background transition-colors duration-300">
                  Community
                </Badge>
              </div>

              {/* Title with hover effect */}
              <h3 className="font-mono text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-tight leading-[1.1] text-foreground mb-4 transition-all duration-300 group-hover:text-logo-green">
                Welcome to techno.dog
              </h3>

              {/* Subtitle */}
              <p className="font-mono text-sm md:text-base text-muted-foreground leading-relaxed mb-6 group-hover:text-foreground transition-colors duration-300">
                An open-source archive and community platform for global techno culture — from Detroit to Tbilisi and everywhere in between.
              </p>

              {/* Byline with colored accents */}
              <div className="flex items-center gap-3 font-mono text-xs pt-4 border-t border-border group-hover:border-logo-green/30 transition-colors">
                <span className="font-semibold text-destructive group-hover:text-white transition-colors duration-300">By Alex Techno Dog LA PIPA</span>
                <span className="text-logo-green">|</span>
                <span className="text-muted-foreground group-hover:text-logo-green transition-colors duration-300">Read the launch note</span>
                <ArrowRight className="w-4 h-4 text-logo-green group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default DailySpotlight;
