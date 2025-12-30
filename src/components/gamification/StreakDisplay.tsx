import { Flame, Trophy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string | null;
  size?: "sm" | "md" | "lg";
  showLongest?: boolean;
  className?: string;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
  lastActivityDate,
  size = "md",
  showLongest = true,
  className,
}: StreakDisplayProps) {
  const isActiveToday = lastActivityDate === new Date().toISOString().split("T")[0];
  
  const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-2",
    lg: "text-base gap-3",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 100) return "text-purple-500";
    if (streak >= 30) return "text-amber-500";
    if (streak >= 7) return "text-orange-500";
    if (streak >= 1) return "text-red-500";
    return "text-muted-foreground";
  };

  const getStreakGlow = (streak: number) => {
    if (streak >= 30) return "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]";
    if (streak >= 7) return "drop-shadow-[0_0_6px_rgba(249,115,22,0.5)]";
    if (streak >= 1) return "drop-shadow-[0_0_4px_rgba(239,68,68,0.4)]";
    return "";
  };

  return (
    <div className={cn("flex items-center", sizeClasses[size], className)}>
      <div className="flex items-center gap-1.5">
        <Flame 
          className={cn(
            iconSizes[size], 
            getStreakColor(currentStreak),
            currentStreak > 0 && getStreakGlow(currentStreak),
            currentStreak > 0 && isActiveToday && "animate-pulse"
          )} 
        />
        <span className={cn("font-mono font-bold", getStreakColor(currentStreak))}>
          {currentStreak}
        </span>
        <span className="text-muted-foreground">day{currentStreak !== 1 ? "s" : ""}</span>
      </div>

      {showLongest && longestStreak > currentStreak && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="text-muted-foreground/50">•</span>
          <Trophy className={cn(iconSizes[size], "text-amber-500/70")} />
          <span className="font-mono">{longestStreak}</span>
          <span className="text-xs">best</span>
        </div>
      )}
    </div>
  );
}

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string | null;
  className?: string;
}

export function StreakCard({
  currentStreak,
  longestStreak,
  lastActivityDate,
  className,
}: StreakCardProps) {
  const isActiveToday = lastActivityDate === new Date().toISOString().split("T")[0];
  const isActiveYesterday = lastActivityDate === new Date(Date.now() - 86400000).toISOString().split("T")[0];
  
  const getStreakMessage = () => {
    if (currentStreak === 0) return "Start your streak today!";
    if (isActiveToday) return "You're on fire! Keep it going!";
    if (isActiveYesterday) return "Contribute today to extend your streak!";
    return "Your streak has reset. Start fresh!";
  };

  const getStreakLevel = () => {
    if (currentStreak >= 100) return "legendary";
    if (currentStreak >= 30) return "epic";
    if (currentStreak >= 7) return "hot";
    if (currentStreak >= 1) return "active";
    return "new";
  };

  return (
    <div className={cn(
      "p-4 rounded-lg border bg-gradient-to-br from-orange-500/5 to-red-500/5 border-orange-500/20",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Activity Streak
        </h3>
        <span className="text-xs font-mono uppercase text-logo-green">{getStreakLevel()}</span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <Flame className={cn(
          "h-6 w-6",
          currentStreak > 0 ? "text-orange-500" : "text-muted-foreground",
          currentStreak > 0 && "animate-pulse"
        )} />
        <span className="text-3xl font-bold font-mono">{currentStreak}</span>
        <span className="text-muted-foreground">day{currentStreak !== 1 ? "s" : ""}</span>
      </div>

      <p className="text-xs text-muted-foreground mb-3">{getStreakMessage()}</p>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Trophy className="h-3 w-3 text-amber-500" />
          <span>Best: <span className="font-mono font-medium text-foreground">{longestStreak}</span> days</span>
        </div>
        {lastActivityDate && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Last: {new Date(lastActivityDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
