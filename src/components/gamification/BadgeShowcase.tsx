import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface BadgeData {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  points_value: number;
}

interface UserBadge extends BadgeData {
  awarded_at: string;
}

interface BadgeShowcaseProps {
  profileId: string;
}

const rarityOrder = ["common", "rare", "epic", "legendary"];

const rarityStyles: Record<string, string> = {
  common: "bg-muted border-border",
  rare: "bg-blue-500/10 border-blue-500/30",
  epic: "bg-purple-500/10 border-purple-500/30",
  legendary: "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/50",
};

export function BadgeShowcase({ profileId }: BadgeShowcaseProps) {
  const [allBadges, setAllBadges] = useState<BadgeData[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      const [badgesRes, userBadgesRes] = await Promise.all([
        supabase.from("badges").select("*").eq("is_active", true),
        supabase
          .from("user_badges")
          .select("badge_id, awarded_at, badges(*)")
          .eq("profile_id", profileId),
      ]);

      if (badgesRes.data) {
        setAllBadges(badgesRes.data);
      }
      if (userBadgesRes.data) {
        const mapped = userBadgesRes.data
          .filter((ub) => ub.badges)
          .map((ub) => ({
            ...(ub.badges as unknown as BadgeData),
            awarded_at: ub.awarded_at,
          }));
        setUserBadges(mapped);
      }
      setLoading(false);
    };

    loadBadges();
  }, [profileId]);

  const earnedSlugs = new Set(userBadges.map((b) => b.slug));
  const categories = [...new Set(allBadges.map((b) => b.category))];

  const BadgeCard = ({ badge, earned, awardedAt }: { 
    badge: BadgeData; 
    earned: boolean; 
    awardedAt?: string;
  }) => (
    <div
      className={cn(
        "relative p-4 rounded-lg border transition-all",
        earned ? rarityStyles[badge.rarity] : "bg-muted/30 border-border/50 opacity-60",
        earned && "hover:scale-[1.02]"
      )}
    >
      {!earned && (
        <div className="absolute top-2 right-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <div className="text-center">
        <div className={cn(
          "text-3xl mb-2",
          !earned && "grayscale"
        )}>
          {badge.icon}
        </div>
        <h3 className="font-semibold text-sm">{badge.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {badge.description}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-[10px] capitalize">
            {badge.rarity}
          </Badge>
          {badge.points_value > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              +{badge.points_value} XP
            </Badge>
          )}
        </div>
        {earned && awardedAt && (
          <p className="text-[10px] text-muted-foreground mt-2">
            Earned {formatDistanceToNow(new Date(awardedAt), { addSuffix: true })}
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Badge Collection
        </CardTitle>
        <CardDescription>
          {userBadges.length} of {allBadges.length} badges earned
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="capitalize text-xs">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => {
            const catBadges = allBadges
              .filter((b) => b.category === cat)
              .sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));

            return (
              <TabsContent key={cat} value={cat}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {catBadges.map((badge) => {
                    const userBadge = userBadges.find((ub) => ub.slug === badge.slug);
                    return (
                      <BadgeCard
                        key={badge.id}
                        badge={badge}
                        earned={earnedSlugs.has(badge.slug)}
                        awardedAt={userBadge?.awarded_at}
                      />
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
