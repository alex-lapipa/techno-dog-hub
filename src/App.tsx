import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopButton from "@/components/ScrollToTopButton";

// Eager load - critical path
import Index from "./pages/Index";

// Lazy load - secondary pages
const Auth = lazy(() => import("./pages/Auth"));
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
const Documentation = lazy(() => import("./pages/Documentation"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="font-mono text-xs text-muted-foreground animate-pulse">Loading...</div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <ScrollToTopButton />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Main */}
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* News */}
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<News />} />
                <Route path="/news/features" element={<News />} />
                
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
                
                {/* Mad Stuff */}
                <Route path="/mad" element={<Venues />} />
                <Route path="/mad/stories" element={<UserStories />} />
                
                {/* Gear */}
                <Route path="/gear" element={<Gear />} />
                <Route path="/gear/:id" element={<GearDetail />} />
                
                {/* Documentation */}
                <Route path="/docs" element={<Documentation />} />
                
                {/* Analytics (Admin only) */}
                <Route path="/analytics" element={<Analytics />} />
                
                {/* Catch all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;