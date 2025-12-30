import { Link } from "react-router-dom";
import { ArrowRight, Dog } from "lucide-react";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import DailySpotlight from "@/components/DailySpotlight";
import PageSEO from "@/components/PageSEO";
import { dogVariants } from "@/components/DogPack";

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

  const featuredSections = [
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
      title: 'Artists',
      description: 'The producers and DJs shaping the sound',
      path: '/artists'
    },
    {
      title: 'Releases',
      description: 'The records that define techno',
      path: '/releases'
    },
    {
      title: 'Mad Stuff',
      description: 'Deep cuts, history, venues, crews',
      path: '/venues'
    }
  ];

  const quickLinks = [
    { label: 'Venues', path: '/venues' },
    { label: 'Labels', path: '/labels' },
    { label: 'Crews', path: '/crews' },
    { label: 'Gear', path: '/gear' },
    { label: 'User Stories', path: '/mad/stories' },
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
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="max-w-4xl">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                // Global Techno Knowledge Hub
              </div>
              <h1 className="font-mono text-5xl md:text-7xl lg:text-8xl uppercase tracking-tight mb-6">
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
                  <Dog className="w-4 h-4" />
                  Doggies
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
                    {section.title}
                  </h2>
                  <p className="font-mono text-sm text-muted-foreground group-hover:text-current mb-6">
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

        {/* Daily Spotlight */}
        <DailySpotlight />
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

        {/* Featured content teasers */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Latest article teaser */}
              <Link to="/news" className="group block border border-border p-6 hover:bg-card transition-colors">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                  // Latest
                </div>
                <h3 className="font-mono text-2xl uppercase tracking-tight mb-3 group-hover:animate-glitch">
                  News & Features
                </h3>
                <p className="font-mono text-sm text-muted-foreground mb-4">
                  The latest transmissions from the underground.
                </p>
                <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground">
                  Read →
                </span>
              </Link>

              {/* Quote */}
              <div className="border border-border p-6 flex flex-col justify-center">
                <blockquote className="font-mono text-xl md:text-2xl uppercase leading-tight tracking-tight mb-4">
                  "Techno is not just music. It's a complete way of life."
                </blockquote>
                <cite className="font-mono text-sm text-muted-foreground not-italic">
                  — Jeff Mills
                </cite>
              </div>
            </div>
          </div>
        </section>

        {/* Meet the Pack */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">
                  // Meet the full pack
                </div>
                <h2 className="font-mono text-2xl md:text-3xl uppercase tracking-tight">
                  Techno Doggies
                </h2>
              </div>
              <Link 
                to="/doggies" 
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                Get them all →
              </Link>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {dogVariants.slice(0, 20).map((dog, index) => (
                <Link
                  key={dog.name + index}
                  to="/doggies"
                  className="group aspect-square border border-border p-2 hover:bg-card hover:border-foreground transition-colors flex items-center justify-center"
                  title={dog.name}
                >
                  <dog.Component className="w-full h-full" />
                </Link>
              ))}
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