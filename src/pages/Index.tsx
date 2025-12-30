import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import DailySpotlight from "@/components/DailySpotlight";
import PageSEO from "@/components/PageSEO";
import { dogVariants, NerdyDog, DJDog, ModularDog, TravellerDog } from "@/components/DogPack";
import DogSilhouette from "@/components/DogSilhouette";

const Index = () => {
  useScrollDepth({ pageName: 'index' });

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "techno.dog",
    "url": "https://techno.dog",
    "logo": "https://techno.dog/og-image.png",
    "description": "Global techno culture archive - artists, festivals, venues, labels, and history from Detroit to Tbilisi",
    "foundingDate": "2024",
    "knowsAbout": ["Techno Music", "Electronic Music", "DJ Culture", "Music Festivals", "Record Labels"]
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "techno.dog",
    "url": "https://techno.dog",
    "description": "Discover the best techno festivals, artists, venues, and labels worldwide",
    "inLanguage": "en",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://techno.dog/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const faqItems = [
    {
      question: 'What is techno.dog?',
      answer: 'techno.dog is a comprehensive global techno culture archive featuring artists, festivals, venues, labels, crews, and gear from Detroit to Tbilisi, Tokyo to Bogotá.'
    },
    {
      question: 'What artists are featured on techno.dog?',
      answer: 'We feature legendary and contemporary techno artists including Jeff Mills, Underground Resistance, Surgeon, Helena Hauff, Paula Temple, Ben Klock, Marcel Dettmann, and many more from the global underground scene.'
    },
    {
      question: 'Which techno festivals are covered?',
      answer: 'We cover major techno festivals worldwide including Awakenings, Dekmantel, Movement Detroit, Time Warp, Neopop, Sónar, MELT, and underground gatherings across Europe, Americas, and Asia.'
    },
    {
      question: 'What venues and clubs are in the archive?',
      answer: 'Our archive includes iconic techno venues like Berghain, Tresor, Bassiani, Khidi, Concrete, De School, Fold, and legendary spots from Detroit to Melbourne.'
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  const combinedSchema = [organizationSchema, websiteSchema, faqSchema];

  // Primary Archive sections - aligned with top nav with doggy icons
  const archiveSections = [
    {
      title: 'Technopedia',
      description: 'The complete techno encyclopedia',
      path: '/technopedia',
      DogIcon: NerdyDog
    },
    {
      title: 'Artists',
      description: 'Producers & DJs shaping the sound',
      path: '/artists',
      DogIcon: DJDog
    },
    {
      title: 'Gear',
      description: 'Machines, synths & studio equipment',
      path: '/gear',
      DogIcon: ModularDog
    },
    {
      title: 'Scenes',
      description: 'Venues, festivals & global hubs',
      path: '/venues',
      DogIcon: TravellerDog
    }
  ];

  // Secondary content sections
  const contentSections = [
    {
      title: 'News',
      description: 'Latest transmissions from the underground',
      path: '/news',
      accent: true
    },
    {
      title: 'Festivals',
      description: 'Global gatherings that matter',
      path: '/festivals'
    },
    {
      title: 'Labels',
      description: 'The imprints defining the sound',
      path: '/labels'
    },
    {
      title: 'Releases',
      description: 'The records that define techno',
      path: '/releases'
    }
  ];

  // Tools & Services - aligned with colored nav tabs
  const toolsSections = [
    {
      title: 'Audio Lab',
      description: 'Synth experiments & sound design',
      path: '/sound-machine',
      color: 'bg-purple-500/20 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white'
    },
    {
      title: 'Developer API',
      description: 'Build with our techno database',
      path: '/developer',
      color: 'bg-blue-500/20 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white'
    },
    {
      title: 'Support',
      description: 'Help & community resources',
      path: '/support',
      color: 'bg-orange-500/20 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-white'
    },
    {
      title: 'Store',
      description: 'Merch & gear from the underground',
      path: '/store',
      color: 'bg-logo-green/20 border-logo-green text-logo-green hover:bg-logo-green hover:text-background'
    }
  ];

  const quickLinks = [
    { label: 'Crews', path: '/crews' },
    { label: 'Community', path: '/community' },
    { label: 'Submit', path: '/submit' },
    { label: 'Doggies', path: '/doggies' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Global Techno Culture Archive"
        description="Discover the global techno archive. Artists, festivals, venues, labels, and history from Detroit to Tbilisi, Tokyo to Bogotá."
        path="/"
        structuredData={combinedSchema}
      />
      <Header />
      
      <main className="pt-24 lg:pt-16">
        {/* Hero */}
        <section className="border-b border-border pt-4 sm:pt-0">
          <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="max-w-4xl">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                // Global Techno Knowledge Hub
              </div>
              <h1 className="font-mono text-4xl sm:text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">
                <span className="hover:animate-glitch inline-block">techno</span>
                <span className="text-muted-foreground">.</span>
                <span className="hover:animate-glitch inline-block">dog</span>
              </h1>
              
              {/* Mission Statement */}
              <p className="font-mono text-sm md:text-base text-foreground/90 leading-relaxed max-w-2xl mb-6 border-l-2 border-primary pl-4">
                A daily, open platform and database dedicated to underground techno culture — artists, clubs, festivals, machines and ideas. Strictly non-mainstream.
              </p>
              
              <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-2xl mb-8">
                The collaborative digital magazine and encyclopedia. From Detroit to Tbilisi, Tokyo to Bogotá.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/news" 
                  className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider border border-foreground px-6 py-3 hover:bg-foreground hover:text-background hover:animate-glitch transition-colors"
                >
                  Enter
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link 
                  to="/submit" 
                  className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider border border-border px-6 py-3 hover:border-foreground transition-colors"
                >
                  Contribute
                </Link>
                <Link 
                  to="/doggies" 
                  className="inline-flex items-center gap-2 font-mono text-sm uppercase tracking-wider border border-logo-green bg-logo-green/10 text-logo-green px-6 py-3 hover:bg-logo-green hover:text-background transition-colors"
                >
                  <DogSilhouette className="w-4 h-4" />
                  Doggies
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Primary Archive Grid - matches top nav */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-8">
              // The Archive
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {archiveSections.map((section) => (
                <Link
                  key={section.path}
                  to={section.path}
                  className="group block border border-foreground p-6 hover:bg-foreground hover:text-background transition-colors"
                >
                  <div className="w-10 h-10 mb-4">
                    <section.DogIcon className="w-full h-full" />
                  </div>
                  <h2 className="font-mono text-2xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                    {section.title}
                  </h2>
                  <p className="font-mono text-sm text-muted-foreground group-hover:text-current mb-4">
                    {section.description}
                  </p>
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Content Highlights - News, Festivals, Labels, Releases */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-8">
              // Latest & Featured
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contentSections.map((section) => (
                <Link
                  key={section.path}
                  to={section.path}
                  className={`group block border p-6 transition-colors ${
                    section.accent 
                      ? 'border-foreground bg-card hover:bg-foreground hover:text-background' 
                      : 'border-border hover:bg-card hover:border-foreground'
                  }`}
                >
                  <h3 className="font-mono text-xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                    {section.title}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground group-hover:text-current mb-4">
                    {section.description}
                  </p>
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                    <span>View</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Daily Spotlight */}
        <DailySpotlight />

        {/* Tools & Services - matches colored nav tabs */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-8">
              // Tools & Services
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {toolsSections.map((section) => (
                <Link
                  key={section.path}
                  to={section.path}
                  className={`group block border p-6 transition-all ${section.color}`}
                >
                  <h3 className="font-mono text-xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                    {section.title}
                  </h3>
                  <p className="font-mono text-xs opacity-80 group-hover:opacity-100 mb-4">
                    {section.description}
                  </p>
                  <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider">
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
                // Quick access
              </span>
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="font-mono text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground hover:animate-glitch transition-colors"
                >
                  → {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quote + Doggies Teaser */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quote */}
              <div className="border border-border p-6 flex flex-col justify-center">
                <blockquote className="font-mono text-xl md:text-2xl uppercase leading-tight tracking-tight mb-4">
                  "Techno is not just music. It's a complete way of life."
                </blockquote>
                <cite className="font-mono text-sm text-muted-foreground not-italic">
                  — Jeff Mills
                </cite>
              </div>

              {/* Doggies teaser */}
              <Link to="/doggies" className="group block border border-logo-green/50 p-6 hover:bg-logo-green/10 transition-colors">
                <div className="font-mono text-xs text-logo-green uppercase tracking-[0.3em] mb-4">
                  // Meet the pack
                </div>
                <h3 className="font-mono text-2xl uppercase tracking-tight mb-3 group-hover:animate-glitch">
                  Techno Doggies
                </h3>
                <div className="flex gap-2 mb-4">
                  {dogVariants.slice(0, 6).map((dog, index) => (
                    <div key={dog.name + index} className="w-10 h-10">
                      <dog.Component className="w-full h-full" />
                    </div>
                  ))}
                </div>
                <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground">
                  Get them all →
                </span>
              </Link>
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
              Frequently Asked Questions
            </h2>
            <div className="grid gap-6 max-w-3xl">
              {faqItems.map((item, index) => (
                <details key={index} className="group border border-border">
                  <summary className="font-mono text-sm md:text-base uppercase tracking-wide p-4 cursor-pointer hover:bg-card transition-colors list-none flex justify-between items-center">
                    <span>{item.question}</span>
                    <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="font-mono text-sm text-muted-foreground p-4 pt-0 leading-relaxed">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;