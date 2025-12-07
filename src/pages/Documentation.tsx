import { Link } from "react-router-dom";
import { ChevronLeft, FileText, Code, Database, Layers, Palette, Globe, Shield, Bot, Rocket } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ContentSyncPanel } from "@/components/ContentSyncPanel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="container mx-auto px-4 md:px-8 py-12">
        {/* Breadcrumb */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-mono text-sm mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="font-mono text-3xl md:text-4xl font-bold tracking-tight">
              Project Documentation
            </h1>
          </div>
          <p className="font-mono text-muted-foreground max-w-2xl">
            Comprehensive technical overview of the Global Techno Encyclopedia. 
            Understanding the architecture, data models, and features that power this platform.
          </p>
        </div>

        {/* Download link */}
        <div className="mb-8 p-4 border border-border bg-card rounded-lg">
          <a 
            href="/project-documentation.txt" 
            download 
            className="inline-flex items-center gap-2 font-mono text-sm text-primary hover:underline"
          >
            <FileText className="w-4 h-4" />
            Download full documentation as TXT file
          </a>
        </div>

        {/* Content Sync Panel - Admin only */}
        <div className="mb-8">
          <ContentSyncPanel />
        </div>

        {/* Accordion sections */}
        <Accordion type="multiple" className="space-y-4">
          
          {/* Project Overview */}
          <AccordionItem value="overview" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg">Project Overview</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
              <p>
                The <strong className="text-foreground">Global Techno Encyclopedia</strong> is a comprehensive digital archive 
                dedicated to underground techno culture worldwide. It serves as an authoritative resource covering artists, 
                labels, venues, festivals, gear, crews, and the historical timeline of techno evolution.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Target Audience</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Techno enthusiasts and collectors</li>
                    <li>DJs and producers</li>
                    <li>Music journalists and researchers</li>
                    <li>Club culture historians</li>
                    <li>Festival-goers and event organizers</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Core Philosophy</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Accept only real techno: driving, hypnotic, raw</li>
                    <li>No EDM, hardstyle, or commercial schlag</li>
                    <li>From Detroit to Tbilisi, Tokyo to Bogotá</li>
                    <li>Warehouse truth, zero fluff</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Technology Stack */}
          <AccordionItem value="tech-stack" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg">Technology Stack</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Frontend</h4>
                  <ul className="space-y-1">
                    <li>• React 18.3.1 + TypeScript</li>
                    <li>• Vite (build tool)</li>
                    <li>• React Router DOM v6</li>
                    <li>• TanStack React Query</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Styling</h4>
                  <ul className="space-y-1">
                    <li>• Tailwind CSS</li>
                    <li>• shadcn/ui components</li>
                    <li>• Lucide React icons</li>
                    <li>• tailwindcss-animate</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Backend</h4>
                  <ul className="space-y-1">
                    <li>• Supabase (Lovable Cloud)</li>
                    <li>• PostgreSQL + pgvector</li>
                    <li>• Edge Functions (Deno)</li>
                    <li>• Row Level Security</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">AI Integration</h4>
                  <ul className="space-y-1">
                    <li>• Lovable AI API</li>
                    <li>• RAG chat functionality</li>
                    <li>• Vector embeddings</li>
                    <li>• Semantic search</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Forms</h4>
                  <ul className="space-y-1">
                    <li>• React Hook Form</li>
                    <li>• Zod validation</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">State</h4>
                  <ul className="space-y-1">
                    <li>• React Context (i18n, auth)</li>
                    <li>• TanStack Query (server)</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Data Architecture */}
          <AccordionItem value="data" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg">Data Architecture</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
              <p>
                All content data is stored as TypeScript modules in <code className="text-foreground bg-muted px-1 rounded">/src/data/</code>. 
                Each module exports interfaces, data arrays, and utility functions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">artists.ts</h4>
                  <p className="text-xs mb-2">Artist profiles with origin, genres, labels, bio, releases</p>
                  <code className="text-xs text-muted-foreground">getArtistById(), getArtistsByGenre(), getArtistsByLabel()</code>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">labels.ts</h4>
                  <p className="text-xs mb-2">Record labels with founding year, city, genres, roster</p>
                  <code className="text-xs text-muted-foreground">getLabelById(), getLabelsByCountry(), getActiveLabels()</code>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">venues.ts</h4>
                  <p className="text-xs mb-2">Clubs and spaces with capacity, type, residents</p>
                  <code className="text-xs text-muted-foreground">getVenueById(), getVenuesByCity(), getActiveVenues()</code>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">festivals.ts</h4>
                  <p className="text-xs mb-2">Festivals with stages, capacity, historic lineups</p>
                  <code className="text-xs text-muted-foreground">getFestivalById(), getFestivalsByMonth(), getActiveFestivals()</code>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">gear.ts</h4>
                  <p className="text-xs mb-2">Synthesizers, drum machines, effects, mixers</p>
                  <code className="text-xs text-muted-foreground">getGearById(), getGearByType(), getGearByManufacturer()</code>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">crews.ts</h4>
                  <p className="text-xs mb-2">Collectives, sound systems, party series</p>
                  <code className="text-xs text-muted-foreground">getCrewById(), getCrewsByType(), getActiveCrews()</code>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">events.ts</h4>
                  <p className="text-xs mb-2">Calendar events with venue, date, lineup</p>
                  <code className="text-xs text-muted-foreground">getEventById(), getEventsByMonth(), getUpcomingEvents()</code>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">releases.ts</h4>
                  <p className="text-xs mb-2">Music releases with artist, label, format</p>
                  <code className="text-xs text-muted-foreground">getReleaseById(), getReleasesByYear(), getReleasesByTag()</code>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Component Architecture */}
          <AccordionItem value="components" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg">Component Architecture</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
              <div className="space-y-4">
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Layout Components</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    <li>• Header - Main navigation, logo, auth</li>
                    <li>• Footer - Links, copyright, terminal</li>
                    <li>• ScrollToTop - Auto scroll on route</li>
                    <li>• ScrollToTopButton - Manual scroll</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Page Components</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    <li>• Index.tsx - Homepage</li>
                    <li>• [Entity].tsx - Directory listings</li>
                    <li>• [Entity]Detail.tsx - Detail pages</li>
                    <li>• Auth.tsx - Login/Signup</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Shared Components</h4>
                  <ul className="grid grid-cols-2 gap-2">
                    <li>• TechnoChat - AI chat interface</li>
                    <li>• MagazineGrid - Editorial layout</li>
                    <li>• FeaturedArticle - Article cards</li>
                    <li>• HorizontalNav - Mobile navigation</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">UI Primitives (shadcn/ui)</h4>
                  <p className="text-xs">
                    Button, Card, Dialog, Sheet, Tabs, Badge, Skeleton, Toast, Accordion, 
                    Popover, Dropdown, and 30+ more Radix-based components
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Design System */}
          <AccordionItem value="design" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg">Design System</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
              <p>
                <strong className="text-foreground">Brutalist/Terminal aesthetic</strong> with high contrast, 
                monospace typography accents, and raw industrial feel.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Color Tokens (HSL)</h4>
                  <ul className="space-y-1 text-xs">
                    <li><span className="text-foreground">--background:</span> Dark base</li>
                    <li><span className="text-foreground">--foreground:</span> Light text</li>
                    <li><span className="text-foreground">--primary:</span> Accent color</li>
                    <li><span className="text-foreground">--muted:</span> Subdued elements</li>
                    <li><span className="text-foreground">--border:</span> Border color</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Typography</h4>
                  <ul className="space-y-1 text-xs">
                    <li><span className="text-foreground">Display:</span> DM Serif Display</li>
                    <li><span className="text-foreground">Body:</span> System fonts, Inter</li>
                    <li><span className="text-foreground">Mono:</span> JetBrains Mono</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Button Variants</h4>
                  <ul className="space-y-1 text-xs">
                    <li>default, destructive, outline, ghost, link</li>
                    <li><span className="text-foreground">brutalist:</span> Bold, industrial</li>
                    <li><span className="text-foreground">terminal:</span> Monospace, green text</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Animations</h4>
                  <ul className="space-y-1 text-xs">
                    <li>accordion-down/up, fade-in/out</li>
                    <li>scale animations, hover transitions</li>
                    <li>smooth scroll behavior</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Backend & Database */}
          <AccordionItem value="backend" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg">Backend & Database</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
              <p>
                Powered by <strong className="text-foreground">Lovable Cloud</strong> (Supabase) 
                with PostgreSQL, vector embeddings, and Edge Functions.
              </p>
              <div className="space-y-4">
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Database Tables</h4>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <strong>documents</strong> - RAG knowledge base with vector embeddings (1536 dim)
                    </li>
                    <li>
                      <strong>profiles</strong> - User profile information linked to auth
                    </li>
                    <li>
                      <strong>user_roles</strong> - Role-based access control (admin/user)
                    </li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Edge Functions</h4>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <strong>rag-chat</strong> - AI chat with document retrieval and streaming
                    </li>
                    <li>
                      <strong>generate-embedding</strong> - Vector embeddings via Lovable AI
                    </li>
                    <li>
                      <strong>ingest-documents</strong> - Admin document ingestion with chunking
                    </li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Database Functions</h4>
                  <ul className="space-y-1 text-xs">
                    <li><code>match_documents()</code> - Vector similarity search</li>
                    <li><code>has_role()</code> - Check user roles</li>
                    <li><code>handle_new_user()</code> - Create profile on signup</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* AI Chat Integration */}
          <AccordionItem value="ai" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg">AI Chat Integration</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
              <p>
                The <strong className="text-foreground">TechnoChat</strong> component provides AI-powered 
                responses using Retrieval-Augmented Generation (RAG).
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Features</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Floating chat button (bottom-right)</li>
                    <li>Expandable chat interface</li>
                    <li>Message history</li>
                    <li>Streaming responses</li>
                    <li>Loading states</li>
                  </ul>
                </div>
                <div className="p-4 border border-border rounded bg-background">
                  <h4 className="text-foreground font-bold mb-2">Knowledge Base</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Festival information</li>
                    <li>Artist bios</li>
                    <li>Venue histories</li>
                    <li>Equipment guides</li>
                    <li>Techno culture context</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Routing */}
          <AccordionItem value="routing" className="border border-border rounded-lg px-6 bg-card">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Rocket className="w-5 h-5 text-primary" />
                <span className="font-mono text-lg">Routing & Navigation</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="font-mono text-sm text-muted-foreground space-y-4 pb-6">
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-3">Application Routes</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <code>/</code>
                  <code>/auth</code>
                  <code>/news</code>
                  <code>/artists</code>
                  <code>/artists/:id</code>
                  <code>/labels</code>
                  <code>/venues</code>
                  <code>/venues/:id</code>
                  <code>/festivals</code>
                  <code>/festivals/:id</code>
                  <code>/gear</code>
                  <code>/gear/:id</code>
                  <code>/crews</code>
                  <code>/crews/:id</code>
                  <code>/releases</code>
                  <code>/mad/calendar</code>
                  <code>/mad/timeline</code>
                  <code>/docs</code>
                </div>
              </div>
              <div className="p-4 border border-border rounded bg-background">
                <h4 className="text-foreground font-bold mb-2">Navigation Features</h4>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Horizontal desktop nav with dropdown submenus</li>
                  <li>Mobile hamburger menu</li>
                  <li>Breadcrumb navigation on detail pages</li>
                  <li>Prev/Next horizontal navigation on detail pages</li>
                  <li>Language toggle (EN/ES)</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        {/* Footer note */}
        <div className="mt-12 p-6 border border-border rounded-lg bg-card">
          <div className="font-mono text-sm text-muted-foreground">
            <span className="text-foreground">guest@techno.dog</span>
            <span>:</span>
            <span className="text-foreground">~/docs</span>
            <span>$ </span>
            <span>cat README.md</span>
            <span className="animate-pulse ml-1">_</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground mt-4">
            This documentation is auto-generated from codebase analysis. 
            For the complete text version, download the TXT file above.
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-2">
            #Techno #GlobalTechno #LovableKnowledge 🖤
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Documentation;
