/**
 * techno.dog E-commerce Module - Creative Studio
 * 
 * Design tools integrated with brand books.
 * Only Alex Lawton can create designs outside brand guidelines.
 */

import { useState } from 'react';
import { Palette, Lock, Shield, AlertTriangle, Plus, ExternalLink, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminPageLayout from '@/components/admin/AdminPageLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MODULE_CONFIG } from '../config/module-config';
import { ReadOnlyBadge } from '../components/ReadOnlyBadge';
import { BrandBookToggle } from '../components/BrandBookToggle';
import { GuidelinesPanel } from '../components/GuidelinesPanel';
import { useBrandBookGuidelines, type BrandBookType } from '../hooks/useBrandBookGuidelines';

export function CreativeStudio() {
  const [activeTab, setActiveTab] = useState('guidelines');
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
    // Test validation with a sample product
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
    // Test custom design validation
    const result = validateProduct({
      customDesign: true,
    });
    setDemoValidation(result);
  };

  return (
    <AdminPageLayout
      title="Creative Studio"
      description="Create products using brand book guidelines"
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
                Active Brand Book
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                All product designs must follow the selected brand book guidelines
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
              <strong>Owner Access Enabled:</strong> You can create custom designs outside brand guidelines. 
              All other users must strictly follow the {activeGuidelines.name} brand book.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-destructive/30 bg-destructive/5">
            <Lock className="w-4 h-4 text-destructive" />
            <AlertDescription className="text-sm">
              <strong>Brand Guidelines Enforced:</strong> All product designs must follow the {activeGuidelines.name} brand book. 
              Only <strong>Alex Lawton</strong> can create custom designs outside these guidelines.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="guidelines" className="font-mono text-xs uppercase">Guidelines</TabsTrigger>
            <TabsTrigger value="create" className="font-mono text-xs uppercase">Create Product</TabsTrigger>
            <TabsTrigger value="validate" className="font-mono text-xs uppercase">Validate</TabsTrigger>
          </TabsList>

          <TabsContent value="guidelines" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Guidelines Panel */}
              <GuidelinesPanel 
                guidelines={activeGuidelines} 
                isOwner={isOwner}
              />

              {/* Quick Links & Status */}
              <div className="space-y-6">
                {/* Brand Book Links */}
                <Card className="p-6 bg-card border-border">
                  <h3 className="font-mono text-sm uppercase tracking-wide text-foreground font-medium mb-4">
                    Full Brand Books
                  </h3>
                  <div className="space-y-3">
                    <Button 
                      asChild 
                      variant={activeBrandBook === 'techno-dog' ? 'default' : 'outline'} 
                      className="w-full justify-start"
                    >
                      <Link to="/admin/brand-book">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        techno.dog Brand Book
                        {activeBrandBook === 'techno-dog' && (
                          <Badge className="ml-auto text-[8px]">Active</Badge>
                        )}
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      variant={activeBrandBook === 'techno-doggies' ? 'default' : 'outline'} 
                      className="w-full justify-start"
                    >
                      <Link to="/admin/doggies-brand-book">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Techno Doggies Brand Book
                        {activeBrandBook === 'techno-doggies' && (
                          <Badge className="ml-auto text-[8px]">Active</Badge>
                        )}
                      </Link>
                    </Button>
                  </div>
                </Card>

                {/* Compliance Status */}
                <Card className="p-6 bg-card border-border">
                  <h3 className="font-mono text-sm uppercase tracking-wide text-foreground font-medium mb-4">
                    Compliance Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <span className="text-sm text-muted-foreground">Brand Book Connected</span>
                      <Badge className="bg-logo-green/10 text-logo-green border-logo-green/20">
                        <Check className="w-3 h-3 mr-1" />
                        Yes
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <span className="text-sm text-muted-foreground">Guidelines Enforced</span>
                      <Badge className="bg-logo-green/10 text-logo-green border-logo-green/20">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                      <span className="text-sm text-muted-foreground">Custom Designs</span>
                      {canCreateCustomDesigns ? (
                        <Badge className="bg-logo-green/10 text-logo-green border-logo-green/20">
                          <Shield className="w-3 h-3 mr-1" />
                          Allowed
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/10 text-destructive border-destructive/20">
                          <Lock className="w-3 h-3 mr-1" />
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <Card className="p-8 bg-card border-border">
              <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-mono text-sm font-medium text-foreground uppercase tracking-wide">
                  Product Creation
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create new products using the <strong>{activeGuidelines.name}</strong> brand book guidelines.
                  {!canCreateCustomDesigns && (
                    <> All designs will be validated against approved colors, mascots, and product specifications.</>
                  )}
                </p>
                
                {activeBrandBook === 'techno-doggies' && activeGuidelines.mascots.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/30 rounded border border-border/50 w-full">
                    <p className="text-xs text-muted-foreground">
                      <strong>{activeGuidelines.mascots.length}</strong> approved mascots available • 
                      <strong> {activeGuidelines.products.length}</strong> approved product types • 
                      <strong> {activeGuidelines.colors.length}</strong> approved colors
                    </p>
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <Button asChild variant="outline">
                    <Link to="/admin/ecommerce/products">
                      View Products
                    </Link>
                  </Button>
                  <Button 
                    className="bg-logo-green text-background hover:bg-logo-green/90"
                    onClick={() => setActiveTab('validate')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Start Design
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="validate" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Validation Test Panel */}
              <Card className="p-6 bg-card border-border">
                <h3 className="font-mono text-sm uppercase tracking-wide text-foreground font-medium mb-4">
                  Design Validation
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Test product designs against the {activeGuidelines.name} brand book guidelines.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleTestValidation} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Check className="w-4 h-4 mr-2 text-logo-green" />
                    Test Compliant Design (DJ Dog Hoodie)
                  </Button>
                  
                  <Button 
                    onClick={handleTestCustomDesign} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                    Test Custom Design (Owner Only)
                  </Button>
                </div>
              </Card>

              {/* Validation Results */}
              <Card className="p-6 bg-card border-border">
                <h3 className="font-mono text-sm uppercase tracking-wide text-foreground font-medium mb-4">
                  Validation Results
                </h3>
                
                {demoValidation ? (
                  <div className="space-y-4">
                    <div className={`p-4 rounded border ${
                      demoValidation.isValid 
                        ? 'bg-primary/5 border-primary/30' 
                        : 'bg-destructive/5 border-destructive/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        {demoValidation.isValid ? (
                          <>
                            <Check className="w-5 h-5 text-primary" />
                            <span className="font-mono text-sm text-primary uppercase">Design Approved</span>
                          </>
                        ) : (
                          <>
                            <X className="w-5 h-5 text-destructive" />
                            <span className="font-mono text-sm text-destructive uppercase">Design Rejected</span>
                          </>
                        )}
                      </div>
                    </div>

                    {demoValidation.errors.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-mono text-xs uppercase text-destructive">Errors</h4>
                        {demoValidation.errors.map((error, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground p-2 bg-destructive/5 rounded">
                            <X className="w-3 h-3 text-destructive flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {demoValidation.warnings.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-mono text-xs uppercase text-amber-500">Warnings</h4>
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
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                      <Check className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Run a validation test to see results
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageLayout>
  );
}

export default CreativeStudio;
