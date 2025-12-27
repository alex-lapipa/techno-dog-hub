import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Trophy, 
  Medal, 
  Star, 
  Users, 
  TrendingUp,
  CheckCircle2,
  Camera,
  FileText,
  ArrowLeft
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  email: string;
  trust_score: number;
  roles: string[];
  approved_count: number;
  city: string | null;
  country: string | null;
}

const CommunityLeaderboard = () => {
  const { language } = useLanguage();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalContributors: 0,
    totalApproved: 0,
    topScore: 0,
  });

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        // Get verified community profiles with trust scores
        const { data: profiles, error: profilesError } = await supabase
          .from("community_profiles")
          .select("id, display_name, email, trust_score, roles, city, country")
          .eq("status", "verified")
          .gt("trust_score", 0)
          .order("trust_score", { ascending: false })
          .limit(50);

        if (profilesError) throw profilesError;

        // Get approved submission counts per email
        const { data: submissions, error: submissionsError } = await supabase
          .from("community_submissions")
          .select("email")
          .eq("status", "approved");

        if (submissionsError) throw submissionsError;

        // Count submissions per email
        const submissionCounts: Record<string, number> = {};
        submissions?.forEach((sub) => {
          if (sub.email) {
            submissionCounts[sub.email] = (submissionCounts[sub.email] || 0) + 1;
          }
        });

        // Merge data
        const leaderboardData: LeaderboardEntry[] = (profiles || []).map((profile) => ({
          ...profile,
          approved_count: submissionCounts[profile.email] || 0,
        }));

        // Sort by combined score (trust_score * 2 + approved_count)
        leaderboardData.sort((a, b) => {
          const scoreA = a.trust_score * 2 + a.approved_count;
          const scoreB = b.trust_score * 2 + b.approved_count;
          return scoreB - scoreA;
        });

        setLeaders(leaderboardData.slice(0, 25));

        // Calculate stats
        setStats({
          totalContributors: profiles?.length || 0,
          totalApproved: submissions?.length || 0,
          topScore: profiles?.[0]?.trust_score || 0,
        });
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="font-mono text-lg text-muted-foreground w-6 text-center">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 border-yellow-500/30";
      case 2:
        return "bg-gray-400/10 border-gray-400/30";
      case 3:
        return "bg-amber-600/10 border-amber-600/30";
      default:
        return "bg-card border-border/50";
    }
  };

  const getDisplayName = (entry: LeaderboardEntry) => {
    if (entry.display_name) return entry.display_name;
    // Mask email: show first 2 chars + *** + domain
    const [local, domain] = entry.email.split("@");
    return `${local.slice(0, 2)}***@${domain}`;
  };

  const content = {
    en: {
      title: "Community Leaderboard",
      subtitle: "Top contributors to the techno.dog knowledge base",
      backToComm: "Back to Community",
      stats: {
        contributors: "Active Contributors",
        approved: "Approved Submissions",
        topScore: "Highest Trust Score",
      },
      columns: {
        rank: "Rank",
        contributor: "Contributor",
        trustScore: "Trust Score",
        approved: "Approved",
        location: "Location",
      },
      empty: "No contributors yet. Be the first!",
    },
    es: {
      title: "Tabla de Líderes",
      subtitle: "Principales contribuyentes a la base de conocimiento de techno.dog",
      backToComm: "Volver a Comunidad",
      stats: {
        contributors: "Contribuyentes Activos",
        approved: "Envíos Aprobados",
        topScore: "Puntuación Más Alta",
      },
      columns: {
        rank: "Rango",
        contributor: "Contribuyente",
        trustScore: "Confianza",
        approved: "Aprobados",
        location: "Ubicación",
      },
      empty: "Sin contribuyentes aún. ¡Sé el primero!",
    },
  };

  const t = content[language];

  return (
    <>
      <Helmet>
        <title>{t.title} | techno.dog</title>
        <meta name="description" content={t.subtitle} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-12 pt-24">
          {/* Back Link */}
          <Link
            to="/community"
            className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToComm}
          </Link>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold">{t.title}</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <Users className="h-6 w-6 text-primary mb-2" />
                <CardDescription className="text-xs uppercase tracking-wider">
                  {t.stats.contributors}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stats.totalContributors}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CheckCircle2 className="h-6 w-6 text-green-500 mb-2" />
                <CardDescription className="text-xs uppercase tracking-wider">
                  {t.stats.approved}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stats.totalApproved}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <TrendingUp className="h-6 w-6 text-yellow-500 mb-2" />
                <CardDescription className="text-xs uppercase tracking-wider">
                  {t.stats.topScore}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stats.topScore}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Top 25 Contributors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-6 w-16 ml-auto" />
                    </div>
                  ))}
                </div>
              ) : leaders.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t.empty}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider border-b border-border">
                    <div className="col-span-1">{t.columns.rank}</div>
                    <div className="col-span-5">{t.columns.contributor}</div>
                    <div className="col-span-2 text-center">{t.columns.trustScore}</div>
                    <div className="col-span-2 text-center">{t.columns.approved}</div>
                    <div className="col-span-2 text-right">{t.columns.location}</div>
                  </div>

                  {/* Leader Rows */}
                  {leaders.map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border ${getRankBg(index + 1)} transition-colors hover:bg-card/80`}
                    >
                      {/* Rank */}
                      <div className="col-span-2 md:col-span-1 flex items-center">
                        {getRankIcon(index + 1)}
                      </div>

                      {/* Name & Roles */}
                      <div className="col-span-10 md:col-span-5 flex flex-col justify-center">
                        <p className="font-medium truncate">{getDisplayName(entry)}</p>
                        <div className="flex gap-1 mt-1">
                          {entry.roles.slice(0, 2).map((role) => (
                            <Badge key={role} variant="outline" className="text-[10px] px-1.5 py-0">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Trust Score */}
                      <div className="col-span-4 md:col-span-2 flex items-center justify-center">
                        <Badge variant="secondary" className="font-mono">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {entry.trust_score}
                        </Badge>
                      </div>

                      {/* Approved Count */}
                      <div className="col-span-4 md:col-span-2 flex items-center justify-center">
                        <Badge variant="outline" className="font-mono text-green-500 border-green-500/30">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {entry.approved_count}
                        </Badge>
                      </div>

                      {/* Location */}
                      <div className="col-span-4 md:col-span-2 flex items-center justify-end">
                        {entry.city || entry.country ? (
                          <span className="font-mono text-xs text-muted-foreground truncate">
                            {[entry.city, entry.country].filter(Boolean).join(", ")}
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground/50">—</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              {language === "en"
                ? "Want to climb the ranks? Start contributing!"
                : "¿Quieres subir en la tabla? ¡Empieza a contribuir!"}
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/community"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-card transition-colors font-mono text-sm"
              >
                <Camera className="h-4 w-4" />
                {language === "en" ? "Upload Photos" : "Subir Fotos"}
              </Link>
              <Link
                to="/artists"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-card transition-colors font-mono text-sm"
              >
                <FileText className="h-4 w-4" />
                {language === "en" ? "Submit Corrections" : "Enviar Correcciones"}
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CommunityLeaderboard;
