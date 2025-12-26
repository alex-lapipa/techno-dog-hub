import { Link } from "react-router-dom";
import { ArrowRight, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { crews } from "@/data/crews";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";

const CrewsPage = () => {
  const { language } = useLanguage();

  const typeLabels: Record<string, { en: string; es: string }> = {
    'sound system': { en: 'Sound System', es: 'Sound System' },
    'collective': { en: 'Collective', es: 'Colectivo' },
    'party series': { en: 'Party Series', es: 'Serie de Fiestas' },
    'rave crew': { en: 'Rave Crew', es: 'Crew de Rave' }
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": language === 'en' ? "Techno Crews & Collectives" : "Crews y Colectivos de Techno",
    "description": language === 'en' 
      ? "Sound systems, collectives and movements building the techno scene"
      : "Sound systems, colectivos y movimientos que construyen la escena techno",
    "numberOfItems": crews.length,
    "itemListElement": crews.map((crew, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Organization",
        "name": crew.name,
        "url": `https://techno.dog/crews/${crew.id}`
      }
    }))
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title={language === 'en' ? 'Techno Crews & Collectives' : 'Crews y Colectivos de Techno'}
        description={language === 'en' 
          ? 'The sound systems, collectives, and movements that build the techno scene worldwide.'
          : 'Los sound systems, colectivos y movimientos que construyen la escena techno mundial.'}
        path="/crews"
        locale={language}
        structuredData={itemListSchema}
      />
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-12 space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
              // {language === 'en' ? 'Archive' : 'Archivo'}
            </div>
            <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight">
              {language === 'en' ? 'Crews & Collectives' : 'Crews y Colectivos'}
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'The sound systems, collectives, and movements that build the scene.' 
                : 'Los sound systems, colectivos y movimientos que construyen la escena.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crews.map((crew) => (
              <Link
                key={crew.id}
                to={`/crews/${crew.id}`}
                className="group block border border-border p-6 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground border border-border px-2 py-1">
                      {typeLabels[crew.type]?.[language] || crew.type}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">
                    {crew.active ? (language === 'en' ? 'Active' : 'Activo') : (language === 'en' ? 'Inactive' : 'Inactivo')}
                  </span>
                </div>
                
                <h2 className="font-mono text-2xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                  {crew.name}
                </h2>
                
                <div className="font-mono text-sm text-muted-foreground mb-4">
                  {crew.city}, {crew.country}
                  {crew.founded && ` — ${language === 'en' ? 'Est.' : 'Fund.'} ${crew.founded}`}
                </div>
                
                {crew.description && (
                  <p className="font-mono text-xs text-muted-foreground line-clamp-2 mb-4">
                    {crew.description}
                  </p>
                )}

                {crew.ideology && (
                  <div className="border-l-2 border-foreground pl-4 mb-4">
                    <p className="font-mono text-xs text-muted-foreground italic line-clamp-2">
                      "{crew.ideology}"
                    </p>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {crew.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground group-hover:text-foreground">
                  <span>{language === 'en' ? 'View details' : 'Ver detalles'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 font-mono text-xs text-muted-foreground">
            {crews.length} {language === 'en' ? 'crews in archive' : 'crews en archivo'}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CrewsPage;
