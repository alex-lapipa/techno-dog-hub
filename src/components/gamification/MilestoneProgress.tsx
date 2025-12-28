import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const MILESTONES = [
  { points: 100, name: "First Hundred", icon: "💯" },
  { points: 500, name: "Rising Star", icon: "⭐" },
  { points: 1000, name: "Thousand Club", icon: "🌟" },
  { points: 2500, name: "Scene Veteran", icon: "🎖️" },
  { points: 5000, name: "Techno Elite", icon: "🏅" },
  { points: 10000, name: "Legend", icon: "🏆" },
  { points: 25000, name: "Hall of Fame", icon: "👑" },
  { points: 50000, name: "Founding Pillar", icon: "💎" },
];

interface MilestoneProgressProps {
  totalPoints: number;
  className?: string;
  compact?: boolean;
}

export function MilestoneProgress({ totalPoints, className, compact = false }: MilestoneProgressProps) {
  const { currentMilestone, nextMilestone, progress, completedCount } = useMemo(() => {
    let current = null;
    let next = MILESTONES[0];
    
    for (let i = 0; i < MILESTONES.length; i++) {
      if (totalPoints >= MILESTONES[i].points) {
        current = MILESTONES[i];
        next = MILESTONES[i + 1] || null;
      } else {
        break;
      }
    }
    
    const progressValue = next 
      ? ((totalPoints - (current?.points || 0)) / (next.points - (current?.points || 0))) * 100
      : 100;
    
    const completed = MILESTONES.filter(m => totalPoints >= m.points).length;
    
    return { 
      currentMilestone: current, 
      nextMilestone: next, 
      progress: Math.min(progressValue, 100),
      completedCount: completed
    };
  }, [totalPoints]);

  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {currentMilestone ? currentMilestone.icon : "🎯"} {currentMilestone?.name || "Getting Started"}
          </span>
          {nextMilestone && (
            <span className="text-muted-foreground">
              {nextMilestone.icon} {nextMilestone.points.toLocaleString()} XP
            </span>
          )}
        </div>
        <Progress value={progress} className="h-1.5" />
        {nextMilestone && (
          <p className="text-[10px] text-muted-foreground text-center">
            {(nextMilestone.points - totalPoints).toLocaleString()} XP to {nextMilestone.name}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h4 className="font-mono text-sm uppercase tracking-wider text-muted-foreground">
          Milestones
        </h4>
        <span className="text-xs text-muted-foreground">
          {completedCount}/{MILESTONES.length} unlocked
        </span>
      </div>
      
      <div className="relative">
        {/* Progress bar background */}
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-purple-500 to-amber-500 transition-all duration-500"
            style={{ width: `${(completedCount / MILESTONES.length) * 100}%` }}
          />
        </div>
        
        {/* Milestone markers */}
        <div className="absolute -top-1 left-0 right-0 flex justify-between">
          {MILESTONES.map((milestone, idx) => {
            const isCompleted = totalPoints >= milestone.points;
            const position = (idx / (MILESTONES.length - 1)) * 100;
            
            return (
              <div
                key={milestone.points}
                className="relative group"
                style={{ position: 'absolute', left: `${position}%`, transform: 'translateX(-50%)' }}
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] transition-all",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-muted-foreground/30"
                  )}
                >
                  {isCompleted && "✓"}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-popover border border-border rounded px-2 py-1 shadow-lg whitespace-nowrap">
                    <div className="text-xs font-medium flex items-center gap-1">
                      <span>{milestone.icon}</span>
                      <span>{milestone.name}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {milestone.points.toLocaleString()} XP
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next milestone info */}
      {nextMilestone ? (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{nextMilestone.icon}</span>
            <div>
              <p className="font-medium text-sm">{nextMilestone.name}</p>
              <p className="text-xs text-muted-foreground">Next milestone</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-bold text-primary">
              {(nextMilestone.points - totalPoints).toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">XP remaining</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center p-4 bg-gradient-to-r from-amber-500/10 to-purple-500/10 rounded-lg border border-amber-500/30">
          <div className="text-center">
            <span className="text-3xl">💎</span>
            <p className="font-medium text-sm mt-2">All Milestones Complete!</p>
            <p className="text-xs text-muted-foreground">You've reached legendary status</p>
          </div>
        </div>
      )}
    </div>
  );
}
