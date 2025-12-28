import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { awardPointsForSubmission } from "@/lib/gamification";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  User,
  Sparkles,
  Trophy
} from "lucide-react";
import { format } from "date-fns";

interface Submission {
  id: string;
  email: string | null;
  submission_type: string | null;
  entity_type: string | null;
  entity_id: string | null;
  name: string | null;
  description: string | null;
  file_urls: string[] | null;
  website_url: string | null;
  status: string;
  created_at: string;
  admin_notes: string | null;
  consent_confirmed: boolean;
  media_metadata: Record<string, unknown> | null;
}

const AdminModeration = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/admin");
    }
  }, [isAdmin, authLoading, navigate]);

  const loadSubmissions = async (status: string) => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("community_submissions")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: status === "pending" });

    if (!error && data) {
      setSubmissions(data as unknown as Submission[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      loadSubmissions(activeTab);
    }
  }, [isAdmin, activeTab]);

  const sendNotificationEmail = async (
    email: string,
    submissionName: string,
    status: "approved" | "rejected",
    notes?: string
  ) => {
    try {
      const { error } = await supabase.functions.invoke("submission-notification", {
        body: {
          email,
          submissionName,
          status,
          adminNotes: notes,
        },
      });

      if (error) {
        console.error("Failed to send notification email:", error);
      } else {
        console.log(`Notification email sent to ${email}`);
      }
    } catch (err) {
      console.error("Email notification error:", err);
    }
  };

  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedSubmission) return;

    setProcessing(true);

    try {
      const newStatus = action === "approve" ? "approved" : "rejected";
      
      const { error } = await supabase
        .from("community_submissions")
        .update({
          status: newStatus,
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", selectedSubmission.id);

      if (error) throw error;

      // Award points and check badges on approval
      let gamificationResult = null;
      if (action === "approve" && selectedSubmission.email) {
        gamificationResult = await awardPointsForSubmission(
          selectedSubmission.email,
          selectedSubmission.submission_type,
          selectedSubmission.id
        );
      }

      // Send email notification if email exists
      if (selectedSubmission.email) {
        await sendNotificationEmail(
          selectedSubmission.email,
          selectedSubmission.name || selectedSubmission.submission_type || "Your submission",
          newStatus as "approved" | "rejected",
          adminNotes || undefined
        );
      }

      // Build toast message with gamification info
      let toastDescription = selectedSubmission.email 
        ? `The submission has been ${newStatus} and the user was notified`
        : `The submission has been ${newStatus}`;

      if (gamificationResult) {
        if (gamificationResult.multiplier > 1) {
          toastDescription += ` (+${gamificationResult.pointsAwarded} XP with ${gamificationResult.multiplier}x ${gamificationResult.multiplierName || 'bonus'}!)`;
        } else {
          toastDescription += ` (+${gamificationResult.pointsAwarded} XP)`;
        }
        if (gamificationResult.levelUp) {
          toastDescription += ` 🎉 Level up to ${gamificationResult.newLevel}!`;
        }
        if (gamificationResult.streakInfo?.streakIncreased) {
          toastDescription += ` 🔥 ${gamificationResult.streakInfo.currentStreak} day streak!`;
        }
        if (gamificationResult.badgesAwarded.length > 0) {
          toastDescription += ` 🏆 Badges: ${gamificationResult.badgesAwarded.join(", ")}`;
        }
      }

      toast({
        title: action === "approve" ? "Submission approved" : "Submission rejected",
        description: toastDescription,
      });

      setSelectedSubmission(null);
      setActionType(null);
      setAdminNotes("");
      loadSubmissions(activeTab);

    } catch (err) {
      console.error("Action error:", err);
      toast({
        title: "Action failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case "artist_photo":
      case "festival_photo":
      case "venue_photo":
      case "gear_photo":
        return <ImageIcon className="h-4 w-4" />;
      case "correction":
        return <FileText className="h-4 w-4" />;
      case "link":
        return <LinkIcon className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">Pending</Badge>;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Content Moderation | Admin | techno.dog</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12 pt-24">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Content Moderation</h1>
            <p className="text-muted-foreground">
              Review and approve community submissions
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
            <TabsList className="mb-6">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="approved" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Approved
              </TabsTrigger>
              <TabsTrigger value="rejected" className="gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : submissions.length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No {activeTab} submissions</h3>
                    <p className="text-muted-foreground text-sm">
                      {activeTab === "pending" 
                        ? "All caught up! No submissions waiting for review."
                        : `No ${activeTab} submissions yet.`}
                    </p>
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
                            {getStatusBadge(submission.status)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {activeTab === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-500 hover:text-green-400"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setActionType("approve");
                                  }}
                                >
                                  <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-400"
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setActionType("reject");
                                  }}
                                >
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                        <CardDescription className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {submission.email || "Anonymous"}
                          </span>
                          <span>
                            {format(new Date(submission.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                          {submission.entity_type && (
                            <span className="text-primary">
                              {submission.entity_type}/{submission.entity_id}
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-2">
                        {submission.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {submission.description}
                          </p>
                        )}
                        
                        {submission.file_urls && submission.file_urls.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {submission.file_urls.slice(0, 4).map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt={`Upload ${i + 1}`}
                                className="h-16 w-16 rounded object-cover flex-shrink-0"
                              />
                            ))}
                            {submission.file_urls.length > 4 && (
                              <div className="h-16 w-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                +{submission.file_urls.length - 4}
                              </div>
                            )}
                          </div>
                        )}

                        {!submission.consent_confirmed && (
                          <div className="flex items-center gap-2 text-yellow-500 text-xs mt-2">
                            <AlertTriangle className="h-3 w-3" />
                            No consent confirmation
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* View Dialog */}
          <Dialog 
            open={!!selectedSubmission && !actionType} 
            onOpenChange={() => setSelectedSubmission(null)}
          >
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedSubmission?.name || "Submission Details"}</DialogTitle>
                <DialogDescription>
                  Submitted by {selectedSubmission?.email || "Anonymous"} on{" "}
                  {selectedSubmission && format(new Date(selectedSubmission.created_at), "PPpp")}
                </DialogDescription>
              </DialogHeader>

              {selectedSubmission && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2">{selectedSubmission.submission_type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedSubmission.status)}</span>
                    </div>
                    {selectedSubmission.entity_type && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Entity:</span>
                        <span className="ml-2 text-primary">
                          {selectedSubmission.entity_type}/{selectedSubmission.entity_id}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedSubmission.description && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedSubmission.description}
                      </p>
                    </div>
                  )}

                  {selectedSubmission.website_url && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Source URL</h4>
                      <a 
                        href={selectedSubmission.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {selectedSubmission.website_url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {selectedSubmission.file_urls && selectedSubmission.file_urls.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Uploaded Files</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedSubmission.file_urls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={url}
                              alt={`Upload ${i + 1}`}
                              className="w-full aspect-video rounded object-cover hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSubmission.admin_notes && (
                    <div className="p-3 bg-muted rounded">
                      <h4 className="text-sm font-medium mb-1">Admin Notes</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedSubmission.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter>
                {selectedSubmission?.status === "pending" && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-500"
                      onClick={() => setActionType("reject")}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setActionType("approve")}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Action Dialog */}
          <Dialog 
            open={!!actionType} 
            onOpenChange={() => { setActionType(null); setAdminNotes(""); }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {actionType === "approve" ? "Approve Submission" : "Reject Submission"}
                </DialogTitle>
                <DialogDescription>
                  {actionType === "approve" 
                    ? "This will make the content visible on the site."
                    : "Please provide a reason for rejection (optional but recommended)."}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    placeholder={actionType === "reject" 
                      ? "Reason for rejection..." 
                      : "Optional notes..."}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => { setActionType(null); setAdminNotes(""); }}>
                  Cancel
                </Button>
                <Button
                  variant={actionType === "approve" ? "default" : "destructive"}
                  onClick={() => handleAction(actionType!)}
                  disabled={processing}
                >
                  {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {actionType === "approve" ? "Approve" : "Reject"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminModeration;
