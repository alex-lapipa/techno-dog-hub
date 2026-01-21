/**
 * techno.dog E-commerce Module - Promotions
 * 
 * Live Shopify discount codes and price rules management.
 * Full CRUD via Shopify Admin API integration.
 */

import { useEffect, useState } from 'react';
import { Tag, ExternalLink, RefreshCw, Plus, Percent, Gift, Trash2, Copy, Calendar, Users, Loader2, CheckCircle } from 'lucide-react';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { MODULE_CONFIG } from '../config/module-config';
import { openShopifyAdmin } from '../config/shopify-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { 
  fetchShopifyPromotions, 
  createShopifyPromotion, 
  deleteShopifyPromotion,
  getPromotionStats,
  type PromotionWithCodes,
  type CreatePromotionInput,
} from '../services/shopify-promotions.service';

export function EcommercePromotions() {
  const [promotions, setPromotions] = useState<PromotionWithCodes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, scheduled: 0, expired: 0, totalUsage: 0 });

  // Create form state
  const [newPromotion, setNewPromotion] = useState<CreatePromotionInput>({
    title: '',
    code: '',
    valueType: 'percentage',
    value: 10,
  });

  const loadPromotions = async () => {
    try {
      const data = await fetchShopifyPromotions();
      setPromotions(data);
      setStats(await getPromotionStats(data));
    } catch (error) {
      console.error('Failed to load promotions:', error);
    }
  };

  useEffect(() => {
    loadPromotions().finally(() => setIsLoading(false));
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPromotions();
    setIsRefreshing(false);
    toast.success('Promotions refreshed');
  };

  const handleCreate = async () => {
    if (!newPromotion.title || !newPromotion.code) {
      toast.error('Please fill in title and code');
      return;
    }

    setIsCreating(true);
    const result = await createShopifyPromotion(newPromotion);
    
    if (result.success) {
      toast.success('Promotion created!', { 
        description: `Code: ${newPromotion.code}` 
      });
      setShowCreateDialog(false);
      setNewPromotion({ title: '', code: '', valueType: 'percentage', value: 10 });
      await loadPromotions();
    }
    setIsCreating(false);
  };

  const handleDelete = async (priceRuleId: number, code: string) => {
    if (!confirm(`Delete promotion "${code}"?`)) return;
    
    const success = await deleteShopifyPromotion(priceRuleId);
    if (success) {
      await loadPromotions();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-logo-green/20 text-logo-green border-logo-green/30';
      case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'expired': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <AdminPageLayout
      title="Promotions"
      description="Live Shopify discount codes & price rules"
      icon={Tag}
      iconColor="text-logo-green"
      isLoading={isLoading}
      actions={
        <div className="flex items-center gap-2">
          {MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
            <ReadOnlyBadge />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="font-mono text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="font-mono text-xs bg-logo-green hover:bg-logo-green/90">
                <Plus className="w-3 h-3 mr-1" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-mono">Create Discount</DialogTitle>
                <DialogDescription>
                  Create a new price rule with discount code
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Title</Label>
                  <Input
                    placeholder="Summer Sale"
                    value={newPromotion.title}
                    onChange={(e) => setNewPromotion(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Discount Code</Label>
                  <Input
                    placeholder="SUMMER20"
                    value={newPromotion.code}
                    onChange={(e) => setNewPromotion(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    className="font-mono uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">Type</Label>
                    <Select
                      value={newPromotion.valueType}
                      onValueChange={(v: 'percentage' | 'fixed_amount') => 
                        setNewPromotion(p => ({ ...p, valueType: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-mono text-xs">
                      Value {newPromotion.valueType === 'percentage' ? '(%)' : '(€)'}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max={newPromotion.valueType === 'percentage' ? 100 : undefined}
                      value={newPromotion.value}
                      onChange={(e) => setNewPromotion(p => ({ ...p, value: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs">Usage Limit (optional)</Label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={newPromotion.usageLimit || ''}
                    onChange={(e) => setNewPromotion(p => ({ 
                      ...p, 
                      usageLimit: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreate} 
                  disabled={isCreating}
                  className="bg-logo-green hover:bg-logo-green/90"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Create Discount
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Card className="p-3 bg-card border-border">
            <p className="font-mono text-[10px] text-muted-foreground uppercase">Total</p>
            <p className="text-xl font-mono font-bold text-foreground">{stats.total}</p>
          </Card>
          <Card className="p-3 bg-card border-logo-green/30">
            <p className="font-mono text-[10px] text-logo-green uppercase">Active</p>
            <p className="text-xl font-mono font-bold text-logo-green">{stats.active}</p>
          </Card>
          <Card className="p-3 bg-card border-blue-500/30">
            <p className="font-mono text-[10px] text-blue-400 uppercase">Scheduled</p>
            <p className="text-xl font-mono font-bold text-blue-400">{stats.scheduled}</p>
          </Card>
          <Card className="p-3 bg-card border-border">
            <p className="font-mono text-[10px] text-muted-foreground uppercase">Expired</p>
            <p className="text-xl font-mono font-bold text-muted-foreground">{stats.expired}</p>
          </Card>
          <Card className="p-3 bg-card border-border">
            <p className="font-mono text-[10px] text-muted-foreground uppercase">Total Uses</p>
            <p className="text-xl font-mono font-bold text-foreground">{stats.totalUsage}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="p-4 bg-card border-border hover:border-logo-green/50 transition-colors cursor-pointer group"
            onClick={() => openShopifyAdmin('discountsNew')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-logo-green/10 rounded group-hover:bg-logo-green/20 transition-colors">
                <Plus className="w-4 h-4 text-logo-green" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-foreground">
                  Shopify Discounts
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Advanced options
                </p>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
            </div>
          </Card>

          <Card 
            className="p-4 bg-card border-border hover:border-logo-green/50 transition-colors cursor-pointer group"
            onClick={() => openShopifyAdmin('discounts')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/50 rounded group-hover:bg-muted transition-colors">
                <Percent className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-foreground">
                  All Discounts
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  View in Shopify
                </p>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
            </div>
          </Card>

          <Card 
            className="p-4 bg-card border-border hover:border-logo-green/50 transition-colors cursor-pointer group"
            onClick={() => openShopifyAdmin('discountsAutomatic')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted/50 rounded group-hover:bg-muted transition-colors">
                <Gift className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-foreground">
                  Automatic Discounts
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Cart-level offers
                </p>
              </div>
              <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
            </div>
          </Card>
        </div>

        <Separator />

        {/* Promotions List */}
        <div className="space-y-3">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Active Discount Codes
          </h3>

          {promotions.length === 0 ? (
            <Card className="p-8 bg-card border-border text-center">
              <Tag className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="font-mono text-sm text-muted-foreground">
                No discount codes yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first promotion using the button above
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {promotions.map((promo) => (
                <Card 
                  key={promo.id}
                  className="p-4 bg-card border-border hover:border-logo-green/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-2 bg-logo-green/10 rounded">
                        {promo.type === 'percentage_discount' ? (
                          <Percent className="w-4 h-4 text-logo-green" />
                        ) : promo.type === 'free_shipping' ? (
                          <Gift className="w-4 h-4 text-logo-green" />
                        ) : (
                          <Tag className="w-4 h-4 text-logo-green" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm font-bold text-foreground">
                            {promo.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={() => copyCode(promo.code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Badge className={`text-[10px] ${getStatusColor(promo.status)}`}>
                            {promo.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {promo.title} — {promo.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span className="font-mono">
                          {promo.usageCount}{promo.usageLimit ? `/${promo.usageLimit}` : ''}
                        </span>
                      </div>
                      
                      {promo.endsAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="font-mono">
                            {new Date(promo.endsAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(promo.priceRuleId, promo.code)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminPageLayout>
  );
}

export default EcommercePromotions;
