import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Copy, Edit, Eye, FileText, Image, Music, ExternalLink, ArrowLeft, Mail } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  submission_type: string | null;
  name: string | null;
  email: string | null;
  description: string | null;
  location: string | null;
  website_url: string | null;
  additional_info: string | null;
  file_urls: string[] | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
}

const SubmissionsAdmin = () => {
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logActivity } = useActivityLog();
  
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | "duplicate" | "edit" | "view" | null>(null);
  const [sendNotification, setSendNotification] = useState(true);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    submission_type: "",
    description: "",
    location: "",
    website_url: "",
    additional_info: "",
  });

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

  // Send email notification
  const sendEmailNotification = async (submission: Submission, status: "approved" | "rejected" | "duplicate", notes: string) => {
    if (!submission.email) {
      console.log("No email for submission, skipping notification");
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("submission-notification", {
        body: {
          email: submission.email,
          submissionName: submission.name || "Unnamed submission",
          status,
          adminNotes: notes || undefined,
        },
      });

      if (error) {
        console.error("Failed to send notification:", error);
        toast({
          title: "Email notification failed",
          description: "Status was updated but email could not be sent.",
          variant: "destructive",
        });
      } else {
        console.log("Email notification sent:", data);
      }
    } catch (err) {
      console.error("Email notification error:", err);
    }
  };

  // Update submission status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
      submission,
      notify,
    }: {
      id: string;
      status: string;
      notes: string;
      submission: Submission;
      notify: boolean;
    }) => {
      const { error } = await supabase
        .from("community_submissions")
        .update({
          status,
          admin_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      // Send email notification if enabled
      if (notify && (status === "approved" || status === "rejected" || status === "duplicate")) {
        await sendEmailNotification(submission, status as "approved" | "rejected" | "duplicate", notes);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      const actionLabels = { approve: "approved", reject: "rejected", duplicate: "marked as duplicate" };
      toast({
        title: "Submission updated",
        description: `Submission has been ${actionLabels[actionType as keyof typeof actionLabels] || "updated"}.${sendNotification && selectedSubmission?.email ? " Email sent." : ""}`,
      });
      
      // Log the activity
      logActivity({
        action_type: `submission_${variables.status}`,
        entity_type: "submission",
        entity_id: variables.id,
        details: {
          submission_name: variables.submission.name,
          submission_type: variables.submission.submission_type,
          admin_notes: variables.notes,
          email_sent: variables.notify && !!variables.submission.email,
        },
      });
      
      closeDialog();
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

  // Edit submission mutation
  const editMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Submission>;
    }) => {
      const { error } = await supabase
        .from("community_submissions")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
      toast({
        title: "Submission edited",
        description: "Changes have been saved.",
      });
      
      // Log the edit activity
      logActivity({
        action_type: "submission_edited",
        entity_type: "submission",
        entity_id: variables.id,
        details: {
          updated_fields: Object.keys(variables.updates).filter(k => variables.updates[k as keyof typeof variables.updates] !== null),
        },
      });
      
      closeDialog();
    },
    onError: (error) => {
      console.error("Edit error:", error);
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    },
  });

  const closeDialog = () => {
    setSelectedSubmission(null);
    setAdminNotes("");
    setActionType(null);
    setSendNotification(true);
    setEditForm({
      name: "",
      submission_type: "",
      description: "",
      location: "",
      website_url: "",
      additional_info: "",
    });
  };

  const handleAction = (submission: Submission, action: "approve" | "reject" | "duplicate" | "edit" | "view") => {
    setSelectedSubmission(submission);
    setActionType(action);
    setAdminNotes(submission.admin_notes || "");
    
    if (action === "edit") {
      setEditForm({
        name: submission.name || "",
        submission_type: submission.submission_type || "",
        description: submission.description || "",
        location: submission.location || "",
        website_url: submission.website_url || "",
        additional_info: submission.additional_info || "",
      });
    }
  };

  const confirmStatusAction = () => {
    if (!selectedSubmission || !actionType) return;
    const statusMap = { approve: "approved", reject: "rejected", duplicate: "duplicate" };
    updateStatusMutation.mutate({
      id: selectedSubmission.id,
      status: statusMap[actionType as keyof typeof statusMap],
      notes: adminNotes,
      submission: selectedSubmission,
      notify: sendNotification,
    });
  };

  const confirmEdit = () => {
    if (!selectedSubmission) return;
    editMutation.mutate({
      id: selectedSubmission.id,
      updates: {
        name: editForm.name || null,
        submission_type: editForm.submission_type || null,
        description: editForm.description || null,
        location: editForm.location || null,
        website_url: editForm.website_url || null,
        additional_info: editForm.additional_info || null,
        admin_notes: adminNotes || null,
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (url: string) => {
    const ext = url.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return Image;
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return Music;
    return FileText;
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'file';
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

  const getTypeBadge = (type: string | null) => {
    if (!type) return null;
    const colors: Record<string, string> = {
      artist: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      venue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      festival: "bg-green-500/20 text-green-400 border-green-500/30",
      label: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      crew: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      release: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      other: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return (
      <Badge variant="outline" className={`font-mono text-[10px] uppercase ${colors[type] || colors.other}`}>
        {type}
      </Badge>
    );
  };

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Authenticating..." />
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
              <Link to="/admin">
                <Button variant="outline" className="mt-4 font-mono text-xs">
                  Go to Admin Login
                </Button>
              </Link>
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
        noindex={true}
      />
      <Header />

      <main className="pt-24 lg:pt-16">
        {/* Header */}
        <section className="border-b border-border">
          <div className="container mx-auto px-4 md:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Link to="/admin" className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors">
                  <ArrowLeft className="w-3 h-3" />
                  Back to Admin
                </Link>
                <h1 className="font-mono text-3xl md:text-4xl uppercase tracking-tight">
                  Community Submissions
                </h1>
                <p className="font-mono text-xs text-muted-foreground mt-2">
                  {submissions?.length || 0} submissions found
                </p>
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
              <LoadingState message="Loading submissions..." />
            ) : !submissions || submissions.length === 0 ? (
              <EmptyState
                title="No submissions found"
                description={statusFilter === "pending" ? "All caught up! No pending submissions to review." : "No submissions match the current filter."}
              />
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
                          {submission.file_urls && submission.file_urls.length > 0 && (
                            <Badge variant="outline" className="font-mono text-[10px]">
                              {submission.file_urls.length} file(s)
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-mono text-lg uppercase tracking-tight">
                          {submission.name || "Unnamed Submission"}
                        </h3>

                        {submission.email && (
                          <p className="font-mono text-xs text-muted-foreground">
                            ✉️ {submission.email}
                          </p>
                        )}

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
                            className="font-mono text-xs text-primary hover:underline inline-flex items-center gap-1"
                          >
                            {submission.website_url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
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
                      <div className="flex gap-2 lg:flex-col">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(submission, "view")}
                          className="font-mono text-xs"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(submission, "edit")}
                          className="font-mono text-xs"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        {submission.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(submission, "approve")}
                              className="font-mono text-xs text-green-500 hover:text-green-400"
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
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {/* View Dialog */}
      <Dialog open={actionType === "view" && !!selectedSubmission} onOpenChange={() => closeDialog()}>
        <DialogContent className="font-mono max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-tight">
              Submission Details
            </DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Status & Type */}
              <div className="flex flex-wrap gap-2">
                {getTypeBadge(selectedSubmission.submission_type)}
                {getStatusBadge(selectedSubmission.status)}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-muted-foreground">Name</label>
                  <p className="font-mono text-sm">{selectedSubmission.name || "—"}</p>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-muted-foreground">Email</label>
                  <p className="font-mono text-sm">{selectedSubmission.email || "—"}</p>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-muted-foreground">Location</label>
                  <p className="font-mono text-sm">{selectedSubmission.location || "—"}</p>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-muted-foreground">Website</label>
                  {selectedSubmission.website_url ? (
                    <a href={selectedSubmission.website_url} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-primary hover:underline block truncate">
                      {selectedSubmission.website_url}
                    </a>
                  ) : (
                    <p className="font-mono text-sm">—</p>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedSubmission.description && (
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-muted-foreground">Description</label>
                  <p className="font-mono text-sm whitespace-pre-wrap">{selectedSubmission.description}</p>
                </div>
              )}

              {/* Additional Info */}
              {selectedSubmission.additional_info && (
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-muted-foreground">Additional Info</label>
                  <p className="font-mono text-sm whitespace-pre-wrap">{selectedSubmission.additional_info}</p>
                </div>
              )}

              {/* Files */}
              {selectedSubmission.file_urls && selectedSubmission.file_urls.length > 0 && (
                <div className="space-y-2">
                  <label className="font-mono text-[10px] uppercase text-muted-foreground">Uploaded Files</label>
                  <div className="grid grid-cols-1 gap-2">
                    {selectedSubmission.file_urls.map((url, index) => {
                      const FileIcon = getFileIcon(url);
                      return (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <FileIcon className="w-5 h-5 text-muted-foreground" />
                          <span className="font-mono text-xs flex-1 truncate">{getFileName(url)}</span>
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedSubmission.admin_notes && (
                <div className="space-y-1 p-4 bg-muted/50 border border-border">
                  <label className="font-mono text-[10px] uppercase text-muted-foreground">Admin Notes</label>
                  <p className="font-mono text-sm">{selectedSubmission.admin_notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-[10px] font-mono text-muted-foreground border-t border-border pt-4">
                <p>Submitted: {formatDate(selectedSubmission.created_at)}</p>
                {selectedSubmission.reviewed_at && (
                  <p>Reviewed: {formatDate(selectedSubmission.reviewed_at)}</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="font-mono text-xs">
              Close
            </Button>
            <Button onClick={() => { setActionType("edit"); }} className="font-mono text-xs">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={actionType === "edit" && !!selectedSubmission} onOpenChange={() => closeDialog()}>
        <DialogContent className="font-mono max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-tight">
              Edit Submission
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              Update the submission details below.
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase text-muted-foreground">Name</label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase text-muted-foreground">Type</label>
                  <Select value={editForm.submission_type} onValueChange={(v) => setEditForm({ ...editForm, submission_type: v })}>
                    <SelectTrigger className="font-mono text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="artist">Artist</SelectItem>
                      <SelectItem value="venue">Venue</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="label">Label</SelectItem>
                      <SelectItem value="crew">Crew</SelectItem>
                      <SelectItem value="release">Release</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs uppercase text-muted-foreground">Location</label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="font-mono text-sm"
                  placeholder="City, Country"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs uppercase text-muted-foreground">Website URL</label>
                <Input
                  value={editForm.website_url}
                  onChange={(e) => setEditForm({ ...editForm, website_url: e.target.value })}
                  className="font-mono text-sm"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs uppercase text-muted-foreground">Description</label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="font-mono text-sm min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <label className="font-mono text-xs uppercase text-muted-foreground">Additional Info</label>
                <Textarea
                  value={editForm.additional_info}
                  onChange={(e) => setEditForm({ ...editForm, additional_info: e.target.value })}
                  className="font-mono text-sm min-h-[80px]"
                />
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <label className="font-mono text-xs uppercase text-muted-foreground">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes..."
                  className="font-mono text-sm min-h-[60px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="font-mono text-xs">
              Cancel
            </Button>
            <Button onClick={confirmEdit} disabled={editMutation.isPending} className="font-mono text-xs">
              {editMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject/Duplicate Dialog */}
      <Dialog open={(actionType === "approve" || actionType === "reject" || actionType === "duplicate") && !!selectedSubmission} onOpenChange={() => closeDialog()}>
        <DialogContent className="font-mono">
          <DialogHeader>
            <DialogTitle className="font-mono uppercase tracking-tight">
              {actionType === "approve" ? "Approve Submission" : actionType === "duplicate" ? "Mark as Duplicate" : "Reject Submission"}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              {actionType === "approve"
                ? "This submission will be marked as approved."
                : actionType === "duplicate"
                ? "This submission already exists in the archive or has been submitted before."
                : "This submission will be marked as rejected."}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 border border-border">
                <p className="font-mono text-sm">
                  <strong>{selectedSubmission.submission_type || "Submission"}:</strong> {selectedSubmission.name || "Unnamed"}
                </p>
                {selectedSubmission.location && (
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    {selectedSubmission.location}
                  </p>
                )}
                {selectedSubmission.email && (
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    ✉️ {selectedSubmission.email}
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

              {/* Email notification toggle */}
              <div className="flex items-center gap-3 p-3 border border-border bg-muted/30">
                <input
                  type="checkbox"
                  id="send-notification"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="w-4 h-4 accent-logo-green"
                  disabled={!selectedSubmission.email}
                />
                <label htmlFor="send-notification" className="flex-1 font-mono text-xs cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" />
                    Send email notification to submitter
                  </span>
                  {!selectedSubmission.email && (
                    <span className="block text-muted-foreground mt-1">
                      No email provided for this submission
                    </span>
                  )}
                </label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              className="font-mono text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusAction}
              disabled={updateStatusMutation.isPending}
              variant={actionType === "approve" ? "default" : actionType === "duplicate" ? "secondary" : "destructive"}
              className="font-mono text-xs"
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : actionType === "approve" ? (
                <Check className="w-4 h-4 mr-1" />
              ) : actionType === "duplicate" ? (
                <Copy className="w-4 h-4 mr-1" />
              ) : (
                <X className="w-4 h-4 mr-1" />
              )}
              {actionType === "approve" ? "Approve" : actionType === "duplicate" ? "Mark Duplicate" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionsAdmin;
