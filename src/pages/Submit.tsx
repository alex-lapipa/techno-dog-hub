import { useLanguage } from "@/contexts/LanguageContext";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import CommunitySubmissionForm from "@/components/CommunitySubmissionForm";

const Submit = () => {
  const { language } = useLanguage();
  useScrollDepth({ pageName: "submit" });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title={language === "en" ? "Submit to the Archive" : "Enviar al Archivo"}
        description={
          language === "en"
            ? "Suggest artists, venues, festivals, and labels to add to the techno.dog knowledge base. Help build the underground techno archive."
            : "Sugiere artistas, clubs, festivales y sellos para añadir a la base de conocimiento de techno.dog. Ayuda a construir el archivo del techno underground."
        }
        path="/submit"
        locale={language}
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        {/* Header */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="max-w-2xl">
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-4">
                // {language === "en" ? "Contribute" : "Contribuir"}
              </div>
              <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight mb-6">
                {language === "en" ? "Submit to the Archive" : "Enviar al Archivo"}
              </h1>
              <p className="font-mono text-base md:text-lg text-muted-foreground leading-relaxed">
                {language === "en"
                  ? "Know an artist, venue, festival, or label that belongs in the techno.dog archive? Submit your suggestion below. We're building this knowledge base together."
                  : "¿Conoces un artista, club, festival o sello que pertenezca al archivo de techno.dog? Envía tu sugerencia abajo. Estamos construyendo esta base de conocimiento juntos."}
              </p>
            </div>
          </div>
        </section>

        {/* Guidelines */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-border p-6">
                <h3 className="font-mono text-sm uppercase tracking-wider mb-3">
                  {language === "en" ? "Underground Only" : "Solo Underground"}
                </h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  {language === "en"
                    ? "We focus on underground techno culture. No mainstream EDM, festival headliners, or commercial acts."
                    : "Nos enfocamos en la cultura techno underground. Sin EDM mainstream, headliners de festivales o actos comerciales."}
                </p>
              </div>
              <div className="border border-border p-6">
                <h3 className="font-mono text-sm uppercase tracking-wider mb-3">
                  {language === "en" ? "Quality Over Quantity" : "Calidad sobre Cantidad"}
                </h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  {language === "en"
                    ? "Provide as much detail as possible. Why is this significant? What's the connection to the scene?"
                    : "Proporciona todos los detalles posibles. ¿Por qué es significativo? ¿Cuál es la conexión con la escena?"}
                </p>
              </div>
              <div className="border border-border p-6">
                <h3 className="font-mono text-sm uppercase tracking-wider mb-3">
                  {language === "en" ? "Global Perspective" : "Perspectiva Global"}
                </h3>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  {language === "en"
                    ? "From Detroit to Tbilisi, Tokyo to Bogotá. We document techno culture worldwide."
                    : "De Detroit a Tbilisi, de Tokio a Bogotá. Documentamos la cultura techno a nivel mundial."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="max-w-2xl mx-auto">
              <CommunitySubmissionForm />
            </div>
          </div>
        </section>

        {/* ASCII decoration */}
        <section className="border-b border-border overflow-hidden">
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="font-mono text-xs text-muted-foreground/30 text-center">
              {language === "en"
                ? "// Building the archive together. Strictly non-mainstream."
                : "// Construyendo el archivo juntos. Estrictamente no mainstream."}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Submit;
