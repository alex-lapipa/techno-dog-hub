import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { 
  Mail, 
  Upload, 
  Key, 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  Users,
  Camera,
  FileText,
  Code,
  Zap,
  Lock
} from "lucide-react";

const CommunityDocs = () => {
  const { language } = useLanguage();

  const content = {
    en: {
      title: "Community System",
      subtitle: "How contributions, verification, and API access work together",
      overview: {
        title: "Overview",
        description: "The techno.dog community system enables verified members to contribute photos, corrections, and access our API. Here's how all the pieces connect."
      },
      flows: [
        {
          id: "signup",
          icon: Mail,
          title: "1. Email Verification",
          description: "Join the community with passwordless magic link authentication",
          steps: [
            "Enter your email on any community widget or the /community page",
            "Receive a magic link email (check spam folder)",
            "Click the link to verify and create your account",
            "Your community profile is now active with 'verified' status"
          ],
          endpoint: "/community"
        },
        {
          id: "upload",
          icon: Camera,
          title: "2. Photo Contributions",
          description: "Upload photos of artists, venues, and events",
          steps: [
            "Navigate to any artist or venue detail page",
            "Find the 'Contribute Photos' section",
            "Drag & drop or select images (max 5MB, JPEG/PNG/WebP/GIF)",
            "Add caption, credit, and confirm you have rights to share",
            "Submit for moderation review"
          ],
          requirements: ["Verified email", "Consent confirmation", "Valid image format"]
        },
        {
          id: "corrections",
          icon: FileText,
          title: "3. Fact Corrections",
          description: "Help improve accuracy of artist bios, venue info, and more",
          steps: [
            "Find incorrect information on any detail page",
            "Click the correction widget",
            "Describe what's wrong and provide the correct information",
            "Include sources if available",
            "Submit for review by our team"
          ],
          requirements: ["Verified email", "Clear description", "Source links (optional)"]
        },
        {
          id: "api",
          icon: Key,
          title: "4. Developer API Access",
          description: "Generate API keys to access techno.dog data programmatically",
          steps: [
            "Verify your email through the community system",
            "Navigate to /developer",
            "Create a new API key with desired scopes",
            "Copy your key immediately (shown only once)",
            "Use the key in your applications"
          ],
          scopes: [
            { name: "read:public", desc: "Read public data (artists, venues, labels)" },
            { name: "read:search", desc: "Use semantic search endpoints" },
            { name: "write:submissions", desc: "Submit content programmatically" }
          ]
        }
      ],
      moderation: {
        title: "Moderation Queue",
        description: "All community submissions go through our moderation process:",
        states: [
          { status: "pending", color: "text-yellow-500", desc: "Awaiting review" },
          { status: "approved", color: "text-green-500", desc: "Published to the site" },
          { status: "rejected", color: "text-red-500", desc: "Not accepted (with reason)" }
        ],
        note: "You'll receive an email notification when your submission is reviewed."
      },
      security: {
        title: "Security & Trust",
        points: [
          "All uploads are scanned for valid MIME types",
          "File size limits prevent abuse (5MB max)",
          "Rate limiting protects API endpoints",
          "RLS policies ensure data isolation",
          "Trust scores track contribution quality"
        ]
      },
      cta: {
        title: "Ready to contribute?",
        buttons: [
          { label: "Join Community", href: "/community", primary: true },
          { label: "Developer Portal", href: "/developer", primary: false }
        ]
      }
    },
    es: {
      title: "Sistema Comunitario",
      subtitle: "Cómo funcionan las contribuciones, verificación y acceso API",
      overview: {
        title: "Resumen",
        description: "El sistema comunitario de techno.dog permite a los miembros verificados contribuir fotos, correcciones y acceder a nuestra API. Así es como se conectan todas las piezas."
      },
      flows: [
        {
          id: "signup",
          icon: Mail,
          title: "1. Verificación de Email",
          description: "Únete a la comunidad con autenticación sin contraseña",
          steps: [
            "Ingresa tu email en cualquier widget o en la página /community",
            "Recibe un enlace mágico por email (revisa spam)",
            "Haz clic en el enlace para verificar y crear tu cuenta",
            "Tu perfil comunitario ahora está activo con estado 'verificado'"
          ],
          endpoint: "/community"
        },
        {
          id: "upload",
          icon: Camera,
          title: "2. Contribución de Fotos",
          description: "Sube fotos de artistas, venues y eventos",
          steps: [
            "Navega a cualquier página de detalle de artista o venue",
            "Encuentra la sección 'Contribuir Fotos'",
            "Arrastra o selecciona imágenes (máx 5MB, JPEG/PNG/WebP/GIF)",
            "Añade pie de foto, crédito y confirma que tienes derechos",
            "Envía para revisión de moderación"
          ],
          requirements: ["Email verificado", "Confirmación de consentimiento", "Formato de imagen válido"]
        },
        {
          id: "corrections",
          icon: FileText,
          title: "3. Correcciones de Datos",
          description: "Ayuda a mejorar la precisión de biografías, info de venues y más",
          steps: [
            "Encuentra información incorrecta en cualquier página",
            "Haz clic en el widget de corrección",
            "Describe qué está mal y proporciona la información correcta",
            "Incluye fuentes si están disponibles",
            "Envía para revisión por nuestro equipo"
          ],
          requirements: ["Email verificado", "Descripción clara", "Enlaces de fuentes (opcional)"]
        },
        {
          id: "api",
          icon: Key,
          title: "4. Acceso API para Desarrolladores",
          description: "Genera claves API para acceder a datos de techno.dog programáticamente",
          steps: [
            "Verifica tu email a través del sistema comunitario",
            "Navega a /developer",
            "Crea una nueva clave API con los alcances deseados",
            "Copia tu clave inmediatamente (se muestra solo una vez)",
            "Usa la clave en tus aplicaciones"
          ],
          scopes: [
            { name: "read:public", desc: "Leer datos públicos (artistas, venues, sellos)" },
            { name: "read:search", desc: "Usar endpoints de búsqueda semántica" },
            { name: "write:submissions", desc: "Enviar contenido programáticamente" }
          ]
        }
      ],
      moderation: {
        title: "Cola de Moderación",
        description: "Todas las contribuciones pasan por nuestro proceso de moderación:",
        states: [
          { status: "pendiente", color: "text-yellow-500", desc: "Esperando revisión" },
          { status: "aprobado", color: "text-green-500", desc: "Publicado en el sitio" },
          { status: "rechazado", color: "text-red-500", desc: "No aceptado (con razón)" }
        ],
        note: "Recibirás una notificación por email cuando se revise tu contribución."
      },
      security: {
        title: "Seguridad y Confianza",
        points: [
          "Todas las subidas se escanean para tipos MIME válidos",
          "Límites de tamaño previenen abuso (máx 5MB)",
          "Limitación de velocidad protege endpoints API",
          "Políticas RLS aseguran aislamiento de datos",
          "Puntuaciones de confianza rastrean calidad de contribuciones"
        ]
      },
      cta: {
        title: "¿Listo para contribuir?",
        buttons: [
          { label: "Unirse a la Comunidad", href: "/community", primary: true },
          { label: "Portal de Desarrolladores", href: "/developer", primary: false }
        ]
      }
    }
  };

  const t = content[language];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title={`${t.title} - Documentation`}
        description={t.subtitle}
        path="/community/docs"
        locale={language}
      />
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          
          {/* Hero */}
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-primary/30 bg-primary/10 mb-6">
              <Users className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs uppercase tracking-wider text-primary">Documentation</span>
            </div>
            <h1 className="font-mono text-4xl md:text-5xl uppercase tracking-tight mb-4">
              {t.title}
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Overview */}
          <section className="mb-16 p-6 border border-border bg-card/50">
            <h2 className="font-mono text-lg uppercase tracking-wide mb-4 flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              {t.overview.title}
            </h2>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed">
              {t.overview.description}
            </p>
          </section>

          {/* Flow Diagram */}
          <section className="mb-16">
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              {t.flows.map((flow, i) => (
                <div key={flow.id} className="relative">
                  <div className="p-4 border border-border bg-card/30 h-full">
                    <flow.icon className="w-6 h-6 text-primary mb-3" />
                    <h3 className="font-mono text-xs uppercase tracking-wider mb-1">{flow.title.split('. ')[1]}</h3>
                  </div>
                  {i < t.flows.length - 1 && (
                    <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Detailed Flows */}
          <section className="space-y-12 mb-16">
            {t.flows.map((flow) => (
              <div key={flow.id} className="border border-border">
                <div className="p-6 border-b border-border bg-card/50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 border border-primary/30 bg-primary/10">
                      <flow.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-mono text-xl uppercase tracking-wide mb-2">{flow.title}</h3>
                      <p className="font-mono text-sm text-muted-foreground">{flow.description}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
                    Steps
                  </h4>
                  <ol className="space-y-3">
                    {flow.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 min-w-[28px] text-center">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-mono text-sm text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ol>

                  {flow.requirements && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
                        Requirements
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {flow.requirements.map((req) => (
                          <span key={req} className="font-mono text-xs px-3 py-1.5 border border-border bg-background">
                            <CheckCircle2 className="w-3 h-3 inline mr-1.5 text-green-500" />
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {flow.scopes && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
                        Available Scopes
                      </h4>
                      <div className="space-y-2">
                        {flow.scopes.map((scope) => (
                          <div key={scope.name} className="flex items-start gap-3 p-3 bg-background border border-border">
                            <code className="font-mono text-xs text-primary bg-primary/10 px-2 py-1">
                              {scope.name}
                            </code>
                            <span className="font-mono text-xs text-muted-foreground">{scope.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {flow.endpoint && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <Link 
                        to={flow.endpoint}
                        className="inline-flex items-center gap-2 font-mono text-xs text-primary hover:underline"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Go to {flow.endpoint}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Moderation */}
          <section className="mb-16 border border-border">
            <div className="p-6 border-b border-border bg-card/50">
              <h2 className="font-mono text-xl uppercase tracking-wide flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                {t.moderation.title}
              </h2>
            </div>
            <div className="p-6">
              <p className="font-mono text-sm text-muted-foreground mb-6">{t.moderation.description}</p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {t.moderation.states.map((state) => (
                  <div key={state.status} className="p-4 border border-border bg-background">
                    <div className={`font-mono text-sm uppercase tracking-wider mb-1 ${state.color}`}>
                      {state.status}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground">{state.desc}</p>
                  </div>
                ))}
              </div>
              <p className="font-mono text-xs text-muted-foreground bg-primary/5 border border-primary/20 p-3">
                <Mail className="w-4 h-4 inline mr-2 text-primary" />
                {t.moderation.note}
              </p>
            </div>
          </section>

          {/* Security */}
          <section className="mb-16 border border-border">
            <div className="p-6 border-b border-border bg-card/50">
              <h2 className="font-mono text-xl uppercase tracking-wide flex items-center gap-3">
                <Lock className="w-5 h-5 text-primary" />
                {t.security.title}
              </h2>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {t.security.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="font-mono text-sm text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center p-8 border border-primary/30 bg-primary/5">
            <h2 className="font-mono text-2xl uppercase tracking-wide mb-6">{t.cta.title}</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {t.cta.buttons.map((btn) => (
                <Link
                  key={btn.href}
                  to={btn.href}
                  className={`font-mono text-sm uppercase tracking-wider px-6 py-3 transition-colors ${
                    btn.primary
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border hover:bg-card"
                  }`}
                >
                  {btn.label}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CommunityDocs;
