import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Ban, Shield, CheckCircle2 } from 'lucide-react';

const CCPA_STORAGE_KEY = 'technodog_ccpa_preferences';

interface CCPAPreferences {
  doNotSell: boolean;
  doNotShare: boolean;
  limitSensitive: boolean;
  updatedAt: string;
}

const generateSessionId = (): string => {
  const existing = sessionStorage.getItem('technodog_session_id');
  if (existing) return existing;
  const newId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('technodog_session_id', newId);
  return newId;
};

const hashForPrivacy = async (value: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(value + 'technodog_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
};

export function DoNotSellLink() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState<CCPAPreferences>({
    doNotSell: false,
    doNotShare: false,
    limitSensitive: false,
    updatedAt: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    const stored = localStorage.getItem(CCPA_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
      } catch {
        // Invalid stored data
      }
    }

    // Check for Global Privacy Control (GPC) signal
    if ((navigator as any).globalPrivacyControl) {
      setPreferences(prev => ({
        ...prev,
        doNotSell: true,
        doNotShare: true,
      }));
      // Log GPC signal detection
      logGPCSignal(true);
    }
  }, []);

  const logGPCSignal = async (gpcEnabled: boolean) => {
    const sessionId = generateSessionId();
    const userAgentHash = await hashForPrivacy(navigator.userAgent);
    
    await supabase.from('gpc_signals').insert({
      session_id: sessionId,
      gpc_enabled: gpcEnabled,
      user_agent_hash: userAgentHash,
    });

    await supabase.from('privacy_audit_log').insert({
      action_type: 'gpc_signal_detected',
      session_id: sessionId,
      details: { gpc_enabled: gpcEnabled },
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const sessionId = generateSessionId();
      const userAgentHash = await hashForPrivacy(navigator.userAgent);
      const { data: { user } } = await supabase.auth.getUser();

      const updatedPrefs = {
        ...preferences,
        updatedAt: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem(CCPA_STORAGE_KEY, JSON.stringify(updatedPrefs));
      setPreferences(updatedPrefs);

      // Log each preference change
      if (preferences.doNotSell) {
        await supabase.from('privacy_audit_log').insert({
          action_type: 'ccpa_do_not_sell',
          session_id: sessionId,
          user_id: user?.id || null,
          details: { enabled: true },
        });
      }

      if (preferences.doNotShare) {
        await supabase.from('privacy_audit_log').insert({
          action_type: 'ccpa_opt_out_share',
          session_id: sessionId,
          user_id: user?.id || null,
          details: { enabled: true },
        });
      }

      if (preferences.limitSensitive) {
        await supabase.from('privacy_audit_log').insert({
          action_type: 'ccpa_limit_sensitive',
          session_id: sessionId,
          user_id: user?.id || null,
          details: { enabled: true },
        });
      }

      // Update consent records with CCPA preferences
      await supabase.from('consent_records').insert({
        session_id: sessionId,
        user_id: user?.id || null,
        consent_type: 'ccpa_sale',
        is_granted: !preferences.doNotSell,
        user_agent_hash: userAgentHash,
        consent_version: '1.0',
        jurisdiction: 'ccpa',
        do_not_sell: preferences.doNotSell,
        do_not_share: preferences.doNotShare,
        limit_sensitive_data: preferences.limitSensitive,
      });

      // Update Google Consent Mode for advertising
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('consent', 'update', {
          ad_storage: preferences.doNotSell || preferences.doNotShare ? 'denied' : 'granted',
          ad_user_data: preferences.doNotSell || preferences.doNotShare ? 'denied' : 'granted',
          ad_personalization: preferences.doNotSell || preferences.doNotShare ? 'denied' : 'granted',
        });
      }

      setShowSuccess(true);
      toast({
        title: 'Preferences Saved',
        description: 'Your California privacy preferences have been updated.',
      });
    } catch (error) {
      console.error('Error saving CCPA preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setShowSuccess(false), 300);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button 
          variant="link" 
          size="sm" 
          className="font-mono text-xs text-muted-foreground hover:text-foreground p-0 h-auto underline-offset-4 hover:underline"
        >
          Do Not Sell or Share My Personal Information
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg flex items-center gap-2">
            <Ban className="w-5 h-5 text-logo-green" />
            California Privacy Choices
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Under CCPA/CPRA, California residents have the right to opt-out of the sale or 
            sharing of their personal information.
          </DialogDescription>
        </DialogHeader>

        {showSuccess ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-logo-green mx-auto" />
            <div>
              <h3 className="font-mono text-lg text-foreground">Preferences Saved</h3>
              <p className="font-mono text-xs text-muted-foreground mt-2">
                Your California privacy preferences have been updated and will be honored across our services.
              </p>
            </div>
            <Button onClick={handleClose} className="font-mono text-xs">
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-4">
              {/* GPC Notice */}
              {(navigator as any).globalPrivacyControl && (
                <div className="bg-logo-green/10 border border-logo-green/30 p-3 rounded-lg">
                  <p className="font-mono text-xs text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-logo-green" />
                    Global Privacy Control (GPC) signal detected and honored.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="do-not-sell" className="font-mono text-sm font-medium">
                    Do Not Sell My Personal Information
                  </Label>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Opt-out of the "sale" of your personal information as defined by CCPA
                  </p>
                </div>
                <Switch
                  id="do-not-sell"
                  checked={preferences.doNotSell}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, doNotSell: checked }))
                  }
                  className="data-[state=checked]:bg-logo-green"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="do-not-share" className="font-mono text-sm font-medium">
                    Do Not Share My Personal Information
                  </Label>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Opt-out of sharing for cross-context behavioral advertising
                  </p>
                </div>
                <Switch
                  id="do-not-share"
                  checked={preferences.doNotShare}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, doNotShare: checked }))
                  }
                  className="data-[state=checked]:bg-logo-green"
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="limit-sensitive" className="font-mono text-sm font-medium">
                    Limit Use of Sensitive Data
                  </Label>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Limit the use and disclosure of sensitive personal information
                  </p>
                </div>
                <Switch
                  id="limit-sensitive"
                  checked={preferences.limitSensitive}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, limitSensitive: checked }))
                  }
                  className="data-[state=checked]:bg-logo-green"
                />
              </div>
            </div>

            <div className="bg-muted/30 border border-border p-3 rounded-lg">
              <p className="font-mono text-[10px] text-muted-foreground">
                <strong>Note:</strong> We do not currently sell personal information. 
                However, we honor these preferences as a commitment to your privacy rights.
                These settings apply to this browser. You may need to set them again on other devices.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="font-mono text-xs"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="font-mono text-xs bg-logo-green text-background hover:bg-logo-green/90"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default DoNotSellLink;