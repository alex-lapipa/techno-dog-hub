import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 font-mono text-xs tracking-widest">
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 transition-colors ${
          language === 'en'
            ? 'text-foreground bg-foreground/10'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        EN
      </button>
      <span className="text-muted-foreground">/</span>
      <button
        onClick={() => setLanguage('es')}
        className={`px-2 py-1 transition-colors ${
          language === 'es'
            ? 'text-foreground bg-foreground/10'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        ES
      </button>
    </div>
  );
};

export default LanguageToggle;
