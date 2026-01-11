import { useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Shield, 
  FileText, 
  Trash2, 
  Ban, 
  Share2, 
  Download,
  Edit,
  Lock,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const requestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  request_type: z.enum(['know', 'delete', 'opt_out_sale', 'opt_out_share', 'correct', 'limit_sensitive', 'portability']),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
});

type RequestType = z.infer<typeof requestSchema>['request_type'];

const requestTypeConfig: Record<RequestType, { label: string; description: string; icon: typeof FileText }> = {
  know: {
    label: 'Right to Know',
    description: 'Request to know what personal information we collect, use, disclose, and sell',
    icon: FileText,
  },
  delete: {
    label: 'Right to Delete',
    description: 'Request deletion of your personal information',
    icon: Trash2,
  },
  opt_out_sale: {
    label: 'Do Not Sell My Info',
    description: 'Opt-out of the sale of your personal information',
    icon: Ban,
  },
  opt_out_share: {
    label: 'Do Not Share My Info',
    description: 'Opt-out of sharing your personal information for cross-context behavioral advertising',
    icon: Share2,
  },
  correct: {
    label: 'Right to Correct',
    description: 'Request correction of inaccurate personal information',
    icon: Edit,
  },
  limit_sensitive: {
    label: 'Limit Sensitive Data Use',
    description: 'Limit the use and disclosure of sensitive personal information',
    icon: Lock,
  },
  portability: {
    label: 'Right to Portability',
    description: 'Request a copy of your personal information in a portable format',
    icon: Download,
  },
};

const hashEmail = async (email: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase() + 'ccpa_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
};

export function CCPARequestForm() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [requestType, setRequestType] = useState<RequestType>('know');
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
      const verificationToken = crypto.randomUUID();

      const { error } = await supabase.from('ccpa_subject_requests').insert({
        email: email.trim(),
        request_type: requestType,
        notes: notes.trim() || null,
        verification_token: verificationToken,
      });

      if (error) throw error;

      // Log to privacy audit
      await supabase.from('privacy_audit_log').insert({
        action_type: 'ccpa_request_submitted',
        details: { request_type: requestType, email_hash: await hashEmail(email) },
      });

      setIsSuccess(true);
      toast({
        title: 'Request Submitted',
        description: 'We will respond within 45 days as required by CCPA.',
      });
    } catch (error) {
      console.error('Error submitting CCPA request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setEmail('');
      setRequestType('know');
      setNotes('');
      setErrors({});
    }, 300);
  };

  const SelectedIcon = requestTypeConfig[requestType].icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono text-xs gap-2">
          <Shield className="w-4 h-4" />
          California Privacy Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-logo-green" />
            CCPA/CPRA Privacy Request
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Exercise your rights under the California Consumer Privacy Act (CCPA) and 
            California Privacy Rights Act (CPRA). We will respond within 45 days.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-logo-green mx-auto" />
            <div>
              <h3 className="font-mono text-lg text-foreground">Request Submitted</h3>
              <p className="font-mono text-xs text-muted-foreground mt-2">
                We have received your {requestTypeConfig[requestType].label.toLowerCase()} request.
                You will receive a confirmation email and we will respond within 45 days as required by California law.
              </p>
            </div>
            <Button onClick={handleClose} className="font-mono text-xs">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="font-mono text-sm"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-destructive text-xs font-mono">{errors.email}</p>
              )}
              <p className="text-muted-foreground text-[10px] font-mono">
                We will use this to verify your identity and send our response.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="font-mono text-xs">Request Type *</Label>
              <RadioGroup
                value={requestType}
                onValueChange={(v) => setRequestType(v as RequestType)}
                className="space-y-2"
                disabled={isSubmitting}
              >
                {(Object.entries(requestTypeConfig) as [RequestType, typeof requestTypeConfig[RequestType]][]).map(
                  ([type, config]) => (
                    <div
                      key={type}
                      className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                        requestType === type
                          ? 'border-logo-green bg-logo-green/5'
                          : 'border-border hover:border-muted-foreground/50'
                      }`}
                    >
                      <RadioGroupItem value={type} id={type} className="mt-0.5" />
                      <div className="flex-1">
                        <Label
                          htmlFor={type}
                          className="font-mono text-xs font-medium cursor-pointer flex items-center gap-2"
                        >
                          <config.icon className="w-3.5 h-3.5 text-muted-foreground" />
                          {config.label}
                        </Label>
                        <p className="font-mono text-[10px] text-muted-foreground mt-1">
                          {config.description}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-mono text-xs">
                Additional Details (Optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Provide any additional context..."
                className="font-mono text-sm min-h-[80px]"
                disabled={isSubmitting}
              />
              {errors.notes && (
                <p className="text-destructive text-xs font-mono">{errors.notes}</p>
              )}
            </div>

            <div className="bg-muted/30 border border-border p-3 rounded-lg">
              <p className="font-mono text-[10px] text-muted-foreground">
                <strong>Verification:</strong> We may need to verify your identity before processing this request.
                We do not discriminate against consumers who exercise their CCPA rights.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="font-mono text-xs flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="font-mono text-xs flex-1 bg-logo-green text-background hover:bg-logo-green/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <SelectedIcon className="w-3.5 h-3.5 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CCPARequestForm;