/**
 * AI Model Selector/Mixer
 * 
 * Allows users to select one or multiple AI models for the creative process.
 * Each model has different creative characteristics:
 * - Grok: Youth-focused, experimental, edgy
 * - OpenAI: Balanced, reliable, nuanced
 * - Gemini: Fast, multimodal, contextual
 * - Anthropic: Thoughtful, safe, detailed
 * 
 * BRAND COMPLIANCE: Does not modify brand book settings.
 */

import { useState } from 'react';
import { Sparkles, Zap, Brain, Cpu, Blend, Check, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Available AI models with their characteristics
export interface AIModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  characteristics: string[];
  creativityLevel: 'experimental' | 'balanced' | 'conservative';
  speed: 'fast' | 'medium' | 'slow';
  icon: React.ElementType;
  color: string;
}

export const AI_MODELS: AIModelOption[] = [
  {
    id: 'grok',
    name: 'Grok',
    provider: 'xAI',
    description: 'Experimental & youth-focused. Bold, unconventional outputs with edgy creative direction.',
    characteristics: ['Edgy', 'Youth Culture', 'Experimental', 'Bold'],
    creativityLevel: 'experimental',
    speed: 'fast',
    icon: Zap,
    color: 'text-yellow-500',
  },
  {
    id: 'openai',
    name: 'GPT-5',
    provider: 'OpenAI',
    description: 'Balanced & reliable. Nuanced understanding with consistent, polished results.',
    characteristics: ['Nuanced', 'Polished', 'Versatile', 'Reliable'],
    creativityLevel: 'balanced',
    speed: 'medium',
    icon: Brain,
    color: 'text-emerald-500',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    description: 'Fast & contextual. Strong multimodal understanding with quick iterations.',
    characteristics: ['Fast', 'Contextual', 'Multimodal', 'Adaptive'],
    creativityLevel: 'balanced',
    speed: 'fast',
    icon: Sparkles,
    color: 'text-blue-500',
  },
  {
    id: 'anthropic',
    name: 'Claude',
    provider: 'Anthropic',
    description: 'Thoughtful & detailed. Careful reasoning with comprehensive creative rationales.',
    characteristics: ['Thoughtful', 'Detailed', 'Safe', 'Thorough'],
    creativityLevel: 'conservative',
    speed: 'slow',
    icon: Cpu,
    color: 'text-orange-500',
  },
];

export type SelectedModels = string[];

interface ModelSelectorProps {
  selectedModels: SelectedModels;
  onModelsChange: (models: SelectedModels) => void;
}

export function ModelSelector({
  selectedModels,
  onModelsChange,
}: ModelSelectorProps) {
  const [mixerMode, setMixerMode] = useState(selectedModels.length > 1);

  const toggleModel = (modelId: string) => {
    if (mixerMode) {
      // Multi-select mode
      if (selectedModels.includes(modelId)) {
        // Don't allow deselecting if it's the last one
        if (selectedModels.length > 1) {
          onModelsChange(selectedModels.filter(id => id !== modelId));
        }
      } else {
        onModelsChange([...selectedModels, modelId]);
      }
    } else {
      // Single-select mode
      onModelsChange([modelId]);
    }
  };

  const handleMixerToggle = (enabled: boolean) => {
    setMixerMode(enabled);
    if (!enabled && selectedModels.length > 1) {
      // Keep only the first selected model when disabling mixer
      onModelsChange([selectedModels[0]]);
    }
  };

  const getCreativityBadge = (level: AIModelOption['creativityLevel']) => {
    switch (level) {
      case 'experimental':
        return <Badge variant="outline" className="text-[9px] border-yellow-500/50 text-yellow-500">Experimental</Badge>;
      case 'balanced':
        return <Badge variant="outline" className="text-[9px] border-emerald-500/50 text-emerald-500">Balanced</Badge>;
      case 'conservative':
        return <Badge variant="outline" className="text-[9px] border-blue-500/50 text-blue-500">Conservative</Badge>;
    }
  };

  return (
    <div className="space-y-4 pt-6 border-t border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Blend className="w-4 h-4 text-primary" />
          <h3 className="font-mono text-sm uppercase tracking-wide text-muted-foreground">
            AI Model Selection
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3.5 h-3.5 text-muted-foreground/60" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[280px]">
                <p className="text-xs">
                  Choose which AI model(s) will power your design process. 
                  Each model has unique creative characteristics. Enable "Mixer Mode" 
                  to blend multiple models for diverse outputs.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Mixer Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Mixer Mode</span>
          <Switch
            checked={mixerMode}
            onCheckedChange={handleMixerToggle}
            aria-label="Enable multi-model mixing"
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground">
        {mixerMode 
          ? 'Select multiple models to blend their creative styles. Outputs will combine characteristics from all selected models.'
          : 'Select a single model to define the creative direction for your design.'}
      </p>

      {/* Model Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {AI_MODELS.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          const Icon = model.icon;
          
          return (
            <Card
              key={model.id}
              onClick={() => toggleModel(model.id)}
              className={cn(
                "relative p-4 cursor-pointer transition-all",
                "hover:border-primary/50",
                isSelected && "border-primary bg-primary/5 ring-1 ring-primary/30"
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              
              {/* Icon & Name */}
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("w-5 h-5", model.color)} />
                <div>
                  <p className="font-mono text-sm font-medium">{model.name}</p>
                  <p className="text-[10px] text-muted-foreground">{model.provider}</p>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2">
                {model.description}
              </p>
              
              {/* Characteristics */}
              <div className="flex flex-wrap gap-1 mb-2">
                {model.characteristics.slice(0, 2).map((char) => (
                  <Badge 
                    key={char} 
                    variant="secondary" 
                    className="text-[9px] px-1.5 py-0"
                  >
                    {char}
                  </Badge>
                ))}
              </div>
              
              {/* Creativity Level */}
              {getCreativityBadge(model.creativityLevel)}
            </Card>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selectedModels.length > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Active:</span>
            {selectedModels.map((id) => {
              const model = AI_MODELS.find(m => m.id === id);
              if (!model) return null;
              const Icon = model.icon;
              return (
                <Badge key={id} variant="outline" className="text-xs gap-1">
                  <Icon className={cn("w-3 h-3", model.color)} />
                  {model.name}
                </Badge>
              );
            })}
            {mixerMode && selectedModels.length > 1 && (
              <span className="text-[10px] text-primary font-mono ml-auto">
                Blended output enabled
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ModelSelector;
