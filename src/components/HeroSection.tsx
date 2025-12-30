import { ArrowRight, Dog } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background noise">
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* Background text decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-1/4 left-0 right-0 opacity-[0.03] text-[20vw] font-mono font-bold leading-none whitespace-nowrap">
          TECHNO.DOG
        </div>
        <div className="absolute top-1/2 left-0 right-0 opacity-[0.02] text-[15vw] font-mono leading-none whitespace-nowrap animate-marquee">
          AQUASELLA • L.E.V. • AWAKENINGS • SÓNAR • TIME WARP • DEKMANTEL • AQUASELLA • L.E.V. • AWAKENINGS • SÓNAR • TIME WARP • DEKMANTEL •
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 pt-20 pb-24">
        <div className="max-w-4xl space-y-12">
          {/* Terminal header */}
          <div className="font-mono text-xs text-muted-foreground tracking-wider">
            <span className="text-foreground">user@techno.dog</span>
            <span className="text-muted-foreground">:</span>
            <span className="text-foreground">~</span>
            <span className="text-muted-foreground">$ </span>
            <span className="animate-flicker">{t('hero.terminal')}</span>
            <span className="animate-blink">_</span>
          </div>

          {/* Main title */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-mono font-bold tracking-tight leading-[0.9]">
              <span className="block text-foreground">
                techno<span className="text-logo-green">.</span>dog
              </span>
              <span className="block text-foreground animate-glitch-hover text-2xl md:text-4xl lg:text-5xl mt-2">{t('hero.subtitle')}</span>
            </h1>
          </div>

          {/* Mission tagline */}
          <p className="font-mono text-sm md:text-lg text-foreground/90 max-w-2xl leading-relaxed border-l-2 border-primary pl-4">
            {t('hero.tagline')}
          </p>

          {/* Description */}
          <p className="font-mono text-xs md:text-sm text-muted-foreground max-w-xl leading-relaxed tracking-wide">
            {t('hero.description')}
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button variant="brutalist" size="lg">
              {t('hero.explore')}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="terminal" size="lg">
              Aquasella 2025
            </Button>
          </div>

          {/* Secondary links */}
          <div className="flex flex-wrap gap-6 font-mono text-xs text-muted-foreground">
            <Link to="/submit" className="hover:text-foreground transition-colors underline underline-offset-4">
              Contribute
            </Link>
            <Link to="/doggies" className="hover:text-foreground transition-colors underline underline-offset-4 flex items-center gap-1">
              <Dog className="w-3 h-3" />
              Doggies
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-border">
            <div>
              <div className="font-mono text-3xl md:text-4xl font-bold text-foreground">
                150+
              </div>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
                {t('hero.festivals')}
              </div>
            </div>
            <div>
              <div className="font-mono text-3xl md:text-4xl font-bold text-foreground">
                25
              </div>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
                {t('hero.countries')}
              </div>
            </div>
            <div>
              <div className="font-mono text-3xl md:text-4xl font-bold text-foreground">
                2M+
              </div>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
                {t('hero.attendees')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 font-mono text-xs text-muted-foreground">
        <span className="animate-float-slow inline-block">{t('hero.scroll')}</span>
      </div>
    </section>
  );
};

export default HeroSection;
