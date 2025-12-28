import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface MultiplierData {
  multiplier: number;
  event_name: string | null;
  event_icon: string | null;
  ends_at: string | null;
}

interface XPMultiplierBannerProps {
  className?: string;
  variant?: "banner" | "compact" | "badge";
}

export function XPMultiplierBanner({ 
  className, 
  variant = "banner" 
}: XPMultiplierBannerProps) {
  const [multiplier, setMultiplier] = useState<MultiplierData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMultiplier = async () => {
      try {
        const { data, error } = await supabase.rpc("get_current_xp_multiplier");
        
        if (!error && data && data.length > 0 && data[0].multiplier > 1) {
          setMultiplier({
            multiplier: Number(data[0].multiplier),
            event_name: data[0].event_name,
            event_icon: data[0].event_icon,
            ends_at: data[0].ends_at,
          });
        }
      } catch (err) {
        console.error("Failed to load multiplier:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMultiplier();
    // Refresh every minute
    const interval = setInterval(loadMultiplier, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !multiplier) return null;

  if (variant === "badge") {
    return (
      <span className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-bold",
        "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 text-amber-400",
        className
      )}>
        <Zap className="h-3 w-3" />
        {multiplier.multiplier}x XP
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-lg",
        "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30",
        className
      )}>
        <span className="text-lg">{multiplier.event_icon || "⚡"}</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-amber-400">{multiplier.multiplier}x</span>
          <span className="text-xs text-muted-foreground">XP Active</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-lg p-4",
      "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10",
      "border border-amber-500/30",
      className
    )}>
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(251,191,36,0.1),transparent_70%)]" />
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl animate-pulse">{multiplier.event_icon || "⚡"}</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-bold text-amber-400">
                {multiplier.multiplier}x XP
              </span>
              <Zap className="h-5 w-5 text-amber-500 animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground">
              {multiplier.event_name || "Bonus Active"}
            </p>
          </div>
        </div>

        {multiplier.ends_at && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Ends {formatDistanceToNow(new Date(multiplier.ends_at), { addSuffix: true })}</span>
          </div>
        )}
      </div>
    </div>
  );
}
