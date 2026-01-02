import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Building2, Sliders, Radio, Users, Disc3, Wrench, ExternalLink, Play, ChevronLeft, ChevronRight, Loader2, Waves, Filter, Activity, Sparkles } from "lucide-react";
import { gearCategories } from "@/data/gear";
import { useGearData, useGearItem } from "@/hooks/useGearData";
import { PageLayout } from "@/components/layout";
import DetailBreadcrumb from "@/components/DetailBreadcrumb";
import GearYouTubeVideos from "@/components/GearYouTubeVideos";
import { GlitchImage, GlitchSVGFilter } from "@/components/store/GlitchImage";
import { ContributeWidget } from "@/components/community/ContributeWidget";

const GearDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: gearItem, isLoading } = useGearItem(id || "");
  const { data: allGear = [] } = useGearData();

  // Find prev/next gear for navigation
  const currentIndex = allGear.findIndex(g => g.id === id);
  const prevGear = currentIndex > 0 ? allGear[currentIndex - 1] : null;
  const nextGear = currentIndex < allGear.length - 1 ? allGear[currentIndex + 1] : null;

  if (isLoading) {
    return (
      <PageLayout title="Loading..." path={`/gear/${id}`}>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    );
  }

  if (!gearItem) {
    return (
      <PageLayout title="Gear Not Found" path={`/gear/${id}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="font-mono text-muted-foreground">
            Gear not found
          </p>
          <Link to="/gear" className="font-mono text-xs text-primary hover:underline mt-4 inline-block">
            ← Back to Gear
          </Link>
        </div>
      </PageLayout>
    );
  }

  const relatedItems = allGear.filter(g => gearItem.relatedGear.includes(g.id));

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": gearItem.name,
    "description": gearItem.shortDescription.en,
    "url": `https://techno.dog/gear/${gearItem.id}`,
    ...(gearItem.image && { "image": gearItem.image.url }),
    "manufacturer": {
      "@type": "Organization",
      "name": gearItem.manufacturer
    },
    "category": gearCategories[gearItem.category].en,
    "keywords": gearItem.tags.join(", ")
  };

  return (
    <PageLayout
      title={`${gearItem.name} - ${gearItem.manufacturer} ${gearCategories[gearItem.category].en}`}
      description={gearItem.shortDescription.en}
      path={`/gear/${gearItem.id}`}
      structuredData={productSchema}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb Navigation */}
          <DetailBreadcrumb 
            items={[
              { label: 'Gear', href: '/gear' },
              { label: gearItem.name }
            ]} 
          />

          {/* Navigation Row */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            {/* Back Link */}
            <Link 
              to="/gear" 
              className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Gear
            </Link>

            {/* Prev/Next Navigation */}
            <div className="flex items-center gap-2">
              {prevGear ? (
                <Link
                  to={`/gear/${prevGear.id}`}
                  className="flex items-center gap-2 px-3 py-2 border border-border hover:bg-card transition-colors group"
                  title={prevGear.name}
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-mono text-xs uppercase tracking-wider hidden sm:inline max-w-[100px] truncate">
                    {prevGear.name}
                  </span>
                </Link>
              ) : (
                <div className="px-3 py-2 border border-border/30 text-muted-foreground/30 cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4" />
                </div>
              )}

              <span className="font-mono text-xs text-muted-foreground px-2">
                {currentIndex + 1}/{allGear.length}
              </span>

              {nextGear ? (
                <Link
                  to={`/gear/${nextGear.id}`}
                  className="flex items-center gap-2 px-3 py-2 border border-border hover:bg-card transition-colors group"
                  title={nextGear.name}
                >
                  <span className="font-mono text-xs uppercase tracking-wider hidden sm:inline max-w-[100px] truncate">
                    {nextGear.name}
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

          {/* Hero Section - Responsive Grid */}
          <GlitchSVGFilter />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 sm:mb-12">
            {/* Gear Image with VHS Film Filter */}
            <div className="relative group">
              {gearItem.image ? (
                <a 
                  href={gearItem.image.sourceUrl || gearItem.officialUrl || '#'}
                  target={gearItem.image.sourceUrl || gearItem.officialUrl ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="block"
                >
                  <GlitchImage
                    src={gearItem.image.url}
                    alt={gearItem.name}
                    frameNumber={String(currentIndex + 1).padStart(2, '0')}
                    className="w-full"
                  />
                  
                  {/* Source indicator overlay */}
                  <div className="absolute top-6 right-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-background/90 border border-crimson/30 px-2 sm:px-3 py-1 flex items-center gap-2">
                      <ExternalLink className="w-3 h-3 text-crimson" />
                      <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">
                        {gearItem.image.sourceName}
                      </span>
                    </div>
                  </div>
                  
                  {/* Tags overlay */}
                  <div className="absolute bottom-6 left-6 right-6 z-30">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {gearItem.tags.slice(0, 5).map(tag => (
                        <span
                          key={tag}
                          className="font-mono text-[10px] sm:text-xs bg-background/90 border border-crimson/30 px-1.5 sm:px-2 py-0.5 sm:py-1 text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </a>
              ) : (
                <div className="aspect-square relative overflow-hidden border border-border bg-card/30 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Sliders className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-6 text-muted-foreground/30" />
                    <h2 className="font-mono text-lg sm:text-xl uppercase tracking-tight mb-2 text-muted-foreground">
                      {gearItem.name}
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground/70">
                      {gearItem.manufacturer} • {gearItem.releaseYear}
                    </p>
                  </div>
                  {/* Tags for no-image state */}
                  <div className="absolute bottom-3 left-3 right-3">
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
                </div>
              )}
              
              {/* Image Attribution */}
              {gearItem.image && (
                <div className="mt-2 font-mono text-[9px] sm:text-[10px] text-muted-foreground/70 leading-relaxed">
                  <span>Photo: </span>
                  <a 
                    href={gearItem.image.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground underline"
                  >
                    {gearItem.image.author}
                  </a>
                  <span> / </span>
                  <a 
                    href={gearItem.image.licenseUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-foreground underline"
                  >
                    {gearItem.image.license}
                  </a>
                  <span> via {gearItem.image.sourceName}</span>
                </div>
              )}
            </div>

            {/* Gear Info */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-2">
                  // {gearCategories[gearItem.category].en}
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
                {gearItem.shortDescription.en}
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
                  Official Product Page
                </a>
              )}
            </div>
          </div>

          {/* Signal Path / Core Specs */}
          {gearItem.technicalSpecs && (
            gearItem.technicalSpecs.oscillatorsPerVoice || 
            gearItem.technicalSpecs.filters || 
            gearItem.technicalSpecs.lfos || 
            gearItem.technicalSpecs.envelopes ||
            gearItem.technicalSpecs.effectsOnboard
          ) && (
            <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
              <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <Waves className="w-4 h-4 sm:w-5 sm:h-5" />
                Signal Path
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {gearItem.technicalSpecs.oscillatorsPerVoice && (
                  <div className="border border-border p-3 sm:p-4 bg-card/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Waves className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                        Oscillators
                      </h3>
                    </div>
                    <p className="font-mono text-sm sm:text-base font-medium">{gearItem.technicalSpecs.oscillatorsPerVoice}</p>
                    {gearItem.technicalSpecs.oscillatorTypes && (
                      <p className="font-mono text-[10px] sm:text-xs text-muted-foreground mt-1">{gearItem.technicalSpecs.oscillatorTypes}</p>
                    )}
                  </div>
                )}
                
                {gearItem.technicalSpecs.filters && (
                  <div className="border border-border p-3 sm:p-4 bg-card/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                        Filter
                      </h3>
                    </div>
                    <p className="font-mono text-xs sm:text-sm">{gearItem.technicalSpecs.filters}</p>
                  </div>
                )}
                
                {gearItem.technicalSpecs.lfos && (
                  <div className="border border-border p-3 sm:p-4 bg-card/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                        LFO
                      </h3>
                    </div>
                    <p className="font-mono text-xs sm:text-sm">{gearItem.technicalSpecs.lfos}</p>
                  </div>
                )}
                
                {gearItem.technicalSpecs.envelopes && (
                  <div className="border border-border p-3 sm:p-4 bg-card/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sliders className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                        Envelopes
                      </h3>
                    </div>
                    <p className="font-mono text-xs sm:text-sm">{gearItem.technicalSpecs.envelopes}</p>
                  </div>
                )}
                
                {gearItem.technicalSpecs.effectsOnboard && (
                  <div className="border border-border p-3 sm:p-4 bg-card/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
                        Effects
                      </h3>
                    </div>
                    <p className="font-mono text-xs sm:text-sm">{gearItem.technicalSpecs.effectsOnboard}</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Technical Overview */}
          <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
            <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
              Technical Overview
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {gearItem.technicalOverview.synthesisType && (
                <div className="border border-border p-3 sm:p-4">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    Synthesis Type
                  </h3>
                  <p className="font-mono text-xs sm:text-sm">{gearItem.technicalOverview.synthesisType}</p>
                </div>
              )}
              {gearItem.technicalOverview.polyphony && (
                <div className="border border-border p-3 sm:p-4">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    Polyphony
                  </h3>
                  <p className="font-mono text-xs sm:text-sm">{gearItem.technicalOverview.polyphony}</p>
                </div>
              )}
              {gearItem.technicalOverview.architecture && (
                <div className="border border-border p-3 sm:p-4 sm:col-span-2">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    Architecture
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
                    Sequencer
                  </h3>
                  <p className="font-mono text-xs sm:text-sm">{gearItem.technicalOverview.sequencer}</p>
                </div>
              )}
              {gearItem.technicalOverview.inputsOutputs && (
                <div className="border border-border p-3 sm:p-4">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    Inputs / Outputs
                  </h3>
                  <p className="font-mono text-xs sm:text-sm text-muted-foreground">{gearItem.technicalOverview.inputsOutputs}</p>
                </div>
              )}
              {gearItem.technicalOverview.modifications && (
                <div className="border border-border p-3 sm:p-4">
                  <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                    Modifications
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
                      Strengths
                    </h3>
                    <p className="font-mono text-xs sm:text-sm text-muted-foreground">{gearItem.technicalOverview.strengths}</p>
                  </div>
                )}
                {gearItem.technicalOverview.limitations && (
                  <div className="border border-border p-3 sm:p-4">
                    <h3 className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-1 sm:mb-2">
                      Limitations
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
                Notable Artists
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
                Famous Tracks
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
              Techno Applications
            </h2>
            <div className="border border-border p-4 sm:p-6 bg-card/30">
              <p className="font-mono text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {gearItem.technoApplications.en}
              </p>
            </div>
          </section>

          {/* Related Gear */}
          {relatedItems.length > 0 && (
            <section className="mb-8 sm:mb-12 border-t border-border pt-6 sm:pt-8">
              <h2 className="font-mono text-lg sm:text-xl uppercase tracking-wide mb-4 sm:mb-6">
                Related Gear
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {relatedItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/gear/${item.id}`}
                    className="border border-border p-3 sm:p-4 hover:bg-card transition-colors group"
                  >
                    <span className="font-mono text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                      {gearCategories[item.category].en}
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

          {/* YouTube Videos - VHS Design System */}
          {gearItem.youtubeVideos && gearItem.youtubeVideos.length > 0 && (
            <GearYouTubeVideos 
              videos={gearItem.youtubeVideos} 
              gearName={gearItem.name} 
            />
          )}

          {/* Contribute Widget */}
          <aside className="mt-8 sm:mt-12">
            <ContributeWidget 
              entityType="gear" 
              entityId={gearItem.id}
              entityName={gearItem.name}
              variant="default"
            />
          </aside>
        </div>
      </PageLayout>
    );
  };

export default GearDetail;
