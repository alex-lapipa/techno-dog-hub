import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ReferralWidget } from "@/components/gamification";
import { 
  Mail, 
  CheckCircle2, 
  Camera, 
  Key, 
  Newspaper, 
  Users, 
  Shield,
  Loader2,
  LogOut,
  User,
  BookOpen,
  Trophy,
  Copy,
  Share2,
  Gift
} from "lucide-react";

const Community = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
  
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState<{
    id: string;
    status: string;
    roles: string[];
    display_name: string | null;
    trust_score: number;
    referral_code: string | null;
  } | null>(null);
  const [justVerified, setJustVerified] = useState(false);

  // Check for verification callback
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setJustVerified(true);
      toast({
        title: "Email Verified",
        description: "Welcome to the techno.dog community!",
      });
    }
  }, [searchParams, toast]);

  // Load community profile for logged-in users
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.email) return;
      
      const { data } = await supabase
        .from("community_profiles")
        .select("id, status, roles, display_name, trust_score, referral_code")
        .eq("email", user.email)
        .maybeSingle();
      
      if (data) {
        setProfile(data);
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Check for referral code in URL
      const refCode = searchParams.get("ref");
      
      const { data, error } = await supabase.functions.invoke("community-signup", {
        body: {
          email,
          source: "community_page",
          newsletter_opt_in: newsletterOptIn,
          display_name: displayName || undefined,
          referral_code: refCode || undefined,
        },
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Check your email",
        description: data.message,
      });
    } catch (err) {
      console.error("Signup error:", err);
      toast({
        title: "Signup failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setProfile(null);
    setJustVerified(false);
    navigate("/community");
  };

  const copyReferralLink = () => {
    if (profile?.referral_code) {
      const link = `${window.location.origin}/community?ref=${profile.referral_code}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Link copied!",
        description: "Share it with friends to earn 250 XP per verified referral",
      });
    }
  };

  return (
    <>
      <PageSEO
        title="Community | Join the techno.dog Pack"
        description="Join the techno.dog community. Upload photos, get API access, and connect with techno enthusiasts worldwide."
        path="/community"
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12 pt-24">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join the Community
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              techno.dog is free to read and free to use. Join our community to upload photos, 
              submit corrections, and get API access.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-border/50">
              <CardHeader>
                <Camera className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Upload Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Share photos from festivals, artists, and venues. Help build the archive.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <Key className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">API Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Verified members can request API keys to build apps with our data.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <Newspaper className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Newsletter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Get curated updates on techno news, new releases, and community highlights.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="max-w-md mx-auto">
            {authLoading ? (
              <Card className="border-primary/20">
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                </CardContent>
              </Card>
            ) : user && profile ? (
              /* Verified User Dashboard */
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {profile.display_name || user.email}
                        {profile.status === "verified" && (
                          <Badge variant="outline" className="text-green-500 border-green-500/50">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Just Verified - Referral CTA */}
                  {justVerified && profile.referral_code && (
                    <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/30 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Gift className="h-5 w-5" />
                        <span className="font-semibold">Welcome to the community!</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Invite friends to join techno.dog and earn <span className="text-primary font-medium">250 XP</span> for each verified referral.
                      </p>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-background/50 border border-border rounded px-3 py-2 font-mono text-xs truncate">
                          {`${window.location.origin}/community?ref=${profile.referral_code}`}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={copyReferralLink}
                          className="shrink-0"
                          title="Copy link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Social Share Buttons */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Share via:</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            title="Share on Twitter/X"
                            onClick={() => {
                              const text = encodeURIComponent("Join the techno.dog community - the global techno knowledge base!");
                              const url = encodeURIComponent(`${window.location.origin}/community?ref=${profile.referral_code}`);
                              window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
                            }}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            title="Share on WhatsApp"
                            onClick={() => {
                              const text = encodeURIComponent(`Join the techno.dog community - the global techno knowledge base! ${window.location.origin}/community?ref=${profile.referral_code}`);
                              window.open(`https://wa.me/?text=${text}`, "_blank");
                            }}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            title="Share on Telegram"
                            onClick={() => {
                              const text = encodeURIComponent("Join the techno.dog community - the global techno knowledge base!");
                              const url = encodeURIComponent(`${window.location.origin}/community?ref=${profile.referral_code}`);
                              window.open(`https://t.me/share/url?url=${url}&text=${text}`, "_blank");
                            }}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                            </svg>
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => setJustVerified(false)}
                      >
                        Got it, show me my dashboard
                      </Button>
                    </div>
                  )}

                  {!justVerified && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Trust Score</span>
                        <Badge variant="secondary">{profile.trust_score}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Roles</span>
                        <div className="flex gap-1">
                          {profile.roles.map((role) => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {/* Referral Widget */}
                      <div className="pt-4 border-t border-border">
                        <ReferralWidget profileId={profile.id} compact />
                      </div>

                      <div className="pt-4 space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => navigate("/my-submissions")}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          My Submissions
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => navigate("/developer")}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          API Keys
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => navigate("/community/docs")}
                        >
                          <BookOpen className="h-4 w-4 mr-2" />
                          Community Docs
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => navigate("/community/leaderboard")}
                        >
                          <Trophy className="h-4 w-4 mr-2" />
                          Leaderboard
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-muted-foreground"
                          onClick={handleSignOut}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : submitted ? (
              /* Pending Verification */
              <Card className="border-primary/20">
                <CardHeader className="text-center">
                  <Mail className="h-12 w-12 text-primary mx-auto mb-2" />
                  <CardTitle>Check Your Email</CardTitle>
                  <CardDescription>
                    We sent a magic link to <strong>{email}</strong>. 
                    Click it to verify your email and complete your signup.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => setSubmitted(false)}
                  >
                    Use a different email
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Signup Form */
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle>Join techno.dog</CardTitle>
                  </div>
                  <CardDescription>
                    Just your email. No password required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name (optional)</Label>
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="DJ Handle or Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={newsletterOptIn}
                        onCheckedChange={(checked) => setNewsletterOptIn(!!checked)}
                        disabled={loading}
                      />
                      <Label htmlFor="newsletter" className="text-sm text-muted-foreground">
                        Subscribe to newsletter (curated techno updates)
                      </Label>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending magic link...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Get Magic Link
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      <Shield className="h-3 w-3 inline mr-1" />
                      We never share your email. Passwordless login via magic link.
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Community;
