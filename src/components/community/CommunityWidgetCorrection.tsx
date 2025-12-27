import { useState } from "react";
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
  Edit3, 
  Loader2, 
  CheckCircle2,
  Mail,
  Send,
  ChevronDown
} from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email").max(255);
const textSchema = z.string().min(10, "Please provide more detail").max(2000, "Text must be under 2000 characters");

interface CommunityWidgetCorrectionProps {
  entityType: string;
  entityId: string;
  entityName?: string;
  title?: string;
  description?: string;
  className?: string;
  collapsible?: boolean;
  onSuccess?: () => void;
}

export const CommunityWidgetCorrection = ({
  entityType,
  entityId,
  entityName,
  title = "Submit a Correction",
  description = "Help us keep our data accurate",
  className = "",
  collapsible = false,
  onSuccess,
}: CommunityWidgetCorrectionProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(!collapsible);
  const [email, setEmail] = useState("");
  const [correctionText, setCorrectionText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

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

    const textValidation = textSchema.safeParse(correctionText);
    if (!textValidation.success) {
      toast({
        title: "Invalid submission",
        description: textValidation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!consent) {
      toast({
        title: "Consent required",
        description: "Please confirm you're submitting accurate information",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (!user) {
        const { error } = await supabase.functions.invoke("community-signup", {
          body: {
            email: email.toLowerCase().trim(),
            source: "upload_widget",
          },
        });

        if (error) throw error;

        setNeedsVerification(true);
        toast({
          title: "Verify your email first",
          description: "Check your email for the magic link, then come back to submit",
        });
        setLoading(false);
        return;
      }

      const { error: submissionError } = await supabase
        .from("community_submissions")
        .insert({
          user_id: user.id,
          email: user.email,
          submission_type: "correction",
          entity_type: entityType,
          entity_id: entityId,
          name: entityName ? `Correction for ${entityName}` : "Correction",
          description: correctionText,
          website_url: sourceUrl || undefined,
          consent_confirmed: true,
          consent_text_version: "v1",
          status: "pending",
        });

      if (submissionError) throw submissionError;

      setSubmitted(true);
      toast({
        title: "Correction submitted!",
        description: "We'll review your submission. Thank you for helping improve our data!",
      });
      
      onSuccess?.();

    } catch (err) {
      console.error("Submit error:", err);
      toast({
        title: "Submission failed",
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
            Your correction is pending review. We appreciate your help!
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
            Click the magic link we sent to <strong>{email}</strong>, then return here to submit.
          </p>
          <Button variant="outline" size="sm" onClick={() => setNeedsVerification(false)}>
            Use different email
          </Button>
        </CardContent>
      </Card>
    );
  }

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email (only if not logged in) */}
      {!user && (
        <div className="space-y-2">
          <Label htmlFor="email-correction">Email *</Label>
          <Input
            id="email-correction"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
      )}

      {/* Correction text */}
      <div className="space-y-2">
        <Label htmlFor="correction">What needs correcting? *</Label>
        <Textarea
          id="correction"
          placeholder="Describe what's incorrect and what the correct information should be..."
          value={correctionText}
          onChange={(e) => setCorrectionText(e.target.value)}
          disabled={loading}
          rows={4}
        />
      </div>

      {/* Source URL */}
      <div className="space-y-2">
        <Label htmlFor="source">Source URL (optional)</Label>
        <Input
          id="source"
          type="url"
          placeholder="https://..."
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          Link to verify the correct information
        </p>
      </div>

      {/* Consent */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="consent-correction"
          checked={consent}
          onCheckedChange={(checked) => setConsent(!!checked)}
          disabled={loading}
        />
        <Label htmlFor="consent-correction" className="text-sm text-muted-foreground leading-tight">
          I confirm this information is accurate to the best of my knowledge
        </Label>
      </div>

      {/* Submit */}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading || !correctionText.trim() || !consent}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit Correction
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
                  <Edit3 className="h-5 w-5 text-primary" />
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
          <Edit3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
};

export default CommunityWidgetCorrection;
