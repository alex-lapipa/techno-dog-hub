import { useLanguage } from '@/contexts/LanguageContext';
import { useAnalytics } from '@/hooks/useAnalytics';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();
  const { trackClick } = useAnalytics();

  const handleLanguageChange = (newLang: 'en' | 'es') => {
    if (newLang !== language) {
      trackClick(`language_switch_${newLang}`);
      setLanguage(newLang);
    }
  };

  return (
    <div className="flex items-center gap-1 font-mono text-xs tracking-widest">
      <button
        onClick={() => handleLanguageChange('en')}
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
        onClick={() => handleLanguageChange('es')}
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
