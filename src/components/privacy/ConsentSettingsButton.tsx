import { Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConsentManager } from '@/hooks/useConsentManager';

export function ConsentSettingsButton() {
  const { openSettings } = useConsentManager();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={openSettings}
      className="font-mono text-xs gap-1.5 text-muted-foreground hover:text-foreground"
    >
      <Cookie className="w-3.5 h-3.5" />
      Cookie Settings
    </Button>
  );
}

export default ConsentSettingsButton;
