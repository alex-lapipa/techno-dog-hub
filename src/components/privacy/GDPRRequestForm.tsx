import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Shield, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const requestSchema = z.object({
  email: z.string().trim().email("Please enter a valid email").max(255),
  request_type: z.enum(['access', 'erasure', 'rectification', 'portability', 'restriction']),
  notes: z.string().trim().max(2000, "Notes must be less than 2000 characters").optional(),
});

type RequestType = 'access' | 'erasure' | 'rectification' | 'portability' | 'restriction';

const REQUEST_TYPES: { value: RequestType; label: string; description: string }[] = [
  { 
    value: 'access', 
    label: 'Data Access', 
    description: 'Request a copy of all personal data we hold about you'
  },
  { 
    value: 'erasure', 
    label: 'Data Erasure', 
    description: 'Request deletion of your personal data ("right to be forgotten")'
  },
  { 
    value: 'rectification', 
    label: 'Data Rectification', 
    description: 'Request correction of inaccurate personal data'
  },
  { 
    value: 'portability', 
    label: 'Data Portability', 
    description: 'Request your data in a portable, machine-readable format'
  },
  { 
    value: 'restriction', 
    label: 'Processing Restriction', 
    description: 'Request that we limit how we process your data'
  },
];

export function GDPRRequestForm() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [requestType, setRequestType] = useState<RequestType>('access');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = requestSchema.safeParse({ email, request_type: requestType, notes });
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate verification token
      const verificationToken = crypto.randomUUID();

      const { error } = await supabase.from('gdpr_subject_requests').insert({
        email: email.trim(),
        request_type: requestType,
        notes: notes.trim() || null,
        verification_token: verificationToken,
      });

      if (error) throw error;

      // Log to privacy audit
      await supabase.from('privacy_audit_log').insert({
        action_type: 'access_request',
        details: { request_type: requestType, email_hash: await hashEmail(email) },
      });

      setIsSuccess(true);
      toast({
        title: "Request Submitted",
        description: "We'll process your request within 30 days as required by GDPR.",
      });
    } catch (error) {
      console.error('GDPR request error:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact our DPO directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hashEmail = async (email: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  };

  const handleReset = () => {
    setEmail('');
    setRequestType('access');
    setNotes('');
    setIsSuccess(false);
    setErrors({});
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      handleReset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="font-mono text-xs gap-2 border-logo-green/50 hover:bg-logo-green/10 hover:border-logo-green"
        >
          <Shield className="w-4 h-4" />
          Exercise Your Rights
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-lg border-logo-green/30">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-logo-green" />
            GDPR Data Subject Request
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Exercise your rights under the General Data Protection Regulation
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-logo-green mx-auto" />
            <div>
              <h3 className="font-mono text-lg mb-2">Request Received</h3>
              <p className="font-mono text-xs text-muted-foreground">
                We will process your request within 30 days. You will receive a confirmation email 
                with further instructions. For complex requests, we may extend this by an additional 
                60 days and will notify you accordingly.
              </p>
            </div>
            <Button onClick={() => handleOpenChange(false)} className="font-mono">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="gdpr-email" className="font-mono text-xs uppercase tracking-wider">
                Email Address *
              </Label>
              <Input
                id="gdpr-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="font-mono text-sm"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-destructive text-xs font-mono">{errors.email}</p>
              )}
              <p className="font-mono text-[10px] text-muted-foreground">
                The email address associated with your data
              </p>
            </div>

            {/* Request Type */}
            <div className="space-y-3">
              <Label className="font-mono text-xs uppercase tracking-wider">
                Request Type *
              </Label>
              <RadioGroup 
                value={requestType} 
                onValueChange={(v) => setRequestType(v as RequestType)}
                className="space-y-2"
              >
                {REQUEST_TYPES.map((type) => (
                  <div 
                    key={type.value}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:border-logo-green/50 transition-colors"
                  >
                    <RadioGroupItem value={type.value} id={type.value} className="mt-0.5" />
                    <div className="flex-1">
                      <Label 
                        htmlFor={type.value} 
                        className="font-mono text-sm font-medium cursor-pointer"
                      >
                        {type.label}
                      </Label>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        {type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="gdpr-notes" className="font-mono text-xs uppercase tracking-wider">
                Additional Information (Optional)
              </Label>
              <Textarea
                id="gdpr-notes"
                placeholder="Any additional details to help us process your request..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="font-mono text-sm min-h-[80px] resize-none"
                disabled={isSubmitting}
                maxLength={2000}
              />
              {errors.notes && (
                <p className="text-destructive text-xs font-mono">{errors.notes}</p>
              )}
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                By submitting this request, you confirm that you are the data subject or are authorized 
                to act on their behalf. We may require identity verification before processing. 
                Requests will be processed within 30 days as required by GDPR Article 12.
              </p>
            </div>

            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full font-mono gap-2 bg-logo-green hover:bg-logo-green/90 text-background"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}