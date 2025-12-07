import { Link } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { events, getUpcomingEvents } from "@/data/events";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const CalendarPage = () => {
  const { language } = useLanguage();
  const upcomingEvents = getUpcomingEvents();

  // Group by month
  const groupedByMonth = upcomingEvents.reduce((acc, event) => {
    const date = new Date(event.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString(language === 'en' ? 'en-US' : 'es-ES', { month: 'long', year: 'numeric' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = { name: monthName, events: [] };
    }
    acc[monthKey].events.push(event);
    return acc;
  }, {} as Record<string, { name: string; events: typeof events }>);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-24 lg:pt-16 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="mb-12 space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
              // {language === 'en' ? 'Non-commercial' : 'No comercial'}
            </div>
            <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight">
              {language === 'en' ? 'Calendar' : 'Calendario'}
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'Upcoming events. Informational only. No ticket links. No ads.' 
                : 'Próximos eventos. Solo informativo. Sin enlaces de venta. Sin publicidad.'}
            </p>
          </div>

          {/* Calendar by month */}
          <div className="space-y-12">
            {Object.entries(groupedByMonth)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([monthKey, { name, events: monthEvents }]) => (
                <div key={monthKey}>
                  <h2 className="font-mono text-2xl uppercase tracking-tight mb-6 sticky top-16 bg-background py-2 z-10">
                    {name}
                  </h2>
                  <div className="space-y-4">
                    {monthEvents.map((event) => {
                      const startDate = new Date(event.date);
                      const endDate = event.endDate ? new Date(event.endDate) : null;
                      
                      return (
                        <div
                          key={event.id}
                          className="border border-border p-6 hover:bg-card transition-colors group"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground border border-border px-2 py-1">
                                  {event.type}
                                </span>
                                <span className="font-mono text-xs text-muted-foreground">
                                  {event.city}, {event.country}
                                </span>
                              </div>
                              
                              <h3 className="font-mono text-xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                                {event.name}
                              </h3>
                              
                              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                                <CalendarIcon className="w-4 h-4" />
                                <span className="font-mono text-sm">
                                  {startDate.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { 
                                    day: 'numeric', 
                                    month: 'short' 
                                  })}
                                  {endDate && ` – ${endDate.toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { 
                                    day: 'numeric', 
                                    month: 'short' 
                                  })}`}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {event.tags.map(tag => (
                                  <span key={tag} className="font-mono text-xs text-muted-foreground">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                                {language === 'en' ? 'Artists' : 'Artistas'}:
                              </div>
                              {event.artists.slice(0, 3).map(artist => (
                                <span key={artist} className="font-mono text-xs text-foreground">
                                  {artist}
                                </span>
                              ))}
                              {event.artists.length > 3 && (
                                <span className="font-mono text-xs text-muted-foreground">
                                  +{event.artists.length - 3} {language === 'en' ? 'more' : 'más'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>

          {/* Cross-links */}
          <div className="mt-16 border border-border p-6">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
              // {language === 'en' ? 'Related' : 'Relacionado'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/festivals" className="font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch">
                → {language === 'en' ? 'Festivals' : 'Festivales'}
              </Link>
              <Link to="/venues" className="font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch">
                → {language === 'en' ? 'Venues' : 'Clubs'}
              </Link>
              <Link to="/mad/map" className="font-mono text-sm text-muted-foreground hover:text-foreground hover:animate-glitch">
                → {language === 'en' ? 'Map' : 'Mapa'}
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

export default CalendarPage;
