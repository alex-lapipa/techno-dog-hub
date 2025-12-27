import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, CheckCircle2, Plus } from "lucide-react";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email").max(255);

interface CommunityWidgetCompactProps {
  entityType?: string;
  entityId?: string;
  submissionType?: string;
  buttonText?: string;
  placeholder?: string;
  className?: string;
}

export const CommunityWidgetCompact = ({
  entityType,
  entityId,
  submissionType = "contribution",
  buttonText = "Join & Contribute",
  placeholder = "your@email.com",
  className = "",
}: CommunityWidgetCompactProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // If user is already logged in, show simplified version
  if (user) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <span>Signed in as {user.email}</span>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-primary/10 rounded-lg ${className}`}>
        <Mail className="h-4 w-4 text-primary" />
        <span className="text-sm">Check your email for the magic link!</span>
      </div>
    );
  }

  if (!expanded) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setExpanded(true)}
        className={className}
      >
        <Plus className="h-4 w-4 mr-2" />
        {buttonText}
      </Button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = emailSchema.safeParse(email);
    if (!validation.success) {
      toast({
        title: "Invalid email",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    if (!consent) {
      toast({
        title: "Consent required",
        description: "Please confirm you have rights to share content",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke("community-signup", {
        body: {
          email: email.toLowerCase().trim(),
          source: "upload_widget",
        },
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Check your email",
        description: "Click the magic link to verify and start contributing",
      });
    } catch (err) {
      console.error("Signup error:", err);
      toast({
        title: "Something went wrong",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 p-4 bg-card border border-border rounded-lg ${className}`}>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder={placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={loading || !consent}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex items-start space-x-2">
        <Checkbox
          id="consent-compact"
          checked={consent}
          onCheckedChange={(checked) => setConsent(!!checked)}
          disabled={loading}
        />
        <Label htmlFor="consent-compact" className="text-xs text-muted-foreground leading-tight">
          I have rights to share this content
        </Label>
      </div>
    </form>
  );
};

export default CommunityWidgetCompact;
