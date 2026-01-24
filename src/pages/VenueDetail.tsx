import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Users, Volume2, Building2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { getVenueById, venues, isVenueOpen } from "@/data/venues";
import { PageLayout } from "@/components/layout";
import FilmFrame from "@/components/FilmFrame";
import DetailBreadcrumb from "@/components/DetailBreadcrumb";
import { CommunityWidgetPhoto, CommunityWidgetCorrection } from "@/components/community";
import { ContributeWidget } from "@/components/community/ContributeWidget";
import YouTubeVideos from "@/components/YouTubeVideos";
import { cn } from "@/lib/utils";

const VenueDetail = () => {
  const { id } = useParams<{ id: string }>();
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

  const typeLabels: Record<string, string> = {
    'club': 'Club',
    'warehouse': 'Warehouse',
    'outdoor': 'Outdoor',
    'multi-space': 'Multi-Space'
  };

  if (!venue) {
    return (
      <PageLayout
        title="Venue Not Found"
        path={`/venues/${id}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="font-mono text-muted-foreground">
            Venue not found
          </p>
          <Link to="/venues" className="font-mono text-xs text-primary hover:underline mt-4 inline-block">
            ← Back to Venues
          </Link>
        </div>
      </PageLayout>
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
    <PageLayout
      title={`${venue.name} - Techno Venue in ${venue.city}`}
      description={venue.atmosphere || `${venue.name} - ${venue.type} venue in ${venue.city}, ${venue.country}.`}
      path={`/venues/${venue.id}`}
      structuredData={placeSchema}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <DetailBreadcrumb 
          items={[
            { label: 'Venues', href: '/venues' },
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
              Back to Venues
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
            {/* Venue Visual - Film Frame */}
            <div className="relative">
              {venue.image ? (
                <div className="relative">
                  <FilmFrame
                    src={venue.image.url}
                    alt={`${venue.name} - ${venue.city}`}
                    frameNumber={String(currentIndex + 1).padStart(2, '0')}
                    aspectRatio="square"
                    size="lg"
                  />
                  {/* Attribution overlay */}
                  <div className="absolute top-6 right-6 z-30 bg-background/90 backdrop-blur-sm border border-crimson/30 px-2 py-1 text-xs font-mono">
                    <a 
                      href={venue.image.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-crimson transition-colors flex items-center gap-1"
                    >
                      📷 {venue.image.author}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href={venue.image.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground/70 hover:text-foreground transition-colors text-[10px]"
                    >
                      {venue.image.license}
                    </a>
                  </div>
                  {/* Tags overlay */}
                  <div className="absolute bottom-6 left-6 right-6 z-30">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {venue.tags.map(tag => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] sm:text-xs bg-background/90 border border-crimson/30 px-1.5 sm:px-2 py-0.5 sm:py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-square relative overflow-hidden border border-border bg-zinc-800 flex items-center justify-center">
                  <div className="text-center p-6">
                    <Building2 className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 text-muted-foreground/50" />
                    <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-tight mb-2">{venue.name}</h2>
                    <p className="font-mono text-xs text-muted-foreground">{venue.city}, {venue.country}</p>
                  </div>
                  {/* Tags for no-image state */}
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
                </div>
              )}
            </div>

            {/* Venue Info */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
                    // {typeLabels[venue.type] || venue.type}
                  </div>
                  {/* Status Badge */}
                  <span className={cn(
                    "font-mono text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 border",
                    isVenueOpen(venue) 
                      ? "bg-logo-green/90 text-background border-logo-green" 
                      : "bg-crimson/80 text-white border-crimson"
                  )}>
                    {isVenueOpen(venue) ? "STILL OPEN" : "CLOSED"}
                  </span>
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
                    Capacity: {venue.capacity}
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
                Sound System
              </h2>
              <div className="border border-border p-4 sm:p-6 bg-card/30">
                <p className="font-mono text-xs sm:text-sm text-muted-foreground">
                  {venue.soundSystem}
                </p>
              </div>
            </section>
          )}

          {/* YouTube Videos */}
          <YouTubeVideos artistName={`${venue.name} ${venue.city}`} />

          {/* Historic Lineups - Now with artist links */}
          {venue.historicLineups && venue.historicLineups.length > 0 && (
            <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
              <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Featured Artists
              </h2>
              <p className="font-mono text-xs text-muted-foreground mb-4">
                Artists who have performed at {venue.name}
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {venue.historicLineups.map((artist, i) => {
                  // Create a slug from artist name for linking
                  const artistSlug = artist.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                  return (
                    <Link 
                      key={i}
                      to={`/artists?q=${encodeURIComponent(artist)}`}
                      className="font-mono text-xs sm:text-sm border border-border px-3 py-2 hover:bg-card hover:border-primary/50 transition-colors group flex items-center gap-1.5"
                    >
                      {artist}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  );
                })}
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
                Related Venues
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {relatedVenues.map((v) => (
                  <Link
                    key={v.id}
                    to={`/venues/${v.id}`}
                    className="border border-border p-3 sm:p-4 hover:bg-card transition-colors group"
                  >
                    <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                      {typeLabels[v.type] || v.type}
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

          {/* Contribute Widget */}
          <aside className="mt-8 sm:mt-12">
            <ContributeWidget 
              entityType="venue" 
              entityId={venue.id}
              entityName={venue.name}
              variant="default"
            />
          </aside>
        </div>
      </PageLayout>
    );
  };

export default VenueDetail;
