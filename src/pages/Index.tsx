import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MagazineGrid from "@/components/MagazineGrid";
import FestivalsSection from "@/components/FestivalsSection";
import AquasellaSection from "@/components/AquasellaSection";
import LEVSection from "@/components/LEVSection";
import TechnoChat from "@/components/TechnoChat";
import Footer from "@/components/Footer";
import HorizontalNav from "@/components/HorizontalNav";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { language, t } = useLanguage();
  const [activeSection, setActiveSection] = useState(0);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  
  const sectionNames = [
    t('hero.title'),
    language === 'en' ? 'Editorial' : 'Editorial',
    t('nav.festivals'),
    t('nav.aquasella'),
    t('nav.lev'),
    t('nav.chat')
  ];

  const handleSectionChange = (index: number) => {
    setActiveSection(index);
    sectionsRef.current[index]?.scrollIntoView({ behavior: 'smooth' });
  };

  // Track scroll position to update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      sectionsRef.current.forEach((section, index) => {
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <div ref={el => sectionsRef.current[0] = el}>
          <HeroSection />
        </div>
        <div ref={el => sectionsRef.current[1] = el}>
          <MagazineGrid />
        </div>
        <div ref={el => sectionsRef.current[2] = el}>
          <FestivalsSection />
        </div>
        <div ref={el => sectionsRef.current[3] = el}>
          <AquasellaSection />
        </div>
        <div ref={el => sectionsRef.current[4] = el}>
          <LEVSection />
        </div>
        <div ref={el => sectionsRef.current[5] = el}>
          <TechnoChat />
        </div>
      </main>
      <Footer />
      <HorizontalNav 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        sections={sectionNames}
      />
    </div>
  );
};

export default Index;
