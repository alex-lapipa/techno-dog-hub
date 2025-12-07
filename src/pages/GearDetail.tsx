import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Building2, Sliders, Radio, Users, Disc3, Wrench, ExternalLink, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getGearById, getRelatedGear, gearCategories } from "@/data/gear";
import { gearImages } from "@/assets/gear";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GearDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const gearItem = id ? getGearById(id) : null;

  if (!gearItem) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="font-mono text-muted-foreground">
              {language === 'en' ? 'Gear not found' : 'Equipo no encontrado'}
            </p>
            <Link to="/gear" className="font-mono text-xs text-primary hover:underline mt-4 inline-block">
              ← {language === 'en' ? 'Back to Gear' : 'Volver a Equipo'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedItems = getRelatedGear(gearItem.relatedGear);
  const localImage = gearImages[gearItem.id];
  const imageSrc = localImage || gearItem.imageUrl;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link 
            to="/gear" 
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {language === 'en' ? 'Back to Gear' : 'Volver a Equipo'}
          </Link>

          {/* Hero Section - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 sm:mb-12">
            {/* Main Image */}
            <a 
              href={gearItem.officialUrl || '#'}
              target={gearItem.officialUrl ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`aspect-square sm:aspect-[4/3] lg:aspect-square relative overflow-hidden border border-border bg-card/50 group ${gearItem.officialUrl ? 'cursor-pointer' : 'cursor-default'}`}
            >
              {imageSrc ? (
                <>
                  <img 
                    src={imageSrc} 
                    alt={gearItem.name}
                    className="w-full h-full object-contain p-4 sm:p-6 transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden text-center p-6 flex-col items-center justify-center h-full">
                    <Sliders className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="font-mono text-xs text-muted-foreground">{gearItem.name}</p>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 flex flex-col items-center justify-center h-full">
                  <Sliders className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="font-mono text-xs text-muted-foreground">{gearItem.name}</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
              
              {/* Official site indicator */}
              {gearItem.officialUrl && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-background/90 border border-border px-2 sm:px-3 py-1 flex items-center gap-2">
                    <ExternalLink className="w-3 h-3" />
                    <span className="font-mono text-[10px] sm:text-xs hidden sm:inline">{language === 'en' ? 'View Official' : 'Ver Oficial'}</span>
                  </div>
                </div>
              )}
              
              {/* Tags */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {gearItem.tags.slice(0, 5).map(tag => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] sm:text-xs bg-background/90 border border-border px-1.5 sm:px-2 py-0.5 sm:py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>

            {/* Gear Info */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2">
                  // {gearCategories[gearItem.category][language]}
                </div>
                <h1 className="font-mono text-2xl sm:text-4xl lg:text-5xl xl:text-6xl uppercase tracking-tight mb-2 hover:animate-glitch break-words">
                  {gearItem.name}
                </h1>
              </div>

              <div className="flex flex-wrap gap-3 sm:gap-4 font-mono text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  {gearItem.manufacturer}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  {gearItem.releaseYear}
                </div>
              </div>

              <p className="font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {gearItem.shortDescription[language]}
              </p>

              {/* Official Link */}
              {gearItem.officialUrl && (
                <a 
                  href={gearItem.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[10px] sm:text-xs uppercase tracking-wider border border-foreground px-3 sm:px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
                >
                  <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                  {language === 'en' ? 'Official Product Page' : 'Página Oficial'}
                </a>
              )}
            </div>
          </div>

          {/* Technical Overview */}
          <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
            <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
              {language === 'en' ? 'Technical Overview' : 'Especificaciones Técnicas'}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {gearItem.technicalOverview.synthesisType && (
                <div className="border border-border p-3 sm:p-4">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    {language === 'en' ? 'Synthesis Type' : 'Tipo de Síntesis'}
                  </h3>
                  <p className="font-mono text-xs sm:text-sm">{gearItem.technicalOverview.synthesisType}</p>
                </div>
              )}
              {gearItem.technicalOverview.polyphony && (
                <div className="border border-border p-3 sm:p-4">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    {language === 'en' ? 'Polyphony' : 'Polifonía'}
                  </h3>
                  <p className="font-mono text-xs sm:text-sm">{gearItem.technicalOverview.polyphony}</p>
                </div>
              )}
              {gearItem.technicalOverview.architecture && (
                <div className="border border-border p-3 sm:p-4 sm:col-span-2">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    {language === 'en' ? 'Architecture' : 'Arquitectura'}
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-muted-foreground">{gearItem.technicalOverview.architecture}</p>
                </div>
              )}
              {gearItem.technicalOverview.midiSync && (
                <div className="border border-border p-3 sm:p-4">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    MIDI / Sync
                  </h3>
                  <p className="font-mono text-xs sm:text-sm">{gearItem.technicalOverview.midiSync}</p>
                </div>
              )}
              {gearItem.technicalOverview.sequencer && (
                <div className="border border-border p-3 sm:p-4">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    {language === 'en' ? 'Sequencer' : 'Secuenciador'}
                  </h3>
                  <p className="font-mono text-xs sm:text-sm">{gearItem.technicalOverview.sequencer}</p>
                </div>
              )}
              {gearItem.technicalOverview.inputsOutputs && (
                <div className="border border-border p-3 sm:p-4">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    {language === 'en' ? 'Inputs / Outputs' : 'Entradas / Salidas'}
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-muted-foreground">{gearItem.technicalOverview.inputsOutputs}</p>
                </div>
              )}
              {gearItem.technicalOverview.modifications && (
                <div className="border border-border p-3 sm:p-4">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    {language === 'en' ? 'Modifications' : 'Modificaciones'}
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-muted-foreground">{gearItem.technicalOverview.modifications}</p>
                </div>
              )}
            </div>

            {/* Strengths & Limitations */}
            {(gearItem.technicalOverview.strengths || gearItem.technicalOverview.limitations) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
                {gearItem.technicalOverview.strengths && (
                  <div className="border border-border p-3 sm:p-4 bg-card/30">
                    <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-foreground mb-1 sm:mb-2">
                      {language === 'en' ? 'Strengths' : 'Fortalezas'}
                    </h3>
                    <p className="font-mono text-xs sm:text-sm text-muted-foreground">{gearItem.technicalOverview.strengths}</p>
                  </div>
                )}
                {gearItem.technicalOverview.limitations && (
                  <div className="border border-border p-3 sm:p-4">
                    <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                      {language === 'en' ? 'Limitations' : 'Limitaciones'}
                    </h3>
                    <p className="font-mono text-xs sm:text-sm text-muted-foreground">{gearItem.technicalOverview.limitations}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Notable Artists */}
          {gearItem.notableArtists.length > 0 && (
            <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
              <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                {language === 'en' ? 'Notable Artists' : 'Artistas Destacados'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {gearItem.notableArtists.map((artist, i) => (
                  <div key={i} className="border border-border p-3 sm:p-4 hover:bg-card transition-colors">
                    <h3 className="font-mono text-xs sm:text-sm uppercase mb-1">{artist.name}</h3>
                    <p className="font-mono text-[10px] sm:text-xs text-muted-foreground">{artist.usage}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Famous Tracks */}
          {gearItem.famousTracks.length > 0 && (
            <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
              <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <Disc3 className="w-4 h-4 sm:w-5 sm:h-5" />
                {language === 'en' ? 'Famous Tracks' : 'Tracks Famosos'}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {gearItem.famousTracks.map((track, i) => (
                  <div key={i} className="border border-border p-3 sm:p-4 hover:bg-card transition-colors group">
                    <div className="flex justify-between items-start mb-1 sm:mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-mono text-xs sm:text-sm uppercase group-hover:animate-glitch truncate">
                          {track.artist} — "{track.title}"
                        </h3>
                        <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">{track.year}</span>
                      </div>
                      <Play className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground group-hover:text-foreground flex-shrink-0 ml-2" />
                    </div>
                    <p className="font-mono text-[10px] sm:text-xs text-muted-foreground">{track.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Techno Applications */}
          <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
            <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
              {language === 'en' ? 'Techno Applications' : 'Aplicaciones en Techno'}
            </h2>
            <div className="border border-border p-4 sm:p-6 bg-card/30">
              <p className="font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {gearItem.technoApplications[language]}
              </p>
            </div>
          </section>

          {/* Related Gear */}
          {relatedItems.length > 0 && (
            <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
              <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6">
                {language === 'en' ? 'Related Gear' : 'Equipo Relacionado'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {relatedItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/gear/${item.id}`}
                    className="border border-border p-3 sm:p-4 hover:bg-card transition-colors group"
                  >
                    <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                      {gearCategories[item.category][language]}
                    </span>
                    <h3 className="font-mono text-xs sm:text-sm uppercase group-hover:animate-glitch">
                      {item.name}
                    </h3>
                    <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-1">
                      {item.manufacturer} • {item.releaseYear}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* YouTube Videos - Embedded */}
          {gearItem.youtubeVideos && gearItem.youtubeVideos.length > 0 && (
            <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
              <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                {language === 'en' ? 'Media & Demos' : 'Media y Demos'}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {gearItem.youtubeVideos.map((video, i) => {
                  // Extract YouTube video ID from URL
                  const videoId = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
                  
                  return (
                    <div key={i} className="border border-border overflow-hidden bg-card/30">
                      {videoId ? (
                        <div className="aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-video bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                        >
                          <Play className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
                        </a>
                      )}
                      <div className="p-3 sm:p-4">
                        <h3 className="font-mono text-xs sm:text-sm mb-1 line-clamp-2">{video.title}</h3>
                        <p className="font-mono text-[10px] sm:text-xs text-muted-foreground">{video.channel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GearDetail;
