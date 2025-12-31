import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageCircle, Sparkles, Send } from "lucide-react";
import { 
  getWhatsAppShareText, 
  getDoggyQuirkyText, 
  getDoggyHashtag,
  doggyMessages 
} from "@/data/doggyWhatsAppMessages";

interface DoggyWhatsAppComposerProps {
  dogName: string;
  onShare: (text: string) => void;
  compact?: boolean;
  className?: string;
}

/**
 * WhatsApp Share Composer for Techno Doggies
 * 
 * Features:
 * - Toggle for pre-built quirky text
 * - Optional custom message input
 * - Mandatory hashtag (#aciddoggy, etc.) + landing page link
 * - Combine both or use one
 */
export const DoggyWhatsAppComposer = ({
  dogName,
  onShare,
  compact = false,
  className = ""
}: DoggyWhatsAppComposerProps) => {
  const [useQuirkyText, setUseQuirkyText] = useState(true);
  const [customMessage, setCustomMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const quirkyText = getDoggyQuirkyText(dogName);
  const hashtag = getDoggyHashtag(dogName);
  const hasQuirkyText = quirkyText.length > 0;

  // Build the final share text
  const buildShareText = useCallback(() => {
    const parts: string[] = [];
    
    // Add quirky text if enabled and available
    if (useQuirkyText && hasQuirkyText) {
      parts.push(`🖤 ${quirkyText}`);
    }
    
    // Add custom message if provided
    if (customMessage.trim()) {
      parts.push(customMessage.trim());
    }
    
    // Always add hashtag and link (mandatory)
    parts.push(`\n${hashtag}`);
    parts.push(`techno.dog/doggies`);
    
    return parts.join('\n');
  }, [useQuirkyText, hasQuirkyText, quirkyText, customMessage, hashtag]);

  const handleShare = () => {
    const text = buildShareText();
    onShare(text);
  };

  // Quick share without expansion
  const handleQuickShare = () => {
    const text = getWhatsAppShareText(dogName);
    onShare(text);
  };

  // Compact mode: just a button that opens composer
  if (compact && !isExpanded) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleQuickShare}
          className="flex-1 gap-2 border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]"
        >
          <MessageCircle className="h-4 w-4" />
          Share
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="text-muted-foreground hover:text-foreground"
          title="Customize message"
        >
          <Sparkles className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quirky text toggle */}
      {hasQuirkyText && (
        <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background/50">
          <Switch
            id="quirky-text"
            checked={useQuirkyText}
            onCheckedChange={setUseQuirkyText}
          />
          <div className="flex-1 min-w-0">
            <Label 
              htmlFor="quirky-text" 
              className="text-sm font-medium cursor-pointer"
            >
              Include doggy quote
            </Label>
            {useQuirkyText && (
              <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                "{quirkyText}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Custom message input */}
      <div className="space-y-2">
        <Label htmlFor="custom-message" className="text-sm text-muted-foreground">
          Add your own message (optional)
        </Label>
        <Textarea
          id="custom-message"
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder="Write something personal..."
          className="min-h-[60px] resize-none text-sm"
          maxLength={500}
        />
      </div>

      {/* Preview */}
      <div className="p-3 rounded-lg border border-logo-green/20 bg-logo-green/5">
        <p className="text-xs text-muted-foreground mb-1">Preview:</p>
        <p className="text-sm whitespace-pre-wrap break-words">
          {buildShareText()}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {compact && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleShare}
          className="flex-1 gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white"
        >
          <Send className="h-4 w-4" />
          Send via WhatsApp
        </Button>
      </div>
    </div>
  );
};

export default DoggyWhatsAppComposer;
