import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeaturedArticleProps {
  category: {
    en: string;
    es: string;
  };
  title: {
    en: string;
    es: string;
  };
  excerpt: {
    en: string;
    es: string;
  };
  readTime: string;
  issue: string;
  featured?: boolean;
}

const FeaturedArticle = ({ 
  category, 
  title, 
  excerpt, 
  readTime, 
  issue,
  featured = false 
}: FeaturedArticleProps) => {
  const { language } = useLanguage();
  
  return (
    <article className={`group border border-border p-6 md:p-8 hover:bg-card transition-colors cursor-pointer ${featured ? 'col-span-full lg:col-span-2' : ''}`}>
      {/* Meta */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-foreground border border-foreground px-2 py-1">
            {category[language]}
          </span>
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
            {readTime}
          </span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          #{issue}
        </span>
      </div>
      
      {/* Title */}
      <h3 className={`font-mono uppercase tracking-tight text-foreground mb-4 group-hover:animate-glitch ${featured ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-xl md:text-2xl'}`}>
        {title[language]}
      </h3>
      
      {/* Excerpt */}
      <p className="font-mono text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-3">
        {excerpt[language]}
      </p>
      
      {/* Read more */}
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
        <span>{language === 'en' ? 'Read article' : 'Leer artículo'}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </article>
  );
};

export default FeaturedArticle;
