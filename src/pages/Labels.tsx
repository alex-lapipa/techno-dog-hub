import { Link } from "react-router-dom";
import { ArrowRight, Disc } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { labels } from "@/data/labels";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LabelsPage = () => {
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
              {language === 'en' ? 'Labels' : 'Sellos'}
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-2xl">
              {language === 'en' 
                ? 'The imprints that define the underground. Quality over quantity.' 
                : 'Los sellos que definen el underground. Calidad sobre cantidad.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labels.map((label) => (
              <Link
                key={label.id}
                to={`/labels/${label.id}`}
                className="group block border border-border p-6 hover:bg-card transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <Disc className="w-6 h-6 text-muted-foreground" />
                  <span className="font-mono text-xs text-muted-foreground">
                    {label.founded}
                  </span>
                </div>
                
                <h2 className="font-mono text-xl uppercase tracking-tight mb-2 group-hover:animate-glitch">
                  {label.name}
                </h2>
                
                <div className="font-mono text-xs text-muted-foreground mb-4">
                  {label.city}, {label.country}
                </div>
                
                {label.description && (
                  <p className="font-mono text-xs text-muted-foreground line-clamp-2 mb-4">
                    {label.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {label.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="font-mono text-xs text-muted-foreground border border-border px-2 py-0.5">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground group-hover:text-foreground">
                  <span>{language === 'en' ? 'View catalog' : 'Ver catálogo'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 font-mono text-xs text-muted-foreground">
            {labels.length} {language === 'en' ? 'labels in archive' : 'sellos en archivo'}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LabelsPage;
