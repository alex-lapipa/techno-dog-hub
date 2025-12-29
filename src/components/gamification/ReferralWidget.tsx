import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, Check, Gift, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SocialShareButtons } from '@/components/social/SocialShareButtons';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalXpEarned: number;
}

interface ReferralWidgetProps {
  profileId: string;
  compact?: boolean;
}

const SHARE_TEXT = "Join the techno.dog community - the global techno knowledge base!";

export const ReferralWidget = ({ profileId, compact = false }: ReferralWidgetProps) => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralStats();
  }, [profileId]);

  const loadReferralStats = async () => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('community_profiles')
        .select('referral_code')
        .eq('id', profileId)
        .single();

      if (profileError) throw profileError;

      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('status, xp_awarded')
        .eq('referrer_id', profileId);

      if (referralsError) throw referralsError;

      const pending = referrals?.filter(r => r.status === 'pending').length || 0;
      const completed = referrals?.filter(r => r.status === 'completed').length || 0;
      const xpEarned = completed * 250;

      setStats({
        referralCode: profile?.referral_code || '',
        totalReferrals: referrals?.length || 0,
        pendingReferrals: pending,
        completedReferrals: completed,
        totalXpEarned: xpEarned
      });
    } catch (error) {
      console.error('Error loading referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReferralLink = () => {
    if (!stats?.referralCode) return '';
    return `${window.location.origin}/community?ref=${stats.referralCode}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getReferralLink());
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-8 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  if (compact) {
    return (
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Invite Friends</p>
                <p className="text-xs text-muted-foreground">
                  Earn 250 XP per verified referral
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <SocialShareButtons
            url={getReferralLink()}
            text={SHARE_TEXT}
            size="sm"
            variant="ghost"
            showLabel
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5 text-primary" />
          Referral Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Referral Link */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Your Referral Link
          </label>
          <div className="flex gap-2">
            <Input 
              value={getReferralLink()} 
              readOnly 
              className="bg-background/50 text-sm"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={copyToClipboard}
              className="shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Share via:</span>
          <SocialShareButtons
            url={getReferralLink()}
            text={SHARE_TEXT}
            variant="outline"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="flex items-center justify-center mb-1">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold">{stats.completedReferrals}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold">{stats.pendingReferrals}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
            <div className="flex items-center justify-center mb-1">
              <Gift className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xl font-bold text-primary">{stats.totalXpEarned}</p>
            <p className="text-xs text-muted-foreground">XP Earned</p>
          </div>
        </div>

        {/* Reward Info */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-center">
            <span className="font-semibold text-primary">+250 XP</span>
            <span className="text-muted-foreground"> for each friend who becomes a verified contributor</span>
          </p>
        </div>

        {/* Badge Progress */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Unlock Badges</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={stats.completedReferrals >= 1 ? "default" : "outline"} className="gap-1">
              🤝 1 Referral
            </Badge>
            <Badge variant={stats.completedReferrals >= 5 ? "default" : "outline"} className="gap-1">
              🔗 5 Referrals
            </Badge>
            <Badge variant={stats.completedReferrals >= 10 ? "default" : "outline"} className="gap-1">
              🌟 10 Referrals
            </Badge>
            <Badge variant={stats.completedReferrals >= 25 ? "default" : "outline"} className="gap-1">
              👑 25 Referrals
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
