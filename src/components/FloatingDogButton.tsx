import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import HexagonLogo from '@/components/HexagonLogo';
import DogChat from '@/components/admin/DogChat';

const FloatingDogButton = () => {
  const [dogChatOpen, setDogChatOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setDogChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-background/80 backdrop-blur-sm border border-logo-green/40 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-background/90 hover:border-logo-green hover:shadow-[0_0_20px_hsl(100_100%_60%/0.4)] group"
        aria-label="Open Dog AI Assistant"
      >
        <HexagonLogo className="w-9 h-9 transition-transform duration-300 group-hover:rotate-6 drop-shadow-[0_0_6px_hsl(100_100%_60%/0.5)]" />
      </button>

      <Dialog open={dogChatOpen} onOpenChange={setDogChatOpen}>
        <DialogContent className="max-w-2xl h-[80vh] p-0 overflow-hidden bg-background border-logo-green/30">
          <DialogTitle className="sr-only">Dog AI Assistant</DialogTitle>
          <DogChat />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingDogButton;
