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
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-12 space-y-4">
            <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
              // {language === 'en' ? 'Archive' : 'Archivo'}
            </div>
            <h1 className="font-mono text-4xl md:text-6xl uppercase tracking-tight">
              {language === 'en' ? 'Venues' : 'Clubs'}
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'The clubs, warehouses, and spaces where techno lives.' 
                : 'Los clubs, almacenes y espacios donde vive el techno.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {venues.map((venue) => (
              <Link
                key={venue.id}
                to={`/venues/${venue.id}`}
                className="group block border border-border p-6 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground border border-border px-2 py-1">
                    {venue.type}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {venue.active}
                  </span>
                </div>
                <h2 className="font-mono text-2xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                  {venue.name}
                </h2>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span className="font-mono text-sm">{venue.city}, {venue.country}</span>
                </div>
                {venue.atmosphere && (
                  <p className="font-mono text-xs text-muted-foreground line-clamp-2 mb-4">
                    {venue.atmosphere}
                  </p>
                )}
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground group-hover:text-foreground">
                  <span>{language === 'en' ? 'View details' : 'Ver detalles'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VenuesPage;
