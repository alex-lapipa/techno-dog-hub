import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { artists } from "@/data/artists";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ArtistsPage = () => {
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
              {language === 'en' ? 'Artists' : 'Artistas'}
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'The producers, DJs, and live performers shaping techno culture.' 
                : 'Los productores, DJs e intérpretes que dan forma a la cultura techno.'}
            </p>
          </div>

          <div className="border-t border-border">
            {artists.map((artist, index) => (
              <Link
                key={artist.id}
                to={`/artists/${artist.id}`}
                className="group block border-b border-border py-6 hover:bg-card transition-colors px-4 -mx-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-4 mb-2">
                      <span className="font-mono text-xs text-muted-foreground w-8">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 className="font-mono text-xl md:text-2xl uppercase tracking-wide group-hover:animate-glitch">
                        {artist.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-4 pl-12">
                      <span className="font-mono text-xs text-muted-foreground">
                        {artist.city}, {artist.country}
                      </span>
                      <div className="flex gap-2">
                        {artist.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all mt-2" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 font-mono text-xs text-muted-foreground">
            {artists.length} {language === 'en' ? 'artists in archive' : 'artistas en archivo'}
          </div>

          {/* Image Disclaimer */}
          <div className="mt-12 pt-6 border-t border-border/50">
            <p className="font-mono text-[10px] text-muted-foreground/70 leading-relaxed max-w-2xl">
              {language === 'en' 
                ? '* Artist page images are artistic representations generated for editorial purposes, not photographs of the actual artists.'
                : '* Las imágenes en las páginas de artistas son representaciones artísticas generadas con fines editoriales, no fotografías de los artistas reales.'}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArtistsPage;
