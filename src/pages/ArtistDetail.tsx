import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Disc3, Wrench, Radio, User, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { getArtistById, artists } from "@/data/artists";
import { PageLayout } from "@/components/layout";
import { GlitchImage, GlitchSVGFilter } from "@/components/store/GlitchImage";
import DetailBreadcrumb from "@/components/DetailBreadcrumb";
import YouTubeVideos from "@/components/YouTubeVideos";
import { CommunityWidgetPhoto, CommunityWidgetCorrection } from "@/components/community";

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const artist = id ? getArtistById(id) : null;

  const personSchema = artist ? {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "name": artist.name,
    ...(artist.realName && { "alternateName": artist.realName }),
    "description": artist.bio,
    "url": `https://techno.dog/artists/${artist.id}`,
    ...(artist.image && { "image": artist.image.url }),
    "genre": ["Techno", ...artist.tags],
    "foundingLocation": {
      "@type": "Place",
      "name": `${artist.city}, ${artist.country}`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": artist.city,
        "addressCountry": artist.country
      }
    },
    ...(artist.labels && artist.labels.length > 0 && {
      "affiliation": artist.labels.map(label => ({
        "@type": "Organization",
        "name": label
      }))
    }),
    ...(artist.keyReleases && artist.keyReleases.length > 0 && {
      "album": artist.keyReleases.map(release => ({
        "@type": "MusicAlbum",
        "name": release.title,
        "datePublished": release.year.toString(),
        "recordLabel": {
          "@type": "Organization",
          "name": release.label
        }
      }))
    })
  } : null;

  // Find prev/next artists for navigation
  const currentIndex = artists.findIndex(a => a.id === id);
  const prevArtist = currentIndex > 0 ? artists[currentIndex - 1] : null;
  const nextArtist = currentIndex < artists.length - 1 ? artists[currentIndex + 1] : null;

  if (!artist) {
    return (
      <PageLayout
        title="Artist Not Found"
        path={`/artists/${id}`}
      >
        <div className="container mx-auto px-4 md:px-8 py-16">
          <p className="font-mono text-muted-foreground">
            Artist not found
          </p>
          <Link to="/artists" className="font-mono text-xs text-primary hover:underline mt-4 inline-block">
            ← Back to Artists
          </Link>
        </div>
      </PageLayout>
    );
  }

  // Get related artists (same region or shared tags)
  const relatedArtists = artists
    .filter(a => 
      a.id !== artist.id && 
      (a.region === artist.region || a.tags.some(t => artist.tags.includes(t)))
    )
    .slice(0, 6);

  return (
    <PageLayout
      title={`${artist.name} - Techno Artist`}
      description={artist.bio.slice(0, 155) + '...'}
      path={`/artists/${artist.id}`}
      structuredData={personSchema}
    >
      <article className="container mx-auto px-4 md:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <DetailBreadcrumb 
            items={[
              { label: 'Artists', href: '/artists' },
              { label: artist.name }
            ]} 
          />

          {/* Navigation Row */}
          <div className="flex items-center justify-between mb-8">
            {/* Back Link */}
            <Link 
              to="/artists" 
              className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Artists
            </Link>

            {/* Prev/Next Navigation */}
            <div className="flex items-center gap-2">
              {prevArtist ? (
                <Link
                  to={`/artists/${prevArtist.id}`}
                  className="flex items-center gap-2 px-3 py-2 border border-border hover:bg-card transition-colors group"
                  title={prevArtist.name}
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-mono text-xs uppercase tracking-wider hidden sm:inline max-w-[100px] truncate">
                    {prevArtist.name}
                  </span>
                </Link>
              ) : (
                <div className="px-3 py-2 border border-border/30 text-muted-foreground/30 cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </div>
              )}

              <span className="font-mono text-xs text-muted-foreground px-2">
                {currentIndex + 1}/{artists.length}
              </span>

              {nextArtist ? (
                <Link
                  to={`/artists/${nextArtist.id}`}
                  className="flex items-center gap-2 px-3 py-2 border border-border hover:bg-card transition-colors group"
                  title={nextArtist.name}
                >
                  <span className="font-mono text-xs uppercase tracking-wider hidden sm:inline max-w-[100px] truncate">
                    {nextArtist.name}
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
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Artist Photo - Film Frame */}
            <div className="relative">
              <GlitchSVGFilter />
              {artist.image ? (
                <div className="relative">
                  <GlitchImage
                    src={artist.image.url}
                    alt={artist.name}
                    frameNumber={String(currentIndex + 1).padStart(2, '0')}
                    className="aspect-square"
                  />
                  {/* Attribution overlay */}
                  <div className="absolute top-6 right-6 z-30 bg-background/90 backdrop-blur-sm border border-crimson/30 px-2 py-1 text-xs font-mono">
                    <a 
                      href={artist.image.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-crimson transition-colors flex items-center gap-1"
                    >
                      📷 {artist.image.author}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href={artist.image.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground/70 hover:text-foreground transition-colors text-[10px]"
                    >
                      {artist.image.license}
                    </a>
                  </div>
                  {/* Tags overlay */}
                  <div className="absolute bottom-6 left-6 right-6 z-30">
                    <div className="flex flex-wrap gap-2">
                      {artist.tags.map(tag => (
                        <Link
                          key={tag}
                          to={`/artists?tag=${tag}`}
                          className="font-mono text-xs bg-background/90 border border-crimson/30 px-2 py-1 hover:bg-crimson hover:text-foreground transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-square relative overflow-hidden border border-border bg-zinc-800 flex items-center justify-center">
                  <div className="text-center p-8">
                    <User className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 text-muted-foreground/30" />
                    <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-tight mb-2 text-muted-foreground">
                      {artist.name}
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground/70">
                      {artist.city}, {artist.country}
                    </p>
                  </div>
                  {/* Tags for no-image state */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex flex-wrap gap-2">
                      {artist.tags.map(tag => (
                        <Link
                          key={tag}
                          to={`/artists?tag=${tag}`}
                          className="font-mono text-xs bg-background/90 border border-border px-2 py-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div className="space-y-6">
              <div>
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">
                  // {artist.region}
                </div>
                <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight mb-2 hover:animate-glitch">
                  {artist.name}
                </h1>
                {artist.realName && (
                  <p className="font-mono text-sm text-muted-foreground">
                    {artist.realName}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-4 font-mono text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {artist.city}, {artist.country}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {artist.active}
                </div>
              </div>

              <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                {artist.bio}
              </p>

              {artist.labels && artist.labels.length > 0 && (
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Labels
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {artist.labels.map(label => (
                      <Link
                        key={label}
                        to={`/labels?search=${label}`}
                        className="font-mono text-xs border border-border px-3 py-1.5 hover:bg-card transition-colors"
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {artist.collaborators && artist.collaborators.length > 0 && (
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Collaborators
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {artist.collaborators.map(collab => (
                      <span
                        key={collab}
                        className="font-mono text-xs border border-border px-3 py-1.5"
                      >
                        {collab}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Career Highlights */}
          {artist.careerHighlights && artist.careerHighlights.length > 0 && (
            <section className="mb-12 border-t border-border pt-8">
              <h2 className="font-mono text-xl uppercase tracking-wide mb-6">
                Career Highlights
              </h2>
              <ul className="space-y-3">
                {artist.careerHighlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-3 font-mono text-sm">
                    <span className="text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Key Releases */}
          {artist.keyReleases && artist.keyReleases.length > 0 && (
            <section className="mb-12 border-t border-border pt-8">
              <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
                <Disc3 className="w-5 h-5" />
                Key Releases
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {artist.keyReleases.map((release, i) => (
                  <div 
                    key={i} 
                    className="border border-border p-4 hover:bg-card transition-colors group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-mono text-sm uppercase group-hover:animate-glitch">
                        {release.title}
                      </h3>
                      <span className="font-mono text-xs text-muted-foreground">
                        {release.year}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs text-muted-foreground">
                        {release.label}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
                        {release.format}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* YouTube DJ Sets & Performances */}
          <YouTubeVideos artistName={artist.name} />

          {/* Gear & Rider */}
          <section className="mb-12 border-t border-border pt-8">
            <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
              <Wrench className="w-5 h-5" />
              Gear & Rider
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Studio Gear */}
              {artist.studioGear && artist.studioGear.length > 0 && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    Studio
                  </h3>
                  <ul className="space-y-2">
                    {artist.studioGear.map((gear, i) => (
                      <li key={i} className="font-mono text-xs text-muted-foreground">
                        → {gear}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Live Setup */}
              {artist.liveSetup && artist.liveSetup.length > 0 && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    Live Setup
                  </h3>
                  <ul className="space-y-2">
                    {artist.liveSetup.map((gear, i) => (
                      <li key={i} className="font-mono text-xs text-muted-foreground">
                        → {gear}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* DJ Setup */}
              {artist.djSetup && artist.djSetup.length > 0 && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    DJ Setup
                  </h3>
                  <ul className="space-y-2">
                    {artist.djSetup.map((gear, i) => (
                      <li key={i} className="font-mono text-xs text-muted-foreground">
                        → {gear}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Rider Notes */}
            {artist.riderNotes && (
              <div className="mt-4 border border-border p-4 bg-card/50">
                <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Rider Notes
                </h3>
                <p className="font-mono text-sm text-muted-foreground">
                  {artist.riderNotes}
                </p>
              </div>
            )}
          </section>

          {/* Community Contributions - Side by Side Collapsible */}
          <section className="mb-12 border-t border-border pt-8">
            <h2 className="font-mono text-xl uppercase tracking-wide mb-6">
              Community Contributions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Photo Upload - Collapsible */}
              <CommunityWidgetPhoto
                entityType="artist"
                entityId={artist.id}
                title={`Upload photos of ${artist.name}`}
                description="Share live performance shots, studio photos, or event captures. All submissions are reviewed before publishing."
                collapsible
              />

              {/* Correction - Collapsible */}
              <CommunityWidgetCorrection
                entityType="artist"
                entityId={artist.id}
                entityName={artist.name}
                title="Submit a correction"
                description="Report incorrect information about bio, labels, releases, or other details."
                collapsible
              />
            </div>
          </section>

          {/* Related Artists */}
          {relatedArtists.length > 0 && (
            <section className="border-t border-border pt-8">
              <h2 className="font-mono text-xl uppercase tracking-wide mb-6">
                Related Artists
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedArtists.map(related => (
                  <Link
                    key={related.id}
                    to={`/artists/${related.id}`}
                    className="border border-border p-4 hover:bg-card transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-mono text-sm uppercase group-hover:animate-glitch">
                        {related.name}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">
                      {related.city}, {related.country}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {related.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="font-mono text-xs text-muted-foreground border border-border px-1.5 py-0.5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Deep Links */}
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Explore More
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link 
                to={`/releases?artist=${artist.id}`}
                className="font-mono text-xs border border-border px-4 py-2 hover:bg-card transition-colors"
              >
                → Releases
              </Link>
              <Link 
                to={`/artists?region=${artist.region}`}
                className="font-mono text-xs border border-border px-4 py-2 hover:bg-card transition-colors"
              >
                → {artist.region} Artists
              </Link>
              {artist.labels && artist.labels[0] && (
                <Link 
                  to={`/labels?search=${artist.labels[0]}`}
                  className="font-mono text-xs border border-border px-4 py-2 hover:bg-card transition-colors"
                >
                  → {artist.labels[0]}
                </Link>
              )}
              <Link 
                to="/mad/timeline"
                className="font-mono text-xs border border-border px-4 py-2 hover:bg-card transition-colors"
              >
              → Timeline
            </Link>
          </div>
        </section>
      </article>
    </PageLayout>
  );
};

export default ArtistDetail;
