import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Cookie, 
  Shield, 
  BarChart3, 
  Megaphone, 
  Sparkles,
  Settings,
  Check,
  X
} from 'lucide-react';
import { useConsentManager, ConsentPreferences } from '@/hooks/useConsentManager';
import { cn } from '@/lib/utils';

export function CookieConsentBanner() {
  const {
    preferences,
    showBanner,
    setShowBanner,
    acceptAll,
    rejectAll,
    savePreferences,
    hasInteracted,
  } = useConsentManager();

  const [showDetails, setShowDetails] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<ConsentPreferences>(preferences);

  if (!showBanner) return null;

  const consentTypes = [
    {
      key: 'essential' as const,
      label: 'Essential',
      description: 'Required for the website to function. Cannot be disabled.',
      icon: Shield,
      required: true,
    },
    {
      key: 'analytics' as const,
      label: 'Analytics',
      description: 'Help us understand how visitors interact with our website.',
      icon: BarChart3,
      required: false,
    },
    {
      key: 'marketing' as const,
      label: 'Marketing',
      description: 'Used to deliver relevant ads and track campaign effectiveness.',
      icon: Megaphone,
      required: false,
    },
    {
      key: 'personalization' as const,
      label: 'Personalization',
      description: 'Remember your preferences for a customized experience.',
      icon: Sparkles,
      required: false,
    },
  ];

  const handleSaveCustom = () => {
    savePreferences(tempPreferences);
    setShowDetails(false);
  };

  // Simple banner view
  if (!showDetails) {
    return (
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-[9999] p-4 bg-card/95 backdrop-blur-lg border-t border-border",
        "animate-in slide-in-from-bottom-4 duration-300"
      )}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="w-6 h-6 text-logo-green shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-mono text-sm text-foreground">
                  We use cookies to enhance your experience
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  We use cookies and similar technologies to provide a better experience, 
                  analyze traffic, and for personalization. Read our{' '}
                  <Link to="/privacy" className="text-logo-green hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link to="/cookies" className="text-logo-green hover:underline">
                    Cookie Policy
                  </Link>.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(true)}
                className="font-mono text-xs gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={rejectAll}
                className="font-mono text-xs gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <X className="w-3.5 h-3.5" />
                Reject All
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="font-mono text-xs gap-1.5 bg-logo-green text-background hover:bg-logo-green/90"
              >
                <Check className="w-3.5 h-3.5" />
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed preferences dialog
  return (
    <Dialog open={showDetails} onOpenChange={setShowDetails}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg flex items-center gap-2">
            <Cookie className="w-5 h-5 text-logo-green" />
            Cookie Preferences
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Manage your cookie preferences. You can change these settings at any time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {consentTypes.map((type) => (
            <div
              key={type.key}
              className="flex items-start gap-4 p-3 rounded-lg border border-border bg-muted/30"
            >
              <type.icon className={cn(
                "w-5 h-5 mt-0.5 shrink-0",
                type.required ? "text-logo-green" : "text-muted-foreground"
              )} />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium">
                    {type.label}
                    {type.required && (
                      <span className="ml-2 text-[10px] text-logo-green uppercase">
                        Required
                      </span>
                    )}
                  </span>
                  <Switch
                    checked={type.required || tempPreferences[type.key]}
                    disabled={type.required}
                    onCheckedChange={(checked) => {
                      setTempPreferences(prev => ({
                        ...prev,
                        [type.key]: checked,
                      }));
                    }}
                    className="data-[state=checked]:bg-logo-green"
                  />
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  {type.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <p className="font-mono text-[10px] text-muted-foreground mb-4">
            For more information, see our{' '}
            <Link to="/privacy" className="text-logo-green hover:underline">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/cookies" className="text-logo-green hover:underline">
              Cookie Policy
            </Link>.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={rejectAll}
            className="font-mono text-xs"
          >
            Reject All
          </Button>
          <Button
            onClick={handleSaveCustom}
            className="font-mono text-xs bg-logo-green text-background hover:bg-logo-green/90"
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CookieConsentBanner;
