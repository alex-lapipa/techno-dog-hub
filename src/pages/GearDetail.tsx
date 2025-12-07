import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Building2, Sliders, Music2, Radio, Users, Disc3, Wrench, ExternalLink, Play } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getGearById, getRelatedGear, gearCategories, gear } from "@/data/gear";
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
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 md:px-8">
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Breadcrumb */}
          <Link 
            to="/gear" 
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {language === 'en' ? 'Back to Gear' : 'Volver a Equipo'}
          </Link>

          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Image */}
            <div className="aspect-square relative overflow-hidden border border-border bg-card/50">
              {gearItem.imageUrl ? (
                <img 
                  src={gearItem.imageUrl} 
                  alt={gearItem.name}
                  className="w-full h-full object-contain p-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`text-center p-8 flex flex-col items-center justify-center h-full ${gearItem.imageUrl ? 'hidden' : ''}`}>
                <Sliders className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="font-mono text-xs text-muted-foreground">
                  {language === 'en' ? 'Equipment visualization' : 'Visualización del equipo'}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex flex-wrap gap-2">
                  {gearItem.tags.map(tag => (
                    <span
                      key={tag}
                      className="font-mono text-xs bg-background/90 border border-border px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Gear Info */}
            <div className="space-y-6">
              <div>
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">
                  // {gearCategories[gearItem.category][language]}
                </div>
                <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight mb-2 hover:animate-glitch">
                  {gearItem.name}
                </h1>
              </div>

              <div className="flex flex-wrap gap-4 font-mono text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  {gearItem.manufacturer}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {gearItem.releaseYear}
                </div>
              </div>

              <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                {gearItem.shortDescription[language]}
              </p>

              {/* Official Link */}
              {gearItem.officialUrl && (
                <a 
                  href={gearItem.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {language === 'en' ? 'Official Product Page' : 'Página Oficial'}
                </a>
              )}
            </div>
          </div>

          {/* Technical Overview */}
          <section className="mb-12 border-t border-border pt-8">
            <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
              <Wrench className="w-5 h-5" />
              {language === 'en' ? 'Technical Overview' : 'Especificaciones Técnicas'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {gearItem.technicalOverview.synthesisType && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {language === 'en' ? 'Synthesis Type' : 'Tipo de Síntesis'}
                  </h3>
                  <p className="font-mono text-sm">{gearItem.technicalOverview.synthesisType}</p>
                </div>
              )}
              {gearItem.technicalOverview.polyphony && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {language === 'en' ? 'Polyphony' : 'Polifonía'}
                  </h3>
                  <p className="font-mono text-sm">{gearItem.technicalOverview.polyphony}</p>
                </div>
              )}
              {gearItem.technicalOverview.architecture && (
                <div className="border border-border p-4 md:col-span-2">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {language === 'en' ? 'Architecture' : 'Arquitectura'}
                  </h3>
                  <p className="font-mono text-sm text-muted-foreground">{gearItem.technicalOverview.architecture}</p>
                </div>
              )}
              {gearItem.technicalOverview.midiSync && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    MIDI / Sync
                  </h3>
                  <p className="font-mono text-sm">{gearItem.technicalOverview.midiSync}</p>
                </div>
              )}
              {gearItem.technicalOverview.sequencer && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {language === 'en' ? 'Sequencer' : 'Secuenciador'}
                  </h3>
                  <p className="font-mono text-sm">{gearItem.technicalOverview.sequencer}</p>
                </div>
              )}
              {gearItem.technicalOverview.inputsOutputs && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {language === 'en' ? 'Inputs / Outputs' : 'Entradas / Salidas'}
                  </h3>
                  <p className="font-mono text-sm text-muted-foreground">{gearItem.technicalOverview.inputsOutputs}</p>
                </div>
              )}
              {gearItem.technicalOverview.modifications && (
                <div className="border border-border p-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {language === 'en' ? 'Modifications' : 'Modificaciones'}
                  </h3>
                  <p className="font-mono text-sm text-muted-foreground">{gearItem.technicalOverview.modifications}</p>
                </div>
              )}
            </div>

            {/* Strengths & Limitations */}
            {(gearItem.technicalOverview.strengths || gearItem.technicalOverview.limitations) && (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {gearItem.technicalOverview.strengths && (
                  <div className="border border-border p-4 bg-card/30">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-foreground mb-2">
                      {language === 'en' ? 'Strengths' : 'Fortalezas'}
                    </h3>
                    <p className="font-mono text-sm text-muted-foreground">{gearItem.technicalOverview.strengths}</p>
                  </div>
                )}
                {gearItem.technicalOverview.limitations && (
                  <div className="border border-border p-4">
                    <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2">
                      {language === 'en' ? 'Limitations' : 'Limitaciones'}
                    </h3>
                    <p className="font-mono text-sm text-muted-foreground">{gearItem.technicalOverview.limitations}</p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Notable Artists */}
          {gearItem.notableArtists.length > 0 && (
            <section className="mb-12 border-t border-border pt-8">
              <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
                <Users className="w-5 h-5" />
                {language === 'en' ? 'Notable Artists' : 'Artistas Destacados'}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {gearItem.notableArtists.map((artist, i) => (
                  <div key={i} className="border border-border p-4 hover:bg-card transition-colors">
                    <h3 className="font-mono text-sm uppercase mb-1">{artist.name}</h3>
                    <p className="font-mono text-xs text-muted-foreground">{artist.usage}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Famous Tracks */}
          {gearItem.famousTracks.length > 0 && (
            <section className="mb-12 border-t border-border pt-8">
              <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
                <Disc3 className="w-5 h-5" />
                {language === 'en' ? 'Famous Tracks' : 'Tracks Famosos'}
              </h2>
              <div className="space-y-3">
                {gearItem.famousTracks.map((track, i) => (
                  <div key={i} className="border border-border p-4 hover:bg-card transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-mono text-sm uppercase group-hover:animate-glitch">
                          {track.artist} — "{track.title}"
                        </h3>
                        <span className="font-mono text-xs text-muted-foreground">{track.year}</span>
                      </div>
                      <Play className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{track.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Techno Applications */}
          <section className="mb-12 border-t border-border pt-8">
            <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
              <Radio className="w-5 h-5" />
              {language === 'en' ? 'Techno Applications' : 'Aplicaciones en Techno'}
            </h2>
            <div className="border border-border p-6 bg-card/30">
              <p className="font-mono text-sm leading-relaxed text-muted-foreground">
                {gearItem.technoApplications[language]}
              </p>
            </div>
          </section>

          {/* Related Gear */}
          {relatedItems.length > 0 && (
            <section className="mb-12 border-t border-border pt-8">
              <h2 className="font-mono text-xl uppercase tracking-wide mb-6">
                {language === 'en' ? 'Related Gear' : 'Equipo Relacionado'}
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {relatedItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/gear/${item.id}`}
                    className="border border-border p-4 hover:bg-card transition-colors group"
                  >
                    <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                      {gearCategories[item.category][language]}
                    </span>
                    <h3 className="font-mono text-sm uppercase group-hover:animate-glitch">
                      {item.name}
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      {item.manufacturer} • {item.releaseYear}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Media & Videos */}
          <section className="mb-12 border-t border-border pt-8">
            <h2 className="font-mono text-xl uppercase tracking-wide mb-6 flex items-center gap-3">
              <Play className="w-5 h-5" />
              {language === 'en' ? 'Media & Demos' : 'Media y Demos'}
            </h2>
            {gearItem.youtubeVideos && gearItem.youtubeVideos.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {gearItem.youtubeVideos.map((video, i) => (
                  <a
                    key={i}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-border p-4 hover:bg-card transition-colors group flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-destructive/20 rounded flex items-center justify-center flex-shrink-0">
                      <Play className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-mono text-sm group-hover:animate-glitch">{video.title}</h3>
                      <p className="font-mono text-xs text-muted-foreground">{video.channel}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="border border-border border-dashed p-8 flex items-center justify-center">
                <p className="font-mono text-xs text-muted-foreground text-center">
                  {language === 'en' 
                    ? 'Video demos coming soon' 
                    : 'Demos en video próximamente'}
                </p>
              </div>
            )}
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GearDetail;
