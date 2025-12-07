import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollToTopButton from "@/components/ScrollToTopButton";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import News from "./pages/News";
import Festivals from "./pages/Festivals";
import FestivalDetail from "./pages/FestivalDetail";
import Artists from "./pages/Artists";
import ArtistDetail from "./pages/ArtistDetail";
import Venues from "./pages/Venues";
import Labels from "./pages/Labels";
import Releases from "./pages/Releases";
import Crews from "./pages/Crews";
import MadStuff from "./pages/MadStuff";
import Timeline from "./pages/Timeline";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
            <Routes>
              {/* Main */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              
              {/* News */}
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<News />} />
              <Route path="/news/features" element={<News />} />
              <Route path="/news/interviews" element={<News />} />
              
              {/* Festivals */}
              <Route path="/festivals" element={<Festivals />} />
              <Route path="/festivals/:id" element={<FestivalDetail />} />
              
              {/* Artists */}
              <Route path="/artists" element={<Artists />} />
              <Route path="/artists/regions" element={<Artists />} />
              <Route path="/artists/:id" element={<ArtistDetail />} />
              
              {/* Venues */}
              <Route path="/venues" element={<Venues />} />
              <Route path="/venues/:id" element={<Venues />} />
              
              {/* Labels */}
              <Route path="/labels" element={<Labels />} />
              <Route path="/labels/:id" element={<Labels />} />
              
              {/* Releases */}
              <Route path="/releases" element={<Releases />} />
              <Route path="/releases/essential" element={<Releases />} />
              <Route path="/releases/new" element={<Releases />} />
              <Route path="/releases/:id" element={<Releases />} />
              
              {/* Crews */}
              <Route path="/crews" element={<Crews />} />
              <Route path="/crews/:id" element={<Crews />} />
              
              {/* Mad Stuff */}
              <Route path="/mad" element={<MadStuff />} />
              <Route path="/mad/timeline" element={<Timeline />} />
              <Route path="/mad/calendar" element={<Calendar />} />
              <Route path="/mad/map" element={<MadStuff />} />
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
