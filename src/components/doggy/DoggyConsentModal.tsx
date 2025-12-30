import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Check, Download, Shield, Smartphone, MessageCircle } from "lucide-react";

interface DoggyConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
  isIOS: boolean;
  isAndroid: boolean;
}

const DoggyConsentModal = ({
  open,
  onOpenChange,
  onAccept,
  onDecline,
  isIOS,
  isAndroid,
}: DoggyConsentModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-lg border-logo-green/30">
        <DialogHeader>
          <DialogTitle className="font-mono text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-logo-green" />
            Authorization Required
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">
            Install Techno Dog stickers on your device
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* What will happen */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <Download className="w-5 h-5 text-logo-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-mono text-xs font-medium text-foreground">Sticker Files</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {isIOS 
                    ? "512×512 WebP files will be saved to your Photos" 
                    : isAndroid 
                      ? "512×512 WebP files will download to your device"
                      : "512×512 WebP sticker files will download"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              <Smartphone className="w-5 h-5 text-logo-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-mono text-xs font-medium text-foreground">Works Offline</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Once installed, stickers work forever—no connection needed
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 rounded-lg bg-logo-green/10 border border-logo-green/20">
              <MessageCircle className="w-5 h-5 text-logo-green mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-mono text-xs font-medium text-foreground">Third-Party App Required</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {isIOS || isAndroid 
                    ? "'Sticker Maker' app (free) is needed to add stickers to WhatsApp" 
                    : "Transfer to phone, then use 'Sticker Maker' app"}
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
              By proceeding, you agree to download Techno Dog sticker files to your device. 
              These files are for personal use and can be used in any messaging app. 
              No personal data is collected or transmitted.
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button 
            variant="outline" 
            onClick={onDecline}
            className="flex-1 font-mono text-sm h-12 border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
          >
            Decline
          </Button>
          <Button 
            onClick={onAccept}
            className="flex-1 font-mono text-sm h-12 bg-logo-green hover:bg-logo-green/90 text-background shadow-lg shadow-logo-green/30"
          >
            <Check className="w-5 h-5 mr-2" />
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DoggyConsentModal;
