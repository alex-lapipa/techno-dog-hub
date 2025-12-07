import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Disc3, Wrench, Radio, User, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getArtistById, artists } from "@/data/artists";
import { getReleasesByArtist } from "@/data/releases";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const artist = id ? getArtistById(id) : null;

  if (!artist) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 md:px-8">
            <p className="font-mono text-muted-foreground">
              {language === 'en' ? 'Artist not found' : 'Artista no encontrado'}
            </p>
            <Link to="/artists" className="font-mono text-xs text-primary hover:underline mt-4 inline-block">
              ← {language === 'en' ? 'Back to Artists' : 'Volver a Artistas'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
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
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Breadcrumb */}
          <Link 
            to="/artists" 
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {language === 'en' ? 'Back to Artists' : 'Volver a Artistas'}
          </Link>

          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Artist Placeholder - No fake images */}
            <div className="aspect-square relative overflow-hidden border border-border bg-card/30 flex items-center justify-center">
              <div className="text-center p-8">
                <User className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 text-muted-foreground/30" />
                <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-tight mb-2 text-muted-foreground">
                  {artist.name}
                </h2>
                <p className="font-mono text-xs text-muted-foreground/70">
                  {artist.city}, {artist.country}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
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
                    {language === 'en' ? 'Labels' : 'Sellos'}
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
                    {language === 'en' ? 'Collaborators' : 'Colaboradores'}
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
                {language === 'en' ? 'Career Highlights' : 'Momentos Destacados'}
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
                {language === 'en' ? 'Key Releases' : 'Lanzamientos Clave'}
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

          {/* Gear & Rider */}
          <section className="mb-12 border-t border-border pt-8">
            <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
              <Wrench className="w-5 h-5" />
              {language === 'en' ? 'Gear & Rider' : 'Equipo y Rider'}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Studio Gear */}
              {artist.studioGear && artist.studioGear.length > 0 && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    {language === 'en' ? 'Studio' : 'Estudio'}
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
                    {language === 'en' ? 'Live Setup' : 'Setup Live'}
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
                    {language === 'en' ? 'DJ Setup' : 'Setup DJ'}
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
                  {language === 'en' ? 'Rider Notes' : 'Notas del Rider'}
                </h3>
                <p className="font-mono text-sm text-muted-foreground">
                  {artist.riderNotes}
                </p>
              </div>
            )}
          </section>


          {/* Related Artists */}
          {relatedArtists.length > 0 && (
            <section className="border-t border-border pt-8">
              <h2 className="font-mono text-xl uppercase tracking-wide mb-6">
                {language === 'en' ? 'Related Artists' : 'Artistas Relacionados'}
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
              {language === 'en' ? 'Explore More' : 'Explorar Más'}
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link 
                to={`/releases?artist=${artist.id}`}
                className="font-mono text-xs border border-border px-4 py-2 hover:bg-card transition-colors"
              >
                → {language === 'en' ? 'Releases' : 'Lanzamientos'}
              </Link>
              <Link 
                to={`/artists?region=${artist.region}`}
                className="font-mono text-xs border border-border px-4 py-2 hover:bg-card transition-colors"
              >
                → {artist.region} {language === 'en' ? 'Artists' : 'Artistas'}
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
                → {language === 'en' ? 'Timeline' : 'Línea temporal'}
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistDetail;
