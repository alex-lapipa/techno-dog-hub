import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { BadgeDisplay, LevelProgress, PointsHistory, BadgeShowcase, StreakCard, MilestoneProgress } from "@/components/gamification";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Camera, 
  FileText,
  Trophy,
  User
} from "lucide-react";
import { format } from "date-fns";

interface ProfileData {
  id: string;
  display_name: string | null;
  email: string;
  status: string;
  roles: string[];
  city: string | null;
  country: string | null;
  created_at: string;
  total_points: number;
  current_level: number;
  trust_score: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

const CommunityProfile = () => {
  const { profileId } = useParams<{ profileId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [stats, setStats] = useState({ photos: 0, corrections: 0 });

  const gamification = useGamification(profileId || null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) return;

      const { data, error } = await supabase
        .from("community_profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (!error && data) {
        setProfile(data);
        setIsOwner(data.user_id === user?.id);

        // Load submission stats
        const { count: photoCount } = await supabase
          .from("community_submissions")
          .select("*", { count: "exact", head: true })
          .eq("email", data.email)
          .eq("status", "approved")
          .eq("submission_type", "photo");

        const { count: correctionCount } = await supabase
          .from("community_submissions")
          .select("*", { count: "exact", head: true })
          .eq("email", data.email)
          .eq("status", "approved")
          .eq("submission_type", "correction");

        setStats({
          photos: photoCount || 0,
          corrections: correctionCount || 0,
        });
      }
      setLoading(false);
    };

    loadProfile();
  }, [profileId, user?.id]);

  const getDisplayName = (p: ProfileData) => {
    if (p.display_name) return p.display_name;
    const [local, domain] = p.email.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 pt-24">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64 md:col-span-2" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-12 pt-24 text-center">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">This community member doesn't exist.</p>
          <Link to="/community/leaderboard">
            <Button variant="outline">View Leaderboard</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{getDisplayName(profile)} | techno.dog Community</title>
        <meta name="description" content={`Community profile of ${getDisplayName(profile)}`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-12 pt-24">
          <Link
            to="/community/leaderboard"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Leaderboard
          </Link>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <CardHeader className="text-center">
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
                  style={{ 
                    backgroundColor: gamification.currentLevel 
                      ? `${gamification.currentLevel.color}20` 
                      : undefined 
                  }}
                >
                  {gamification.currentLevel?.icon || "🌱"}
                </div>
                <CardTitle className="text-xl">{getDisplayName(profile)}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-2">
                  {profile.status === "verified" && (
                    <Badge variant="outline" className="text-green-400 border-green-400/50">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Level Progress */}
                {gamification.currentLevel && (
                  <LevelProgress
                    currentLevel={gamification.currentLevel}
                    nextLevel={gamification.nextLevel || undefined}
                    currentPoints={gamification.totalPoints}
                  />
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Camera className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold">{stats.photos}</p>
                    <p className="text-xs text-muted-foreground">Photos</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <FileText className="h-4 w-4" />
                    </div>
                    <p className="text-2xl font-bold">{stats.corrections}</p>
                    <p className="text-xs text-muted-foreground">Corrections</p>
                  </div>
                </div>

                {/* Location & Join Date */}
                <div className="space-y-2 pt-4 border-t border-border">
                  {(profile.city || profile.country) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {[profile.city, profile.country].filter(Boolean).join(", ")}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined {format(new Date(profile.created_at), "MMM yyyy")}
                  </div>
                </div>

                {/* Roles */}
                {profile.roles.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Roles</p>
                    <div className="flex flex-wrap gap-1">
                      {profile.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestone Progress */}
                <div className="pt-4 border-t border-border">
                  <MilestoneProgress totalPoints={gamification.totalPoints} compact />
                </div>

                {/* Badges Preview */}
                {gamification.badges.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Recent Badges</p>
                    <BadgeDisplay badges={gamification.badges} size="md" maxDisplay={6} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Streak Card */}
              <StreakCard
                currentStreak={profile.current_streak}
                longestStreak={profile.longest_streak}
                lastActivityDate={profile.last_activity_date}
              />

              {/* Badge Showcase */}
              <BadgeShowcase profileId={profileId!} />

              {/* Points History - only show to owner */}
              {isOwner && <PointsHistory profileId={profileId!} />}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CommunityProfile;
