import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Users, Volume2, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getVenueById, venues } from "@/data/venues";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import DetailBreadcrumb from "@/components/DetailBreadcrumb";
import { CommunityWidgetPhoto, CommunityWidgetCorrection } from "@/components/community";

const VenueDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const venue = id ? getVenueById(id) : null;

  const placeSchema = venue ? {
    "@context": "https://schema.org",
    "@type": "MusicVenue",
    "name": venue.name,
    "description": venue.atmosphere || `${venue.name} - ${venue.type} venue in ${venue.city}, ${venue.country}`,
    "url": `https://techno.dog/venues/${venue.id}`,
    ...(venue.image && { "image": venue.image.url }),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": venue.city,
      "addressCountry": venue.country
    },
    ...(venue.capacity && { "maximumAttendeeCapacity": typeof venue.capacity === 'number' ? venue.capacity : parseInt(String(venue.capacity).replace(/\D/g, '')) }),
    "keywords": venue.tags.join(", "),
    ...(venue.soundSystem && {
      "amenityFeature": {
        "@type": "LocationFeatureSpecification",
        "name": "Sound System",
        "value": venue.soundSystem
      }
    })
  } : null;

  // Find prev/next venues for navigation
  const currentIndex = venues.findIndex(v => v.id === id);
  const prevVenue = currentIndex > 0 ? venues[currentIndex - 1] : null;
  const nextVenue = currentIndex < venues.length - 1 ? venues[currentIndex + 1] : null;

  const typeLabels: Record<string, { en: string; es: string }> = {
    'club': { en: 'Club', es: 'Club' },
    'warehouse': { en: 'Warehouse', es: 'Almacén' },
    'outdoor': { en: 'Outdoor', es: 'Aire Libre' },
    'multi-space': { en: 'Multi-Space', es: 'Multi-Espacio' }
  };

  if (!venue) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {venue && (
        <PageSEO
          title={`${venue.name} - Techno Venue in ${venue.city}`}
          description={venue.atmosphere || `${venue.name} - ${venue.type} venue in ${venue.city}, ${venue.country}.`}
          path={`/venues/${venue.id}`}
          image={venue.image?.url}
          locale={language}
          structuredData={placeSchema}
        />
      )}
      <Header />
        <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-mono text-muted-foreground">
              {language === 'en' ? 'Venue not found' : 'Club no encontrado'}
            </p>
            <Link to="/venues" className="font-mono text-xs text-primary hover:underline mt-4 inline-block">
              ← {language === 'en' ? 'Back to Venues' : 'Volver a Clubs'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Get related venues (same country or type)
  const relatedVenues = venues
    .filter(v => 
      v.id !== venue.id && 
      (v.country === venue.country || v.type === venue.type)
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <DetailBreadcrumb 
            items={[
              { label: language === 'en' ? 'Venues' : 'Clubs', href: '/venues' },
              { label: venue.name }
            ]} 
          />

          {/* Navigation Row */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            {/* Back Link */}
            <Link 
              to="/venues" 
              className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              {language === 'en' ? 'Back to Venues' : 'Volver a Clubs'}
            </Link>

            {/* Prev/Next Navigation */}
            <div className="flex items-center gap-2">
              {prevVenue ? (
                <Link
                  to={`/venues/${prevVenue.id}`}
                  className="flex items-center gap-2 px-3 py-2 border border-border hover:bg-card transition-colors group"
                  title={prevVenue.name}
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-mono text-xs uppercase tracking-wider hidden sm:inline max-w-[100px] truncate">
                    {prevVenue.name}
                  </span>
                </Link>
              ) : (
                <div className="px-3 py-2 border border-border/30 text-muted-foreground/30 cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </div>
              )}

              <span className="font-mono text-xs text-muted-foreground px-2">
                {currentIndex + 1}/{venues.length}
              </span>

              {nextVenue ? (
                <Link
                  to={`/venues/${nextVenue.id}`}
                  className="flex items-center gap-2 px-3 py-2 border border-border hover:bg-card transition-colors group"
                  title={nextVenue.name}
                >
                  <span className="font-mono text-xs uppercase tracking-wider hidden sm:inline max-w-[100px] truncate">
                    {nextVenue.name}
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

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 sm:mb-12">
            {/* Venue Visual */}
            <div className="aspect-square sm:aspect-[4/3] lg:aspect-square relative overflow-hidden border border-border bg-card/50">
              {venue.image ? (
                <>
                  <img 
                    src={venue.image.url} 
                    alt={`${venue.name} - ${venue.city}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Attribution */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 space-y-2">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {venue.tags.map(tag => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] sm:text-xs bg-background/90 border border-border px-1.5 sm:px-2 py-0.5 sm:py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground/80 bg-background/80 px-2 py-1 inline-block">
                      Photo: <a href={venue.image.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{venue.image.author}</a> / <a href={venue.image.licenseUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">{venue.image.license}</a>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-6">
                      <Building2 className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 text-muted-foreground/50" />
                      <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-tight mb-2">{venue.name}</h2>
                      <p className="font-mono text-xs text-muted-foreground">{venue.city}, {venue.country}</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Tags */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {venue.tags.map(tag => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] sm:text-xs bg-background/90 border border-border px-1.5 sm:px-2 py-0.5 sm:py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Venue Info */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2">
                  // {typeLabels[venue.type]?.[language] || venue.type}
                </div>
                <h1 className="font-mono text-2xl sm:text-4xl lg:text-5xl xl:text-6xl uppercase tracking-tight mb-2 hover:animate-glitch break-words">
                  {venue.name}
                </h1>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 font-mono text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  {venue.city}, {venue.country}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  {venue.active}
                </div>
                {venue.capacity && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    {language === 'en' ? 'Capacity' : 'Capacidad'}: {venue.capacity}
                  </div>
                )}
              </div>

              {venue.atmosphere && (
                <p className="font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground">
                  {venue.atmosphere}
                </p>
              )}
            </div>
          </div>

          {/* Sound System */}
          {venue.soundSystem && (
            <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
              <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                {language === 'en' ? 'Sound System' : 'Sistema de Sonido'}
              </h2>
              <div className="border border-border p-4 sm:p-6 bg-card/30">
                <p className="font-mono text-xs sm:text-sm text-muted-foreground">
                  {venue.soundSystem}
                </p>
              </div>
            </section>
          )}

          {/* Historic Lineups */}
          {venue.historicLineups && venue.historicLineups.length > 0 && (
            <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
              <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6">
                {language === 'en' ? 'Historic Lineups' : 'Lineups Históricos'}
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {venue.historicLineups.map((artist, i) => (
                  <span key={i} className="font-mono text-xs sm:text-sm border border-border px-3 py-2 hover:bg-card transition-colors">
                    {artist}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Community Contribution Section */}
          <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
            <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6">
              Community Contributions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CommunityWidgetPhoto
                entityType="venue"
                entityId={venue.id}
                title={`Upload photos of ${venue.name}`}
                description="Share venue photos, sound system shots, or event captures. All submissions are reviewed before publishing."
                collapsible={true}
              />
              <CommunityWidgetCorrection
                entityType="venue"
                entityId={venue.id}
                entityName={venue.name}
                title="Submit a correction"
                description="Report incorrect information about capacity, sound system, residents, or other details."
                collapsible={true}
              />
            </div>
          </section>

          {/* Related Venues */}
          {relatedVenues.length > 0 && (
            <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
              <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6">
                {language === 'en' ? 'Related Venues' : 'Clubs Relacionados'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {relatedVenues.map((v) => (
                  <Link
                    key={v.id}
                    to={`/venues/${v.id}`}
                    className="border border-border p-3 sm:p-4 hover:bg-card transition-colors group"
                  >
                    <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                      {typeLabels[v.type]?.[language] || v.type}
                    </span>
                    <h3 className="font-mono text-xs sm:text-sm uppercase group-hover:animate-glitch">
                      {v.name}
                    </h3>
                    <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-1">
                      {v.city}, {v.country}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VenueDetail;
