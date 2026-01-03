import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AnalyticsProvider } from "@/providers/AnalyticsProvider";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import PageTransition from "@/components/PageTransition";
import { HelmetProvider } from 'react-helmet-async';
import ParticleBackground from "@/components/ParticleBackground";
import FilmGrainOverlay from "@/components/FilmGrainOverlay";
import FloatingDogButton from "@/components/FloatingDogButton";
import CookieConsentBanner from "@/components/privacy/CookieConsentBanner";

// Eager load - critical path
import Index from "./pages/Index";

// Lazy load - secondary pages
const Admin = lazy(() => import("./pages/Admin"));
const News = lazy(() => import("./pages/News"));
const Festivals = lazy(() => import("./pages/Festivals"));
const FestivalDetail = lazy(() => import("./pages/FestivalDetail"));
const Artists = lazy(() => import("./pages/Artists"));
const ArtistsGallery = lazy(() => import("./pages/ArtistsGallery"));
const ArtistDetail = lazy(() => import("./pages/ArtistDetail"));
const Venues = lazy(() => import("./pages/Venues"));
const VenueDetail = lazy(() => import("./pages/VenueDetail"));
const Labels = lazy(() => import("./pages/Labels"));
const LabelDetail = lazy(() => import("./pages/LabelDetail"));
const Releases = lazy(() => import("./pages/Releases"));
const Crews = lazy(() => import("./pages/Crews"));
const ProperMarketing = lazy(() => import("./pages/ProperMarketing"));
const CrewDetail = lazy(() => import("./pages/CrewDetail"));
const Gear = lazy(() => import("./pages/Gear"));
const GearDetail = lazy(() => import("./pages/GearDetail"));
const UserStories = lazy(() => import("./pages/UserStories"));
const Info = lazy(() => import("./pages/Info"));
const Archives = lazy(() => import("./pages/Archives"));
const Contribute = lazy(() => import("./pages/Contribute"));

const NewsAgentAdmin = lazy(() => import("./pages/NewsAgentAdmin"));
const SubmissionsAdmin = lazy(() => import("./pages/SubmissionsAdmin"));
const NewsDrafts = lazy(() => import("./pages/NewsDrafts"));
const NewsArticleDetail = lazy(() => import("./pages/NewsArticleDetail"));
const NewsArchive = lazy(() => import("./pages/NewsArchive"));
const DJArtistsAdmin = lazy(() => import("./pages/DJArtistsAdmin"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Developer = lazy(() => import("./pages/Developer"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const AdminModeration = lazy(() => import("./pages/AdminModeration"));
const MediaAdmin = lazy(() => import("./pages/MediaAdmin"));
const AdminAudit = lazy(() => import("./pages/AdminAudit"));
const MediaEngine = lazy(() => import("./pages/MediaEngine"));
const UserRoleManagement = lazy(() => import("./pages/UserRoleManagement"));
const AdminControlCenter = lazy(() => import("./pages/AdminControlCenter"));
const BadgeAdmin = lazy(() => import("./pages/BadgeAdmin"));
const XPEventsAdmin = lazy(() => import("./pages/XPEventsAdmin"));
const SystemHealth = lazy(() => import("./pages/SystemHealth"));
const Support = lazy(() => import("./pages/Support"));
const AIImageGallery = lazy(() => import("./pages/AIImageGallery"));
const ActivityLog = lazy(() => import("./pages/ActivityLog"));
const NotificationChannels = lazy(() => import("./pages/NotificationChannels"));
const KnowledgeAdmin = lazy(() => import("./pages/KnowledgeAdmin"));
const KnowledgeLayerAdmin = lazy(() => import("./pages/admin/KnowledgeLayerAdmin"));
const ArtistMigrationAdmin = lazy(() => import("./pages/ArtistMigrationAdmin"));
const ArtistEnrichmentAdmin = lazy(() => import("./pages/ArtistEnrichmentAdmin"));
const DataAudit = lazy(() => import("./pages/DataAudit"));
const GearAgentAdmin = lazy(() => import("./pages/GearAgentAdmin"));
const PRMediaAgentAdmin = lazy(() => import("./pages/PRMediaAgentAdmin"));
const GearManufacturerAdmin = lazy(() => import("./pages/GearManufacturerAdmin"));
const ArtistLabelAgentAdmin = lazy(() => import("./pages/ArtistLabelAgentAdmin"));
const LabelsAgentAdmin = lazy(() => import("./pages/LabelsAgentAdmin"));
const CollectivesAgentAdmin = lazy(() => import("./pages/CollectivesAgentAdmin"));
const OutreachEngineAdmin = lazy(() => import("./pages/OutreachEngineAdmin"));
const PlaybookAgentAdmin = lazy(() => import("./pages/PlaybookAgentAdmin"));
const MediaCuratorAdmin = lazy(() => import("./pages/MediaCuratorAdmin"));
const ContentOrchestratorAdmin = lazy(() => import("./pages/ContentOrchestratorAdmin"));
const DoggyOrchestratorAdmin = lazy(() => import("./pages/DoggyOrchestratorAdmin"));
const AIOrchestratorAdmin = lazy(() => import("./pages/AIOrchestratorAdmin"));
const TranslationAgentAdmin = lazy(() => import("./pages/TranslationAgentAdmin"));
const GoogleOrganicStrategyAdmin = lazy(() => import("./pages/GoogleOrganicStrategyAdmin"));
const ChangelogAdmin = lazy(() => import("./pages/ChangelogAdmin"));
const SEOCommandCenter = lazy(() => import("./pages/admin/SEOCommandCenter"));
const Architecture = lazy(() => import("./pages/Architecture"));

// Agent Admin Pages
const ApiGuardianAdmin = lazy(() => import("./pages/ApiGuardianAdmin"));
const HealthMonitorAdmin = lazy(() => import("./pages/HealthMonitorAdmin"));
const SecurityAuditorAdmin = lazy(() => import("./pages/SecurityAuditorAdmin"));
const DataIntegrityAdmin = lazy(() => import("./pages/DataIntegrityAdmin"));
const MediaMonitorAdmin = lazy(() => import("./pages/MediaMonitorAdmin"));
const SubmissionsTriageAdmin = lazy(() => import("./pages/SubmissionsTriageAdmin"));
const AnalyticsReporterAdmin = lazy(() => import("./pages/AnalyticsReporterAdmin"));
const KnowledgeGapAdmin = lazy(() => import("./pages/KnowledgeGapAdmin"));
const TicketingAdmin = lazy(() => import("./pages/TicketingAdmin"));
const DogAgentAdmin = lazy(() => import("./pages/DogAgentAdmin"));
const TrainingCenter = lazy(() => import("./pages/TrainingCenter"));
const UserTrainingCenter = lazy(() => import("./pages/UserTrainingCenter"));
const DoggiesAdmin = lazy(() => import("./pages/DoggiesAdmin"));
const DoggyWidget = lazy(() => import("./pages/DoggyWidget"));
const TechnoDoggies = lazy(() => import("./pages/TechnoDoggies"));
const Store = lazy(() => import("./pages/Store"));
const StoreProduct = lazy(() => import("./pages/StoreProduct"));
const StoreInfo = lazy(() => import("./pages/StoreInfo"));
const Lookbook = lazy(() => import("./pages/Lookbook"));
const SoundMachine = lazy(() => import("./pages/SoundMachine"));

const Technopedia = lazy(() => import("./pages/Technopedia"));
const Books = lazy(() => import("./pages/Books"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const Documentaries = lazy(() => import("./pages/Documentaries"));
const LibrarianAgentAdmin = lazy(() => import("./pages/LibrarianAgentAdmin"));
const AdminBookKnowledge = lazy(() => import("./pages/AdminBookKnowledge"));
const Community = lazy(() => import("./pages/Community"));
const CommunityDocs = lazy(() => import("./pages/CommunityDocs"));
const CommunityLeaderboard = lazy(() => import("./pages/CommunityLeaderboard"));
const CommunityProfile = lazy(() => import("./pages/CommunityProfile"));
const MySubmissions = lazy(() => import("./pages/MySubmissions"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Sitemap = lazy(() => import("./pages/Sitemap"));
const PrivacyAgentAdmin = lazy(() => import("./pages/PrivacyAgentAdmin"));
const OGPreview = lazy(() => import("./pages/OGPreview"));

const queryClient = new QueryClient();

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="font-mono text-xs text-muted-foreground animate-pulse">Loading...</div>
  </div>
);

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnalyticsProvider>
                <ParticleBackground />
                <FilmGrainOverlay />
                <ScrollToTop />
                <ScrollToTopButton />
                <FloatingDogButton />
                <CookieConsentBanner />
                <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Routes>
                    {/* Main */}
                    <Route path="/" element={<Index />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/auth" element={<Navigate to="/admin" replace />} />
                    
                    {/* Info - Hub for News & Archives */}
                    <Route path="/info" element={<Info />} />
                    <Route path="/archives" element={<Archives />} />
                    <Route path="/contribute" element={<Contribute />} />
                    
                    {/* News */}
                    <Route path="/news" element={<News />} />
                    <Route path="/news/drafts" element={<NewsDrafts />} />
                    <Route path="/news/article/:id" element={<NewsArticleDetail />} />
                    <Route path="/news/:id" element={<NewsArticleDetail />} />
                    <Route path="/news/archive" element={<NewsArchive />} />
                    <Route path="/news/features" element={<Navigate to="/news" replace />} />
                    
                    {/* Admin */}
                    <Route path="/admin/news-agent" element={<NewsAgentAdmin />} />
                    <Route path="/admin/submissions" element={<SubmissionsAdmin />} />
                    <Route path="/admin/dj-artists" element={<DJArtistsAdmin />} />
                    <Route path="/admin/moderation" element={<AdminModeration />} />
                    <Route path="/admin/media" element={<MediaAdmin />} />
                    <Route path="/admin/audit" element={<AdminAudit />} />
                    <Route path="/admin/media-engine" element={<MediaEngine />} />
                    <Route path="/admin/users" element={<UserRoleManagement />} />
                    <Route path="/admin/control-center" element={<AdminControlCenter />} />
                    <Route path="/admin/health" element={<SystemHealth />} />
                    <Route path="/admin/images" element={<AIImageGallery />} />
                    <Route path="/admin/activity-log" element={<ActivityLog />} />
                    <Route path="/admin/notifications" element={<NotificationChannels />} />
                    <Route path="/admin/knowledge" element={<KnowledgeAdmin />} />
                    <Route path="/admin/knowledge-layer" element={<KnowledgeLayerAdmin />} />
                    <Route path="/admin/badges" element={<BadgeAdmin />} />
                    <Route path="/admin/xp-events" element={<XPEventsAdmin />} />
                    
                    {/* Agent Admin Pages */}
                    <Route path="/admin/api-guardian" element={<ApiGuardianAdmin />} />
                    <Route path="/admin/health-monitor" element={<HealthMonitorAdmin />} />
                    <Route path="/admin/security-auditor" element={<SecurityAuditorAdmin />} />
                    <Route path="/admin/data-integrity" element={<DataIntegrityAdmin />} />
                    <Route path="/admin/media-monitor" element={<MediaMonitorAdmin />} />
                    <Route path="/admin/submissions-triage" element={<SubmissionsTriageAdmin />} />
                    <Route path="/admin/analytics-reporter" element={<AnalyticsReporterAdmin />} />
                    <Route path="/admin/knowledge-gap" element={<KnowledgeGapAdmin />} />
                    <Route path="/admin/ticketing" element={<TicketingAdmin />} />
                    <Route path="/admin/dog-agent" element={<DogAgentAdmin />} />
                    <Route path="/admin/artist-enrichment" element={<ArtistEnrichmentAdmin />} />
                    <Route path="/admin/labels-agent" element={<LabelsAgentAdmin />} />
                    <Route path="/admin/training" element={<TrainingCenter />} />
                    <Route path="/training" element={<UserTrainingCenter />} />
                    <Route path="/admin/doggies" element={<DoggiesAdmin />} />
                    <Route path="/doggy-widget" element={<DoggyWidget />} />
                    <Route path="/doggies" element={<TechnoDoggies />} />
                    
                    {/* Festivals */}
                    <Route path="/festivals" element={<Festivals />} />
                    <Route path="/festivals/:id" element={<FestivalDetail />} />
                    
                    {/* Artists */}
                    <Route path="/artists" element={<Artists />} />
                    <Route path="/artists/gallery" element={<ArtistsGallery />} />
                    <Route path="/artists/:id" element={<ArtistDetail />} />
                    
                    {/* Venues */}
                    <Route path="/venues" element={<Venues />} />
                    <Route path="/venues/:id" element={<VenueDetail />} />
                    
                    {/* Labels */}
                    <Route path="/labels" element={<Labels />} />
                    <Route path="/labels/:id" element={<LabelDetail />} />
                    
                    {/* Releases */}
                    <Route path="/releases" element={<Releases />} />
                    <Route path="/releases/:id" element={<Releases />} />
                    
                    {/* Crews */}
                    <Route path="/crews" element={<Crews />} />
                    <Route path="/crews/:id" element={<CrewDetail />} />
                    
                    {/* Proper Marketing */}
                    <Route path="/scenes/proper-marketing" element={<ProperMarketing />} />
                    
                    {/* User Stories (under News) */}
                    <Route path="/news/your-stories" element={<UserStories />} />
                    <Route path="/mad/stories" element={<Navigate to="/news/your-stories" replace />} />
                    
                    {/* Gear */}
                    <Route path="/gear" element={<Gear />} />
                    <Route path="/gear/:id" element={<GearDetail />} />
                    
                    {/* Developers (merged docs + API) */}
                    <Route path="/developer" element={<Developer />} />
                    <Route path="/docs" element={<Navigate to="/developer" replace />} />
                    <Route path="/api-docs" element={<ApiDocs />} />
                    
                    {/* Analytics (Admin only) */}
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/admin/analytics" element={<Analytics />} />
                    <Route path="/admin/artist-migration" element={<ArtistMigrationAdmin />} />
                    <Route path="/admin/data-audit" element={<DataAudit />} />
                    <Route path="/admin/gear-agent" element={<GearAgentAdmin />} />
                    <Route path="/admin/pr-media" element={<PRMediaAgentAdmin />} />
                    <Route path="/admin/gear-manufacturer" element={<GearManufacturerAdmin />} />
                    <Route path="/admin/artist-label-agent" element={<ArtistLabelAgentAdmin />} />
                    <Route path="/admin/collectives-agent" element={<CollectivesAgentAdmin />} />
                    <Route path="/admin/outreach-engine" element={<OutreachEngineAdmin />} />
                    <Route path="/admin/playbook-agent" element={<PlaybookAgentAdmin />} />
                    <Route path="/admin/media-curator" element={<MediaCuratorAdmin />} />
                    <Route path="/admin/content-orchestrator" element={<ContentOrchestratorAdmin />} />
                    <Route path="/admin/doggy-orchestrator" element={<DoggyOrchestratorAdmin />} />
                    <Route path="/admin/ai-orchestrator" element={<AIOrchestratorAdmin />} />
                    <Route path="/admin/translation-agent" element={<TranslationAgentAdmin />} />
                    <Route path="/admin/google-organic-strategy" element={<GoogleOrganicStrategyAdmin />} />
                    <Route path="/admin/seo-command-center" element={<SEOCommandCenter />} />
                    <Route path="/admin/librarian" element={<LibrarianAgentAdmin />} />
                    <Route path="/admin/book-knowledge" element={<AdminBookKnowledge />} />
                    <Route path="/admin/changelog" element={<ChangelogAdmin />} />
                    
                    {/* Community */}
                    <Route path="/community" element={<Community />} />
                    <Route path="/community/docs" element={<CommunityDocs />} />
                    <Route path="/community/leaderboard" element={<CommunityLeaderboard />} />
                    <Route path="/community/profile/:profileId" element={<CommunityProfile />} />
                    <Route path="/my-submissions" element={<MySubmissions />} />
                    <Route path="/submit" element={<Navigate to="/technopedia#contribute" replace />} />
                    <Route path="/technopedia" element={<Technopedia />} />
                    <Route path="/books" element={<Books />} />
                    <Route path="/books/:id" element={<BookDetail />} />
                    <Route path="/documentaries" element={<Documentaries />} />
                    
                    {/* Legal & Privacy */}
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/sitemap" element={<Sitemap />} />
                    <Route path="/admin/privacy-agent" element={<PrivacyAgentAdmin />} />
                    <Route path="/admin/og-preview" element={<OGPreview />} />
                    
                    {/* Architecture Blueprint */}
                    <Route path="/architecture" element={<Architecture />} />
                    
                    {/* Support */}
                    <Route path="/support" element={<Support />} />
                    
                    {/* Sound Machine */}
                    <Route path="/sound-machine" element={<SoundMachine />} />
                    
                    {/* Store */}
                    <Route path="/store" element={<Store />} />
                    <Route path="/store/product/:handle" element={<StoreProduct />} />
                    <Route path="/store/info" element={<StoreInfo />} />
                    <Route path="/store/lookbook" element={<Lookbook />} />
                    
                    {/* Catch all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PageTransition>
                </Suspense>
              </AnalyticsProvider>
            </BrowserRouter>
            </TooltipProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;