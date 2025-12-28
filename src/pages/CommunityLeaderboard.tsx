import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { BadgeDisplay } from "@/components/gamification";
import { 
  Trophy, 
  Medal, 
  Star, 
  Users, 
  TrendingUp,
  CheckCircle2,
  Camera,
  FileText,
  ArrowLeft,
  Calendar,
  Sparkles
} from "lucide-react";
import { subDays, subMonths, startOfDay } from "date-fns";

type TimeFilter = "all" | "weekly" | "monthly";

interface LevelData {
  level_number: number;
  name: string;
  icon: string;
  color: string;
}

interface UserBadgeData {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
}

interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  email: string;
  trust_score: number;
  roles: string[];
  approved_count: number;
  city: string | null;
  country: string | null;
  total_points: number;
  current_level: number;
  level?: LevelData;
  badges: UserBadgeData[];
}

const CommunityLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [stats, setStats] = useState({
    totalContributors: 0,
    totalApproved: 0,
    topScore: 0,
  });

  const getDateFilter = (filter: TimeFilter): Date | null => {
    const now = new Date();
    switch (filter) {
      case "weekly":
        return startOfDay(subDays(now, 7));
      case "monthly":
        return startOfDay(subMonths(now, 1));
      default:
        return null;
    }
  };

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const dateFilter = getDateFilter(timeFilter);

        // Load profiles with gamification data
        const { data: profiles, error: profilesError } = await supabase
          .from("community_profiles")
          .select("id, display_name, email, trust_score, roles, city, country, total_points, current_level")
          .eq("status", "verified")
          .gt("trust_score", 0)
          .order("total_points", { ascending: false })
          .limit(50);

        if (profilesError) throw profilesError;

        // Load levels
        const { data: levels } = await supabase
          .from("contributor_levels")
          .select("*")
          .order("level_number");

        const levelMap = new Map(levels?.map(l => [l.level_number, l]));

        // Load user badges
        const profileIds = profiles?.map(p => p.id) || [];
        const { data: userBadges } = await supabase
          .from("user_badges")
          .select("profile_id, badges(*)")
          .in("profile_id", profileIds);

        const badgesByProfile = new Map<string, UserBadgeData[]>();
        userBadges?.forEach(ub => {
          if (ub.badges) {
            const existing = badgesByProfile.get(ub.profile_id) || [];
            existing.push(ub.badges as unknown as UserBadgeData);
            badgesByProfile.set(ub.profile_id, existing);
          }
        });

        let submissionsQuery = supabase
          .from("community_submissions")
          .select("email, reviewed_at")
          .eq("status", "approved");

        if (dateFilter) {
          submissionsQuery = submissionsQuery.gte("reviewed_at", dateFilter.toISOString());
        }

        const { data: submissions, error: submissionsError } = await submissionsQuery;

        if (submissionsError) throw submissionsError;

        const submissionCounts: Record<string, number> = {};
        submissions?.forEach((sub) => {
          if (sub.email) {
            submissionCounts[sub.email] = (submissionCounts[sub.email] || 0) + 1;
          }
        });

        const leaderboardData: LeaderboardEntry[] = (profiles || []).map((profile) => ({
          ...profile,
          total_points: profile.total_points ?? 0,
          current_level: profile.current_level ?? 1,
          approved_count: submissionCounts[profile.email] || 0,
          level: levelMap.get(profile.current_level ?? 1),
          badges: badgesByProfile.get(profile.id) || [],
        }));

        leaderboardData.sort((a, b) => {
          // Sort by total points primarily
          return b.total_points - a.total_points;
        });

        const filteredData = dateFilter 
          ? leaderboardData.filter(entry => entry.approved_count > 0)
          : leaderboardData;

        setLeaders(filteredData.slice(0, 25));

        setStats({
          totalContributors: dateFilter 
            ? filteredData.filter(e => e.approved_count > 0).length 
            : profiles?.length || 0,
          totalApproved: submissions?.length || 0,
          topScore: profiles?.[0]?.total_points || 0,
        });
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [timeFilter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="font-mono text-lg text-muted-foreground w-6 text-center">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/30";
      case 2:
        return "bg-gray-400/10 border-gray-400/30";
      case 3:
        return "bg-amber-600/10 border-amber-600/30";
      default:
        return "bg-card border-border/50";
    }
  };

  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.display_name) return entry.display_name;
    const [local, domain] = entry.email.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
  };

  return (
    <>
      <Helmet>
        <title>Community Leaderboard | techno.dog</title>
        <meta name="description" content="Top contributors to the techno.dog knowledge base" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-12 pt-24">
          <Link
            to="/community"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Community
          </Link>

          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">Community Leaderboard</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Top contributors to the techno.dog knowledge base
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <Users className="h-6 w-6 text-primary mb-2" />
                <CardDescription className="text-xs uppercase tracking-wider">
                  Active Contributors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stats.totalContributors}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                <CardDescription className="text-xs uppercase tracking-wider">
                  Approved Submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stats.totalApproved}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <TrendingUp className="h-6 w-6 text-yellow-500 mb-2" />
                <CardDescription className="text-xs uppercase tracking-wider">
                  Highest Trust Score
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stats.topScore}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-mono">Period:</span>
              <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
                <TabsList className="bg-card border border-border">
                  <TabsTrigger value="all" className="font-mono text-xs">
                    All Time
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="font-mono text-xs">
                    This Week
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="font-mono text-xs">
                    This Month
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {timeFilter === "all" 
                  ? "Top 25 Contributors" 
                  : timeFilter === "weekly" 
                    ? "Top Contributors This Week"
                    : "Top Contributors This Month"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-16 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : leaders.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No contributors yet. Be the first!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider border-b border-border">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-5">Contributor</div>
                    <div className="col-span-2 text-center">Trust Score</div>
                    <div className="col-span-2 text-center">Approved</div>
                    <div className="col-span-2 text-right">Location</div>
                  </div>

                  {leaders.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border ${getRankBg(index + 1)} transition-colors hover:bg-card/80`}
                    >
                      <div className="col-span-2 md:col-span-1 flex items-center">
                        {getRankIcon(index + 1)}
                      </div>

                      <div className="col-span-10 md:col-span-5 flex flex-col justify-center">
                        <p className="font-medium truncate">{getDisplayName(entry)}</p>
                        <div className="flex gap-1 mt-1">
                          {entry.roles.slice(0, 2).map((role) => (
                            <Badge key={role} variant="outline" className="text-[10px] px-1.5 py-0">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="col-span-4 md:col-span-2 flex items-center justify-center">
                        <Badge variant="secondary" className="font-mono">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {entry.trust_score}
                        </Badge>
                      </div>

                      <div className="col-span-4 md:col-span-2 flex items-center justify-center">
                        <Badge variant="outline" className="font-mono text-green-500 border-green-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {entry.approved_count}
                        </Badge>
                      </div>

                      <div className="col-span-4 md:col-span-2 flex items-center justify-end">
                        {entry.city || entry.country ? (
                          <span className="font-mono text-xs text-muted-foreground truncate">
                            {[entry.city, entry.country].filter(Boolean).join(", ")}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground/50">—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Want to climb the ranks? Start contributing!
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/community"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-card transition-colors font-mono text-sm"
              >
                <Camera className="h-4 w-4" />
                Upload Photos
              </Link>
              <Link
                to="/artists"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-card transition-colors font-mono text-sm"
              >
                <FileText className="h-4 w-4" />
                Submit Corrections
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CommunityLeaderboard;
