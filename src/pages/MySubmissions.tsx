import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon
} from "lucide-react";
import { format } from "date-fns";

interface Submission {
  id: string;
  submission_type: string | null;
  name: string | null;
  description: string | null;
  status: string;
  created_at: string;
  admin_notes: string | null;
  file_urls: string[] | null;
}

const MySubmissions = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/community");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const loadSubmissions = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("community_submissions")
        .select("id, submission_type, name, description, status, created_at, admin_notes, file_urls")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setSubmissions(data);
      }
      setLoading(false);
    };

    if (user) {
      loadSubmissions();
    }
  }, [user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="text-green-500 border-green-500/50">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500/50">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case "photo":
      case "artist_photo":
      case "festival_photo":
      case "venue_photo":
        return <ImageIcon className="h-4 w-4" />;
      case "link":
      case "correction":
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Submissions | techno.dog</title>
        <meta name="description" content="Track your community submissions to techno.dog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12 pt-24">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/community")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Community
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Submissions</h1>
            <p className="text-muted-foreground">
              Track the status of your community contributions
            </p>
          </div>

          {submissions.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No submissions yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  You haven't submitted any content to techno.dog yet.
                </p>
                <Button onClick={() => navigate("/technopedia")}>
                  Make your first submission
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission.id} className="border-border/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(submission.submission_type)}
                        <CardTitle className="text-base">
                          {submission.name || submission.submission_type || "Untitled"}
                        </CardTitle>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                    <CardDescription>
                      Submitted {format(new Date(submission.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submission.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {submission.description}
                      </p>
                    )}
                    
                    {submission.file_urls && submission.file_urls.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <ImageIcon className="h-3 w-3" />
                        {submission.file_urls.length} file(s) attached
                      </div>
                    )}

                    {submission.status === "rejected" && submission.admin_notes && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md">
                        <p className="text-sm text-red-400">
                          <strong>Reason:</strong> {submission.admin_notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default MySubmissions;
