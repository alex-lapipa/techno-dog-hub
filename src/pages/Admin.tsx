import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, LogOut, FileText, Users, BarChart3, Newspaper, Loader2, Settings, Shield, Image, Brain, Zap, Crown, Bot, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const AdminLoginForm = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(password);

    if (success) {
      toast({
        title: "Welcome back",
        description: "Admin access granted.",
      });
    } else {
      toast({
        title: "Access denied",
        description: "Invalid password.",
        variant: "destructive",
      });
    }

    setPassword("");
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="border border-border bg-card p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 border border-logo-green/50 bg-logo-green/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-logo-green" />
          </div>
        </div>

        <h2 className="font-mono text-xl uppercase tracking-tight text-center mb-2">
          Admin Access
        </h2>
        <p className="font-mono text-xs text-muted-foreground text-center mb-6">
          Enter the admin password to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="font-mono text-center tracking-widest"
            autoFocus
          />
          <Button
            type="submit"
            variant="brutalist"
            className="w-full font-mono uppercase tracking-wider"
            disabled={loading || !password}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Enter"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "Admin session ended.",
    });
    navigate("/");
  };

  const adminTools = [
    {
      title: "AI Control Center",
      description: "Claude + GPT orchestration: Review → Implement → Validate",
      icon: Bot,
      path: "/admin/control-center",
      count: null,
      highlight: true,
    },
    {
      title: "System Health",
      description: "Real-time status of edge functions, DB, and APIs",
      icon: Activity,
      path: "/admin/health",
      count: null,
      highlight: true,
    },
    {
      title: "User & Role Management",
      description: "Manage users, grant/revoke admin roles",
      icon: Crown,
      path: "/admin/users",
      count: null,
    },
    {
      title: "Media Engine",
      description: "Auto Fetch → Verify → Curate → Enrich pipeline",
      icon: Zap,
      path: "/admin/media-engine",
      count: null,
    },
    {
      title: "AI Admin Audit",
      description: "AI-powered analysis of tools, gaps, and recommendations",
      icon: Brain,
      path: "/admin/audit",
      count: null,
    },
    {
      title: "Content Moderation",
      description: "Review photos and corrections from the community",
      icon: Shield,
      path: "/admin/moderation",
      count: null,
    },
    {
      title: "Community Submissions",
      description: "Full submission management with editing",
      icon: FileText,
      path: "/admin/submissions",
      count: null,
    },
    {
      title: "Media Curator",
      description: "Photo retrieval, verification, and management",
      icon: Image,
      path: "/admin/media",
      count: null,
    },
    {
      title: "DJ Artists Database",
      description: "Manage and upload DJ artist data",
      icon: Users,
      path: "/admin/dj-artists",
      count: null,
    },
    {
      title: "News Agent",
      description: "AI news generation and article management",
      icon: Newspaper,
      path: "/admin/news-agent",
      count: null,
    },
    {
      title: "Analytics",
      description: "Site usage and performance metrics",
      icon: BarChart3,
      path: "/analytics",
      count: null,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with logout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">
            // Control Panel
          </div>
          <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-tight">
            Admin Dashboard
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="font-mono text-xs uppercase tracking-wider"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Admin Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {adminTools.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className={`group border bg-card p-6 transition-all duration-300 ${
              tool.highlight 
                ? 'border-crimson/50 hover:border-crimson hover:bg-crimson/10' 
                : 'border-border hover:border-logo-green/50 hover:bg-card/80'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 border bg-muted/50 flex items-center justify-center transition-colors ${
                tool.highlight
                  ? 'border-crimson/50 group-hover:border-crimson group-hover:bg-crimson/20'
                  : 'border-muted group-hover:border-logo-green/50 group-hover:bg-logo-green/10'
              }`}>
                <tool.icon className={`w-6 h-6 transition-colors ${
                  tool.highlight
                    ? 'text-crimson'
                    : 'text-muted-foreground group-hover:text-logo-green'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-mono text-sm uppercase tracking-tight transition-colors ${
                  tool.highlight
                    ? 'text-crimson'
                    : 'group-hover:text-logo-green'
                }`}>
                  {tool.title}
                </h3>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  {tool.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Quick Info
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border border-border/50">
            <div className="font-mono text-2xl text-logo-green">●</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase mt-1">
              System Online
            </div>
          </div>
          <div className="text-center p-4 border border-border/50">
            <div className="font-mono text-xs text-muted-foreground">
              Session active for 24h
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-xs text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Admin"
        description="techno.dog administration panel"
        path="/admin"
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            {isAdmin ? <AdminDashboard /> : <AdminLoginForm />}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Admin;
