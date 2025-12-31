import { useState, useCallback } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { 
  getWhatsAppShareUrl, 
  getTelegramShareUrl, 
  getTwitterShareUrl, 
  getLinkedInShareUrl 
} from '@/config/og-config';
import { cn } from '@/lib/utils';

interface ShareDrawerProps {
  url: string;
  title: string;
  description?: string;
  /** Custom trigger element */
  trigger?: React.ReactNode;
  /** Additional class for trigger button */
  triggerClassName?: string;
}

// WhatsApp icon (green brand color on hover)
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export function ShareDrawer({ 
  url, 
  title, 
  description, 
  trigger,
  triggerClassName 
}: ShareDrawerProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  }, [url]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
        toast.success('Shared');
        setIsOpen(false);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast.error('Share failed');
        }
      }
    }
  }, [title, description, url]);

  const shareButtons = [
    {
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      href: getWhatsAppShareUrl(url, title, description),
      className: 'hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]/30',
      priority: true,
    },
    {
      name: 'Telegram',
      icon: TelegramIcon,
      href: getTelegramShareUrl(url, title),
      className: 'hover:bg-[#0088cc]/10 hover:text-[#0088cc] hover:border-[#0088cc]/30',
    },
    {
      name: 'X / Twitter',
      icon: XIcon,
      href: getTwitterShareUrl(url, title),
      className: 'hover:bg-foreground/10 hover:border-foreground/30',
    },
    {
      name: 'LinkedIn',
      icon: LinkedInIcon,
      href: getLinkedInShareUrl(url),
      className: 'hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/30',
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm" 
            className={cn(
              "gap-2 border-logo-green/30 hover:border-logo-green hover:bg-logo-green/10",
              triggerClassName
            )}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl bg-background border-t border-border/50">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center text-foreground">Share this page</SheetTitle>
        </SheetHeader>
        
        {/* Preview card */}
        <div className="mb-6 p-3 rounded-lg bg-muted/50 border border-border/30">
          <p className="font-medium text-foreground truncate">{title}</p>
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
          )}
          <p className="text-xs text-muted-foreground/70 mt-2 truncate">{url}</p>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {shareButtons.map((btn) => (
            <a
              key={btn.name}
              href={btn.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border border-border/50 transition-all duration-200",
                "text-foreground hover:scale-[1.02]",
                btn.className,
                btn.priority && "col-span-2 bg-[#25D366]/5 border-[#25D366]/20"
              )}
            >
              <btn.icon className="h-5 w-5" />
              <span className="font-medium">{btn.name}</span>
              {btn.priority && (
                <span className="ml-auto text-xs bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded">
                  Recommended
                </span>
              )}
            </a>
          ))}
        </div>

        {/* Utility actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-logo-green" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy link
              </>
            )}
          </Button>
          
          {typeof navigator !== 'undefined' && navigator.share && (
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleNativeShare}
            >
              <ExternalLink className="h-4 w-4" />
              More options
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default ShareDrawer;
