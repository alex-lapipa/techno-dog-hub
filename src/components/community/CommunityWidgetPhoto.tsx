import { useState, useRef, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Camera, 
  Upload, 
  X, 
  Loader2, 
  CheckCircle2,
  Mail,
  Image as ImageIcon,
  ChevronDown,
  RefreshCw
} from "lucide-react";
import { z } from "zod";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;
const PENDING_UPLOAD_KEY = "technodog_pending_upload";

const emailSchema = z.string().email("Please enter a valid email").max(255);
const captionSchema = z.string().max(500, "Caption must be under 500 characters").optional();

interface PendingUploadData {
  entityType: string;
  entityId: string;
  entityName?: string;
  submissionType: string;
  caption: string;
  credit: string;
  email: string;
  timestamp: number;
}

interface CommunityWidgetPhotoProps {
  entityType: string;
  entityId: string;
  entityName?: string;
  submissionType?: "artist_photo" | "festival_photo" | "venue_photo" | "gear_photo" | "other";
  title?: string;
  description?: string;
  className?: string;
  collapsible?: boolean;
  onSuccess?: () => void;
}

interface PreviewFile {
  file: File;
  preview: string;
}

export const CommunityWidgetPhoto = ({
  entityType,
  entityId,
  entityName,
  submissionType = "other",
  title = "Share a Photo",
  description = "Help build the archive by sharing your photos",
  className = "",
  collapsible = false,
  onSuccess,
}: CommunityWidgetPhotoProps) => {
  const { toast } = useToast();
  const { user, session } = useAuth();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(!collapsible);
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [email, setEmail] = useState("");
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [hasPendingUpload, setHasPendingUpload] = useState(false);

  // Check for pending uploads when user becomes authenticated
  useEffect(() => {
    if (user) {
      const pendingData = localStorage.getItem(PENDING_UPLOAD_KEY);
      if (pendingData) {
        try {
          const pending: PendingUploadData = JSON.parse(pendingData);
          // Only show if pending upload is less than 1 hour old
          if (Date.now() - pending.timestamp < 3600000) {
            setHasPendingUpload(true);
            setCaption(pending.caption || "");
            setCredit(pending.credit || "");
            toast({
              title: "Welcome back!",
              description: "You can now complete your photo upload. Please select your files again.",
            });
          } else {
            localStorage.removeItem(PENDING_UPLOAD_KEY);
          }
        } catch {
          localStorage.removeItem(PENDING_UPLOAD_KEY);
        }
      }
    }
  }, [user, toast]);

  // Clear pending upload after successful submission
  const clearPendingUpload = () => {
    localStorage.removeItem(PENDING_UPLOAD_KEY);
    setHasPendingUpload(false);
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Only JPG, PNG, WebP, and GIF are allowed`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File must be under 5MB`;
    }
    return null;
  };

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: PreviewFile[] = [];
    const errors: string[] = [];

    Array.from(selectedFiles).forEach((file) => {
      if (files.length + newFiles.length >= MAX_FILES) {
        errors.push(`Maximum ${MAX_FILES} files allowed`);
        return;
      }

      const error = validateFile(file);
      if (error) {
        errors.push(error);
        return;
      }

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    });

    if (errors.length > 0) {
      toast({
        title: "Some files were rejected",
        description: errors.join(". "),
        variant: "destructive",
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
  }, [files.length, toast]);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user && !email) {
      toast({
        title: "Email required",
        description: "Please enter your email to submit",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      const emailValidation = emailSchema.safeParse(email);
      if (!emailValidation.success) {
        toast({
          title: "Invalid email",
          description: emailValidation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    const captionValidation = captionSchema.safeParse(caption);
    if (!captionValidation.success) {
      toast({
        title: "Caption too long",
        description: captionValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!consent) {
      toast({
        title: "Consent required",
        description: "Please confirm you have rights to share this content",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one photo to upload",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        // Store pending upload data before verification
        const pendingData: PendingUploadData = {
          entityType,
          entityId,
          entityName,
          submissionType,
          caption,
          credit,
          email: email.toLowerCase().trim(),
          timestamp: Date.now(),
        };
        localStorage.setItem(PENDING_UPLOAD_KEY, JSON.stringify(pendingData));

        const { error } = await supabase.functions.invoke("community-signup", {
          body: {
            email: email.toLowerCase().trim(),
            source: "upload_widget",
            redirect_path: location.pathname, // Redirect back to current page
          },
        });

        if (error) throw error;

        setNeedsVerification(true);
        toast({
          title: "Verify your email first",
          description: "Check your email for the magic link. After clicking it, return to this page to complete your upload.",
        });
        setLoading(false);
        return;
      }

      const uploadedUrls: string[] = [];
      
      for (const { file } of files) {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const fileName = `${entityType}/${entityId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("community-uploads")
          .upload(fileName, file, {
            contentType: file.type,
            cacheControl: "3600",
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw new Error(`Failed to upload ${file.name}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from("community-uploads")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      const { error: submissionError } = await supabase
        .from("community_submissions")
        .insert({
          user_id: user.id,
          email: user.email,
          submission_type: submissionType,
          entity_type: entityType,
          entity_id: entityId,
          name: entityName ? `Photo of ${entityName}` : undefined,
          description: caption || undefined,
          file_urls: uploadedUrls,
          consent_confirmed: true,
          consent_text_version: "v1",
          media_metadata: {
            credit: credit || undefined,
            file_count: uploadedUrls.length,
          },
          status: "pending",
        });

      if (submissionError) throw submissionError;

      setSubmitted(true);
      clearPendingUpload();
      toast({
        title: "Photos submitted!",
        description: "Your photos are pending review. Thank you for contributing!",
      });
      
      onSuccess?.();

    } catch (err) {
      console.error("Submit error:", err);
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className={`border-green-500/30 bg-green-500/5 ${className}`}>
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Thank you!</h3>
          <p className="text-sm text-muted-foreground">
            Your photos are pending review. We'll add them to the archive once approved.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (needsVerification) {
    return (
      <Card className={`border-primary/30 ${className}`}>
        <CardContent className="py-8 text-center">
          <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Check your email</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Click the magic link we sent to <strong>{email}</strong>
          </p>
          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-4 text-left">
            <p className="text-xs text-muted-foreground">
              <strong>After clicking the link:</strong>
            </p>
            <ol className="text-xs text-muted-foreground mt-2 space-y-1 list-decimal list-inside">
              <li>You'll be signed in automatically</li>
              <li>Return to this page</li>
              <li>Select your photos again to complete upload</li>
            </ol>
          </div>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setNeedsVerification(false);
                localStorage.removeItem(PENDING_UPLOAD_KEY);
              }}
            >
              Use different email
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show prompt when user returns after verification
  const showReturnPrompt = hasPendingUpload && user && files.length === 0;

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Return prompt for users who verified */}
      {showReturnPrompt && (
        <div className="bg-logo-green/10 border border-logo-green/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-logo-green" />
            <span className="font-medium text-sm">Email verified!</span>
          </div>
          <p className="text-xs text-muted-foreground">
            You're now signed in. Select your photos again to complete the upload.
          </p>
          <Button 
            type="button"
            variant="ghost" 
            size="sm" 
            className="mt-2 text-xs"
            onClick={clearPendingUpload}
          >
            <X className="h-3 w-3 mr-1" />
            Dismiss
          </Button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          showReturnPrompt 
            ? "border-logo-green/50 bg-logo-green/5 hover:border-logo-green" 
            : "border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        {showReturnPrompt ? (
          <>
            <RefreshCw className="h-8 w-8 text-logo-green mx-auto mb-2" />
            <p className="text-sm font-medium text-logo-green">
              Click here to select your photos
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Your caption and credit info have been saved
            </p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drop photos here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG, WebP, GIF • Max 5MB each • Up to {MAX_FILES} files
            </p>
          </>
        )}
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {files.map((file, index) => (
            <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-muted">
              <img
                src={file.preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full hover:bg-black/80"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Email (only if not logged in) */}
      {!user && (
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
      )}

      {/* Caption */}
      <div className="space-y-2">
        <Label htmlFor="caption">Caption (optional)</Label>
        <Textarea
          id="caption"
          placeholder="Add context: event date, location, etc."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={loading}
          rows={2}
        />
      </div>

      {/* Credit */}
      <div className="space-y-2">
        <Label htmlFor="credit">Photo credit (optional)</Label>
        <Input
          id="credit"
          type="text"
          placeholder="Your name or @instagram"
          value={credit}
          onChange={(e) => setCredit(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Consent */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="consent"
          checked={consent}
          onCheckedChange={(checked) => setConsent(!!checked)}
          disabled={loading}
        />
        <Label htmlFor="consent" className="text-sm text-muted-foreground leading-tight">
          I confirm I own rights or have permission to share this content
        </Label>
      </div>

      {/* Submit */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || files.length === 0 || !consent}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <ImageIcon className="h-4 w-4 mr-2" />
            Submit {files.length > 0 ? `${files.length} Photo${files.length > 1 ? "s" : ""}` : "Photos"}
          </>
        )}
      </Button>
    </form>
  );

  if (collapsible) {
    return (
      <Card className={`border-border/50 ${className}`}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-card/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{title}</CardTitle>
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>{formContent}</CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  }

  return (
    <Card className={`border-border/50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
};

export default CommunityWidgetPhoto;
