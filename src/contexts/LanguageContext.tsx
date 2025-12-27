import React, { createContext, useContext, ReactNode } from 'react';

// Simplified English-only translations
const translations: Record<string, string> = {
  // Header
  'nav.festivals': 'Festivals',
  'nav.aquasella': 'Aquasella',
  'nav.lev': 'L.E.V.',
  'nav.chat': 'AI Chat',
  'nav.login': 'Login',
  'nav.logout': 'Logout',
  
  // Hero
  'hero.terminal': 'cat /festivals/europe/2025',
  'hero.title': 'techno.dog',
  'hero.subtitle': 'Global Techno Knowledge Hub',
  'hero.tagline': 'A daily, open platform dedicated to underground techno culture — artists, clubs, festivals, machines and ideas. Strictly non-mainstream.',
  'hero.description': 'The collaborative digital magazine and Technopedia. From Detroit to Tbilisi, Tokyo to Madrid, London to Berlin.',
  'hero.explore': 'Explore festivals',
  'hero.festivals': 'Festivals',
  'hero.countries': 'Countries',
  'hero.attendees': 'Attendees',
  'hero.scroll': '[ scroll ]',
  
  // Festivals Section
  'festivals.title': 'Festival Guide',
  'festivals.subtitle': 'Essential European Events',
  
  // Aquasella
  'aquasella.title': 'Aquasella',
  'aquasella.subtitle': 'Asturias, Spain',
  
  // LEV
  'lev.title': 'L.E.V. Festival',
  'lev.subtitle': 'Audio Visual Art',
  
  // Chat
  'chat.title': 'AI Assistant',
  'chat.subtitle': 'Ask about festivals',
  
  // Footer
  'footer.description': 'Community led open platform and database dedicated to underground techno culture — artists, clubs, festivals, machines and ideas. Strictly non-mainstream. Curated by Alex Lawton, Paloma Rocha, Antaine Reilly and Carlos González.',
  'footer.explore': '// Explore',
  'footer.social': '// Social',
  'footer.artists': 'Artists',
  'footer.calendar': 'Calendar',
  'footer.news': 'News',
  'footer.archive': 'Archive',
};

interface LanguageContextType {
  language: 'en';
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const t = (key: string): string => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: 'en', t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
