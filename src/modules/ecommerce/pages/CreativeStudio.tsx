/**
 * techno.dog E-commerce Module - Creative Studio
 * 
 * Design tools integrated with brand books (used for validation, not displayed).
 * Only Alex Lawton can create designs outside brand guidelines.
 */

import { useState } from 'react';
import { Palette, Lock, Shield, AlertTriangle, Plus, Check, X, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { BrandBookToggle } from '../components/BrandBookToggle';
import { useBrandBookGuidelines, type BrandBookType } from '../hooks/useBrandBookGuidelines';

export function CreativeStudio() {
  const {
    activeBrandBook,
    isLoading,
    isOwner,
    canCreateCustomDesigns,
    activeGuidelines,
    switchBrandBook,
    validateProduct,
  } = useBrandBookGuidelines();

  // Demo product validation
  const [demoValidation, setDemoValidation] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);

  const handleBrandBookChange = async (brandBook: BrandBookType) => {
    await switchBrandBook(brandBook);
    setDemoValidation(null);
  };

  const handleTestValidation = () => {
    const result = validateProduct({
      mascotId: 'dj-dog',
      productType: 'Hoodie',
      fabricColor: 'black',
      strokeColor: '#66ff66',
      customDesign: false,
    });
    setDemoValidation(result);
  };

  const handleTestCustomDesign = () => {
    const result = validateProduct({
      customDesign: true,
    });
    setDemoValidation(result);
  };

  return (
    <AdminPageLayout
      title="Creative Studio"
      description="Create products using brand guidelines"
      icon={Palette}
      iconColor="text-crimson"
      actions={
        <div className="flex items-center gap-2">
          {isOwner ? (
            <Badge className="bg-logo-green/10 text-logo-green border-logo-green/20 font-mono text-[10px] uppercase">
              <Shield className="w-3 h-3 mr-1" />
              Owner Access
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-destructive/10 text-destructive font-mono text-[10px] uppercase">
              <Lock className="w-3 h-3 mr-1" />
              Guidelines Enforced
            </Badge>
          )}
          {MODULE_CONFIG.READ_ONLY && MODULE_CONFIG.UI.SHOW_READ_ONLY_BADGE && (
            <ReadOnlyBadge />
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Brand Book Toggle */}
        <Card className="p-4 bg-card border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-mono text-sm uppercase tracking-wide text-foreground font-medium">
                Active Brand Guidelines
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                All product designs are validated against the selected guidelines
              </p>
            </div>
            <BrandBookToggle
              value={activeBrandBook}
              onChange={handleBrandBookChange}
              disabled={isLoading}
            />
          </div>
        </Card>

        {/* Owner Notice or Enforcement Notice */}
        {isOwner ? (
          <Alert className="border-logo-green/30 bg-logo-green/5">
            <Shield className="w-4 h-4 text-logo-green" />
            <AlertDescription className="text-sm">
              <strong>Owner Access:</strong> You can create custom designs outside standard guidelines.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-destructive/30 bg-destructive/5">
            <Lock className="w-4 h-4 text-destructive" />
            <AlertDescription className="text-sm">
              <strong>Guidelines Enforced:</strong> All designs must follow {activeGuidelines.name} standards. 
              Only <strong>Alex Lawton</strong> can override.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Creation Panel */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-mono text-sm uppercase tracking-wide text-foreground font-medium">
                  Create Product
                </h3>
                <p className="text-xs text-muted-foreground">
                  Using {activeGuidelines.name} guidelines
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Design new products that comply with brand standards. All designs are automatically validated.
            </p>

            {activeBrandBook === 'techno-doggies' && (
              <div className="p-3 bg-muted/30 rounded border border-border/50 mb-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="font-mono text-lg text-foreground">{activeGuidelines.mascots.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Mascots</p>
                  </div>
                  <div>
                    <p className="font-mono text-lg text-foreground">{activeGuidelines.products.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Products</p>
                  </div>
                  <div>
                    <p className="font-mono text-lg text-foreground">{activeGuidelines.colors.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Colors</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link to="/admin/ecommerce/products">
                  View Products
                </Link>
              </Button>
              <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Design
              </Button>
            </div>
          </Card>

          {/* Validation Panel */}
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-muted/50 rounded">
                <Check className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-mono text-sm uppercase tracking-wide text-foreground font-medium">
                  Design Validation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Test designs against guidelines
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <Button 
                onClick={handleTestValidation} 
                variant="outline" 
                className="w-full justify-start"
                size="sm"
              >
                <Check className="w-4 h-4 mr-2 text-logo-green" />
                Test Compliant Design
              </Button>
              
              <Button 
                onClick={handleTestCustomDesign} 
                variant="outline" 
                className="w-full justify-start"
                size="sm"
              >
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                Test Custom Design
              </Button>
            </div>

            {demoValidation ? (
              <div className="space-y-3">
                <div className={`p-3 rounded border ${
                  demoValidation.isValid 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'bg-destructive/5 border-destructive/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {demoValidation.isValid ? (
                      <>
                        <Check className="w-4 h-4 text-primary" />
                        <span className="font-mono text-xs text-primary uppercase">Approved</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-destructive" />
                        <span className="font-mono text-xs text-destructive uppercase">Rejected</span>
                      </>
                    )}
                  </div>
                </div>

                {demoValidation.errors.length > 0 && (
                  <div className="space-y-1">
                    {demoValidation.errors.map((error, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground p-2 bg-destructive/5 rounded">
                        <X className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    ))}
                  </div>
                )}

                {demoValidation.warnings.length > 0 && (
                  <div className="space-y-1">
                    {demoValidation.warnings.map((warning, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground p-2 bg-amber-500/5 rounded">
                        <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Run a test to see validation results
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Compliance Status */}
        <Card className="p-4 bg-card border-border">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-logo-green" />
              <span className="text-xs text-muted-foreground">Guidelines Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-logo-green" />
              <span className="text-xs text-muted-foreground">Validation Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${canCreateCustomDesigns ? 'bg-logo-green' : 'bg-destructive'}`} />
              <span className="text-xs text-muted-foreground">
                Custom Designs: {canCreateCustomDesigns ? 'Allowed' : 'Blocked'}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </AdminPageLayout>
  );
}

export default CreativeStudio;
