import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Crown, Medal, Star, Share2 } from "lucide-react";

interface LeaderboardEntry {
  id: string;
  display_name: string;
  share_count: number;
}

export const DoggyShareLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userShares, setUserShares] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const getSessionId = () => {
    let sessionId = localStorage.getItem('doggy_session_id');
    if (!sessionId) {
      sessionId = `doggy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('doggy_session_id', sessionId);
    }
    return sessionId;
  };

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch top 5 sharers
        const { data: topSharers } = await supabase
          .from('doggy_share_leaderboard')
          .select('id, display_name, share_count')
          .order('share_count', { ascending: false })
          .limit(5);

        if (topSharers) {
          setLeaders(topSharers);
        }

        // Check if current user is on the leaderboard
        const sessionId = getSessionId();
        const { data: userEntry } = await supabase
          .from('doggy_share_leaderboard')
          .select('id, share_count')
          .eq('session_id', sessionId)
          .single();

        if (userEntry) {
          setUserShares(userEntry.share_count);
          
          // Calculate rank
          const { count } = await supabase
            .from('doggy_share_leaderboard')
            .select('id', { count: 'exact', head: true })
            .gt('share_count', userEntry.share_count);
          
          setUserRank((count || 0) + 1);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-300" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" />;
      default:
        return <Star className="w-3.5 h-3.5 text-logo-green/50" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card/50 border border-border/30 rounded-xl p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted/30 rounded w-1/2 mx-auto" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-8 bg-muted/20 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 border border-logo-green/20 rounded-xl p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-logo-green" />
          <h3 className="font-mono text-base font-bold text-foreground">Techno Dog Hall of Fame</h3>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">
          Sign up to Techno Dog Community and become a legend
        </p>
      </div>

      {/* Leaderboard List */}
      {leaders.length > 0 ? (
        <div className="space-y-2">
          {leaders.map((leader, index) => (
            <div
              key={leader.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                index === 0 
                  ? 'bg-yellow-500/10 border border-yellow-500/30' 
                  : 'bg-muted/10 hover:bg-muted/20'
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center w-6">
                {getRankIcon(index + 1)}
              </div>
              
              {/* Name */}
              <div className="flex-1 min-w-0">
                <span className="font-mono text-xs text-foreground truncate block">
                  {leader.display_name}
                </span>
              </div>
              
              {/* Share Count */}
              <div className="flex items-center gap-1">
                <Share2 className="w-3 h-3 text-logo-green" />
                <span className="font-mono text-xs font-bold text-logo-green">
                  {leader.share_count}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="font-mono text-xs text-muted-foreground mb-2">
            No sharers yet!
          </p>
          <p className="font-mono text-[10px] text-logo-green">
            Be the first to share
          </p>
        </div>
      )}

      {/* User's rank if not in top 5 */}
      {userRank && userRank > 5 && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="flex items-center gap-3 p-2 bg-logo-green/10 rounded-lg">
            <div className="font-mono text-xs text-muted-foreground">
              #{userRank}
            </div>
            <div className="flex-1">
              <span className="font-mono text-xs text-foreground">You</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="w-3 h-3 text-logo-green" />
              <span className="font-mono text-xs font-bold text-logo-green">
                {userShares}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-4 pt-3 border-t border-border/30 text-center">
        <a 
          href="/community" 
          className="inline-block font-mono text-xs text-logo-green hover:text-logo-green/80 underline underline-offset-2 transition-colors"
        >
          Join the Community →
        </a>
      </div>
    </div>
  );
};

// Helper function to record a share
export const recordShare = async (displayName?: string): Promise<boolean> => {
  try {
    const sessionId = localStorage.getItem('doggy_session_id') || 
      `doggy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('doggy_session_id', sessionId);

    // Check if user already exists
    const { data: existing } = await supabase
      .from('doggy_share_leaderboard')
      .select('id, share_count')
      .eq('session_id', sessionId)
      .single();

    if (existing) {
      // Update share count
      await supabase
        .from('doggy_share_leaderboard')
        .update({ 
          share_count: existing.share_count + 1,
          last_share_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      // Create new entry
      const name = displayName || `Doggy Fan ${Math.floor(Math.random() * 9999)}`;
      await supabase
        .from('doggy_share_leaderboard')
        .insert({
          display_name: name,
          session_id: sessionId,
          share_count: 1
        });
    }

    return true;
  } catch (error) {
    console.error('Error recording share:', error);
    return false;
  }
};

export default DoggyShareLeaderboard;
