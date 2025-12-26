import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import FlexibleSubmissionForm from "@/components/FlexibleSubmissionForm";
import { Database, Users, Heart, Globe, BookOpen, Github, Handshake, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const TechnopediaPage = () => {
  useScrollDepth({ pageName: 'technopedia' });
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Technopedia",
      subtitle: "The Open Techno Knowledge Base",
      intro: "An open-source, community-led data collaboration project dedicated to preserving and sharing the culture, history, and knowledge of global techno music. Free, transparent, and built together.",
      
      mission: {
        title: "Our Mission",
        text: "Techno culture has always been about community, collaboration, and sharing knowledge freely. Technopedia embodies these values by creating a permanent, open archive that belongs to everyone. No corporations, no gatekeepers — just the global techno community documenting its own history.",
        points: [
          "Open source code and open data — everything is transparent",
          "Community-owned — every contribution is credited and valued",
          "Non-commercial — no ads, no data harvesting, no hidden agendas",
          "Decentralized knowledge — from Detroit to Tbilisi, Tokyo to Bogotá",
          "Preservation first — documenting stories before they're lost to time"
        ]
      },

      sections: [
        {
          icon: Database,
          title: "The Archive",
          description: "An ever-growing collection of artists, labels, festivals, venues, and gear that shaped techno culture. From the Detroit originators to the latest Berlin residents, from forgotten warehouse parties to legendary clubs.",
          stats: [
            { label: "Artists", value: "130+" },
            { label: "Festivals", value: "150+" },
            { label: "Venues", value: "80+" },
            { label: "Labels", value: "200+" }
          ]
        },
        {
          icon: Globe,
          title: "Open & Free",
          description: "All data is publicly accessible and free to use. We believe techno knowledge belongs to everyone. No paywalls, no gatekeeping. Pure, unadulterated information for the community, by the community.",
        },
        {
          icon: Github,
          title: "Open Source",
          description: "Technopedia is built on open principles. Our data is freely accessible via our public API, and our methodologies are transparent. We welcome developers, researchers, and enthusiasts to use, extend, and improve upon our work.",
          cta: { label: "Developer API", path: "/developer" }
        },
        {
          icon: Users,
          title: "Community Built",
          description: "Every piece of information comes from people who live and breathe techno. DJs, producers, promoters, ravers, and enthusiasts contribute their knowledge to keep this archive accurate and alive.",
        },
        {
          icon: BookOpen,
          title: "Knowledge Conservation",
          description: "Techno history is often passed down through word of mouth and fading memories. We're creating a permanent record — documenting the stories, the sounds, and the people before they're lost to time.",
        },
        {
          icon: Heart,
          title: "Non-Commercial",
          description: "This is not a business. There are no ads, no data harvesting, no hidden agendas. Just a passion project from people who believe techno culture deserves to be preserved and shared freely.",
        }
      ],

      contribute: {
        title: "Contribute to the Archive",
        description: "Your knowledge matters. Whether you have photos from a legendary party, stories from the early scene, corrections to existing entries, or information about artists and venues we've missed — we want to hear from you.",
        examples: [
          "Share photos, flyers, and recordings from events",
          "Document local scenes and underground venues",
          "Correct or expand existing artist biographies",
          "Add information about labels and releases",
          "Translate content to reach more communities",
          "Share personal stories and historical context"
        ]
      },

      sponsor: {
        title: "Support the Project",
        description: "Running this platform takes time, resources, and dedication. We welcome support from individuals and brands that genuinely care about techno culture — not to influence content, but to keep this project free and sustainable for everyone.",
        note: "We only accept support from people and brands authentically connected to techno culture. No mainstream sponsors, no compromises.",
        cta: "Contact Us"
      }
    },
    es: {
      title: "Technopedia",
      subtitle: "La Base de Conocimiento Techno Abierta",
      intro: "Un proyecto de colaboración de datos de código abierto, liderado por la comunidad, dedicado a preservar y compartir la cultura, historia y conocimiento de la música techno global. Gratuito, transparente y construido juntos.",
      
      mission: {
        title: "Nuestra Misión",
        text: "La cultura techno siempre ha sido sobre comunidad, colaboración y compartir conocimiento libremente. Technopedia encarna estos valores creando un archivo permanente y abierto que pertenece a todos. Sin corporaciones, sin guardianes — solo la comunidad techno global documentando su propia historia.",
        points: [
          "Código abierto y datos abiertos — todo es transparente",
          "Propiedad comunitaria — cada contribución es acreditada y valorada",
          "No comercial — sin anuncios, sin recolección de datos, sin agendas ocultas",
          "Conocimiento descentralizado — de Detroit a Tbilisi, de Tokio a Bogotá",
          "Preservación primero — documentando historias antes de que se pierdan"
        ]
      },

      sections: [
        {
          icon: Database,
          title: "El Archivo",
          description: "Una colección en constante crecimiento de artistas, sellos, festivales, clubs y equipos que dieron forma a la cultura techno. Desde los originadores de Detroit hasta los últimos residentes de Berlín.",
          stats: [
            { label: "Artistas", value: "130+" },
            { label: "Festivales", value: "150+" },
            { label: "Clubs", value: "80+" },
            { label: "Sellos", value: "200+" }
          ]
        },
        {
          icon: Globe,
          title: "Abierto y Gratuito",
          description: "Todos los datos son públicamente accesibles y de uso gratuito. Creemos que el conocimiento techno pertenece a todos. Sin muros de pago, sin exclusividad.",
        },
        {
          icon: Github,
          title: "Código Abierto",
          description: "Technopedia está construido sobre principios abiertos. Nuestros datos son accesibles libremente a través de nuestra API pública, y nuestras metodologías son transparentes.",
          cta: { label: "API para Desarrolladores", path: "/developer" }
        },
        {
          icon: Users,
          title: "Construido por la Comunidad",
          description: "Cada pieza de información viene de personas que viven y respiran techno. DJs, productores, promotores y entusiastas contribuyen su conocimiento.",
        },
        {
          icon: BookOpen,
          title: "Conservación del Conocimiento",
          description: "La historia del techno a menudo se transmite de boca en boca y memorias que se desvanecen. Estamos creando un registro permanente.",
        },
        {
          icon: Heart,
          title: "No Comercial",
          description: "Esto no es un negocio. No hay anuncios, no hay recolección de datos, no hay agendas ocultas. Solo un proyecto de pasión.",
        }
      ],

      contribute: {
        title: "Contribuye al Archivo",
        description: "Tu conocimiento importa. Ya sea que tengas fotos de una fiesta legendaria, historias de la escena temprana, correcciones a entradas existentes, o información sobre artistas y clubs — queremos escucharte.",
        examples: [
          "Comparte fotos, flyers y grabaciones de eventos",
          "Documenta escenas locales y clubs underground",
          "Corrige o expande biografías de artistas existentes",
          "Añade información sobre sellos y lanzamientos",
          "Traduce contenido para llegar a más comunidades",
          "Comparte historias personales y contexto histórico"
        ]
      },

      sponsor: {
        title: "Apoya el Proyecto",
        description: "Mantener esta plataforma requiere tiempo, recursos y dedicación. Damos la bienvenida al apoyo de individuos y marcas que genuinamente se preocupan por la cultura techno.",
        note: "Solo aceptamos apoyo de personas y marcas auténticamente conectadas con la cultura techno. Sin patrocinadores mainstream, sin compromisos.",
        cta: "Contáctanos"
      }
    }
  };

  const t = content[language];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Technopedia - The Open Techno Knowledge Base",
    "description": t.intro,
    "url": "https://techno.dog/technopedia"
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title={`${t.title} | ${t.subtitle}`}
        description={t.intro}
        path="/technopedia"
        locale={language}
        structuredData={structuredData}
      />
      <Header />
      
      <main className="pt-20 sm:pt-24 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero */}
          <div className="max-w-4xl mb-16 sm:mb-20">
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
              // {language === 'en' ? 'Open Knowledge' : 'Conocimiento Abierto'}
            </div>
            <h1 className="font-mono text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight mb-6">
              {t.title}
            </h1>
            <p className="font-mono text-lg sm:text-xl text-logo-green mb-6">
              {t.subtitle}
            </p>
            <p className="font-mono text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t.intro}
            </p>
          </div>

          {/* Mission Statement */}
          <div className="border border-logo-green/30 bg-logo-green/5 p-6 sm:p-10 mb-12 sm:mb-16">
            <div className="flex items-start gap-4 mb-6">
              <Sparkles className="w-8 h-8 text-logo-green flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-mono text-2xl sm:text-3xl uppercase tracking-wide mb-4">
                  {t.mission.title}
                </h2>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-6">
                  {t.mission.text}
                </p>
                <ul className="space-y-2">
                  {t.mission.points.map((point, i) => (
                    <li key={i} className="font-mono text-xs text-foreground flex items-start gap-2">
                      <span className="text-logo-green mt-0.5">◆</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Sections */}
          <div className="grid gap-8 sm:gap-10 mb-16 sm:mb-20">
            {t.sections.map((section, index) => (
              <div 
                key={index}
                className="border border-border p-6 sm:p-8 hover:border-logo-green/30 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 border border-border flex items-center justify-center group-hover:border-logo-green/50 transition-colors">
                      <section.icon className="w-6 h-6 text-logo-green" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-wide mb-4 group-hover:text-logo-green transition-colors">
                      {section.title}
                    </h2>
                    <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-4">
                      {section.description}
                    </p>
                    
                    {section.stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
                        {section.stats.map((stat, i) => (
                          <div key={i}>
                            <div className="font-mono text-2xl sm:text-3xl text-foreground">{stat.value}</div>
                            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {section.cta && (
                      <Link to={section.cta.path}>
                        <Button variant="outline" size="sm" className="mt-4 hover:bg-logo-green hover:text-background hover:border-logo-green">
                          {section.cta.label}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contribute Section with Form */}
          <div id="contribute" className="border border-logo-green/30 bg-card mb-12 sm:mb-16">
            <div className="p-6 sm:p-10 border-b border-border">
              <div className="flex items-start gap-4 mb-6">
                <Handshake className="w-8 h-8 text-logo-green flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-mono text-2xl sm:text-3xl uppercase tracking-wide mb-2">
                    {t.contribute.title}
                  </h2>
                  <p className="font-mono text-sm text-muted-foreground">
                    {t.contribute.description}
                  </p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3 pl-12">
                {t.contribute.examples.map((item, i) => (
                  <div key={i} className="font-mono text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-logo-green">→</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 sm:p-10">
              <FlexibleSubmissionForm />
            </div>
          </div>

          {/* Sponsor Section */}
          <div className="border border-border p-6 sm:p-10 mb-12">
            <div className="flex items-start gap-4 mb-6">
              <Gift className="w-8 h-8 text-logo-green flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-mono text-2xl sm:text-3xl uppercase tracking-wide mb-2">
                  {t.sponsor.title}
                </h2>
                <p className="font-mono text-sm text-muted-foreground mb-4">
                  {t.sponsor.description}
                </p>
                <p className="font-mono text-xs text-logo-green/80 italic">
                  {t.sponsor.note}
                </p>
              </div>
            </div>
            
            <div className="pl-12 mt-6">
              <a href="mailto:hello@techno.dog">
                <Button variant="outline" className="hover:bg-logo-green hover:text-background hover:border-logo-green">
                  {t.sponsor.cta}
                </Button>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t border-border">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-6">
              // {language === 'en' ? 'Explore the Archive' : 'Explora el Archivo'}
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: language === 'en' ? 'Artists' : 'Artistas', path: '/artists' },
                { label: language === 'en' ? 'Festivals' : 'Festivales', path: '/festivals' },
                { label: language === 'en' ? 'Venues' : 'Clubs', path: '/venues' },
                { label: language === 'en' ? 'Labels' : 'Sellos', path: '/labels' },
                { label: language === 'en' ? 'Gear' : 'Equipo', path: '/gear' },
                { label: language === 'en' ? 'Developer API' : 'API para Desarrolladores', path: '/developer' },
              ].map((link) => (
                <Link key={link.path} to={link.path}>
                  <Button variant="outline" size="sm" className="hover:text-logo-green hover:border-logo-green">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TechnopediaPage;