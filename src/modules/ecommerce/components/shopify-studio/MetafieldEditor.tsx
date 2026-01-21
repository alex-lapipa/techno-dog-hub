/**
 * Metafield Editor - Shopify custom metafield management
 * 
 * SHOPIFY-FIRST: Manages metafields per Shopify Admin API spec.
 * Supports namespaces, types, and validation.
 */

import { useState } from 'react';
import { Database, Plus, Trash2, Info, Package, Palette, Shirt } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// Shopify metafield types
const METAFIELD_TYPES = [
  { value: 'single_line_text_field', label: 'Single Line Text' },
  { value: 'multi_line_text_field', label: 'Multi-Line Text' },
  { value: 'number_integer', label: 'Integer' },
  { value: 'number_decimal', label: 'Decimal' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'json', label: 'JSON' },
  { value: 'url', label: 'URL' },
  { value: 'color', label: 'Color' },
] as const;

// Pre-defined metafield templates for POD products
const METAFIELD_PRESETS = {
  fabric: {
    namespace: 'custom',
    key: 'fabric_composition',
    value: '100% Organic Cotton',
    type: 'single_line_text_field' as const,
    icon: Shirt,
    description: 'Material composition',
  },
  printArea: {
    namespace: 'custom',
    key: 'print_area',
    value: 'front_chest',
    type: 'single_line_text_field' as const,
    icon: Package,
    description: 'Print placement zones',
  },
  colorCode: {
    namespace: 'custom',
    key: 'brand_color',
    value: '#66ff66',
    type: 'color' as const,
    icon: Palette,
    description: 'Brand color reference',
  },
};

export interface Metafield {
  namespace: string;
  key: string;
  value: string;
  type: string;
}

interface MetafieldEditorProps {
  metafields: Metafield[];
  onChange: (metafields: Metafield[]) => void;
  productType?: string;
}

export function MetafieldEditor({
  metafields,
  onChange,
  productType,
}: MetafieldEditorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMetafield, setNewMetafield] = useState<Metafield>({
    namespace: 'custom',
    key: '',
    value: '',
    type: 'single_line_text_field',
  });

  const addMetafield = (metafield: Metafield) => {
    if (!metafield.key || !metafield.value) return;
    
    // Check for duplicates
    const exists = metafields.some(
      m => m.namespace === metafield.namespace && m.key === metafield.key
    );
    if (exists) return;

    onChange([...metafields, metafield]);
    setNewMetafield({
      namespace: 'custom',
      key: '',
      value: '',
      type: 'single_line_text_field',
    });
    setShowAddForm(false);
  };

  const addPreset = (preset: keyof typeof METAFIELD_PRESETS) => {
    const data = METAFIELD_PRESETS[preset];
    addMetafield({
      namespace: data.namespace,
      key: data.key,
      value: data.value,
      type: data.type,
    });
  };

  const updateMetafield = (index: number, updates: Partial<Metafield>) => {
    const updated = [...metafields];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeMetafield = (index: number) => {
    onChange(metafields.filter((_, i) => i !== index));
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-mono font-bold text-sm flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          Metafields
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-[200px]">
                Custom product data stored in Shopify. Used for filtering, 
                fulfillment provider integration, and custom storefront features.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Quick Add Presets */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(METAFIELD_PRESETS).map(([key, preset]) => {
          const Icon = preset.icon;
          const isAdded = metafields.some(
            m => m.namespace === preset.namespace && m.key === preset.key
          );
          return (
            <Button
              key={key}
              variant={isAdded ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => !isAdded && addPreset(key as keyof typeof METAFIELD_PRESETS)}
              disabled={isAdded}
              className="gap-1 text-xs"
            >
              <Icon className="w-3 h-3" />
              {preset.description}
              {isAdded && <Badge className="ml-1 text-[10px]">Added</Badge>}
            </Button>
          );
        })}
      </div>

      {/* Existing Metafields */}
      {metafields.length > 0 && (
        <div className="space-y-2">
          {metafields.map((metafield, index) => (
            <div
              key={`${metafield.namespace}:${metafield.key}`}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
            >
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div className="font-mono text-xs">
                  <span className="text-muted-foreground">{metafield.namespace}:</span>
                  <span className="font-bold">{metafield.key}</span>
                </div>
                <Input
                  value={metafield.value}
                  onChange={(e) => updateMetafield(index, { value: e.target.value })}
                  className="h-7 text-xs font-mono"
                />
                <Badge variant="outline" className="text-[10px] w-fit">
                  {metafield.type.replace('_field', '')}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMetafield(index)}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Metafield */}
      {showAddForm ? (
        <div className="border border-border rounded-lg p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Namespace</Label>
              <Input
                value={newMetafield.namespace}
                onChange={(e) => setNewMetafield(prev => ({ ...prev, namespace: e.target.value }))}
                placeholder="custom"
                className="h-8 text-xs font-mono"
              />
            </div>
            <div>
              <Label className="text-xs">Key</Label>
              <Input
                value={newMetafield.key}
                onChange={(e) => setNewMetafield(prev => ({ ...prev, key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                placeholder="field_name"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Value</Label>
              <Input
                value={newMetafield.value}
                onChange={(e) => setNewMetafield(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Field value"
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select
                value={newMetafield.type}
                onValueChange={(v) => setNewMetafield(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METAFIELD_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-xs">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={() => addMetafield(newMetafield)}
              disabled={!newMetafield.key || !newMetafield.value}
            >
              Add Metafield
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          className="w-full gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Custom Metafield
        </Button>
      )}
    </Card>
  );
}

export default MetafieldEditor;
