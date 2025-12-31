import { Link } from "react-router-dom";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import FlexibleSubmissionForm from "@/components/FlexibleSubmissionForm";
import { Database, Users, Heart, Globe, BookOpen, Github, Handshake, Gift, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Fetch real counts from database
const fetchArchiveStats = async () => {
  const [artistsResult, gearResult, labelsResult] = await Promise.all([
    supabase.from('canonical_artists').select('artist_id', { count: 'exact', head: true }),
    supabase.from('gear_catalog').select('id', { count: 'exact', head: true }),
    supabase.from('labels').select('id', { count: 'exact', head: true }),
  ]);

  return {
    artists: artistsResult.count || 0,
    gear: gearResult.count || 0,
    labels: labelsResult.count || 0,
  };
};

const TechnopediaPage = () => {
  useScrollDepth({ pageName: 'technopedia' });
  
  // Fetch real stats from database
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['technopedia-stats'],
    queryFn: fetchArchiveStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const content = {
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
        "Global perspective — documenting scenes and movements worldwide",
        "Preservation first — documenting stories before they're lost to time"
      ]
    },

    sections: [
      {
        icon: Database,
        title: "The Archive",
        description: "A growing collection of artists and gear that shaped techno culture. From the Detroit originators to the latest Berlin residents. Community contributions welcome.",
        hasDynamicStats: true // Flag to render dynamic stats
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
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Technopedia - The Open Techno Knowledge Base",
    "description": content.intro,
    "url": "https://techno.dog/technopedia"
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title={`${content.title} | ${content.subtitle}`}
        description={content.intro}
        path="/technopedia"
        structuredData={structuredData}
      />
      <Header />
      
      <main className="pt-16 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero */}
          <div className="max-w-4xl mb-16 sm:mb-20">
            <div className="font-mono text-[10px] sm:text-xs text-destructive uppercase tracking-[0.3em] mb-4">
              // Open Knowledge
            </div>
            <h1 className="font-mono text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-tight mb-6 text-foreground">
              {content.title}
            </h1>
            <p className="font-mono text-lg sm:text-xl text-logo-green mb-6">
              {content.subtitle}
            </p>
            <p className="font-mono text-sm sm:text-base text-foreground/80 max-w-2xl leading-relaxed border-l-2 border-destructive pl-4">
              {content.intro}
            </p>
          </div>

          {/* Mission Statement - VHS aesthetic with red/green/white */}
          <div className="relative border border-border bg-card p-6 sm:p-10 mb-12 sm:mb-16 overflow-hidden group hover:border-logo-green/50 transition-colors">
            {/* Top accent line - red to green gradient */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-destructive via-logo-green/50 to-transparent" />
            
            {/* VHS scan line overlay */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-30"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,136,0.03) 2px, rgba(0,255,136,0.03) 4px)',
              }}
            />
            
            <div className="relative flex items-start gap-4 mb-6">
              <Sparkles className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-mono text-2xl sm:text-3xl uppercase tracking-wide mb-4 text-foreground">
                  {content.mission.title}
                </h2>
                <p className="font-mono text-sm text-foreground/70 leading-relaxed mb-6">
                  {content.mission.text}
                </p>
                <ul className="space-y-2">
                  {content.mission.points.map((point, i) => (
                    <li key={i} className="font-mono text-xs text-foreground flex items-start gap-2">
                      <span className="text-destructive mt-0.5">◆</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Sections */}
          <div className="grid gap-8 sm:gap-10 mb-16 sm:mb-20">
            {content.sections.map((section, index) => (
              <div 
                key={index}
                className="relative border border-border p-6 sm:p-8 hover:border-logo-green/50 transition-all group overflow-hidden"
              >
                {/* Left accent line - alternating red/green */}
                <div className={`absolute left-0 top-0 bottom-0 w-[2px] ${index % 2 === 0 ? 'bg-destructive' : 'bg-logo-green'}`} />
                
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 border flex items-center justify-center transition-colors ${index % 2 === 0 ? 'border-destructive/50 group-hover:border-destructive' : 'border-logo-green/50 group-hover:border-logo-green'}`}>
                      <section.icon className={`w-6 h-6 ${index % 2 === 0 ? 'text-destructive' : 'text-logo-green'}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-wide mb-4 text-foreground group-hover:text-logo-green transition-colors">
                      {section.title}
                    </h2>
                    <p className="font-mono text-sm text-foreground/70 leading-relaxed mb-4">
                      {section.description}
                    </p>
                    
                    {'hasDynamicStats' in section && section.hasDynamicStats && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                        {statsLoading ? (
                          <div className="col-span-3 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-logo-green" />
                            <span className="font-mono text-xs text-foreground/50">Loading stats...</span>
                          </div>
                        ) : (
                          <>
                            <div>
                              <div className="font-mono text-2xl sm:text-3xl text-logo-green">{stats?.artists || 0}</div>
                              <div className="font-mono text-[10px] text-foreground/50 uppercase tracking-wider">Artists</div>
                            </div>
                            <div>
                              <div className="font-mono text-2xl sm:text-3xl text-destructive">{stats?.gear || 0}</div>
                              <div className="font-mono text-[10px] text-foreground/50 uppercase tracking-wider">Gear Items</div>
                            </div>
                            <div>
                              <div className="font-mono text-2xl sm:text-3xl text-foreground">{stats?.labels || 0}</div>
                              <div className="font-mono text-[10px] text-foreground/50 uppercase tracking-wider">Labels</div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    
                    {section.cta && (
                      <Link to={section.cta.path}>
                        <Button variant="outline" size="sm" className="mt-4 border-logo-green/50 text-logo-green hover:bg-logo-green hover:text-background hover:border-logo-green">
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
          <div id="contribute" className="relative border border-border bg-card mb-12 sm:mb-16 overflow-hidden">
            {/* Top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-logo-green via-destructive to-transparent" />
            
            <div className="p-6 sm:p-10 border-b border-border">
              <div className="flex items-start gap-4 mb-6">
                <Handshake className="w-8 h-8 text-logo-green flex-shrink-0 mt-1" />
                <div>
                  <h2 className="font-mono text-2xl sm:text-3xl uppercase tracking-wide mb-2 text-foreground">
                    {content.contribute.title}
                  </h2>
                  <p className="font-mono text-sm text-foreground/70">
                    {content.contribute.description}
                  </p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3 pl-12">
                {content.contribute.examples.map((item, i) => (
                  <div key={i} className="font-mono text-xs text-foreground/60 flex items-start gap-2">
                    <span className="text-destructive">→</span>
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
          <div className="relative border border-border p-6 sm:p-10 mb-12 overflow-hidden group hover:border-destructive/50 transition-colors">
            {/* Left accent line - red */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-destructive" />
            
            <div className="flex items-start gap-4 mb-6">
              <Gift className="w-8 h-8 text-destructive flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-mono text-2xl sm:text-3xl uppercase tracking-wide mb-2 text-foreground">
                  {content.sponsor.title}
                </h2>
                <p className="font-mono text-sm text-foreground/70 mb-4">
                  {content.sponsor.description}
                </p>
                <p className="font-mono text-xs text-destructive/80 italic">
                  {content.sponsor.note}
                </p>
              </div>
            </div>
            
            <div className="pl-12 mt-6">
              <a href="mailto:hello@techno.dog">
                <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive hover:text-white hover:border-destructive">
                  {content.sponsor.cta}
                </Button>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="pt-8 border-t border-border">
            <div className="font-mono text-xs text-destructive uppercase tracking-widest mb-6">
              // Explore the Archive
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Artists', path: '/artists', color: 'green' },
                { label: 'Festivals', path: '/festivals', color: 'red' },
                { label: 'Venues', path: '/venues', color: 'green' },
                { label: 'Labels', path: '/labels', color: 'red' },
                { label: 'Gear', path: '/gear', color: 'green' },
                { label: 'Developer API', path: '/developer', color: 'red' },
              ].map((link) => (
                <Link key={link.path} to={link.path}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={link.color === 'green' 
                      ? "border-logo-green/50 text-logo-green hover:bg-logo-green hover:text-background hover:border-logo-green" 
                      : "border-destructive/50 text-destructive hover:bg-destructive hover:text-white hover:border-destructive"
                    }
                  >
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
