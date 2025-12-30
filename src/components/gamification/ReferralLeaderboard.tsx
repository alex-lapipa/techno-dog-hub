import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Trophy, Gift, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReferrerData {
  profile_id: string;
  display_name: string | null;
  referral_count: number;
  xp_earned: number;
}

interface ReferralLeaderboardProps {
  limit?: number;
  showTitle?: boolean;
}

export const ReferralLeaderboard = ({ limit = 10, showTitle = true }: ReferralLeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<ReferrerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [limit]);

  const loadLeaderboard = async () => {
    try {
      // Get completed referrals grouped by referrer
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select('referrer_id')
        .eq('status', 'completed');

      if (error) throw error;

      // Count referrals per referrer
      const referralCounts: Record<string, number> = {};
      referrals?.forEach(r => {
        referralCounts[r.referrer_id] = (referralCounts[r.referrer_id] || 0) + 1;
      });

      // Get profile details for top referrers
      const topReferrerIds = Object.entries(referralCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([id]) => id);

      if (topReferrerIds.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      const { data: profiles, error: profileError } = await supabase
        .from('community_profiles')
        .select('id, display_name')
        .in('id', topReferrerIds);

      if (profileError) throw profileError;

      // Combine data
      const leaderboardData: ReferrerData[] = topReferrerIds.map(id => {
        const profile = profiles?.find(p => p.id === id);
        const count = referralCounts[id] || 0;
        return {
          profile_id: id,
          display_name: profile?.display_name || 'Anonymous',
          referral_count: count,
          xp_earned: count * 250
        };
      });

      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading referral leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-5 text-center text-sm text-muted-foreground">{rank}</span>;
    }
  };

  const getRankBadge = (count: number) => {
    if (count >= 25) return { label: 'Ambassador', variant: 'default' as const };
    if (count >= 10) return { label: 'Network Leader', variant: 'default' as const };
    if (count >= 5) return { label: 'Community Builder', variant: 'secondary' as const };
    if (count >= 1) return { label: 'Referrer', variant: 'outline' as const };
    return null;
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50">
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Top Referrers
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="border-border/50 bg-card/50">
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Top Referrers
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No referrals yet</p>
            <p className="text-sm">Be the first to invite friends!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            Top Referrers
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {leaderboard.map((referrer, index) => {
          const rankBadge = getRankBadge(referrer.referral_count);
          return (
            <div
              key={referrer.profile_id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                index === 0 
                  ? 'bg-yellow-500/10 border border-yellow-500/20' 
                  : index < 3 
                    ? 'bg-background/50 border border-border/30'
                    : 'hover:bg-background/30'
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index + 1)}
              </div>

              {/* Name & Badge */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {referrer.display_name}
                </p>
                {rankBadge && (
                  <Badge variant={rankBadge.variant} className="text-xs gap-1 mt-1">
                    {rankBadge.label}
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  {referrer.referral_count}
                </div>
                <div className="flex items-center gap-1 text-xs text-primary">
                  <Gift className="h-3 w-3" />
                  {referrer.xp_earned} XP
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
