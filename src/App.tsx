import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "@/hooks/useAdminAuth";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { HelmetProvider } from 'react-helmet-async';
import ParticleBackground from "@/components/ParticleBackground";

// Eager load - critical path
import Index from "./pages/Index";

// Lazy load - secondary pages
const Admin = lazy(() => import("./pages/Admin"));
const News = lazy(() => import("./pages/News"));
const Festivals = lazy(() => import("./pages/Festivals"));
const FestivalDetail = lazy(() => import("./pages/FestivalDetail"));
const Artists = lazy(() => import("./pages/Artists"));
const ArtistDetail = lazy(() => import("./pages/ArtistDetail"));
const Venues = lazy(() => import("./pages/Venues"));
const VenueDetail = lazy(() => import("./pages/VenueDetail"));
const Labels = lazy(() => import("./pages/Labels"));
const Releases = lazy(() => import("./pages/Releases"));
const Crews = lazy(() => import("./pages/Crews"));
const CrewDetail = lazy(() => import("./pages/CrewDetail"));
const Gear = lazy(() => import("./pages/Gear"));
const GearDetail = lazy(() => import("./pages/GearDetail"));
const UserStories = lazy(() => import("./pages/UserStories"));

const NewsAgentAdmin = lazy(() => import("./pages/NewsAgentAdmin"));
const SubmissionsAdmin = lazy(() => import("./pages/SubmissionsAdmin"));
const NewsDrafts = lazy(() => import("./pages/NewsDrafts"));
const NewsArticleDetail = lazy(() => import("./pages/NewsArticleDetail"));
const NewsArchive = lazy(() => import("./pages/NewsArchive"));
const DJArtistsAdmin = lazy(() => import("./pages/DJArtistsAdmin"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Developer = lazy(() => import("./pages/Developer"));
const AdminModeration = lazy(() => import("./pages/AdminModeration"));
const MediaAdmin = lazy(() => import("./pages/MediaAdmin"));

const Technopedia = lazy(() => import("./pages/Technopedia"));
const Community = lazy(() => import("./pages/Community"));
const CommunityDocs = lazy(() => import("./pages/CommunityDocs"));
const CommunityLeaderboard = lazy(() => import("./pages/CommunityLeaderboard"));
const MySubmissions = lazy(() => import("./pages/MySubmissions"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
              <ParticleBackground />
              <ScrollToTop />
              <ScrollToTopButton />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Main */}
                  <Route path="/" element={<Index />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/auth" element={<Navigate to="/admin" replace />} />
                  
                  {/* News */}
                  <Route path="/news" element={<News />} />
                  <Route path="/news/drafts" element={<NewsDrafts />} />
                  <Route path="/news/article/:id" element={<NewsArticleDetail />} />
                  <Route path="/news/:id" element={<NewsArticleDetail />} />
                  <Route path="/news/archive" element={<NewsArchive />} />
                  <Route path="/news/features" element={<News />} />
                  
                  {/* Admin */}
                  <Route path="/admin/news-agent" element={<NewsAgentAdmin />} />
                  <Route path="/admin/submissions" element={<SubmissionsAdmin />} />
                  <Route path="/admin/dj-artists" element={<DJArtistsAdmin />} />
                  <Route path="/admin/moderation" element={<AdminModeration />} />
                  <Route path="/admin/media" element={<MediaAdmin />} />
                  
                  {/* Festivals */}
                  <Route path="/festivals" element={<Festivals />} />
                  <Route path="/festivals/:id" element={<FestivalDetail />} />
                  
                  {/* Artists */}
                  <Route path="/artists" element={<Artists />} />
                  <Route path="/artists/:id" element={<ArtistDetail />} />
                  
                  {/* Venues */}
                  <Route path="/venues" element={<Venues />} />
                  <Route path="/venues/:id" element={<VenueDetail />} />
                  
                  {/* Labels */}
                  <Route path="/labels" element={<Labels />} />
                  <Route path="/labels/:id" element={<Labels />} />
                  
                  {/* Releases */}
                  <Route path="/releases" element={<Releases />} />
                  <Route path="/releases/:id" element={<Releases />} />
                  
                  {/* Crews */}
                  <Route path="/crews" element={<Crews />} />
                  <Route path="/crews/:id" element={<CrewDetail />} />
                  
                  {/* User Stories (under News) */}
                  <Route path="/news/your-stories" element={<UserStories />} />
                  <Route path="/mad/stories" element={<UserStories />} /> {/* Legacy redirect */}
                  
                  {/* Gear */}
                  <Route path="/gear" element={<Gear />} />
                  <Route path="/gear/:id" element={<GearDetail />} />
                  
                  {/* Developers (merged docs + API) */}
                  <Route path="/developer" element={<Developer />} />
                  <Route path="/docs" element={<Developer />} />
                  
                  {/* Analytics (Admin only) */}
                  <Route path="/analytics" element={<Analytics />} />
                  
                  {/* Community */}
                  <Route path="/community" element={<Community />} />
                  <Route path="/community/docs" element={<CommunityDocs />} />
                  <Route path="/community/leaderboard" element={<CommunityLeaderboard />} />
                  <Route path="/my-submissions" element={<MySubmissions />} />
                  <Route path="/my-submissions" element={<MySubmissions />} />
                  <Route path="/submit" element={<Navigate to="/technopedia#contribute" replace />} />
                  <Route path="/technopedia" element={<Technopedia />} />
                  
                  {/* Catch all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            </TooltipProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;