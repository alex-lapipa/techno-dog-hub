/**
 * Step 2: Visual Selection
 * 
 * Select mascot or icon from the active brand book.
 * Optional step - user can skip to next step.
 * 
 * DESIGN SYSTEM COMPLIANCE:
 * - NO emoji icons (🐕 forbidden)
 * - Use DogSilhouette component only
 */

import { useState } from 'react';
import { Search, SkipForward, Check, Hexagon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { type BrandBookType, type ApprovedMascot } from '../../hooks/useBrandBookGuidelines';
import DogSilhouette from '@/components/DogSilhouette';

interface StepVisualSelectionProps {
  brandBook: BrandBookType;
  mascots: ApprovedMascot[];
  selectedMascot: ApprovedMascot | null;
  onSelectMascot: (mascot: ApprovedMascot | null) => void;
  onSkip: () => void;
}

export function StepVisualSelection({
  brandBook,
  mascots,
  selectedMascot,
  onSelectMascot,
  onSkip,
}: StepVisualSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const isTechnoDog = brandBook === 'techno-dog';
  
  // Filter mascots by search
  const filteredMascots = mascots.filter(m => 
    m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.personality.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.traits.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // techno.dog doesn't have mascots
  if (isTechnoDog) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-mono font-bold text-foreground mb-2">
            Visual Assets
          </h2>
          <p className="text-sm text-muted-foreground">
            techno.dog uses geometric branding only. No mascots available for this brand.
          </p>
        </div>
        
        <Card className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Hexagon className="w-10 h-10 text-primary" />
          </div>
          <h3 className="font-mono text-lg mb-2">Hexagon Logo</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            The techno.dog brand uses the geometric hexagon logo exclusively. 
            Dog imagery is explicitly forbidden per brand guidelines.
          </p>
        </Card>
        
        <div className="flex justify-end">
          <Button onClick={onSkip} variant="outline">
            Continue to Product Type
            <SkipForward className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-mono font-bold text-foreground mb-2">
            Select Mascot
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose a Techno Doggy from the approved 94-variant Techno Talkies pack. 
            This step is optional.
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={onSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip
        </Button>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, personality, or trait..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Selected indicator */}
      {selectedMascot && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/30 flex items-center gap-3">
          <Check className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Selected: {selectedMascot.displayName}
            </p>
            <p className="text-xs text-muted-foreground">
              {selectedMascot.personality}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
            onClick={() => onSelectMascot(null)}
          >
            Clear
          </Button>
        </div>
      )}
      
      {/* Mascot grid */}
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pr-4">
          {filteredMascots.map((mascot) => {
            const isSelected = selectedMascot?.id === mascot.id;
            
            return (
              <Card
                key={mascot.id}
                onClick={() => onSelectMascot(mascot)}
                className={cn(
                  "p-3 cursor-pointer transition-all relative",
                  "hover:border-primary/50 hover:bg-primary/5",
                  isSelected && "border-primary bg-primary/10 ring-2 ring-primary/30",
                  !mascot.approvedForApparel && "opacity-50"
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                
                {/* Official Techno Doggy component - NO emojis allowed */}
                <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center p-2">
                  {mascot.Component ? (
                    <mascot.Component className="w-full h-full" />
                  ) : (
                    <DogSilhouette className="w-full h-full text-primary" />
                  )}
                </div>
                
                <h4 className="font-mono text-xs font-medium truncate">
                  {mascot.displayName}
                </h4>
                <p className="text-[10px] text-muted-foreground truncate">
                  {mascot.personality}
                </p>
                
                {!mascot.approvedForApparel && (
                  <Badge 
                    variant="secondary" 
                    className="mt-1 text-[9px] bg-destructive/10 text-destructive"
                  >
                    Not for apparel
                  </Badge>
                )}
              </Card>
            );
          })}
        </div>
        
        {filteredMascots.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No mascots found matching "{searchQuery}"</p>
          </div>
        )}
      </ScrollArea>
      
      <div className="text-xs text-muted-foreground">
        Showing {filteredMascots.length} of {mascots.length} mascots
      </div>
    </div>
  );
}

export default StepVisualSelection;
