import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, ExternalLink, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { festivals, getFestivalById } from "@/data/festivals";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import DetailBreadcrumb from "@/components/DetailBreadcrumb";
import { CommunityWidgetPhoto } from "@/components/community";

const FestivalDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const festival = getFestivalById(id || '');

  // Helper to generate date range for next occurrence
  const getNextEventDates = (months: string[]) => {
    const monthMap: { [key: string]: number } = {
      'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
      'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
    };
    
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Get first month of festival
    const firstMonth = months[0];
    const monthIndex = monthMap[firstMonth] ?? 6; // Default to July
    
    // If festival month has passed, use next year
    const year = monthIndex < currentMonth ? currentYear + 1 : currentYear;
    
    // Assume 3-day festival starting on a Friday
    const startDate = new Date(year, monthIndex, 15); // Mid-month approximation
    const endDate = new Date(year, monthIndex, 17);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const eventDates = festival ? getNextEventDates(festival.months) : null;

  const eventSchema = festival ? {
    "@context": "https://schema.org",
    "@type": "MusicFestival",
    "name": festival.name,
    "description": festival.description || `${festival.name} - ${festival.type} festival in ${festival.city}, ${festival.country}`,
    "url": `https://techno.dog/festivals/${festival.id}`,
    "image": "https://techno.dog/og-image.png",
    "startDate": eventDates?.startDate,
    "endDate": eventDates?.endDate,
    "location": {
      "@type": "Place",
      "name": festival.city,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": festival.city,
        "addressCountry": festival.country
      }
    },
    "organizer": {
      "@type": "Organization",
      "name": festival.name,
      "url": `https://techno.dog/festivals/${festival.id}`
    },
    "performer": festival.historicLineups?.slice(0, 10).map(artist => ({
      "@type": "MusicGroup",
      "name": artist
    })) || [],
    "offers": {
      "@type": "Offer",
      "url": `https://techno.dog/festivals/${festival.id}`,
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "validFrom": eventDates?.startDate
    },
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    ...(festival.founded && { "foundingDate": festival.founded.toString() }),
    ...(festival.capacity && { "maximumAttendeeCapacity": festival.capacity }),
    "keywords": festival.tags.join(", "),
    "inLanguage": ["en", "es"]
  } : null;

  // Find prev/next festivals for navigation
  const currentIndex = festivals.findIndex(f => f.id === id);
  const prevFestival = currentIndex > 0 ? festivals[currentIndex - 1] : null;
  const nextFestival = currentIndex < festivals.length - 1 ? festivals[currentIndex + 1] : null;

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
      <PageSEO
        title={`${festival.name} - Techno Festival in ${festival.city}, ${festival.country}`}
        description={festival.description || `${festival.name} is a ${festival.type} techno festival in ${festival.city}, ${festival.country}. Established ${festival.founded}. Capacity: ${festival.capacity?.toLocaleString() || 'TBA'}.`}
        path={`/festivals/${festival.id}`}
        locale={language}
        structuredData={eventSchema}
      />
      <Header />
      <main className="pt-24 lg:pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Breadcrumb Navigation */}
          <DetailBreadcrumb 
            items={[
              { label: language === 'en' ? 'Festivals' : 'Festivales', href: '/festivals' },
              { label: festival.name }
            ]} 
          />

          {/* Navigation Row */}
          <div className="flex items-center justify-between mb-8">
            {/* Back Link */}
            <Link 
              to="/festivals" 
              className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {language === 'en' ? 'All Festivals' : 'Todos los Festivales'}
            </Link>

            {/* Prev/Next Navigation */}
            <div className="flex items-center gap-2">
              {prevFestival ? (
                <Link
                  to={`/festivals/${prevFestival.id}`}
                  className="flex items-center gap-2 px-3 py-2 border border-border hover:bg-card transition-colors group"
                  title={prevFestival.name}
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-mono text-xs uppercase tracking-wider hidden sm:inline max-w-[100px] truncate">
                    {prevFestival.name}
                  </span>
                </Link>
              ) : (
                <div className="px-3 py-2 border border-border/30 text-muted-foreground/30 cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </div>
              )}

              <span className="font-mono text-xs text-muted-foreground px-2">
                {currentIndex + 1}/{festivals.length}
              </span>

              {nextFestival ? (
                <Link
                  to={`/festivals/${nextFestival.id}`}
                  className="flex items-center gap-2 px-3 py-2 border border-border hover:bg-card transition-colors group"
                  title={nextFestival.name}
                >
                  <span className="font-mono text-xs uppercase tracking-wider hidden sm:inline max-w-[100px] truncate">
                    {nextFestival.name}
                  </span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <div className="px-3 py-2 border border-border/30 text-muted-foreground/30 cursor-not-allowed">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

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

              {/* Community Photo Upload */}
              <div className="border border-border p-6">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  // {language === 'en' ? 'Contribute Photos' : 'Contribuir Fotos'}
                </div>
                <p className="font-mono text-xs text-muted-foreground mb-4">
                  {language === 'en' 
                    ? `Have photos from ${festival.name}? Share them with the community.`
                    : `¿Tienes fotos de ${festival.name}? Compártelas con la comunidad.`
                  }
                </p>
                <CommunityWidgetPhoto
                  entityType="festival"
                  entityId={festival.id}
                  title={language === 'en' ? `Upload photos of ${festival.name}` : `Subir fotos de ${festival.name}`}
                  description={language === 'en' 
                    ? "Share festival photos, stage shots, or crowd captures. All submissions are reviewed."
                    : "Comparte fotos del festival, escenarios o del público. Todas las contribuciones son revisadas."
                  }
                />
              </div>

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
