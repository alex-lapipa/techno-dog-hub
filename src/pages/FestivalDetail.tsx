import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, ExternalLink, ChevronLeft, ChevronRight, Music } from "lucide-react";
import { festivals, getFestivalById } from "@/data/festivals";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout";
import DetailBreadcrumb from "@/components/DetailBreadcrumb";
import { CommunityWidgetPhoto, CommunityWidgetCorrection } from "@/components/community";

const FestivalDetail = () => {
  const { id } = useParams();
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
    "inLanguage": "en"
  } : null;

  // Find prev/next festivals for navigation
  const currentIndex = festivals.findIndex(f => f.id === id);
  const prevFestival = currentIndex > 0 ? festivals[currentIndex - 1] : null;
  const nextFestival = currentIndex < festivals.length - 1 ? festivals[currentIndex + 1] : null;

  if (!festival) {
    return (
      <PageLayout
        title="Festival Not Found"
        path={`/festivals/${id}`}
      >
        <div className="container mx-auto px-4 md:px-8 py-16 text-center">
          <h1 className="font-mono text-4xl uppercase tracking-tight mb-4">404</h1>
          <p className="font-mono text-muted-foreground mb-8">Festival not found</p>
          <Link to="/festivals">
            <Button variant="brutalist">Back to festivals</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  // Get related festivals
  const related = festivals
    .filter(f => f.id !== festival.id && f.country === festival.country)
    .slice(0, 3);

  return (
    <PageLayout
      title={`${festival.name} - Techno Festival in ${festival.city}, ${festival.country}`}
      description={festival.description || `${festival.name} is a ${festival.type} techno festival in ${festival.city}, ${festival.country}. Established ${festival.founded}. Capacity: ${festival.capacity?.toLocaleString() || 'TBA'}.`}
      path={`/festivals/${festival.id}`}
      structuredData={eventSchema}
    >
      <div className="container mx-auto px-4 md:px-8 py-8">
        <DetailBreadcrumb items={[{ label: 'Festivals', href: '/festivals' }, { label: festival.name }]} />
          <div className="flex items-center justify-between mb-8">
            <Link to="/festivals" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              All Festivals
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

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Visual + Info */}
            <div className="space-y-8">
              {/* Festival Visual - Film Frame Placeholder */}
              <div className="relative">
                <div className="bg-zinc-800 p-1">
                  {/* Sprocket holes left */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2 z-20">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1.5 h-2 bg-background/80 rounded-sm mx-auto" />
                    ))}
                  </div>
                  
                  {/* Sprocket holes right */}
                  <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-around py-2 z-20">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1.5 h-2 bg-background/80 rounded-sm mx-auto" />
                    ))}
                  </div>
                  
                  {/* Main visual container */}
                  <div 
                    className="relative mx-2 aspect-[4/3] overflow-hidden border border-crimson/20 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
                    style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)' }}
                  >
                    {/* VHS overlay */}
                    <div 
                      className="absolute inset-0 z-10 pointer-events-none"
                      style={{
                        background: `
                          repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px),
                          radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%),
                          linear-gradient(to top, rgba(220,38,38,0.05), rgba(220,38,38,0.05))
                        `,
                      }}
                    />
                    
                    {/* Festival icon and info */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                      <Music className="w-16 h-16 md:w-20 md:h-20 text-crimson/40 mb-4" />
                      <h2 className="font-mono text-2xl md:text-3xl uppercase tracking-tight text-foreground/80 mb-2">
                        {festival.name}
                      </h2>
                      <p className="font-mono text-sm text-muted-foreground">
                        {festival.city}, {festival.country}
                      </p>
                      <p className="font-mono text-xs text-crimson/60 mt-2">
                        EST. {festival.founded}
                      </p>
                    </div>
                    
                    {/* Crimson glow overlay */}
                    <div className="absolute inset-0 z-[11] pointer-events-none bg-gradient-to-t from-crimson/20 via-transparent to-transparent" />
                    
                    {/* Frame number badge */}
                    <div className="absolute top-3 left-3 z-20 px-1.5 py-1 bg-black/70 border border-crimson/40 backdrop-blur-sm">
                      <span className="text-xs text-crimson tracking-wider font-bold font-mono">
                        {String(currentIndex + 1).padStart(2, '0')}
                      </span>
                    </div>
                    
                    {/* Tags */}
                    <div className="absolute bottom-3 left-3 right-3 z-20">
                      <div className="flex flex-wrap gap-1.5">
                        {festival.tags.slice(0, 4).map(tag => (
                          <span
                            key={tag}
                            className="font-mono text-[10px] bg-background/80 border border-crimson/30 px-1.5 py-0.5 text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Festival Info */}
              <div className="space-y-4">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
                  // {festival.type}
                </div>
                <h1 className="font-mono text-3xl md:text-5xl uppercase tracking-tight hover:animate-glitch">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-border p-4">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">When</div>
                  <div className="font-mono text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />{festival.months.join(' / ')}
                  </div>
                </div>
                <div className="border border-border p-4">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Where</div>
                  <div className="font-mono text-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />{festival.city}
                  </div>
                </div>
                <div className="border border-border p-4">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Since</div>
                  <div className="font-mono text-foreground">{festival.founded}</div>
                </div>
                {festival.capacity && (
                  <div className="border border-border p-4">
                    <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Capacity</div>
                    <div className="font-mono text-foreground">{festival.capacity.toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <Button variant="outline" size="lg" className="border-crimson/30 hover:bg-crimson/10 hover:border-crimson gap-2">
                  Official site
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {festival.historicLineups && festival.historicLineups.length > 0 && (
                <div className="border border-border p-6">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">// Notable artists</div>
                  <div className="space-y-2">
                    {festival.historicLineups.map((artist, i) => (
                      <div key={artist} className="font-mono text-sm text-foreground flex items-center gap-3 hover:text-crimson transition-colors">
                        <span className="text-muted-foreground text-xs">{String(i + 1).padStart(2, "0")}</span>
                        <span>{artist}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {festival.stages && festival.stages.length > 0 && (
                <div className="border border-border p-6">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">// Stages</div>
                  <div className="flex flex-wrap gap-2">
                    {festival.stages.map((stage) => (
                      <span key={stage} className="font-mono text-xs border border-border px-2 py-1 text-muted-foreground">{stage}</span>
                    ))}
                  </div>
                </div>
              )}
              
              {related.length > 0 && (
                <div className="border border-border p-6">
                  <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">// Also in {festival.country}</div>
                  <div className="space-y-3">
                    {related.map((rel) => (
                      <Link key={rel.id} to={`/festivals/${rel.id}`} className="block font-mono text-sm text-muted-foreground hover:text-crimson transition-colors">
                        → {rel.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="border border-border p-6">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">// Community Contributions</div>
                <div className="space-y-4">
                  <CommunityWidgetPhoto 
                    entityType="festival" 
                    entityId={festival.id} 
                    title={`Upload photos of ${festival.name}`} 
                    description="Share festival photos, stage shots, or crowd captures. All submissions are reviewed." 
                    collapsible={true} 
                  />
                  <CommunityWidgetCorrection 
                    entityType="festival" 
                    entityId={festival.id} 
                    entityName={festival.name} 
                    title="Submit a correction" 
                    description="Report incorrect information about dates, location, capacity, or lineup." 
                    collapsible={true} 
                  />
                </div>
              </div>
              
              <div className="border border-border p-6">
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">// Explore more</div>
                <div className="space-y-2">
                  <Link to="/venues" className="block font-mono text-sm text-muted-foreground hover:text-crimson transition-colors">→ Venues in {festival.country}</Link>
                  <Link to="/artists" className="block font-mono text-sm text-muted-foreground hover:text-crimson transition-colors">→ Artists</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  };

export default FestivalDetail;
