import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, TrendingUp, ExternalLink, Sparkles } from "lucide-react";
import { subDays, subMonths, startOfDay } from "date-fns";

type TimeFilter = "all" | "weekly" | "monthly";

interface LeaderEntry {
  id: string;
  display_name: string | null;
  email: string;
  total_points: number;
  current_level: number;
  level_name?: string;
  level_icon?: string;
}

interface LeaderboardWidgetProps {
  limit?: number;
  showHeader?: boolean;
  showViewAll?: boolean;
  className?: string;
}

export function LeaderboardWidget({
  limit = 10,
  showHeader = true,
  showViewAll = true,
  className = "",
}: LeaderboardWidgetProps) {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

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
    const loadLeaders = async () => {
      setLoading(true);
      try {
        const dateFilter = getDateFilter(timeFilter);

        // Load profiles
        let profilesQuery = supabase
          .from("community_profiles")
          .select("id, display_name, email, total_points, current_level")
          .eq("status", "verified")
          .gt("total_points", 0)
          .order("total_points", { ascending: false })
          .limit(limit);

        const { data: profiles, error: profilesError } = await profilesQuery;
        if (profilesError) throw profilesError;

        // Load levels
        const { data: levels } = await supabase
          .from("contributor_levels")
          .select("level_number, name, icon");

        const levelMap = new Map(levels?.map((l) => [l.level_number, l]));

        // If filtering by time, we need to check point transactions
        let filteredProfiles = profiles || [];
        
        if (dateFilter && profiles) {
          const profileIds = profiles.map((p) => p.id);
          const { data: transactions } = await supabase
            .from("point_transactions")
            .select("profile_id, points")
            .in("profile_id", profileIds)
            .gte("created_at", dateFilter.toISOString());

          // Sum points per profile in the time period
          const periodPoints: Record<string, number> = {};
          transactions?.forEach((t) => {
            periodPoints[t.profile_id] = (periodPoints[t.profile_id] || 0) + t.points;
          });

          // Filter and sort by period points
          filteredProfiles = profiles
            .filter((p) => periodPoints[p.id] > 0)
            .map((p) => ({
              ...p,
              total_points: periodPoints[p.id] || 0,
            }))
            .sort((a, b) => b.total_points - a.total_points);
        }

        const leaderData: LeaderEntry[] = filteredProfiles.slice(0, limit).map((profile) => {
          const level = levelMap.get(profile.current_level ?? 1);
          return {
            ...profile,
            total_points: profile.total_points ?? 0,
            current_level: profile.current_level ?? 1,
            level_name: level?.name,
            level_icon: level?.icon,
          };
        });

        setLeaders(leaderData);
      } catch (err) {
        console.error("Error loading leaderboard widget:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaders();
  }, [timeFilter, limit]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="font-mono text-xs text-muted-foreground w-4 text-center">{rank}</span>;
    }
  };

  const getDisplayName = (entry: LeaderEntry) => {
    if (entry.display_name) return entry.display_name;
    const [local, domain] = entry.email.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
  };

  return (
    <Card className={`border-border/50 ${className}`}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              Top Contributors
            </CardTitle>
            {showViewAll && (
              <Link
                to="/community/leaderboard"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                View All <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-0" : ""}>
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="all" className="text-xs py-1">
              All Time
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-xs py-1">
              Week
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs py-1">
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-12 ml-auto" />
              </div>
            ))}
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No contributors yet
          </div>
        ) : (
          <div className="space-y-1">
            {leaders.map((entry, index) => (
              <Link
                key={entry.id}
                to={`/community/profile/${entry.id}`}
                className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors group"
              >
                <div className="w-5 flex justify-center">
                  {getRankIcon(index + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {getDisplayName(entry)}
                  </p>
                  {entry.level_name && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span>{entry.level_icon}</span>
                      {entry.level_name}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="font-mono text-xs shrink-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {entry.total_points}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
