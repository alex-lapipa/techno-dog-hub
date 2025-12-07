import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { venues } from "@/data/venues";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const VenuesPage = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 sm:mb-12 space-y-3 sm:space-y-4">
            <div className="font-mono text-[10px] sm:text-xs text-muted-foreground uppercase tracking-[0.2em] sm:tracking-[0.3em]">
              // {language === 'en' ? 'Archive' : 'Archivo'}
            </div>
            <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight">
              {language === 'en' ? 'Venues' : 'Clubs'}
            </h1>
            <p className="font-mono text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'The clubs, warehouses, and spaces where techno lives.' 
                : 'Los clubs, almacenes y espacios donde vive el techno.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {venues.map((venue) => (
              <Link
                key={venue.id}
                to={`/venues/${venue.id}`}
                className="group block border border-border p-4 sm:p-6 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground border border-border px-1.5 sm:px-2 py-0.5 sm:py-1">
                    {venue.type}
                  </span>
                  <span className="font-mono text-[10px] sm:text-xs text-muted-foreground">
                    {venue.active}
                  </span>
                </div>
                <h2 className="font-mono text-xl sm:text-2xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                  {venue.name}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground mb-3 sm:mb-4">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-mono text-xs sm:text-sm">{venue.city}, {venue.country}</span>
                </div>
                {venue.atmosphere && (
                  <p className="font-mono text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-3 sm:mb-4">
                    {venue.atmosphere}
                  </p>
                )}
                <div className="flex items-center gap-2 font-mono text-[10px] sm:text-xs text-muted-foreground group-hover:text-foreground">
                  <span>{language === 'en' ? 'View details' : 'Ver detalles'}</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          {/* Count */}
          <div className="mt-6 sm:mt-8 font-mono text-[10px] sm:text-xs text-muted-foreground">
            {venues.length} {language === 'en' ? 'venues in archive' : 'clubs en archivo'}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VenuesPage;
