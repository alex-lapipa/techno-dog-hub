import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface BadgeData {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  awarded_at?: string;
}

interface BadgeDisplayProps {
  badges: BadgeData[];
  size?: "sm" | "md" | "lg";
  maxDisplay?: number;
  showTooltips?: boolean;
}

const rarityColors: Record<string, string> = {
  common: "bg-muted border-border text-muted-foreground",
  rare: "bg-blue-500/20 border-blue-500/50 text-blue-400",
  epic: "bg-purple-500/20 border-purple-500/50 text-purple-400",
  legendary: "bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-amber-500/50 text-amber-400",
};

const sizeClasses: Record<string, string> = {
  sm: "text-sm px-1.5 py-0.5",
  md: "text-base px-2 py-1",
  lg: "text-lg px-3 py-1.5",
};

export function BadgeDisplay({ 
  badges, 
  size = "sm", 
  maxDisplay = 5,
  showTooltips = true 
}: BadgeDisplayProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  if (badges.length === 0) return null;

  const BadgeItem = ({ badge }: { badge: BadgeData }) => {
    const content = (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border font-mono transition-transform hover:scale-105",
          rarityColors[badge.rarity] || rarityColors.common,
          sizeClasses[size]
        )}
      >
        <span>{badge.icon}</span>
        {size !== "sm" && <span>{badge.name}</span>}
      </span>
    );

    if (!showTooltips) return content;

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold flex items-center gap-2">
                {badge.icon} {badge.name}
              </p>
              <p className="text-xs text-muted-foreground">{badge.description}</p>
              <Badge variant="outline" className="text-[10px] capitalize">
                {badge.rarity}
              </Badge>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {displayBadges.map((badge) => (
        <BadgeItem key={badge.id} badge={badge} />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-muted-foreground font-mono">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
