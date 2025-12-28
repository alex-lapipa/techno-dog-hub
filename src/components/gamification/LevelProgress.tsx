import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface LevelData {
  level_number: number;
  name: string;
  min_points: number;
  icon: string;
  color: string;
  perks: string[];
}

interface LevelProgressProps {
  currentLevel: LevelData;
  nextLevel?: LevelData;
  currentPoints: number;
  compact?: boolean;
}

export function LevelProgress({ 
  currentLevel, 
  nextLevel, 
  currentPoints,
  compact = false
}: LevelProgressProps) {
  const pointsInLevel = currentPoints - currentLevel.min_points;
  const pointsNeeded = nextLevel 
    ? nextLevel.min_points - currentLevel.min_points 
    : 100;
  const progress = nextLevel 
    ? Math.min((pointsInLevel / pointsNeeded) * 100, 100) 
    : 100;

  if (compact) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-mono cursor-help"
              style={{ backgroundColor: `${currentLevel.color}20`, color: currentLevel.color }}
            >
              <span>{currentLevel.icon}</span>
              <span>Lv.{currentLevel.level_number}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">{currentLevel.icon} {currentLevel.name}</p>
              <Progress value={progress} className="h-1.5" />
              {nextLevel && (
                <p className="text-xs text-muted-foreground">
                  {pointsInLevel} / {pointsNeeded} XP to {nextLevel.name}
                </p>
              )}
              {!nextLevel && (
                <p className="text-xs text-amber-400">Max level reached!</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span 
            className="text-2xl p-2 rounded-lg"
            style={{ backgroundColor: `${currentLevel.color}20` }}
          >
            {currentLevel.icon}
          </span>
          <div>
            <p className="font-semibold text-sm">{currentLevel.name}</p>
            <p className="text-xs text-muted-foreground font-mono">
              Level {currentLevel.level_number}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold" style={{ color: currentLevel.color }}>
            {currentPoints.toLocaleString()} XP
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <Progress 
          value={progress} 
          className="h-2"
          style={{ 
            '--progress-background': `${currentLevel.color}30`,
            '--progress-foreground': currentLevel.color 
          } as React.CSSProperties}
        />
        <div className="flex justify-between text-xs text-muted-foreground font-mono">
          {nextLevel ? (
            <>
              <span>{pointsInLevel} / {pointsNeeded} XP</span>
              <span>Next: {nextLevel.icon} {nextLevel.name}</span>
            </>
          ) : (
            <span className="text-amber-400">🏆 Maximum level achieved!</span>
          )}
        </div>
      </div>

      {currentLevel.perks.length > 0 && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Perks:</p>
          <div className="flex flex-wrap gap-1">
            {currentLevel.perks.map((perk, i) => (
              <span 
                key={i}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
              >
                ✓ {perk}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
