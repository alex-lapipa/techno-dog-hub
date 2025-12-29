import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Award, Plus, Edit2, Gift, Users, TrendingUp, Trophy, 
  Loader2, Search, Star, Zap, Target, Crown
} from "lucide-react";

interface BadgeData {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  points_value: number;
  is_active: boolean;
  created_at: string;
}

interface UserBadgeData {
  id: string;
  awarded_at: string;
  awarded_reason: string | null;
  badge: BadgeData;
  profile: {
    id: string;
    display_name: string | null;
    email: string;
    total_points: number;
    current_level: number;
  };
}

interface ProfileData {
  id: string;
  display_name: string | null;
  email: string;
  total_points: number;
  current_level: number;
}

interface GamificationStats {
  totalBadges: number;
  activeBadges: number;
  totalAwarded: number;
  uniqueRecipients: number;
  totalPoints: number;
  avgPointsPerUser: number;
  topBadges: { name: string; count: number }[];
  recentAwards: UserBadgeData[];
}

const RARITY_COLORS: Record<string, string> = {
  common: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  uncommon: "bg-logo-green/20 text-logo-green border-logo-green/30",
  rare: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  epic: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  legendary: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  contribution: <Star className="w-3 h-3" />,
  engagement: <Zap className="w-3 h-3" />,
  milestone: <Target className="w-3 h-3" />,
  special: <Crown className="w-3 h-3" />,
};

const BadgeAdmin = () => {
  const { isAdmin } = useAdminAuth();
  const { toast } = useToast();

  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAwardDialogOpen, setIsAwardDialogOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [awardReason, setAwardReason] = useState("");
  const [awarding, setAwarding] = useState(false);

  // Form state for badge editing
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "",
    category: "contribution",
    rarity: "common",
    points_value: 0,
    is_active: true,
  });

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load badges
      const { data: badgesData, error: badgesError } = await supabase
        .from("badges")
        .select("*")
        .order("category", { ascending: true })
        .order("rarity", { ascending: true });

      if (badgesError) throw badgesError;
      setBadges(badgesData || []);

      // Load profiles for awarding
      const { data: profilesData, error: profilesError } = await supabase
        .from("community_profiles")
        .select("id, display_name, email, total_points, current_level")
        .order("total_points", { ascending: false })
        .limit(100);

      if (profilesError) throw profilesError;
      setProfiles(profilesData || []);

      // Load statistics
      await loadStats(badgesData || []);
    } catch (err) {
      console.error("Error loading data:", err);
      toast({
        title: "Error loading data",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (badgesData: BadgeData[]) => {
    try {
      // Get user badges with related data
      const { data: userBadges, error: ubError } = await supabase
        .from("user_badges")
        .select(`
          id, awarded_at, awarded_reason,
          badge:badges(id, slug, name, description, icon, category, rarity, points_value, is_active, created_at),
          profile:community_profiles(id, display_name, email, total_points, current_level)
        `)
        .order("awarded_at", { ascending: false })
        .limit(50);

      if (ubError) throw ubError;

      // Get aggregated stats
      const { data: profileStats, error: psError } = await supabase
        .from("community_profiles")
        .select("total_points");

      if (psError) throw psError;

      const totalPoints = profileStats?.reduce((sum, p) => sum + (p.total_points || 0), 0) || 0;
      const avgPoints = profileStats?.length ? Math.round(totalPoints / profileStats.length) : 0;

      // Count badge awards
      const badgeCounts: Record<string, number> = {};
      const uniqueProfiles = new Set<string>();

      userBadges?.forEach((ub) => {
        const badge = ub.badge as unknown as BadgeData;
        const profile = ub.profile as unknown as ProfileData;
        if (badge?.name) {
          badgeCounts[badge.name] = (badgeCounts[badge.name] || 0) + 1;
        }
        if (profile?.id) {
          uniqueProfiles.add(profile.id);
        }
      });

      const topBadges = Object.entries(badgeCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalBadges: badgesData.length,
        activeBadges: badgesData.filter((b) => b.is_active).length,
        totalAwarded: userBadges?.length || 0,
        uniqueRecipients: uniqueProfiles.size,
        totalPoints,
        avgPointsPerUser: avgPoints,
        topBadges,
        recentAwards: (userBadges || []).slice(0, 10) as unknown as UserBadgeData[],
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const handleSaveBadge = async () => {
    try {
      if (selectedBadge) {
        // Update existing
        const { error } = await supabase
          .from("badges")
          .update({
            name: editForm.name,
            slug: editForm.slug,
            description: editForm.description,
            icon: editForm.icon,
            category: editForm.category,
            rarity: editForm.rarity,
            points_value: editForm.points_value,
            is_active: editForm.is_active,
          })
          .eq("id", selectedBadge.id);

        if (error) throw error;
        toast({ title: "Badge updated" });
      } else {
        // Create new
        const { error } = await supabase.from("badges").insert({
          name: editForm.name,
          slug: editForm.slug,
          description: editForm.description,
          icon: editForm.icon,
          category: editForm.category,
          rarity: editForm.rarity,
          points_value: editForm.points_value,
          is_active: editForm.is_active,
        });

        if (error) throw error;
        toast({ title: "Badge created" });
      }

      setIsEditDialogOpen(false);
      loadData();
    } catch (err) {
      toast({
        title: "Error saving badge",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleAwardBadge = async () => {
    if (!selectedBadge || !selectedProfileId) return;

    setAwarding(true);
    try {
      const { data, error } = await supabase.rpc("award_badge", {
        p_profile_id: selectedProfileId,
        p_badge_slug: selectedBadge.slug,
        p_reason: awardReason || `Manually awarded by admin`,
      });

      if (error) throw error;

      if (data === false) {
        toast({
          title: "Badge already awarded",
          description: "This user already has this badge.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Badge awarded!",
          description: `${selectedBadge.name} awarded successfully.`,
        });
        setIsAwardDialogOpen(false);
        setSelectedProfileId("");
        setAwardReason("");
        loadData();
      }
    } catch (err) {
      toast({
        title: "Error awarding badge",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setAwarding(false);
    }
  };

  const openEditDialog = (badge?: BadgeData) => {
    if (badge) {
      setSelectedBadge(badge);
      setEditForm({
        name: badge.name,
        slug: badge.slug,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        rarity: badge.rarity,
        points_value: badge.points_value,
        is_active: badge.is_active,
      });
    } else {
      setSelectedBadge(null);
      setEditForm({
        name: "",
        slug: "",
        description: "",
        icon: "🏆",
        category: "contribution",
        rarity: "common",
        points_value: 10,
        is_active: true,
      });
    }
    setIsEditDialogOpen(true);
  };

  const openAwardDialog = (badge: BadgeData) => {
    setSelectedBadge(badge);
    setIsAwardDialogOpen(true);
  };

  const toggleBadgeActive = async (badge: BadgeData) => {
    try {
      const { error } = await supabase
        .from("badges")
        .update({ is_active: !badge.is_active })
        .eq("id", badge.id);

      if (error) throw error;
      loadData();
      toast({ title: badge.is_active ? "Badge deactivated" : "Badge activated" });
    } catch (err) {
      toast({
        title: "Error updating badge",
        variant: "destructive",
      });
    }
  };

  const filteredBadges = badges.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminPageLayout
      title="Badge Management"
      description="Manage gamification badges and awards"
      icon={Award}
      iconColor="text-amber-500"
      onRefresh={loadData}
      isLoading={loading}
      actions={
        <Button onClick={() => openEditDialog()} className="font-mono text-xs uppercase">
          <Plus className="w-4 h-4 mr-2" />
          New Badge
        </Button>
      }
    >
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="font-mono">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="badges">All Badges</TabsTrigger>
          <TabsTrigger value="awards">Recent Awards</TabsTrigger>
        </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-zinc-900/50 border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/20 rounded">
                          <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-mono text-2xl font-bold">{stats?.totalBadges || 0}</p>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase">
                            Total Badges
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/50 border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-logo-green/20 rounded">
                          <Gift className="w-5 h-5 text-logo-green" />
                        </div>
                        <div>
                          <p className="font-mono text-2xl font-bold">{stats?.totalAwarded || 0}</p>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase">
                            Badges Awarded
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/50 border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded">
                          <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-mono text-2xl font-bold">{stats?.uniqueRecipients || 0}</p>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase">
                            Recipients
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/50 border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded">
                          <TrendingUp className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-mono text-2xl font-bold">
                            {stats?.avgPointsPerUser?.toLocaleString() || 0}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase">
                            Avg Points/User
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Badges & Recent Awards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-zinc-900/50 border-border">
                    <CardHeader>
                      <CardTitle className="font-mono text-sm uppercase tracking-wider">
                        Most Awarded Badges
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats?.topBadges && stats.topBadges.length > 0 ? (
                        <div className="space-y-3">
                          {stats.topBadges.map((badge, idx) => (
                            <div key={badge.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs text-muted-foreground w-5">
                                  #{idx + 1}
                                </span>
                                <span className="font-mono text-sm">{badge.name}</span>
                              </div>
                              <Badge variant="outline" className="font-mono text-xs">
                                {badge.count} awarded
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="font-mono text-sm text-muted-foreground">No badges awarded yet</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900/50 border-border">
                    <CardHeader>
                      <CardTitle className="font-mono text-sm uppercase tracking-wider">
                        Recent Awards
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stats?.recentAwards && stats.recentAwards.length > 0 ? (
                        <div className="space-y-3">
                          {stats.recentAwards.slice(0, 5).map((award) => (
                            <div key={award.id} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{award.badge?.icon}</span>
                                <div>
                                  <p className="font-mono text-sm">{award.badge?.name}</p>
                                  <p className="font-mono text-[10px] text-muted-foreground">
                                    → {award.profile?.display_name || award.profile?.email?.split("@")[0]}
                                  </p>
                                </div>
                              </div>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {new Date(award.awarded_at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="font-mono text-sm text-muted-foreground">No recent awards</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* All Badges Tab */}
              <TabsContent value="badges" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search badges..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBadges.map((badge) => (
                    <Card
                      key={badge.id}
                      className={`bg-zinc-900/50 border-border ${!badge.is_active ? "opacity-50" : ""}`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{badge.icon}</span>
                            <div>
                              <h3 className="font-mono text-sm font-bold">{badge.name}</h3>
                              <p className="font-mono text-[10px] text-muted-foreground">
                                {badge.slug}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={badge.is_active}
                            onCheckedChange={() => toggleBadgeActive(badge)}
                          />
                        </div>

                        <p className="font-mono text-xs text-muted-foreground mb-4 line-clamp-2">
                          {badge.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge
                            variant="outline"
                            className={`font-mono text-[10px] ${RARITY_COLORS[badge.rarity]}`}
                          >
                            {badge.rarity}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {CATEGORY_ICONS[badge.category]} {badge.category}
                          </Badge>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            +{badge.points_value} pts
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(badge)}
                            className="flex-1 font-mono text-xs"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAwardDialog(badge)}
                            className="flex-1 font-mono text-xs"
                            disabled={!badge.is_active}
                          >
                            <Gift className="w-3 h-3 mr-1" />
                            Award
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Recent Awards Tab */}
              <TabsContent value="awards">
                <Card className="bg-zinc-900/50 border-border">
                  <CardContent className="pt-6">
                    {stats?.recentAwards && stats.recentAwards.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentAwards.map((award) => (
                          <div
                            key={award.id}
                            className="flex items-center justify-between p-3 bg-background/50 border border-border rounded"
                          >
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{award.badge?.icon}</span>
                              <div>
                                <p className="font-mono text-sm font-bold">{award.badge?.name}</p>
                                <p className="font-mono text-xs text-muted-foreground">
                                  Awarded to:{" "}
                                  {award.profile?.display_name || award.profile?.email}
                                </p>
                                {award.awarded_reason && (
                                  <p className="font-mono text-[10px] text-muted-foreground mt-1">
                                    Reason: {award.awarded_reason}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={RARITY_COLORS[award.badge?.rarity || "common"]}>
                                {award.badge?.rarity}
                              </Badge>
                              <p className="font-mono text-[10px] text-muted-foreground mt-1">
                                {new Date(award.awarded_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="font-mono text-sm text-muted-foreground text-center py-8">
                        No badges have been awarded yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase">
              {selectedBadge ? "Edit Badge" : "Create New Badge"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs text-muted-foreground block mb-1">Name</label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-muted-foreground block mb-1">Slug</label>
                <Input
                  value={editForm.slug}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  className="font-mono"
                  placeholder="unique-slug"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-xs text-muted-foreground block mb-1">
                Description
              </label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="font-mono text-sm"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-mono text-xs text-muted-foreground block mb-1">Icon</label>
                <Input
                  value={editForm.icon}
                  onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                  className="font-mono text-center text-xl"
                />
              </div>
              <div>
                <label className="font-mono text-xs text-muted-foreground block mb-1">
                  Category
                </label>
                <Select
                  value={editForm.category}
                  onValueChange={(v) => setEditForm({ ...editForm, category: v })}
                >
                  <SelectTrigger className="font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contribution">Contribution</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="milestone">Milestone</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-mono text-xs text-muted-foreground block mb-1">Rarity</label>
                <Select
                  value={editForm.rarity}
                  onValueChange={(v) => setEditForm({ ...editForm, rarity: v })}
                >
                  <SelectTrigger className="font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="uncommon">Uncommon</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-xs text-muted-foreground block mb-1">
                  Points Value
                </label>
                <Input
                  type="number"
                  value={editForm.points_value}
                  onChange={(e) =>
                    setEditForm({ ...editForm, points_value: parseInt(e.target.value) || 0 })
                  }
                  className="font-mono"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={editForm.is_active}
                  onCheckedChange={(v) => setEditForm({ ...editForm, is_active: v })}
                />
                <label className="font-mono text-xs">Active</label>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 font-mono"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveBadge}
                className="flex-1 font-mono"
                disabled={!editForm.name || !editForm.slug}
              >
                {selectedBadge ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Award Badge Dialog */}
      <Dialog open={isAwardDialogOpen} onOpenChange={setIsAwardDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              Award Badge
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBadge && (
              <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-border rounded">
                <span className="text-3xl">{selectedBadge.icon}</span>
                <div>
                  <p className="font-mono text-sm font-bold">{selectedBadge.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    +{selectedBadge.points_value} points
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="font-mono text-xs text-muted-foreground block mb-1">
                Select User
              </label>
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger className="font-mono">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <span className="font-mono text-sm">
                        {profile.display_name || profile.email.split("@")[0]}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground ml-2">
                        (Lvl {profile.current_level})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="font-mono text-xs text-muted-foreground block mb-1">
                Reason (optional)
              </label>
              <Input
                value={awardReason}
                onChange={(e) => setAwardReason(e.target.value)}
                className="font-mono"
                placeholder="e.g., Outstanding contribution"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAwardDialogOpen(false);
                  setSelectedProfileId("");
                  setAwardReason("");
                }}
                className="flex-1 font-mono"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAwardBadge}
                className="flex-1 font-mono"
                disabled={!selectedProfileId || awarding}
              >
                {awarding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Awarding...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Award Badge
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminPageLayout>
  );
};

export default BadgeAdmin;
