import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TechnoChat from "@/components/TechnoChat";
import DailySpotlight from "@/components/DailySpotlight";
import PageSEO from "@/components/PageSEO";

const Index = () => {
  const { language } = useLanguage();
  useScrollDepth({ pageName: 'index' });

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "techno.dog",
    "url": "https://techno.dog",
    "logo": "https://techno.dog/og-image.png",
    "description": language === 'en' 
      ? "Global techno culture archive - artists, festivals, venues, labels, and history from Detroit to Tbilisi"
      : "Archivo de cultura techno global - artistas, festivales, clubs, sellos e historia de Detroit a Tbilisi",
    "foundingDate": "2024",
    "knowsAbout": ["Techno Music", "Electronic Music", "DJ Culture", "Music Festivals", "Record Labels"]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "techno.dog",
    "url": "https://techno.dog",
    "description": language === 'en'
      ? "Discover the best techno festivals, artists, venues, and labels worldwide"
      : "Descubre los mejores festivales, artistas, clubs y sellos de techno del mundo",
    "inLanguage": ["en", "es"],
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://techno.dog/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const faqItems = [
    {
      question: { en: 'What is techno.dog?', es: '¿Qué es techno.dog?' },
      answer: { 
        en: 'techno.dog is a comprehensive global techno culture archive featuring artists, festivals, venues, labels, crews, and gear from Detroit to Tbilisi, Tokyo to Bogotá.', 
        es: 'techno.dog es un archivo completo de cultura techno global con artistas, festivales, clubs, sellos, crews y equipo de Detroit a Tbilisi, de Tokio a Bogotá.' 
      }
    },
    {
      question: { en: 'What artists are featured on techno.dog?', es: '¿Qué artistas aparecen en techno.dog?' },
      answer: { 
        en: 'We feature legendary and contemporary techno artists including Jeff Mills, Underground Resistance, Surgeon, Helena Hauff, Paula Temple, Ben Klock, Marcel Dettmann, and many more from the global underground scene.', 
        es: 'Presentamos artistas de techno legendarios y contemporáneos incluyendo Jeff Mills, Underground Resistance, Surgeon, Helena Hauff, Paula Temple, Ben Klock, Marcel Dettmann y muchos más de la escena underground global.' 
      }
    },
    {
      question: { en: 'Which techno festivals are covered?', es: '¿Qué festivales de techno están cubiertos?' },
      answer: { 
        en: 'We cover major techno festivals worldwide including Awakenings, Dekmantel, Movement Detroit, Time Warp, Neopop, Sónar, MELT, and underground gatherings across Europe, Americas, and Asia.', 
        es: 'Cubrimos los principales festivales de techno del mundo incluyendo Awakenings, Dekmantel, Movement Detroit, Time Warp, Neopop, Sónar, MELT y encuentros underground en Europa, América y Asia.' 
      }
    },
    {
      question: { en: 'What venues and clubs are in the archive?', es: '¿Qué clubs y locales están en el archivo?' },
      answer: { 
        en: 'Our archive includes iconic techno venues like Berghain, Tresor, Bassiani, Khidi, Concrete, De School, Fold, and legendary spots from Detroit to Melbourne.', 
        es: 'Nuestro archivo incluye locales icónicos de techno como Berghain, Tresor, Bassiani, Khidi, Concrete, De School, Fold y lugares legendarios de Detroit a Melbourne.' 
      }
    },
    {
      question: { en: 'Is techno.dog available in Spanish?', es: '¿techno.dog está disponible en español?' },
      answer: { 
        en: 'Yes, techno.dog is fully bilingual with complete English and Spanish language support across all pages and content.', 
        es: 'Sí, techno.dog es completamente bilingüe con soporte completo en inglés y español en todas las páginas y contenido.' 
      }
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question[language],
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer[language]
      }
    }))
  };

  const combinedSchema = [organizationSchema, websiteSchema, faqSchema];

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
      path: '/venues'
    }
  ];

  const quickLinks = [
    { label: { en: 'Venues', es: 'Clubs' }, path: '/venues' },
    { label: { en: 'Labels', es: 'Sellos' }, path: '/labels' },
    { label: { en: 'Crews', es: 'Crews' }, path: '/crews' },
    { label: { en: 'Gear', es: 'Equipo' }, path: '/gear' },
    { label: { en: 'User Stories', es: 'Historias' }, path: '/mad/stories' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title={language === 'en' ? 'Global Techno Culture Archive' : 'Archivo Global de Cultura Techno'}
        description={language === 'en' 
          ? 'Discover the global techno archive. Artists, festivals, venues, labels, and history from Detroit to Tbilisi, Tokyo to Bogotá.'
          : 'Descubre el archivo global de techno. Artistas, festivales, clubs, sellos e historia de Detroit a Tbilisi, Tokyo a Bogotá.'}
        path="/"
        locale={language}
        structuredData={combinedSchema}
      />
      <Header />
      
      <main className="pt-24 lg:pt-16">
        {/* Hero */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="max-w-4xl">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                // {language === 'en' ? 'Global Techno Knowledge Hub' : 'Centro Global de Conocimiento Techno'}
              </div>
              <h1 className="font-mono text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">
                <span className="hover:animate-glitch inline-block">techno</span>
                <span className="text-muted-foreground">.</span>
                <span className="hover:animate-glitch inline-block">dog</span>
              </h1>
              
              {/* Mission Statement */}
              <p className="font-mono text-sm md:text-base text-foreground/90 leading-relaxed max-w-2xl mb-6 border-l-2 border-primary pl-4">
                {language === 'en' 
                  ? 'A daily, open platform and database dedicated to underground techno culture — artists, clubs, festivals, machines and ideas. Strictly non-mainstream.' 
                  : 'Una plataforma abierta y diaria dedicada a la cultura techno underground — artistas, clubs, festivales, máquinas e ideas. Estrictamente no mainstream.'}
              </p>
              
              <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-2xl mb-8">
                {language === 'en' 
                  ? 'The collaborative digital magazine and encyclopedia. From Detroit to Tbilisi, Tokyo to Bogotá.' 
                  : 'La revista digital colaborativa y enciclopedia. De Detroit a Tbilisi, de Tokio a Bogotá.'}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/news" 
                  className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider border border-foreground px-6 py-3 hover:bg-foreground hover:text-background hover:animate-glitch transition-colors"
                >
                  {language === 'en' ? 'Enter' : 'Entrar'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  to="/submit" 
                  className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider border border-border px-6 py-3 hover:border-foreground transition-colors"
                >
                  {language === 'en' ? 'Contribute' : 'Contribuir'}
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

        {/* Daily Spotlight */}
        <DailySpotlight />
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

        {/* FAQ Section */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <h2 className="font-mono text-2xl md:text-3xl uppercase tracking-tight mb-8">
              {language === 'en' ? 'Frequently Asked Questions' : 'Preguntas Frecuentes'}
            </h2>
            <div className="grid gap-6 max-w-3xl">
              {faqItems.map((item, index) => (
                <details key={index} className="group border border-border">
                  <summary className="font-mono text-sm md:text-base uppercase tracking-wide p-4 cursor-pointer hover:bg-card transition-colors list-none flex justify-between items-center">
                    <span>{item.question[language]}</span>
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="font-mono text-sm text-muted-foreground p-4 pt-0 leading-relaxed">
                    {item.answer[language]}
                  </div>
                </details>
              ))}
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
