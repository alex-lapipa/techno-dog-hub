import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import DogSilhouette from "@/components/DogSilhouette";

const HeroSection = () => {
  const { t } = useLanguage();
  
  return (
    <section 
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background noise"
      aria-labelledby="hero-title"
      itemScope
      itemType="https://schema.org/WebPageElement"
    >
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" aria-hidden="true" />

      {/* Background text decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <div className="absolute top-1/4 left-0 right-0 opacity-[0.03] text-[20vw] font-mono font-bold leading-none whitespace-nowrap">
          TECHNO.DOG
        </div>
        <div className="absolute top-1/2 left-0 right-0 opacity-[0.02] text-[15vw] font-mono leading-none whitespace-nowrap animate-marquee">
          AQUASELLA • L.E.V. • AWAKENINGS • SÓNAR • TIME WARP • DEKMANTEL • AQUASELLA • L.E.V. • AWAKENINGS • SÓNAR • TIME WARP • DEKMANTEL •
        </div>
      </div>

      {/* Content - Two column layout */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 pt-20 pb-24">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Left column - Text content */}
          <div className="max-w-2xl space-y-12 flex-1">
            {/* Terminal header */}
            <div className="font-mono text-xs text-muted-foreground tracking-wider" aria-hidden="true">
              <span className="text-foreground">user@techno.dog</span>
              <span className="text-muted-foreground">:</span>
              <span className="text-foreground">~</span>
              <span className="text-muted-foreground">$ </span>
              <span className="animate-flicker">{t('hero.terminal')}</span>
              <span className="animate-blink">_</span>
            </div>

            {/* Main title */}
            <header className="space-y-4">
              <h1 
                id="hero-title"
                className="text-5xl md:text-7xl lg:text-8xl font-mono font-bold tracking-tight leading-[0.9]"
                itemProp="headline"
              >
                <span className="block text-foreground">
                  techno<span className="text-logo-green">.</span>dog
                </span>
                <span className="block text-foreground animate-glitch-hover text-2xl md:text-4xl lg:text-5xl mt-2">{t('hero.subtitle')}</span>
              </h1>
            </header>

            {/* Mission tagline */}
            <p 
              className="font-mono text-sm md:text-lg text-foreground/90 max-w-2xl leading-relaxed border-l-2 border-primary pl-4"
              itemProp="description"
            >
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
            <div className="flex flex-wrap gap-6 font-mono text-xs text-muted-foreground items-center">
              <Link to="/doggies" className="hover:text-foreground transition-colors underline underline-offset-4 flex items-center gap-1">
                <DogSilhouette className="w-3 h-3" />
                Doggies
              </Link>
              <Link 
                to="/support" 
                className="text-destructive hover:text-destructive/80 transition-colors underline underline-offset-4"
              >
                Support
              </Link>
            </div>

            {/* Stats */}
            <aside 
              className="grid grid-cols-3 gap-8 pt-12 border-t border-border"
              aria-label="Platform statistics"
              itemScope
              itemType="https://schema.org/AggregateRating"
            >
              <div itemProp="ratingCount">
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
            </aside>
          </div>

          {/* Right column - Techno Dog mascot */}
          <div className="hidden lg:flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <div className="relative">
              {/* Glow effect behind the dog */}
              <div className="absolute inset-0 blur-3xl bg-logo-green/10 rounded-full scale-150" />
              
              {/* Main Dog Silhouette - Leader of the pack */}
              <DogSilhouette 
                className="w-64 h-64 xl:w-80 xl:h-80 relative z-10 drop-shadow-[0_0_40px_hsl(100_100%_60%/0.4)] transition-transform duration-700 hover:scale-105 hover:rotate-3" 
                animated={false}
              />
              
              {/* Decorative ring */}
              <div className="absolute inset-0 border-2 border-logo-green/20 rounded-full scale-125 animate-pulse" style={{ animationDuration: '3s' }} />
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
