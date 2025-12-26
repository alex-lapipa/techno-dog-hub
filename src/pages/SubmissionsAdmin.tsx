import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Eye, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Submission {
  id: string;
  user_id: string | null;
  submission_type: string;
  name: string;
  description: string | null;
  location: string | null;
  website_url: string | null;
  additional_info: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
}

const SubmissionsAdmin = () => {
  const { language } = useLanguage();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  // Fetch submissions
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["admin-submissions", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("community_submissions")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Submission[];
    },
    enabled: isAdmin,
  });

  // Update submission mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: string;
      notes: string;
    }) => {
      const { error } = await supabase
        .from("community_submissions")
        .update({
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast({
        title: "Submission updated",
        description: `Submission has been ${actionType === "approve" ? "approved" : "rejected"}.`,
      });
      setSelectedSubmission(null);
      setAdminNotes("");
      setActionType(null);
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to update submission.",
        variant: "destructive",
      });
    },
  });

  const handleAction = (submission: Submission, action: "approve" | "reject") => {
    setSelectedSubmission(submission);
    setActionType(action);
    setAdminNotes(submission.admin_notes || "");
  };

  const confirmAction = () => {
    if (!selectedSubmission || !actionType) return;
    updateMutation.mutate({
      id: selectedSubmission.id,
      status: actionType === "approve" ? "approved" : "rejected",
      notes: adminNotes,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "en" ? "en-US" : "es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { icon: Clock, variant: "outline" as const, label: "Pending" },
      approved: { icon: CheckCircle, variant: "default" as const, label: "Approved" },
      rejected: { icon: XCircle, variant: "destructive" as const, label: "Rejected" },
      duplicate: { icon: AlertCircle, variant: "secondary" as const, label: "Duplicate" },
    };
    const { icon: Icon, variant, label } = config[status as keyof typeof config] || config.pending;
    return (
      <Badge variant={variant} className="font-mono text-[10px] uppercase">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      artist: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      venue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      festival: "bg-green-500/20 text-green-400 border-green-500/30",
      label: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return (
      <Badge variant="outline" className={`font-mono text-[10px] uppercase ${colors[type as keyof typeof colors] || colors.other}`}>
        {type}
      </Badge>
    );
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-mono text-xs text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="pt-24 lg:pt-16">
          <div className="container mx-auto px-4 md:px-8 py-16">
            <div className="max-w-md mx-auto text-center">
              <h1 className="font-mono text-2xl uppercase tracking-tight mb-4">Access Denied</h1>
              <p className="font-mono text-sm text-muted-foreground">
                You need admin privileges to access this page.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageSEO
        title="Submissions Admin"
        description="Review and manage community submissions"
        path="/admin/submissions"
        locale={language}
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        {/* Header */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] mb-2">
                  // Admin
                </div>
                <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-tight">
                  Community Submissions
                </h1>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground uppercase">Filter:</span>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] font-mono text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-mono text-xs">All</SelectItem>
                    <SelectItem value="pending" className="font-mono text-xs">Pending</SelectItem>
                    <SelectItem value="approved" className="font-mono text-xs">Approved</SelectItem>
                    <SelectItem value="rejected" className="font-mono text-xs">Rejected</SelectItem>
                    <SelectItem value="duplicate" className="font-mono text-xs">Duplicate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Submissions List */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : !submissions || submissions.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-mono text-sm text-muted-foreground">
                  No submissions found.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="border border-border bg-card p-6 hover:border-foreground/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Main Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {getTypeBadge(submission.submission_type)}
                          {getStatusBadge(submission.status)}
                        </div>

                        <h3 className="font-mono text-lg uppercase tracking-tight">
                          {submission.name}
                        </h3>

                        {submission.location && (
                          <p className="font-mono text-xs text-muted-foreground">
                            📍 {submission.location}
                          </p>
                        )}

                        {submission.description && (
                          <p className="font-mono text-sm text-muted-foreground line-clamp-2">
                            {submission.description}
                          </p>
                        )}

                        {submission.website_url && (
                          <a
                            href={submission.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-primary hover:underline inline-block"
                          >
                            {submission.website_url}
                          </a>
                        )}

                        {submission.additional_info && (
                          <details className="mt-2">
                            <summary className="font-mono text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                              Additional info
                            </summary>
                            <p className="font-mono text-xs text-muted-foreground mt-2 pl-4 border-l border-border">
                              {submission.additional_info}
                            </p>
                          </details>
                        )}

                        {submission.admin_notes && (
                          <div className="mt-2 p-3 bg-muted/50 border border-border">
                            <p className="font-mono text-xs text-muted-foreground">
                              <strong>Admin notes:</strong> {submission.admin_notes}
                            </p>
                          </div>
                        )}

                        <p className="font-mono text-[10px] text-muted-foreground">
                          Submitted: {formatDate(submission.created_at)}
                          {submission.reviewed_at && (
                            <> • Reviewed: {formatDate(submission.reviewed_at)}</>
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      {submission.status === "pending" && (
                        <div className="flex gap-2 lg:flex-col">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(submission, "approve")}
                            className="font-mono text-xs"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(submission, "reject")}
                            className="font-mono text-xs text-destructive hover:text-destructive"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* Confirm Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="font-mono">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-tight">
              {actionType === "approve" ? "Approve Submission" : "Reject Submission"}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {actionType === "approve"
                ? "This submission will be marked as approved."
                : "This submission will be marked as rejected."}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 border border-border">
                <p className="font-mono text-sm">
                  <strong>{selectedSubmission.submission_type}:</strong> {selectedSubmission.name}
                </p>
                {selectedSubmission.location && (
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    {selectedSubmission.location}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  Admin Notes (optional)
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this decision..."
                  className="font-mono text-sm min-h-[80px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedSubmission(null)}
              className="font-mono text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={updateMutation.isPending}
              variant={actionType === "approve" ? "default" : "destructive"}
              className="font-mono text-xs"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : actionType === "approve" ? (
                <Check className="w-4 h-4 mr-1" />
              ) : (
                <X className="w-4 h-4 mr-1" />
              )}
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionsAdmin;
