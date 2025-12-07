import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TechnoChat from "@/components/TechnoChat";

const Index = () => {
  const { language } = useLanguage();

  const featuredSections = [
    {
      title: { en: 'News', es: 'Noticias' },
      description: { en: 'Latest transmissions from the underground', es: 'Últimas transmisiones del underground' },
      path: '/news',
      accent: true
    },
    {
      title: { en: 'Festivals', es: 'Festivales' },
      description: { en: 'Global gatherings that matter', es: 'Encuentros globales que importan' },
      path: '/festivals'
    },
    {
      title: { en: 'Artists', es: 'Artistas' },
      description: { en: 'The producers and DJs shaping the sound', es: 'Los productores y DJs que dan forma al sonido' },
      path: '/artists'
    },
    {
      title: { en: 'Releases', es: 'Lanzamientos' },
      description: { en: 'The records that define techno', es: 'Los discos que definen el techno' },
      path: '/releases'
    },
    {
      title: { en: 'Mad Stuff', es: 'Locuras' },
      description: { en: 'Deep cuts, history, venues, crews', es: 'Cortes profundos, historia, clubs, crews' },
      path: '/mad'
    }
  ];

  const quickLinks = [
    { label: { en: 'Timeline', es: 'Cronología' }, path: '/mad/timeline' },
    { label: { en: 'Venues', es: 'Clubs' }, path: '/venues' },
    { label: { en: 'Labels', es: 'Sellos' }, path: '/labels' },
    { label: { en: 'Crews', es: 'Crews' }, path: '/crews' },
    { label: { en: 'Calendar', es: 'Calendario' }, path: '/mad/calendar' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-24 lg:pt-16">
        {/* Hero */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="max-w-4xl">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                // {language === 'en' ? 'Techno culture archive' : 'Archivo de cultura techno'}
              </div>
              <h1 className="font-mono text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">
                <span className="hover:animate-glitch inline-block">techno</span>
                <span className="text-muted-foreground">.</span>
                <span className="hover:animate-glitch inline-block">dog</span>
              </h1>
              <p className="font-mono text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8">
                {language === 'en' 
                  ? 'From Detroit to Tbilisi, Tokyo to Bogotá. The artists, the venues, the labels, the history. Go deep.' 
                  : 'De Detroit a Tbilisi, de Tokio a Bogotá. Los artistas, los clubs, los sellos, la historia. Profundiza.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/news" 
                  className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider border border-foreground px-6 py-3 hover:bg-foreground hover:text-background hover:animate-glitch transition-colors"
                >
                  {language === 'en' ? 'Enter' : 'Entrar'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main navigation grid */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSections.map((section) => (
                <Link
                  key={section.path}
                  to={section.path}
                  className={`group block border p-8 transition-colors ${
                    section.accent 
                      ? 'border-foreground bg-card hover:bg-foreground hover:text-background' 
                      : 'border-border hover:bg-card'
                  }`}
                >
                  <h2 className="font-mono text-3xl uppercase tracking-tight mb-3 group-hover:animate-glitch">
                    {section.title[language]}
                  </h2>
                  <p className="font-mono text-sm text-muted-foreground group-hover:text-current mb-6">
                    {section.description[language]}
                  </p>
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                    <span>{language === 'en' ? 'Explore' : 'Explorar'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick links */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
                // {language === 'en' ? 'Quick access' : 'Acceso rápido'}
              </span>
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:animate-glitch transition-colors"
                >
                  → {link.label[language]}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured content teasers */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Latest article teaser */}
              <Link to="/news" className="group block border border-border p-6 hover:bg-card transition-colors">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                  // {language === 'en' ? 'Latest' : 'Último'}
                </div>
                <h3 className="font-mono text-2xl uppercase tracking-tight mb-3 group-hover:animate-glitch">
                  {language === 'en' ? 'News & Features' : 'Noticias y Reportajes'}
                </h3>
                <p className="font-mono text-sm text-muted-foreground mb-4">
                  {language === 'en' 
                    ? 'The latest transmissions from the underground.' 
                    : 'Las últimas transmisiones del underground.'}
                </p>
                <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground">
                  {language === 'en' ? 'Read →' : 'Leer →'}
                </span>
              </Link>

              {/* Quote */}
              <div className="border border-border p-6 flex flex-col justify-center">
                <blockquote className="font-mono text-xl md:text-2xl uppercase leading-tight tracking-tight mb-4">
                  "{language === 'en' 
                    ? 'Techno is not just music. It\'s a complete way of life.' 
                    : 'El techno no es solo música. Es una forma de vida completa.'}"
                </blockquote>
                <cite className="font-mono text-sm text-muted-foreground not-italic">
                  — Jeff Mills
                </cite>
              </div>
            </div>
          </div>
        </section>

        {/* ASCII decoration */}
        <section className="border-b border-border overflow-hidden">
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="font-mono text-xs text-muted-foreground/30 leading-relaxed whitespace-pre overflow-x-auto">
{`░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░  DETROIT → BERLIN → TBILISI → TOKYO → BOGOTÁ → SÃO PAULO → MEXICO CITY → MELBOURNE  ░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`}
            </div>
          </div>
        </section>

        {/* AI Chat section */}
        <TechnoChat />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
