import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
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
    'hero.description': 'The collaborative digital magazine and database for the global techno community.',
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
    'footer.description': 'Community led open platform and database dedicated to underground techno culture — artists, clubs, festivals, machines and ideas. Strictly non-mainstream. Curated by Alex Lawton, Paloma Rocha and Antaine Reilly.',
    'footer.explore': '// Explore',
    'footer.social': '// Social',
    'footer.artists': 'Artists',
    'footer.calendar': 'Calendar',
    'footer.news': 'News',
    'footer.archive': 'Archive',
  },
  es: {
    // Header
    'nav.festivals': 'Festivales',
    'nav.aquasella': 'Aquasella',
    'nav.lev': 'L.E.V.',
    'nav.chat': 'Chat IA',
    'nav.login': 'Entrar',
    'nav.logout': 'Salir',
    
    // Hero
    'hero.terminal': 'cat /festivales/europa/2025',
    'hero.title': 'techno.dog',
    'hero.subtitle': 'Centro Global de Conocimiento Techno',
    'hero.tagline': 'Una plataforma abierta y diaria dedicada a la cultura techno underground — artistas, clubs, festivales, máquinas e ideas. Estrictamente no mainstream.',
    'hero.description': 'La revista digital colaborativa y base de datos para la comunidad techno global.',
    'hero.explore': 'Explorar festivales',
    'hero.festivals': 'Festivales',
    'hero.countries': 'Países',
    'hero.attendees': 'Asistentes',
    'hero.scroll': '[ scroll ]',
    
    // Festivals Section
    'festivals.title': 'Guía de Festivales',
    'festivals.subtitle': 'Eventos Esenciales de Europa',
    
    // Aquasella
    'aquasella.title': 'Aquasella',
    'aquasella.subtitle': 'Asturias, España',
    
    // LEV
    'lev.title': 'L.E.V. Festival',
    'lev.subtitle': 'Arte Audiovisual',
    
    // Chat
    'chat.title': 'Asistente IA',
    'chat.subtitle': 'Pregunta sobre festivales',
    
    // Footer
    'footer.description': 'Plataforma abierta y base de datos liderada por la comunidad, dedicada a la cultura techno underground — artistas, clubs, festivales, máquinas e ideas. Estrictamente no mainstream. Curado por Alex Lawton, Paloma Rocha y Antaine Reilly.',
    'footer.explore': '// Explorar',
    'footer.social': '// Redes',
    'footer.artists': 'Artistas',
    'footer.calendar': 'Calendario',
    'footer.news': 'Noticias',
    'footer.archive': 'Archivo',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
