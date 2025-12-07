import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, MapPin, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { festivals, getFestivalById } from "@/data/festivals";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const FestivalDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const festival = getFestivalById(id || '');

  if (!festival) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <h1 className="font-mono text-4xl uppercase tracking-tight mb-4">404</h1>
            <p className="font-mono text-muted-foreground mb-8">
              {language === 'en' ? 'Festival not found' : 'Festival no encontrado'}
            </p>
            <Link to="/festivals">
              <Button variant="brutalist">
                {language === 'en' ? 'Back to festivals' : 'Volver a festivales'}
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get related festivals
  const related = festivals
    .filter(f => f.id !== festival.id && f.country === festival.country)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 lg:pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Breadcrumb */}
          <Link 
            to="/festivals" 
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground mb-8 hover:animate-glitch"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'en' ? 'All Festivals' : 'Todos los Festivales'}
          </Link>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
                  // {festival.type}
                </div>
                <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight">
                  {festival.name}
                </h1>
                <div className="font-mono text-lg text-muted-foreground">
                  {festival.city}, {festival.country}
                </div>
              </div>

              {festival.description && (
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                  {festival.description}
                </p>
              )}

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border p-4">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    {language === 'en' ? 'When' : 'Cuándo'}
                  </div>
                  <div className="font-mono text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {festival.months.join(' / ')}
                  </div>
                </div>
                <div className="border border-border p-4">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    {language === 'en' ? 'Where' : 'Dónde'}
                  </div>
                  <div className="font-mono text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {festival.city}
                  </div>
                </div>
                <div className="border border-border p-4">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    {language === 'en' ? 'Since' : 'Desde'}
                  </div>
                  <div className="font-mono text-foreground">
                    {festival.founded}
                  </div>
                </div>
                {festival.capacity && (
                  <div className="border border-border p-4">
                    <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">
                      {language === 'en' ? 'Capacity' : 'Capacidad'}
                    </div>
                    <div className="font-mono text-foreground">
                      {festival.capacity.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {festival.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs uppercase tracking-wider px-3 py-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground hover:animate-glitch transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Button variant="brutalist" size="lg" className="hover:animate-glitch">
                  {language === 'en' ? 'Official site' : 'Web oficial'}
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Historic lineups */}
              {festival.historicLineups && festival.historicLineups.length > 0 && (
                <div className="border border-border p-6">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                    // {language === 'en' ? 'Notable artists' : 'Artistas notables'}
                  </div>
                  <div className="space-y-2">
                    {festival.historicLineups.map((artist, i) => (
                      <div key={artist} className="font-mono text-sm text-foreground flex items-center gap-3 hover:animate-glitch">
                        <span className="text-muted-foreground text-xs">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{artist}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stages */}
              {festival.stages && festival.stages.length > 0 && (
                <div className="border border-border p-6">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                    // {language === 'en' ? 'Stages' : 'Escenarios'}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {festival.stages.map((stage) => (
                      <span key={stage} className="font-mono text-xs border border-border px-2 py-1 text-muted-foreground">
                        {stage}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Related festivals */}
              {related.length > 0 && (
                <div className="border border-border p-6">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                    // {language === 'en' ? 'Also in' : 'También en'} {festival.country}
                  </div>
                  <div className="space-y-3">
                    {related.map((rel) => (
                      <Link
                        key={rel.id}
                        to={`/festivals/${rel.id}`}
                        className="block font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch transition-colors"
                      >
                        → {rel.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Deep links */}
              <div className="border border-border p-6">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                  // {language === 'en' ? 'Explore more' : 'Explora más'}
                </div>
                <div className="space-y-2">
                  <Link to="/venues" className="block font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch">
                    → {language === 'en' ? 'Venues in' : 'Clubs en'} {festival.country}
                  </Link>
                  <Link to="/artists" className="block font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch">
                    → {language === 'en' ? 'Artists' : 'Artistas'}
                  </Link>
                  <Link to="/mad/calendar" className="block font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch">
                    → {language === 'en' ? 'Calendar' : 'Calendario'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FestivalDetail;
