import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
      <Helmet>
        <title>Community | techno.dog</title>
        <meta name="description" content="Join the techno.dog community. Upload photos, get API access, and connect with techno enthusiasts worldwide." />
      </Helmet>
      
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
                        <div className="flex-1 bg-background/50 border border-border rounded px-3 py-2 font-mono text-sm truncate">
                          {`${window.location.origin}/community?ref=${profile.referral_code}`}
                        </div>
                        <Button 
                          size="sm" 
                          onClick={copyReferralLink}
                          className="shrink-0"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
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
