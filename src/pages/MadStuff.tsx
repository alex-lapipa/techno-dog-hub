import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { timeline } from "@/data/timeline";
import { venues } from "@/data/venues";
import { crews } from "@/data/crews";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MadStuffPage = () => {
  const { language } = useLanguage();

  const sections = [
    {
      id: 'timeline',
      title: { en: 'Timeline', es: 'Cronología' },
      description: { en: 'From Kraftwerk to now. The history of techno.', es: 'De Kraftwerk hasta ahora. La historia del techno.' },
      path: '/mad/timeline',
      count: timeline.length
    },
    {
      id: 'venues',
      title: { en: 'Venues', es: 'Clubs' },
      description: { en: 'The clubs, warehouses, and spaces where techno lives.', es: 'Los clubs, almacenes y espacios donde vive el techno.' },
      path: '/venues',
      count: venues.length
    },
    {
      id: 'crews',
      title: { en: 'Crews & Collectives', es: 'Crews y Colectivos' },
      description: { en: 'The movements that build the scene.', es: 'Los movimientos que construyen la escena.' },
      path: '/crews',
      count: crews.length
    },
    {
      id: 'map',
      title: { en: 'Map', es: 'Mapa' },
      description: { en: 'Global techno geography.', es: 'Geografía global del techno.' },
      path: '/mad/map',
    },
    {
      id: 'calendar',
      title: { en: 'Calendar', es: 'Calendario' },
      description: { en: 'Upcoming events. Non-commercial.', es: 'Próximos eventos. No comercial.' },
      path: '/mad/calendar',
    },
  ];

  // Random deep cuts
  const deepCuts = [
    { label: { en: 'Why Tresor changed everything', es: 'Por qué Tresor lo cambió todo' }, path: '/venues/tresor' },
    { label: { en: 'The Belleville Three', es: 'Los Tres de Belleville' }, path: '/mad/timeline' },
    { label: { en: 'Bassiani: Dance is protest', es: 'Bassiani: Bailar es protestar' }, path: '/venues/bassiani' },
    { label: { en: 'Robert Hood\'s Minimal Nation', es: 'Minimal Nation de Robert Hood' }, path: '/releases/minimal-nation' },
    { label: { en: 'Underground Resistance manifesto', es: 'Manifiesto de Underground Resistance' }, path: '/crews/underground-resistance-crew' },
    { label: { en: 'The Criminal Justice Act', es: 'La Ley de Justicia Criminal' }, path: '/mad/timeline' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 lg:pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-12 space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
              // {language === 'en' ? 'Deep cuts' : 'Cortes profundos'}
            </div>
            <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight">
              {language === 'en' ? 'Mad Stuff' : 'Locuras'}
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'The rabbit holes. The history. The places. The movements. Go deep.' 
                : 'Los agujeros de conejo. La historia. Los lugares. Los movimientos. Profundiza.'}
            </p>
          </div>

          {/* Main sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {sections.map((section) => (
              <Link
                key={section.id}
                to={section.path}
                className="group block border border-border p-6 hover:bg-card transition-colors"
              >
                <h2 className="font-mono text-2xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                  {section.title[language]}
                </h2>
                <p className="font-mono text-xs text-muted-foreground mb-4">
                  {section.description[language]}
                </p>
                {section.count && (
                  <div className="font-mono text-xs text-muted-foreground mb-4">
                    {section.count} {language === 'en' ? 'entries' : 'entradas'}
                  </div>
                )}
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground group-hover:text-foreground">
                  <span>{language === 'en' ? 'Explore' : 'Explorar'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Deep cuts */}
          <div className="border border-border p-6 mb-16">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-6">
              // {language === 'en' ? 'Start here' : 'Empieza aquí'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deepCuts.map((cut, i) => (
                <Link
                  key={i}
                  to={cut.path}
                  className="font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch transition-colors"
                >
                  → {cut.label[language]}
                </Link>
              ))}
            </div>
          </div>

          {/* ASCII decoration */}
          <div className="border border-border p-6 font-mono text-xs text-muted-foreground leading-relaxed whitespace-pre overflow-x-auto">
{`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   "Techno is not just music. It's a complete way of life."      ║
║                                                   — Jeff Mills   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
`}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MadStuffPage;
