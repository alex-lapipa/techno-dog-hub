import { Link } from "react-router-dom";
import { ArrowRight, Newspaper, Archive, PenLine } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";

const InfoPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Info | News & Archives"
        description="News from the underground techno scene and community archives. Stories, opinions, and experiences from the global techno community."
        path="/info"
      />
      <Header />
      <main className="pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Hero Header */}
          <div className="mb-12 space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
              // Knowledge hub
            </div>
            <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight">
              Info
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-lg">
              Your gateway to underground techno knowledge. Curated news from the scene and community-driven archives of experiences, memories, and opinions.
            </p>
          </div>

          {/* Two Hero Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* News Block */}
            <Link
              to="/news"
              className="group relative border-2 border-logo-green/50 p-8 md:p-10 hover:border-logo-green bg-card/30 hover:bg-card/60 transition-all duration-300 min-h-[320px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 border border-logo-green/50 flex items-center justify-center group-hover:bg-logo-green/10 transition-colors">
                    <Newspaper className="w-6 h-6 text-logo-green" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-logo-green">
                    Latest Updates
                  </span>
                </div>
                <h2 className="font-mono text-3xl md:text-4xl uppercase tracking-tight mb-4 group-hover:text-logo-green transition-colors">
                  News
                </h2>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                  Curated stories from the global underground. Interviews, scene reports, venue features, and label spotlights. No hype, just substance.
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-logo-green mt-6">
                <span>Enter News</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </div>
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-logo-green/50 group-hover:border-logo-green transition-colors" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-logo-green/50 group-hover:border-logo-green transition-colors" />
            </Link>

            {/* Archives Block */}
            <Link
              to="/archives"
              className="group relative border-2 border-crimson/50 p-8 md:p-10 hover:border-crimson bg-card/30 hover:bg-card/60 transition-all duration-300 min-h-[320px] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 border border-crimson/50 flex items-center justify-center group-hover:bg-crimson/10 transition-colors">
                    <Archive className="w-6 h-6 text-crimson" />
                  </div>
                  <span className="font-mono text-xs uppercase tracking-[0.3em] text-crimson">
                    Community Memories
                  </span>
                </div>
                <h2 className="font-mono text-3xl md:text-4xl uppercase tracking-tight mb-4 group-hover:text-crimson transition-colors">
                  Archives
                </h2>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                  User-submitted experiences, opinions, and memories from the scene. Stories of legendary nights, underground discoveries, and personal journeys through techno culture.
                </p>
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-crimson">
                  <span>Enter Archives</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  <PenLine className="w-3 h-3" />
                  <span>Submit yours</span>
                </div>
              </div>
              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-crimson/50 group-hover:border-crimson transition-colors" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-crimson/50 group-hover:border-crimson transition-colors" />
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-border mb-12">
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] pt-4">
              // Quick access
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Your Stories →', path: '/news/your-stories', desc: 'Community narratives' },
              { label: 'Latest Articles →', path: '/news/archive', desc: 'Published pieces' },
              { label: 'Submit Content →', path: '/submit', desc: 'Contribute to archives' },
              { label: 'Trending →', path: '/news', desc: 'What\'s hot now' },
            ].map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="group block border border-border p-4 hover:bg-card hover:border-foreground/30 transition-colors"
              >
                <span className="font-mono text-sm uppercase tracking-wider text-foreground group-hover:animate-glitch block mb-1">
                  {link.label}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {link.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InfoPage;
