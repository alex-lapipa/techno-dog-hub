import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FestivalsSection from "@/components/FestivalsSection";
import AquasellaSection from "@/components/AquasellaSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <FestivalsSection />
        <AquasellaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
