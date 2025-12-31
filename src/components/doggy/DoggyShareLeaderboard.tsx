import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Share2 } from "lucide-react";
import DogSilhouette from "@/components/DogSilhouette";

interface LeaderboardEntry {
  id: string;
  display_name: string;
  share_count: number;
}

// Arcade-style rank display
const getRankDisplay = (rank: number) => {
  switch (rank) {
    case 1:
      return { label: "1ST", color: "text-yellow-400", bg: "bg-yellow-400/20", glow: "shadow-[0_0_20px_rgba(250,204,21,0.4)]" };
    case 2:
      return { label: "2ND", color: "text-gray-300", bg: "bg-gray-300/15", glow: "" };
    case 3:
      return { label: "3RD", color: "text-amber-500", bg: "bg-amber-500/15", glow: "" };
    default:
      return { label: `${rank}TH`, color: "text-logo-green/70", bg: "bg-logo-green/5", glow: "" };
  }
};

// Rank-based icon variations using design system colors
const getRankIconStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return "w-5 h-5 [&_g]:stroke-yellow-400 [&_ellipse[fill]]:fill-yellow-400";
    case 2:
      return "w-5 h-5 [&_g]:stroke-gray-300 [&_ellipse[fill]]:fill-gray-300";
    case 3:
      return "w-5 h-5 [&_g]:stroke-amber-500 [&_ellipse[fill]]:fill-amber-500";
    default:
      return "w-4 h-4 opacity-70";
  }
};

export const DoggyShareLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userShares, setUserShares] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const getSessionId = () => {
    let sessionId = localStorage.getItem('doggy_session_id');
    if (!sessionId) {
      sessionId = `doggy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('doggy_session_id', sessionId);
    }
    return sessionId;
  };

  const fetchLeaderboard = useCallback(async () => {
    try {
      // Fetch top 10 sharers
      const { data: topSharers } = await supabase
        .from('doggy_share_leaderboard')
        .select('id, display_name, share_count')
        .order('share_count', { ascending: false })
        .limit(10);

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
  }, []);

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('doggy-leaderboard-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'doggy_share_leaderboard'
        },
        () => {
          // Refetch on any change
          fetchLeaderboard();
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  if (isLoading) {
    return (
      <div className="relative bg-black border-4 border-logo-green rounded-lg p-4 overflow-hidden">
        {/* Scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.1)_2px,rgba(0,255,0,0.1)_4px)]" />
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-logo-green/20 rounded w-2/3 mx-auto" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 bg-logo-green/10 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-black border-4 border-logo-green rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,255,0,0.2)]">
      {/* CRT Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.3)_2px,rgba(0,255,0,0.3)_4px)]" />
      
      {/* Arcade Header */}
      <div className="relative bg-gradient-to-b from-logo-green/20 to-transparent p-4 border-b-2 border-logo-green/50">
        {/* Live indicator */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-logo-green animate-pulse' : 'bg-muted'}`} />
          <span className="font-mono text-[8px] uppercase tracking-widest text-logo-green/70">
            {isLive ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>

        {/* Title - Arcade Style with DogSilhouette */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <DogSilhouette className="w-7 h-7" animated />
            <h3 className="font-mono text-lg font-black uppercase tracking-wider text-logo-green drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]">
              Hall of Fame
            </h3>
            <DogSilhouette className="w-7 h-7" animated />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-logo-green/60">
            Top Techno Dogs
          </p>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="p-3">
        {leaders.length > 0 ? (
          <div className="space-y-1">
            {/* Column Headers */}
            <div className="flex items-center px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-logo-green/40 border-b border-logo-green/20">
              <span className="w-12">RANK</span>
              <span className="flex-1">PLAYER</span>
              <span className="w-16 text-right">SCORE</span>
            </div>

            {leaders.map((leader, index) => {
              const rank = getRankDisplay(index + 1);
              const iconStyle = getRankIconStyle(index + 1);
              
              return (
                <div
                  key={leader.id}
                  className={`flex items-center px-2 py-2 rounded transition-all duration-300 ${rank.bg} ${rank.glow} ${
                    index === 0 ? 'animate-pulse' : ''
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="w-12">
                    <span className={`font-mono text-sm font-black ${rank.color}`}>
                      {rank.label}
                    </span>
                  </div>
                  
                  {/* Player Name with DogSilhouette */}
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <DogSilhouette className={iconStyle} />
                    <span className={`font-mono text-sm truncate ${
                      index === 0 ? 'text-yellow-400 font-bold' : 'text-foreground'
                    }`}>
                      {leader.display_name.toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Score with arcade styling */}
                  <div className="w-16 text-right">
                    <span className={`font-mono text-sm font-black tabular-nums ${
                      index === 0 ? 'text-yellow-400' : 'text-logo-green'
                    }`}>
                      {String(leader.share_count).padStart(4, '0')}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Fill empty slots to always show 10 rows */}
            {Array.from({ length: Math.max(0, 10 - leaders.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center px-2 py-2 opacity-30"
              >
                <div className="w-12">
                  <span className="font-mono text-sm text-logo-green/30">
                    {getRankDisplay(leaders.length + i + 1).label}
                  </span>
                </div>
                <div className="flex-1 font-mono text-sm text-logo-green/20">
                  ---
                </div>
                <div className="w-16 text-right font-mono text-sm text-logo-green/20">
                  0000
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DogSilhouette className="w-12 h-12 mx-auto mb-3" animated />
            <p className="font-mono text-sm text-logo-green uppercase tracking-wider mb-1">
              No Players Yet
            </p>
            <p className="font-mono text-[10px] text-logo-green/50">
              Be the first to enter the Hall of Fame!
            </p>
          </div>
        )}
      </div>

      {/* User's rank if not in top 10 */}
      {userRank && userRank > 10 && (
        <div className="mx-3 mb-3 p-2 border-2 border-dashed border-logo-green/30 rounded bg-logo-green/5">
          <div className="flex items-center">
            <div className="w-12">
              <span className="font-mono text-sm text-logo-green/70">
                #{userRank}
              </span>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <DogSilhouette className="w-4 h-4" />
              <span className="font-mono text-sm text-foreground font-bold">YOU</span>
            </div>
            <div className="w-16 text-right">
              <span className="font-mono text-sm font-black text-logo-green tabular-nums">
                {String(userShares).padStart(4, '0')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="border-t-2 border-logo-green/30 p-3 bg-logo-green/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-logo-green animate-bounce" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-logo-green/70">
              Share to climb!
            </span>
          </div>
          <a 
            href="/community" 
            className="font-mono text-xs text-logo-green hover:text-logo-green/80 uppercase tracking-wider transition-colors hover:underline"
          >
            Join Pack →
          </a>
        </div>
      </div>

      {/* Corner decorations - arcade cabinet style */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-logo-green/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-logo-green/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-logo-green/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-logo-green/50" />
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
