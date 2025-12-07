import { useLanguage } from "@/contexts/LanguageContext";

interface EditorialBlockProps {
  issue?: string;
  pullQuote: {
    en: string;
    es: string;
  };
  author?: string;
}

const EditorialBlock = ({ issue = "001", pullQuote, author }: EditorialBlockProps) => {
  const { language } = useLanguage();
  
  return (
    <div className="border-l-4 border-foreground pl-6 py-4 my-12">
      <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
        Issue #{issue}
      </div>
      <blockquote className="font-mono text-2xl md:text-3xl lg:text-4xl uppercase leading-tight tracking-tight text-foreground">
        "{pullQuote[language]}"
      </blockquote>
      {author && (
        <cite className="block mt-4 font-mono text-sm text-muted-foreground not-italic uppercase tracking-wider">
          — {author}
        </cite>
      )}
    </div>
  );
};

export default EditorialBlock;
