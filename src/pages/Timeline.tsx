import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { timeline, TimelineEvent } from "@/data/timeline";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const categoryColors: Record<TimelineEvent['category'], string> = {
  birth: 'border-green-500',
  release: 'border-blue-500',
  venue: 'border-purple-500',
  label: 'border-yellow-500',
  cultural: 'border-orange-500',
  political: 'border-red-500',
};

const categoryLabels: Record<TimelineEvent['category'], { en: string; es: string }> = {
  birth: { en: 'BIRTH', es: 'NACIMIENTO' },
  release: { en: 'RELEASE', es: 'LANZAMIENTO' },
  venue: { en: 'VENUE', es: 'CLUB' },
  label: { en: 'LABEL', es: 'SELLO' },
  cultural: { en: 'CULTURAL', es: 'CULTURAL' },
  political: { en: 'POLITICAL', es: 'POLÍTICO' },
};

const TimelinePage = () => {
  const { language } = useLanguage();

  // Group by decade
  const decades = timeline.reduce((acc, event) => {
    const decade = Math.floor(event.year / 10) * 10;
    if (!acc[decade]) acc[decade] = [];
    acc[decade].push(event);
    return acc;
  }, {} as Record<number, TimelineEvent[]>);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 lg:pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-12 space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
              // {language === 'en' ? 'History' : 'Historia'}
            </div>
            <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight">
              {language === 'en' ? 'Timeline' : 'Cronología'}
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'From Kraftwerk to the present. The moments that shaped the sound.' 
                : 'De Kraftwerk al presente. Los momentos que dieron forma al sonido.'}
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-12">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={`w-3 h-3 border-2 ${categoryColors[key as TimelineEvent['category']]}`} />
                <span className="font-mono text-xs text-muted-foreground uppercase">
                  {label[language]}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="space-y-16">
            {Object.entries(decades)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([decade, events]) => (
                <div key={decade}>
                  <h2 className="font-mono text-3xl uppercase tracking-tight mb-8 sticky top-16 bg-background py-2 z-10">
                    {decade}s
                  </h2>
                  <div className="space-y-6 pl-6 border-l border-border">
                    {events
                      .sort((a, b) => a.year - b.year)
                      .map((event) => (
                        <div
                          key={event.id}
                          className={`relative pl-8 border-l-2 ${categoryColors[event.category]} -ml-px group`}
                        >
                          <div className={`absolute left-0 top-0 w-3 h-3 -translate-x-[7px] border-2 bg-background ${categoryColors[event.category]}`} />
                          
                          <div className="flex items-center gap-4 mb-2">
                            <span className="font-mono text-lg text-foreground">
                              {event.year}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                              {categoryLabels[event.category][language]}
                            </span>
                            {event.location && (
                              <span className="font-mono text-xs text-muted-foreground">
                                {event.location}
                              </span>
                            )}
                          </div>
                          
                          <h3 className="font-mono text-xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                            {event.title[language]}
                          </h3>
                          
                          <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                            {event.description[language]}
                          </p>

                          {/* Related links */}
                          {(event.relatedVenues || event.relatedLabels || event.relatedArtists) && (
                            <div className="flex flex-wrap gap-3 mt-3">
                              {event.relatedVenues?.map(v => (
                                <Link
                                  key={v}
                                  to={`/venues/${v}`}
                                  className="font-mono text-xs text-muted-foreground hover:text-foreground hover:animate-glitch"
                                >
                                  → {v}
                                </Link>
                              ))}
                              {event.relatedLabels?.map(l => (
                                <Link
                                  key={l}
                                  to={`/labels/${l}`}
                                  className="font-mono text-xs text-muted-foreground hover:text-foreground hover:animate-glitch"
                                >
                                  → {l}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Cross-links */}
          <div className="mt-16 border border-border p-6">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
              // {language === 'en' ? 'Continue exploring' : 'Sigue explorando'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/venues" className="font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch">
                → {language === 'en' ? 'Venues' : 'Clubs'}
              </Link>
              <Link to="/labels" className="font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch">
                → {language === 'en' ? 'Labels' : 'Sellos'}
              </Link>
              <Link to="/artists" className="font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch">
                → {language === 'en' ? 'Artists' : 'Artistas'}
              </Link>
              <Link to="/mad" className="font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch">
                → {language === 'en' ? 'Mad Stuff' : 'Locuras'}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TimelinePage;
