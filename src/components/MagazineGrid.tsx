import { useLanguage } from "@/contexts/LanguageContext";
import FeaturedArticle from "./FeaturedArticle";
import EditorialBlock from "./EditorialBlock";

const articles = [
  {
    category: { en: "INTERVIEW", es: "ENTREVISTA" },
    title: { 
      en: "Helena Hauff: The Analog Architect", 
      es: "Helena Hauff: La Arquitecta Analógica" 
    },
    excerpt: { 
      en: "From Hamburg's Golden Pudel Club to global recognition, the electro pioneer discusses her uncompromising approach to hardware-only performances and the future of raw electronic music.",
      es: "Del Golden Pudel Club de Hamburgo al reconocimiento mundial, la pionera del electro habla sobre su enfoque intransigente de las actuaciones solo con hardware y el futuro de la música electrónica cruda."
    },
    readTime: "12 min",
    issue: "001",
    featured: true
  },
  {
    category: { en: "SCENE", es: "ESCENA" },
    title: { 
      en: "Tbilisi: The New Underground Capital", 
      es: "Tbilisi: La Nueva Capital Underground" 
    },
    excerpt: { 
      en: "How Bassiani and a generation of Georgian artists built one of the world's most vital techno scenes from the ground up.",
      es: "Cómo Bassiani y una generación de artistas georgianos construyeron una de las escenas techno más vitales del mundo desde cero."
    },
    readTime: "8 min",
    issue: "001",
    featured: false
  },
  {
    category: { en: "GEAR", es: "EQUIPO" },
    title: { 
      en: "The 303 Renaissance", 
      es: "El Renacimiento del 303" 
    },
    excerpt: { 
      en: "Why acid's iconic silver box continues to define the sound of underground dance music four decades later.",
      es: "Por qué la icónica caja plateada del acid sigue definiendo el sonido de la música dance underground cuatro décadas después."
    },
    readTime: "6 min",
    issue: "001",
    featured: false
  },
  {
    category: { en: "ESSAY", es: "ENSAYO" },
    title: { 
      en: "Detroit to Berlin: A Sonic Migration", 
      es: "Detroit a Berlín: Una Migración Sónica" 
    },
    excerpt: { 
      en: "Tracing the transatlantic journey of techno and how two cities shaped each other's musical identity through decades of exchange.",
      es: "Trazando el viaje transatlántico del techno y cómo dos ciudades moldearon la identidad musical de la otra a través de décadas de intercambio."
    },
    readTime: "15 min",
    issue: "001",
    featured: false
  }
];

const MagazineGrid = () => {
  const { language } = useLanguage();
  
  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container mx-auto px-4 md:px-8">
        {/* Section header */}
        <div className="mb-12 space-y-4">
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
            // {language === 'en' ? 'Editorial' : 'Editorial'}
          </div>
          <div className="flex items-end justify-between gap-8">
            <h2 className="font-mono text-3xl md:text-5xl uppercase tracking-tight text-foreground">
              {language === 'en' ? 'Issue #001' : 'Número #001'}
            </h2>
            <div className="hidden md:block font-mono text-xs text-muted-foreground uppercase tracking-wider">
              {language === 'en' ? 'December 2025' : 'Diciembre 2025'}
            </div>
          </div>
        </div>

        {/* Editorial quote */}
        <EditorialBlock 
          issue="001"
          pullQuote={{
            en: "Techno is not just music. It's a complete way of life.",
            es: "El techno no es solo música. Es una forma de vida completa."
          }}
          author="Jeff Mills"
        />

        {/* Articles grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {articles.map((article, index) => (
            <FeaturedArticle key={index} {...article} />
          ))}
        </div>

        {/* Bottom decoration */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em]">
              {language === 'en' 
                ? '4 articles in this issue' 
                : '4 artículos en este número'}
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              techno.dog © 2025 — {language === 'en' ? 'All rights reserved' : 'Todos los derechos reservados'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MagazineGrid;
